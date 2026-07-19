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
    <li className={cx('item', 'item2',{current})}>
        <button type='button' className={cx('tab')} onClick={()=>{onToggle()}}>{title}</button>
        <div className={cx('description')}>{description}</div>
    </li>
  )
}

const Accordion2 = () => {
  const [currentId,setCurrentId] = useState<string | null>(data[0].id);

  const toggleItem =(id: string) => setCurrentId((prev)=> prev === id ? null : id);
  return (
    <>
    <h3>
      #2. React<sub>CSS로 hidden/show처리</sub>
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

export default Accordion2;  