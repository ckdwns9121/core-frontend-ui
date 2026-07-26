import cx from './cx';
import { data } from './data';
import { useState } from 'react';

type AccordionItem = {
  id: string;
  title: string;
  description: string;
  current: boolean;
  onToggle: () => void;
};

const AccordionItem = ({
  title,
  description,
  current,
  onToggle,
}: AccordionItem) => {
  return (
    <li className={cx('item', 'item3', { current })}>
      <button
        type="button"
        className={cx('tab')}
        onClick={() => {
          onToggle();
        }}
      >
        {title}
      </button>
      <div className={cx('description')}>{description}</div>
    </li>
  );
};

const Accordion7 = () => {
  // 여러 아이템의 ID를 배열에 보관하여 다중 활성화 관리
  const [activeIds, setActiveIds] = useState<string[]>([data[0].id]);

  const toggleItem = (id: string) => {
    setActiveIds(prev =>
      prev.includes(id)
        ? prev.filter(activeId => activeId !== id)
        : [...prev, id],
    );
  };

  return (
    <>
      <h3>
        #7. React<sub>다중 활성화 (Multiple)</sub>
      </h3>
      <ul className={cx('container')}>
        {data.map(d => (
          <AccordionItem
            {...d}
            key={d.id}
            current={activeIds.includes(d.id)}
            onToggle={() => {
              toggleItem(d.id);
            }}
          />
        ))}
      </ul>
    </>
  );
};

export default Accordion7;
