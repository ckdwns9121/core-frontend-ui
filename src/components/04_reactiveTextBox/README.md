# 04. 리액티브 텍스트박스 — 정리

내용에 맞춰 높이가 늘어나는 `textarea`를 만드는 장. 예제가 여러 개인 이유는
**브라우저가 이미 아는 값을 어디까지 우리가 다시 계산할 것인가**가 방법마다 다르기 때문이다.

| 예제 | 방식 | 계산 주체 | 정확도 |
| --- | --- | --- | --- |
| 0 | 처리 없음 / `field-sizing` | 브라우저 | 완벽 |
| 1 | canvas `measureText` → `rows` | **우리** | 근사치 |
| 2 | replica의 `scrollHeight` | 브라우저 | 완벽 |
| 3 | 원본의 `scrollHeight` | 브라우저 | 완벽 |
| 4 | 1번의 바닐라 버전 | **우리** | 근사치 |

---

## 대전제: `textarea`는 원래 안 늘어난다

`textarea`의 높이는 내용이 아니라 **`rows` 속성**(기본값 2)이 정한다. 내용이 넘치면
커지는 게 아니라 스크롤바가 생긴다. 고정 크기 위젯이던 시절에 설계된 폼 컨트롤이라 그렇다.

```css
textarea {
  height: auto;      /* 내용 크기가 아니라 rows 기반 높이로 계산됨 */
  max-height: 220px; /* 천장일 뿐, 늘리는 장치가 아님 */
}
```

`max-height`는 늘어나는 걸 막을 뿐 늘어나게 만들지 않는다. 애초에 늘어나지 않으니 걸릴 일도 없다.
→ 이걸 눈으로 확인하는 게 `0_r.tsx` 왼쪽 칸.

---

## 1. canvas를 왜 썼나

### canvas는 textarea와 아무 관계가 없다

`measureLines.ts`의 canvas는 **화면에 그려지지도 않고 DOM에 붙지도 않는다.**
`appendChild`도 `fillText`도 없다. 함수가 끝나면 그대로 버려진다.

```ts
const canvas = document.createElement('canvas'); // 만들기만 함
const ctx = canvas.getContext('2d')!;            // 계산기 꺼내기
```

2D 컨텍스트의 `measureText()` 하나가 필요해서 만든 껍데기다.

```ts
ctx.measureText('안녕하세요').width; // → 62.4 같은 숫자
```

### textarea와 연결되는 유일한 지점

폰트가 다르면 폭도 달라지니, textarea의 실제 폰트 설정을 캔버스에 복사해 조건을 맞춘다.

```ts
const style = window.getComputedStyle(elem);
ctx.font = style.getPropertyValue('font');
ctx.letterSpacing = style.getPropertyValue('letter-spacing');
```

```
textarea ──폰트 설정 복사──▶ canvas(보이지 않음)
                                 │
         줄 수 ◀──폭 계산 결과───┘
```

### 왜 숨긴 div가 아니라 canvas인가

숨긴 `<span>`을 만들어 `offsetWidth`를 읽어도 폭은 구할 수 있다. 다만 요소를 DOM에 붙였다
떼야 하고 **레이아웃이 발생**한다. `measureText`는 DOM을 전혀 건드리지 않아 이 비용이 없다.
이게 이 트릭이 널리 쓰이는 이유다.

### 그런데 이 용도에는 잘 안 맞는다

브라우저는 이미 줄 수를 알고 있다. `scrollHeight` 한 줄이면 끝날 일을
canvas는 근사치로 다시 계산한다. 게다가 그 근사가 틀린다.

**원인 ① 글자를 잘라서 꽉 채운다고 가정한다**

```ts
Math.ceil(measureText(curr).width / elem.clientWidth);
```

총 길이 ÷ 폭. 글자를 아무 데나 잘라 빈틈없이 이어 붙인다는 뜻이다.
하지만 브라우저는 **단어 단위로** 끊는다.

폭 100px, 글자 하나 10px인 상자에 `aaaaa bbbbb ccccc`(17자, 170px):

