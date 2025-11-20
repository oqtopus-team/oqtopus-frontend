export default {
  title: 'サインイン',
  form: {
    mail: 'メールアドレス',
    password: 'パスワード',
    error_message: {
      user_name: 'ユーザー名を入力してください',
      password: 'パスワードを入力してください',
    },
  },
  forgot_password: 'パスワードを忘れた方はこちら。',
  button: 'サインイン',
  confirm: {
    title: 'ワンタイムパスワードの入力',
    form: {
      totp_code: 'ワンタイムパスワード(TOTP Code)',
      totp_code_explanation: 'MFAアプリからワンタイムパスワードを入力してください。',
      error_message: {
        code: 'ワンタイムパスワードを入力してください',
      },
    },
    button: '送信する',
    api_token_reissued: 'APIトークンを再発行しました。',
  },
  errors: {
    authentication_failed: '認証に失敗しました。',
    logout_failed: 'ログアウトに失敗しました。',
    email_not_found: '入力したメールアドレスは存在しません',
    email_sending_failed: 'メール送信に失敗しました。',
    password_change_failed: 'パスワード変更に失敗しました。',
    totp_setup_failed: 'TOTPの設定に失敗しました。',
    totp_verification_failed: 'TOTPの認証に失敗しました。',
    api_token_reissue_failed: 'APIトークンの再発行に失敗しました。',
  },
};
