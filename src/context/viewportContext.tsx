import {
  type ReactNode,
  createContext,
  useContext,
  useSyncExternalStore,
} from 'react';
import { deepCompare } from '../service/util';

type ScrollInfo = Pick<DOMRect, 'left' | 'top'> & { scrollHeight: number };
const DefaultScrollInfo: ScrollInfo = { left: 0, top: 0, scrollHeight: 0 };

const getScrollInfo = (() => {
  let stored: ScrollInfo = DefaultScrollInfo;
  return () => {
    const { scrollLeft, scrollTop, scrollHeight } = document.scrollingElement!;
    // scrollingElement는 브라우저가 quirks mode일 때엔 null 일 수도 있습니다. 이 모드 안 쓰면 무조건 있음.
    // Quirks mode(BackCompat)에선 스크롤 컨테이너가 표준처럼 document.documentElement(html)가 아니라 document.body로 동작하는 등 레이아웃/스크롤 규칙이 옛 브라우저 호환 규칙을 따릅니다.
    // 이때 UA마다 스크롤 루트를 일관되게 특정하기 어렵기 때문에, 스펙/브라우저 구현은 document.scrollingElement를 결정하지 못하면 null을 반환할 수 있습니다.
    // 이런 경우 브라우저는 스크롤 루트를 자동으로 결정하는데, 이 때 스크롤 루트는 document.documentElement가 됩니다.
    // 문서 첫 줄에 DOCTYPE을 씀으로 피할 수 있음.
    const newScrollInfo = { left: scrollLeft, top: scrollTop, scrollHeight };
    // scrollInfo값이 변경된 경우만 렌더링 하도록 하기 위한 코드.
    if (!deepCompare(stored, newScrollInfo)) {
      console.log('🔄 ScrollInfo changed:', newScrollInfo);
      stored = newScrollInfo;
    }
    return stored;
  };
})();
// 여기서는 즉시 실행 함수 및 클로저를 활용합니다. 이 함수는 즉시 실행되고, return 된 내부 함수가 getScrollInfo 변수에 담기게
// 됩니다. 변수 stored는 return 된 함수의 생명주기가 종료되더라도 클로저 안에 남아 그 값을 계속 유지합니다. 이 함수를 잘 작성하지
// 않으면 아래의 useSyncExternalStore에서 계속 새로운 객체(참조형 데이터)를 반환하게 되고, React는 얕은 비교만을 하므로
// 무조건 변경된 것으로 인식하여, 계속해서 재렌더링을 시도하게 될 것입니다.

const subscribeScroll = (getSnapshot: () => void) => {
  window.addEventListener('scroll', getSnapshot);
  return () => {
    window.removeEventListener('scroll', getSnapshot);
  };
  // getSnapshot 함수를 그대로 전달하는 대신 window.requestAnimationFrame으로 한 번 감싸주었는데, 이는 혹시라도 상태 변경
  // 함수가 렌더링 주기보다 짧은 시간에 중복하여 호출될 위험을 피하기 위함입니다

  // 더 자세한 설명
  // 왜 rAF로 감싸나? scroll/resize 이벤트는 한 프레임(약 16ms) 안에서도 여러 번 연속 발생할 수 있어요. getSnapshot을 그대로 넘기면 같은 프레임 동안 중복 호출되어 불필요한 스냅샷 읽기와 재렌더 트리거 위험이 커져요.
  // requestAnimationFrame(rAF)으로 감싸면 “다음 페인트 직전 한 번만” 실행되도록 프레임 단위로 묶여(coalesce) 중복 호출을 방지합니다. = 여러 이벤트 몰려도 프레임당 최대 1회만 스냅샷 + 구독자 알림이 이뤄지기에 불필요한 연속 렌더나 상태 갱신의 중복을 막습니다.
  // rAF 실행 시점: requestAnimationFrame 콜백은 브라우저가 화면을 그리기(paint) 직전에 실행됩니다.
  // 렌더 타이밍 정렬: 이 시점에 실행하면 React의 렌더/커밋 이후, 다음 페인트 직전으로 타이밍이 자연스럽게 맞춰져 불필요한 중간 작업이 줍니다.
  // 레이아웃 스래싱 완화: DOM 읽기(레이아웃 측정)와 쓰기(스타일/클래스 변경 등)가 뒤섞이면 브라우저가 강제 재계산을 반복해 느려지는데, rAF로 모아 실행하면 읽기/쓰기 순서를 프레임 단위로 묶어 이런 강제 재계산(레이아웃 스래싱) 가능성을 낮춥니다.
  // 효과: 이벤트가 몰려도 프레임당 한 번만 최신 상태를 읽고 렌더를 유도해, 과도한 스냅샷 읽기와 재렌더를 방지합니다.
  // 브라우저의 창 크기 변경을 감지하기 위해 ResizeObserver를 사용하였습니다.
  // scroll과 마찬가지로 window에 ‘resize' 이벤트 리스너를 설정하는 방법도 있지만, 이벤트는 가급적 등록을 줄이는 것이 성능상 바람직하기 때문입니다.
};

