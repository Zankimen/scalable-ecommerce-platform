import Fastify from 'fastify';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { prisma } from './lib/prisma.js';

const app = Fastify({
  logger: true,
});

app.get('/health', async () => ({
  status: 'ok',
  service: 'user-service',
  timestamp: new Date().toISOString(),
}));

await app.register(authRoutes);
await app.register(userRoutes);

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '0.0.0.0';

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  await prisma.$disconnect();
  process.exit(1);
}

const shutdown = async () => {
  await app.close();
  await prisma.$disconnect();
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
