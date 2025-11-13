/**
 * Frontend Auth utilities: token storage and helpers
 */

import { AUTH } from '@/lib/constants';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthStoredUser = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export type StoragePreference = 'local' | 'session';

const ACCESS_KEY = AUTH.TOKEN_STORAGE_KEY;
const REFRESH_KEY = AUTH.REFRESH_TOKEN_STORAGE_KEY;
const USER_KEY = AUTH.USER_STORAGE_KEY;
const STORAGE_PREF_KEY = 'eventix.auth.storage-preference';

const isBrowser = typeof window !== 'undefined';

function getStorageInstance(type: StoragePreference): Storage | null {
  if (!isBrowser) return null;
  return type === 'local' ? window.localStorage : window.sessionStorage;
}

function safeGetItem(storage: Storage | null, key: string): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(storage: Storage | null, key: string, value: string | null) {
  if (!storage) return;
  try {
    if (value === null) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, value);
    }
  } catch (error) {
    console.warn('Failed to access browser storage', { key, error });
  }
}

function detectTokenStorage(): StoragePreference | null {
  if (!isBrowser) return null;
  if (safeGetItem(window.localStorage, ACCESS_KEY)) return 'local';
  if (safeGetItem(window.sessionStorage, ACCESS_KEY)) return 'session';
  return null;
}

function persistStoragePreference(pref: StoragePreference) {
  if (!isBrowser) return;
  safeSetItem(window.localStorage, STORAGE_PREF_KEY, pref);
}

function getPersistedStoragePreference(): StoragePreference | null {
  if (!isBrowser) return null;
  const stored = safeGetItem(window.localStorage, STORAGE_PREF_KEY);
  if (stored === 'local' || stored === 'session') {
    return stored;
  }
  return null;
}

function resolveStoragePreference(options?: { remember?: boolean; storagePreference?: StoragePreference }): StoragePreference | null {
  if (!isBrowser) return null;
  if (options?.storagePreference) return options.storagePreference;
  if (typeof options?.remember === 'boolean') {
    return options.remember ? 'local' : 'session';
  }
  return detectTokenStorage() ?? getPersistedStoragePreference() ?? 'session';
}

export function getAccessToken(): string | null {
  if (!isBrowser) return null;
  return safeGetItem(window.localStorage, ACCESS_KEY) ?? safeGetItem(window.sessionStorage, ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser) return null;
  return safeGetItem(window.localStorage, REFRESH_KEY) ?? safeGetItem(window.sessionStorage, REFRESH_KEY);
}

export function getTokenStoragePreference(): StoragePreference | null {
  return detectTokenStorage() ?? getPersistedStoragePreference();
}

export function setTokens(tokens: AuthTokens, options?: { remember?: boolean; storagePreference?: StoragePreference }) {
  if (!isBrowser) return;
  const targetPreference = resolveStoragePreference(options) ?? 'session';
  const targetStorage = getStorageInstance(targetPreference);
  if (!targetStorage) return;

  // Save to target storage
  safeSetItem(targetStorage, ACCESS_KEY, tokens.accessToken);
  safeSetItem(targetStorage, REFRESH_KEY, tokens.refreshToken);

  // Remove from the other storage to avoid stale tokens
  const alternateStorage = getStorageInstance(targetPreference === 'local' ? 'session' : 'local');
  safeSetItem(alternateStorage, ACCESS_KEY, null);
  safeSetItem(alternateStorage, REFRESH_KEY, null);

  persistStoragePreference(targetPreference);
}

export function getStoredUser(): AuthStoredUser | null {
  if (!isBrowser) return null;
  const raw = safeGetItem(window.localStorage, USER_KEY) ?? safeGetItem(window.sessionStorage, USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && typeof parsed.id === 'string') {
      return parsed as AuthStoredUser;
    }
  } catch (error) {
    console.warn('Failed to parse stored user from browser storage', { error });
  }
  return null;
}

export function setStoredUser(user: AuthStoredUser | null, options?: { remember?: boolean; storagePreference?: StoragePreference }) {
  if (!isBrowser) return;
  const targetPreference = resolveStoragePreference(options) ?? 'session';
  const targetStorage = getStorageInstance(targetPreference);
  const serialized = user ? JSON.stringify(user) : null;
  safeSetItem(targetStorage, USER_KEY, serialized);

  const alternateStorage = getStorageInstance(targetPreference === 'local' ? 'session' : 'local');
  safeSetItem(alternateStorage, USER_KEY, null);
}

export function clearStoredUser() {
  if (!isBrowser) return;
  safeSetItem(window.localStorage, USER_KEY, null);
  safeSetItem(window.sessionStorage, USER_KEY, null);
}

export function clearTokens() {
  if (!isBrowser) return;
  safeSetItem(window.localStorage, ACCESS_KEY, null);
  safeSetItem(window.localStorage, REFRESH_KEY, null);
  safeSetItem(window.sessionStorage, ACCESS_KEY, null);
  safeSetItem(window.sessionStorage, REFRESH_KEY, null);
  safeSetItem(window.localStorage, STORAGE_PREF_KEY, null);
}

export function hasTokens(): boolean {
  return !!getAccessToken() && !!getRefreshToken();
}

export type TokenPayload = {
  sub?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
};

export function decodeToken(token: string): TokenPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const payload = parts[1];
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeBase64(base64);
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

function decodeBase64(base64: string): string {
  if (typeof atob === 'function') {
    return atob(base64);
  }
  const globalBuffer = (globalThis as unknown as { Buffer?: { from: (input: string, encoding: string) => { toString: (encoding: string) => string } } }).Buffer;
  if (globalBuffer) {
    return globalBuffer.from(base64, 'base64').toString('utf-8');
  }
  return '';
}

export function extractUserFromToken(token: string): AuthStoredUser | null {
  const payload = decodeToken(token);
  if (!payload?.sub || typeof payload.sub !== 'string') {
    return null;
  }

  return {
    id: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    firstName: typeof payload.firstName === 'string' ? payload.firstName : undefined,
    lastName: typeof payload.lastName === 'string' ? payload.lastName : undefined,
  };
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}
