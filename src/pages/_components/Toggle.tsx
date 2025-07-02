import clsx from 'clsx';

export const Toggle = ({
  label,
  labelLeft,
  checked,
  onChange,
  name
}: {
  label?: string;
  labelLeft?: string;
  name?: string;
  checked: boolean;
  onChange: (_: boolean) => void;
}) => {
  return (
    <label className={clsx('flex', 'gap-2', 'items-center', 'cursor-pointer')}>
      {labelLeft && <span className={clsx('text-sm')}>{labelLeft}</span>}
      <input
        type="checkbox"
        name={name ?? label}
        className={clsx('sr-only', 'peer')}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className={clsx(
          ['relative', 'w-11', 'h-6'],
          'peer',
          ['peer-focus:outline-none', 'peer-focus:ring-2', 'peer-focus:ring-primary'],
          ['rounded-full', 'bg-neutral-content', 'peer-checked:bg-primary'],
          [
            ['after:h-5', 'after:w-5', "after:content-['']"],
            ['after:absolute', 'after:top-[2px]', 'after:start-[2px]'],
            ['after:border', 'after:rounded-full', 'after:transition-all'],
            ['peer-checked:after:translate-x-full', 'rtl:peer-checked:after:-translate-x-full'],
            [
              'after:bg-primary-content',
              'after:border-neutral-content',
              'peer-checked:after:border-neutral-content',
            ],
          ]
        )}
      />
      {label && <span className={clsx('text-sm')}>{label}</span>}
    </label>
  );
};
