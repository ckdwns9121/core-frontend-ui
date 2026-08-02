import Observer from './observer';
import { deepCompare } from '@/service/util';
export type ScrollInfo = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'> & {
  scrollHeight: number;
};
const DefaultScrollInfo: ScrollInfo = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  scrollHeight: 0,
};
const getScrollInfo = (() => {
  let stored: ScrollInfo = DefaultScrollInfo;
  return () => {
    const { clientWidth, clientHeight, scrollLeft, scrollTop, scrollHeight } =
      document.scrollingElement!;
    const newScrollInfo = {
      left: scrollLeft,
      top: scrollTop,
      width: clientWidth,
      height: clientHeight,
      scrollHeight,
    };
    if (!deepCompare(stored, newScrollInfo)) stored = newScrollInfo;
    return stored;
  };
})();

export const notifyScrollInfoChanged = () => {
  Observer.notify('scrollInfo', getScrollInfo());
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
      // console.log("📏 ViewportSize changed:", newSize);
      stored = newSize;
    }
    return stored;
  };
})();

export const notifyViewportSizeChanged = () => {
  Observer.notify('viewportSize', getViewportSize());
};
const initViewportObserver = () => {
  window.addEventListener('scroll', notifyScrollInfoChanged);
  const resizeObserver = new ResizeObserver(notifyViewportSizeChanged);
  resizeObserver.observe(getViewportElem());
};

export default initViewportObserver;
