import { prisma } from '../config/database.js';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreatePostInput,
  UpdatePostInput,
  PostQueryInput,
} from '../schemas/blog.schema.js';

export class BlogService {
  // Categories
  async findAllCategories() {
    return prisma.blogCategory.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { posts: true } } },
    });
  }

  async findCategoryBySlug(slug: string) {
    return prisma.blogCategory.findUnique({
      where: { slug },
      include: { _count: { select: { posts: true } } },
    });
  }

  async createCategory(data: CreateCategoryInput) {
    return prisma.blogCategory.create({ data });
  }

  async updateCategory(id: string, data: UpdateCategoryInput) {
    return prisma.blogCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    return prisma.blogCategory.delete({ where: { id } });
  }

  // Posts
  async findAllPosts(query: PostQueryInput) {
    const { status, categoryId, featured, search, limit, offset } = query;

    const where = {
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(featured !== undefined && { featured }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { excerpt: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          category: true,
          tags: true,
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return { posts, total, limit, offset };
  }

  async findPostBySlug(slug: string) {
    return prisma.blogPost.findUnique({
      where: { slug },
      include: { category: true, tags: true },
    });
  }

  async findPostById(id: string) {
    return prisma.blogPost.findUnique({
      where: { id },
      include: { category: true, tags: true },
    });
  }

  async createPost(data: CreatePostInput) {
    const { tags, ...postData } = data;

    return prisma.blogPost.create({
      data: {
        ...postData,
        publishedAt: postData.status === 'PUBLISHED' ? new Date() : null,
        tags: tags
          ? {
              connectOrCreate: tags.map((tag) => ({
                where: { slug: tag.toLowerCase().replace(/\s+/g, '-') },
                create: {
                  slug: tag.toLowerCase().replace(/\s+/g, '-'),
                  name: tag,
                },
              })),
            }
          : undefined,
      },
      include: { category: true, tags: true },
    });
  }

  async updatePost(id: string, data: UpdatePostInput) {
    const { tags, ...postData } = data;
    const existing = await this.findPostById(id);

    return prisma.blogPost.update({
      where: { id },
      data: {
        ...postData,
        publishedAt:
          postData.status === 'PUBLISHED' && existing?.status !== 'PUBLISHED'
            ? new Date()
            : existing?.publishedAt,
        tags: tags
          ? {
              set: [],
              connectOrCreate: tags.map((tag) => ({
                where: { slug: tag.toLowerCase().replace(/\s+/g, '-') },
                create: {
                  slug: tag.toLowerCase().replace(/\s+/g, '-'),
                  name: tag,
                },
              })),
            }
          : undefined,
      },
      include: { category: true, tags: true },
    });
  }

  async deletePost(id: string) {
    return prisma.blogPost.delete({ where: { id } });
  }

  async incrementViews(id: string) {
    return prisma.blogPost.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  // Tags
  async findAllTags() {
    return prisma.blogTag.findMany({
      include: { _count: { select: { posts: true } } },
    });
  }
}

export const blogService = new BlogService();
