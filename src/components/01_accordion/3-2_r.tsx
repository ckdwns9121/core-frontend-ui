import cx from './cx';
import {data} from './data';
import {useState, useEffect, useRef} from 'react';


type AccordionItem={
    id:string;
    title:string;
    description:string;
    current:boolean;
    onToggle:()=>void;
}

const AccordionItem = ({id,title,description, current, onToggle}:AccordionItem) => {
  const descRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    const $desc = descRef.current!;
    $desc.style.maxHeight = current ? `${$desc.scrollHeight}px` : '0';
  },[current])

  return (
    <li className={cx('item', 'item3',{current})}>
        <button type='button' className={cx('tab')} onClick={()=>{onToggle()}}>{title}</button>
        <div className={cx('description')} ref={descRef}>{description}</div>
    </li>
  )
}

const Accordion3_2= () => {
  const [currentId,setCurrentId] = useState<string | null>(data[0].id);

  const toggleItem =(id: string) => setCurrentId((prev)=> prev === id ? null : id);
  return (
    <>
    <h3>
      #3-2. React<sub>Transition Group 사용</sub>
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

export default Accordion3_2;  