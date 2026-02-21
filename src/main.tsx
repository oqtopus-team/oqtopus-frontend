import ReactDOM from 'react-dom/client';
import './i18n/config';
import { App } from './App';
import { ErrorBoundary } from '@/pages/_components/ErrorBoundary';
import { ThemeProvider } from '@/theme/useTheme';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ErrorBoundary>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </ErrorBoundary>
);
