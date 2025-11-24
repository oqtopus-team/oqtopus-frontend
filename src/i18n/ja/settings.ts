export default {
  title: '設定',
  save: '変更を保存',
  saving: '保存中...',
  updating: '更新中...',
  resetting: 'リセット中...',
  cancel: 'キャンセル',

  tabs: {
    profile: 'プロフィール',
    account: 'アカウント',
    security: 'セキュリティ',
  },

  profile: {
    title: 'プロフィール情報',
    email: 'メールアドレス',
    name: '表示名',
    organization: '組織',
    memberSince: '登録日',
    emailReadonly: 'メールアドレスは変更できません',
    memberSinceReadonly: 'アカウント作成日',
    saved: 'プロフィールが正常に更新されました！',
  },

  account: {
    changePassword: 'パスワード変更',
    currentPassword: '現在のパスワード',
    newPassword: '新しいパスワード',
    confirmPassword: '新しいパスワード（確認）',
    passwordChanged: 'パスワードが正常に変更されました！',
    updatePassword: 'パスワードを更新',

    languagePreference: '言語設定',
    language: 'UI言語',

    deleteAccount: 'アカウント削除',
    deleteAccountWarning: 'この操作は元に戻せません。すべてのデータが削除されます。',
    confirmDelete: 'アカウント削除の確認',
    deleteConfirmMessage: '本当にアカウントを削除しますか？この操作は元に戻せません。',
    confirmDeleteButton: 'はい、アカウントを削除します',
    accountDeleted: 'アカウント削除リクエストが送信されました',
  },

  security: {
    mfaStatus: '多要素認証ステータス',
    multiFactorAuth: '多要素認証',
    enabled: '有効',
    disabled: '無効',

    resetMfa: 'MFAリセット',
    resetMfaDescription: '認証アプリへのアクセスを失った場合、ここでMFAをリセットできます。',
    resetMfaButton: 'MFAをリセット',
    mfaResetSuccess: 'MFAが正常にリセットされました',

    recentActivity: '最近のアクティビティ',
    device: 'デバイス',
    ipAddress: 'IPアドレス',
    location: '場所',

    apiKeyStatus: 'APIキーステータス',
    status: 'ステータス',
    active: '有効',
    expiresOn: '有効期限',
    regenerateKey: 'APIキーを再生成',
  },
}