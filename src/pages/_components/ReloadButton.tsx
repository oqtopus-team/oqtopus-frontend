import clsx from 'clsx';

export const ReloadButton = ({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}): React.ReactElement => (
  <button
    type="button"
    title={title}
    aria-label={title}
    className={clsx('ml-2', 'overflow-hidden', 'rounded-md', 'bg-primary', 'p-1', 'cursor-pointer')}
    onClick={onClick}
  >
    <img src="/static_assets/img/common/reload.svg" alt="" width={16} />
  </button>
);
