import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/pages/_components/Button';
import { Input } from '@/pages/_components/Input';
import clsx from 'clsx';
import ENV from '@/env';
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import { Amplify, Auth } from 'aws-amplify';

Amplify.configure({ Auth: ENV.AWS_CONFIG });
type Step = 1 | 2 | 3;

export default function MfaResetTestPage() {
  const [step, setStep] = useState<Step>(1);

  // 共通
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2
  const [code, setCode] = useState('');
  const [secret, setSecret] = useState<string | null>(null);

  // Step 3
  const [totpCode, setTotpCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // QRコード生成用
  const getOtpAuthUrl = (secret: string, email: string) => {
    // サービス名は適宜変更
    return `otpauth://totp/Oqtopus:${encodeURIComponent(email)}?secret=${secret}&issuer=Oqtopus`;
  };

  // Step1: 認証＋メール送信
  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch(`${ENV.API_SIGNUP_ENDPOINT}/mfa_reset/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to start MFA reset');
        setProcessing(false);
        return;
      }
      setStep(2);
    } catch (err) {
      setError('Network error');
    }
    setProcessing(false);
  };

  // Step2: コード検証＋シークレット取得
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch(`${ENV.API_SIGNUP_ENDPOINT}/mfa_reset/verify_code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to verify code');
        setProcessing(false);
        return;
      }
      setSecret(data.secret);
      setStep(3);
    } catch (err) {
      setError('Network error');
    }
    setProcessing(false);
  };

  // Step3: TOTP登録
  const handleConfirmTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch(`${ENV.API_SIGNUP_ENDPOINT}/mfa_reset/confirm_totp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, totp_code: totpCode }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to confirm TOTP');
        setProcessing(false);
        return;
      }
      alert('MFA registration completed!');
      setStep(1);
      setEmail('');
      setPassword('');
      setCode('');
      setSecret(null);
      setTotpCode('');
    } catch (err) {
      setError('Network error');
    }
    setProcessing(false);
  };

  return (
    <div className={clsx('w-[350px]', 'mx-auto', 'pt-8', 'text-sm')}>
      <h2 className="text-xl font-bold mb-4">MFA Reset Test</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}

      {step === 1 && (
        <form onSubmit={handleStart}>
          <Input
            label="Email"
            type="email"
            value={email}
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" color="secondary" loading={processing}>
            Send verification code
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode}>
          <div className="mb-2">A verification code has been sent to your email.</div>
          <Input
            label="Verification Code"
            type="text"
            value={code}
            autoFocus
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <Button type="submit" color="secondary" loading={processing}>
            Verify code
          </Button>
        </form>
      )}

      {step === 3 && secret && (
        <form onSubmit={handleConfirmTotp}>
          <div className="mb-2">Scan this QR code with your authenticator app:</div>
          <div className="flex justify-center mb-4">
            <QRCodeSVG value={getOtpAuthUrl(secret, email)} />
          </div>
          <Input
            label="TOTP Code"
            type="text"
            value={totpCode}
            autoFocus
            onChange={(e) => setTotpCode(e.target.value)}
            required
            placeholder="Enter 6-digit code"
          />
          <Button type="submit" color="secondary" loading={processing}>
            Register MFA
          </Button>
        </form>
      )}
    </div>
  );
}
