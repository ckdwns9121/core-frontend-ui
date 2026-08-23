import { generateRandomNumber, shiftData, waitFor } from '@/service/util';
import { useCallback, useRef, useState, useTransition } from 'react';
import data from './data';

export type Item = { id: string; title: string; description: string };
export type FetchState = { data: Item[][]; hasNextPage: boolean };

export const PAGE_SIZE = 15;

const TOTAL_PAGES = generateRandomNumber(5, 10, 1);
const initialState: FetchState = { data: [], hasNextPage: true };

const generatePageData = async (page: number) => {
  await waitFor(generateRandomNumber(300, 1000, 50));

  const pageSize =
    page === TOTAL_PAGES - 1
      ? generateRandomNumber(1, PAGE_SIZE, 1)
      : PAGE_SIZE + 1;
  const offset = page * PAGE_SIZE;

  return shiftData(data, offset, pageSize);
};

const useInfiniteFetcher = () => {
  const [{ data, hasNextPage }, setState] =
    useState<FetchState>(initialState);
  const [isLoading, startTransition] = useTransition();
  const loadingRef = useRef(false);

  const fetchNextPage = useCallback(() => {
    if (loadingRef.current || !hasNextPage) return;

    loadingRef.current = true;

    startTransition(async () => {
      try {
        const pageData = await generatePageData(data.length);

        // await 이후 상태 변경도 Transition 업데이트로 처리한다.
        startTransition(() => {
          setState(prev => {
            const nextPageData = pageData.slice(0, PAGE_SIZE);

            return {
              data: [...prev.data, nextPageData],
              hasNextPage: pageData.length === PAGE_SIZE + 1,
            };
          });
        });
      } finally {
        loadingRef.current = false;
      }
    });
  }, [data.length, hasNextPage]);

  return { data, isLoading, fetchNextPage, hasNextPage };
};

export default useInfiniteFetcher;
