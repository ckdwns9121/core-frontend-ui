import initViewportObserver, {
  type ViewportSize,
} from '@/context/vanilla/viewportObserver';
import VanillaWrapper from '../vanillaWrapper';
import cx from './cx';
import data from './data';
import Observer from '@/context/vanilla/observer';

const elemBuilder = (text: string, maxLines: number) => {
  // React의 state 대신 각 텍스트 요소가 자신의 접힘 상태를 클로저로 보관한다.
  let isClamped = false;

  // force가 있으면 측정 결과로 상태를 지정하고,
  // 버튼 클릭처럼 force가 없으면 현재 접힘 상태를 반전한다.
  const toggleClamped = (_e: Event | null, force?: boolean) => {
    isClamped = typeof force === 'boolean' ? force : !isClamped;

    // clamped 클래스는 버튼 화살표의 방향을 바꾼다.
    $content.classList.toggle(cx('clamped'), isClamped);

    // 실제 말줄임은 텍스트 요소의 -webkit-line-clamp가 담당한다.
    // 빈 문자열을 넣으면 줄 제한이 해제되어 전체 내용이 표시된다.
    $text.style.webkitLineClamp = isClamped ? `${maxLines}` : '';
  };

  const resize = () => {
    // 전체 콘텐츠 높이를 한 줄 높이로 나눠 현재 텍스트의 줄 수를 구한다.
    // overflow: hidden이어도 scrollHeight에는 가려진 영역까지 포함된다.
    const lineHeight = Number.parseFloat(getComputedStyle($text).lineHeight);
    const measuredLines = Math.round($text.scrollHeight / lineHeight);
    const linesOverflow = measuredLines > maxLines;

    // 화면 너비가 바뀌면 사용자가 열어 둔 상태와 관계없이
    // 현재 줄 수를 기준으로 접힘 상태를 다시 결정한다.
    toggleClamped(null, linesOverflow);

    // 최대 줄 수를 넘는 텍스트에만 열기/닫기 버튼을 표시한다.
    if (linesOverflow) $content.append($btn);
    else {
      $btn.remove();
    }
  };

  const $text = document.createElement('div');
  $text.classList.add(cx('text'));
  $text.textContent = text;
  const $btn = document.createElement('button');
  $btn.classList.add(cx('buttonMore'));
  // 두 번째 인수(force) 없이 호출되므로 클릭할 때마다 상태가 반전된다.
  $btn.addEventListener('click', toggleClamped);
  const $content = document.createElement('div');
  $content.classList.add(cx('content'));
  $content.append($text);

  // viewport 크기가 바뀔 때마다 텍스트를 다시 측정한다.
  Observer.observe<ViewportSize>('viewportSize', $content, resize);

  // 요소 생성 시에도 한 번 측정한다. 아직 DOM에 붙기 전이므로,
  // 이후 viewport observer의 알림에서 실제 너비 기준으로 다시 측정된다.
  resize();
  return $content;
};

const initiator = (wrapper: HTMLDivElement) => {
  // ResizeObserver가 viewport 변화를 공용 Observer에 전달하도록 초기화한다.
  initViewportObserver();
  // 각 문자열마다 독립적인 DOM과 접힘 상태를 만든 뒤 wrapper에 삽입한다.
  const $elems = data.map(text => elemBuilder(text, 3));
  wrapper.append(...$elems);
};

const LineClamp4_V = () => <VanillaWrapper initiator={initiator} title="#4" />;
export default LineClamp4_V;
