const _observerMap = new Map<string, Map<any, (val: unknown) => void>>();

const Observer = {
  observe<T>(event: string, target: HTMLElement, handler: (val: T) => void) {
    const entries = _observerMap.get(event) || new Map();
    entries.set(target, handler);
    _observerMap.set(event, entries);
  },
  unobserve(event: string, target: HTMLElement) {
    const entries = _observerMap.get(event);
    if (!entries) return;
    entries.delete(target);
    _observerMap.set(event, entries);
  },
  notify<T>(event: string, val: T) {
    const entries = _observerMap.get(event);
    if (entries) {
      for (const [, func] of entries) func(val);
    }
  },
};
export default Observer;
