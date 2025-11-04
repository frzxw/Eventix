/**
 * Production Authentication Utilities
 * Handles password hashing, JWT signing/verification, and token management
 */

import bcryptjs from 'bcryptjs';
import jwt, { Secret, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';
const BCRYPT_ROUNDS = Math.max(parseInt(process.env.BCRYPT_ROUNDS || '12', 10), 10);

/**
 * Parse duration strings like "15m", "7d", "3600" into milliseconds.
 * Supports s, m, h, d units. Defaults to seconds if number provided without unit.
 */
export function parseDurationMillis(input: string): number {
  const trimmed = (input || '').toString().trim();
  if (!trimmed) return 0;
  const match = trimmed.match(/^(\d+)([smhd])?$/i);
  if (!match) {
    // Fallback: try Number
    const n = Number(trimmed);
    return Number.isFinite(n) ? n * 1000 : 0;
  }
  const value = Number(match[1]);
  const unit = (match[2] || 's').toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * (multipliers[unit] ?? 1000);
}

export function getAccessExpiryMillis(): number {
  return parseDurationMillis(JWT_EXPIRY);
}

export function getRefreshExpiryMillis(): number {
  return parseDurationMillis(JWT_REFRESH_EXPIRY);
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcryptjs.hash(password, BCRYPT_ROUNDS);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcryptjs.compare(password, hash);
  } catch (error) {
    throw new Error(`Password comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * JWT Payload interface
 */
export interface JWTPayload {
  sub: string; // User ID
  email: string;
  firstName: string;
  lastName: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * Sign an access token
 */
export function signAccessToken(payload: Omit<JWTPayload, 'type' | 'iat' | 'exp'>): string {
  try {
    return jwt.sign(
      {
        ...payload,
        type: 'access',
      },
      JWT_SECRET as Secret,
      { expiresIn: JWT_EXPIRY } as SignOptions
    );
  } catch (error) {
    throw new Error(`Access token signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Sign a refresh token
 */
export function signRefreshToken(userId: string): string {
  try {
    return jwt.sign(
      {
        sub: userId,
        type: 'refresh',
      },
      JWT_REFRESH_SECRET as Secret,
      { expiresIn: JWT_REFRESH_EXPIRY } as SignOptions
    );
  } catch (error) {
    throw new Error(`Refresh token signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    if (decoded.type !== 'access') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): { sub: string; type: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { sub: string; type: string };
    if (decoded.type !== 'refresh') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Generate a session token hash for database storage
 * (never store plain tokens in database)
 */
export async function hashToken(token: string): Promise<string> {
  return await hashPassword(token);
}

/**
 * Validate session token against stored hash
 */
export async function validateSessionToken(token: string, storedHash: string): Promise<boolean> {
  return await comparePassword(token, storedHash);
}

/**
 * Generate verification token (for email verification, password reset, etc.)
 */
export function generateVerificationToken(): string {
  return uuidv4();
}

/**
 * Session token pair interface
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: Omit<JWTPayload, 'type' | 'iat' | 'exp'>): TokenPair {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload.sub),
  };
}

/**
 * Generate tokens and include absolute expiry timestamps (epoch ms) for client/UI.
 */
export function generateTokenPairWithExpiry(payload: Omit<JWTPayload, 'type' | 'iat' | 'exp'>): TokenPair & {
  accessExpiresAt: number;
  refreshExpiresAt: number;
} {
  const now = Date.now();
  const accessExpiresAt = now + getAccessExpiryMillis();
  const refreshExpiresAt = now + getRefreshExpiryMillis();
  const pair = generateTokenPair(payload);
  return { ...pair, accessExpiresAt, refreshExpiresAt };
}

/**
 * Build a new token pair from a valid refresh token. Caller must have validated user/session.
 */
export function rotateTokensFromRefresh(
  refreshToken: string,
  basePayload: Omit<JWTPayload, 'type' | 'iat' | 'exp'>
): TokenPair & { accessExpiresAt: number; refreshExpiresAt: number } {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded || decoded.sub !== basePayload.sub) {
    throw new Error('Invalid refresh token');
  }
  return generateTokenPairWithExpiry(basePayload);
}
