import cx from './cx';
import { data } from './data';
import { useState, createContext, useContext, type ReactNode } from 'react';

type AccordionContextType = {
  activeIds: string[];
  toggleItem: (id: string) => void;
};

const AccordionContext = createContext<AccordionContextType | null>(null);

const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('AccordionItem must be used within an AccordionProvider');
  }
  return context;
};

type AccordionProviderProps = {
  children: ReactNode;
  initialActiveIds?: string[];
};

const AccordionProvider = ({
  children,
  initialActiveIds = [],
}: AccordionProviderProps) => {
  const [activeIds, setActiveIds] = useState<string[]>(initialActiveIds);

  const toggleItem = (id: string) => {
    setActiveIds(prev =>
      prev.includes(id)
        ? prev.filter(activeId => activeId !== id)
        : [...prev, id],
    );
  };

  return (
    <AccordionContext.Provider value={{ activeIds, toggleItem }}>
      <ul className={cx('container')}>{children}</ul>
    </AccordionContext.Provider>
  );
};

type AccordionItemProps = {
  id: string;
  title: string;
  description: string;
};

const AccordionItem = ({ id, title, description }: AccordionItemProps) => {
  const { activeIds, toggleItem } = useAccordionContext();
  const current = activeIds.includes(id);

  return (
    <li className={cx('item', 'item3', { current })}>
      <button
        type="button"
        className={cx('tab')}
        onClick={() => toggleItem(id)}
      >
        {title}
      </button>
      <div className={cx('description')}>{description}</div>
    </li>
  );
};

const Accordion9 = () => {
  return (
    <>
      <h3>
        #9. React<sub>다중 활성화 (Context API)</sub>
      </h3>
      <AccordionProvider initialActiveIds={[data[0].id]}>
        {data.map(d => (
          <AccordionItem
            key={d.id}
            id={d.id}
            title={d.title}
            description={d.description}
          />
        ))}
      </AccordionProvider>
    </>
  );
};

export default Accordion9;
