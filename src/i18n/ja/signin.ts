export default {
  title: 'サインイン',
  form: {
    mail: 'メールアドレス',
    password: 'パスワード',
    error_message: {
      user_name: 'ユーザー名を入力してください',
      mail_address: '正しいメールアドレスを入力してください',
      password: 'パスワードを入力してください',
      password_min_length: 'パスワードは12文字以上である必要があります',
      password_uppercase: 'パスワードには少なくとも1つの大文字を含める必要があります',
      password_lowercase: 'パスワードには少なくとも1つの小文字を含める必要があります',
      password_number: 'パスワードには少なくとも1つの数字を含める必要があります',
      password_special:
        'パスワードには少なくとも1つの特殊文字（^$*.[]{}()?"!@#%&/\\,><\':;|_~`+=-）を含める必要があります',
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
  },
};
