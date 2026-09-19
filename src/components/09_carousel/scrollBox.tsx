import {
  type ComponentType,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import useIntersectionObserver from '@/hooks/useIntersectoinObserer';
import cx from './cx';

type Direction = 'prev' | 'next';
type NavState = Record<Direction, boolean>;

export type ScrollBoxHandle = {
  scrollFocus: (index: number, behavior?: ScrollBehavior) => void;
};

type ScrollBoxProps<T extends { id: string }> = {
  list: T[];
  Item: ComponentType<T & { handleClick?: () => void }>;
  ariaLabel: string;
  currentIndex?: number;
  handleItemClick?: (item: T, index: number) => () => void;
  ref?: Ref<ScrollBoxHandle>;
};

const defaultNavState: NavState = { prev: false, next: false };

const ScrollBox = <T extends { id: string }>({
  list,
  Item,
  ariaLabel,
  currentIndex,
  handleItemClick,
  ref,
}: ScrollBoxProps<T>) => {
  const listRef = useRef<HTMLUListElement>(null);
  const itemsRef = useRef<Element[]>([]);
  const edgeRefs = useRef<Element[]>([]);
  const [itemOptions, setItemOptions] = useState<IntersectionObserverInit>({});
  const [edgeOptions, setEdgeOptions] = useState<IntersectionObserverInit>({});
  const [navState, setNavState] = useState<NavState>(defaultNavState);
  const { entries: itemEntries } = useIntersectionObserver(
    itemsRef,
    itemOptions,
  );
  const { entries: edgeEntries } = useIntersectionObserver(
    edgeRefs,
    edgeOptions,
  );

  const scrollFocus = useCallback(
    (index: number, behavior: ScrollBehavior = 'auto') => {
      itemsRef.current[index]?.scrollIntoView({
        block: 'nearest',
        inline: 'center',
        behavior,
      });
    },
    [],
  );

  useImperativeHandle(ref, () => ({ scrollFocus }), [scrollFocus]);

  useEffect(() => {
    if (!listRef.current) return;

    setItemOptions({
      root: listRef.current,
      threshold: 0,
      rootMargin: '0px 8px',
    });
    setEdgeOptions({
      root: listRef.current,
      threshold: 1,
    });
  }, []);

  useEffect(() => {
    const [prevEdge, nextEdge] = edgeRefs.current;

    setNavState({
      prev: Boolean(prevEdge && !edgeEntries.has(prevEdge)),
      next: Boolean(nextEdge && !edgeEntries.has(nextEdge)),
    });
  }, [edgeEntries]);

  const move = useCallback(
    (direction: Direction) => {
      const visibleIndexes = itemsRef.current.reduce<number[]>(
        (indexes, item, index) => {
          if (itemEntries.has(item)) indexes.push(index);
          return indexes;
        },
        [],
      );

      if (!visibleIndexes.length) return;

      const edgeIndex =
        direction === 'prev'
          ? visibleIndexes[0]
          : visibleIndexes[visibleIndexes.length - 1];
      if (edgeIndex === undefined) return;

      const targetIndex =
        direction === 'prev'
          ? Math.max(0, edgeIndex - 1)
          : Math.min(list.length - 1, edgeIndex + 1);

      itemsRef.current[targetIndex]?.scrollIntoView({
        block: 'nearest',
        inline: 'center',
        behavior: 'smooth',
      });
    },
    [itemEntries, list.length],
  );

  return (
    <div className={cx('ScrollBox')}>
      <ul ref={listRef} className={cx('list')} aria-label={ariaLabel}>
        <li
          aria-hidden="true"
          className={cx('observer')}
          ref={element => {
            if (element) edgeRefs.current[0] = element;
          }}
        />

        {list.map((item, index) => (
          <li
            key={item.id}
            aria-current={currentIndex === index ? 'true' : undefined}
            className={cx('item', { current: currentIndex === index })}
            ref={element => {
              if (element) itemsRef.current[index] = element;
            }}
          >
            <Item {...item} handleClick={handleItemClick?.(item, index)} />
          </li>
        ))}

        <li
          aria-hidden="true"
          className={cx('observer')}
          ref={element => {
            if (element) edgeRefs.current[1] = element;
          }}
        />
      </ul>

      <button
        type="button"
        aria-label="이전 슬라이드 보기"
        className={cx('nav-button', 'nav-prev')}
        disabled={!navState.prev}
        onClick={() => move('prev')}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="다음 슬라이드 보기"
        className={cx('nav-button', 'nav-next')}
        disabled={!navState.next}
        onClick={() => move('next')}
      >
        ›
      </button>
    </div>
  );
};

export default ScrollBox;
