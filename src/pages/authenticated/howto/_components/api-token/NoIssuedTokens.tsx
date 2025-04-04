import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { createApiToken } from './ApiToken';
import { Setter } from './ApiTokenComponent';
import clsx from 'clsx';
import { Card } from '@/pages/_components/Card';
import { Button } from '@/pages/_components/Button';
import { ConfirmModal } from '@/pages/_components/ConfirmModal';
import { Spacer } from '@/pages/_components/Spacer';
import { userApiContext } from '@/backend/Provider';

export const NoIssuedTokens = ({
  state,
}: {
  state: { processing: boolean; set: Setter };
}): React.ReactElement => {
  const { t } = useTranslation();
  const [showIssueModal, setShowIssueModal] = useState(false);
  const { apiToken } = useContext(userApiContext);

  const openIssueModal = (): void => {
    setShowIssueModal(true);
  };
  const closeIssueModal = (): void => {
    setShowIssueModal(false);
  };

  // トークン発行ボタン
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

  return (
    <Card>
      <h3 className={clsx('text-primary', 'font-bold')}>{t('howto.token.head')}</h3>
      <Spacer className="h-2" />
      <div className={clsx('flex', 'justify-between')}>
        <p className="text-xs">{t('howto.token.none')}</p>
        <Button onClick={openIssueModal} color="secondary">
          {t('howto.issue_button')}
        </Button>
      </div>
      <ConfirmModal
        show={showIssueModal}
        onHide={closeIssueModal}
        title={t('howto.modal.issue_head')}
        message={t('howto.modal.issue_txt')}
        onConfirm={issueApiToken}
      />
    </Card>
  );
};
