// 줄바꿈을 기준으로 텍스트를 쪼갠 다음, 각 텍스트 조각을 한 줄에 쭉 늘어놓았을 때 그 너비를 textarea의 너비로 나누어 올림
// 하면 해당 텍스트 조각이 차지하는 줄 수가 될 것입니다.
const measureLines = (elem: HTMLElement, text: string) => {
  if (!elem || !text) return 0;
  const canvas = document.createElement('canvas');
  const canvasContext: CanvasRenderingContext2D = canvas.getContext('2d')!;
  const style = window.getComputedStyle(elem);
  canvasContext.font = style.getPropertyValue('font');
  canvasContext.letterSpacing = style.getPropertyValue('letter-spacing');

  const measuredLines = text
    .split('\n')
    .reduce(
      (res, curr) =>
        res +
        Math.max(
          Math.ceil(canvasContext.measureText(curr).width / elem.clientWidth),
          1,
        ),
      0,
    );
  return measuredLines;
};
export default measureLines;
