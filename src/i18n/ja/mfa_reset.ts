export default {
  title: 'MFAリセットリクエスト',
  form: {
    mail: 'メールアドレス',
    password: 'パスワード',
    error_message: {
      mail_address_enter: 'ユーザー名を入力してください',
      mail_address_valid: '正しいメールアドレスを入力してください',
      password: 'パスワードを入力してください',
    },
  },
  button: '送信する',
  alert: {
    success: 'リクエストを受け付けました。',
    failure: '認証に失敗しました。',
  },
};
