import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import { AuthProvider, AuthContext, UseAuth } from './Provider';
import { Auth } from 'aws-amplify';
import ENV from '@/env';
import { useContext } from 'react';

// Mock AWS Amplify Auth
vi.mock('aws-amplify', () => ({
  Amplify: {
    configure: vi.fn(),
  },
  Auth: {
    currentAuthenticatedUser: vi.fn(),
    currentSession: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    forgotPassword: vi.fn(),
    forgotPasswordSubmit: vi.fn(),
    setupTOTP: vi.fn(),
    verifyTotpToken: vi.fn(),
    setPreferredMFA: vi.fn(),
    confirmSignIn: vi.fn(),
  },
}));

// Mock ENV
vi.mock('@/env', () => ({
  default: {
    AWS_CONFIG: {
      region: 'us-east-1',
      userPoolId: 'test-pool-id',
      userPoolWebClientId: 'test-client-id',
    },
    API_SIGNUP_ENDPOINT: 'https://api.test.com',
  },
}));

// Mock fetch
global.fetch = vi.fn();

const mockAuth = Auth as unknown as {
  currentAuthenticatedUser: Mock;
  currentSession: Mock;
  signIn: Mock;
  signOut: Mock;
  forgotPassword: Mock;
  forgotPasswordSubmit: Mock;
  setupTOTP: Mock;
  verifyTotpToken: Mock;
  setPreferredMFA: Mock;
  confirmSignIn: Mock;
};

const mockFetch = fetch as Mock;

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentAuthenticatedUser.mockRejectedValue(new Error('Not authenticated'));
  });

  it('renders children correctly', () => {
    render(
      <AuthProvider>
        <div data-testid="test-child">Test Child</div>
      </AuthProvider>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('initializes with correct default values', async () => {
    const TestComponent = () => {
      const auth = useContext(AuthContext);
      return (
        <div>
          <div data-testid="initialized">{auth.initialized.toString()}</div>
          <div data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</div>
          <div data-testid="username">{auth.username}</div>
          <div data-testid="email">{auth.email}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('initialized')).toHaveTextContent('true');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('username')).toHaveTextContent('');
      expect(screen.getByTestId('email')).toHaveTextContent('');
    });
  });

  it('sets authenticated state when user is already authenticated with MFA', async () => {
    const mockUser = {
      username: 'testuser',
      preferredMFA: 'SOFTWARE_TOKEN_MFA',
      attributes: {
        email: 'test@example.com',
      },
    };

    mockAuth.currentAuthenticatedUser.mockResolvedValue(mockUser);

    const TestComponent = () => {
      const auth = useContext(AuthContext);
      return (
        <div>
          <div data-testid="initialized">{auth.initialized.toString()}</div>
          <div data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</div>
          <div data-testid="username">{auth.username}</div>
          <div data-testid="email">{auth.email}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('initialized')).toHaveTextContent('true');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('username')).toHaveTextContent('testuser');
      expect(screen.getByTestId('email')).toHaveTextContent('test@example.com');
    });
  });
});

