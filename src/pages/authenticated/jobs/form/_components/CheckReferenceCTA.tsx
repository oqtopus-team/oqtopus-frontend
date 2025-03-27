import clsx from 'clsx';
import i18next from 'i18next';
import { NavLink } from 'react-router';

export const CheckReferenceCTA = () => {
  return (
    <p className={clsx('text-xs')}>
      {i18next.language === 'ja' ? (
        <>
          各入力値については
          <NavLink to="#" className="text-link">
            こちら
          </NavLink>
          の説明を参照してください
        </>
      ) : (
        <>
          For each input value, please refer to the explanation{' '}
          <NavLink to="#" className="text-link">
            here.
          </NavLink>
        </>
      )}
    </p>
  );
};
