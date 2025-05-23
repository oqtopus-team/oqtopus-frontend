import SwaggerUI from 'swagger-ui-react';
import clsx from 'clsx';
import 'swagger-ui-react/swagger-ui.css';

export const Specifications = () => {
  return (
    <div className={clsx('prose', 'min-w-full')}>
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
      `}</style>
      <SwaggerUI
        url={`${import.meta.env.VITE_APP_PUBLIC_PATH ?? ''}/openapi.yaml`}
        deepLinking={true}
      />
    </div>
  );
};
