import cx from './cx';
import TraditionalPagination from './1_tranditional';
import TransitionComparison from './2_transition';
import InfiniteScroll from './3_infiniteScroll';

const Pagination = () => (
  <div className={cx('Pagination')}>
    <h2>페이지네이션</h2>
    <TraditionalPagination />
    <TransitionComparison />
    <InfiniteScroll />
  </div>
);

export default Pagination;
