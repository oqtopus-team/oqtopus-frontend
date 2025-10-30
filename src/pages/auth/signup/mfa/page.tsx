import { useState, useLayoutEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import * as yup from 'yup';
import { useTranslation, Trans } from 'react-i18next';
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
import { errorToastConfig, infoToastConfig, successToastConfig } from '@/config/toast';

interface FormInput {
  totpCode: string;
}

const validationRules = (t: (key: string) => string): yup.ObjectSchema<FormInput> =>
  yup.object({
    totpCode: yup.string().required(t('mfa.form.error_message.totp_code')),
  });

export default function SetupMFAPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [qrLoading, setQRLoading] = useState(false);

  useLayoutEffect(() => {
    auth
      .setUpMfa()
      .then((result) => {
        if (result.success) {
          setQRLoading(true);
        } else {
          toast(result.message, errorToastConfig);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const { t } = useTranslation();
  useDocumentTitle(t('mfa.title'));
  const { processing, register, onSubmit, errors } = useFormProcessor(
    validationRules(t),
    ({ setProcessingFalse }) => {
      return (data) => {
        auth
          .confirmMfa(data.totpCode)
          .then((result) => {
            if (result.success) {
              navigate('/dashboard');
              return;
            }
            toast(result.message, errorToastConfig);
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
      <FormTitle>{t('mfa.title')}</FormTitle>
      <Spacer className="h-4" />
      <p className={clsx('text-xs', 'leading-[1.8]')}>
        <Trans i18nKey={'mfa.explanation01'} />
      </p>
      <Spacer className="h-4" />
      {qrLoading && <QRCodeSVG value={auth.qrcode} />}
      <Spacer className="h-4" />
      <p className={clsx('text-xs', 'leading-[1.8]')}>{t('mfa.explanation02')}</p>
      <Spacer className="h-8" />
      <form noValidate onSubmit={onSubmit}>
        <Input
          autoFocus
          type={'text'}
          placeholder="Enter TOTP Code (6 digits)"
          {...register('totpCode')}
          label={t('mfa.form.totp_code')}
          errorMessage={errors.totpCode?.message}
        />
        <Spacer className="h-5" />
        <Button type="submit" color="secondary" loading={processing}>
          {t('mfa.button')}
        </Button>
      </form>
    </div>
  );
}
