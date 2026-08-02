import { useCallback, useRef } from 'react';
import cx from './cx';
const ReactiveTextBox2 = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replicaRef = useRef<HTMLTextAreaElement>(null);
  const handleInput = useCallback(() => {
    const [el, replica] = [textareaRef.current, replicaRef.current];
    if (!el || !replica) return;
    replica.value = el.value; // 1
    el.style.height = `${replica.scrollHeight}px`;
  }, []);
  return (
    <>
      <h3>
        #2. React<sub>Replica 기법</sub>
      </h3>
      <div className={cx('container')}>
        <textarea
          ref={replicaRef}
          className={cx('replica')}
          tabIndex={-1}
          readOnly
        />
        <textarea ref={textareaRef} onInput={handleInput} />
      </div>
    </>
  );
};
export default ReactiveTextBox2;
