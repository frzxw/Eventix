/**
 * Production Authentication Utilities (local copy for Functions build)
 */

import bcryptjs from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';
const BCRYPT_ROUNDS = Math.max(parseInt(process.env.BCRYPT_ROUNDS || '12', 10), 10);

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, BCRYPT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export interface JWTPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export function signAccessToken(payload: Omit<JWTPayload, 'type' | 'iat' | 'exp'>): string {
  return jwt.sign({ ...payload, type: 'access' }, JWT_SECRET as Secret, { expiresIn: JWT_EXPIRY as any });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'refresh' }, JWT_REFRESH_SECRET as Secret, { expiresIn: JWT_REFRESH_EXPIRY as any });
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded.type === 'access' ? decoded : null;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { sub: string; type: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { sub: string; type: string };
    return decoded.type === 'refresh' ? decoded : null;
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;
  return parts[1];
}

export async function hashToken(token: string): Promise<string> {
  return hashPassword(token);
}

export async function validateSessionToken(token: string, storedHash: string): Promise<boolean> {
  return comparePassword(token, storedHash);
}

export function generateVerificationToken(): string {
  return uuidv4();
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function generateTokenPair(payload: Omit<JWTPayload, 'type' | 'iat' | 'exp'>): TokenPair {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload.sub),
  };
}

/**
 * Parse duration strings like "15m", "7d", "12h", "30s" into milliseconds.
 * Falls back to minutes when unit is omitted. Returns 0 on invalid input.
 */
export function parseDurationMillis(input: string): number {
  if (!input) return 0;
  const match = String(input).trim().match(/^\s*(\d+)\s*([smhd])?\s*$/i);
  if (!match) return 0;
  const value = parseInt(match[1], 10);
  const unit = (match[2] || 'm').toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * (multipliers[unit] ?? multipliers.m);
}
