export type EntryMap = Map<Element, IntersectionObserverEntry>;

const DefaultOptions: IntersectionObserverInit = {};

const vanillaIntersectionObserver = (
  callback: (entries: EntryMap) => void,
  $elem: Element | Element[],
  options: IntersectionObserverInit = DefaultOptions,
) => {
  const entryMap: EntryMap = new Map();
  const handleIntersect = (entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      const el = entry.target;
      if (!entry.isIntersecting) entryMap.delete(el);
      else entryMap.set(el, entry);
    }
    callback(entryMap);
  };

  const observer = new IntersectionObserver(handleIntersect, options);
  for (const n of Array.isArray($elem) ? $elem : [$elem]) {
    if (n) observer.observe(n);
  }
  return observer;
};

export default vanillaIntersectionObserver;
