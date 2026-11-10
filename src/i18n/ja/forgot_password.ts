export default {
  title: 'パスワード変更',
  explanation:
    '利用中のメールアドレスを入力してください。<br />パスワード変更のためのコードが送付されます。',
  form: {
    mail: 'メールアドレス',
    error_message: {
      mail_address_enter: 'メールアドレスを入力してください',
      mail_address_valid: '正しいメールアドレスを入力してください',
    },
  },
  button: '送信する',
  confirm: {
    title: 'パスワード変更',
    form: {
      code: '検証コード',
      code_explanation: '登録したメールアドレスに6桁の検証コードが送付されています。',
      password: '新しいパスワード',
      password_explanation:
        '大文字・小文字・数字・特殊文字（^$*.11（?-"！@#％＆人>く.L~\'+=）を最低1つ含めてください。',
      confirm_password: 'パスワード確認',
      error_message: {
        password_enter: 'パスワードを入力してください',
        password_lowercase: '小文字を含めてください',
        password_uppercase: '大文字を含めてください',
        password_number: '数字を含めてくださいい',
        password_special: '特殊文字（^$*.11（?-"！@#％＆人>く.L~\'+=）を含めてください。',
        password_min: '12文字以上で入力してください',
        confirm_password_enter: '確認用パスワードを入力してください',
        confirm_password_mismatch: 'パスワードが合致しません',
        code_enter: '検証コードを入力してください',
      },
    },
    button: '送信する',
  },
};
