import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useAuth } from '@/auth/hook';
import { NavLink, useNavigate, useLocation } from 'react-router';
import { Spacer } from '@/pages/_components/Spacer';
import './Sidebar.css';

type MenuItem = MenuNavigate | MenuOnClick;
interface MenuNavigate {
  kind: 'navigate';
  name: string;
  path: string;
  icon: React.ReactElement;
  disable?: boolean;
}
interface MenuOnClick {
  kind: 'onclick';
  name: string;
  onClick: () => void;
  icon: React.ReactElement;
}

export const Sidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();

  const [open, setOpen] = useState(true);
  const classToggle = (): void => {
    setOpen(!open);
  };

  const menuItems: MenuItem[] = [
    {
      kind: 'navigate',
      name: t('sidebar.nav.dashboard'),
      path: '/dashboard',
      icon: <SVGDashboard />,
    },
    {
      kind: 'navigate',
      name: t('sidebar.nav.composer'),
      path: '/composer',
      icon: <SVGComposer />,
    },
    {
      kind: 'navigate',
      name: t('sidebar.nav.device'),
      path: '/device',
      icon: <SVGDevice />,
    },
    {
      kind: 'navigate',
      name: t('sidebar.nav.job'),
      path: '/jobs',
      icon: <SVGJob />,
    },
    {
      kind: 'navigate',
      name: t('sidebar.nav.document'),
      path: '/howto',
      icon: <SVGDocument />,
    },
    {
      kind: 'navigate',
      name: t('sidebar.nav.announcements'),
      path: '/announcements',
      icon: <SVGAnnouncements />,
    },
    {
      kind: 'onclick',
      name: t('sidebar.nav.logout'),
      onClick: () => {
        auth.signOut();
        navigate('/login');
      },
      icon: <SVGLogout />,
    },
  ];

  return (
    <div className="application-sidebar">
      <div className={clsx('relative', 'h-full', open ? 'min-w-[269px]' : 'min-w-auto')}>
        <div className={clsx(['sticky', 'top-0', 'left-0'], ['p-8', !open && 'pr-0'])}>
          <div
            className={clsx(
              ['ml-4', 'inline-block'],
              'cursor-pointer',
              open && '[&>img]:rotate-180'
            )}
            onClick={classToggle}
          >
            <img src="/img/common/sidebar_arrow.svg" alt="" width="25" height="25" />
          </div>
          <Spacer className="h-4" />
          <ul className={clsx('flex', 'flex-col', 'gap-[1px]', 'text-sm')}>
            {menuItems.map((menuItem, index) => (
              <li key={index}>
                <MenuItemComponent menuItem={menuItem} open={open} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * Navigation bottom bar is displayed only when the screen is too small (width < 768px) to display sidebar.
 * With such screens we hide the sidebar and display navigation bottom bar as sidebar's replacement.
 */
export const NavigationBottomBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();

  const menuItems: MenuItem[] = [
    {
      kind: 'navigate',
      name: t('sidebar.nav.dashboard'),
      path: '/dashboard',
      icon: <SVGDashboard />,
    },
    {
      kind: 'navigate',
      name: t('sidebar.nav.composer'),
      path: '/composer',
      icon: <SVGComposer />,
    },
    {
      kind: 'navigate',
      name: t('sidebar.nav.device'),
      path: '/device',
      icon: <SVGDevice />,
    },
    {
      kind: 'navigate',
      name: t('sidebar.nav.job'),
      path: '/jobs',
      icon: <SVGJob />,
    },
    {
      kind: 'navigate',
      name: t('sidebar.nav.document'),
      path: '/howto',
      icon: <SVGDocument />,
    },
    {
      kind: 'navigate',
      name: t('sidebar.nav.news'),
      path: '/news',
      icon: <SVGAnnouncements />,
      disable: true,
    },
    {
      kind: 'onclick',
      name: t('sidebar.nav.logout'),
      onClick: () => {
        auth.signOut();
        navigate('/login');
      },
      icon: <SVGLogout />,
    },
  ];

  return (
    <div className={clsx('navigation-bottom-bar')}>
      <ul
        className={clsx(
          'navigation-bottom-bar-item-list',
          'flex',
          'flex-col',
          'gap-[1px]',
          'text-sm'
        )}
      >
        {menuItems.map((menuItem, index) => (
          <li key={index}>
            <MenuItemComponent menuItem={menuItem} open={false} />
          </li>
        ))}
      </ul>
    </div>
  );
};

const MenuItemComponent = ({
  menuItem,
  open,
}: {
  menuItem: MenuItem;
  open: boolean;
}): React.ReactElement => {
  const STYLE_SIDEBAR = {
    button: {
      default: clsx(
        ['flex', 'gap-3', 'items-center', 'min-h-[56px]', 'p-4'],
        ['rounded', 'cursor-pointer'],
        ['text-primary', 'font-bold'],
        ['hover:bg-gradient-p-s', 'hover:text-primary-content'],
        ['[&.active]:bg-gradient-p-s', '[&.active]:text-primary-content'],
        'group'
      ),
      close: clsx('rounded-r-none', 'closed-navigation-menu-item'),
    },
    icon: clsx(
      'w-[23px]',
      ['flex', 'justify-center', 'box-content'],
      [
        ['[&_.fill]:fill-secondary', '[&_.stroke]:stroke-secondary'],
        'group-hover:[&_.fill]:fill-primary-content',
        'group-hover:[&_.stroke]:stroke-primary-content',
        'group-[.active]:[&_.fill]:fill-primary-content',
        'group-[.active]:[&_.stroke]:stroke-primary-content',
      ]
    ),
  };

  if (menuItem.kind === 'onclick') {
    return (
      <div
        className={clsx(STYLE_SIDEBAR.button.default, !open && STYLE_SIDEBAR.button.close)}
        onClick={menuItem.onClick}
      >
        <span className={STYLE_SIDEBAR.icon}>{menuItem.icon}</span>
        {open && <span>{menuItem.name}</span>}
      </div>
    );
  }

  const location = useLocation();
  const isCurrentPath = location.pathname.startsWith(menuItem.path);

  if (menuItem.disable === true) {
    return (
      <div
        className={clsx(
          STYLE_SIDEBAR.button.default,
          !open && STYLE_SIDEBAR.button.close,
          'grayscale'
        )}
      >
        <span className={STYLE_SIDEBAR.icon}>{menuItem.icon}</span>
        {open && <span>{menuItem.name}</span>}
      </div>
    );
  }
  return (
    <NavLink
      to={menuItem.path}
      className={clsx(
        STYLE_SIDEBAR.button.default,
        !open && STYLE_SIDEBAR.button.close,
        isCurrentPath && 'active'
      )}
    >
      <span className={STYLE_SIDEBAR.icon}>{menuItem.icon}</span>
      {open && <span>{menuItem.name}</span>}
    </NavLink>
  );
};

const SVGDashboard = (): React.ReactElement => (
  <svg width="23" height="20" viewBox="0 0 23 20">
    <path
      d="M20.4 0H2.26C1.02 0 0 1.12 0 2.5V13.2C0 14.58 1.02 15.7 2.26 15.7H20.4C21.65 15.7 22.66 14.58 22.66 13.2V2.5C22.66 1.12 21.64 0 20.4 0ZM2.26 1.38H20.4C20.95 1.38 21.39 1.88 21.39 2.5V12.74H1.27V2.5C1.27 1.88 1.71 1.38 2.26 1.38Z"
      className="fill"
    />
    <path
      d="M18.09 18.7099H14.06V16.6299H8.60002V18.7099H4.57002C4.27002 18.7099 4.02002 18.9499 4.02002 19.2399C4.02002 19.5299 4.27002 19.7699 4.57002 19.7699H18.09C18.39 19.7699 18.64 19.5299 18.64 19.2399C18.64 18.9499 18.39 18.7099 18.09 18.7099Z"
      className="fill"
    />
    <path d="M12.6103 3.19995H4.32031V7.73995H12.6103V3.19995Z" className="fill" />
    <path d="M7.99031 8.76001H4.32031V11.14H7.99031V8.76001Z" className="fill" />
    <path d="M12.5401 8.76001H8.87012V11.14H12.5401V8.76001Z" className="fill" />
    <path d="M17.9503 3.19995H13.5703V5.57995H17.9503V3.19995Z" className="fill" />
    <path d="M17.9503 6.58008H13.5703V11.1401H17.9503V6.58008Z" className="fill" />
  </svg>
);

const SVGComposer = (): React.ReactElement => (
  <svg width="20" height="19" viewBox="0 0 20 19">
    <g clipPath="url(#clip0_394_6409)">
      <path d="M0 3.48999H2.15" strokeWidth="1.5" strokeMiterlimit="10" className="stroke" />
      <path
        d="M7.97021 3.48999H10.2402"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        className="stroke"
      />
      <path d="M0 14.84H9.92" strokeWidth="1.5" strokeMiterlimit="10" className="stroke" />
      <path
        d="M6.49021 0.75H3.22021C2.66793 0.75 2.22021 1.19772 2.22021 1.75V5.02C2.22021 5.57228 2.66793 6.02 3.22021 6.02H6.49021C7.0425 6.02 7.49021 5.57228 7.49021 5.02V1.75C7.49021 1.19772 7.0425 0.75 6.49021 0.75Z"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        fill="none"
        className="stroke"
      />
      <path
        d="M12.8002 17.7101C14.3963 17.7101 15.6902 16.4162 15.6902 14.8201C15.6902 13.224 14.3963 11.9301 12.8002 11.9301C11.2041 11.9301 9.91016 13.224 9.91016 14.8201C9.91016 16.4162 11.2041 17.7101 12.8002 17.7101Z"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        fill="none"
        className="stroke"
      />
      <path
        d="M12.7999 4.88003C13.6891 4.88003 14.4099 4.15921 14.4099 3.27003C14.4099 2.38086 13.6891 1.66003 12.7999 1.66003C11.9108 1.66003 11.1899 2.38086 11.1899 3.27003C11.1899 4.15921 11.9108 4.88003 12.7999 4.88003Z"
        className="fill"
      />
      <path d="M12.7998 11.94V5.98999" strokeWidth="1.5" strokeMiterlimit="10" className="stroke" />
      <path d="M15.7402 14.84H19.8302" strokeWidth="1.5" strokeMiterlimit="10" className="stroke" />
      <path
        d="M15.4399 3.48999H19.7299"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        className="stroke"
      />
    </g>
    <defs>
      <clipPath id="clip0_394_6409">
        <rect width="19.83" height="18.46" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const SVGDevice = (): React.ReactElement => (
  <svg width="21" height="22" viewBox="0 0 21 22">
    <path
      d="M10.4542 12.644C11.3476 12.644 12.0719 11.9428 12.0719 11.0779C12.0719 10.2129 11.3476 9.51172 10.4542 9.51172C9.56072 9.51172 8.83643 10.2129 8.83643 11.0779C8.83643 11.9428 9.56072 12.644 10.4542 12.644Z"
      className="fill"
    />
    <path
      d="M10.5048 21C12.2196 21 13.6097 16.5228 13.6097 11C13.6097 5.47715 12.2196 1 10.5048 1C8.79 1 7.3999 5.47715 7.3999 11C7.3999 16.5228 8.79 21 10.5048 21Z"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      fill="none"
      className="stroke"
    />
    <path
      d="M19.4475 16.0064C20.3049 14.5687 16.9949 11.1647 12.0544 8.40323C7.11386 5.64181 2.41373 4.5687 1.55634 6.00637C0.698956 7.44404 4.00899 10.8481 8.94951 13.6095C13.89 16.3709 18.5902 17.444 19.4475 16.0064Z"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      fill="none"
      className="stroke"
    />
    <path
      d="M12.0505 13.6004C16.991 10.839 20.301 7.43496 19.4436 5.9973C18.5862 4.55963 13.8861 5.63274 8.9456 8.39417C4.00508 11.1556 0.69505 14.5596 1.55244 15.9973C2.40983 17.435 7.10996 16.3618 12.0505 13.6004Z"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      fill="none"
      className="stroke"
    />
  </svg>
);

const SVGJob = (): React.ReactElement => (
  <svg width="15" height="15" viewBox="0 0 15 15">
    <path
      d="M0 11.4826V14.5039H3.12458L12.34 5.59325L9.21542 2.57203L0 11.4826ZM14.7563 2.12086L12.8066 0.235611C12.7295 0.160923 12.6379 0.101669 12.5372 0.0612394C12.4364 0.0208102 12.3283 0 12.2192 0C12.1101 0 12.002 0.0208102 11.9012 0.0612394C11.8004 0.101669 11.7088 0.160923 11.6318 0.235611L10.107 1.70997L13.2315 4.7312L14.7563 3.25684C14.8336 3.1823 14.8949 3.09377 14.9367 2.99631C14.9785 2.89884 15 2.79436 15 2.68885C15 2.58333 14.9785 2.47885 14.9367 2.38139C14.8949 2.28392 14.8336 2.19539 14.7563 2.12086Z"
      className="fill"
    />
  </svg>
);

const SVGDocument = (): React.ReactElement => (
  <svg width="22" height="22" viewBox="0 0 22 22">
    <path
      d="M17.4167 2.74996H13.585C13.2 1.68663 12.1917 0.916626 11 0.916626C9.80833 0.916626 8.8 1.68663 8.415 2.74996H4.58333C3.575 2.74996 2.75 3.57496 2.75 4.58329V19.25C2.75 20.2583 3.575 21.0833 4.58333 21.0833H17.4167C18.425 21.0833 19.25 20.2583 19.25 19.25V4.58329C19.25 3.57496 18.425 2.74996 17.4167 2.74996ZM11 2.74996C11.5042 2.74996 11.9167 3.16246 11.9167 3.66663C11.9167 4.17079 11.5042 4.58329 11 4.58329C10.4958 4.58329 10.0833 4.17079 10.0833 3.66663C10.0833 3.16246 10.4958 2.74996 11 2.74996ZM17.4167 19.25H4.58333V4.58329H6.41667V7.33329H15.5833V4.58329H17.4167V19.25Z"
      className="fill"
    />
  </svg>
);

const SVGAnnouncements = (): React.ReactElement => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <path
      d="M3.33317 3.33329H16.6665V13.3333H4.30817L3.33317 14.3083V3.33329ZM3.33317 1.66663C2.4165 1.66663 1.67484 2.41663 1.67484 3.33329L1.6665 18.3333L4.99984 15H16.6665C17.5832 15 18.3332 14.25 18.3332 13.3333V3.33329C18.3332 2.41663 17.5832 1.66663 16.6665 1.66663H3.33317ZM4.99984 9.99996H11.6665V11.6666H4.99984V9.99996ZM4.99984 7.49996H14.9998V9.16663H4.99984V7.49996ZM4.99984 4.99996H14.9998V6.66663H4.99984V4.99996Z"
      className="fill"
    />
  </svg>
);

const SVGLogout = (): React.ReactElement => (
  <svg width="17" height="18" viewBox="0 0 17 18">
    <g clipPath="url(#clip0_394_5853)">
      <path
        d="M9.6333e-05 8.98079C9.6333e-05 6.85415 9.6333e-05 4.72577 9.6333e-05 2.59913C0.00360402 1.03542 1.03662 0.00337748 2.60455 0.00164003C5.67729 -9.74263e-05 8.75002 -0.00183488 11.8228 0.00164003C13.1697 0.00337748 14.1747 0.859941 14.3606 2.14392C14.4535 2.78678 14.115 3.31322 13.5503 3.40531C12.9399 3.50261 12.4717 3.136 12.3717 2.45666C12.3244 2.13697 12.156 1.99102 11.8385 1.99102C8.73774 1.99102 5.63695 1.99102 2.53615 1.99102C2.16785 1.99102 2.00825 2.18388 2.00825 2.54179C2.01 6.83851 2.01 11.1352 2.00825 15.4302C2.00825 15.8107 2.18012 15.9949 2.56597 15.9949C5.65273 15.9949 8.7395 15.9949 11.8263 15.9949C12.163 15.9949 12.3314 15.8403 12.3752 15.4997C12.4559 14.869 12.9014 14.5146 13.4959 14.5754C14.0554 14.6345 14.429 15.1314 14.3728 15.7447C14.2571 16.9991 13.2556 17.9686 11.9613 17.9773C8.77633 17.9999 5.59135 18.0051 2.40637 17.9756C1.01031 17.9634 0.00535786 16.8792 0.00185018 15.4841C-0.00341135 13.3157 0.00185018 11.1457 0.00185018 8.97732L9.6333e-05 8.98079Z"
        className="fill"
      />
      <path
        d="M9.13925 9.99208C7.91857 9.99208 6.69965 9.99382 5.47898 9.99208C4.75815 9.99208 4.28461 9.58031 4.29864 8.97915C4.31267 8.39363 4.77744 8.00096 5.47723 8.00096C7.94488 7.99749 10.4125 8.00096 12.8802 7.99575C13.0345 7.99575 13.1889 7.92625 13.345 7.88977C13.2608 7.75598 13.1959 7.60482 13.0872 7.49189C12.6434 7.02799 12.1839 6.57973 11.7384 6.11756C11.2737 5.63455 11.2561 5.04382 11.6788 4.63378C12.1068 4.22027 12.696 4.2498 13.1713 4.7276C14.3236 5.88475 15.4706 7.0471 16.6141 8.21119C17.128 8.73417 17.128 9.25888 16.6141 9.78011C15.4689 10.9442 14.3219 12.1066 13.1696 13.2637C12.6925 13.7432 12.1068 13.7745 11.6788 13.361C11.2561 12.9527 11.2737 12.3568 11.7367 11.8772C12.2015 11.3942 12.6803 10.9268 13.145 10.4438C13.2327 10.3517 13.2783 10.2197 13.3432 10.105C13.2169 10.0685 13.0907 9.99903 12.9644 9.99903C11.6876 9.99035 10.4125 9.99382 9.13574 9.99382L9.13925 9.99208Z"
        className="fill"
      />
    </g>
    <defs>
      <clipPath id="clip0_394_5853">
        <rect width="17" height="18" />
      </clipPath>
    </defs>
  </svg>
);
