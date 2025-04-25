import type { Config } from 'tailwindcss';

const config: Config = {
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
      primary: '#4887fa',
      'primary-content': '#ffffff',
      secondary: '#38bdf7',
      'secondary-content': '#ffffff',
      'base-100': '#f0f8ff',
      'base-card': '#ffffff',
      'base-content': '#2d2d2d',
      'neutral-content': '#959393',
      info: '#38bdf7',
      'info-content': '#ffffff',
      'info-base-content': '#4887fa',
      error: '#fc6464',
      'error-content': '#ffffff',
      'error-base-content': '#660000',
      success: '#EBFAED',
      'success-base-content': '#416746',
      'disable-bg': '#d1d5db',
      'disable-content': '#787c82',
      'gray-bg': '#EFEFF0',

      //
      // Exclusive colors
      //
      'divider-bg': '#E5E7EB',
      'status-device-red': '#fc6464',
      'status-device-green': '#43d787',
      'status-job-submitted': '#4CAF50',
      'status-job-ready': '#FFC107',
      'status-job-running': '#2196F3',
      'status-job-succeeded': '#43d787',
      'status-job-failed': '#fc6464',
      'status-job-cancelled': '#9E9E9E',
      'status-job-unknown': '#5F5F5F',
      'login-explanation-bg': '#f8f8f8',
      'scrollbar-bg': '#f5f5f5',
      'scrollbar-thumb': '#c4c4c4',
      'table-border': '#d9d9d9',
      'cmd-bg': '#f3f4f6',
      'modal-bg': '#000000',
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
      lg: '0 2px 6px #0d1a264d',
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
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
