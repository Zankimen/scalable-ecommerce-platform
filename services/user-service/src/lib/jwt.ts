import 'dotenv/config';
import { jwtVerify, SignJWT } from 'jose';

export type AuthenticatedUser = {
  id: string;
  email: string;
};

function getSecret() {
  const value = process.env.JWT_SECRET;
  if (!value) {
    throw new Error('JWT_SECRET is required');
  }
  return new TextEncoder().encode(value);
}

export function createAccessToken(user: { id: string; email: string }) {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<AuthenticatedUser> {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: ['HS256'],
  });

  if (!payload.sub || typeof payload.email !== 'string') {
    throw new Error('invalid token claims');
  }

  return {
    id: payload.sub,
    email: payload.email,
  };
}
