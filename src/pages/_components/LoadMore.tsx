import clsx from 'clsx';

export const LoadMore = ({
  children,
  onClick,
}: React.PropsWithChildren<{ onClick: () => void }>): React.ReactElement => (
  <button
    type="button"
    className={clsx(
      'flex',
      'h-12',
      'w-full',
      'cursor-pointer',
      'items-center',
      'justify-center',
      'text-sm',
      'text-info'
    )}
    onClick={onClick}
  >
    {children}
  </button>
);
