/**
 * Frontend Auth utilities: token storage and helpers
 */

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const ACCESS_KEY = 'eventix.accessToken';
const REFRESH_KEY = 'eventix.refreshToken';

export function getAccessToken(): string | null {
  try { return localStorage.getItem(ACCESS_KEY); } catch { return null; }
}

export function getRefreshToken(): string | null {
  try { return localStorage.getItem(REFRESH_KEY); } catch { return null; }
}

export function setTokens(tokens: AuthTokens) {
  try {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  } catch {}
}

export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {}
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
