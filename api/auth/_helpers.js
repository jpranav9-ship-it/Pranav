import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE = 'aeo_session';

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, 12);
}

export function createSessionToken() {
  return randomBytes(32).toString('hex');
}

export function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function setSessionCookie(response, token) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  return response;
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}

export function getSessionToken(request) {
  return request.cookies.get(SESSION_COOKIE)?.value || '';
}
