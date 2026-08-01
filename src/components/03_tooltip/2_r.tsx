import data from './data';
import SingleOpenContextProvider, {
  useSingleOpen,
} from '@/context/singleOpenContext';
import cx from './cx';

type TooltipProps = { id: string; text: string; description: string };

// 컨텍스트 외부 요소와 상호 작용을 할 때는 앞서 열려 있던 툴팁은 그 상태 그대로 유지됩니다. 컨텍스트 내부에 있더라도 상호
// 작용의 대상이 툴팁 버튼이 아니면 마찬가지로 툴팁은 닫히지 않습니다. 당장 눈에 보이는 문제는 해결했다고 생각했지만, 실무에
// 적용하기엔 무리가 있는 코드가 되고 말았네요.

const TooltipItem = ({ id, text, description }: TooltipProps) => {
  const [isOpen, toggle] = useSingleOpen(id);
  const handleClick = () => {
    toggle(prev => (prev === id ? null : id));
  };
  return (
    <span className={cx('tooltip-root')}>
      {text}
      <span
        className={cx('tooltip-trigger', { open: isOpen })}
        onClick={handleClick}
      >
        {isOpen && <span className={cx('tooltip-layer')}>{description}</span>}
      </span>
    </span>
  );
};

const Tooltip2_1 = () => {
  return (
    <>
      <h3>
        #2-1. React<sub>하나만 열리도록 처리 – context API 사용</sub>
      </h3>
      <SingleOpenContextProvider>
        {data.map(d => (
          <TooltipItem {...d} key={d.id} />
        ))}
      </SingleOpenContextProvider>
    </>
  );
};
export default Tooltip2_1;
