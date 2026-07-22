import { log } from 'console';

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
      totp_code: 'ワンタイムパスワード (TOTP Code)',
      totp_code_explanation: 'MFAアプリからワンタイムパスワードを入力してください。',
      error_message: {
        code: 'ワンタイムパスワードを入力してください',
      },
    },
    button: '送信する',
    api_token_reissued: 'APIトークンを再発行しました。',
  },
  new_password: {
    title: '新しいパスワードの設定',
    description:
      'アカウントは仮パスワードの状態です。続行するには新しいパスワードを設定してください。',
    form: {
      password: '新しいパスワード',
      password_explanation: '12文字以上で、大文字・小文字・数字・記号をそれぞれ含めてください。',
      confirm_password: '新しいパスワード（確認）',
      error_message: {
        password_enter: 'パスワードを入力してください',
        password_lowercase: '小文字を含めてください',
        password_uppercase: '大文字を含めてください',
        password_number: '数字を含めてください',
        password_special: '記号を含めてください',
        password_min: '12文字以上で入力してください',
        confirm_password_enter: '確認用パスワードを入力してください',
        confirm_password_mismatch: 'パスワードが一致しません',
      },
    },
    button: 'パスワードを設定する',
    additional_mfa_required:
      'パスワードを変更しました。追加の認証手続きが必要なため、もう一度サインインしてください。',
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
  auth: {
    message: {
      error: {
        authorize: '認証に失敗しました。',
        logout: 'ログアウトに失敗しました。',
        noMFA: 'MFAを設定してください。',
      },
    },
  },
};
