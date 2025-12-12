import { FastifyInstance } from 'fastify';
import { pageService } from '../services/page.service.js';
import { createPageSchema, updatePageSchema, pageQuerySchema } from '../schemas/page.schema.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

interface IdParams {
  Params: { id: string };
}

interface SlugParams {
  Params: { slug: string };
}

export async function pageRoutes(app: FastifyInstance) {
  // Get all pages (public, with optional filters)
  app.get('/', async (request, reply) => {
    try {
      const query = pageQuerySchema.parse(request.query);
      const result = await pageService.findAll(query);
      return result;
    } catch (error: any) {
      reply.status(400).send({ error: 'Invalid query', details: error.message });
    }
  });

  // Get page by slug (public)
  app.get<SlugParams>('/:slug', { preHandler: [optionalAuth] }, async (request, reply) => {
    const page = await pageService.findBySlug(request.params.slug);

    if (!page) {
      return reply.status(404).send({ error: 'Page not found' });
    }

    // Increment views for public access
    await pageService.incrementViews(page.id);

    return page;
  });

  // Create page (authenticated)
  app.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const data = createPageSchema.parse(request.body);
      const page = await pageService.create(data);
      return reply.status(201).send(page);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return reply.status(409).send({ error: 'Page with this slug already exists' });
      }
      reply.status(400).send({ error: 'Validation error', details: error.message });
    }
  });

  // Update page (authenticated)
  app.put<IdParams>('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const data = updatePageSchema.parse(request.body);
      const page = await pageService.update(request.params.id, data);
      return page;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'Page not found' });
      }
      if (error.code === 'P2002') {
        return reply.status(409).send({ error: 'Page with this slug already exists' });
      }
      reply.status(400).send({ error: 'Validation error', details: error.message });
    }
  });

  // Delete page (authenticated)
  app.delete<IdParams>('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      await pageService.delete(request.params.id);
      return reply.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'Page not found' });
      }
      reply.status(500).send({ error: 'Failed to delete page' });
    }
  });
}
