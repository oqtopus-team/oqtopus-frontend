import clsx from 'clsx';

export const Chip = ({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) => {
  if (label !== undefined) {
    return (
      <div className={clsx('flex', 'gap-1', 'items-center', className)}>
        <p>{label}: </p>
        <div className={clsx('bg-gray-bg', 'px-3', 'py-[2px]', 'rounded-full', 'w-min')}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('bg-gray-bg', 'px-3', 'py-[2px]', 'rounded-full', 'w-min', className)}>
      {children}
    </div>
  );
};
