import { useEffect, useState } from 'react';
import clsx from 'clsx';
import {
  Box,
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
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { Auth } from 'aws-amplify';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { FaCopy, FaEye, FaEyeSlash } from 'react-icons/fa';
import { DateTimeFormatter } from '@/pages/authenticated/_components/DateTimeFormatter';
import { useApiTokenAPI, useUserAPI } from '@/backend/hook';
import { isBefore } from 'date-fns';
import { ApiTokenApiToken, UsersLoginEvent } from '@/api/generated';
import { toast } from 'react-toastify';
import { errorToastConfig, successToastConfig } from '@/config/toast';

export function SecurityTab() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { createApiToken, deleteApiToken } = useApiTokenAPI();
  const { getCurrentUser } = useUserAPI();

  const [apiTokenData, setApiTokenData] = useState<ApiTokenApiToken | null>(null);
  const [mfaData, setMfaData] = useState<string>('NOMFA');
  const [recentActivity, setRecentActivity] = useState<UsersLoginEvent[]>([]);

  const [activityExpanded, setActivityExpanded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [apiTokenDialogOpen, setApiTokenDialogOpen] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const [loadingState, setLoadingState] = useState({ apiToken: false });

  // TODO: Replace fetch request to API request after merging feature/#318-#319-api-key-security_improvement
  async function getToken() {
    setLoadingState({ ...loadingState, apiToken: true });
    try {
      const data = await axios.get('http://localhost:8080/api-token/status');

      setApiTokenData({ ...apiTokenData, api_token_expiration: data.data?.api_token_expiration });
    } catch (e: any) {
      toast(e.message ?? t('common.errors.common'), errorToastConfig);
    } finally {
      setLoadingState({ ...loadingState, apiToken: false });
    }
  }

  useEffect(() => {
    verifyMFAStatus();
    getToken();
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
    setLoadingState({ ...loadingState, apiToken: true });
    try {
      const tokenData = await createApiToken();

      setApiTokenData(tokenData as unknown as ApiTokenApiToken);

      setApiTokenDialogOpen(true);

      toast(t('settings.security.createSuccess'), successToastConfig);
    } catch (e: any) {
      toast(e.message ?? t('common.errors.common'), errorToastConfig);
    } finally {
      setLoadingState({ ...loadingState, apiToken: false });
    }
  };

  const onApiTokenDialogClose = () => {
    setApiTokenDialogOpen(false);
    setShowSecret(false);
  };

  const onTokenCopy = async () => {
    if (navigator.clipboard && apiTokenData?.api_token_secret) {
      try {
        await navigator.clipboard.writeText(apiTokenData?.api_token_secret);
        toast(t('settings.security.apiToken.copied'), successToastConfig);
      } catch (e: any) {
        toast(e.message ?? t('common.errors.common'), errorToastConfig);
      }
    } else {
      toast(t('common.errors.common'), errorToastConfig);
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
          {t('settings.security.apiToken.apiTokenStatus')}
        </h3>

        <div className={clsx('space-y-3')}>
          {loadingState.apiToken ? (
            <>
              <Skeleton variant="rectangular" height={35} width={300} animation="wave" />
              <Skeleton variant="rectangular" height={35} width={300} animation="wave" />
            </>
          ) : (
            <>
              {!apiTokenData ? (
                <Chip
                  label={t('settings.security.apiToken.notCreated')}
                  color="warning"
                  className={clsx('mb-2')}
                />
              ) : (
                <>
                  <div className={clsx('flex', 'items-center', 'gap-4')}>
                    <span className={clsx('text-gray-700', 'font-medium')}>
                      {t('settings.security.apiToken.status')}:
                    </span>
                    {apiTokenData?.api_token_expiration &&
                    !isBefore(new Date(apiTokenData.api_token_expiration), new Date()) ? (
                      <Chip
                        label={t('settings.security.apiToken.active')}
                        color="success"
                        size="medium"
                      />
                    ) : (
                      <Chip
                        label={t('settings.security.apiToken.expired')}
                        color="error"
                        size="medium"
                      />
                    )}
                  </div>

                  <div className={clsx('flex', 'items-center', 'gap-4')}>
                    <span className={clsx('text-gray-700', 'font-medium')}>
                      {t('settings.security.apiToken.expiresOn')}:
                    </span>
                    <span className={clsx('text-gray-600')}>
                      {DateTimeFormatter(t, i18n, apiTokenData?.api_token_expiration)}
                    </span>
                  </div>
                </>
              )}
            </>
          )}
          <Stack direction="row" gap={2} className={clsx('mt-4')}>
            <Button
              disabled={loadingState.apiToken}
              variant="outlined"
              color="primary"
              size="large"
              onClick={handleCreateApiToken}
            >
              {t('settings.security.apiToken.generateToken')}
            </Button>
            <Button
              disabled={!apiTokenData || loadingState.apiToken}
              variant="outlined"
              color="error"
              size="large"
              onClick={() => setDeleteDialogOpen(true)}
            >
              {t('settings.security.apiToken.deleteToken')}
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

      <Dialog open={apiTokenDialogOpen} onClose={onApiTokenDialogClose}>
        <DialogTitle>{t('settings.security.apiToken.createdTitle')}</DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('settings.security.apiToken.createdWarning')}
          </DialogContentText>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderRadius: 1,
              bgcolor: '#f5f5f5',
              fontFamily: 'monospace',
              fontSize: '0.95rem',
              wordBreak: 'break-all',
            }}
          >
            <span className={clsx('text-gray-600', 'font-mono', 'text-sm')}>
              {showSecret ? apiTokenData?.api_token_secret : '••••••••••••••••'}
            </span>
            <Stack direction="row" gap={2}>
              <button
                onClick={onTokenCopy}
                className={clsx(
                  'text-gray-500',
                  'hover:text-gray-700',
                  'transition-colors',
                  'cursor-pointer'
                )}
              >
                <FaCopy size={20} />
              </button>
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
            </Stack>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            {t('settings.security.apiToken.afterCloseInfo')}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={onApiTokenDialogClose} variant="contained" color="primary">
            {t('settings.security.apiToken.okButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
