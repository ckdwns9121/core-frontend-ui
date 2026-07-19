import TabMenu1 from './1_r';
import TabMenu2 from './2_r';
import TabMenu3_1 from './3-1_r';
import TabMenu3_2 from './3-2_r';
import cx from './cx';

const TabMenus = () => {
  return (
    <div className={cx('TabMenus')}>
      <h2>탭 메뉴</h2>
      <TabMenu1 />
      <TabMenu2 />
      <TabMenu3_1 />
      <TabMenu3_2 />
    </div>
  );
};
export default TabMenus;
