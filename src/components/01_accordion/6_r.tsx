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
    const $desc = descRef.current;
    $desc?.addEventListener('beforematch',onToggle);
    return()=>{
      $desc?.removeEventListener('beforematch',onToggle);
    }
  },[onToggle])

  return (
    <li className={cx('item', 'item3',{current})}>
        <button type='button' className={cx('tab')} onClick={()=>{onToggle()}}>{title}</button>
        <div className={cx('description')} ref={descRef}
        HIDDEN={current ? undefined : 'until-found'}
        >
          {description}
          
        </div>
    </li>
  )
}

const Accordion6= () => {
  const [currentId,setCurrentId] = useState<string | null>(data[0].id);

  const toggleItem =(id: string) => setCurrentId((prev)=> prev === id ? null : id);
  return (
    <>
    <h3>
      #6. React<sub>Ctrl + F</sub>
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

export default Accordion6;  