const ScrollInfoContext = createContext<ScrollInfo>(DefaultScrollInfo);
const ScrollInfoContextProvider = ({ children }: { children: ReactNode }) => {
  const scrollInfo = useSyncExternalStore(
    subscribeScroll,
    getScrollInfo,
    () => DefaultScrollInfo,
  );
  return (
    <ScrollInfoContext.Provider value={scrollInfo}>
      {children}
    </ScrollInfoContext.Provider>
  );
};

const getViewportElem = (() => {
  if (typeof document === 'undefined')
    return () => ({ clientWidth: 0, clientHeight: 0 }) as HTMLElement;
  let elem: HTMLElement | null = null;
  return () => {
    if (!elem) {
      elem = document.querySelector('#viewport');
      if (!elem) {
        elem = document.createElement('div');
        elem.id = 'viewport';
        elem.style.cssText = 'position: fixed; inset: 0; z-index: -1;';
        document.body.insertAdjacentElement('afterbegin', elem);
      }
    }
    return elem;
  };
})();

export type ViewportSize = Pick<DOMRect, 'width' | 'height'>;
const DefaultViewportSize: ViewportSize = { width: 0, height: 0 };

const getViewportSize = (() => {
  if (typeof window === 'undefined') return () => DefaultViewportSize;
  let stored: ViewportSize = DefaultViewportSize;
  return () => {
    const { clientWidth, clientHeight } = getViewportElem();
    const newSize = { width: clientWidth, height: clientHeight };
    if (!deepCompare(stored, newSize)) {
      // console.log('📏 ViewportSize changed:', newSize);
      stored = newSize;
    }
    return stored;
  };
})();

const subscribeResize = (getSnapshot: () => void) => {
  const callback = () => window.requestAnimationFrame(getSnapshot);
  const resizeObserver = new ResizeObserver(callback);
  resizeObserver.observe(getViewportElem());
  return () => {
    resizeObserver.disconnect();
  };
};

// 이 context를 사용하면서 심각한 성능 저하를 유발하는 컴포넌트를 발견했다면, 이때야말로 최적화가 필요한 시점입니다. 해당 컴포넌트에서
// 성능 저하를 일으키지 않도록 하는 다양한 memoize 기법을 고민해 볼 수 있습니다. 혹은 처음부터 변경 사항을 최대한 지연시키는 것도 좋은 방법이
// 될 것입니다. useDeferredValue 27 훅을 이용하거나, 스크롤 또는 창 크기 변경 이벤트가 더 이상 발생하지 않을 때까지 기다렸다가
// 반영(debounce28)하거나, 지속적으로 발생하는 스크롤 또는 창 크기 변경 이벤트를 일정 시간 간격으로 한 번씩만 반영(throttle29)하는 등으로
// 처리할 수 있습니다.

const ViewportSizeContext = createContext<ViewportSize>(DefaultViewportSize);
const ViewportSizeContextProvider = ({ children }: { children: ReactNode }) => {
  const viewportSize = useSyncExternalStore(
    subscribeResize,
    getViewportSize,
    () => DefaultViewportSize,
  );
  return (
    <ViewportSizeContext.Provider value={viewportSize}>
      {children}
    </ViewportSizeContext.Provider>
  );
};

const ViewportContextProvider = ({ children }: { children: ReactNode }) => (
  <ScrollInfoContextProvider>
    <ViewportSizeContextProvider>{children}</ViewportSizeContextProvider>
  </ScrollInfoContextProvider>
);

export default ViewportContextProvider;
export const useScrollInfo = () => useContext(ScrollInfoContext);
export const useViewportSize = () => useContext(ViewportSizeContext);
