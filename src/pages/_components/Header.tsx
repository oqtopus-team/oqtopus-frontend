import clsx from 'clsx';
import { languages } from '@/i18n/config';
import { useTranslation } from 'react-i18next';
import { Select } from './Select';
import i18next from 'i18next';
import { useNavigate } from 'react-router';
import { useAuth } from '@/auth/hook';
import { IconButton } from '@mui/material';
import { FaMoon } from 'react-icons/fa';
import { MdOutlineWbSunny } from 'react-icons/md';
import { useMemo } from 'react';
import { ThemeOptions, useTheme } from '@/theme/useTheme';

export const Header = (): React.ReactElement => {
  return (
    <header className={clsx('bg-base-100', 'relative', 'px-8', 'z-50')}>
      <div className={clsx('flex', 'justify-between')}>
        <Logo />
        <IconButton>
          <i className="bi bi-brightness-high-fill"></i>
        </IconButton>
        <div className={clsx('flex', 'items-center', 'gap-7')}>
          <LanguageSelector />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  );
};

const Logo = (): React.ReactElement => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const logoSrc = useMemo(
    () =>
      `${import.meta.env.VITE_APP_LOGO_IMAGE_URL}${theme === ThemeOptions.DARK ? '.webp' : '.png'}`,
    [theme]
  );

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };
  return (
    <div
      className={clsx(
        ['flex', 'gap-4', 'items-center'],
        ['text-xl', 'text-primary', 'font-semibold', 'font-sans'],
        ['cursor-pointer']
      )}
      onClick={handleLogoClick}
    >
      <img
        src={logoSrc}
        className={clsx(['h-12', 'my-2', 'py-2'])}
        alt={import.meta.env.VITE_APP_APP_NAME_EN}
      />
      <div
        className={clsx('flex', 'flex-col', 'items-center', 'text-center', 'gap-1')}
        style={{ fontSize: '10px', lineHeight: '12px' }}
      >
        <span style={{ fontSize: '1.5em' }}>{t('app.logo.title')}</span>
        <p className={clsx('whitespace-pre')}>{t('app.logo.subtitle')}</p>
      </div>
      <span className={clsx(['cursor-pointer'], ['hidden', 'sm:block'])}>
        {t('app.name.oqtopus')}
      </span>
    </div>
  );
};

const LanguageSelector = (): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <Select
        className={clsx(
        '!w-[100px]',
        'border-primary',
        'text-primary',
        'outline-primary',
        'bg-base-100'
      )}
      onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (languages.includes(e.target.value)) {
          i18next.changeLanguage(e.target.value);
        }
      }}
      value={i18next.language}
    >
      {languages.map((lang: string) => {
        return (
          <option value={lang} key={lang}>
            {t(`header.lang.${lang}`)}
          </option>
        );
      })}
    </Select>
  );
};

const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();
  const Icon = theme === ThemeOptions.DARK ? MdOutlineWbSunny : FaMoon;

  const switchDarkTheme = () => {
    const themeToSet = theme === ThemeOptions.LIGHT ? ThemeOptions.DARK : ThemeOptions.LIGHT;
    setTheme(themeToSet);
  };

  return (
    <IconButton color="primary" size="small" onClick={switchDarkTheme}>
      <Icon />
    </IconButton>
  );
};
