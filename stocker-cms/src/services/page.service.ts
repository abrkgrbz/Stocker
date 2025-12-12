import { prisma } from '../config/database.js';
import type { CreatePageInput, UpdatePageInput, PageQueryInput } from '../schemas/page.schema.js';

export class PageService {
  async findAll(query: PageQueryInput) {
    const { status, search, limit, offset } = query;

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        orderBy: { order: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.page.count({ where }),
    ]);

    return { pages, total, limit, offset };
  }

  async findBySlug(slug: string) {
    return prisma.page.findUnique({ where: { slug } });
  }

  async findById(id: string) {
    return prisma.page.findUnique({ where: { id } });
  }

  async create(data: CreatePageInput) {
    return prisma.page.create({
      data: {
        ...data,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
    });
  }

  async update(id: string, data: UpdatePageInput) {
    const existing = await this.findById(id);

    return prisma.page.update({
      where: { id },
      data: {
        ...data,
        publishedAt:
          data.status === 'PUBLISHED' && existing?.status !== 'PUBLISHED'
            ? new Date()
            : existing?.publishedAt,
      },
    });
  }

  async delete(id: string) {
    return prisma.page.delete({ where: { id } });
  }

  async incrementViews(id: string) {
    return prisma.page.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }
}

export const pageService = new PageService();
