import { useCallback, useEffect, useRef, useState } from 'react';
import { useScrollInfo, useViewportSize } from '@/context/viewportContext';
import { data } from './data';
import cx from './cx';
import { HEADER_HEIGHT, ScrollSpyContent, ScrollSpyNavItem } from './shared';

type ItemPosition = { top: number; height: number };

const ScrollSpy1 = () => {
  const { top: scrollTop } = useScrollInfo();
  const viewportSize = useViewportSize();
  const navRefs = useRef<HTMLLIElement[]>([]);
  const contentRefs = useRef<HTMLLIElement[]>([]);
  const positionsRef = useRef<ItemPosition[]>([]);
  const measuredViewportRef = useRef({ width: 0, height: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);

  const moveTo = useCallback((index: number) => {
    const element = contentRefs.current[index];
    if (!element) return;

    const top = window.scrollY + element.getBoundingClientRect().top;
    window.scrollTo({ top: top - HEADER_HEIGHT, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const viewportChanged =
      measuredViewportRef.current.width !== viewportSize.width ||
      measuredViewportRef.current.height !== viewportSize.height;

    if (viewportChanged || positionsRef.current.length !== data.length) {
      measuredViewportRef.current = viewportSize;
      positionsRef.current = contentRefs.current.map(element => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top + scrollTop, height: rect.height };
      });
    }

    const availableHeight = Math.max(1, viewportSize.height - HEADER_HEIGHT);
    const focusY = scrollTop + HEADER_HEIGHT + availableHeight / 2;
    let nextIndex = positionsRef.current.findIndex(
      position =>
        focusY >= position.top && focusY <= position.top + position.height,
    );

    if (nextIndex < 0) {
      nextIndex = positionsRef.current.findLastIndex(
        position => position.top <= focusY,
      );
    }

    if (nextIndex >= 0 && nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex);
      navRefs.current[nextIndex]?.scrollIntoView({
        block: 'nearest',
        inline: 'center',
        behavior: 'smooth',
      });
    }
  }, [currentIndex, scrollTop, viewportSize]);

  return (
    <div className={cx('ScrollSpy')}>
      <header className={cx('floating-header')}>
        <h3 className={cx('title')}>
          스크롤 스파이 #1<sub>scroll event</sub>
        </h3>
        <ul className={cx('nav')} aria-label="스크롤 이벤트 섹션 이동">
          {data.map(item => (
            <ScrollSpyNavItem
              key={item.id}
              index={item.index}
              current={currentIndex === item.index}
              handleClick={() => moveTo(item.index)}
              itemRef={element => {
                if (element) navRefs.current[item.index] = element;
              }}
            />
          ))}
        </ul>
      </header>

      <ul className={cx('contents')}>
        {data.map(item => (
          <ScrollSpyContent
            {...item}
            key={item.id}
            contentRef={element => {
              if (element) contentRefs.current[item.index] = element;
            }}
          />
        ))}
      </ul>
    </div>
  );
};

export default ScrollSpy1;
