import SwaggerUI from 'swagger-ui-react';
import clsx from 'clsx';
import 'swagger-ui-react/swagger-ui.css';

export const Specifications = () => {
  return (
    <div className={clsx('prose', 'min-w-full', 'swagger-doc')}>
      <style>{`
        /* Adjust swagger UI styles. */
        .swagger-ui {
          .information-container {
            .title span small pre {
              background-color: unset;
            }
          }
          .response-col_description {
            padding-bottom: 10px;
          }
          .model-container .model-box {
            padding-bottom: 5px;
          }
        }
        .swagger-ui .opblock-body {
          overflow-x: auto;
        }
        .swagger-ui .parameters td p {
          white-space:normal !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
        }

        /* Keep Swagger readable in dark mode. */
        .dark .swagger-doc .swagger-ui {
          color: rgb(var(--base-content));
        }
        .dark .swagger-doc .swagger-ui .opblock-tag,
        .dark .swagger-doc .swagger-ui .opblock-summary-path,
        .dark .swagger-doc .swagger-ui .opblock-summary-description,
        .dark .swagger-doc .swagger-ui .model-title,
        .dark .swagger-doc .swagger-ui .parameter__name,
        .dark .swagger-doc .swagger-ui .response-col_status,
        .dark .swagger-doc .swagger-ui .response-col_description,
        .dark .swagger-doc .swagger-ui .tab li,
        .dark .swagger-doc .swagger-ui .info p,
        .dark .swagger-doc .swagger-ui .info li,
        .dark .swagger-doc .swagger-ui .markdown p,
        .dark .swagger-doc .swagger-ui .markdown li,
        .dark .swagger-doc .swagger-ui label,
        .dark .swagger-doc .swagger-ui small {
          color: rgb(var(--base-content));
        }
        .dark .swagger-doc .swagger-ui .scheme-container,
        .dark .swagger-doc .swagger-ui .opblock .opblock-summary,
        .dark .swagger-doc .swagger-ui .opblock .opblock-body,
        .dark .swagger-doc .swagger-ui table thead tr td,
        .dark .swagger-doc .swagger-ui table thead tr th,
        .dark .swagger-doc .swagger-ui .responses-inner h4,
        .dark .swagger-doc .swagger-ui .responses-inner h5 {
          background: rgb(var(--base-card));
          color: rgb(var(--base-content));
        }
        .dark .swagger-doc .swagger-ui input,
        .dark .swagger-doc .swagger-ui textarea,
        .dark .swagger-doc .swagger-ui select {
          background: rgb(var(--base-card));
          color: rgb(var(--base-content));
          border-color: rgb(var(--table-border));
        }
      `}</style>
      <SwaggerUI
        url={`${import.meta.env.VITE_APP_PUBLIC_PATH ?? ''}/openapi.yaml`}
        deepLinking={true}
      />
    </div>
  );
};
