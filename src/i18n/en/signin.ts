export default {
  title: 'Sign in',
  form: {
    mail: 'Email address',
    password: 'Password',
    error_message: {
      user_name: 'Please enter your email address',
      password: 'Please enter your password',
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
    api_token_reissued: 'API token has been reissued.',
  },
  errors: {
    authentication_failed: 'Authentication failed',
    logout_failed: 'Logout failed',
    email_not_found: 'The email address you entered does not exist',
    email_sending_failed: 'Failed to send email.',
    password_change_failed: 'Failed to change password.',
    totp_setup_failed: 'Failed to set up TOTP.',
    totp_verification_failed: 'TOTP verification failed.',
    api_token_reissue_failed: 'Failed to reissue API token.',
  },
};
