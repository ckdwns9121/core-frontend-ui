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

const TabMenu2 = () => {
  const [currentId, setCurrentId] = useState<string>(data[0].id);

  const toggleItem = (id: string) => setCurrentId(id);

  const currentDescription = data.find(d => d.id === currentId)?.description;

  return (
    <>
      <h3>
        #2. React <sub>css로 hidden/show처리</sub>
      </h3>
      <div className={cx('container', 'tabMenu2')}>
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
        {data.map(d => (
          <div
            key={d.id}
            className={cx('description', { current: currentId === d.id })}
          >
            {d.description}
          </div>
        ))}
      </div>
    </>
  );
};

export default TabMenu2;
