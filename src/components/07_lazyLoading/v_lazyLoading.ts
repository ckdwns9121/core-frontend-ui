import vanillaIntersectionObserver, {
  type EntryMap,
} from '@/hooks/vanilla/intersectionOberserver';

const isNativeSupported = 'loading' in HTMLImageElement.prototype;

const lazyLoadNative = ($elem: HTMLImageElement, src: string) => {
  $elem.setAttribute('loading', 'lazy');
  $elem.setAttribute('src', src);
};

const lazyLoadIO = ($elem: HTMLImageElement, src: string) => {
  const handleVisible = (entries: EntryMap) => {
    const isVisible = entries.has($elem);
    if (isVisible) {
      $elem.setAttribute('src', src);
      observer?.disconnect();
    }
  };
  const observer = vanillaIntersectionObserver(handleVisible, $elem);
};

const lazyLoad = isNativeSupported ? lazyLoadNative : lazyLoadIO;
export default lazyLoad;
