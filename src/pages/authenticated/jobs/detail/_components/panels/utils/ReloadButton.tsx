import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const ReloadTitle: React.FC = () => {
  const { t } = useTranslation();

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <h2 onClick={handleReload}>
      <div className={clsx('flex', 'flex-wrap', 'gap-2', 'justify-between')}>
        <div
          title={t('job.detail.reload')}
          className={clsx(
            'ml-2',
            'bg-primary',
            'rounded-md',
            'overflow-hidden',
            'p-1',
            'cursor-pointer'
          )}
        >
          <img src="/img/common/reload.svg" alt="Reload Icon" width={16} />
        </div>
      </div>
    </h2>
  );
};

export default ReloadTitle;
