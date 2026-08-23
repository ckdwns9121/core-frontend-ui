# 이미지 지연 로딩

## 개요

이 예제는 `IntersectionObserver`나 `<img loading="lazy">`를 사용하지 않고,
이미지와 뷰포트의 위치를 직접 비교하여 지연 로딩을 구현한다.

전체 흐름은 다음과 같다.

```text
초기 렌더링
  ↓
이미지 자리만 확보하고 data-src에 주소 보관
  ↓
스크롤 또는 뷰포트 크기 변경 감지
  ↓
이미지 위치와 뷰포트 크기 비교
  ↓
뷰포트에 들어온 이미지에 src 삽입
  ↓
브라우저가 이미지 다운로드
```

## 1. 초기에는 `src`를 넣지 않는다

```tsx
<img
  ref={imgRef}
  data-src={src}
  width={width}
  height={height}
/>
```

브라우저는 `<img>`의 `src`가 있어야 이미지 다운로드를 시작한다.

초기 렌더링에서는 실제 `src` 대신 `data-src`에 이미지 주소를 보관한다.
`data-src`는 사용자 정의 속성이므로 브라우저가 해당 주소의 이미지를 요청하지 않는다.

```html
<img data-src="https://picsum.photos/id/10/800/600" />
```

## 2. 이미지 영역을 미리 확보한다

```tsx
<img width={600} height={450} />
```

이미지가 로딩되기 전에도 `width`와 `height`로 빈 영역을 확보한다.

영역을 미리 확보하는 이유는 다음과 같다.

- 이미지가 로딩될 때 페이지가 밀리는 레이아웃 시프트를 줄인다.
- 각 이미지의 위치를 로딩 전에도 정확하게 계산할 수 있다.
- 아직 로딩되지 않은 이미지들이 같은 위치에 겹치는 것을 방지한다.

## 3. 스크롤과 뷰포트 크기 변경을 감지한다

```tsx
const scrollInfo = useScrollInfo();
const viewportSize = useViewportSize();
```

`ViewportContextProvider`는 스크롤 위치와 뷰포트 크기를 구독한다.
이 값이 변경되면 각 이미지의 `useEffect`가 다시 실행된다.

```tsx
useEffect(() => {
  // 이미지 위치 계산
}, [src, scrollInfo, viewportSize]);
```

## 4. 이미지 위치를 측정한다

```tsx
const { top, right, bottom, left } =
  $img.getBoundingClientRect();
```

`getBoundingClientRect()`는 현재 뷰포트를 기준으로 요소의 위치와 크기를 반환한다.

```text
(0, 0) ───────────────────────── vw
  │
  │          이미지
  │     top ┌──────────┐
  │         │          │
  │         └──────────┘ bottom
  │       left       right
  │
 vh
```

## 5. 뷰포트와 이미지가 겹치는지 계산한다

```tsx
const isInsideViewport =
  top < vh &&
  bottom > 0 &&
  left < vw &&
  right > 0;
```

각 조건의 의미는 다음과 같다.

| 조건 | 의미 |
| --- | --- |
| `top < vh` | 이미지 위쪽이 뷰포트 아래쪽보다 위에 있다. |
| `bottom > 0` | 이미지 아래쪽이 뷰포트 위쪽보다 아래에 있다. |
| `left < vw` | 이미지 왼쪽이 뷰포트 오른쪽보다 왼쪽에 있다. |
| `right > 0` | 이미지 오른쪽이 뷰포트 왼쪽보다 오른쪽에 있다. |

네 조건이 모두 참이라면 이미지와 뷰포트가 조금이라도 겹친 상태다.

## 6. 진입한 이미지에 `src`를 삽입한다

```tsx
if (!isInsideViewport) return;

requestedRef.current = true;
$img.src = src;
```

뷰포트에 들어온 순간 실제 DOM의 `src` 속성이 추가된다.

