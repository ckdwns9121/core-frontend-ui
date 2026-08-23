import cx from '../cx';
import usePageFetcher from './usePageFetcher';

const PAGE_SIZE = 5;

const TraditionalPagination = () => {
  const { currentPage, setPage, pageData, isPending } = usePageFetcher({
    pageSize: PAGE_SIZE,
  });

  const totalPages = pageData?.totalPages ?? 0;

  const movePage = (page: number) => {
    setPage(Math.min(Math.max(page, 0), Math.max(totalPages - 1, 0)));
  };

  return (
    <section>
      <h3>#1. 전통적인 페이지네이션</h3>

      <p className={cx('request-status')} aria-live="polite">
        {isPending
          ? `${currentPage + 1}페이지를 서버에서 불러오는 중...`
          : `응답 완료: ${pageData?.responseTime}ms`}
      </p>

      <ul
        className={cx('pagination-list', { loading: isPending })}
        aria-busy={isPending}
      >
        {pageData?.items.map(item => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>

      <nav className={cx('pagination')} aria-label="페이지 이동">
        <button
          type="button"
          onClick={() => movePage(currentPage - 1)}
          disabled={isPending || currentPage === 0}
        >
          이전
        </button>

        {Array.from({ length: totalPages }, (_, page) => (
          <button
            type="button"
            key={page}
            onClick={() => movePage(page)}
            disabled={isPending}
            className={cx({ active: currentPage === page })}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page + 1}
          </button>
        ))}

        <button
          type="button"
          onClick={() => movePage(currentPage + 1)}
          disabled={isPending || currentPage === totalPages - 1}
        >
          다음
        </button>
      </nav>
    </section>
  );
};

export default TraditionalPagination;
