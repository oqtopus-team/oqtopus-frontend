export default {
  title: 'Sign in',
  form: {
    mail: 'Email address',
    password: 'Password',
    error_message: {
      user_name: 'Please enter your email address',
      mail_address: 'Please enter a valid email address',
      password: 'Please enter your password',
      password_min_length: 'Password must be at least 12 characters long',
      password_uppercase: 'Password must contain at least one uppercase letter',
      password_lowercase: 'Password must contain at least one lowercase letter',
      password_number: 'Password must contain at least one number',
      password_special:
        'Password must contain at least one special character（^$*.[]{}()?"!@#%&/\\,><\':;|_~`+=-）',
    },
  },
  forgot_password: 'If you forgot your password, click here',
  button: 'Sign in',
  confirm: {
    title: 'Enter one-time password',
    form: {
      totp_code: 'one-time password(TOTP Code)',
      totp_code_explanation: 'Enter the one-time password from the MFA application.',
      error_message: {
        code: 'Please enter one-time password',
      },
    },
    button: 'Send',
  },
};
