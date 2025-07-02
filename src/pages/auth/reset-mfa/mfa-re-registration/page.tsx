import { useState, useLayoutEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import * as yup from 'yup';
import { useTranslation, Trans } from 'react-i18next';
import clsx from 'clsx';
import { useAuth } from '@/auth/hook';
import { useNavigate, useLocation } from 'react-router';
import { Button } from '@/pages/_components/Button';
import { Input } from '@/pages/_components/Input';
import { FormTitle } from '../../_components/FormTitle';
import { useFormProcessor } from '@/pages/_hooks/form';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';

interface FormInput {
  totpCode: string;
}

const validationRules = (t: (key: string) => string): yup.ObjectSchema<FormInput> =>
  yup.object({
    totpCode: yup.string().required(t('mfa.form.error_message.totp_code')),
  });

export default function SetupMFAPage() {
  const auth = useAuth();
  const location = useLocation();
  const { username, password, secret } = location.state || {};
  const navigate = useNavigate();
  const [qrLoading, setQRLoading] = useState(false);

  useLayoutEffect(() => {
    if (secret) {
      setQRLoading(true);
    } else {
      setQRLoading(false);
      console.error('No secret provided in location state');
    }
    auth.setQRCodeFromSecret(username, secret);
  }, []);
  console.log('QR Code:', auth.qrcode);
  console.log('secret:', secret);

  const { t } = useTranslation();
  useDocumentTitle(t('mfa.title'));
  const { processing, register, onSubmit, errors } = useFormProcessor(
    validationRules(t),
    ({ setProcessingFalse }) => {
      return (data) => {
        auth
          .resetMfa(username, password, data.totpCode)
          .then((result) => {
            if (result.success) {
              console.log(result);
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
