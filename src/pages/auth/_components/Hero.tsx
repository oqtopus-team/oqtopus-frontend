import ENV from '@/env';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export const Hero = (): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <div
      className={clsx(
        ["bg-[url('/img/common/mv_bg.png')]", 'bg-center', 'bg-cover'],
        ['py-9', 'px-10'],
        ['text-primary-content', 'text-center']
      )}
    >
      <h2 className={clsx('text-3xl', 'font-bold', 'leading-normal')}>
        {t('app.name.oqtopus')}
      </h2>
    </div>
  );
};
