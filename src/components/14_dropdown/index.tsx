import { useEffect, useId, useRef, useState } from 'react';
import cx from './cx';

const items = ['React', 'Vue', 'Svelte', 'Solid', 'Angular'];

const Dropdowns = () => {
  const listboxId = useId();
  const [opened, setOpened] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<HTMLButtonElement[]>([]);

  useEffect(() => {
    if (opened) optionRefs.current[focusedIndex]?.focus();
  }, [focusedIndex, opened]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpened(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpened(true);
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setFocusedIndex(
        index => (items.length + index + direction) % items.length,
      );
    } else if (event.key === 'Escape') {
      setOpened(false);
    }
  };

  const choose = (item: string) => {
    setSelected(item);
    setOpened(false);
  };

  return (
    <section>
      <h2>드롭다운</h2>
      <p>
        선택 상태와 키보드 포커스를 분리하고 WAI-ARIA listbox 역할을 적용합니다.
      </p>
      <div ref={rootRef} className={cx('Dropdown')} onKeyDown={handleKeyDown}>
        <button
          type="button"
          className={cx('trigger')}
          aria-haspopup="listbox"
          aria-expanded={opened}
          aria-controls={listboxId}
          onClick={() => setOpened(value => !value)}
        >
          <span>{selected ?? '프레임워크를 선택하세요'}</span>
          <span aria-hidden="true">▾</span>
        </button>
        {opened && (
          <div
            id={listboxId}
            className={cx('list')}
            role="listbox"
            aria-label="프레임워크"
          >
            {items.map((item, index) => (
              <button
                key={item}
                ref={element => {
                  if (element) optionRefs.current[index] = element;
                }}
                type="button"
                role="option"
                aria-selected={selected === item}
                className={cx('option', { focused: focusedIndex === index })}
                onMouseEnter={() => setFocusedIndex(index)}
                onClick={() => choose(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Dropdowns;
