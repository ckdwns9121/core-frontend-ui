import type { ScrollSpyItem } from './data';
import cx from './cx';

export const HEADER_HEIGHT = 106;

export const ScrollSpyContent = ({
  id,
  index,
  title,
  description,
  targetRef,
  contentRef,
}: ScrollSpyItem & {
  targetRef?: (element: HTMLSpanElement | null) => void;
  contentRef?: (element: HTMLLIElement | null) => void;
}) => (
  <li ref={contentRef} id={id} data-index={index} className={cx('content')}>
    {targetRef && (
      <span
        ref={targetRef}
        data-index={index}
        className={cx('io-target')}
        aria-hidden="true"
      />
    )}
    <h4>
      {index + 1}. {title}
    </h4>
    {description.map(paragraph => (
      <p key={paragraph}>{paragraph}</p>
    ))}
  </li>
);

export const ScrollSpyNavItem = ({
  index,
  current,
  handleClick,
  itemRef,
}: {
  index: number;
  current: boolean;
  handleClick: () => void;
  itemRef: (element: HTMLLIElement | null) => void;
}) => (
  <li ref={itemRef} data-index={index} className={cx('nav-item', { current })}>
    <button
      type="button"
      aria-label={`${index + 1}번 섹션으로 이동`}
      aria-current={current ? 'location' : undefined}
      onClick={handleClick}
    >
      {index + 1}
    </button>
  </li>
);
