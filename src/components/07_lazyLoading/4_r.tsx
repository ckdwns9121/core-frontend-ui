import { useCallback, useEffect, useRef, useState } from 'react';
import cx from './cx';
import data from './data';
import useIntersectionObserver from '@/hooks/useIntersectoinObserer';

type Image = { src: string; alt: string; width: number; height: number };

const LazyImageIO = ({ src, alt, width, height }: Image) => {
  const figureRef = useRef<HTMLDivElement>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const { entries, observerRef } = useIntersectionObserver(imgRef);

  const handleLoad = useCallback(() => setLoaded(true), []);

  useEffect(() => {
    const isVisible = entries.has(imgRef.current!);
    if (isVisible) {
      figureRef.current!.style.backgroundImage = `url(${src.replace('/600/320', '/60/32')})`;
      imgRef.current!.setAttribute('src', src);
      observerRef.current?.disconnect();
    }
  }, [src, entries, observerRef]);
  return (
    <figure ref={figureRef} className={cx('lazy-image', { lazy: !loaded })}>
      <img
        className={cx({ lazy: !loaded })}
        onLoad={handleLoad}
        ref={imgRef}
        width={width}
        height={height}
        alt={alt}
      />
    </figure>
  );
};

const LazyLoad2 = () => (
  <>
    <h2>지연로딩</h2>
    <h3>#4. React - IntersectionObserver</h3>
    <div className={cx('list')}>
      {data.map(item => (
        <LazyImageIO
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
