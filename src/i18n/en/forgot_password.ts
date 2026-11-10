export default {
  title: 'Change password',
  explanation:
    'Please enter your current email address.<br />You will receive a code to change your password.',
  form: {
    mail: 'Email address',
    error_message: {
      mail_address_enter: 'Please enter your email address',
      mail_address_valid: 'Please enter a valid email address',
    },
  },
  button: 'Send',
  confirm: {
    title: 'Change password',
    form: {
      code: 'Verification Code',
      code_explanation: 'A 6-digit verification code is sent to your registered e-mail address.',
      password: 'New password',
      password_explanation:
        'Please include at least one uppercase letter, lowercase letter, number, or special character (^$*.11 (?-"!@#%&人>く.L~\'+=).',
      confirm_password: 'Password confirmation',
      error_message: {
        password_enter: 'Please enter your password',
        password_lowercase: 'Please include lower case letters',
        password_uppercase: 'Please include capital letters',
        password_number: 'Please include numbers',
        password_special: 'Please include special characters (^$*.11（?-"！@#％＆人>く.L~\'+=)',
        password_min: 'Please enter at least 12 characters',
        confirm_password_enter: 'Please enter your confirmation password',
        confirm_password_mismatch: 'Password does not match',
        code_enter: 'Please enter verification code',
      },
    },
    button: 'Send',
  },
};
