import { z } from 'zod';

export const createPageSchema = z.object({
  slug: z.string().min(1).max(255),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  content: z.any().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().optional(),
  ogImage: z.string().url().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  template: z.string().default('default'),
  order: z.number().int().default(0),
});

export const updatePageSchema = createPageSchema.partial();

export const pageQuerySchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type PageQueryInput = z.infer<typeof pageQuerySchema>;
