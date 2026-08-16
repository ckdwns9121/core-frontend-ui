import cx from './cx';
import LineClamp1 from './1_r';
// import LineClamp2 from './2_r';
// import LineClamp3 from './3_r';
// import LineClamp4 from './4_v';

const LineClamps = () => {
  return (
    <div className={cx('LineClamps')} style={{ marginBottom: 500 }}>
      <h2>말 줄임</h2>
      <LineClamp1 />
      {/* <LineClamp2 />
      <LineClamp3 />
      <LineClamp4 /> */}
    </div>
  );
};
export default LineClamps;
