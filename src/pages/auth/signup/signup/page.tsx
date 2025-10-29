import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useAuth } from '@/auth/hook';
import { useNavigate } from 'react-router';
import { Input } from '@/pages/_components/Input';
import { Button } from '@/pages/_components/Button';
import { FormTitle } from '../../_components/FormTitle';
import { useFormProcessor } from '@/pages/_hooks/form';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';
import { toast } from 'react-toastify';
import { errorToastConfig, successToastConfig } from '@/config/toast';

interface FormInput {
  username: string;
  // name: string;
  password: string;
  confirm_password: string;
  // org: string;
  // purpose: string;
}

const validationRules = (t: (key: string) => string): yup.ObjectSchema<FormInput> =>
  yup.object({
    username: yup
      .string()
      .required(t('signup.form.error_message.mail_address_enter'))
      .max(100, t('signup.form.error_message.mail_address_max'))
      .email(t('signup.form.error_message.mail_address_valid')),
    password: yup
      .string()
      .required(t('signup.form.error_message.password_enter'))
      .matches(/(?=.*[a-z])/, t('signup.form.error_message.password_lowercase'))
      .matches(/(?=.*[A-Z])/, t('signup.form.error_message.password_uppercase'))
      .matches(/(?=.*[0-9])/, t('signup.form.error_message.password_number'))
      .matches(/(?=.*[!-/:-@[-`{-~])/, t('signup.form.error_message.password_special'))
      .min(12, t('signup.form.error_message.password_min')),
    confirm_password: yup
      .string()
      .required(t('signup.form.error_message.confirm_password_enter'))
      .oneOf([yup.ref('password')], t('signup.form.error_message.confirm_password_mismatch')),
  });

export default function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useDocumentTitle(t('signup.title'));
  const auth = useAuth();
  const { processing, register, onSubmit, errors } = useFormProcessor(
    validationRules(t),
    ({ setProcessingFalse }) => {
      return (data) => {
        auth
          .signUp(data.username, data.password)
          .then((result) => {
            if (result.success) {
              navigate('/confirm');
              return;
            }
            toast(result.message, successToastConfig)
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
      <FormTitle>{t('signup.title')}</FormTitle>
      <Spacer className="h-4" />
      <form noValidate onSubmit={onSubmit}>
        <Input
          autoFocus
          type={'email'}
          placeholder="Enter Email"
          {...register('username')}
          label={t('signup.form.mail')}
          errorMessage={errors.username?.message}
        />
        <Spacer className="h-5" />
        <Input
          type={'password'}
          placeholder="Enter Password"
          autoComplete="current-password"
          {...register('password')}
          label={t('signup.form.password')}
          errorMessage={errors.password?.message}
        />
        <Spacer className="h-2.5" />
        <p
          className={clsx(
            'text-xs',
            'leading-[1.8]',
            'text-neutral-content',
            'whitespace-pre-wrap'
          )}
        >
          {t('signup.form.password_explanation')}
        </p>
        <Spacer className="h-3" />
        <Input
          type={'password'}
          placeholder="Enter Confirm Password"
          autoComplete="current-password"
          {...register('confirm_password')}
          label={t('signup.form.confirm_password')}
          errorMessage={errors.confirm_password?.message}
        />
        <Spacer className="h-5" />
        <Button type="submit" color="secondary" loading={processing}>
          {t('signup.button')}
        </Button>
      </form>
    </div>
  );
}
