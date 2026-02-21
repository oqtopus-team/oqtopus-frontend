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
import {
  createEmailSchema,
  createPasswordConfirmSchema,
  createPasswordSchema,
} from '@/config/validation/passwordSchemas';

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
    username: createEmailSchema(t),
    password: createPasswordSchema(
      {
        required: t('signup.form.error_message.password_enter'),
        lowercase: t('signup.form.error_message.password_lowercase'),
        uppercase: t('signup.form.error_message.password_uppercase'),
        number: t('signup.form.error_message.password_number'),
        special: t('signup.form.error_message.password_special'),
        min: t('signup.form.error_message.password_min'),
      },
      12
    ),
    confirm_password: createPasswordConfirmSchema('password', {
      required: t('signup.form.error_message.confirm_password_enter'),
      mismatch: t('signup.form.error_message.confirm_password_mismatch'),
    }),
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
