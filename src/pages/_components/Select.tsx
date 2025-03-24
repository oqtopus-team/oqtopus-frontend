import clsx from 'clsx';
import { HTMLProps } from 'react';

export const Select = ({
  children,
  label,
  labelLeft,
  className,
  errorMessage,
  size = 'md',
  ...props
}: React.PropsWithChildren & {
  label?: string;
  labelLeft?: string;
  errorMessage?: string;
  size?: 'xs' | 'md';
} & Omit<HTMLProps<HTMLSelectElement>, 'size'>) => {
  return (
    <div className={clsx('flex', 'items-center', 'gap-2')}>
      {labelLeft && <p className="text-xs">{labelLeft}</p>}
      <div className={clsx('grid', 'gap-1')}>
        {label && <p className="text-xs">{label}</p>}
        <select
          className={clsx(
            'w-full',
            ['border', 'focus:border-primary', 'rounded', size == 'md' ? 'p-2' : 'p-1'],
            ['focus:text-primary', 'focus:outline-primary', 'text-xs'],
            errorMessage && ['!border-error', '!outline-error'],
            className
          )}
          {...props}
        >
          {children}
        </select>
        {errorMessage && (
          <p className={clsx('text-xs', 'text-error', 'font-semibold')}>{errorMessage}</p>
        )}
      </div>
    </div>
  );
};
