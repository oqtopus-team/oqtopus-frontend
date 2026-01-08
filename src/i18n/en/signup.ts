export default {
  title: 'Sign up',
  form: {
    mail: 'Email address',
    password: 'Password',
    password_explanation:
      'Please enter at least 12 characters and include at least one uppercase letter, lowercase letter, number, or special character (^$*.[]{}()?"!@#%&/\\,><\':;|_~`+=-).',
    confirm_password: 'Password confirmation',
    error_message: {
      mail_address_enter: 'Please enter your email address',
      mail_address_max: 'Please enter less than 100 characters',
      mail_address_valid: 'Please enter your correct email address',
      password_enter: 'Please enter your password',
      password_lowercase: 'Please include lower case letters',
      password_uppercase: 'Please include capital letters',
      password_number: 'Please include numbers',
      password_special: 'Please include special characters (^$*.[]{}()?"!@#%&/\\,><\':;|_~`+=-)',
      password_min: 'Please enter at least 12 characters',
      confirm_password_enter: 'Please enter your confirmation password',
      confirm_password_mismatch: 'Password does not match',
    },
  },
  button: 'Sign up',
  confirm: {
    title: 'Enter Verification Code',
    form: {
      code: 'Verification Code',
      code_explanation:
        'A 6-digit verification code has been sent to the e-mail address you entered on the sign-up.',
      error_message: {
        code: 'Please enter Verification Code',
      },
      mfa_setup_request: 'Please set up MFA.',
    },
    button: 'Send',
  },
  disclaimer: `Please check <1>the term of use</1> and <3>the private policy</3>, and if you agree, please complete the account registration below.`,
  errors: {
    email_already_registered: 'The email address you entered is already registered',
    signup_failed_prereq:
      'Sign up failed.\nPre-registration is required for sign up.\nIf you have not registered, please contact the administrator.',
    authentication_failed: 'Authentication failed.',
    record_overlap: 'The email address you entered is already registered.',
    signup:
      'Sign up failed.\nPre-registration is required for sign up.\nIf you have not registered yet, please contact the administrator.',
    setup_totp: 'Failed to set up TOTP.',
    send_code: 'Failed to send the confirmation code required for MFA reset.',
    verify_code: 'Failed to verify the confirmation code.',
    refresh_token: 'Failed to refresh API token.',
    unexpected: 'An unexpected error occurred.',
  },
};
