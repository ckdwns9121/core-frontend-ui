import { generateRandomNumber, shiftData, waitFor } from '@/service/util';

const serverData = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  title: `페이지네이션 항목 ${index + 1}`,
}));

export type PaginationItem = (typeof serverData)[number];

export type PageResponse = {
  items: PaginationItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  responseTime: number;
};

export const requestPage = async (
  page: number,
  pageSize: number,
): Promise<PageResponse> => {
  const responseTime = generateRandomNumber(300, 1200, 100);

  // 서버가 요청을 처리하고 응답하는 데 걸리는 시간을 흉내 낸다.
  await waitFor(responseTime);

  const totalItems = serverData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const normalizedPage = Math.min(Math.max(page, 0), totalPages - 1);
  const startIndex = normalizedPage * pageSize;
  const remainingItemCount = totalItems - startIndex;
  const items = shiftData(
    serverData,
    startIndex,
    Math.min(pageSize, remainingItemCount),
  );

  return {
    items,
    page: normalizedPage,
    pageSize,
    totalItems,
    totalPages,
    responseTime,
  };
};
