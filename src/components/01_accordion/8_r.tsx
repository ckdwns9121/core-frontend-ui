import cx from './cx';
import { data } from './data';
import { useState } from 'react';

type AccordionItemProps = {
  title: string;
  description: string;
  initChecked?: boolean;
};

const AccordionItem = ({ title, description, initChecked = false }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(initChecked);

  return (
    <li className={cx('item', 'item3', { current: isOpen })}>
      <button
        type="button"
        className={cx('tab')}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        {title}
      </button>
      <div className={cx('description')}>{description}</div>
    </li>
  );
};

const Accordion8 = () => {
  return (
    <>
      <h3>
        #8. React<sub>다중 활성화 (개별 State 관리)</sub>
      </h3>
      <ul className={cx('container')}>
        {data.map((d, i) => (
          <AccordionItem
            key={d.id}
            title={d.title}
            description={d.description}
            initChecked={i === 0}
          />
        ))}
      </ul>
    </>
  );
};

export default Accordion8;
