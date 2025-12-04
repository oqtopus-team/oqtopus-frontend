export default {
  title: 'Settings',
  save: 'Save Changes',
  saving: 'Saving...',
  updating: 'Updating...',
  resetting: 'Resetting...',
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
    deleteAccountWarning: 'This action is permanent and cannot be undone. All your data will be deleted.',
    confirmDelete: 'Confirm Account Deletion',
    deleteConfirmMessage: 'Are you sure you want to delete your account? This action cannot be undone.',
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

    recentActivity: 'Recent Activity',
    device: 'Device',
    ipAddress: 'IP Address',
    location: 'Location',

    apiKeyStatus: 'API Key Status',
    status: 'Status',
    active: 'Active',
    expiresOn: 'Expires on',
    regenerateKey: 'Regenerate API Key',
  },
}