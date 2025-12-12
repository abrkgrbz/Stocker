import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

// Routes
import { pageRoutes } from './routes/pages.js';
import { blogRoutes } from './routes/blog.js';
import { faqRoutes } from './routes/faq.js';
import { mediaRoutes } from './routes/media.js';
import { settingsRoutes } from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Fastify({
  logger: {
    level: env.isDev ? 'info' : 'warn',
    transport: env.isDev
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  },
});

// Plugins
await app.register(cors, {
  origin: env.corsOrigin,
  credentials: true,
});

await app.register(jwt, {
  secret: env.jwtSecret,
});

await app.register(multipart, {
  limits: {
    fileSize: env.maxFileSize,
  },
});

await app.register(fastifyStatic, {
  root: path.join(__dirname, '..', env.uploadDir),
  prefix: '/uploads/',
});

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// API info
app.get('/', async () => {
  return {
    name: 'Stocker CMS API',
    version: '1.0.0',
    endpoints: {
      pages: '/api/pages',
      blog: '/api/blog',
      faq: '/api/faq',
      media: '/api/media',
      settings: '/api/settings',
    },
  };
});

// Register routes
await app.register(pageRoutes, { prefix: '/api/pages' });
await app.register(blogRoutes, { prefix: '/api/blog' });
await app.register(faqRoutes, { prefix: '/api/faq' });
await app.register(mediaRoutes, { prefix: '/api/media' });
await app.register(settingsRoutes, { prefix: '/api/settings' });

// Graceful shutdown
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    await app.close();
    await disconnectDatabase();
    process.exit(0);
  });
});

// Start server
const start = async () => {
  try {
    await connectDatabase();
    await app.listen({ port: env.port, host: env.host });
    console.log(`🚀 Stocker CMS API running at http://${env.host}:${env.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
