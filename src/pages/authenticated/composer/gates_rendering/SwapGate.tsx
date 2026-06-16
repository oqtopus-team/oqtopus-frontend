import { cellBlockDiff, cellSize, gateBlockSize } from './constants';
import { GateColor, RenderProps } from './Gates';

export default function SwapGate({ targets, styles }: RenderProps) {
  const gateColor = GateColor.GATE_CONTROLLED;

  const height = Math.abs(targets[1] - targets[0]) + 1;
  const cellMiddle = gateBlockSize / 2;
  const totalOffset = cellSize * (height - 1);
  const baseHeight = cellSize * height - cellBlockDiff;

  const y1 = cellMiddle;
  const y2 = y1 + totalOffset;

  return (
    <div
      className={styles}
      style={{ display: 'block', position: 'relative', maxHeight: baseHeight }}
    >
      <svg
        width="40"
        height={baseHeight}
        viewBox={`0 0 40 ${baseHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="20" y1={y1} x2="20" y2={y2} stroke={gateColor} strokeWidth="4" />
        <path
          fill="none"
          d={`M12.25 ${y1 - 7.5} 27.75 ${y1 + 7.5} M27.75 ${y1 - 7.5} 12.25 ${y1 + 7.5}`}
          stroke={gateColor}
          strokeWidth="4"
        />
        <path
          fill="none"
          d={`M12.25 ${y2 - 7.5} 27.75 ${y2 + 7.5} M27.75 ${y2 - 7.5} 12.25 ${y2 + 7.5}`}
          stroke={gateColor}
          strokeWidth="4"
        />
      </svg>
    </div>
  );
}
