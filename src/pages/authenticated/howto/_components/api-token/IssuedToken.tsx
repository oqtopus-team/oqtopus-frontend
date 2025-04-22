import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { createApiToken, deleteApiToken } from './ApiToken';
import { Setter } from './ApiTokenComponent';
import clsx from 'clsx';
import { Card } from '@/pages/_components/Card';
import { ConfirmModal } from '@/pages/_components/ConfirmModal';
import { Button } from '@/pages/_components/Button';
import { Spacer } from '@/pages/_components/Spacer';
import { userApiContext } from '@/backend/Provider';
import { DateTimeFormatter } from '../../../_components/DateTimeFormatter';

export const IssuedToken = ({
  state,
}: {
  state: {
    apiTokenSecret: string;
    apiTokenExpiration: string;
    processing: boolean;
    set: Setter;
  };
}): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showExpireModal, setShowExpireModal] = useState(false);
  const { apiToken } = useContext(userApiContext);

  const openIssueModal = (): void => {
    setShowIssueModal(true);
  };
  const closeIssueModal = (): void => {
    setShowIssueModal(false);
  };
  const openExpireModal = (): void => {
    setShowExpireModal(true);
  };
  const closeExpireModal = (): void => {
    setShowExpireModal(false);
  };

  // トークンコピー
  const copyApiToken = (): void => {
    navigator.clipboard.writeText(state.apiTokenSecret).catch((e) => console.error(e));
  };

  // トークン発行
  const issueApiToken = async (): Promise<void> => {
    if (state.processing) return; // ダブルクリック防止
    state.set.isProcessing(true);

    const result = await createApiToken(apiToken);
    if (result.operationResult.success) {
      // @memo: amplify-jsのrefreshSessionの実装のために、
      // Cognitoでの再発行処理が終わる前にここに到達する可能性がある
      // success表示を出した後に失敗することもありえる
      state.set.message({ kind: 'success', text: result.operationResult.message });
      state.set.apiTokenSecret(result.token.secret);
      state.set.apiTokenExpiration(result.token.expiration);
    } else {
      state.set.message({ kind: 'alert', text: result.operationResult.message });
    }

    state.set.isProcessing(false);
    closeIssueModal();
  };

  // トークン無効化
  const expireApiToken = async (): Promise<void> => {
    if (state.processing) return; // ダブルクリック防止
    state.set.isProcessing(true);

    const result = await deleteApiToken(apiToken);
    if (result.operationResult.success) {
      state.set.message({ kind: 'success', text: result.operationResult.message });
      state.set.apiTokenSecret('');
      state.set.apiTokenExpiration('');
    } else {
      state.set.message({ kind: 'alert', text: result.operationResult.message });
    }

    state.set.isProcessing(false);
    closeExpireModal();
  };

  return (
    <Card>
      <h3 className={clsx('text-primary', 'font-bold')}>{t('howto.token.head')}</h3>
      <Spacer className="h-2" />
      <div className={clsx('flex', 'justify-between')}>
        <p className="text-xs">
          ****************（{t('howto.token.expiry_date')}{' '}
          {DateTimeFormatter(t, i18n, state.apiTokenExpiration)}）
        </p>
        <div className={clsx('flex', 'justify-end', 'gap-2')}>
          <Button
            id="copy-button"
            onClick={async (e) => {
              const defaultClassName = e.currentTarget.className;
              if (e.currentTarget.className.includes('is-active')) {
                e.currentTarget.className = e.currentTarget.className.replace(' is-active', '');
              }
              e.currentTarget.className += ' is-active';
              copyApiToken();
              await new Promise((resolve) => setTimeout(resolve, 3000));
              document.getElementById('copy-button')!.className = defaultClassName;
            }}
            color="secondary"
            size="small"
            className={clsx('tooltip-primary')}
            data-tooltip={t('howto.token.copied')}
          >
            {t('howto.copy_button')}
          </Button>
          <Button onClick={openIssueModal} color="secondary" size="small">
            {t('howto.reissue_button')}
          </Button>
          <Button onClick={openExpireModal} color="secondary" data-type="error" size="small">
            {t('howto.revocation_button')}
          </Button>
        </div>
      </div>
      <ConfirmModal
        show={showIssueModal}
        onHide={closeIssueModal}
        title={t('howto.modal.issue_head')}
        message={t('howto.modal.issue_txt')}
        onConfirm={issueApiToken}
      />
      <ConfirmModal
        show={showExpireModal}
        onHide={closeExpireModal}
        title={t('howto.modal.revocation_head')}
        message={t('howto.modal.revocation_txt')}
        onConfirm={expireApiToken}
      />
    </Card>
  );
};
