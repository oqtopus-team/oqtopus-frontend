import { useLayoutEffect } from 'react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useNavigate } from 'react-router';
import { useAuth } from '@/auth/hook';
import { Button } from '@/pages/_components/Button';
import { FormTitle } from '../../_components/FormTitle';
import { Input } from '@/pages/_components/Input';
import { useResetPassword } from '../_components/Provider';
import { useFormProcessor } from '@/pages/_hooks/form';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';
import { toast } from 'react-toastify';
import { errorToastConfig, infoToastConfig } from '@/config/toast';

interface FormInput {
  password: string;
  confirm_password: string;
  code: string;
}

const validationRules = (t: (key: string) => string): yup.ObjectSchema<FormInput> =>
  yup.object({
    password: yup
      .string()
      .required(t('forgot_password.confirm.form.error_message.password_enter'))
      .matches(/(?=.*[a-z])/, t('forgot_password.confirm.form.error_message.password_lowercase'))
      .matches(/(?=.*[A-Z])/, t('forgot_password.confirm.form.error_message.password_uppercase'))
      .matches(/(?=.*[0-9])/, t('forgot_password.confirm.form.error_message.password_number'))
      .matches(
        /(?=.*[!-/:-@[-`{-~])/,
        t('forgot_password.confirm.form.error_message.password_special')
      )
      .min(8, t('forgot_password.confirm.form.error_message.password_min')),
    confirm_password: yup
      .string()
      .required(t('forgot_password.confirm.form.error_message.confirm_password_enter'))
      .oneOf(
        [yup.ref('password')],
        t('forgot_password.confirm.form.error_message.confirm_password_mismatch')
      ),
    code: yup.string().required(t('forgot_password.confirm.form.error_message.code_enter')),
  });

export default function ForgotPasswordConfirmPage() {
  const { email } = useResetPassword();
  const navigate = useNavigate();
  useLayoutEffect(() => {
    if (email === '') {
      navigate('/forgot-password');
    }
  });

  const { t } = useTranslation();
  useDocumentTitle(t('forgot_password.confirm.title'));
  const auth = useAuth();
  const { processing, register, onSubmit, errors } = useFormProcessor(
    validationRules(t),
    ({ setProcessingFalse }) => {
      return (data) => {
        auth
          .confirmPassword(email, data.code, data.password)
          .then((result) => {
            if (result.success) {
              navigate('/login');
              return;
            }
            toast(result.message, infoToastConfig);
            setProcessingFalse();
          })
          .catch((error) => {
            const errorMsg = error.message ?? t('common.errors.default')
            toast(errorMsg, errorToastConfig)
          });
      };
    }
  );

  return (
    <div className={clsx('w-[300px]', 'pt-8', 'text-sm')}>
      <FormTitle>{t('forgot_password.confirm.title')}</FormTitle>
      <Spacer className="h-4" />
      <form noValidate onSubmit={onSubmit}>
        <Input
          autoFocus
          placeholder="Enter Verification Code (6 digits)"
          label={t('forgot_password.confirm.form.code')}
          errorMessage={errors.code?.message}
          {...register('code')}
        />
        <Spacer className="h-2.5" />
        <p className={clsx('text-xs', 'leading-[1.8]')}>
          {t('forgot_password.confirm.form.code_explanation')}
        </p>
        <Spacer className="h-3" />
        <Input
          type={'password'}
          autoComplete="current-password"
          placeholder="Enter Password"
          label={t('forgot_password.confirm.form.password')}
          errorMessage={errors.password?.message}
          {...register('password')}
        />
        <Spacer className="h-2.5" />
        <p className={clsx('text-xs', 'leading-[1.8]', 'text-neutral-content')}>
          {t('forgot_password.confirm.form.password_explanation')}
        </p>
        <Spacer className="h-3" />
        <Input
          type={'password'}
          autoComplete="current-password"
          placeholder="Enter Confirm Password"
          label={t('forgot_password.confirm.form.confirm_password')}
          errorMessage={errors.confirm_password?.message}
          {...register('confirm_password')}
        />
        <Spacer className="h-5" />
        <Button type="submit" color="secondary" loading={processing}>
          {t('forgot_password.confirm.button')}
        </Button>
      </form>
    </div>
  );
}
