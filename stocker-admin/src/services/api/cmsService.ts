import { apiClient } from './apiClient';

// ================== Page DTOs ==================
export interface PageDto {
  id: string;
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  content: string;
  status: PageStatus;
  sortOrder: number;
  featuredImage?: string;
  template?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type PageStatus = 'Draft' | 'Published' | 'Archived';

export interface CreatePageDto {
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  content: string;
  status?: PageStatus;
  sortOrder?: number;
  featuredImage?: string;
  template?: string;
}

export interface UpdatePageDto {
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  content: string;
  status: PageStatus;
  sortOrder: number;
  featuredImage?: string;
  template?: string;
}

// ================== Blog DTOs ==================
export interface BlogCategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  postCount: number;
  createdAt: string;
}

export interface BlogCategoryListDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  postCount: number;
}

export interface CreateBlogCategoryDto {
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateBlogCategoryDto {
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface BlogPostDto {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  status: BlogPostStatus;
  publishedAt?: string;
  scheduledAt?: string;
  viewCount: number;
  readTime?: string;
  author?: string;
  tags?: string;
  categoryId?: string;
  categoryName?: string;
  createdAt: string;
  updatedAt?: string;
}

export type BlogPostStatus = 'Draft' | 'Published' | 'Scheduled' | 'Archived';

export interface BlogPostListDto {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  status: BlogPostStatus;
  publishedAt?: string;
  viewCount: number;
  readTime?: string;
  author?: string;
  categoryName?: string;
}

export interface CreateBlogPostDto {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  status?: BlogPostStatus;
  scheduledAt?: string;
  readTime?: string;
  author?: string;
  tags?: string;
  categoryId?: string;
}

export interface UpdateBlogPostDto {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  status: BlogPostStatus;
  scheduledAt?: string;
  readTime?: string;
  author?: string;
  tags?: string;
  categoryId?: string;
}

// ================== FAQ DTOs ==================
export interface FAQCategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  itemCount: number;
  items: FAQItemDto[];
}

export interface FAQCategoryListDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  itemCount: number;
}

export interface CreateFAQCategoryDto {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateFAQCategoryDto {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface FAQItemDto {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  categoryId: string;
  categoryName?: string;
}

export interface CreateFAQItemDto {
  question: string;
  answer: string;
  sortOrder?: number;
  isActive?: boolean;
  categoryId: string;
}

export interface UpdateFAQItemDto {
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  categoryId: string;
}

// ================== Settings DTOs ==================
export interface CMSSettingDto {
  id: string;
  key: string;
  value: string;
  group: string;
  description?: string;
}

export interface CreateSettingDto {
  key: string;
  value: string;
  group?: string;
  description?: string;
}

// ================== CMS Service ==================
class CMSService {
  private readonly basePath = '/api/cms';

  // ================== Pages ==================
  async getPages(): Promise<PageDto[]> {
    return apiClient.get<PageDto[]>(`${this.basePath}/pages`);
  }

  async getPageBySlug(slug: string): Promise<PageDto> {
    return apiClient.get<PageDto>(`${this.basePath}/pages/by-slug/${slug}`);
  }

  async getPageById(id: string): Promise<PageDto> {
    return apiClient.get<PageDto>(`${this.basePath}/pages/${id}`);
  }

  async createPage(data: CreatePageDto): Promise<PageDto> {
    return apiClient.post<PageDto>(`${this.basePath}/pages`, data);
  }

  async updatePage(id: string, data: UpdatePageDto): Promise<PageDto> {
    return apiClient.put<PageDto>(`${this.basePath}/pages/${id}`, data);
  }

  async deletePage(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/pages/${id}`);
  }

  async publishPage(id: string): Promise<PageDto> {
    return apiClient.post<PageDto>(`${this.basePath}/pages/${id}/publish`);
  }

  async unpublishPage(id: string): Promise<PageDto> {
    return apiClient.post<PageDto>(`${this.basePath}/pages/${id}/unpublish`);
  }

  // ================== Blog Categories ==================
  async getBlogCategories(): Promise<BlogCategoryListDto[]> {
    return apiClient.get<BlogCategoryListDto[]>(`${this.basePath}/blog/categories`);
  }

  async getBlogCategoryById(id: string): Promise<BlogCategoryDto> {
    return apiClient.get<BlogCategoryDto>(`${this.basePath}/blog/categories/${id}`);
  }

  async createBlogCategory(data: CreateBlogCategoryDto): Promise<BlogCategoryDto> {
    return apiClient.post<BlogCategoryDto>(`${this.basePath}/blog/categories`, data);
  }

  async updateBlogCategory(id: string, data: UpdateBlogCategoryDto): Promise<BlogCategoryDto> {
    return apiClient.put<BlogCategoryDto>(`${this.basePath}/blog/categories/${id}`, data);
  }

  async deleteBlogCategory(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/blog/categories/${id}`);
  }

