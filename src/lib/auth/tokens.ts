import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const EXPIRES_IN = '8h';

export function createToken(payload: object) {
  return sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string) {
  return verify(token, JWT_SECRET);
}
