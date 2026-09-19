import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cx from './cx';

type SnackbarItem = { id: number; message: string };
const DURATION = 3000;

const Snackbars = () => {
  const [items, setItems] = useState<SnackbarItem[]>([]);
  const sequenceRef = useRef(0);

  const close = useCallback((id: number) => {
    setItems(current => current.filter(item => item.id !== id));
  }, []);

  const open = () => {
    const id = ++sequenceRef.current;
    setItems(current => [
      ...current,
      { id, message: `${id}번째 작업이 저장되었습니다.` },
    ]);
    window.setTimeout(() => close(id), DURATION);
  };

  return (
    <section className={cx('SnackbarExample')}>
      <h2>스낵바</h2>
      <p>문서 끝에 Portal로 렌더링하고 여러 알림을 큐처럼 쌓습니다.</p>
      <button type="button" onClick={open}>
        스낵바 띄우기
      </button>
      {createPortal(
        <div className={cx('Snackbars')} aria-live="polite" aria-atomic="false">
          {items.map(item => (
            <div key={item.id} className={cx('Snackbar')} role="status">
              <span>{item.message}</span>
              <button
                type="button"
                onClick={() => close(item.id)}
                aria-label="알림 닫기"
              >
                ×
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </section>
  );
};

export default Snackbars;
