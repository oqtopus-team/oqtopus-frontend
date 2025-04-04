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
      <img src="/img/common/reload.svg" alt="Reload Icon" className="ml-2" width={24} height={24} />
    </h2>
  );
};

export default ReloadTitle;