```
canvas 계산    ceil(170 / 100) = 2줄

실제 브라우저
  ┌──────────┐ 100px
  │aaaaa     │  "aaaaa bbbbb"는 110px → 안 들어감
  │bbbbb     │  50px 버려짐
  │ccccc     │  50px 버려짐
  └──────────┘  → 3줄
```

줄 끝마다 남는 여백을 나눗셈이 계산에 넣지 못한다. 그래서 **항상 적게 센다.**
단어 길이가 폭의 절반을 살짝 넘으면 최악이라 거의 2배까지 벌어진다.

**원인 ② 빈 줄을 세지 않는다**

엔터를 누르면 `split('\n')`의 마지막 조각이 빈 문자열이 된다.

```ts
'hello\n'.split('\n'); // ['hello', '']
measureText('').width; // 0
Math.ceil(0 / W); // 0  ← 커서가 놓인 새 줄이 빠짐
```

증상: **엔터를 쳐도 높이가 안 늘고 스크롤바만 생겼다가, 글자를 치는 순간 늘어난다.**
문장 중간의 빈 줄도 같은 문제.

```ts
// 해결: 모든 조각을 최소 1줄로
Math.max(Math.ceil(measureText(curr).width / elem.clientWidth), 1);
```

**원인 ③ `font` 단축 속성이 빈 문자열일 수 있다**

`getComputedStyle`의 `font`는 단축 속성이라 브라우저에 따라 `''`를 돌려준다.
`ctx.font = ''`는 **무시**되고 캔버스는 기본값 `10px sans-serif`를 쓴다.
실제 폰트가 13px인데 10px로 재면 측정값이 통째로 어긋난다.

```js
// 콘솔에서 확인
getComputedStyle(document.querySelector('textarea')).font;
// '' 이면 개별 속성을 조립해야 함
```

```ts
const { fontStyle, fontWeight, fontSize, fontFamily } = style;
ctx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
```

**원인 ④ `clientWidth`는 padding을 포함한다**

지금은 textarea의 `padding: 0`이라 우연히 맞는다. padding을 주면 실제 글자 영역보다
넓은 값으로 나누게 되어 또 적게 센다.

### 그럼 canvas는 언제 쓰나

두 경우엔 여전히 유효하다.

1. **넣어보기 전에 예측해야 할 때** — `scrollHeight`는 텍스트를 이미 넣은 뒤에야 읽을 수 있다.
   "이 문자열을 넣으면 몇 줄이 될까?"를 미리 알아야 한다면 canvas 말고 방법이 마땅치 않다.
2. **레이아웃 비용을 피해야 할 때** — 아래 패턴은 읽기·쓰기가 번갈아 나와 리플로우를 강제한다.

   ```ts
   el.style.height = 'auto'; // 쓰기 → 레이아웃 무효화
   el.scrollHeight; // 읽기 → 강제 동기 레이아웃
   el.style.height = h + 'px'; // 쓰기
   ```

   `measureText`는 DOM을 안 건드려 이 비용이 0이다. 다만 textarea 하나에
   키 입력마다 한 번이면 체감될 일은 거의 없다.

### 개선 여지

`measureLines`가 입력마다 호출되는데 캔버스를 매번 새로 만든다(`measureLines.ts:5-6`).
모듈 스코프로 올려 재사용하면 된다.

```ts
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d')!;

const measureLines = (elem: HTMLElement, text: string) => {
  /* ... */
};
```

또 `if (!elem || !text) return 0;`(`measureLines.ts:4`) 때문에 텍스트를 전부 지우면
`elem.rows = 0`이 된다. `rows`는 1 이상이어야 하는 값이라 `return 1`이 안전하다.

---

## 2. `field-sizing`은 어떻게 동작하나

폼 컨트롤(`textarea`, `input`, `select`)의 **기본 크기를 무엇으로 정할지** 바꾸는 속성.

```css
field-sizing: fixed; /* 기본값 — 속성값으로 정해진 고정 크기 */
field-sizing: content; /* 내용에 맞춰 크기 결정 */
```

