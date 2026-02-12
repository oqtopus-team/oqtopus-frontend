import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',

      //
      // Primitive colors
      //
      primary: 'rgb(var(--primary) / <alpha-value>)',
      'primary-content': 'rgb(var(--primary-content) / <alpha-value>)',
      secondary: 'rgb(var(--secondary) / <alpha-value>)',
      'secondary-content': 'rgb(var(--secondary-content) / <alpha-value>)',
      'base-100': 'rgb(var(--base-100) / <alpha-value>)',
      'base-card': 'rgb(var(--base-card) / <alpha-value>)',
      'base-content': 'rgb(var(--base-content) / <alpha-value>)',
      'neutral-content': 'rgb(var(--neutral-content) / <alpha-value>)',
      info: 'rgb(var(--info) / <alpha-value>)',
      'info-content': 'rgb(var(--info-content) / <alpha-value>)',
      'info-base-content': 'rgb(var(--info-base-content) / <alpha-value>)',
      error: 'rgb(var(--error) / <alpha-value>)',
      'error-content': 'rgb(var(--error-content) / <alpha-value>)',
      'error-base-content': 'rgb(var(--error-base-content) / <alpha-value>)',
      success: 'rgb(var(--success) / <alpha-value>)',
      'success-base-content': 'rgb(var(--success-base-content) / <alpha-value>)',
      'disable-bg': 'rgb(var(--disable-bg) / <alpha-value>)',
      'disable-content': 'rgb(var(--disable-content) / <alpha-value>)',
      'gray-bg': 'rgb(var(--gray-bg) / <alpha-value>)',

      //
      // Exclusive colors
      //
      'divider-bg': 'rgb(var(--divider-bg) / <alpha-value>)',
      'status-device-red': 'rgb(var(--status-device-red) / <alpha-value>)',
      'status-device-green': 'rgb(var(--status-device-green) / <alpha-value>)',
      'status-job-submitted': 'rgb(var(--status-job-submitted) / <alpha-value>)',
      'status-job-ready': 'rgb(var(--status-job-ready) / <alpha-value>)',
      'status-job-running': 'rgb(var(--status-job-running) / <alpha-value>)',
      'status-job-succeeded': 'rgb(var(--status-job-succeeded) / <alpha-value>)',
      'status-job-failed': 'rgb(var(--status-job-failed) / <alpha-value>)',
      'status-job-cancelled': 'rgb(var(--status-job-cancelled) / <alpha-value>)',
      'status-job-unknown': 'rgb(var(--status-job-unknown) / <alpha-value>)',
      'login-explanation-bg': 'rgb(var(--login-explanation-bg) / <alpha-value>)',
      'scrollbar-bg': 'rgb(var(--scrollbar-bg) / <alpha-value>)',
      'scrollbar-thumb': 'rgb(var(--scrollbar-thumb) / <alpha-value>)',
      'table-border': 'rgb(var(--table-border) / <alpha-value>)',
      'cmd-bg': 'rgb(var(--cmd-bg) / <alpha-value>)',
      'modal-bg': 'rgb(var(--modal-bg) / <alpha-value>)',

      // Quantum Circuit colors
      'gate-atomic': 'rgb(var(--gate-atomic) / <alpha-value>)',
      'gate-controlled': 'rgb(var(--gate-controlled) / <alpha-value>)',
      'gate-parametrized': 'rgb(var(--gate-parametrized) / <alpha-value>)',
      'gate-operation-border': 'rgb(var(--gate-operation-border) / <alpha-value>)',
      'gate-operation-enabled': 'rgb(var(--gate-operation-enabled) / <alpha-value>)',
    },
    fontSize: {
      '2xs': '10px',
      xs: '13px',
      sm: '15px',
      lg: '16px',
      xl: '20px',
      '2xl': '25px',
      '3xl': '35px',
    },
    boxShadow: {
      lg: '0 2px 6px rgb(var(--box-shadow-color) / 0.3)',
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        success: '#38c172',
        error: '#e3342f',
      },
      fontSize: {
        clamp: 'clamp(1rem, 5vw, 2.5rem)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
