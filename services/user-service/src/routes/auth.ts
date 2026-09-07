import type { FastifyInstance } from 'fastify';
import { compare, hash } from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { createAccessToken } from '../lib/jwt.js';

type RegisterBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

type LoginBody = {
  email: string;
  password: string;
};

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterBody }>('/auth/register', async (request, reply) => {
    const { email, password, firstName, lastName } = request.body ?? {};
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password || !firstName?.trim() || !lastName?.trim()) {
      return reply.code(400).send({ error: 'email, password, firstName, and lastName are required' });
    }

    if (password.length < 8) {
      return reply.code(400).send({ error: 'password must be at least 8 characters' });
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return reply.code(400).send({ error: 'email must be valid' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return reply.code(409).send({ error: 'email is already registered' });
    }

    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    return reply.code(201).send({ user });
  });

  app.post<{ Body: LoginBody }>('/auth/login', async (request, reply) => {
    const { email, password } = request.body ?? {};
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return reply.code(400).send({ error: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Use the same response for an unknown email and a wrong password.
    if (!user || !(await compare(password, user.passwordHash))) {
      return reply.code(401).send({ error: 'invalid email or password' });
    }

    const accessToken = await createAccessToken(user);

    return reply.send({
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  });
}
