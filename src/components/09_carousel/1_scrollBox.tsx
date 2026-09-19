import ScrollBox from './scrollBox';
import { type CarouselItem, data } from './data';
import cx from './cx';

const CarouselCard = ({
  title,
  description,
  imgUrl,
}: CarouselItem & { handleClick?: () => void }) => (
  <figure className={cx('card')}>
    <img
      src={imgUrl}
      width={600}
      height={400}
      loading="lazy"
      alt={description}
    />
    <figcaption>
      <strong>{title}</strong>
      <span>{description}</span>
    </figcaption>
  </figure>
);

const ScrollBoxCarousel = () => (
  <section>
    <h3>
      #1. React<sub>스크롤 박스</sub>
    </h3>
    <ScrollBox list={data} Item={CarouselCard} ariaLabel="풍경 이미지 캐러셀" />
  </section>
);

export default ScrollBoxCarousel;
