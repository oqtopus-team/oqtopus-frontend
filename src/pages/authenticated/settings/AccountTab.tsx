import { useState } from 'react';
import { Auth } from 'aws-amplify';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { errorToastConfig, successToastConfig } from '@/config/toast';
import { useUserAPI } from '@/backend/hook';
import { useAuth } from '@/auth/hook';

interface AccountTabFormData {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

const defaultFormValues: AccountTabFormData = {
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
};

const validationRules = (t: (key: string) => string): yup.ObjectSchema<AccountTabFormData> =>
  yup.object({
    currentPassword: yup.string().required(),
    newPassword: yup
      .string()
      .required(t('signup.form.error_message.password_enter'))
      .matches(/(?=.*[a-z])/, t('signup.form.error_message.password_lowercase'))
      .matches(/(?=.*[A-Z])/, t('signup.form.error_message.password_uppercase'))
      .matches(/(?=.*[0-9])/, t('signup.form.error_message.password_number'))
      .matches(/(?=.*[!-/:-@[-`{-~])/, t('signup.form.error_message.password_special'))
      .min(12, t('signup.form.error_message.password_min')),
    newPasswordConfirm: yup
      .string()
      .required(t('signup.form.error_message.confirm_password_enter'))
      .oneOf([yup.ref('newPassword')], t('signup.form.error_message.confirm_password_mismatch')),
  });

interface AccountTabProps {
  allowDeletion?: boolean;
}

export function AccountTab({ allowDeletion = false }: AccountTabProps) {
  const { t } = useTranslation();
  const { deleteCurrentUser } = useUserAPI();
  const auth = useAuth();

  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AccountTabFormData>({
    resolver: yupResolver(validationRules(t)),
    defaultValues: defaultFormValues,
  });

  const handlePasswordSubmit = async (data: AccountTabFormData) => {
    setIsPasswordLoading(true);
    try {
      const user = await Auth.currentUserPoolUser();

      await Auth.changePassword(user, data.currentPassword, data.newPasswordConfirm);

      toast(t('settings.account.passwordChanged'), successToastConfig);
      reset(defaultFormValues);
    } catch (e: any) {
      if (typeof e === 'object' && 'message' in e) {
        toast(e.message ?? t('common.errors.default'), errorToastConfig);
      } else {
        toast(t('common.errors.default'), errorToastConfig);
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteCurrentUser();

      toast(t('settings.account.accountDeleted'), successToastConfig);
      await auth.signOut();
    } catch (e: any) {
      if (typeof e === 'object' && 'message' in e) {
        toast(e.message ?? t('common.errors.default'), errorToastConfig);
      }
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className={clsx('max-w-2xl', 'space-y-8')}>
      <div>
        <h3 className={clsx('text-xl', 'font-semibold', 'mb-4')}>
          {t('settings.account.changePassword')}
        </h3>

        <form onSubmit={handleSubmit(handlePasswordSubmit)} className={clsx('space-y-4')}>
          <TextField
            {...register('currentPassword')}
            autoComplete="off"
            fullWidth
            type="password"
            label={t('settings.account.currentPassword')}
            variant="outlined"
            required
            error={Boolean(errors.currentPassword)}
            helperText={errors.currentPassword?.message}
          />

          <TextField
            {...register('newPassword')}
            autoComplete="off"
            fullWidth
            type="password"
            label={t('settings.account.newPassword')}
            variant="outlined"
            required
            error={Boolean(errors.newPassword)}
            helperText={errors.newPassword?.message}
          />

          <TextField
            {...register('newPasswordConfirm')}
            autoComplete="off"
            fullWidth
            type="password"
            label={t('settings.account.confirmPassword')}
            variant="outlined"
            required
            error={Boolean(errors.newPasswordConfirm)}
            helperText={errors.newPasswordConfirm?.message}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isPasswordLoading}
            size="large"
          >
            {isPasswordLoading ? t('settings.updating') : t('settings.account.updatePassword')}
          </Button>
        </form>
      </div>
      {allowDeletion && (
        <>
          <hr className={clsx('border-gray-200')} />
          <div>
            <h3 className={clsx('text-xl', 'font-semibold', 'mb-4', 'text-red-600')}>
              {t('settings.account.deleteAccount')}
            </h3>

            <p className={clsx('text-gray-600', 'mb-4')}>
              {t('settings.account.deleteAccountWarning')}
            </p>

            <Button
              variant="outlined"
              color="error"
              size="large"
              onClick={() => setDeleteDialogOpen(true)}
            >
              {t('settings.account.deleteAccount')}
            </Button>
          </div>
        </>
      )}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('settings.account.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('settings.account.deleteConfirmMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            {t('settings.cancel')}
          </Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            {t('settings.account.confirmDeleteButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
