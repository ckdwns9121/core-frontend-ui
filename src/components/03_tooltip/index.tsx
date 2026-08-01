import Tooltip1 from './1_r';
import Tooltip2 from './2_r';
import cx from './cx';

const ToolTips = () => (
  <div className={cx('Tooltips')} style={{ marginBottom: 200 }}>
    <h2>툴팁</h2>
    <Tooltip1 />
    <Tooltip2 />
  </div>
);

export default ToolTips;
