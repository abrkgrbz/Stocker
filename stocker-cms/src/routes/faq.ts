import { FastifyInstance } from 'fastify';
import { faqService } from '../services/faq.service.js';
import {
  createFAQCategorySchema,
  updateFAQCategorySchema,
  createFAQSchema,
  updateFAQSchema,
  faqQuerySchema,
  faqFeedbackSchema,
} from '../schemas/faq.schema.js';
import { authenticate } from '../middleware/auth.js';

interface IdParams {
  Params: { id: string };
}

interface SlugParams {
  Params: { slug: string };
}

export async function faqRoutes(app: FastifyInstance) {
  // ==================== CATEGORIES ====================

  // Get all categories (public)
  app.get('/categories', async () => {
    return faqService.findAllCategories();
  });

  // Get category by slug with FAQs (public)
  app.get<SlugParams>('/categories/:slug', async (request, reply) => {
    const category = await faqService.findCategoryBySlug(request.params.slug);
    if (!category) {
      return reply.status(404).send({ error: 'Category not found' });
    }
    return category;
  });

  // Create category (authenticated)
  app.post('/categories', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const data = createFAQCategorySchema.parse(request.body);
      const category = await faqService.createCategory(data);
      return reply.status(201).send(category);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return reply.status(409).send({ error: 'Category with this slug already exists' });
      }
      reply.status(400).send({ error: 'Validation error', details: error.message });
    }
  });

  // Update category (authenticated)
  app.put<IdParams>('/categories/:id', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const data = updateFAQCategorySchema.parse(request.body);
      const category = await faqService.updateCategory(request.params.id, data);
      return category;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'Category not found' });
      }
      reply.status(400).send({ error: 'Validation error', details: error.message });
    }
  });

  // Delete category (authenticated)
  app.delete<IdParams>('/categories/:id', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      await faqService.deleteCategory(request.params.id);
      return reply.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'Category not found' });
      }
      reply.status(500).send({ error: 'Failed to delete category' });
    }
  });

  // ==================== FAQs ====================

  // Get all FAQs (public)
  app.get('/', async (request, reply) => {
    try {
      const query = faqQuerySchema.parse(request.query);
      return faqService.findAll(query);
    } catch (error: any) {
      reply.status(400).send({ error: 'Invalid query', details: error.message });
    }
  });

  // Get FAQs grouped by category (public - for landing page)
  app.get('/grouped', async () => {
    return faqService.findGroupedByCategory();
  });

  // Get FAQ by ID (public)
  app.get<IdParams>('/:id', async (request, reply) => {
    const faq = await faqService.findById(request.params.id);
    if (!faq) {
      return reply.status(404).send({ error: 'FAQ not found' });
    }

    // Increment views
    await faqService.incrementViews(faq.id);

    return faq;
  });

  // Create FAQ (authenticated)
  app.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const data = createFAQSchema.parse(request.body);
      const faq = await faqService.create(data);
      return reply.status(201).send(faq);
    } catch (error: any) {
      reply.status(400).send({ error: 'Validation error', details: error.message });
    }
  });

  // Update FAQ (authenticated)
  app.put<IdParams>('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const data = updateFAQSchema.parse(request.body);
      const faq = await faqService.update(request.params.id, data);
      return faq;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'FAQ not found' });
      }
      reply.status(400).send({ error: 'Validation error', details: error.message });
    }
  });

  // Delete FAQ (authenticated)
  app.delete<IdParams>('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      await faqService.delete(request.params.id);
      return reply.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'FAQ not found' });
      }
      reply.status(500).send({ error: 'Failed to delete FAQ' });
    }
  });

  // Submit feedback (public)
  app.post<IdParams>('/:id/feedback', async (request, reply) => {
    try {
      const { helpful } = faqFeedbackSchema.parse(request.body);
      await faqService.submitFeedback(request.params.id, helpful);
      return { success: true };
    } catch (error: any) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'FAQ not found' });
      }
      reply.status(400).send({ error: 'Invalid feedback' });
    }
  });
}
