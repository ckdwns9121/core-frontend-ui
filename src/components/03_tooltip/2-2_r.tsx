import { useState } from 'react';
import cx from './cx';
import data from './data';
import useClickOutside from '@/hooks/useClickOutside';

type TooltipProps = { id: string; text: string; description: string };
const TooltipDescription = ({
  description,
  handleClose,
}: {
  description: string;
  handleClose: () => void;
}) => {
  const ref = useClickOutside<HTMLSpanElement>(handleClose);
  return (
    <span className={cx('tooltip-layer')} ref={ref}>
      {description}
    </span>
  );
};

const TooltipItem = ({ text, description }: TooltipProps) => {
  const [isOpen, toggle] = useState(false);

  const handleClick = () => {
    console.log('클릭');
    toggle(prev => {
      console.log('  updater prev =', prev); // 무조건 false
      return !prev;
    });
  };
  const handleClose = () => {
    console.log('토글 false');
    toggle(false);
  };

  return (
    <span className={cx('tooltip-root')}>
      {text}
      <span
        className={cx('tooltip-trigger', { open: isOpen })}
        onClick={handleClick}
      >
        {isOpen && (
          <TooltipDescription
            description={description}
            handleClose={handleClose}
          />
        )}
      </span>
    </span>
  );
};
const Tooltip2_2 = () => {
  return (
    <>
      <h3>
        #1. React<sub>터치 또는 클릭으로 동작하는 툴팁</sub>
      </h3>
      {data.map(d => (
        <TooltipItem {...d} key={d.id} />
      ))}
    </>
  );
};
export default Tooltip2_2;
