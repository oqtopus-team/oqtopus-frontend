export default {
  title: 'サインアップ',
  form: {
    mail: 'メールアドレス',
    password: 'パスワード',
    password_explanation:
      'パスワードは12文字以上で指定してください。\nまた、大文字・小文字・数字・特殊文字（^$*.[]{}()?"!@#%&/\\,><\':;|_~`+=-）をそれぞれ最低1つ含めてください。',
    confirm_password: 'パスワード確認',
    error_message: {
      mail_address_enter: 'メールアドレスを入力してください',
      mail_address_max: '100文字以下で入力してください',
      mail_address_valid: '正しいメールアドレスを入力してください',
      password_enter: 'パスワードを入力してください',
      password_lowercase: 'パスワードには少なくとも1つの小文字を含める必要があります',
      password_uppercase: 'パスワードには少なくとも1つの大文字を含める必要があります',
      password_number: 'パスワードには少なくとも1つの数字を含める必要があります',
      password_special:
        'パスワードには少なくとも1つの特殊文字（^$*.[]{}()?"!@#%&/\\,><\':;|_~`+=-）を含める必要があります。',
      password_min: '12文字以上で入力してください',
      confirm_password_enter: '確認用パスワードを入力してください',
      confirm_password_mismatch: 'パスワードが合致しません',
    },
  },
  button: 'サインアップ',
  confirm: {
    title: '検証コードの入力',
    form: {
      code: '検証コード',
      code_explanation:
        'サインアップ画面で入力したメールアドレスに6桁の検証コードが送付されています。',
      error_message: {
        code: '検証コードを入力してください',
      },
    },
    button: '送信する',
  },
  auth: {
    message: {
      success: {
        refresh_token: 'APIトークンを再発行しました。',
      },
      error: {
        record_overlap: '入力したメールアドレスはすでに登録されています。',
        signup:
          'サインアップに失敗しました。\nサインアップには事前ユーザー登録が必要です。\n登録がお済みでない場合は管理者までお問い合わせください。',
        authorize: '認証に失敗しました。',
        setup_totp: 'TOTPの設定に失敗しました。',
        send_code: 'MFA再設定に必要な確認コードの送信に失敗しました。',
        verify_code: '確認コードの検証に失敗しました。',
        refresh_token: 'APIトークンの再発行に失敗しました。',
        unexpected: '予期しないエラーが発生しました。',
      },
    },
  },
};