```html
<!-- 진입 전 -->
<img data-src="https://picsum.photos/id/10/800/600" />

<!-- 진입 후 -->
<img
  data-src="https://picsum.photos/id/10/800/600"
  src="https://picsum.photos/id/10/800/600"
/>
```

`src`가 추가되면 브라우저가 이미지 다운로드를 시작한다.

## 7. 같은 이미지는 한 번만 요청한다

```tsx
const requestedRef = useRef(false);

if (requestedRef.current) return;
```

스크롤할 때마다 위치 계산이 실행되므로 이미 요청한 이미지는 다시 처리하지 않아야 한다.

이미지에 `src`를 넣은 뒤 `requestedRef.current`를 `true`로 변경한다.
`useRef`의 값 변경은 재렌더링을 발생시키지 않으므로 요청 여부를 저장하기에 적합하다.

## 8. 이미지 로딩 완료 상태를 반영한다

```tsx
const [loaded, setLoaded] = useState(false);

const handleLoad = useCallback(() => {
  setLoaded(true);
}, []);
```

이미지 다운로드가 끝나면 브라우저가 `load` 이벤트를 발생시킨다.

```tsx
<img
  onLoad={handleLoad}
  className={cx({ lazy: !loaded })}
/>
```

로딩 중에는 `lazy` 클래스로 배경색을 표시하고, 로딩이 끝나면 클래스를 제거한다.

## 핵심 정리

```text
이미지 위치 측정
  → 뷰포트와 겹치는지 직접 계산
  → 겹치는 순간 src 삽입
  → 브라우저가 이미지 다운로드
```

이 예제는 지연 로딩이 동작하는 원리를 직접 구현하기 위한 코드다.
실무에서는 동일한 작업을 더 효율적으로 처리하는 다음 방법을 주로 사용한다.

- `IntersectionObserver`
- `<img loading="lazy">`

---

## IntersectionObserver를 이용한 지연 로딩

`IntersectionObserver`는 관찰 대상이 뷰포트 또는 지정한 스크롤 영역과
교차하는지 브라우저가 감지해 주는 API다. 스크롤 이벤트마다 직접 좌표를
계산하는 대신, 교차 상태가 바뀌었을 때만 콜백을 전달받을 수 있다.

```tsx
const observer = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;

  const image = entry.target as HTMLImageElement;
  image.src = image.dataset.src!;
  observer.unobserve(image);
});

observer.observe(imageElement);
```

### 주요 용어

| 용어 | 의미 |
| --- | --- |
| IO 인스턴스 | `new IntersectionObserver()`로 생성한 관찰자 객체 |
| `entry` | 관찰 대상 하나의 최신 교차 상태 보고서 |
| `entries` | 상태가 변경된 여러 관찰 대상의 `entry` 배열 |
| `entry.target` | 상태가 변경된 실제 DOM 요소 |
| `entry.isIntersecting` | 관찰 대상과 관찰 영역이 현재 교차하는지 여부 |
| `entry.intersectionRatio` | 관찰 대상에서 실제로 교차한 영역의 비율 |

하나의 IO 인스턴스는 여러 요소를 관찰할 수 있으므로 콜백은 `entry` 하나가
아닌 `entries` 배열을 받는다.

```text
IntersectionObserver 인스턴스
├── image1 관찰 → image1의 entry
├── image2 관찰 → image2의 entry
└── image3 관찰 → image3의 entry
```

현재 훅의 `Map<Element, IntersectionObserverEntry>`은 모든 관찰 대상이 아니라
현재 관찰 영역과 교차 중인 요소만 관리한다.

```tsx
if (entry.isIntersecting) {
  next.set(entry.target, entry);
} else {
  next.delete(entry.target);
}
```

- `true`: 현재 교차 중이므로 Map에 추가하거나 최신 entry로 갱신한다.
- `false`: 관찰 영역에서 벗어났으므로 Map에서 제거한다.

### 주요 옵션

```tsx
const observer = new IntersectionObserver(callback, {
  root: null,
  rootMargin: '200px 0px',
  threshold: 0,
});
```

