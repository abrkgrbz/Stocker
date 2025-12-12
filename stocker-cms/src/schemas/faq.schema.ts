import { z } from 'zod';

// Category schemas
export const createFAQCategorySchema = z.object({
  slug: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().default(0),
});

export const updateFAQCategorySchema = createFAQCategorySchema.partial();

// FAQ schemas
export const createFAQSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1),
  categoryId: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateFAQSchema = createFAQSchema.partial();

export const faqQuerySchema = z.object({
  categoryId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// Feedback schema
export const faqFeedbackSchema = z.object({
  helpful: z.boolean(),
});

export type CreateFAQCategoryInput = z.infer<typeof createFAQCategorySchema>;
export type UpdateFAQCategoryInput = z.infer<typeof updateFAQCategorySchema>;
export type CreateFAQInput = z.infer<typeof createFAQSchema>;
export type UpdateFAQInput = z.infer<typeof updateFAQSchema>;
export type FAQQueryInput = z.infer<typeof faqQuerySchema>;
