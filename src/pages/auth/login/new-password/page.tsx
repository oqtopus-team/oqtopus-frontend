import { useLayoutEffect } from 'react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useAuth } from '@/auth/hook';
import { useNavigate } from 'react-router';
import { Button } from '@/pages/_components/Button';
import { Input } from '@/pages/_components/Input';
import { FormTitle } from '../../_components/FormTitle';
import { useFormProcessor } from '@/pages/_hooks/form';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';
import { toast } from 'react-toastify';
import { errorToastConfig, infoToastConfig } from '@/config/toast';
import {
  createPasswordConfirmSchema,
  createPasswordSchema,
} from '@/config/validation/passwordSchemas';

interface FormInput {
  password: string;
  confirm_password: string;
}

const validationRules = (t: (key: string) => string): yup.ObjectSchema<FormInput> =>
  yup.object({
    password: createPasswordSchema(
      {
        required: t('signin.new_password.form.error_message.password_enter'),
        lowercase: t('signin.new_password.form.error_message.password_lowercase'),
        uppercase: t('signin.new_password.form.error_message.password_uppercase'),
        number: t('signin.new_password.form.error_message.password_number'),
        special: t('signin.new_password.form.error_message.password_special'),
        min: t('signin.new_password.form.error_message.password_min'),
      },
      12
    ),
    confirm_password: createPasswordConfirmSchema('password', {
      required: t('signin.new_password.form.error_message.confirm_password_enter'),
      mismatch: t('signin.new_password.form.error_message.confirm_password_mismatch'),
    }),
  });

export default function NewPasswordPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('signin.new_password.title'));
  const auth = useAuth();
  const navigate = useNavigate();

  // This screen is only valid while signIn's NEW_PASSWORD_REQUIRED challenge is
  // pending in the auth provider (which holds the CognitoUser that
  // completeNewPassword needs). On a full reload the provider re-mounts and that
  // pending user is gone, so redirect to login rather than fail on submit.
  // Checked once on mount: later clearing of pendingChallenge (on success) must
  // not retrigger this and race the success navigation.
  useLayoutEffect(() => {
    if (auth.pendingChallenge !== 'NEW_PASSWORD_REQUIRED') {
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { processing, register, onSubmit, errors } = useFormProcessor(
    validationRules(t),
    ({ setProcessingFalse }) => {
      return (data) => {
        auth
          .completeNewPassword(data.password)
          .then((result) => {
            if (result.success) {
              // 'signin.totp_required' -> the user is already MFA-enrolled, go
              // enter the code; otherwise the session is established and we
              // enroll a fresh TOTP device.
              navigate(result.message === 'signin.totp_required' ? '/confirm-mfa' : '/mfa');
              return;
            }
            if (result.message === 'signin.new_password.additional_mfa_required') {
              // Password was accepted but Cognito raised an unsupported extra
              // challenge; the challenge is spent, so re-entering here cannot
              // recover. Inform the user and send them back to sign in.
              toast(t(result.message), infoToastConfig);
              navigate('/login');
              return;
            }
            toast(t(result.message), errorToastConfig);
            setProcessingFalse();
          })
          .catch((error) => {
            const errorMsg = error.message ?? t('common.errors.default');
            toast(errorMsg, errorToastConfig);
          });
      };
    }
  );

  return (
    <div className={clsx('w-[300px]', 'pt-8', 'text-sm')}>
      <FormTitle>{t('signin.new_password.title')}</FormTitle>
      <Spacer className="h-4" />
      <p className={clsx('text-xs', 'leading-[1.8]')}>{t('signin.new_password.description')}</p>
      <Spacer className="h-6" />
      <form noValidate onSubmit={onSubmit}>
        <Input
          autoFocus
          type={'password'}
          autoComplete="new-password"
          placeholder="Enter Password"
          label={t('signin.new_password.form.password')}
          errorMessage={errors.password?.message}
          {...register('password')}
          className={clsx('bg-base-card')}
        />
        <Spacer className="h-2.5" />
        <p className={clsx('text-xs', 'leading-[1.8]', 'text-neutral-content')}>
          {t('signin.new_password.form.password_explanation')}
        </p>
        <Spacer className="h-3" />
        <Input
          type={'password'}
          autoComplete="new-password"
          placeholder="Enter Confirm Password"
          label={t('signin.new_password.form.confirm_password')}
          errorMessage={errors.confirm_password?.message}
          {...register('confirm_password')}
          className={clsx('bg-base-card')}
        />
        <Spacer className="h-5" />
        <Button type="submit" color="secondary" loading={processing}>
          {t('signin.new_password.button')}
        </Button>
      </form>
    </div>
  );
}
