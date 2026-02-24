import Prism from 'prismjs';
import 'prismjs/components/prism-openqasm';
import { ComponentPropsWithRef, forwardRef, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Select } from '@/pages/_components/Select';
import './CodeEditor.css';
import { Spacer } from '@/pages/_components/Spacer';
import { useTranslation } from 'react-i18next';
import { ThemeOptions, useTheme } from '@/theme/useTheme';

type Props = {
  disabled: boolean;
  fixedTheme?: ThemeKind;
  errorMessage?: string;
  code: string;
};

const themes = ['default', 'solarizedlight', 'dark', 'okaidia', 'tomorrow', 'twilight'] as const;

type ThemeKind = (typeof themes)[number];

type Theme = {
  href: string;
  type: 'light' | 'dark';
};

const themesMap: Record<ThemeKind, Theme> = {
  default: {
    href: '/prism-code-themes/prism.css',
    type: 'light',
  },
  solarizedlight: {
    href: '/prism-code-themes/prism-solarizedlight.css',
    type: 'light',
  },
  dark: {
    href: '/prism-code-themes/prism-dark.css',
    type: 'dark',
  },
  okaidia: {
    href: '/prism-code-themes/prism-okaidia.css',
    type: 'dark',
  },
  tomorrow: {
    href: '/prism-code-themes/prism-tomorrow.css',
    type: 'dark',
  },
  twilight: {
    href: '/prism-code-themes/prism-twilight.css',
    type: 'dark',
  },
};

export const CodeEditor = forwardRef<
  HTMLTextAreaElement,
  ComponentPropsWithRef<'textarea'> & Props
>(({ code, disabled, fixedTheme, errorMessage, ...props }, ref) => {
  const { t } = useTranslation();

  const preRef = useRef<HTMLPreElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { theme: appTheme } = useTheme();

  const [selectedTheme, setSelectedTheme] = useState<ThemeKind>(
    fixedTheme ??
      (localStorage.getItem('prism-code-theme') as ThemeKind) ??
      defaultThemeBasedOnAppTheme()
  );

  useEffect(() => {
    loadTheme(selectedTheme, false);
  }, []);

  useEffect(() => {
    if (!fixedTheme) return;
    loadTheme(fixedTheme);
  }, [fixedTheme]);

  useEffect(() => {
    if (!codeRef.current || !textareaRef.current) return;

    codeRef.current.textContent = code;
    Prism.highlightElement(codeRef.current);

    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    codeRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [code]);

  const setRefs = (node: any) => {
    textareaRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else {
      if (ref) ref.current = node;
    }
  };

  function defaultThemeBasedOnAppTheme(): ThemeKind {
    switch (appTheme) {
      case ThemeOptions.LIGHT:
        return 'default';
      case ThemeOptions.DARK:
        return 'okaidia';
    }
  }

  function loadTheme(newTheme: ThemeKind, updateStateOnLoad = true) {
    const theme = themesMap[newTheme];
    if (!theme) return;

    let themeLink = document.getElementById('prism-theme') as HTMLLinkElement;

    if (!themeLink) {
      themeLink = document.createElement('link');
      themeLink.id = 'prism-theme';
      themeLink.rel = 'stylesheet';
      document.head.appendChild(themeLink);
    }

    themeLink.onload = () => {
      if (updateStateOnLoad) {
        localStorage.setItem('prism-code-theme', newTheme);
        setSelectedTheme(newTheme);
      }
    };
    themeLink.href = theme.href;
  }

  function copyBackgroundAndColorFromTheme() {
    if (!preRef.current) return {};

    const style = getComputedStyle(preRef.current);

    return {
      background: style.background,
      color: style.color,
    };
  }

  const theme = themesMap[selectedTheme] ?? themesMap.default;

  return (
    <>
      {!fixedTheme && (
        <div className={clsx('flex', 'justify-end', '[&_*]:bg-base-card', 'text-base-content')}>
          <Select
            value={selectedTheme}
            labelLeft={t('composer.code_editor.theme')}
            onChange={(e) => {
              loadTheme(e.target.value as ThemeKind);
            }}
            size="xs"
          >
            {Object.entries(themesMap).map(([key, theme]) => (
              <option key={key} value={key}>
                {`${key} (${theme.type})`}
              </option>
            ))}
          </Select>
        </div>
      )}
      <Spacer className="h-2" />
      <div className={clsx(['grid', 'gap-1'], ['h-64', 'max-h-64', 'overflow-auto'])}>
        <div
          className={clsx('flex', 'flex-row', 'rounded')}
          style={copyBackgroundAndColorFromTheme()}
        >
          <div className="code-editor-line-numbers">
            {code.split('\n').map((_, i) => (
              <>
                {/* prism classes used to base line number color on token from prism, to adjust to theme changes */}
                <span className="token punctuation">{i + 1}</span>
                <br />
              </>
            ))}
          </div>
          <div className="qasm-code-editor-code-container">
            <pre ref={preRef} className="qasm-code-editor-code-pre">
              <code ref={codeRef} className="qasm-code-editor-code language-qasm" />
            </pre>

            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '10px' }}>
              <textarea
                ref={setRefs}
                className="qasm-code-editor-text-area"
                style={{
                  caretColor: theme.type === 'light' ? 'black' : 'white',
                }}
                {...props}
                disabled={disabled}
                value={code}
                spellCheck="false"
              />
            </div>
          </div>
        </div>
      </div>
      {errorMessage && (
        <p className={clsx('text-xs', 'text-error', 'font-semibold')}>{errorMessage}</p>
      )}
    </>
  );
});
