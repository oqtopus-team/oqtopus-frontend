import { ErrorBoundary as ErrorBoundaryNative } from 'react-error-boundary';
import { ErrorBoundaryProps } from 'react-error-boundary';

interface FallbackProps {
  error?: Error;
}

function fallbackRender({ error }: FallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error?.message}</pre>
    </div>
  );
}

export const ErrorBoundary = (props: Partial<ErrorBoundaryProps>) => {
  const { children } = props;
  return <ErrorBoundaryNative fallbackRender={fallbackRender}>{children}</ErrorBoundaryNative>;
};
