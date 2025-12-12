import { FastifyInstance } from 'fastify';
import { blogService } from '../services/blog.service.js';
import {
  createCategorySchema,
  updateCategorySchema,
  createPostSchema,
  updatePostSchema,
  postQuerySchema,
} from '../schemas/blog.schema.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

interface IdParams {
  Params: { id: string };
}

interface SlugParams {
  Params: { slug: string };
}

export async function blogRoutes(app: FastifyInstance) {
  // ==================== CATEGORIES ====================

  // Get all categories (public)
  app.get('/categories', async () => {
    return blogService.findAllCategories();
  });

  // Get category by slug (public)
  app.get<SlugParams>('/categories/:slug', async (request, reply) => {
    const category = await blogService.findCategoryBySlug(request.params.slug);
    if (!category) {
      return reply.status(404).send({ error: 'Category not found' });
    }
    return category;
  });

  // Create category (authenticated)
  app.post('/categories', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const data = createCategorySchema.parse(request.body);
      const category = await blogService.createCategory(data);
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
      const data = updateCategorySchema.parse(request.body);
      const category = await blogService.updateCategory(request.params.id, data);
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
      await blogService.deleteCategory(request.params.id);
      return reply.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'Category not found' });
      }
      reply.status(500).send({ error: 'Failed to delete category' });
    }
  });

  // ==================== POSTS ====================

  // Get all posts (public)
  app.get('/posts', async (request, reply) => {
    try {
      const query = postQuerySchema.parse(request.query);
      return blogService.findAllPosts(query);
    } catch (error: any) {
      reply.status(400).send({ error: 'Invalid query', details: error.message });
    }
  });

  // Get post by slug (public)
  app.get<SlugParams>('/posts/:slug', { preHandler: [optionalAuth] }, async (request, reply) => {
    const post = await blogService.findPostBySlug(request.params.slug);
    if (!post) {
      return reply.status(404).send({ error: 'Post not found' });
    }

    // Increment views
    await blogService.incrementViews(post.id);

    return post;
  });

  // Create post (authenticated)
  app.post('/posts', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const data = createPostSchema.parse(request.body);
      const post = await blogService.createPost(data);
      return reply.status(201).send(post);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return reply.status(409).send({ error: 'Post with this slug already exists' });
      }
      reply.status(400).send({ error: 'Validation error', details: error.message });
    }
  });

  // Update post (authenticated)
  app.put<IdParams>('/posts/:id', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const data = updatePostSchema.parse(request.body);
      const post = await blogService.updatePost(request.params.id, data);
      return post;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'Post not found' });
      }
      reply.status(400).send({ error: 'Validation error', details: error.message });
    }
  });

  // Delete post (authenticated)
  app.delete<IdParams>('/posts/:id', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      await blogService.deletePost(request.params.id);
      return reply.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'Post not found' });
      }
      reply.status(500).send({ error: 'Failed to delete post' });
    }
  });

  // ==================== TAGS ====================

  // Get all tags (public)
  app.get('/tags', async () => {
    return blogService.findAllTags();
  });
}
