import { useState } from 'react';
import clsx from 'clsx';
import { Button, Chip, Collapse, IconButton, List, ListItem, ListItemText } from '@mui/material';
import { MdExpandLess, MdExpandMore  } from "react-icons/md";
import { useTranslation } from 'react-i18next';


interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  ip: string;
  device: string;
  location: string;
}

export function SecurityTab() {
  const { t } = useTranslation();

  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [apiKeyExpiry, setApiKeyExpiry] = useState('2025-12-31');

  // Mock activity data
  const [recentActivity] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'Login',
      timestamp: '2024-11-24 10:30:00',
      ip: '192.168.1.1',
      device: 'Chrome on Windows',
      location: 'Pabianice, Poland',
    },
    {
      id: '2',
      action: 'Password changed',
      timestamp: '2024-11-23 14:22:00',
      ip: '192.168.1.1',
      device: 'Chrome on Windows',
      location: 'Pabianice, Poland',
    },
    {
      id: '3',
      action: 'Login',
      timestamp: '2024-11-23 09:15:00',
      ip: '192.168.1.50',
      device: 'Safari on iPhone',
      location: 'Pabianice, Poland',
    },
    {
      id: '4',
      action: 'API Key generated',
      timestamp: '2024-11-20 16:45:00',
      ip: '192.168.1.1',
      device: 'Chrome on Windows',
      location: 'Pabianice, Poland',
    },
    {
      id: '5',
      action: 'Login',
      timestamp: '2024-11-20 08:00:00',
      ip: '192.168.1.1',
      device: 'Chrome on Windows',
      location: 'Pabianice, Poland',
    },
  ]);

  const handleResetMFA = async () => {
    setIsResetLoading(true);

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMfaEnabled(false);
    setIsResetLoading(false);

    alert(t('settings.security.mfaResetSuccess'));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-EN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={clsx('max-w-3xl', 'space-y-8')}>
      <div>
        <h3 className={clsx('text-xl', 'font-semibold', 'mb-4')}>
          {t('settings.security.mfaStatus')}
        </h3>

        <div className={clsx('flex', 'items-center', 'gap-4')}>
          <span className={clsx('text-gray-700')}>{t('settings.security.multiFactorAuth')}:</span>
          <Chip
            label={mfaEnabled ? t('settings.security.enabled') : t('settings.security.disabled')}
            color={mfaEnabled ? 'success' : 'default'}
            size="medium"
          />
        </div>
      </div>

      <hr className={clsx('border-gray-200')} />

      <div>
        <h3 className={clsx('text-xl', 'font-semibold', 'mb-4')}>
          {t('settings.security.resetMfa')}
        </h3>

        <p className={clsx('text-gray-600', 'mb-4')}>
          {t('settings.security.resetMfaDescription')}
        </p>

        <Button
          variant="outlined"
          color="warning"
          size="large"
          onClick={handleResetMFA}
          disabled={isResetLoading || !mfaEnabled}
        >
          {isResetLoading ? t('settings.resetting') : t('settings.security.resetMfaButton')}
        </Button>
      </div>

      <hr className={clsx('border-gray-200')} />

      <div>
        <div
          className={clsx('flex', 'items-center', 'justify-between', 'mb-4', 'cursor-pointer')}
          onClick={() => setActivityExpanded(!activityExpanded)}
        >
          <h3 className={clsx('text-xl', 'font-semibold')}>
            {t('settings.security.recentActivity')}
          </h3>
          <IconButton>{activityExpanded ? <MdExpandLess /> : <MdExpandMore />}</IconButton>
        </div>

        <Collapse in={activityExpanded}>
          <div className={clsx('bg-gray-50', 'rounded-lg', 'p-4')}>
            <List>
              {recentActivity.map((activity, index) => (
                <ListItem
                  key={activity.id}
                  className={clsx(
                    'border-b',
                    'border-gray-200',
                    index === recentActivity.length - 1 && 'border-b-0'
                  )}
                  divider={index !== recentActivity.length - 1}
                >
                  <ListItemText
                    primary={
                      <div className={clsx('flex', 'justify-between', 'items-start')}>
                        <span className={clsx('font-medium')}>{activity.action}</span>
                        <span className={clsx('text-sm', 'text-gray-500')}>
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                    }
                    secondary={
                      <div className={clsx('mt-1', 'text-sm', 'space-y-1')}>
                        <div>
                          <span className={clsx('text-gray-600')}>
                            {t('settings.security.device')}: {activity.device}
                          </span>
                        </div>
                        <div>
                          <span className={clsx('text-gray-600')}>
                            {t('settings.security.ipAddress')}: {activity.ip}
                          </span>
                        </div>
                        <div>
                          <span className={clsx('text-gray-600')}>
                            {t('settings.security.location')}: {activity.location}
                          </span>
                        </div>
                      </div>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </div>
        </Collapse>
      </div>

      <hr className={clsx('border-gray-200')} />

      <div>
        <h3 className={clsx('text-xl', 'font-semibold', 'mb-4')}>
          {t('settings.security.apiKeyStatus')}
        </h3>

        <div className={clsx('space-y-3')}>
          <div className={clsx('flex', 'items-center', 'gap-4')}>
            <span className={clsx('text-gray-700', 'font-medium')}>
              {t('settings.security.status')}:
            </span>
            <Chip label={t('settings.security.active')} color="success" size="medium" />
          </div>

          <div className={clsx('flex', 'items-center', 'gap-4')}>
            <span className={clsx('text-gray-700', 'font-medium')}>
              {t('settings.security.expiresOn')}:
            </span>
            <span className={clsx('text-gray-600')}>
              {new Date(apiKeyExpiry).toLocaleDateString('en-EN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className={clsx('mt-4')}>
            <Button variant="outlined" color="primary" size="large">
              {t('settings.security.regenerateKey')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
