import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { successToastConfig } from '@/config/toast';

interface AccountTabFormData {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
  language: 'en' | 'jpn';
}

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
    language: yup.string().oneOf(['en', 'jpn']).required(),
  });

export function AccountTab() {
  const { t } = useTranslation();

  const [language, setLanguage] = useState('en');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountTabFormData>({
    resolver: yupResolver(validationRules(t)),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
      language: 'en',
    },
  });

  const handlePasswordSubmit = async (data) => {
    console.log('Submit form data', data);
    setIsPasswordLoading(true);
    setTimeout(() => {
      setIsPasswordLoading(false)
      toast(t('settings.account.passwordChanged'), successToastConfig)
    }, 3000);
  };

  const handleLanguageChange = async (event: any) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const handleDeleteAccount = async () => {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setDeleteDialogOpen(false);
    alert(t('settings.account.accountDeleted'));
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

      <hr className={clsx('border-gray-200')} />

      <div>
        <h3 className={clsx('text-xl', 'font-semibold', 'mb-4')}>
          {t('settings.account.languagePreference')}
        </h3>

        <FormControl fullWidth variant="outlined">
          <InputLabel>{t('settings.account.language')}</InputLabel>
          <Select
            value={language}
            onChange={handleLanguageChange}
            label={t('settings.account.language')}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="jpn">Japanese</MenuItem>
          </Select>
        </FormControl>
      </div>

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
