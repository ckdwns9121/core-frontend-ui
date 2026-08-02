import VanillaWrapper from '../vanillaWrapper';
import initViewportObserver, {
  notifyScrollInfoChanged,
  type ScrollInfo,
  type ViewportSize,
} from '@/context/vanilla/viewportObserver';
import cx from './cx';
import data from './data';
import Observer from '@/context/vanilla/observer';
import getStyleInsideViewport from '@/hooks/vanilla/getStyleInsideViewport';

// ─────────────────────────────────────────────────────────────────────────────
// 바닐라 버전의 전체 구조
//
// React 버전(3_r)은 "상태를 바꾸면 프레임워크가 DOM을 맞춰준다"는 선언적 방식이었습니다.
// 여기서는 그 중간 단계가 없습니다. 값이 바뀌면 우리가 직접 DOM을 찾아가 고쳐야 합니다.
//
//   React 버전                          바닐라 버전
//   ──────────────────────────────────────────────────────────────────────
//   ViewportContextProvider             initViewportObserver()
//   useSyncExternalStore                Observer(전역 Map) + notify
//   useContext                          Observer.observe
//   JSX                                 document.createElement
//   useLayoutEffect + setStyle          handler에서 setAttribute('style')
//   isOpen 상태                          details의 open 속성 + toggle 이벤트
//
// 역할은 일대일로 대응하지만, 실행 시점을 전부 직접 정해야 한다는 점이 다릅니다.
// ─────────────────────────────────────────────────────────────────────────────

// initiator는 VanillaWrapper가 그려놓은 빈 <div>를 넘겨주며 딱 한 번 호출합니다.
// 이 함수 안에서 만든 DOM은 React의 관리 대상이 아니므로 리렌더링의 영향을 받지 않습니다.
const initiator = (wrapper: HTMLDivElement) => {
  // 스크롤 리스너와 ResizeObserver를 등록합니다.
  // 이 두 감시자가 값의 변화를 감지해 Observer.notify를 호출하는 "발신자" 역할을 합니다.
  // React 버전에서 Provider를 마운트하지 않으면 아무것도 동작하지 않았던 것과 같은 자리입니다.
  initViewportObserver();

  // ── 1. DOM 생성 ────────────────────────────────────────────────────────────
  // JSX 대신 createElement로 같은 구조를 손으로 조립합니다.
  //   span.tooltip-root
  //   └ details.details[name=tooltip]
  //     ├ summary.tooltip-trigger      ← ⓘ 아이콘
  //     └ span.tooltip-layer           ← 설명 박스
  const $tooltips = data.map(({ id, text, description }) => {
    const $root = document.createElement('span');
    $root.classList.add(cx('tooltip-root'));
    $root.textContent = text;
    const $details = document.createElement('details');
    // 같은 name을 공유하면 브라우저가 하나만 열리도록 강제합니다(배타적 동작).
    // 2-3에서 쓴 것과 동일하며, 여닫는 상태 관리를 전부 브라우저에 맡기는 셈입니다.
    $details.name = 'tooltip';
    $details.classList.add(cx('details'));
    const $summary = document.createElement('summary');
    $summary.classList.add(cx('tooltip-trigger'));
    const $tooltip = document.createElement('span');
    $tooltip.classList.add(cx('tooltip-layer'));
    $tooltip.textContent = description;
    $details.append($summary, $tooltip);
    $root.append($details);

    // ── 2. 열리는 순간 재계산을 유발 ─────────────────────────────────────────
    // 닫힌 details의 자식은 렌더링되지 않아 getBoundingClientRect()가 전부 0을 돌려줍니다.
    // 그래서 "열린 다음"에 측정해야 하는데, 스크롤도 리사이즈도 일어나지 않았으니
    // 감시자는 아무 신호도 보내지 않습니다. 여기서 직접 notify를 불러 계산을 깨웁니다.
    //
    // toggle 이벤트는 open 속성이 바뀔 때마다 발생하므로 닫힐 때도 호출됩니다.
    // 닫힐 때는 계산할 필요가 없어 $details.open으로 걸러냅니다.
    $details.addEventListener('toggle', () => {
      if ($details.open) notifyScrollInfoChanged();
    });
    return $root;
  });

  // ── 3. 값이 바뀔 때마다 실행될 수신자 ──────────────────────────────────────
  // Observer.notify가 호출되면 이 함수가 최신 값을 인자로 받아 실행됩니다.
  // React의 useLayoutEffect 본문에 해당하지만, 의존성 배열이 없으므로
  // "언제 다시 도는가"는 위의 notify 호출 지점이 전부 결정합니다.
  const handler = (viewportSize: ViewportSize) => {
    for (const $root of $tooltips) {
      // 열려 있지 않은 툴팁은 측정해도 0만 나오므로 건너뜁니다.
      // 배타적 동작 덕분에 실제로 통과하는 건 항상 최대 하나입니다.
      const $details = $root.querySelector(
        'details[open]',
      ) as HTMLDetailsElement;
      if (!$details) continue;
      const $tooltip = $root.getElementsByClassName(
        cx('tooltip-layer'),
      )[0] as HTMLElement;
      // 기준 요소($details)와 대상 요소($tooltip)의 위치를 재서
      // 화면을 벗어나지 않는 방향을 고른 뒤 style 문자열을 돌려받습니다.
      // React 버전은 객체를 반환해 style prop에 넘겼지만,
      // 여기서는 setAttribute로 넣어야 하므로 문자열입니다.
      const newStyle =
        getStyleInsideViewport($details, $tooltip, viewportSize) || '';
      $tooltip.setAttribute('style', newStyle);
    }
  };

  // ── 4. 구독 등록 ───────────────────────────────────────────────────────────
  // Observer는 이벤트 이름별로 Map<대상 요소, 콜백>을 들고 있는 전역 저장소입니다.
  // 대상 요소를 키로 쓰기 때문에 나중에 unobserve로 정확히 하나만 해제할 수 있습니다.
  //
  // 두 이벤트에 같은 handler를 붙였습니다. 스크롤이든 리사이즈든
  // "다시 재보고 다시 그린다"는 대응이 동일하기 때문입니다.
  // ScrollInfo가 width/height를 함께 담고 있어 ViewportSize 자리에 그대로 들어갑니다.
  Observer.observe<ScrollInfo>('scrollInfo', wrapper, handler);
  Observer.observe<ViewportSize>('viewportSize', wrapper, handler);

  // 완성된 DOM을 한 번에 붙입니다. 조립을 마친 뒤 마지막에 append하므로
  // 중간 단계가 화면에 반영되지 않아 리플로우가 한 번만 일어납니다.
  wrapper.append(...$tooltips);
};

const Tooltip5V = () => <VanillaWrapper title="#5" initiator={initiator} />;
export default Tooltip5V;
