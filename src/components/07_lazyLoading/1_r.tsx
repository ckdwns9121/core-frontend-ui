import { useCallback, useEffect, useRef, useState } from 'react';
import cx from './cx';
import data from './data';
import { useScrollInfo, useViewportSize } from '@/context/viewportContext';

type Image = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const LazyImage = ({ src, alt, width, height }: Image) => {
  const scrollInfo = useScrollInfo();
  const viewportSize = useViewportSize();
  const imgRef = useRef<HTMLImageElement>(null);
  const requestedRef = useRef(false);

  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(() => setLoaded(true), []);

  useEffect(() => {
    if (requestedRef.current || !imgRef.current) return;

    const $img = imgRef.current;
    const { width: vw, height: vh } = viewportSize;
    const { top, right, bottom, left } = $img.getBoundingClientRect();
    const isInsideViewport = top < vh && bottom > 0 && left < vw && right > 0;

    if (!isInsideViewport) return;

    requestedRef.current = true;
    $img.src = src;
  }, [src, scrollInfo, viewportSize]);

  return (
    <img
      ref={imgRef}
      data-src={src}
      onLoad={handleLoad}
      width={width}
      height={height}
      alt={alt}
      className={cx({ lazy: !loaded })}
    />
  );
};

const LazyLoad1 = () => (
  <>
    <h2>지연로딩</h2>
    <h3>#1. React - 직접계산</h3>
    <div className={cx('list')}>
      {data.map(item => (
        <LazyImage
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

export default LazyLoad1;
