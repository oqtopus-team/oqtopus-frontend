import { useEffect, useState } from 'react';
import clsx from 'clsx';
import {
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
} from '@mui/material';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router';
import { DateTimeFormatter } from '@/pages/authenticated/_components/DateTimeFormatter';
import { useApiTokenAPI, useUserAPI } from '@/backend/hook';
import { isBefore } from 'date-fns';
import { ApiTokenApiToken, UsersLoginEvent } from '@/api/generated';
import { toast } from 'react-toastify';
import { errorToastConfig, successToastConfig } from '@/config/toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export function SecurityTab() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { getApiToken, createApiToken, deleteApiToken } = useApiTokenAPI();
  const { getCurrentUser } = useUserAPI();

  const [apiTokenData, setApiTokenData] = useState<ApiTokenApiToken | null>(null);
  const [mfaData, setMfaData] = useState<string>('NOMFA');
  const [recentActivity, setRecentActivity] = useState<UsersLoginEvent[]>([]);

  const [activityExpanded, setActivityExpanded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showSecret, setShowSecret] = useState<boolean>(false);

  useEffect(() => {
    verifyMFAStatus();
    getApiToken().then((res) => setApiTokenData(res as unknown as ApiTokenApiToken));
    getCurrentUser().then((res) => {
      if (res?.login_events) {
        setRecentActivity(res.login_events);
      }
    });
  }, []);

  async function verifyMFAStatus() {
    const user = await Auth.currentAuthenticatedUser();
    setMfaData(await Auth.getPreferredMFA(user));
  }

  const handleResetMFA = async () => {
    navigate('/mfa-reset');
  };

  const handleDeleteApiToken = async () => {
    try {
      await deleteApiToken();
      setApiTokenData(null);
      toast(t('settings.security.deleteSuccess'), successToastConfig);
    } catch (e: any) {
      toast(e.message ?? t('common.errors.common'), errorToastConfig);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleCreateApiToken = async () => {
    try {
      const tokenData = await createApiToken();

      setApiTokenData(tokenData as unknown as ApiTokenApiToken);

      toast(t('settings.security.createSuccess'), successToastConfig);
    } catch (e: any) {
      toast(e.message ?? t('common.errors.common'), errorToastConfig);
    }
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
            label={
              mfaData !== 'NOMFA'
                ? `${t('settings.security.enabled')} (${mfaData})`
                : t('settings.security.disabled')
            }
            color={mfaData ? 'success' : 'default'}
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
          disabled={!mfaData}
        >
          {t('settings.security.resetMfaButton')}
        </Button>
      </div>
      <hr className={clsx('border-gray-200')} />
      <div>
        <div
          className={clsx('flex', 'items-center', 'justify-between', 'mb-4', 'cursor-pointer')}
          onClick={() => setActivityExpanded(!activityExpanded)}
        >
          <h3 className={clsx('text-xl', 'font-semibold')}>
            {t('settings.security.recentLoginActivity')}
          </h3>
          <IconButton>{activityExpanded ? <MdExpandLess /> : <MdExpandMore />}</IconButton>
        </div>

        <Collapse in={activityExpanded}>
          <div className={clsx('bg-gray-50', 'rounded-lg', 'p-4')}>
            <List>
              {recentActivity.map((activity, index) => (
                <ListItem
                  key={activity.event_date}
                  className={clsx(
                    'border-b',
                    'border-gray-200',
                    index === recentActivity.length - 1 && 'border-b-0'
                  )}
                  divider={index !== recentActivity.length - 1}
                >
                  <ListItemText
                    primary={
                      <span className={clsx('flex', 'justify-between', 'items-start')}>
                        <span className={clsx('font-medium')}>{t('settings.security.login')}</span>
                        <span className={clsx('text-sm', 'text-gray-500')}>
                          {DateTimeFormatter(t, i18n, activity.event_date)}
                        </span>
                      </span>
                    }
                    secondary={
                      <span className={clsx('mt-1', 'text-sm', 'space-y-1')}>
                        <span
                          className="block max-w-[200px] truncate"
                          title={activity.user_agent}
                          style={{ maxWidth: '200px' }}
                        >
                          {t('settings.security.device')}: {activity.user_agent}
                        </span>
                        <span className={clsx('text-gray-600')}>
                          {t('settings.security.ipAddress')}: {activity.ip}
                        </span>
                      </span>
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
          {!apiTokenData ? (
            <Chip
              label={t('settings.security.notCreated')}
              color="warning"
              className={clsx('mb-2')}
            />
          ) : (
            <>
              <div className={clsx('flex', 'items-center', 'gap-4')}>
                <span className={clsx('text-gray-700', 'font-medium')}>
                  {t('settings.security.status')}:
                </span>
                {apiTokenData?.api_token_expiration &&
                !isBefore(new Date(apiTokenData.api_token_expiration), new Date()) ? (
                  <Chip label={t('settings.security.active')} color="success" size="medium" />
                ) : (
                  <Chip label={t('settings.security.expired')} color="error" size="medium" />
                )}
              </div>

              <div className={clsx('flex', 'items-center', 'gap-4')}>
                <span className={clsx('text-gray-700', 'font-medium')}>
                  {t('settings.security.apiSecret')}:
                </span>
                <div className={clsx('flex', 'items-center', 'gap-2')}>
                  <span className={clsx('text-gray-600', 'font-mono', 'text-sm')}>
                    {showSecret ? apiTokenData?.api_token_secret : '••••••••••••••••'}
                  </span>
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className={clsx(
                      'text-gray-500',
                      'hover:text-gray-700',
                      'transition-colors',
                      'cursor-pointer'
                    )}
                    aria-label={showSecret ? 'Hide secret' : 'Show secret'}
                  >
                    {showSecret ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
              </div>

              <div className={clsx('flex', 'items-center', 'gap-4')}>
                <span className={clsx('text-gray-700', 'font-medium')}>
                  {t('settings.security.expiresOn')}:
                </span>
                <span className={clsx('text-gray-600')}>
                  {DateTimeFormatter(t, i18n, apiTokenData?.api_token_expiration)}
                </span>
              </div>
            </>
          )}

          <Stack direction="row" gap={2} className={clsx('mt-4')}>
            <Button variant="outlined" color="primary" size="large" onClick={handleCreateApiToken}>
              {t('settings.security.regenerateKey')}
            </Button>
            <Button
              disabled={!apiTokenData}
              variant="outlined"
              color="error"
              size="large"
              onClick={() => setDeleteDialogOpen(true)}
            >
              {t('settings.security.deleteKey')}
            </Button>
          </Stack>
        </div>
      </div>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('settings.security.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('settings.security.deleteConfirmMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            {t('settings.cancel')}
          </Button>
          <Button onClick={handleDeleteApiToken} color="error" variant="contained">
            {t('settings.security.confirmDeleteButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
