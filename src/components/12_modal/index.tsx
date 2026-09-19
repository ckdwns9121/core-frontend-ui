import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cx from './cx';

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

const Modal = ({ close }: { close: () => void }) => {
  const titleId = useId();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const modal = modalRef.current;
    modal?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') return close();
      if (event.key !== 'Tab' || !modal) return;
      const elements = Array.from(
        modal.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      const first = elements[0];
      const last = elements.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previous?.focus();
    };
  }, [close]);

  return createPortal(
    <div
      className={cx('Backdrop')}
      onMouseDown={event => event.target === event.currentTarget && close()}
    >
      <div
        ref={modalRef}
        className={cx('Modal')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h3 id={titleId}>배송지 추가</h3>
        <label>
          주소
          <input placeholder="주소를 입력하세요" />
        </label>
        <div className={cx('actions')}>
          <button type="button" onClick={close}>
            취소
          </button>
          <button type="button" onClick={close}>
            저장
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const Modals = () => {
  const [opened, setOpened] = useState(false);
  return (
    <section>
      <h2>모달과 포커스 트랩</h2>
      <p>
        Tab은 모달 내부에서 순환하고, 닫히면 열기 버튼으로 포커스가 복원됩니다.
      </p>
      <button type="button" onClick={() => setOpened(true)}>
        모달 열기
      </button>
      {opened && <Modal close={() => setOpened(false)} />}
    </section>
  );
};

export default Modals;
