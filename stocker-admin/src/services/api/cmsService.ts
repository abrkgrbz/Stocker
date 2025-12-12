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

// ================== Landing Page DTOs ==================
export interface TestimonialDto {
  id: string;
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating: number;
  avatar?: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface CreateTestimonialDto {
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating?: number;
  avatar?: string;
  sortOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateTestimonialDto extends CreateTestimonialDto {}

export interface PricingPlanDto {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  currency: string;
  billingPeriod: string;
  originalPrice?: number;
  badge?: string;
  buttonText?: string;
  buttonUrl?: string;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  features: PricingFeatureDto[];
  createdAt: string;
}

export interface CreatePricingPlanDto {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  currency?: string;
  billingPeriod?: string;
  originalPrice?: number;
  badge?: string;
  buttonText?: string;
  buttonUrl?: string;
  isPopular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdatePricingPlanDto extends CreatePricingPlanDto {}

export interface PricingFeatureDto {
  id: string;
  name: string;
  description?: string;
  isIncluded: boolean;
  value?: string;
  sortOrder: number;
  isActive: boolean;
  planId: string;
}

export interface CreatePricingFeatureDto {
  name: string;
  description?: string;
  isIncluded?: boolean;
  value?: string;
  sortOrder?: number;
  isActive?: boolean;
  planId: string;
}

export interface UpdatePricingFeatureDto {
  name: string;
  description?: string;
  isIncluded: boolean;
  value?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface FeatureDto {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  image?: string;
  category?: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface CreateFeatureDto {
  title: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  image?: string;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateFeatureDto extends CreateFeatureDto {}

export interface IndustryDto {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  image?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateIndustryDto {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  image?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateIndustryDto extends CreateIndustryDto {}

export interface IntegrationDto {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  items: IntegrationItemDto[];
  createdAt: string;
}

export interface CreateIntegrationDto {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateIntegrationDto extends CreateIntegrationDto {}

export interface IntegrationItemDto {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  url?: string;
  sortOrder: number;
  isActive: boolean;
  integrationId: string;
}

export interface CreateIntegrationItemDto {
  name: string;
  description?: string;
  logo?: string;
  url?: string;
  sortOrder?: number;
  isActive?: boolean;
  integrationId: string;
}

export interface UpdateIntegrationItemDto {
  name: string;
  description?: string;
  logo?: string;
  url?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface StatDto {
  id: string;
  label: string;
  value: string;
  suffix?: string;
  prefix?: string;
  icon?: string;
  section?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateStatDto {
  label: string;
  value: string;
  suffix?: string;
  prefix?: string;
  icon?: string;
  section?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateStatDto extends CreateStatDto {}

export interface PartnerDto {
  id: string;
  name: string;
  logo?: string;
  logoDark?: string;
  url?: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface CreatePartnerDto {
  name: string;
  logo?: string;
  logoDark?: string;
  url?: string;
  sortOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdatePartnerDto extends CreatePartnerDto {}

export interface AchievementDto {
  id: string;
  title: string;
  value: string;
  icon?: string;
  iconColor?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAchievementDto {
  title: string;
  value: string;
  icon?: string;
  iconColor?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateAchievementDto extends CreateAchievementDto {}

// ================== Company Page DTOs ==================
export interface TeamMemberDto {
  id: string;
  name: string;
  role?: string;
  department?: string;
  bio?: string;
  avatar?: string;
  email?: string;
  linkedIn?: string;
  twitter?: string;
  sortOrder: number;
  isActive: boolean;
  isLeadership: boolean;
  createdAt: string;
}

export interface CreateTeamMemberDto {
  name: string;
  role?: string;
  department?: string;
  bio?: string;
  avatar?: string;
  email?: string;
  linkedIn?: string;
  twitter?: string;
  sortOrder?: number;
  isActive?: boolean;
  isLeadership?: boolean;
}

export interface UpdateTeamMemberDto extends CreateTeamMemberDto {}

export interface CompanyValueDto {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCompanyValueDto {
  title: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCompanyValueDto extends CreateCompanyValueDto {}

export interface ContactInfoDto {
  id: string;
  type: string;
  title: string;
  value: string;
  icon?: string;
  iconColor?: string;
  href?: string;
  additionalInfo?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateContactInfoDto {
  type: string;
  title: string;
  value: string;
  icon?: string;
  iconColor?: string;
  href?: string;
  additionalInfo?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateContactInfoDto extends CreateContactInfoDto {}

export interface SocialLinkDto {
  id: string;
  platform: string;
  url: string;
  icon?: string;
  label?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSocialLinkDto {
  platform: string;
  url: string;
  icon?: string;
  label?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateSocialLinkDto extends CreateSocialLinkDto {}

// ================== Documentation DTOs ==================
export interface DocCategoryDto {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  articleCount: number;
  articles: DocArticleDto[];
  createdAt: string;
}

export interface DocCategoryListDto {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  articleCount: number;
}

export interface CreateDocCategoryDto {
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateDocCategoryDto extends CreateDocCategoryDto {}

export interface DocArticleDto {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  icon?: string;
  metaTitle?: string;
  metaDescription?: string;
  sortOrder: number;
  isActive: boolean;
  isPopular: boolean;
  viewCount: number;
  categoryId: string;
  categoryTitle?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DocArticleListDto {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  isPopular: boolean;
  viewCount: number;
  categoryTitle?: string;
}

export interface CreateDocArticleDto {
  title: string;
  slug: string;
  description?: string;
  content?: string;
  icon?: string;
  metaTitle?: string;
  metaDescription?: string;
  sortOrder?: number;
  isActive?: boolean;
  isPopular?: boolean;
  categoryId: string;
}

export interface UpdateDocArticleDto extends CreateDocArticleDto {}

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

  // ================== Landing Page - Testimonials ==================
  async getTestimonials(): Promise<TestimonialDto[]> {
    return apiClient.get<TestimonialDto[]>(`${this.basePath}/landing/testimonials`);
  }

  async getTestimonialById(id: string): Promise<TestimonialDto> {
    return apiClient.get<TestimonialDto>(`${this.basePath}/landing/testimonials/${id}`);
  }

  async createTestimonial(data: CreateTestimonialDto): Promise<TestimonialDto> {
    return apiClient.post<TestimonialDto>(`${this.basePath}/landing/testimonials`, data);
  }

  async updateTestimonial(id: string, data: UpdateTestimonialDto): Promise<TestimonialDto> {
    return apiClient.put<TestimonialDto>(`${this.basePath}/landing/testimonials/${id}`, data);
  }

  async deleteTestimonial(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/landing/testimonials/${id}`);
  }

  // ================== Landing Page - Pricing Plans ==================
  async getPricingPlans(): Promise<PricingPlanDto[]> {
    return apiClient.get<PricingPlanDto[]>(`${this.basePath}/landing/pricing-plans`);
  }

  async getPricingPlanById(id: string): Promise<PricingPlanDto> {
    return apiClient.get<PricingPlanDto>(`${this.basePath}/landing/pricing-plans/${id}`);
  }

  async createPricingPlan(data: CreatePricingPlanDto): Promise<PricingPlanDto> {
    return apiClient.post<PricingPlanDto>(`${this.basePath}/landing/pricing-plans`, data);
  }

  async updatePricingPlan(id: string, data: UpdatePricingPlanDto): Promise<PricingPlanDto> {
    return apiClient.put<PricingPlanDto>(`${this.basePath}/landing/pricing-plans/${id}`, data);
  }

  async deletePricingPlan(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/landing/pricing-plans/${id}`);
  }

  // ================== Landing Page - Pricing Features ==================
  async getPricingFeatures(planId: string): Promise<PricingFeatureDto[]> {
    return apiClient.get<PricingFeatureDto[]>(`${this.basePath}/landing/pricing-plans/${planId}/features`);
  }

  async createPricingFeature(data: CreatePricingFeatureDto): Promise<PricingFeatureDto> {
    return apiClient.post<PricingFeatureDto>(`${this.basePath}/landing/pricing-features`, data);
  }

  async updatePricingFeature(id: string, data: UpdatePricingFeatureDto): Promise<PricingFeatureDto> {
    return apiClient.put<PricingFeatureDto>(`${this.basePath}/landing/pricing-features/${id}`, data);
  }

  async deletePricingFeature(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/landing/pricing-features/${id}`);
  }

  // ================== Landing Page - Features ==================
  async getFeatures(): Promise<FeatureDto[]> {
    return apiClient.get<FeatureDto[]>(`${this.basePath}/landing/features`);
  }

  async getFeatureById(id: string): Promise<FeatureDto> {
    return apiClient.get<FeatureDto>(`${this.basePath}/landing/features/${id}`);
  }

  async createFeature(data: CreateFeatureDto): Promise<FeatureDto> {
    return apiClient.post<FeatureDto>(`${this.basePath}/landing/features`, data);
  }

  async updateFeature(id: string, data: UpdateFeatureDto): Promise<FeatureDto> {
    return apiClient.put<FeatureDto>(`${this.basePath}/landing/features/${id}`, data);
  }

  async deleteFeature(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/landing/features/${id}`);
  }

  // ================== Landing Page - Industries ==================
  async getIndustries(): Promise<IndustryDto[]> {
    return apiClient.get<IndustryDto[]>(`${this.basePath}/landing/industries`);
  }

  async getIndustryById(id: string): Promise<IndustryDto> {
    return apiClient.get<IndustryDto>(`${this.basePath}/landing/industries/${id}`);
  }

  async createIndustry(data: CreateIndustryDto): Promise<IndustryDto> {
    return apiClient.post<IndustryDto>(`${this.basePath}/landing/industries`, data);
  }

  async updateIndustry(id: string, data: UpdateIndustryDto): Promise<IndustryDto> {
    return apiClient.put<IndustryDto>(`${this.basePath}/landing/industries/${id}`, data);
  }

  async deleteIndustry(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/landing/industries/${id}`);
  }

  // ================== Landing Page - Integrations ==================
  async getIntegrations(): Promise<IntegrationDto[]> {
    return apiClient.get<IntegrationDto[]>(`${this.basePath}/landing/integrations`);
  }

  async getIntegrationById(id: string): Promise<IntegrationDto> {
    return apiClient.get<IntegrationDto>(`${this.basePath}/landing/integrations/${id}`);
  }

  async createIntegration(data: CreateIntegrationDto): Promise<IntegrationDto> {
    return apiClient.post<IntegrationDto>(`${this.basePath}/landing/integrations`, data);
  }

  async updateIntegration(id: string, data: UpdateIntegrationDto): Promise<IntegrationDto> {
    return apiClient.put<IntegrationDto>(`${this.basePath}/landing/integrations/${id}`, data);
  }

  async deleteIntegration(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/landing/integrations/${id}`);
  }

  // ================== Landing Page - Integration Items ==================
  async getIntegrationItems(integrationId: string): Promise<IntegrationItemDto[]> {
    return apiClient.get<IntegrationItemDto[]>(`${this.basePath}/landing/integrations/${integrationId}/items`);
  }

  async createIntegrationItem(data: CreateIntegrationItemDto): Promise<IntegrationItemDto> {
    return apiClient.post<IntegrationItemDto>(`${this.basePath}/landing/integration-items`, data);
  }

  async updateIntegrationItem(id: string, data: UpdateIntegrationItemDto): Promise<IntegrationItemDto> {
    return apiClient.put<IntegrationItemDto>(`${this.basePath}/landing/integration-items/${id}`, data);
  }

  async deleteIntegrationItem(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/landing/integration-items/${id}`);
  }

  // ================== Landing Page - Stats ==================
  async getStats(): Promise<StatDto[]> {
    return apiClient.get<StatDto[]>(`${this.basePath}/landing/stats`);
  }

  async getStatById(id: string): Promise<StatDto> {
    return apiClient.get<StatDto>(`${this.basePath}/landing/stats/${id}`);
  }

  async createStat(data: CreateStatDto): Promise<StatDto> {
    return apiClient.post<StatDto>(`${this.basePath}/landing/stats`, data);
  }

  async updateStat(id: string, data: UpdateStatDto): Promise<StatDto> {
    return apiClient.put<StatDto>(`${this.basePath}/landing/stats/${id}`, data);
  }

  async deleteStat(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/landing/stats/${id}`);
  }

  // ================== Landing Page - Partners ==================
  async getPartners(): Promise<PartnerDto[]> {
    return apiClient.get<PartnerDto[]>(`${this.basePath}/landing/partners`);
  }

  async getPartnerById(id: string): Promise<PartnerDto> {
    return apiClient.get<PartnerDto>(`${this.basePath}/landing/partners/${id}`);
  }

  async createPartner(data: CreatePartnerDto): Promise<PartnerDto> {
    return apiClient.post<PartnerDto>(`${this.basePath}/landing/partners`, data);
  }

  async updatePartner(id: string, data: UpdatePartnerDto): Promise<PartnerDto> {
    return apiClient.put<PartnerDto>(`${this.basePath}/landing/partners/${id}`, data);
  }

  async deletePartner(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/landing/partners/${id}`);
  }

  // ================== Landing Page - Achievements ==================
  async getAchievements(): Promise<AchievementDto[]> {
    return apiClient.get<AchievementDto[]>(`${this.basePath}/landing/achievements`);
  }

  async getAchievementById(id: string): Promise<AchievementDto> {
    return apiClient.get<AchievementDto>(`${this.basePath}/landing/achievements/${id}`);
  }

  async createAchievement(data: CreateAchievementDto): Promise<AchievementDto> {
    return apiClient.post<AchievementDto>(`${this.basePath}/landing/achievements`, data);
  }

  async updateAchievement(id: string, data: UpdateAchievementDto): Promise<AchievementDto> {
    return apiClient.put<AchievementDto>(`${this.basePath}/landing/achievements/${id}`, data);
  }

  async deleteAchievement(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/landing/achievements/${id}`);
  }

  // ================== Company Page - Team Members ==================
  async getTeamMembers(): Promise<TeamMemberDto[]> {
    return apiClient.get<TeamMemberDto[]>(`${this.basePath}/company/team-members`);
  }

  async getTeamMemberById(id: string): Promise<TeamMemberDto> {
    return apiClient.get<TeamMemberDto>(`${this.basePath}/company/team-members/${id}`);
  }

  async createTeamMember(data: CreateTeamMemberDto): Promise<TeamMemberDto> {
    return apiClient.post<TeamMemberDto>(`${this.basePath}/company/team-members`, data);
  }

  async updateTeamMember(id: string, data: UpdateTeamMemberDto): Promise<TeamMemberDto> {
    return apiClient.put<TeamMemberDto>(`${this.basePath}/company/team-members/${id}`, data);
  }

  async deleteTeamMember(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/company/team-members/${id}`);
  }

  // ================== Company Page - Company Values ==================
  async getCompanyValues(): Promise<CompanyValueDto[]> {
    return apiClient.get<CompanyValueDto[]>(`${this.basePath}/company/values`);
  }

  async getCompanyValueById(id: string): Promise<CompanyValueDto> {
    return apiClient.get<CompanyValueDto>(`${this.basePath}/company/values/${id}`);
  }

  async createCompanyValue(data: CreateCompanyValueDto): Promise<CompanyValueDto> {
    return apiClient.post<CompanyValueDto>(`${this.basePath}/company/values`, data);
  }

  async updateCompanyValue(id: string, data: UpdateCompanyValueDto): Promise<CompanyValueDto> {
    return apiClient.put<CompanyValueDto>(`${this.basePath}/company/values/${id}`, data);
  }

  async deleteCompanyValue(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/company/values/${id}`);
  }

  // ================== Company Page - Contact Info ==================
  async getContactInfos(): Promise<ContactInfoDto[]> {
    return apiClient.get<ContactInfoDto[]>(`${this.basePath}/company/contact-info`);
  }

  async getContactInfoById(id: string): Promise<ContactInfoDto> {
    return apiClient.get<ContactInfoDto>(`${this.basePath}/company/contact-info/${id}`);
  }

  async createContactInfo(data: CreateContactInfoDto): Promise<ContactInfoDto> {
    return apiClient.post<ContactInfoDto>(`${this.basePath}/company/contact-info`, data);
  }

  async updateContactInfo(id: string, data: UpdateContactInfoDto): Promise<ContactInfoDto> {
    return apiClient.put<ContactInfoDto>(`${this.basePath}/company/contact-info/${id}`, data);
  }

  async deleteContactInfo(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/company/contact-info/${id}`);
  }

  // ================== Company Page - Social Links ==================
  async getSocialLinks(): Promise<SocialLinkDto[]> {
    return apiClient.get<SocialLinkDto[]>(`${this.basePath}/company/social-links`);
  }

  async getSocialLinkById(id: string): Promise<SocialLinkDto> {
    return apiClient.get<SocialLinkDto>(`${this.basePath}/company/social-links/${id}`);
  }

  async createSocialLink(data: CreateSocialLinkDto): Promise<SocialLinkDto> {
    return apiClient.post<SocialLinkDto>(`${this.basePath}/company/social-links`, data);
  }

  async updateSocialLink(id: string, data: UpdateSocialLinkDto): Promise<SocialLinkDto> {
    return apiClient.put<SocialLinkDto>(`${this.basePath}/company/social-links/${id}`, data);
  }

  async deleteSocialLink(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/company/social-links/${id}`);
  }

  // ================== Documentation - Categories ==================
  async getDocCategories(): Promise<DocCategoryListDto[]> {
    return apiClient.get<DocCategoryListDto[]>(`${this.basePath}/docs/categories`);
  }

  async getDocCategoryById(id: string): Promise<DocCategoryDto> {
    return apiClient.get<DocCategoryDto>(`${this.basePath}/docs/categories/${id}`);
  }

  async createDocCategory(data: CreateDocCategoryDto): Promise<DocCategoryDto> {
    return apiClient.post<DocCategoryDto>(`${this.basePath}/docs/categories`, data);
  }

  async updateDocCategory(id: string, data: UpdateDocCategoryDto): Promise<DocCategoryDto> {
    return apiClient.put<DocCategoryDto>(`${this.basePath}/docs/categories/${id}`, data);
  }

  async deleteDocCategory(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/docs/categories/${id}`);
  }

  // ================== Documentation - Articles ==================
  async getDocArticles(categoryId?: string): Promise<DocArticleListDto[]> {
    const params = categoryId ? { categoryId } : undefined;
    return apiClient.get<DocArticleListDto[]>(`${this.basePath}/docs/articles`, params);
  }

  async getDocArticleById(id: string): Promise<DocArticleDto> {
    return apiClient.get<DocArticleDto>(`${this.basePath}/docs/articles/${id}`);
  }

  async createDocArticle(data: CreateDocArticleDto): Promise<DocArticleDto> {
    return apiClient.post<DocArticleDto>(`${this.basePath}/docs/articles`, data);
  }

  async updateDocArticle(id: string, data: UpdateDocArticleDto): Promise<DocArticleDto> {
    return apiClient.put<DocArticleDto>(`${this.basePath}/docs/articles/${id}`, data);
  }

  async deleteDocArticle(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/docs/articles/${id}`);
  }
}

export const cmsService = new CMSService();
