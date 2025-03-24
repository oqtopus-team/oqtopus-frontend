import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BsCheckCircle, BsExclamationCircleFill, BsInfoCircle, BsXLg } from 'react-icons/bs';

type NotificationProps = {
  message: string;
  variation: 'info' | 'error' | 'success';
  close: () => void;
};

const ICON_SIZE = 20;

export default function Notification({ message, variation, close }: NotificationProps) {
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    notificationRef.current?.animate(
      [{ transform: 'translate(-50%, -3rem)' }, { transform: 'translate(-50%, 0%)' }],
      { duration: 200, iterations: 1, easing: 'ease' }
    );
  }, []);

  return createPortal(
    <div
      ref={notificationRef}
      className={clsx(
        ['fixed', 'inset-x-1/2', 'top-14', 'translate-x-[-50%]'],
        'z-50',
        ['flex', 'gap-[0.25rem]'],
        'w-[45vw]',
        'bg-[#fff]',
        'p-[0.75rem]',
        'rounded-lg',
        'shadow-[0px_4px_10px_0px_rgba(0,0,0,0.25)]'
      )}
    >
      {variation === 'info' && (
        <BsInfoCircle
          className={clsx('text-info-base-content')}
          style={{ minWidth: ICON_SIZE }}
          size={ICON_SIZE}
        />
      )}
      {variation === 'error' && (
        <BsExclamationCircleFill
          className={clsx('text-error-base-content')}
          style={{ minWidth: ICON_SIZE }}
          size={ICON_SIZE}
        />
      )}
      {variation === 'success' && (
        <BsCheckCircle
          className={clsx('text-success-base-content')}
          style={{ minWidth: ICON_SIZE }}
          size={ICON_SIZE}
        />
      )}
      <span style={{ lineHeight: `${ICON_SIZE}px` }}>{message}</span>
      <BsXLg
        style={{ minWidth: ICON_SIZE, marginLeft: 'auto', cursor: 'pointer' }}
        onClick={close}
      />
    </div>,
    document.body
  );
}
