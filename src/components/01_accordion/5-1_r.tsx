import cx from './cx';
import { data } from './data';
import { useState, useEffect, useRef } from 'react';

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
    <li className={cx('item', 'item5-1')}>
      <input
        className={cx('input')}
        type="radio"
        name="accordion"
        id={id}
        defaultChecked={initChecked}
      />
      <label htmlFor={id} className={cx('tab')}>
        {title}
      </label>
      <div className={cx('description')}>{description}</div>
    </li>
  );
};

const Accordion5_1 = () => {
  return (
    <>
      <h3>
        #5-1. React<sub>html input(radio)만으로 동작</sub>
      </h3>
      <ul className={cx('container')}>
        {data.map((d, i) => (
          <AccordionItem {...d} key={d.id} initChecked={i === 0} />
        ))}
      </ul>
    </>
  );
};

export default Accordion5_1;
