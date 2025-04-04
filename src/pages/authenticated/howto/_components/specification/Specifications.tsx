import SwaggerUI from 'swagger-ui-react';
import clsx from 'clsx';
import 'swagger-ui-react/swagger-ui.css';

export const Specifications = () => {
  return (
    <div className={clsx('prose', 'min-w-[1200px]')}>
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
      `}</style>
      <SwaggerUI url={`${import.meta.env.VITE_APP_PUBLIC_PATH ?? ''}/openapi.yaml`} />
    </div>
  );
};
