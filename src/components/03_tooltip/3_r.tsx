import { useRef } from 'react';
import cx from './cx';
import data from './data';
import useStyleInsideViewport from '@/hooks/useStyleInsideViewport';

type TooltipProps = { id: string; text: string; description: string };
const TooltipItem = ({ id, text, description }: TooltipProps) => {
  const rootRef = useRef<HTMLDetailsElement>(null); // 1
  const targetRef = useRef<HTMLDivElement>(null); // 1
  const style = useStyleInsideViewport(rootRef, targetRef); // 2
  return (
    <span className={cx('tooltip-root')}>
      {text}
      <details className={cx('details')} name="tooltip" ref={rootRef}>
        <summary className={cx('tooltip-trigger')} />
        <span className={cx('tooltip-layer')} style={style} ref={targetRef}>
          {description}
        </span>
      </details>
    </span>
  );
};
// 상하 리사이즈(브라우저의 높이 변경)에 대해서는 반응하지 않고 있습니다.
// 왜 그럴까요? ResizeObserver는 지정한 요소의 사이즈가 변경될 때만 반응하기 때문입니다. document.scrollingElement는
// 페이지 전체로 이루어져 있으며,
// ‘페이지 전체 높이’는 창의 높이를 변경해도 달라지지 않습니다. 반면 브라우저의 넓이를 변경할 때
// 반응하는 이유는, 이에 따라 페이지 전체 높이가 달라지기 때문입니다

// 어떻게 해결할까?
// 브라우저의 높이 변경에 대해서도 정확히 대응하기 위해서는 다른 접근이 필요해 보입니다. 기존 방식대로 window에 resize 이벤트를
// 감시하도록 할 수도 있고, ResizeObserver 내용을 수정하는 방법도 있습니다. ResizeObserver를 유지하려면 viewport와 동일한
// 크기의 별도의 요소를 만들어서 이를 감시하도록 해야 하겠습니다.

const Tooltip3 = () => (
  <>
    <h3>
      #3. React<sub>화면을 벗어나지 않도록 처리 - 직접 계산</sub>
    </h3>
    {data.map(d => (
      <TooltipItem {...d} key={d.id} />
    ))}
  </>
);
export default Tooltip3;
