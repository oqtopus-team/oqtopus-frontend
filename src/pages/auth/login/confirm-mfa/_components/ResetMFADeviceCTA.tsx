import clsx from 'clsx';
import i18next from 'i18next';
import { NavLink } from 'react-router';

const URI = '/mfa-invalidation';

export const ResetMFADeviceCTA = () => (
  <div className={clsx('text-xs')}>
    {i18next.language === 'ja' ? (
      <>
        MFAデバイスをリセットしたい場合
        <br />
        <NavLink to={URI} className="text-link">
          MFA無効化を先に行ってください。
        </NavLink>
      </>
    ) : (
      <>
        If you want to reset the MFA device
        <br />
        <NavLink to={URI} className="text-link">
          First, invalidate the MFA.
        </NavLink>
      </>
    )}
  </div>
);
