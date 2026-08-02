import ReactiveTextBox0 from './0_r';
import ReactiveTextBox1 from './1_r';
import ReactiveTextBox2 from './2_r';
import ReactiveTextBox3 from './3_r';
import ReactiveTextBox4 from './4_r';
import cx from './cx';

const ReactiveTextBoxes = () => {
  return (
    <div className={cx('ReactiveTextBoxes')} style={{ marginBottom: 500 }}>
      <h2>리액티브 텍스트박스</h2>
      <ReactiveTextBox0 />
      <ReactiveTextBox1 />
      <ReactiveTextBox2 />
      <ReactiveTextBox3 />
      <ReactiveTextBox4 />
    </div>
  );
};
export default ReactiveTextBoxes;
