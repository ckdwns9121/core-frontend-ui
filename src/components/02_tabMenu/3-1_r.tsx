import { useState } from 'react';
import cx from './cx';
import { data } from './data';

type TabItem = {
  id: string;
  title: string;
  description: string;
  current: boolean;
  toggle: () => void;
};

const TabItem = ({ id, title, description, current, toggle }: TabItem) => {
  return (
    <li className={cx('tab', { current })} key={id}>
      <button className={cx('tab')} onClick={toggle}>
        {title}
      </button>
    </li>
  );
};

const TabMenu3_1 = () => {
  const [currentId, setCurrentId] = useState<string>(data[0].id);

  const toggleItem = (id: string) => setCurrentId(id);

  return (
    <>
      <h3>
        #3-1. React <sub>애니메이션 처리</sub>
      </h3>
      <div className={cx('container', 'tabMenu3-1')}>
        <ul className={cx('tabList')}>
          {data.map(d => (
            <TabItem
              key={d.id}
              {...d}
              current={currentId === d.id}
              toggle={() => toggleItem(d.id)}
            />
          ))}
        </ul>
        <div className={cx('tabPanel')}>
          {data.map(d => (
            <div
              key={d.id}
              className={cx('description', { current: currentId === d.id })}
            >
              {d.description}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TabMenu3_1;
