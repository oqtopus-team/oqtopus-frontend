import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  duration?: number;
  onClose?: () => void;
}

const ANIMATION_DURATION: number = 300; // Animation duration for the fade-out effect
const ANIMATION_DELAY: number = 50; // Delay before the notification appears
const NOTIFICATION_DURATION: number = 3000; // Duration for how long the notification is visible

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  duration = NOTIFICATION_DURATION,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const appearTimer = setTimeout(() => {
      setVisible(true);
    }, ANIMATION_DELAY);

    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onClose?.();
      }, ANIMATION_DURATION);
    }, duration + ANIMATION_DELAY);

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
