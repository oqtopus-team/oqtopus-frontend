export default {
  explanation01: 'Please read the following QR code<br/>with the MFA application.',
  explanation02:
    'Please enter the one-time password that appears on the MFA application you created.',
  form: {
    totp_code: 'one-time password (TOTP Code)',
    error_message: {
      totp_code: 'Please enter one-time password',
      unexpected: 'An unexpected error occurred. You will be redirected to the login screen.',
    },
  },
  signup: {
    title: 'Sign up',
  },
  reset: {
    title: 'Re-set MFA',
  },
  confirm: {
    title: 'Enter Verification Code',
    form: {
      code: 'Verification Code',
      code_explanation:
        'A 6-digit verification code has been sent to the registered email address.',
      error_message: {
        code: 'Please enter the verification code',
      },
    },
    button: 'Send',
  },
  button: 'Send',
};