| 옵션 | 의미 |
| --- | --- |
| `root` | 교차 여부를 판단할 기준 영역. `null`이면 브라우저 뷰포트다. |
| `rootMargin` | 기준 영역의 여유 범위. 이미지가 보이기 전에 미리 요청할 때 사용한다. |
| `threshold` | 대상이 어느 정도 교차했을 때 콜백을 실행할지 정한다. |

이미지 지연 로딩은 네트워크 지연을 고려해 실제 진입보다 조금 먼저 요청하는
경우가 많다.

```tsx
rootMargin: '200px 0px';
```

위 설정은 이미지가 관찰 영역에 들어오기 약 200px 전에 로딩을 시작한다.

---

## 네이티브 이미지 지연 로딩

브라우저는 `loading="lazy"` 속성을 통해 이미지 로딩 시점을 자동으로
최적화할 수 있다.

```tsx
<img
  src="/images/photo.webp"
  loading="lazy"
  alt=""
/>
```

구현이 간단하지만 `loading="lazy"`는 정확한 로딩 시점을 강제하는 명령이
아니라 브라우저에 전달하는 힌트다. 브라우저는 네트워크 상태와 뷰포트까지의
거리 등을 고려해 화면 밖의 이미지도 미리 요청할 수 있다.

```text
현재 뷰포트
  ↓
뷰포트 밖이지만 가까운 이미지
  ↓
브라우저 판단에 따라 미리 요청 가능
```

따라서 네이티브 지연 로딩은 반드시 뷰포트에 진입한 순간에만 네트워크 요청이
발생하는 방식이 아니다.

---

## Portal 모달에서 발생할 수 있는 문제

