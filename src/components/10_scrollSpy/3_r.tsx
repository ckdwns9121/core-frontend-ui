import { useCallback, useEffect, useRef, useState } from 'react';
import useIntersectionObserver from '@/hooks/useIntersectoinObserer';
import ScrollBox, {
  type ScrollBoxHandle,
} from '@/components/09_carousel/scrollBox';
import { type ScrollSpyItem, data } from './data';
import cx from './cx';
import { HEADER_HEIGHT, ScrollSpyContent } from './shared';

const observerOptions = {
  rootMargin: `-${HEADER_HEIGHT}px 0px -70% 0px`,
  threshold: 0,
};

const ScrollSpyNavButton = ({
  index,
  handleClick,
}: ScrollSpyItem & { handleClick?: () => void }) => (
  <button
    type="button"
    data-index={index}
    aria-label={`${index + 1}번 섹션으로 이동`}
    onClick={handleClick}
  >
    {index + 1}
  </button>
);

const ScrollSpy3 = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollBoxRef = useRef<ScrollBoxHandle>(null);
  const contentRefs = useRef<HTMLLIElement[]>([]);
  const targetRefs = useRef<Element[]>([]);
  const { entries } = useIntersectionObserver(targetRefs, observerOptions);

  const setCurrentItem = useCallback((index: number) => {
    setCurrentIndex(index);
    scrollBoxRef.current?.scrollFocus(index, 'smooth');
  }, []);

  const handleNavClick = useCallback(
    (_item: ScrollSpyItem, index: number) => () => {
      const element = contentRefs.current[index];
      if (!element) return;

      const top = window.scrollY + element.getBoundingClientRect().top;
      window.scrollTo({ top: top - HEADER_HEIGHT, behavior: 'auto' });
    },
    [],
  );

  useEffect(() => {
    const visibleIndexes = Array.from(entries.values(), entry =>
      Number.parseInt((entry.target as HTMLElement).dataset.index ?? '', 10),
    ).filter(Number.isFinite);

    if (visibleIndexes.length) setCurrentItem(Math.min(...visibleIndexes));
  }, [entries, setCurrentItem]);

  return (
    <div className={cx('ScrollSpy', 'with-scroll-box')}>
      <header className={cx('floating-header')}>
        <h3 className={cx('title')}>
          스크롤 스파이 #3<sub>IO + ScrollBox</sub>
        </h3>
        <ScrollBox
          ref={scrollBoxRef}
          list={data}
          Item={ScrollSpyNavButton}
          ariaLabel="공유 Observer 섹션 이동"
          currentIndex={currentIndex}
          handleItemClick={handleNavClick}
        />
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

export default ScrollSpy3;
