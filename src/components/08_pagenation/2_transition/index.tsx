import { memo, useState, useTransition } from 'react';
import cx from '../cx';

const ITEM_COUNT = 1500;
const ITEM_RENDER_TIME = 0.15;
const PAGE_COUNT = 5;

type SlowListProps = {
  page: number;
};

const SlowItem = ({ page, index }: { page: number; index: number }) => {
  const startTime = performance.now();

  // 렌더링이 무거운 컴포넌트를 재현하기 위한 학습용 지연이다.
  while (performance.now() - startTime < ITEM_RENDER_TIME) {
    // 의도적으로 메인 스레드에서 계산한다.
  }

  return (
    <li>
      {page + 1}페이지 항목 {index + 1}
    </li>
  );
};

const SlowList = memo(({ page }: SlowListProps) => (
  <ol className={cx('slow-list')}>
    {Array.from({ length: ITEM_COUNT }, (_, index) => (
      <SlowItem key={index} page={page} index={index} />
    ))}
  </ol>
));

const PageButtons = ({
  selectedPage,
  pending,
  onSelect,
}: {
  selectedPage: number;
  pending?: boolean;
  onSelect: (page: number) => void;
}) => (
  <div className={cx('comparison-buttons')}>
    {Array.from({ length: PAGE_COUNT }, (_, page) => (
      <button
        type="button"
        key={page}
        onClick={() => onSelect(page)}
        className={cx({ active: selectedPage === page })}
      >
        {page + 1}
      </button>
    ))}
    {pending && <span>목록 렌더링 중...</span>}
  </div>
);

const UrgentPagination = () => {
  const [page, setPage] = useState(0);

  return (
    <article className={cx('comparison-panel')}>
      <h4>일반 setState</h4>
      <p>페이지 버튼의 활성화와 무거운 목록을 하나의 긴급 업데이트로 처리한다.</p>
      <PageButtons selectedPage={page} onSelect={setPage} />
      <SlowList page={page} />
    </article>
  );
};

const TransitionPagination = () => {
  const [selectedPage, setSelectedPage] = useState(0);
  const [renderPage, setRenderPage] = useState(0);
  const [isPending, startTransition] = useTransition();

  const movePage = (page: number) => {
    // 사용자가 누른 버튼은 긴급 업데이트로 즉시 표시한다.
    setSelectedPage(page);

    // 무거운 목록 교체만 긴급하지 않은 Transition으로 처리한다.
    startTransition(() => {
      setRenderPage(page);
    });
  };

  return (
    <article className={cx('comparison-panel')}>
      <h4>useTransition</h4>
      <p>버튼 선택은 즉시 반영하고 무거운 목록은 중단 가능한 작업으로 처리한다.</p>
      <PageButtons
        selectedPage={selectedPage}
        pending={isPending}
        onSelect={movePage}
      />
      <div className={cx({ pending: isPending })}>
        <SlowList page={renderPage} />
      </div>
    </article>
  );
};

const TransitionComparison = () => (
  <section>
    <h3>#2. 일반 업데이트와 useTransition 비교</h3>
    <p>
      각 목록은 {ITEM_COUNT.toLocaleString()}개 항목을 렌더링한다. 페이지 버튼을
      빠르게 연속해서 눌러 반응 차이를 확인한다.
    </p>
    <div className={cx('comparison-grid')}>
      <UrgentPagination />
      <TransitionPagination />
    </div>
  </section>
);

export default TransitionComparison;
