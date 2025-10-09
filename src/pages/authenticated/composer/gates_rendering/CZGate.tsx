import { ReactElement } from 'react';
import { GateColor, RenderProps } from './Gates';
import { cellBlockDiff, cellSize, gateBlockSize } from './constants';

export default function CZGate(props: RenderProps): ReactElement {
  const gateColor = GateColor.GATE_CONTROLLED;
  const { targets, controls, styles, isSettingControl } = props;
  const target = targets[0];
  const control = controls[0];

  const height = Math.abs(target - control) + 1;

  const cellMiddle = gateBlockSize / 2;
  const totalOffset = cellSize * (height - 1);
  const baseHeight = cellSize * height - cellBlockDiff;

  const controlHigherThanTarget = control > target;

  return (
    <div
      className={styles}
      style={{
        display: 'block',
        position: 'absolute',
        maxHeight: baseHeight,
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <svg
        width="40"
        height={baseHeight}
        viewBox={`0 0 40 ${baseHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="20"
          y1={cellMiddle + totalOffset}
          x2="20"
          y2={cellMiddle}
          stroke={gateColor}
          strokeWidth="4"
          style={{ opacity: isSettingControl ? '0.5' : '1' }}
        />
        <circle
          cx="20"
          cy={cellMiddle}
          r="8"
          fill={gateColor}
          style={{ opacity: isSettingControl && !controlHigherThanTarget ? '0.5' : '1' }}
        />
        <circle
          cx="20"
          cy={cellMiddle + totalOffset}
          r="8"
          fill={gateColor}
          style={{ opacity: isSettingControl && controlHigherThanTarget ? '0.5' : '1' }}
        />
      </svg>
    </div>
  );
}
