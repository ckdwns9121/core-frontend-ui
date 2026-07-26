import cx from './cx';
import { data } from './data';

type TabItem = {
  id: string;
  title: string;
  description: string;
  initalChecked: boolean;
};

const TabItem = ({ id, title, description, initalChecked }: TabItem) => (
  <li className={cx('item')}>
    <input
      type="radio"
      className={cx('input')}
      name="tabMenu"
      id={id}
      defaultChecked={initalChecked}
    />
    <label htmlFor={id} className={cx('tab')}>
      {title}
    </label>
    <p className={cx('description')}>{description}</p>
  </li>
);

const TabMenu5 = () => (
  <>
    <h3>
      #5. React <sub>html input(radio) 로 처리</sub>
    </h3>
    <ul className={cx('container', 'tabMenu5')}>
      {data.map((d, i) => (
        <TabItem {...d} key={d.id} initalChecked={i === 0} />
      ))}
    </ul>
  </>
);

export default TabMenu5;
