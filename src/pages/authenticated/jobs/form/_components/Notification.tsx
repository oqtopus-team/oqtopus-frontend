import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  duration?: number;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const appearTimer = setTimeout(() => {
      setVisible(true);
    }, 50);

    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300);
    }, duration + 50);

    return () => {
      clearTimeout(appearTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      className={clsx(
        'fixed top right-5 transform transition-transform duration-300 z-50 min-w-1/4 p-4 rounded shadow text-primary-content',
        {
          'translate-x-0': visible,
          'translate-x-full': !visible,
          'right-5': visible,
          'bg-success': type === 'success',
          'bg-error': type === 'error',
        }
      )}
    >
      {message}
    </div>
  );
};

export default Notification;
