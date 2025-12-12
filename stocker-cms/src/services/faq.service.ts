import { prisma } from '../config/database.js';
import type {
  CreateFAQCategoryInput,
  UpdateFAQCategoryInput,
  CreateFAQInput,
  UpdateFAQInput,
  FAQQueryInput,
} from '../schemas/faq.schema.js';

export class FAQService {
  // Categories
  async findAllCategories() {
    return prisma.fAQCategory.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { faqs: true } } },
    });
  }

  async findCategoryBySlug(slug: string) {
    return prisma.fAQCategory.findUnique({
      where: { slug },
      include: {
        faqs: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async createCategory(data: CreateFAQCategoryInput) {
    return prisma.fAQCategory.create({ data });
  }

  async updateCategory(id: string, data: UpdateFAQCategoryInput) {
    return prisma.fAQCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    return prisma.fAQCategory.delete({ where: { id } });
  }

  // FAQs
  async findAll(query: FAQQueryInput) {
    const { categoryId, isActive, search, limit, offset } = query;

    const where = {
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { question: { contains: search, mode: 'insensitive' as const } },
          { answer: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [faqs, total] = await Promise.all([
      prisma.fAQ.findMany({
        where,
        orderBy: { order: 'asc' },
        take: limit,
        skip: offset,
        include: { category: true },
      }),
      prisma.fAQ.count({ where }),
    ]);

    return { faqs, total, limit, offset };
  }

  async findById(id: string) {
    return prisma.fAQ.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async create(data: CreateFAQInput) {
    return prisma.fAQ.create({
      data,
      include: { category: true },
    });
  }

  async update(id: string, data: UpdateFAQInput) {
    return prisma.fAQ.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: string) {
    return prisma.fAQ.delete({ where: { id } });
  }

  async incrementViews(id: string) {
    return prisma.fAQ.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async submitFeedback(id: string, helpful: boolean) {
    return prisma.fAQ.update({
      where: { id },
      data: helpful ? { helpful: { increment: 1 } } : { notHelpful: { increment: 1 } },
    });
  }

  // Get grouped by category for public display
  async findGroupedByCategory() {
    const categories = await prisma.fAQCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        faqs: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    return categories.filter((cat) => cat.faqs.length > 0);
  }
}

export const faqService = new FAQService();
