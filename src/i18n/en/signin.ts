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
      totp_code: 'one-time password (TOTP Code)',
      totp_code_explanation: 'Enter the one-time password from the MFA application.',
      error_message: {
        code: 'Please enter one-time password',
      },
    },
    button: 'Send',
    api_token_reissued: 'API token has been reissued.',
  },
  new_password: {
    title: 'Set a new password',
    description:
      'Your account is using a temporary password. Please set a new password to continue.',
    form: {
      password: 'New password',
      password_explanation:
        'Use at least 12 characters, including uppercase and lowercase letters, a number, and a symbol.',
      confirm_password: 'New password (confirm)',
      error_message: {
        password_enter: 'Please enter your password',
        password_lowercase: 'Please include a lowercase letter',
        password_uppercase: 'Please include an uppercase letter',
        password_number: 'Please include a number',
        password_special: 'Please include a symbol',
        password_min: 'Please enter at least 12 characters',
        confirm_password_enter: 'Please enter your confirmation password',
        confirm_password_mismatch: 'Passwords do not match',
      },
    },
    button: 'Set password',
    additional_mfa_required:
      'Your password has been changed. An additional authentication step is required, so please sign in again.',
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
  auth: {
    message: {
      error: {
        authorize: 'Authorization failed.',
        logout: 'Logout failed.',
        noMFA: 'Please set up MFA.',
      },
    },
  },
};
