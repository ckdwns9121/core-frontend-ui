import cx from './cx';
import DigitSeperatedInput from './1_digitSeperatedInput';
import Form1 from './2-1_uncontrolled';
import Form2 from './2-2_controlled';

const FormControls = () => {
  return (
    <div className={cx('Forms')} style={{ marginBottom: 500 }}>
      <h2>폼 컨트롤</h2>
      <DigitSeperatedInput />
      <Form1 />
      <Form2 />
    </div>
  );
};
export default FormControls;
