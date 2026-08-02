import { useCallback, useRef } from 'react';
import cx from './cx';
const ReactiveTextBox3 = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleInput = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);
  return (
    <>
      <h3>
        #3. React<sub>원본의 scrollHeight로 조절</sub>
      </h3>
      <div className={cx('container')}>
        <textarea onInput={handleInput} ref={textareaRef} />
      </div>
    </>
  );
};
export default ReactiveTextBox3;