관련 사례: [Lighthouse로 프론트엔드 성능 개선하기](https://velog.io/@ckdwns9121/Lighthouse%EB%A1%9C-%ED%94%84%EB%A1%A0%ED%8A%B8-%EC%84%B1%EB%8A%A5-%EA%B0%9C%EC%84%A0%ED%95%98%EA%B8%B0)

다음과 같이 Portal 모달을 항상 마운트하고 CSS로만 숨기는 경우를 생각해보자.

```tsx
createPortal(
  <div style={{ display: open ? 'block' : 'none' }}>
    <ImageSlider />
  </div>,
  document.body,
);
```

모달이 닫혀 있어도 `ImageSlider`와 내부 이미지 DOM은 이미 생성되어 있다.

```tsx
<img
  src="/images/photo.webp"
  loading="lazy"
/>
```

이미지에 실제 `src`가 존재하면 브라우저는 해당 리소스를 발견할 수 있다.
`display: none`은 요소를 렌더 트리에서 제외하지만 이미지 요청까지 항상
차단한다고 보장하지 않는다. `loading="lazy"` 역시 요청 시점을 브라우저가
결정하므로 모달을 열기 전에 이미지 요청이 발생할 수 있다.

```text
Portal 모달 마운트
  ↓
모달은 display: none
  ↓
내부 img DOM과 src는 이미 존재
  ↓
브라우저가 이미지 URL 발견
  ↓
모달을 열기 전에 이미지 요청이 발생할 수 있음
```

`createPortal`은 DOM이 삽입될 위치만 변경한다. 컴포넌트 마운트나 네트워크
요청을 자동으로 지연하는 기능은 아니다.

### 해결 방법 1: 모달을 열 때만 마운트한다

```tsx
{open &&
  createPortal(
    <ImageModal />,
    document.body,
  )}
```

```text
모달 닫힘
→ 이미지 DOM 없음
→ src 없음
→ 이미지 요청 없음

모달 열림
→ 이미지 DOM 생성
→ 이미지 요청 시작
```

Portal을 제거할 필요는 없다. `open`일 때만 Portal과 모달 컴포넌트를
생성하면 된다.

### 해결 방법 2: `src` 삽입 시점을 직접 제어한다

이미지가 많은 경우에는 모달을 열 때 모든 이미지가 동시에 요청되는 것도
피해야 한다. 초기 이미지에는 `src`를 넣지 않고 주소만 `data-src`에 보관한다.

```tsx
<img
  ref={imageRef}
  data-src={src}
  width={600}
  height={450}
/>
```

이미지가 관찰 영역에 들어왔을 때 실제 `src`를 추가한다.

```tsx
const observer = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;

  const image = entry.target as HTMLImageElement;
  image.src = image.dataset.src!;
  observer.unobserve(image);
});
```

교차하기 전에는 실제 `src`가 없으므로 브라우저가 이미지를 요청할 수 없다.

### 모달 스크롤 영역을 `root`로 사용한다

모달 내부가 별도 스크롤 영역이라면 브라우저 뷰포트가 아닌 모달을 기준으로
교차 여부를 판단하는 것이 명확하다.

```tsx
const observer = new IntersectionObserver(callback, {
  root: modalScrollRef.current,
  rootMargin: '200px 0px',
  threshold: 0,
});
```

```scss
.imageList {
  max-height: 70vh;
  overflow-y: auto;
}
```

### 이미지가 매우 많다면 가상화도 고려한다

IntersectionObserver는 이미지의 네트워크 요청과 디코딩을 지연하지만
`<img>` DOM 자체는 모두 생성한다.

이미지가 수백 또는 수천 장이라면 목록 가상화를 함께 사용해 화면 근처의
DOM만 생성하는 것이 좋다.

```text
전체 데이터: 1,000개
실제 DOM: 화면 근처 10~20개
```

예를 들어 `react-window` 또는 `@tanstack/react-virtual`을 사용할 수 있다.

---

## 방식 비교

| 구분 | 직접 계산 | `IntersectionObserver` | `loading="lazy"` |
| --- | --- | --- | --- |
| 초기 `src` | 구현에 따라 없음 | 구현에 따라 없음 | 존재 |
| 감지 주체 | 애플리케이션 코드 | 브라우저 API | 브라우저 |
| 요청 시점 제어 | 가능 | 가능 | 브라우저가 결정 |
| 구현 복잡도 | 높음 | 중간 | 낮음 |
| 스크롤 최적화 | 직접 처리 필요 | 브라우저가 처리 | 브라우저가 처리 |
| 학습 목적 | 적합 | 적합 | 단순 사용에 적합 |
| Portal 모달 제어 | 가능 | 가능 | 미리 요청될 수 있음 |

일반적인 문서 이미지에는 네이티브 `loading="lazy"`가 간단하고 효과적이다.
다음처럼 요청 시점을 정확히 제어해야 한다면 조건부 마운트와
`IntersectionObserver`를 사용하는 편이 적합하다.

- Portal로 생성되는 이미지 모달
- 수백 장 이상의 이미지 목록
- 이미지 슬라이더 또는 갤러리
- 모달을 열기 전에는 요청이 발생하면 안 되는 경우
- 특정 스크롤 영역을 기준으로 로딩해야 하는 경우

## 권장 구성

```text
모달을 열 때만 Portal 마운트
  +
모달 내부 이미지는 IntersectionObserver로 지연 로딩
  +
이미지가 매우 많다면 목록 가상화 적용
```

핵심 차이는 다음과 같다.

> `loading="lazy"`는 브라우저에 전달하는 로딩 힌트이고,
> IntersectionObserver를 이용한 `src` 삽입은 애플리케이션이 이미지 요청
> 시점을 직접 제어하는 방식이다.

## 확인 방법

1. 개발자 도구의 Network 탭을 연다.
2. `Disable cache`를 활성화한다.
3. 모달을 닫은 상태로 페이지를 새로고침한다.
4. 이미지 요청이 초기부터 발생하는지 확인한다.
5. 모달을 열고 스크롤하면서 요청이 추가되는 시점을 확인한다.

캐시가 활성화되어 있으면 이전에 받은 이미지가 즉시 표시되어 지연 로딩이
동작하지 않는 것처럼 보일 수 있다.
