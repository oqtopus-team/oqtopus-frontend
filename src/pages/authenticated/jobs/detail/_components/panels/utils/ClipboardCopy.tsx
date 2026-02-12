import React, { useState } from 'react';
import clsx from 'clsx';
import { BsCopy } from "react-icons/bs";
import { useTranslation } from 'react-i18next';

export interface ClipboardCopyProps {
  text: string;
}

const ClipboardCopy: React.FC<ClipboardCopyProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const handleCopy = async () => {
    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('failed to copy:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy"
      className={clsx('flex', 'items-center')}
      data-toggle="tooltip"
      data-placement="top"
      tabIndex={0}
      title={t('job.detail.text.copy_tooltip')}
    >
      {!copied ? (
        <BsCopy className={clsx(['w-4', 'h-4'], ['absolute', 'right-1', 'top-1'])} />
      ) : (
        <div className={clsx(['w-4', 'h-4'], ['absolute', 'right-1', 'top-1'])}>
          <span
            className={clsx(
              'absolute',
              'top-1/2',
              'right-full',
              '-translate-y-1/2',
              'transform',
              'px-1',
              'rounded',
              'text-base-content',
              'whitespace-nowrap',
              'text-xs'
            )}
          >
            {t('job.detail.text.copied')}
          </span>
          <img src={'/img/common/check_mark.svg'} />
        </div>
      )}
    </button>
  );
};

export default ClipboardCopy;
