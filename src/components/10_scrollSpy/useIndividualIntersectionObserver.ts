import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

type IndividualOptions = Omit<IntersectionObserverInit, 'threshold'> & {
  baseThreshold?: number;
};

const defaultOptions: IndividualOptions = {};

const useIndividualIntersectionObserver = (
  elementsRef: RefObject<Element[]>,
  options: IndividualOptions = defaultOptions,
) => {
  const observersRef = useRef<Map<Element, IntersectionObserver>>(new Map());
  const [entries, setEntries] = useState<
    Map<Element, IntersectionObserverEntry>
  >(new Map());

  const handleIntersect = useCallback(
    (nextEntries: IntersectionObserverEntry[]) => {
      setEntries(previous => {
        const next = new Map(previous);

        for (const entry of nextEntries) {
          console.log('[개별 IO] 교차 상태 변경', {
            index: (entry.target as HTMLElement).dataset.index,
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            threshold: entry.target
              ? observersRef.current.get(entry.target)?.thresholds[0]
              : undefined,
          });

          if (entry.isIntersecting) next.set(entry.target, entry);
          else next.delete(entry.target);
        }

        return next;
      });
    },
    [],
  );

  useEffect(() => {
    const { baseThreshold = 0.5, ...observerOptions } = options;

    for (const element of elementsRef.current) {
      const elementHeight = element.getBoundingClientRect().height;
      const visibleRatio = Math.min(1, window.innerHeight / elementHeight);
      const threshold = baseThreshold * visibleRatio;
      const observer = new IntersectionObserver(handleIntersect, {
        ...observerOptions,
        threshold,
      });

      console.log('[개별 IO] Observer 생성', {
        index: (element as HTMLElement).dataset.index,
        elementHeight,
        viewportHeight: window.innerHeight,
        threshold,
      });

      observer.observe(element);
      observersRef.current.set(element, observer);
    }

    return () => {
      for (const observer of observersRef.current.values()) {
        observer.disconnect();
      }
      observersRef.current.clear();
    };
  }, [elementsRef, handleIntersect, options]);

  return entries;
};

export default useIndividualIntersectionObserver;
