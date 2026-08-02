import cx from './cx';

// 1번·2번이 왜 필요한지 확인하기 위한 기준점입니다.
//
// 왼쪽은 아무 처리도 하지 않은 textarea입니다. min-height와 max-height가 걸려 있지만
// 높이는 늘어나지 않습니다. textarea의 높이는 내용이 아니라 rows 속성(기본값 2)이 정하고,
// 내용이 넘치면 늘어나는 대신 스크롤바가 생기기 때문입니다.
// max-height는 천장일 뿐 늘리는 장치가 아니라서, 늘어나지 않는 요소에는 걸릴 일도 없습니다.
//
// 오른쪽은 CSS 한 줄만 추가했습니다. field-sizing: content는 "내용 크기로 재라"는 지시로,
// 이 한 줄이 canvas(1번)와 replica(2번)가 하던 일을 통째로 대체합니다.
// 다만 Chromium 계열이 먼저 지원했고 다른 브라우저는 뒤따라오는 중이라
// index.module.scss에서 @supports로 감싸 두었습니다. 미지원 브라우저에서는
// 오른쪽도 왼쪽과 똑같이 동작하며, 그때는 1번이나 2번 방식이 필요합니다.

const ReactiveTextBox0 = () => {
  return (
    <>
      <h3>
        #0. React<sub>처리 없음 vs field-sizing – 자동 높이 비교</sub>
      </h3>
      <div className={cx('compare')}>
        <div>
          <p className={cx('caption')}>처리 없음 — 늘어나지 않습니다</p>
          <div className={cx('container')}>
            <textarea />
          </div>
        </div>
        <div>
          <p className={cx('caption')}>
            <code>field-sizing: content</code> — JS 없이 늘어납니다
          </p>
          <div className={cx('container')}>
            <textarea className={cx('field-sizing')} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ReactiveTextBox0;
