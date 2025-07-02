import clsx from 'clsx';

export const Footer = ({
  isAbsolute,
  className,
}: {
  isAbsolute: boolean;
  className?: string;
}): React.ReactElement => {
  return (
    <footer
      className={clsx(
        ['w-full', 'py-4', 'px-[30px]'],
        isAbsolute && ['absolute', 'bottom-0', 'left-0'],
        className
      )}
    >
      <div className={clsx('text-primary', 'text-right', 'text-2xs')}>
        &copy; OQTOPUS Team. All rights reserved.
      </div>
    </footer>
  );
};
