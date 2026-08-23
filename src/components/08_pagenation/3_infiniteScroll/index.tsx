import { useEffect, useRef } from 'react';
import useIntersectionObserver from '@/hooks/useIntersectoinObserer';
import cx from '../cx';
import useInfiniteFetcher from './useInfiniteFetcher';

const intersectionOptions: IntersectionObserverInit = {
  rootMargin: '200px 0px',
};

const InfiniteScroll = () => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const { entries } = useIntersectionObserver(loaderRef, intersectionOptions);
  const { data, isLoading, fetchNextPage, hasNextPage } =
    useInfiniteFetcher();

  useEffect(() => {
    if (loaderRef.current && entries.has(loaderRef.current)) {
      fetchNextPage();
    }
  }, [entries, fetchNextPage]);

  const itemCount = data.reduce((count, page) => count + page.length, 0);

  return (
    <section>
      <h3>#3. 무한 스크롤</h3>
      <p>
        목록 끝 200px 전에 다음 페이지를 요청한다. 현재 {itemCount}개 항목을
        불러왔다. 화면에서 멀어진 페이지는 `content-visibility: auto`로 렌더링을
        건너뛴다.
      </p>

      <div className={cx('infinite-list')}>
        {data.map((page, pageIndex) => (
          <ul
            key={page[0]?.id ?? pageIndex}
            className={cx('infinite-page')}
            aria-label={`${pageIndex + 1}페이지`}
          >
            {page.map(item => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
        ))}
      </div>

      <div ref={loaderRef} className={cx('infinite-loader')} aria-live="polite">
        {isLoading && <span>다음 페이지를 불러오는 중...</span>}
        {!isLoading && hasNextPage && (
          <button type="button" onClick={fetchNextPage}>
            더 보기
          </button>
        )}
        {!hasNextPage && <strong>모든 데이터를 불러왔습니다.</strong>}
      </div>
    </section>
  );
};

export default InfiniteScroll;