describe('Auth Functions', () => {
  let authHook: { current: UseAuth };

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentAuthenticatedUser.mockRejectedValue({});
  });

  describe('getCurrentIdToken', () => {
    it('returns JWT token on success', async () => {
      const mockToken = 'mock-jwt-token';
      mockAuth.currentSession.mockResolvedValue({
        idToken: { jwtToken: mockToken },
      });

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const token = await result.current.getCurrentIdToken();
      expect(token).toBe(mockToken);
    });

    it('returns empty string on error', async () => {
      mockAuth.currentSession.mockRejectedValue(new Error('Session error'));

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const token = await result.current.getCurrentIdToken();
      expect(token).toBe('');
    });
  });

  describe('signIn', () => {
    it('returns success when sign in is successful with challenge', async () => {
      const mockResult = {
        username: 'testuser',
        password: 'testpass',
        challengeName: 'SOFTWARE_TOKEN_MFA',
      };
      mockAuth.signIn.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.signIn('testuser', 'testpass');
      expect(response).toEqual({ success: true, message: '' });
      expect(mockAuth.signIn).toHaveBeenCalledWith('testuser', 'testpass');
    });

    it('returns failure when no challenge is present', async () => {
      const mockResult = {
        username: 'testuser',
        password: 'testpass',
      };
      mockAuth.signIn.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.signIn('testuser', 'testpass');
      expect(response).toEqual({
        success: false,
        message: 'signup.confirm.form.mfa_setup_request',
      });
    });

    it('returns error message on sign in failure', async () => {
      const error = new Error('Invalid credentials');
      mockAuth.signIn.mockRejectedValue(error);

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.signIn('testuser', 'wrongpass');
      expect(response).toEqual({
        success: false,
        message: 'Invalid credentials',
      });
    });
  });

  describe('signOut', () => {
    it('returns success on successful sign out', async () => {
      mockAuth.signOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.signOut();
      expect(response).toEqual({ success: true, message: '' });
      expect(mockAuth.signOut).toHaveBeenCalled();
    });

    it('returns error message on sign out failure', async () => {
      const error = new Error('Sign out failed');
      mockAuth.signOut.mockRejectedValue(error);

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.signOut();
      expect(response).toEqual({
        success: false,
        message: 'Sign out failed',
      });
    });
  });

  describe('signUp', () => {
    it('returns success on successful sign up', async () => {
      mockFetch.mockResolvedValue({
        status: 201,
        json: () => Promise.resolve({}),
      });

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.signUp('test@example.com', 'password123');
      expect(response).toEqual({ success: true, message: '' });
      expect(mockFetch).toHaveBeenCalledWith(
        `${ENV.API_SIGNUP_ENDPOINT}/signup`,
        expect.objectContaining({
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
    });

    it('returns error on non-201 response', async () => {
      mockFetch.mockResolvedValue({
        status: 400,
        json: () => Promise.resolve({}),
      });

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.signUp('test@example.com', 'password123');
      expect(response).toEqual({
        success: false,
        message: 'Failed to sign up',
      });
    });

    it('handles UsernameExistsException error', async () => {
      const error = new Error('User already exists') as any;
      error.code = 'UsernameExistsException';
      mockFetch.mockRejectedValue(error);

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.signUp('test@example.com', 'password123');
      expect(response).toEqual({
        success: false,
        message: 'User already exists',
      });
    });
  });

  describe('confirmSignUp', () => {
    it('returns success on successful confirmation', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({}),
      });
      mockAuth.signIn.mockResolvedValue({});

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      // First set username by calling signUp
      await result.current.signUp('test@example.com', 'password123');

      const response = await result.current.confirmSignUp('123456');
      expect(response).toEqual({ success: true, message: '' });
      const confirmCalls = mockFetch.mock.calls.filter((call) =>
        call[0].includes('confirm_signup')
      );

      expect(confirmCalls.length).toBeGreaterThan(0);
      expect(confirmCalls[0][1]).toMatchObject({
        method: 'PUT',
        body: expect.any(String),
      });
    });

    it('returns error on non-200 response', async () => {
      mockFetch.mockResolvedValue({
        status: 400,
        json: () => Promise.resolve({}),
      });

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.confirmSignUp('123456');
      expect(response).toEqual({
        success: false,
        message: 'Failed to confirm sign up',
      });
    });
  });

  describe('forgotPassword', () => {
    it('returns success on successful forgot password request', async () => {
      mockAuth.forgotPassword.mockResolvedValue({});

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.forgotPassword('test@example.com');
      expect(response).toEqual({ success: true, message: '' });
      expect(mockAuth.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });

    it('handles UserNotFoundException error', async () => {
      const error = new Error('User not found') as any;
      error.code = 'UserNotFoundException';
      mockAuth.forgotPassword.mockRejectedValue(error);

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.forgotPassword('test@example.com');
      expect(response).toEqual({
        success: false,
        message: 'User not found',
      });
    });
  });

  describe('confirmPassword', () => {
    it('returns success on successful password confirmation', async () => {
      mockAuth.forgotPasswordSubmit.mockResolvedValue({});

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.confirmPassword(
        'test@example.com',
        '123456',
        'newpass'
      );
      expect(response).toEqual({ success: true, message: '' });
      expect(mockAuth.forgotPasswordSubmit).toHaveBeenCalledWith(
        'test@example.com',
        '123456',
        'newpass'
      );
    });

    it('returns error on password confirmation failure', async () => {
      const error = new Error('Invalid code');
      mockAuth.forgotPasswordSubmit.mockRejectedValue(error);

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.confirmPassword(
        'test@example.com',
        '123456',
        'newpass'
      );
      expect(response).toEqual({
        success: false,
        message: 'Invalid code',
      });
    });
  });

  describe('setUpMfa', () => {
    it('returns success and QR code on successful MFA setup', async () => {
      const mockUser = { username: 'testuser' };
      const mockToken = 'MOCK_SECRET_TOKEN';
      mockAuth.currentAuthenticatedUser.mockResolvedValue(mockUser);
      mockAuth.setupTOTP.mockResolvedValue(mockToken);

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.setUpMfa();
      expect(response).toEqual({ success: true, message: '' });
      expect(mockAuth.setupTOTP).toHaveBeenCalledWith(mockUser);
    });

    it('returns error on MFA setup failure', async () => {
      const error = new Error('MFA setup failed');
      mockAuth.currentAuthenticatedUser.mockRejectedValue(error);

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.setUpMfa();
      expect(response).toEqual({
        success: false,
        message: 'MFA setup failed',
      });
    });
  });

  describe('confirmMfa', () => {
    it('returns success on successful MFA confirmation', async () => {
      const mockUser = { username: 'testuser' };
      mockAuth.currentAuthenticatedUser.mockResolvedValue(mockUser);
      mockAuth.verifyTotpToken.mockResolvedValue({});
      mockAuth.setPreferredMFA.mockResolvedValue({});

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.confirmMfa('123456');
      expect(response).toEqual({ success: true, message: '' });
      expect(mockAuth.verifyTotpToken).toHaveBeenCalledWith(mockUser, '123456');
      expect(mockAuth.setPreferredMFA).toHaveBeenCalledWith(mockUser, 'TOTP');
    });

    it('returns error on MFA confirmation failure', async () => {
      const error = new Error('Invalid TOTP code');
      mockAuth.currentAuthenticatedUser.mockRejectedValue(error);

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.confirmMfa('123456');
      expect(response).toEqual({
        success: false,
        message: 'Invalid TOTP code',
      });
    });
  });

  describe('confirmSignIn', () => {
    it('returns success on successful sign in confirmation', async () => {
      const mockResult = { username: 'testuser' };
      mockAuth.confirmSignIn.mockResolvedValue({});

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      // First sign in to set resultUser
      mockAuth.signIn.mockResolvedValue({ ...mockResult, challengeName: 'SOFTWARE_TOKEN_MFA' });
      await result.current.signIn('testuser', 'testpass');

      const response = await result.current.confirmSignIn('123456');
      expect(response).toEqual({ success: true, message: '' });
      expect(mockAuth.confirmSignIn).toHaveBeenCalledWith({}, '123456', 'SOFTWARE_TOKEN_MFA');
    });

    it('returns error on sign in confirmation failure', async () => {
      const error = new Error('Invalid TOTP code');
      mockAuth.confirmSignIn.mockRejectedValue(error);

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.confirmSignIn('123456');
      expect(response).toEqual({
        success: false,
        message: 'Invalid TOTP code',
      });
    });
  });

  describe('refreshApiToken', () => {
    it('returns success on successful token refresh', async () => {
      const mockUser = {
        refreshSession: vi.fn((refreshToken, callback) => {
          callback(null, { accessToken: 'new-token' });
        }),
      };
      const mockSession = {
        getRefreshToken: vi.fn(() => 'refresh-token'),
      };

      mockAuth.currentAuthenticatedUser.mockResolvedValue(mockUser);
      mockAuth.currentSession.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.refreshApiToken();
      expect(response).toEqual({
        success: true,
        message: 'signin.confirm.api_token_reissued',
      });
    });

    it('returns error on token refresh failure', async () => {
      const error = new Error('Token refresh failed');
      mockAuth.currentAuthenticatedUser.mockRejectedValue(error);

      const { result } = renderHook(() => useContext(AuthContext), {
        wrapper: TestWrapper,
      });

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.refreshApiToken();
      expect(response).toEqual({
        success: false,
        message: 'Token refresh failed',
      });
    });
  });
});
