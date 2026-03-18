import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Card } from './Card';
import { Button } from './Button';
import { Divider } from './Divider';
import { Spacer } from './Spacer';
import dompurify from 'dompurify';

interface Props {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onHide: () => void;
}

export const ConfirmModal = ({ show, title, message, onConfirm, onHide }: Props) => {
  const { t } = useTranslation();
  const onClick = (): void => {
    onConfirm();
    onHide();
  };
  return (
    <div
      className={clsx(
        !show && '!hidden',
        ['!fixed', '!top-0', '!left-0', '!w-full', '!h-full', 'z-40'],
        ['flex', 'flex-col', 'items-center', 'justify-center'],
        ['bg-modal-bg', 'bg-opacity-50']
      )}
    >
      <Card className={clsx('max-w-[800px]', 'min-w-[400px]')}>
        <div className={clsx('flex', 'justify-between', 'items-center')}>
          <div className="text-xl">{title}</div>
          <Button onClick={onHide} className="!border-none">
            ✕
          </Button>
        </div>
        <Divider className="!my-[15px]" />
        <div className="text-sm">
          <p dangerouslySetInnerHTML={{ __html: dompurify.sanitize(message) }} />
        </div>
        <Spacer className="h-7" />
        <div className={clsx('flex', 'justify-end', 'gap-2')}>
          <Button color="secondary" onClick={onClick}>
            {t('common.modal.yes')}
          </Button>
          <Button onClick={onHide}>{t('common.modal.no')}</Button>
        </div>
      </Card>
    </div>
  );
};
