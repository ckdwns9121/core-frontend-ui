import cx from './cx';
import {data} from './data';
import {useState} from 'react';


type AccordionItem={
    id:string;
    title:string;
    description:string;
    current:boolean;
    onToggle:()=>void;
}

const AccordionItem = ({id,title,description, current, onToggle}:AccordionItem) => {
  return (
    <li className={cx('item', {current})}>
        <button type='button' className={cx('tab')} onClick={()=>{onToggle()}}>{title}</button>
        {current && <div className={cx('description')}>{description}</div>}
    </li>
  )
}

const Accordion1 = () => {
  const [currentId,setCurrentId] = useState<string | null>(data[0].id);

  const toggleItem =(id: string) => setCurrentId((prev)=> prev === id ? null : id);
  return (
    <>
    <h3>
      #1. React<sub>현재 desc만 렌더링</sub>
    </h3>
      <ul className={cx('container')}>
        {data.map((d) =>(
          <AccordionItem 
          {...d}
          key={d.id}
          current={currentId ===d.id}
          onToggle={()=>{toggleItem(d.id)}}
          />
        ))}
      </ul>
    </>
  );
};

export default Accordion1;  