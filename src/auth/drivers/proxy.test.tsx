import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { ProxyAuthProvider } from './proxy';
import { AuthContext } from '../contract';

// The proxy (BFF) driver talks to the reverse proxy over fetch and drives
// login/logout via full-page redirects, so we stub fetch and window.location.

global.fetch = vi.fn();
const mockFetch = fetch as Mock;

const originalLocation = window.location;

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ProxyAuthProvider>{children}</ProxyAuthProvider>
);

const renderProxyAuth = () => renderHook(() => useContext(AuthContext), { wrapper: TestWrapper });

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { href: '', pathname: '/dashboard', search: '?a=1' },
  });
});

afterEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: originalLocation,
  });
});

describe('ProxyAuthProvider', () => {
  it('marks the session authenticated from /oauth2/userinfo', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ email: 'demo@oqtopus.local', preferredUsername: 'demo' }),
    });

    const { result } = renderProxyAuth();

    await waitFor(() => expect(result.current.initialized).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('/oauth2/userinfo', {
      credentials: 'include',
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.email).toBe('demo@oqtopus.local');
    expect(result.current.username).toBe('demo');
  });

  it('stays unauthenticated when /oauth2/userinfo is not ok', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: async () => ({}) });

    const { result } = renderProxyAuth();

    await waitFor(() => expect(result.current.initialized).toBe(true));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.email).toBe('');
  });

  it('stays unauthenticated when /oauth2/userinfo rejects', async () => {
    mockFetch.mockRejectedValue(new Error('network'));

    const { result } = renderProxyAuth();

    await waitFor(() => expect(result.current.initialized).toBe(true));
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('never exposes a token to the SPA (getCurrentIdToken is empty)', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: async () => ({}) });

    const { result } = renderProxyAuth();
    await waitFor(() => expect(result.current.initialized).toBe(true));

    expect(await result.current.getCurrentIdToken()).toBe('');
  });

  it('signIn redirects to the proxy start endpoint with a return path', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: async () => ({}) });

    const { result } = renderProxyAuth();
    await waitFor(() => expect(result.current.initialized).toBe(true));

    const res = await result.current.signIn('', '');
    expect(res.success).toBe(true);
    expect(window.location.href).toBe('/oauth2/start?rd=' + encodeURIComponent('/dashboard?a=1'));
  });

  it('signOut redirects to the server-side logout endpoint', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: async () => ({}) });

    const { result } = renderProxyAuth();
    await waitFor(() => expect(result.current.initialized).toBe(true));

    const res = await result.current.signOut();
    expect(res.success).toBe(true);
    expect(window.location.href).toBe('/logout');
  });

  it('delegates signup/MFA/password operations to the IdP', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: async () => ({}) });

    const { result } = renderProxyAuth();
    await waitFor(() => expect(result.current.initialized).toBe(true));

    for (const op of [
      result.current.signUp('u', 'p'),
      result.current.setUpMfa(),
      result.current.refreshApiToken(),
    ]) {
      const res = await op;
      expect(res.success).toBe(false);
      expect(res.message).toBe('auth.proxy.operation_delegated_to_idp');
    }
  });
});
