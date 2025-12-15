import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useAuth } from '@/auth/hook';
import { useNavigate, useLocation } from 'react-router';
import { FormTitle } from '../../_components/FormTitle';
import { Button } from '@/pages/_components/Button';
import { Input } from '@/pages/_components/Input';
import { useFormProcessor } from '@/pages/_hooks/form';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';
import { useEffect } from 'react';

interface FormInput {
  verificationCode: string;
}

const validationRules = (t: (key: string) => string): yup.ObjectSchema<FormInput> =>
  yup.object({
    verificationCode: yup.string().required(t('signup.confirm.form.error_message.code')),
  });

export default function ConfirmResetMFAPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { username, accessToken } = location.state || {};
  const navigate = useNavigate();
  useEffect(() => {
    if (!username || !accessToken) {
      alert(t('mfa.form.error_message.unexpected'));
      navigate('/login', { replace: true });
    }
  }, [username, accessToken, t, navigate]);

  if (!username || !accessToken) {
    return null;
  }

  useDocumentTitle(t('mfa.confirm.title'));
  const auth = useAuth();
  const { processing, register, onSubmit, errors } = useFormProcessor(
    validationRules(t),
    ({ setProcessingFalse }) => {
      return (data) => {
        auth
          .confirmMfaReset(accessToken, data.verificationCode)
          .then((result) => {
            if (result.success) {
              navigate('/mfa-re-registration', {
                state: { username: username, accessToken: accessToken, secret: result.message },
              });
              return;
            }
            alert(result.message);
            setProcessingFalse();
          })
          .catch((error) => {
            console.log(error);
          });
      };
    }
  );

  return (
    <div className={clsx('w-[300px]', 'pt-8', 'text-sm')}>
      <FormTitle>{t('mfa.confirm.title')}</FormTitle>
      <Spacer className="h-4" />
      <form noValidate onSubmit={onSubmit}>
        <Input
          autoFocus
          type={'text'}
          placeholder="Enter Verification Code (6 digits)"
          {...register('verificationCode')}
          label={t('mfa.confirm.form.code')}
          errorMessage={errors.verificationCode?.message}
        />
        <Spacer className="h-2.5" />
        <p className={clsx('text-xs', 'leading-[1.8]')}>{t('mfa.confirm.form.code_explanation')}</p>
        <Spacer className="h-3" />
        <Button type="submit" color="secondary" loading={processing}>
          {t('mfa.confirm.button')}
        </Button>
      </form>
    </div>
  );
}
