import { useCallback, useEffect, useRef } from 'react';

const useClickOutside = <T extends HTMLElement>(
  callback: (e: MouseEvent) => void,
) => {
  const ref = useRef<T>(null);
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) callback(e);
    },
    [callback],
  );
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [handleClickOutside]);
  return ref;
};
export default useClickOutside;
