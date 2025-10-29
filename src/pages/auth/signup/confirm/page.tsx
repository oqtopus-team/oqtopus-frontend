import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useAuth } from '@/auth/hook';
import { useNavigate } from 'react-router';
import { FormTitle } from '../../_components/FormTitle';
import { Button } from '@/pages/_components/Button';
import { Input } from '@/pages/_components/Input';
import { useFormProcessor } from '@/pages/_hooks/form';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';
import { toast } from 'react-toastify';
import { errorToastConfig } from '@/config/toast';

interface FormInput {
  verificationCode: string;
}

const validationRules = (t: (key: string) => string): yup.ObjectSchema<FormInput> =>
  yup.object({
    verificationCode: yup.string().required(t('signup.confirm.form.error_message.code')),
  });

export default function ConfirmSetupMFAPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('signup.confirm.title'));
  const navigate = useNavigate();
  const auth = useAuth();
  const { processing, register, onSubmit, errors } = useFormProcessor(
    validationRules(t),
    ({ setProcessingFalse }) => {
      return (data) => {
        auth
          .confirmSignUp(data.verificationCode)
          .then((result) => {
            if (result.success) {
              navigate('/mfa');
              return;
            }
            toast(result.message, errorToastConfig)
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
      <FormTitle>{t('signup.confirm.title')}</FormTitle>
      <Spacer className="h-4" />
      <form noValidate onSubmit={onSubmit}>
        <Input
          autoFocus
          type={'text'}
          placeholder="Enter Verification Code (6 digits)"
          {...register('verificationCode')}
          label={t('signup.confirm.form.code')}
          errorMessage={errors.verificationCode?.message}
        />
        <Spacer className="h-2.5" />
        <p className={clsx('text-xs', 'leading-[1.8]')}>
          {t('signup.confirm.form.code_explanation')}
        </p>
        <Spacer className="h-3" />
        <Button type="submit" color="secondary" loading={processing}>
          {t('signup.confirm.button')}
        </Button>
      </form>
    </div>
  );
}
