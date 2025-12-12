import { z } from 'zod';

// Category schemas
export const createCategorySchema = z.object({
  slug: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  color: z.string().default('#667eea'),
  order: z.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

// Post schemas
export const createPostSchema = z.object({
  slug: z.string().min(1).max(255),
  title: z.string().min(1).max(255),
  excerpt: z.string().max(500).optional(),
  content: z.any().optional(),
  coverImage: z.string().url().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().optional(),
  authorName: z.string().min(1).max(100),
  authorAvatar: z.string().optional(),
  readTime: z.number().int().min(1).default(5),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']).default('DRAFT'),
  featured: z.boolean().default(false),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  publishedAt: z.string().datetime().optional(),
});

export const updatePostSchema = createPostSchema.partial();

export const postQuerySchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']).optional(),
  categoryId: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostQueryInput = z.infer<typeof postQuerySchema>;