  // ================== Blog Posts ==================
  async getBlogPosts(categoryId?: string): Promise<BlogPostListDto[]> {
    const params = categoryId ? { categoryId } : undefined;
    return apiClient.get<BlogPostListDto[]>(`${this.basePath}/blog/posts`, params);
  }

  async getBlogPostById(id: string): Promise<BlogPostDto> {
    return apiClient.get<BlogPostDto>(`${this.basePath}/blog/posts/${id}`);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPostDto> {
    return apiClient.get<BlogPostDto>(`${this.basePath}/blog/posts/by-slug/${slug}`);
  }

  async createBlogPost(data: CreateBlogPostDto): Promise<BlogPostDto> {
    return apiClient.post<BlogPostDto>(`${this.basePath}/blog/posts`, data);
  }

  async updateBlogPost(id: string, data: UpdateBlogPostDto): Promise<BlogPostDto> {
    return apiClient.put<BlogPostDto>(`${this.basePath}/blog/posts/${id}`, data);
  }

  async deleteBlogPost(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/blog/posts/${id}`);
  }

  async publishBlogPost(id: string): Promise<BlogPostDto> {
    return apiClient.post<BlogPostDto>(`${this.basePath}/blog/posts/${id}/publish`);
  }

  async unpublishBlogPost(id: string): Promise<BlogPostDto> {
    return apiClient.post<BlogPostDto>(`${this.basePath}/blog/posts/${id}/unpublish`);
  }

  // ================== FAQ Categories ==================
  async getFAQCategories(): Promise<FAQCategoryListDto[]> {
    return apiClient.get<FAQCategoryListDto[]>(`${this.basePath}/faq/categories`);
  }

  async getFAQCategoryById(id: string): Promise<FAQCategoryDto> {
    return apiClient.get<FAQCategoryDto>(`${this.basePath}/faq/categories/${id}`);
  }

  async createFAQCategory(data: CreateFAQCategoryDto): Promise<FAQCategoryDto> {
    return apiClient.post<FAQCategoryDto>(`${this.basePath}/faq/categories`, data);
  }

  async updateFAQCategory(id: string, data: UpdateFAQCategoryDto): Promise<FAQCategoryDto> {
    return apiClient.put<FAQCategoryDto>(`${this.basePath}/faq/categories/${id}`, data);
  }

  async deleteFAQCategory(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/faq/categories/${id}`);
  }

  // ================== FAQ Items ==================
  async getFAQItems(categoryId?: string): Promise<FAQItemDto[]> {
    const params = categoryId ? { categoryId } : undefined;
    return apiClient.get<FAQItemDto[]>(`${this.basePath}/faq/items`, params);
  }

  async getFAQItemById(id: string): Promise<FAQItemDto> {
    return apiClient.get<FAQItemDto>(`${this.basePath}/faq/items/${id}`);
  }

  async createFAQItem(data: CreateFAQItemDto): Promise<FAQItemDto> {
    return apiClient.post<FAQItemDto>(`${this.basePath}/faq/items`, data);
  }

  async updateFAQItem(id: string, data: UpdateFAQItemDto): Promise<FAQItemDto> {
    return apiClient.put<FAQItemDto>(`${this.basePath}/faq/items/${id}`, data);
  }

  async deleteFAQItem(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/faq/items/${id}`);
  }

  async submitFAQFeedback(id: string, helpful: boolean): Promise<void> {
    return apiClient.post(`${this.basePath}/faq/items/${id}/feedback`, { helpful });
  }

  // ================== Settings ==================
  async getSettings(group?: string): Promise<CMSSettingDto[]> {
    const params = group ? { group } : undefined;
    return apiClient.get<CMSSettingDto[]>(`${this.basePath}/settings`, params);
  }

  async getSettingByKey(key: string): Promise<CMSSettingDto> {
    return apiClient.get<CMSSettingDto>(`${this.basePath}/settings/${key}`);
  }

  async upsertSetting(data: CreateSettingDto): Promise<CMSSettingDto> {
    return apiClient.post<CMSSettingDto>(`${this.basePath}/settings`, data);
  }

  async deleteSetting(key: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/settings/${key}`);
  }

  async initializeDefaultSettings(): Promise<CMSSettingDto[]> {
    return apiClient.post<CMSSettingDto[]>(`${this.basePath}/settings/init`);
  }
}

export const cmsService = new CMSService();
