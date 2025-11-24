import clsx from 'clsx';
import { Tab, Tabs } from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileTab } from './ProfileTab';
import { AccountTab } from './AccountTab';
import { SecurityTab } from './SecurityTab';

export function SettingsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!params.tabId) {
      navigate('profile', { replace: true });
    }
  }, [params, navigate]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(`../settings/${newValue}`);
  };

  return (
    <div className={clsx('p-6')}>
      <div className={clsx('flex', 'justify-between', 'items-center', 'mb-6')}>
        <h2 className={clsx('text-primary', 'text-2xl', 'font-bold')}>{t('settings.title')}</h2>
      </div>

      <Tabs value={params.tabId} onChange={handleTabChange} className={clsx('mb-6')}>
        <Tab value="profile" label={t('settings.tabs.profile')} />
        <Tab value="account" label={t('settings.tabs.account')} />
        <Tab value="security" label={t('settings.tabs.security')} />
      </Tabs>
      <div className={clsx('mt-6')}>
        {params.tabId === 'profile' && <ProfileTab />}
        {params.tabId === 'account' && <AccountTab />}
        {params.tabId === 'security' && <SecurityTab />}
      </div>
    </div>
  );
}
