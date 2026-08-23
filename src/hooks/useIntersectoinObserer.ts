import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

// options를 전달하지 않았을 때 매 렌더링마다 새 객체가 생성되어
// observer가 불필요하게 재생성되는 것을 방지한다.
const DefaultOptions: IntersectionObserverInit = {};

/**
 * 하나 또는 여러 DOM 요소가 관찰 영역과 교차하는지 감지한다.
 *
 * entries에는 현재 관찰 영역 안에 들어와 있는 요소만 저장된다.
 * options 객체를 컴포넌트 안에서 전달할 때는 useMemo 등으로 참조를
 * 안정화해야 IntersectionObserver가 불필요하게 다시 생성되지 않는다.
 */
const useIntersectionObserver = (
  elemRef: RefObject<Element | Element[] | null>,
  options: IntersectionObserverInit = DefaultOptions,
) => {
  // 외부에서도 observe, unobserve 등의 메서드를 사용할 수 있도록
  // 생성된 IntersectionObserver 인스턴스를 보관한다.
  const observerRef = useRef<IntersectionObserver>(null);

  // Element를 key로 사용해 여러 요소의 최신 교차 정보를 관리한다.
  // 관찰 영역 밖에 있는 요소는 Map에서 제거된다.
  const [entries, setEntries] = useState<
    Map<Element, IntersectionObserverEntry>
  >(new Map());

  // IntersectionObserver가 교차 상태의 변화를 감지하면 실행된다.
  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      setEntries(prev => {
        // React 상태를 직접 변경하지 않도록 기존 Map을 복사한다.
        const next = new Map(prev);
        for (const entry of entries) {
          const el = entry.target;

          // 현재 화면 안에 있는 요소만 Map에 유지한다.
          if (!entry.isIntersecting) next.delete(el);
          else next.set(el, entry);
        }
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    // effect가 실행되는 시점의 실제 DOM 요소를 가져온다.
    const node = elemRef.current;
    if (!node) return;

    // 전달받은 root, rootMargin, threshold 설정으로 observer를 생성한다.
    const observer = new IntersectionObserver(handleIntersect, options);
    observerRef.current = observer;

    // 단일 Element와 Element 배열을 동일한 배열 형태로 처리한다.
    for (const n of Array.isArray(node) ? node : [node]) {
      if (n) observer.observe(n);
    }

    // 컴포넌트가 사라지거나 의존성이 변경되면 모든 관찰을 해제한다.
    return () => {
      observer?.disconnect();
    };
  }, [elemRef, handleIntersect, options]);

  // entries로 현재 교차 중인 요소를 확인하고, observerRef로 필요에 따라
  // 특정 요소의 관찰을 직접 시작하거나 중단할 수 있다.
  return { entries, observerRef };
};

export default useIntersectionObserver;
