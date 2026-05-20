import { createHmac, timingSafeEqual } from 'crypto';

export type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
};

const toBase64Url = (input: string): string =>
  Buffer.from(input, 'utf8').toString('base64url');

const fromBase64Url = (input: string): string =>
  Buffer.from(input, 'base64url').toString('utf8');

const signValue = (value: string, secret: string): string =>
  createHmac('sha256', secret).update(value).digest('base64url');

export const createAuthToken = (payload: AuthTokenPayload, secret: string): string => {
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
};

export const verifyAuthToken = (
  token: string,
  secret: string,
): AuthTokenPayload | null => {
  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, signature] = parts;
  const expectedSignature = signValue(encodedPayload, secret);

  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const actualBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== actualBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as AuthTokenPayload;
    if (!payload?.sub || !payload?.email || !payload?.exp || !payload?.iat) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};
