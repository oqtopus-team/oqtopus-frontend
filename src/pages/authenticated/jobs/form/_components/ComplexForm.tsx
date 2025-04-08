import { Input } from '@/pages/_components/Input';
import clsx from 'clsx';

export const ComplexForm = ({
  label,
  curr,
  set,
  error,
}: {
  label?: string;
  curr: [string, string];
  set: (_: [string, string]) => void;
  error: [string | undefined, string | undefined];
}) => {
  return (
    <div className={clsx('grid', 'gap-1')}>
      {label && <p className="text-xs">{label}</p>}
      <div className={clsx('flex', 'gap-1', 'items-start')}>
        <Input
          value={curr[0]}
          type="number"
          onChange={(e) => {
            set([e.target.value, curr[1]]);
          }}
          errorMessage={error[0]}
        />
        <p className={clsx('whitespace-nowrap', 'h-8', 'flex', 'items-center')}>
          <span>+ i</span>
        </p>
        <Input
          value={curr[1]}
          type="number"
          onChange={(e) => {
            set([curr[0], e.target.value]);
          }}
          errorMessage={error[1]}
        />
      </div>
    </div>
  );
};
