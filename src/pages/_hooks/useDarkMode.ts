import { useEffect, useState } from 'react';

export enum ThemeOptions {
  LIGHT = 'light',
  DARK = 'dark',
}

const getInitialTheme = (): ThemeOptions => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme as ThemeOptions;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? ThemeOptions.DARK
    : ThemeOptions.LIGHT;
};

export default function useDarkMode() {
  const [theme, setTheme] = useState<ThemeOptions>(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === ThemeOptions.DARK;

    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}