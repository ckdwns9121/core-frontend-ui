import { useCallback, useState } from 'react';
import cx from './cx';
import data from './data';
import useClickOutside from '@/hooks/useClickOutside';

type TooltipProps = { id: string; text: string; description: string };

// 2-2에서는 ref를 tooltip-layer에 붙였습니다. 레이어는 트리거의 자식이므로 트리거를 클릭하면
// contains() 판정이 "바깥"이 되어, 캡처 단계의 handleClose(toggle(false))가 먼저 실행되고
// 이어서 버블 단계의 handleClick(toggle(prev => !prev))이 그 false를 다시 뒤집어 버렸습니다.
// 여기서는 ref를 트리거로 올려 트리거 클릭이 "안쪽"으로 판정되게 했습니다.
// 이제 열린 상태에서 트리거를 눌러도 handleClick 하나만 실행됩니다.

const TooltipItem = ({ text, description }: TooltipProps) => {
  const [isOpen, toggle] = useState(false);

  const handleClose = useCallback(() => toggle(false), []);
  const handleClick = () => toggle(prev => !prev);

  // 트리거와 레이어를 모두 감싸는 요소에 연결합니다.
  const ref = useClickOutside<HTMLSpanElement>(handleClose);

  return (
    <span className={cx('tooltip-root')}>
      {text}
      <span
        ref={ref}
        className={cx('tooltip-trigger', { open: isOpen })}
        onClick={handleClick}
      >
        {isOpen && (
          // 레이어가 트리거 안에 있어 클릭이 handleClick까지 버블링됩니다.
          // 본문을 클릭했다고 닫히지 않도록 여기서 전파를 끊습니다.
          <span
            className={cx('tooltip-layer')}
            onClick={e => e.stopPropagation()}
          >
            {description}
          </span>
        )}
      </span>
    </span>
  );
};

const Tooltip2_2_1 = () => {
  return (
    <>
      <h3>
        #2-2-1. React<sub>바깥 클릭으로 닫기 – ref 위치 교정</sub>
      </h3>
      {data.map(d => (
        <TooltipItem {...d} key={d.id} />
      ))}
    </>
  );
};
export default Tooltip2_2_1;
