import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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

interface ThemeContextType {
  theme: ThemeOptions;
  setTheme: (theme: ThemeOptions) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeOptions>(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === ThemeOptions.DARK;

    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
