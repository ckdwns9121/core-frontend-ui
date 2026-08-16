import { useCallback, useEffect, useRef, useState } from 'react';
import cx from './cx';
import data from './data';
import measureLines from '@/service/measureLines';
import { useViewportSize } from '@/context/viewportContext';

const LineClampedText = ({
  text,
  maxLines = Number.MAX_SAFE_INTEGER,
}: {
  text: string;
  maxLines: number;
}) => {
  const { width: viewportWidth } = useViewportSize();
  const elemRef = useRef<HTMLDivElement>(null);
  const [showClampButton, setClampButton] = useState(false);
  const [isClamped, setIsClamped] = useState(false);

  const toggleClamped = useCallback(() => {
    setIsClamped(prev => !prev);
  }, []);

  useEffect(() => {
    if (!text || !elemRef.current || !viewportWidth) return;
    const linesOverflow = measureLines(elemRef.current, text) > maxLines;
    setIsClamped(linesOverflow);
    setClampButton(linesOverflow);
  }, [text, viewportWidth, maxLines]);

  return (
    <div className={cx('content', { clamped: isClamped })}>
      <div
        className={cx('text')}
        ref={elemRef}
        style={{ WebkitLineClamp: isClamped ? maxLines : '' }}
      >
        {text}
      </div>
      {showClampButton && (
        <button onClick={toggleClamped} className={cx('buttonMore')}>
          {isClamped ? '닫기' : '더보기'}
        </button>
      )}
    </div>
  );
};

const LineClamp1 = () => {
  return (
    <>
      <h3>
        #1. React<sub>canvas - 3줄 말줄임</sub>
      </h3>
      {data.map((text, i) => (
        <LineClampedText key={i} text={text} maxLines={3} />
      ))}
    </>
  );
};

export default LineClamp1;
