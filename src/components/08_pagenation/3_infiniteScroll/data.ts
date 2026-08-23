const data = Array.from({ length: 165 }, (_, index) => ({
  id: `infinite-item-${index + 1}`,
  title: `무한 스크롤 항목 ${index + 1}`,
  description: `${index + 1}번째 항목의 설명입니다.`,
}));

export default data;
