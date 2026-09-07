import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken, type AuthenticatedUser } from '../lib/jwt.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authorization = request.headers.authorization;
  const [scheme, token] = authorization?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    return reply.code(401).send({ error: 'missing or invalid authorization header' });
  }

  try {
    request.user = await verifyAccessToken(token);
  } catch {
    return reply.code(401).send({ error: 'invalid or expired access token' });
  }
}
