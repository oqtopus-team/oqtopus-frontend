import clsx from 'clsx';
import { Loader } from './Loader';
import { NavLink } from 'react-router';

const STYLE = {
  color: {
    default: ['border'],
    secondary: ['bg-secondary', 'text-secondary-content'],
    disabled: ['bg-disable-bg', 'text-disable-content'],
    error: ['bg-error', 'text-error-content'],
  },
  size: {
    default: ['py-2', 'px-4', 'text-sm'],
    small: ['py-1', 'px-2', 'text-xs'],
  },
};

export const Button = ({
  className,
  children,
  color = 'default',
  size = 'default',
  ...props
}: (
  | ({ kind?: 'button'; loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  | { kind: 'link'; href: string }
) & {
  className?: string;
  children?: React.ReactNode;
  color?: 'default' | 'secondary' | 'disabled' | 'error';
  size?: 'default' | 'small';
}) => {
  if (props.kind === 'link') {
    return (
      <NavLink
        to={props.href}
        className={clsx(
          ['font-bold', 'rounded', 'select-none'],
          [
            color === 'error' && STYLE.color.error,
            color === 'disabled' && STYLE.color.disabled,
            color === 'secondary' && STYLE.color.secondary,
            color === 'default' && STYLE.color.default,
          ],
          [size === 'small' && STYLE.size.small, size === 'default' && STYLE.size.default],
          className
        )}
      >
        {children}
      </NavLink>
    );
  }

  //* NOTE
  //* `{...props}` 使用時の `Received "true" for a non-boolean attribute` エラー対策
  const loading = props.loading;
  delete props.loading;

  return (
    <button
      {...props}
      className={clsx(
        ['font-bold', 'rounded', 'select-none'],
        [
          color === 'error' && STYLE.color.error,
          color === 'disabled' && STYLE.color.disabled,
          color === 'secondary' && STYLE.color.secondary,
          color === 'default' && STYLE.color.default,
        ],
        [size === 'small' && STYLE.size.small, size === 'default' && STYLE.size.default],
        className
      )}
    >
      <div className={clsx('flex', 'items-center', 'gap-2')}>
        {loading && <Loader />}
        <div className={clsx('whitespace-nowrap')}>{children}</div>
      </div>
    </button>
  );
};
