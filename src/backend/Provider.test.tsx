import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createUserApiAxios } from './Provider';

const originalLocation = window.location;

const responseHandlers = (instance: ReturnType<typeof createUserApiAxios>) =>
  // axios keeps registered interceptors here; removed ones become null.
  (instance.interceptors.response as unknown as { handlers: Array<unknown> }).handlers.filter(
    Boolean
  ) as Array<{ rejected: (e: unknown) => Promise<unknown> }>;

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { href: '', pathname: '/jobs', search: '?p=2' },
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: originalLocation,
  });
});

describe('createUserApiAxios (proxy mode)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_APP_AUTH_MODE', 'proxy');
  });

  it('sends credentials and registers a response interceptor', () => {
    const instance = createUserApiAxios();
    expect(instance.defaults.withCredentials).toBe(true);
    expect(responseHandlers(instance).length).toBe(1);
  });

  it('redirects to the proxy login on 401', async () => {
    const instance = createUserApiAxios();
    const [handler] = responseHandlers(instance);

    await expect(handler.rejected({ response: { status: 401 } })).rejects.toBeDefined();
    expect(window.location.href).toBe('/oauth2/start?rd=' + encodeURIComponent('/jobs?p=2'));
  });

  it('does not redirect on non-401 errors', async () => {
    const instance = createUserApiAxios();
    const [handler] = responseHandlers(instance);

    await expect(handler.rejected({ response: { status: 500 } })).rejects.toBeDefined();
    expect(window.location.href).toBe('');
  });
});

describe('createUserApiAxios (cognito mode)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_APP_AUTH_MODE', 'cognito');
  });

  it('leaves axios unchanged (no credentials, no interceptor)', () => {
    const instance = createUserApiAxios();
    expect(instance.defaults.withCredentials).toBeFalsy();
    expect(responseHandlers(instance).length).toBe(0);
  });
});
