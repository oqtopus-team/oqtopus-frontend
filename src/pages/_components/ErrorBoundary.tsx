import { ErrorBoundary as ErrorBoundaryNative, FallbackProps } from 'react-error-boundary';
import { ErrorBoundaryProps } from 'react-error-boundary';

function fallbackRender({ error }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{errorMessage}</pre>
    </div>
  );
}

export const ErrorBoundary = (props: Partial<ErrorBoundaryProps>) => {
  const { children } = props;
  return <ErrorBoundaryNative fallbackRender={fallbackRender}>{children}</ErrorBoundaryNative>;
};
