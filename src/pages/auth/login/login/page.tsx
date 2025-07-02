import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useAuth } from '@/auth/hook';
import { NavLink } from 'react-router';
import * as yup from 'yup';
import { Divider } from '../../../_components/Divider';
import { Button } from '@/pages/_components/Button';
import { Input } from '@/pages/_components/Input';
import { SignUpAgreement } from './_components/SignUpAgreement';
import { SignUpCTAForVisitor } from './_components/SignUpCTAForNewVisitor';
import { FormTitle } from '../../_components/FormTitle';
import { useNavigate } from 'react-router';
import { useFormProcessor } from '@/pages/_hooks/form';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';
import { toast } from 'react-toastify';
import { errorToastConfig } from '@/config/toast';

interface FormInput {
  username: string;
  password: string;
}

const validationRules = (t: (key: string) => string): yup.ObjectSchema<FormInput> =>
  yup.object({
    username: yup.string().required(t('signin.form.error_message.user_name')),
    password: yup.string().required(t('signin.form.error_message.password')),
  });

export default function LoginPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('signin.title'));
  const auth = useAuth();
  const navigate = useNavigate();
  const { processing, register, onSubmit, errors } = useFormProcessor(
    validationRules(t),
    ({ setProcessingFalse }) => {
      return async (data) => {
        try {
          const { success, message } = await auth.signIn(data.username, data.password);
          if (success) {
            navigate('/confirm-mfa');
            return;
          }
          toast(t(message), errorToastConfig);
          if (message === 'signup.confirm.form.mfa_setup_request') {
            // if MFA is not set, execute MFA reset flow
            // this will send a confirmation code to the user's email and redirect to the confirm code page
            const { success, message } = await auth.startMfaReset(data.username, data.password);
            if (success) {
              // if MFA reset is successful, redirect to confirm code page
              // transfer username and password to the next page
              navigate('/mfa-confirmation-code', {
                state: { username: data.username, password: data.password },
              });
            } else {
              // if something goes wrong, alert the user and redirect to login
              alert(message);
              navigate('/login');
            }
            return;
          }
          setProcessingFalse();
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : t('common.errors.default');
          toast(errorMsg, errorToastConfig);
        }
      };
    }
  );

  const { termOfService, privacyPolicy } = {
    termOfService: import.meta.env.VITE_APP_TERM_OF_SERVICE_PATH ?? '',
    privacyPolicy: import.meta.env.VITE_APP_PRIVACY_POLICY_PATH ?? '',
  };

  return (
    <div className={clsx('w-[300px]', 'pt-8', 'text-sm')}>
      <FormTitle>{t('signin.title')}</FormTitle>
      <Spacer className="h-4" />
      <form noValidate onSubmit={onSubmit}>
        <Input
          autoFocus
          type={'email'}
          placeholder="Enter Email"
          {...register('username')}
          label={t('signin.form.mail')}
          errorMessage={errors.username && errors.username.message}
        />
        <Spacer className="h-5" />
        <Input
          type={'password'}
          placeholder="Enter Password"
          autoComplete="current-password"
          {...register('password')}
          label={t('signin.form.password')}
          errorMessage={errors.password && errors.password.message}
        />
        <Spacer className="h-2.5" />
        <NavLink to="/forgot-password" className={clsx('text-link', 'text-xs')}>
          {t('signin.forgot_password')}
        </NavLink>
        <Spacer className="h-2.5" />
        {termOfService !== '' && privacyPolicy !== '' ? (
          <SignUpAgreement termsOfService={termOfService} privacyPolicy={privacyPolicy} />
        ) : null}
        <Spacer className="h-3" />
        <Button type="submit" color="secondary" loading={processing}>
          {t('signin.button')}
        </Button>
        <Divider className={clsx('my-3')} />
        <SignUpCTAForVisitor />
      </form>
    </div>
  );
}
