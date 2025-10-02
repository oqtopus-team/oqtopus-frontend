import clsx from 'clsx';
import { paramNameGenerator } from '../custom_gates';
import { GateColor, RenderProps } from './Gates';

const cellSize = 64;
const gateBlockSize = 40;
const diff = cellSize - gateBlockSize;

export default function CustomGate({ targets, customTag, styles }: RenderProps) {
  if (!customTag) return null;

  const minRow = Math.min(...targets);
  const maxRow = Math.max(...targets);
  const height = maxRow - minRow + 1;

  const generateParamName = paramNameGenerator();
  const rows: string[] = Array.from<string>({ length: height }).fill('');

  for (const target of targets) {
    rows[target - minRow] = generateParamName.next().value;
  }

  return (
    <div
      className={styles}
      style={{
        height: height * cellSize - diff,
        backgroundColor: GateColor.GATE_CUSTOM,
        borderRadius: '0.25rem',
        padding: '0px 2px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <section
        style={{
          width: '10px',
          fontSize: 'x-small',
        }}
      >
        {rows.map((r, i) => (
          <span
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: cellSize,
            }}
          >
            {r}
          </span>
        ))}
      </section>
      <span
        style={{
          fontSize: '0.8rem',
        }}
      >
        {customTag}
      </span>
    </div>
  );
}
