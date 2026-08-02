import { useScrollInfo, useViewportSize } from '@/context/viewportContext';
import { type RefObject, useLayoutEffect, useRef, useState } from 'react';
import { deepCompare } from '@/service/util';
type PositionKey = 'left' | 'top' | 'right' | 'bottom';
export type PositionStyleType = Partial<Record<PositionKey, string | number>>;
const OppositePositionKeys = {
  left: 'right',
  top: 'bottom',
  right: 'left',
  bottom: 'top',
} as const;

const useStyleInsideViewport = (
  rootRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<HTMLElement | null>,
  positionStyle?: PositionStyleType,
  positionType: 'relative' | 'absolute' = 'relative',
  needUpdate = true,
) => {
  const { top: vt, left: vl } = useScrollInfo();
  const { width: vw, height: vh } = useViewportSize();
  const stored = useRef({});
  const [style, setStyle] = useState<PositionStyleType | undefined>(undefined);
  useLayoutEffect(() => {
    // 처음 렌더링 시에는 화면에 타깃 요소를 그리지 않은 상태에서
    // useLayoutEffect 내부를 실행하여 계산하고, 두 번째 렌더링 시에 재조정이 끝난 상태로 화면에 그립니다.
    // 이를 통해 사용자는 위치 재조정을 마친 최종 결과만을 보게 됩니다.
    console.log('실행');
    const newInfo = { vt, vl, vw, vh };
    if (
      !needUpdate ||
      !rootRef.current ||
      !targetRef.current ||
      deepCompare(newInfo, stored.current)
    )
      return;
    stored.current = newInfo;
    const rootRect = rootRef.current.getBoundingClientRect();
    const targetRect = targetRef.current.getBoundingClientRect();

    // 루트 요소의 우측 좌표와 타깃 요소의 넓이를 더한 값이 viewport의 넓이를 넘지 않으면 오른쪽에
    // 위치하도록 left를 적용하고, 그렇지 않으면 왼쪽에 위치하도록 right를 적용합니다.

    const horizontal =
      rootRect.right + targetRect.width < vw ? 'left' : 'right';

    // 루트 요소의 하단 좌표와 타깃 요소의 높이를 더한 값이 viewport의 높이를 넘지 않으면 하단에
    // 위치하도록 top을 적용하고, 그렇지 않으면 상단에 위치하도록 bottom을 적용합니다.
    const vertical =
      rootRect.bottom + targetRect.height < vh ? 'top' : 'bottom'; // 3

    const oppositeHorizontal = OppositePositionKeys[horizontal];
    const oppositeVertical = OppositePositionKeys[vertical];

    if (positionType === 'relative') {
      setStyle({
        [horizontal]:
          positionStyle && horizontal in positionStyle
            ? positionStyle[horizontal]
            : '100%',
        [vertical]:
          positionStyle && vertical in positionStyle
            ? positionStyle[vertical]
            : '100%',
        [oppositeHorizontal]: 'auto',
        [oppositeVertical]: 'auto',
      });
    } else {
      setStyle({
        // top 및 left의 절대 좌표의 방향은 양수를 나타내므로 그대로 반영한 반면, bottom 및
        // right의 절대 좌표의 방향은 음수를 띄므로 계산식 결과에 -1을 곱한 결과를 반영했습니다.
        [horizontal]:
          Number(positionStyle?.[horizontal] || 0) +
          (horizontal === 'left'
            ? vl + rootRect.left
            : -1 * (vl + rootRect.right - vw)),
        [vertical]:
          Number(positionStyle?.[vertical] || 0) +
          (vertical === 'top'
            ? vt + rootRect.top
            : -1 * (vt + rootRect.bottom - vh)),
        [oppositeHorizontal]: 'auto',
        [oppositeVertical]: 'auto',
      });
    }
  }, [rootRef, targetRef, vt, vl, vw, vh]);
  return style;
};
export default useStyleInsideViewport;