### `fixed`가 기본인 이유

폼 컨트롤은 예전부터 크기를 **속성**으로 지정했다.

```html
<textarea rows="2" cols="20"></textarea> <input size="20" />
```

이 값들이 기본 크기(intrinsic size)를 만들고, 내용이 넘치면 커지는 대신 스크롤되거나 잘렸다.

`field-sizing: content`는 이 계산을 **내용 기준으로** 바꾼다. `rows`나 `size`를 무시하고
"들어 있는 글자만큼"으로 잰다. 즉 1~4번이 JS로 하던 일을 브라우저 내부에서 처리하는 것이고,
브라우저 자신의 레이아웃 결과를 쓰므로 줄바꿈 규칙을 재현할 필요가 없다.

### textarea만이 아니다

```css
input {
  field-sizing: content;
} /* 입력할수록 가로로 늘어남 — 태그 입력 UI */
select {
  field-sizing: content;
} /* 선택된 옵션 길이에 맞춰 폭이 줄어듦 */
```

### 명시적 크기가 우선

```css
textarea {
  field-sizing: content;
  min-height: 66px; /* 최소 3줄 유지 */
  max-height: 220px; /* 여기서 멈추고 스크롤 */
}
```

`width`/`height`를 직접 주면 그쪽이 이긴다. `min-*`/`max-*`는 범위를 잡아준다.

**`min-`을 같이 주는 게 사실상 필수.** 안 그러면 빈 상태에서 한 줄 높이까지,
`input`은 거의 0폭까지 쪼그라든다. placeholder가 있으면 그 크기에 맞춰진다.

### 지원 현황과 폴백

Chromium 계열(Chrome·Edge 123+, 2024-03)이 먼저 지원했고 다른 브라우저는 뒤따라오는 중.

```scss
@supports (field-sizing: content) {
  textarea.field-sizing {
    field-sizing: content;
  }
}
```

실무용 최종형에 가까운 조합:

```scss
textarea {
  min-height: 66px;
  max-height: 220px;
  field-sizing: content; // 지원하면 이걸로 끝
}
```

```tsx
const handleInput = useCallback((e: SyntheticEvent) => {
  if (CSS.supports('field-sizing', 'content')) return; // 지원하면 JS 불필요
  const el = e.target as HTMLTextAreaElement;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}, []);
```

### field-sizing만으로 안 되는 것

크기는 맞춰주지만 **줄 수를 알려주지는 않는다.** "5줄 넘으면 경고" 같은 UI가 필요하면
`scrollHeight / lineHeight`로 따로 구해야 한다.

---

## 부록: 스타일에서 주의할 점

`index.module.scss` 주석에 적힌 내용 정리.

**`line-height`는 픽셀로 고정한다.** 숫자나 `rem`/`em`을 쓰면 줄 높이에 소수점이 생기는데,
`scrollHeight`는 정수만 돌려준다. 이 차이 때문에 불필요한 상황에서 overflow가 발생해
스크롤바가 켜질 수 있다.

**`overflow-y: scroll`을 처음부터 준다.** `auto`로 두면 최대 높이를 넘는 순간 스크롤바가
생기면서 그만큼 폭이 좁아지고, 폭이 좁아지면 줄 수가 달라져 높이가 또 바뀐다.
처음부터 스크롤바 영역을 확보해 폭을 고정한다.

**`overflow: hidden`은 쓰지 않는다.** 자동 높이 조절 자체에는 영향이 없지만,
최대 높이를 설정한 경우 초과분을 스크롤할 수 없게 된다.

---

## 한 줄 결론

- **canvas** — DOM을 건드리지 않고 글자 폭을 재는 도구. 여기서는 브라우저가 이미
  아는 값을 근사치로 다시 구하느라 틀렸다. 넣기 전에 예측해야 할 때만 유효하다.
- **field-sizing** — 폼 컨트롤의 크기 계산 기준을 속성값에서 내용으로 바꾸는 스위치.
  지원되면 CSS 한 줄로 이 장 전체가 끝난다.
