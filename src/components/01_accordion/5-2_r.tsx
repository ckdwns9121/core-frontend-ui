import cx from './cx';
import { data } from './data';

type AccordionItem = {
  id: string;
  title: string;
  description: string;
  initChecked: boolean;
};

const AccordionItem = ({
  id,
  title,
  description,
  initChecked,
}: AccordionItem) => {
  return (
    <details name="details_5_2" className={cx('item5-2')} open={initChecked}>
      <summary>{title}</summary>
      <div className={cx('description')}>{description}</div>
    </details>
  );
};

const Accordion5_2 = () => {
  return (
    <>
      <h3>
        #5-2. React<sub>details</sub>
      </h3>
      <ul className={cx('container')}>
        {data.map((d, i) => (
          <AccordionItem {...d} key={d.id} initChecked={i === 0} />
        ))}
      </ul>
    </>
  );
};

export default Accordion5_2;
