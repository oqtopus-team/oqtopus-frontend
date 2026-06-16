import { cellBlockDiff, cellSize } from './constants';
import { RenderProps } from './Gates';

export default function Barrier({ targets, styles }: RenderProps) {
  const minRow = Math.min(...targets);
  const maxRow = Math.max(...targets);
  const height = maxRow - minRow + 1;
  const totalOffset = (height - 1) * cellSize;
  const baseHeight = cellSize + totalOffset - cellBlockDiff;

  const relativeRows = targets.map((t) => t - minRow);

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
        {Array.from({ length: height }).map((_, row) => (
          <line
            key={row}
            x1="20"
            y1={40 + cellSize * row}
            x2="20"
            y2={cellSize * row}
            stroke="black"
            strokeOpacity={relativeRows.includes(row) ? 0.6 : 0}
            strokeWidth="5"
          />
        ))}
      </svg>
    </div>
  );
}
