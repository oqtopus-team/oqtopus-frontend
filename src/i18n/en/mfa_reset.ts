export default {
  title: 'MFA invalidation request',
  form: {
    mail: 'Email address',
    password: 'Password',
    error_message: {
      mail_address_enter: 'Please enter your email address',
      mail_address_valid: 'Please enter a valid email address',
      password: 'Please enter your password',
    },
  },
  button: 'Send',
  alert: {
    success: 'Your request to invalidate MFA has been accepted.',
    failure: 'Failed to authenticate.',
  },
};
