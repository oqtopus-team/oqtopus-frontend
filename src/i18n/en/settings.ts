export default {
  title: 'Settings',
  save: 'Save Changes',
  saving: 'Saving...',
  updating: 'Updating...',
  cancel: 'Cancel',

  tabs: {
    profile: 'Profile',
    account: 'Account',
    security: 'Security',
  },

  profile: {
    title: 'Profile Information',
    email: 'Email',
    name: 'Display Name',
    organization: 'Organization',
    memberSince: 'Member Since',
    emailReadonly: 'Email cannot be changed',
    created_at: 'Account creation date',
    saved: 'Profile updated successfully!',
  },

  account: {
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    passwordChanged: 'Password changed successfully!',
    updatePassword: 'Update Password',

    deleteAccount: 'Delete Account',
    deleteAccountWarning:
      'This action is permanent and cannot be undone. All your data will be deleted.',
    confirmDelete: 'Confirm Account Deletion',
    deleteConfirmMessage:
      'Are you sure you want to delete your account? This action cannot be undone.',
    confirmDeleteButton: 'Yes, Delete My Account',
    accountDeleted: 'Account deletion request submitted',
  },

  security: {
    mfaStatus: 'Multi-Factor Authentication Status',
    multiFactorAuth: 'Multi-Factor Authentication',
    enabled: 'Enabled',
    disabled: 'Disabled',

    resetMfa: 'Reset MFA',
    resetMfaDescription: 'If you lost access to your authenticator app, you can reset MFA here.',
    resetMfaButton: 'Reset MFA',
    mfaResetSuccess: 'MFA has been reset successfully',

    login: 'Login',
    recentLoginActivity: 'Recent Login Activity',
    device: 'Device',
    ipAddress: 'IP Address',
    location: 'Location',

    apiToken: {
      apiTokenStatus: 'API Token Status',
      notCreated: 'Not created',
      status: 'Status',
      active: 'Active',
      expired: 'Expired',
      expiresOn: 'Expires on',
      generateToken: 'Generate API Token',
      deleteToken: 'Delete API Token',
      createdTitle: 'API Token Created',
      createdWarning:
        'Important: Your API token is displayed only once upon creation. Please copy and store it in a secure location.',
      afterCloseInfo:
        'Once this window is closed, the token cannot be retrieved. You will only be able to generate a new one.',
      okButton: 'I Understand',
      copied: 'API Token copied successfully',
    },

    confirmDelete: 'Confirm API Token Deletion',
    deleteConfirmMessage:
      'Are you sure you want to delete API Token? This action cannot be undone.',
    confirmDeleteButton: 'Are you sure you want to delete API Token?',
    createSuccess: 'API token successfully created',
    deleteSuccess: 'API token successfully deleted',
  },
};
