import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import cx from './cx';

type Position = { top: number; left: number };

const Popovers = () => {
  const [opened, setOpened] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!trigger || !popover) return;
    const rect = trigger.getBoundingClientRect();
    const left = Math.min(
      rect.left,
      window.innerWidth - popover.offsetWidth - 12,
    );
    setPosition({ top: rect.bottom + 8, left: Math.max(12, left) });
  }, []);

  useLayoutEffect(() => {
    if (opened) updatePosition();
  }, [opened, updatePosition]);

  useEffect(() => {
    if (!opened) return;
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !popoverRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      )
        setOpened(false);
    };
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    document.addEventListener('pointerdown', closeOutside);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('pointerdown', closeOutside);
    };
  }, [opened, updatePosition]);

  return (
    <section>
      <h2>팝오버</h2>
      <p>
        Portal로 렌더링하면서 트리거의 화면 좌표를 기준으로 위치를 계산합니다.
      </p>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={opened}
        aria-haspopup="menu"
        onClick={() => setOpened(value => !value)}
      >
        메뉴 열기
      </button>
      {opened &&
        createPortal(
          <div
            ref={popoverRef}
            className={cx('Popover')}
            role="menu"
            style={position}
          >
            {['스레드의 댓글', '메시지 전달', '나중을 위해 저장', '삭제'].map(
              label => (
                <button
                  key={label}
                  type="button"
                  role="menuitem"
                  onClick={() => setOpened(false)}
                >
                  {label}
                </button>
              ),
            )}
          </div>,
          document.body,
        )}
    </section>
  );
};

export default Popovers;
