import { useCallback, useEffect, useRef, useState } from 'react';
import cx from './cx';
import data from './data';
import useIntersectionObserver from '@/hooks/useIntersectoinObserer';

type Image = { src: string; alt: string; width: number; height: number };

const LazyImageIO = ({ src, alt, width, height }: Image) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const { entries, observerRef } = useIntersectionObserver(imgRef);

  const handleLoad = useCallback(() => setLoaded(true), []);

  useEffect(() => {
    if (entries.has(imgRef.current!)) {
      imgRef.current!.setAttribute('src', src);
      observerRef.current?.disconnect(); // 이거 왜하는거지?
    }
  }, [src, entries, observerRef]);
  return (
    <img
      className={cx({ lazy: !loaded })}
      onLoad={handleLoad}
      ref={imgRef}
      width={width}
      height={height}
      alt={alt}
    />
  );
};

const LazyImageNative = ({ src, width, height }: Image) => {
  const [loaded, setLoaded] = useState(false);
  const handleLoad = useCallback(() => setLoaded(true), []);

  return (
    <img
      loading="lazy"
      className={cx({ lazy: !loaded })}
      onLoad={handleLoad}
      src={src}
      width={width}
      height={height}
      alt="네이티브 이미지"
    />
  );
};

const isNativeSupported = 'loading' in HTMLImageElement.prototype;
export const LazeImage = isNativeSupported ? LazyImageNative : LazyImageIO;

const LazyLoad2 = () => (
  <>
    <h2>지연로딩</h2>
    <h3>#2. React - IntersectionObserver</h3>
    <div className={cx('list')}>
      {data.map(item => (
        <LazeImage
          key={item.id}
          src={item.src}
          alt={item.alt}
          height={450}
          width={600}
        />
      ))}
    </div>
  </>
);
export default LazyLoad2;
