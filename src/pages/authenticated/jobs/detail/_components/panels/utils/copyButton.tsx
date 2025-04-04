import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { useState } from 'react';
import { Button } from '@/pages/_components/Button';

type CopyTextProps = {
  text?: string;
};

const CopyButton: React.FC<CopyTextProps> = ({ text }) => {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(false);

  const handleCopy = async () => {
    if (text) {
      navigator.clipboard.writeText(text).catch((e) => console.error(e));
    }
    setIsActive(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsActive(false);
  };
  return text == null || text === '' ? (
    <div className={clsx('text-xs')}>{t('job.detail.transpiled_program.nodata')}</div>
  ) : (
    <Button
      id="copy-button"
      onClick={handleCopy}
      color="secondary"
      size="small"
      className={clsx('tooltip-primary', isActive && 'is-active')}
      data-tooltip={t('job.detail.text.copied')}
    >
      {t('job.detail.text.copy_button')}
    </Button>
  );
};

export default CopyButton;
