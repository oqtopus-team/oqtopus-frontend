export default {
  explanation01: '以下のQRコードをMFAアプリで<br />読み込んでください。',
  explanation02: '上記で作成したMFAアプリに表示されるワンタイムパスワードを入力してください。',
  form: {
    totp_code: 'ワンタイムパスワード (TOTP Code)',
    error_message: {
      totp_code: 'ワンタイムパスワードを入力してください。',
      unexpected: '予期しないエラーが発生しました。ログイン画面に戻ります。',
    },
  },
  signup: {
    title: 'サインアップ',
  },
  reset: {
    title: 'MFAの再設定',
  },
  confirm: {
    title: '検証コードの入力',
    form: {
      code: '検証コード',
      code_explanation: '登録したメールアドレスに6桁の検証コードが送付されています。',
      error_message: {
        code: '検証コードを入力してください',
      },
    },
    button: '送信する',
  },
  button: '送信する',
};
