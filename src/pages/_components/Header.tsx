import clsx from 'clsx';
import { languages } from '@/i18n/config';
import { useTranslation } from 'react-i18next';
import { Select } from './Select';
import i18next from 'i18next';
import { useNavigate } from 'react-router';
import { useAuth } from '@/auth/hook';

export const Header = (): React.ReactElement => {
  return (
    <header className={clsx('bg-base-100', 'relative', 'px-8', 'z-50')}>
      <div className={clsx('flex', 'justify-between')}>
        <Logo />
        <span className={clsx('flex', 'items-center', 'gap-7')}>
          <GithubLink />
          <LanguageSelector />
        </span>
      </div>
    </header>
  );
};

const Logo = (): React.ReactElement => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    else {
      navigate('/login');
    }
  }
  return (
    <div
      className={clsx(
        ['flex', 'gap-4', 'items-center'],
        ['text-xl', 'text-primary', 'font-semibold', 'font-sans'],
        ['cursor-pointer']
      )}
    >
      <img
        src={`/img/common/logo/oqtopus.png`}
        width={320}
        height={32}
        alt={"OQTOPUS"}
        onClick={handleLogoClick}
      />
    </div>
  );
};

const GithubLink = (): React.ReactElement => {
  const handleGithubLink = () => {

  }


  return (
    <a
      className={clsx(['cursor-pointer', 'flex', 'items-center', 'gap-2'])}
      href="https://github.com/oqtopus-team/oqtopus-frontend.git"
      target="_blank"
      rel='noopener'
    >
      <img 
        src={"/img/common/github-mark.svg"}
        width={32}
        height={32}
        alt={"Github"}
        onClick={handleGithubLink}
      />
      <p className={clsx(['text-sm', "font-sans"])}>
        v1.0.0
      </p>
    </a>
  )
}

const LanguageSelector = (): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <Select
      className={clsx('!w-[100px]', 'border-primary', 'text-primary', 'outline-primary')}
      onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (languages.includes(e.target.value)) {
          i18next.changeLanguage(e.target.value);
        }
      }}
      defaultValue={i18next.language}
      value={''}
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
