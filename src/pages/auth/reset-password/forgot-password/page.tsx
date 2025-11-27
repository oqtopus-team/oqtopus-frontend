import * as yup from 'yup';
import { useTranslation, Trans } from 'react-i18next';
import clsx from 'clsx';
import { useAuth } from '@/auth/hook';
import { Input } from '@/pages/_components/Input';
import { Button } from '@/pages/_components/Button';
import { useNavigate } from 'react-router';
import { FormTitle } from '../../_components/FormTitle';
import { useResetPassword } from '../_components/Provider';
import { useFormProcessor } from '@/pages/_hooks/form';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';
import { use } from 'react';
import { errorToastConfig, infoToastConfig } from '@/config/toast';
import { toast } from 'react-toastify';

interface FormInput {
  email: string;
}

const validationRules = (t: (key: string) => string): yup.ObjectSchema<FormInput> =>
  yup.object({
    email: yup
      .string()
      .required(t('forgot_password.form.error_message.mail_address_enter'))
      .email(t('forgot_password.form.error_message.mail_address_valid')),
  });

export default function ForgotPasswordPage() {
  const { setEmail } = useResetPassword();
  const { t } = useTranslation();
  useDocumentTitle(t('forgot_password.title'));
  const auth = useAuth();
  const navigate = useNavigate();
  const { processing, register, onSubmit, errors } = useFormProcessor(
    validationRules(t),
    ({ setProcessingFalse }) => {
      return (data) => {
        auth
          .forgotPassword(data.email)
          .then((result) => {
            if (result.success) {
              setEmail(data.email);
              navigate('/confirm-password');
              return;
            }
            toast(result.message, errorToastConfig);
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
      <FormTitle>{t('forgot_password.title')}</FormTitle>
      <Spacer className="h-4" />
      <form noValidate onSubmit={onSubmit}>
        <p className={clsx('text-xs', 'leading-[1.8]')}>
          <Trans i18nKey={'forgot_password.explanation'} />
        </p>
        <Spacer className="h-3" />
        <Input
          autoFocus
          placeholder="Enter Email"
          label={t('forgot_password.form.mail')}
          errorMessage={errors.email?.message}
          {...register('email')}
        />
        <Spacer className="h-5" />
        <Button type="submit" color="secondary" loading={processing}>
          {t('forgot_password.button')}
        </Button>
      </form>
    </div>
  );
}
