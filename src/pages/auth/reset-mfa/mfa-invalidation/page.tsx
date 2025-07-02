import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useNavigate } from 'react-router';
import { Input } from '@/pages/_components/Input';
import { Button } from '@/pages/_components/Button';
import { FormTitle } from '../../_components/FormTitle';
import { useFormProcessor } from '@/pages/_hooks/form';
import { resetMfa } from '@/backend/MfaApi';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';

interface FormInput {
  username: string;
  password: string;
}

const validationRules = (t: (key: string) => string): yup.ObjectSchema<FormInput> =>
  yup.object({
    username: yup
      .string()
      .required(t('mfa_reset.form.error_message.mail_address_enter'))
      .email(t('mfa_reset.form.error_message.mail_address_valid')),
    password: yup.string().required(t('mfa_reset.form.error_message.password')),
  });

export default function ResetMFAPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useDocumentTitle(t('mfa_reset.title'));
  const { processing, register, onSubmit, errors } = useFormProcessor(
    validationRules(t),
    ({ setProcessingFalse }) => {
      return (data) => {
        resetMfa(data.username, data.password)
          .then((result) => {
            if (result) {
              alert(t('mfa_reset.alert.success'));
              navigate('/login');
            } else {
              alert(t('mfa_reset.alert.failure'));
            }
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => {
            setProcessingFalse();
          });
      };
    }
  );

  return (
    <div className={clsx('w-[300px]', 'pt-8', 'text-sm')}>
      <FormTitle>{t('mfa_reset.title')}</FormTitle>
      <Spacer className="h-4" />
      <form noValidate onSubmit={onSubmit}>
        <Input
          autoFocus
          placeholder="Enter Email"
          {...register('username')}
          label={t('mfa_reset.form.mail')}
          errorMessage={errors.username?.message}
        />
        <Spacer className="h-5" />
        <Input
          type={'password'}
          placeholder="Enter Password"
          autoComplete="current-password"
          {...register('password')}
          label={t('mfa_reset.form.password')}
          errorMessage={errors.password && errors.password.message}
        />
        <Spacer className="h-5" />
        <Button type="submit" color="secondary" loading={processing}>
          {t('mfa_reset.button')}
        </Button>
      </form>
    </div>
  );
}
