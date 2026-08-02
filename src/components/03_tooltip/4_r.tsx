import cx from './cx';
import data from './data';
type TooltipProps = { id: string; text: string; description: string };
const TooltipItem = ({ text, description }: TooltipProps) => {
  return (
    <span className={cx('tooltip-root')}>
      {text}
      <details className={cx('details', 'anchor')} name="tooltip">
        <summary className={cx('tooltip-trigger')} />
      </details>
      <span className={cx('anchor-target')}>{description}</span>
    </span>
  );
};

// 2024년 5월, w3c 명세에 CSS의 anchor positioning 기능이 초안으로 등록되었습니다.
// 아직 공식 기능으로 인정된 것은 아니지만,
// 대략적인 적용 방침은 정해진 것으로 보입니다. anchor positioning은 anchor(닻)을 지정하고, 닻 요소의 크기와 위치에 따라 타깃
// 요소의 크기와 위치를 설정할 수 있도록 하는 기능입니다. position-try-fallbacks라는 속성을 이용하면, viewport의 영역을
// 벗어났을 때 위치를 ‘뒤집을’ 수 있다고 합니다.

const Tooltip4 = () => (
  <>
    <h3>
      #4. React<sub>anchor positioning</sub>
    </h3>
    {data.map(d => (
      <TooltipItem {...d} key={d.id} />
    ))}
  </>
);
export default Tooltip4;
