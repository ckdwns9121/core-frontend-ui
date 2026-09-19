import { useCallback, useEffect, useRef, useState } from 'react';
import { data } from './data';
import cx from './cx';
import { HEADER_HEIGHT, ScrollSpyContent, ScrollSpyNavItem } from './shared';
import useIndividualIntersectionObserver from './useIndividualIntersectionObserver';

const individualOptions = {
  rootMargin: `-${HEADER_HEIGHT}px 0px 0px`,
  baseThreshold: 0.5,
};

const ScrollSpy2 = () => {
  const navRefs = useRef<HTMLLIElement[]>([]);
  const contentRefs = useRef<HTMLLIElement[]>([]);
  const targetRefs = useRef<Element[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const entries = useIndividualIntersectionObserver(
    targetRefs,
    individualOptions,
  );

  const setCurrentItem = useCallback((index: number) => {
    setCurrentIndex(index);
    navRefs.current[index]?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: 'smooth',
    });
  }, []);

  const moveTo = useCallback((index: number) => {
    const element = contentRefs.current[index];
    if (!element) return;

    const top = window.scrollY + element.getBoundingClientRect().top;
    window.scrollTo({ top: top - HEADER_HEIGHT, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const visibleIndexes = Array.from(entries.values(), entry =>
      Number.parseInt((entry.target as HTMLElement).dataset.index ?? '', 10),
    ).filter(Number.isFinite);

    if (visibleIndexes.length) setCurrentItem(Math.min(...visibleIndexes));
  }, [entries, setCurrentItem]);

  return (
    <div className={cx('ScrollSpy')}>
      <header className={cx('floating-header')}>
        <h3 className={cx('title')}>
          스크롤 스파이 #2<sub>Individual IntersectionObserver</sub>
        </h3>
        <ul className={cx('nav')} aria-label="개별 Observer 섹션 이동">
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
            targetRef={element => {
              if (element) targetRefs.current[item.index] = element;
            }}
          />
        ))}
      </ul>
    </div>
  );
};

export default ScrollSpy2;
