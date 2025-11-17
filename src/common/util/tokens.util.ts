import type { Request } from 'express';
import { randomBytes, createHash } from 'node:crypto';
import { ExtractJwt } from 'passport-jwt';

const fromBearer = ExtractJwt.fromAuthHeaderAsBearerToken();

export function genRefreshTokenRaw() {
  // 原始 refresh token（返回给前端）
  return randomBytes(32).toString('base64url'); // 高熵，可放 Cookie 或 Header
}

// 表里 token 字段只有 Char(32)，存 md5 摘要即可
export function hashRefreshTokenForDB(raw: string) {
  return createHash('md5').update(raw).digest('hex'); // 32位，正好 fits
}

export const nowSec = () => Math.floor(Date.now() / 1000);

export function extractAccessToken(req: Request): string | null {
  return (
    fromBearer(req) ||
    (req.cookies && (req.cookies['access_token'] || req.cookies['jwt'])) ||
    (req.headers['x-access-token'] as string) ||
    (req.query['access_token'] as string) ||
    null
  );
}
