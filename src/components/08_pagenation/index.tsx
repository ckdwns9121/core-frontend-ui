import cx from './cx';
import TraditionalPagination from './1_tranditional';
import TransitionComparison from './2_transition';

const Pagination = () => (
  <div className={cx('Pagination')}>
    <h2>페이지네이션</h2>
    <TraditionalPagination />
    <TransitionComparison />
  </div>
);

export default Pagination;
