import VanillaWrapper from '../vanillaWrapper';
import data from './data';
import cx from './cx';
import lazyLoad from './v_lazyLoading';

export const generateLazyImage = (
  src: string,
  width: number,
  height: number,
) => {
  const $elem = document.createElement('img');
  $elem.className = cx('lazy');
  $elem.setAttribute('width', `${width}px`);
  $elem.setAttribute('height', `${height}px`);
  $elem.setAttribute('alt', '바닐라 지연로딩 이미지');

  const handleLoaded = () => $elem.classList.remove(cx('lazy'));
  $elem.addEventListener('load', handleLoaded);
  lazyLoad($elem, src);
  return $elem;
};

const initiator = (wrapper: HTMLDivElement) => {
  const $imgs = data.map(({ src }) => generateLazyImage(src, 600, 450));
  wrapper.append(...$imgs);
};

const VanillaLazyLoad = () => (
  <>
    <h2>지연로딩</h2>
    <VanillaWrapper initiator={initiator} title="#3" />
  </>
);

export default VanillaLazyLoad;
