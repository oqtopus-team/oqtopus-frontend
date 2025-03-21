import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useAuth } from '@/auth/hook';
import { useNavigate } from 'react-router';
import { Input } from '@/pages/_components/Input';
import { Button } from '@/pages/_components/Button';
import { ResetMFADeviceCTA } from './_components/ResetMFADeviceCTA';
import { Divider } from '@/pages/_components/Divider';
import { FormTitle } from '../../_components/FormTitle';
import { useFormProcessor } from '@/pages/_hooks/form';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';

interface FormInput {
  totpCode: string;
}

const validationRules = (t: (key: string) => string): yup.ObjectSchema<FormInput> =>
  yup.object({
    totpCode: yup.string().required(t('signin.confirm.form.error_message.code')),
  });

export default function ConfirmMFAPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useDocumentTitle(t('signin.confirm.title'));
  const auth = useAuth();
  const { processing, register, onSubmit, errors } = useFormProcessor(
    validationRules(t),
    ({ setProcessingFalse }) => {
      return (data) => {
        auth
          .confirmSignIn(data.totpCode)
          .then((result) => {
            if (result.success) {
              navigate('/dashboard');
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
      <FormTitle>{t('signin.confirm.title')}</FormTitle>
      <Spacer className="h-4" />
      <form noValidate onSubmit={onSubmit}>
        <Input
          autoFocus
          placeholder="Enter TOTP Code (6 digits)"
          label={t('signin.confirm.form.totp_code')}
          errorMessage={errors.totpCode?.message}
          {...register('totpCode')}
        />
        <Spacer className="h-2.5" />
        <p className={clsx('text-xs', 'leading-[1.8]')}>
          {t('signin.confirm.form.totp_code_explanation')}
        </p>
        <Spacer className="h-3" />
        <Button type="submit" color="secondary" loading={processing}>
          {t('signin.confirm.button')}
        </Button>
        <Divider className={clsx('my-3')} />
        <ResetMFADeviceCTA />
      </form>
    </div>
  );
}
