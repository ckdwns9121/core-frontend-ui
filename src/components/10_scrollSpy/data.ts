export type ScrollSpyItem = {
  id: string;
  index: number;
  title: string;
  description: string[];
};

const descriptions = [
  '스크롤 위치에 따라 현재 읽고 있는 콘텐츠와 내비게이션 상태를 연결합니다.',
  '각 섹션은 서로 다른 높이를 가져 좌표 계산과 교차 감지의 차이를 확인할 수 있습니다.',
  '상단 번호를 누르면 해당 섹션으로 이동하고 활성 항목도 함께 변경됩니다.',
];

export const data: ScrollSpyItem[] = [
  '스크롤 스파이 소개',
  '스크롤 이벤트 방식',
  '요소 위치 측정',
  'IntersectionObserver',
  '동적인 threshold',
  '활성 메뉴 동기화',
  '프로그래밍 방식 이동',
  '구현 방식 비교',
].map((title, index) => ({
  id: `scroll-spy-section-${index + 1}`,
  index,
  title,
  description: descriptions.map(
    description => `${description} ${index + 1}번 섹션의 예제 문장입니다.`,
  ),
}));
