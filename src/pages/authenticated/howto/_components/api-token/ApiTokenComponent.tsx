import { useLayoutEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { NoIssuedTokens } from './NoIssuedTokens';
import { IssuedToken } from './IssuedToken';
import clsx from 'clsx';
import { API_TOKEN_API_MESSAGE, getApiToken } from './ApiToken';
import { Card } from '@/pages/_components/Card';
import { Loader } from '@/pages/_components/Loader';
import { Alert } from '@/pages/_components/Alert';
import i18next from 'i18next';
import { Spacer } from '@/pages/_components/Spacer';
import { userApiContext } from '@/backend/Provider';

type message =
  | { kind: 'empty' }
  | {
      kind: 'info' | 'success' | 'alert';
      text: string;
    };

const ApiTokenComponent = (): React.ReactElement => {
  const [callingApi, setCallingApi] = useState(false);

  const [message, setMessageState] = useState<message>({ kind: 'empty' });
  const [apiTokenSecret, setApiTokenSecret] = useState<string>('');
  const [apiTokenExpiration, setApiTokenExpiration] = useState<string>('');
  const { apiToken } = useContext(userApiContext);

  useLayoutEffect(() => {
    setCallingApi(true);
    getApiToken(apiToken)
      .then((result) => {
        if (!result.operationResult.success) {
          setMessageState({ kind: 'alert', text: result.operationResult.message });
          setCallingApi(false);
          return;
        }
        if (
          /* token not found */
          result.operationResult.message ===
          API_TOKEN_API_MESSAGE(i18next.language).get.success.not_found
        ) {
          setMessageState({ kind: 'info', text: result.operationResult.message });
          setCallingApi(false);
          return;
        }

        setMessageState({ kind: 'success', text: result.operationResult.message });
        setApiTokenSecret(result.token.secret);
        setApiTokenExpiration(result.token.expiration);

        setCallingApi(false);
      })
      .catch((e) => {
        setCallingApi(false);
        console.error(e);
      });
  }, []);

  if (callingApi) {
    return (
      <ApiTokenComponentBase message={message}>
        <Loading />
      </ApiTokenComponentBase>
    );
  }
  if (apiTokenSecret === '') {
    return (
      <ApiTokenComponentBase message={message}>
        <NoIssuedTokens
          state={{
            processing: callingApi,
            set: {
              isProcessing: setCallingApi,
              message: setMessageState,
              apiTokenSecret: setApiTokenSecret,
              apiTokenExpiration: setApiTokenExpiration,
            },
          }}
        />
      </ApiTokenComponentBase>
    );
  }
  return (
    <ApiTokenComponentBase message={message}>
      <IssuedToken
        state={{
          apiTokenSecret,
          apiTokenExpiration,
          processing: callingApi,
          set: {
            isProcessing: setCallingApi,
            message: setMessageState,
            apiTokenSecret: setApiTokenSecret,
            apiTokenExpiration: setApiTokenExpiration,
          },
        }}
      />
    </ApiTokenComponentBase>
  );
};

export default ApiTokenComponent;

const ApiTokenComponentBase = ({
  message,
  children,
}: {
  message: message;
} & React.PropsWithChildren): React.ReactElement => {
  return (
    <div className={clsx('flex', 'flex-col', 'gap-5')}>
      {message.kind === 'info' && <InfoMessageCard message={message.text} />}
      {message.kind === 'success' && <SuccessMessageCard message={message.text} />}
      {message.kind === 'alert' && <AlertMessageCard message={message.text} />}
      {children}
    </div>
  );
};

const SuccessMessageCard = ({ message }: { message: string }): React.ReactElement => (
  <Card className="!p-0">
    <Alert variation="success" message={message} />
  </Card>
);

const AlertMessageCard = ({ message }: { message: string }): React.ReactElement => (
  <Card className="!p-0">
    <Alert variation="error" message={message} />
  </Card>
);

const InfoMessageCard = ({ message }: { message: string }): React.ReactElement => (
  <Card className="!p-0">
    <Alert variation="info" message={message} />
  </Card>
);

const Loading = (): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <Card>
      <h3 className={clsx('text-primary', 'font-bold')}>{t('howto.token.head')}</h3>
      <Spacer className="h-2" />
      <Loader />
    </Card>
  );
};

export interface Setter {
  isProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  message: React.Dispatch<React.SetStateAction<message>>;
  apiTokenSecret: React.Dispatch<React.SetStateAction<string>>;
  apiTokenExpiration: React.Dispatch<React.SetStateAction<string>>;
}
