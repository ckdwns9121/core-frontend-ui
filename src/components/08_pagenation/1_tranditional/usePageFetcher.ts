import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { type PageResponse, requestPage } from './mockServer';

type UsePageFetcherOptions = {
  initialPage?: number;
  pageSize: number;
};

const usePageFetcher = ({
  initialPage = 0,
  pageSize,
}: UsePageFetcherOptions) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageData, setPageData] = useState<PageResponse | null>(null);
  const [isPending, startTransition] = useTransition();
  const latestRequestId = useRef(0);

  const setPage = useCallback(
    (page: number) => {
      const requestId = ++latestRequestId.current;
      setCurrentPage(page);

      startTransition(async () => {
        const response = await requestPage(page, pageSize);

        // 나중에 시작한 요청이 있다면 현재 응답은 화면에 반영하지 않는다.
        if (requestId !== latestRequestId.current) return;

        // await 이후의 상태 변경도 Transition으로 처리한다.
        startTransition(() => {
          setCurrentPage(response.page);
          setPageData(response);
        });
      });
    },
    [pageSize],
  );

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage, setPage]);

  return {
    currentPage,
    pageData,
    isPending,
    setPage,
  };
};

export default usePageFetcher;
