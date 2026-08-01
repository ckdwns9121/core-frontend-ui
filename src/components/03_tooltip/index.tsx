import Tooltip1 from './1_r';
import Tooltip2_1 from './2-1_r';
import Tooltip2_2 from './2-2_r';
import Tooltip2_2_1 from './2-2-1_r';
import cx from './cx';

const ToolTips = () => (
  <div className={cx('Tooltips')} style={{ marginBottom: 200 }}>
    <h2>툴팁</h2>
    <Tooltip1 />
    <Tooltip2_1 />
    <Tooltip2_2 />
    <Tooltip2_2_1 />
  </div>
);

export default ToolTips;
