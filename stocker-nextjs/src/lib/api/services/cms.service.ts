/**
 * Client-side CMS Service
 * Uses ApiClient for client components with interactivity
 * All endpoints are public (AllowAnonymous) - no auth required
 */

import { apiClient } from '../client';
import type { ApiResponse } from '../types';
import type {
  BlogPost,
  BlogPostListItem,
  BlogCategory,
  DocCategory,
  DocArticle,
  DocArticleListItem,
  CmsPage,
  FaqCategory,
  FaqItem,
  Testimonial,
  PricingPlan,
  Feature,
  Industry,
  Integration,
  Stat,
  Partner,
  Achievement,
  TeamMember,
  CompanyValue,
  ContactInfo,
  SocialLink,
} from './cms.types';

// Helper to extract data from ApiResponse
function extractData<T>(response: ApiResponse<T>): T | null {
  if (response.success && response.data) {
    return response.data;
  }
  return null;
}

function extractDataArray<T>(response: ApiResponse<T[]>): T[] {
  if (response.success && response.data) {
    return response.data;
  }
  return [];
}

class CmsService {
  // =====================================
  // BLOG ENDPOINTS
  // =====================================

  /**
   * Get published blog posts
   */
  async getPublishedPosts(): Promise<BlogPostListItem[]> {
    const response = await apiClient.get<BlogPostListItem[]>(
      '/api/cms/blog/posts/published'
    );
    return extractDataArray(response);
  }

  /**
   * Get blog post by slug
   */
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const response = await apiClient.get<BlogPost>(
        `/api/cms/blog/posts/slug/${encodeURIComponent(slug)}`
      );
      return extractData(response);
    } catch {
      return null;
    }
  }

  /**
   * Get all blog categories
   */
  async getBlogCategories(): Promise<BlogCategory[]> {
    const response = await apiClient.get<BlogCategory[]>(
      '/api/cms/blog/categories'
    );
    return extractDataArray(response);
  }

  /**
   * Get posts by category
   */
  async getPostsByCategory(categoryId: string): Promise<BlogPostListItem[]> {
    const response = await apiClient.get<BlogPostListItem[]>(
      `/api/cms/blog/categories/${categoryId}/posts`
    );
    return extractDataArray(response);
  }

  // =====================================
  // DOCS ENDPOINTS
  // =====================================

  /**
   * Get active documentation categories
   */
  async getActiveDocCategories(): Promise<DocCategory[]> {
    const response = await apiClient.get<DocCategory[]>(
      '/api/cms/docs/categories/active'
    );
    return extractDataArray(response);
  }

  /**
   * Get doc category by slug
   */
  async getDocCategoryBySlug(slug: string): Promise<DocCategory | null> {
    try {
      const response = await apiClient.get<DocCategory>(
        `/api/cms/docs/categories/slug/${encodeURIComponent(slug)}`
      );
      return extractData(response);
    } catch {
      return null;
    }
  }

  /**
   * Get active documentation articles
   */
  async getActiveDocArticles(): Promise<DocArticleListItem[]> {
    const response = await apiClient.get<DocArticleListItem[]>(
      '/api/cms/docs/articles/active'
    );
    return extractDataArray(response);
  }

  /**
   * Get popular documentation articles
   */
  async getPopularDocArticles(): Promise<DocArticleListItem[]> {
    const response = await apiClient.get<DocArticleListItem[]>(
      '/api/cms/docs/articles/popular'
    );
    return extractDataArray(response);
  }

  /**
   * Get articles by category
   */
  async getDocArticlesByCategory(categoryId: string): Promise<DocArticleListItem[]> {
    const response = await apiClient.get<DocArticleListItem[]>(
      `/api/cms/docs/articles/category/${categoryId}`
    );
    return extractDataArray(response);
  }

  /**
   * Get doc article by slug
   */
  async getDocArticleBySlug(slug: string): Promise<DocArticle | null> {
    try {
      const response = await apiClient.get<DocArticle>(
        `/api/cms/docs/articles/slug/${encodeURIComponent(slug)}`
      );
      return extractData(response);
    } catch {
      return null;
    }
  }

  /**
   * Search documentation articles
   */
  async searchDocArticles(query: string): Promise<DocArticleListItem[]> {
    if (!query.trim()) return [];
    const response = await apiClient.get<DocArticleListItem[]>(
      '/api/cms/docs/articles/search',
      { q: query }
    );
    return extractDataArray(response);
  }

  // =====================================
  // CMS PAGES ENDPOINTS
  // =====================================

  /**
   * Get published pages
   */
  async getPublishedPages(): Promise<CmsPage[]> {
    const response = await apiClient.get<CmsPage[]>(
      '/api/cms/pages/published'
    );
    return extractDataArray(response);
  }

  /**
   * Get page by slug
   */
  async getPageBySlug(slug: string): Promise<CmsPage | null> {
    try {
      const response = await apiClient.get<CmsPage>(
        `/api/cms/pages/slug/${encodeURIComponent(slug)}`
      );
      return extractData(response);
    } catch {
      return null;
    }
  }

  // =====================================
  // FAQ ENDPOINTS
  // =====================================

  /**
   * Get active FAQ categories
   */
  async getActiveFaqCategories(): Promise<FaqCategory[]> {
    const response = await apiClient.get<FaqCategory[]>(
      '/api/cms/faq/categories/active'
    );
    return extractDataArray(response);
  }

  /**
   * Get active FAQ items
   */
  async getActiveFaqItems(): Promise<FaqItem[]> {
    const response = await apiClient.get<FaqItem[]>(
      '/api/cms/faq/items/active'
    );
    return extractDataArray(response);
  }

  /**
   * Submit FAQ feedback
   */
  async submitFaqFeedback(itemId: string, helpful: boolean): Promise<boolean> {
    try {
      await apiClient.post(
        `/api/cms/faq/items/${itemId}/feedback`,
        { helpful }
      );
      return true;
    } catch {
      return false;
    }
  }

  // =====================================
  // LANDING PAGE ENDPOINTS
  // =====================================

  /**
   * Get active testimonials
   */
  async getActiveTestimonials(): Promise<Testimonial[]> {
    const response = await apiClient.get<Testimonial[]>(
      '/api/cms/landing/testimonials/active'
    );
    return extractDataArray(response);
  }

  /**
   * Get featured testimonials
   */
  async getFeaturedTestimonials(): Promise<Testimonial[]> {
    const response = await apiClient.get<Testimonial[]>(
      '/api/cms/landing/testimonials/featured'
    );
    return extractDataArray(response);
  }

  /**
   * Get active pricing plans
   */
  async getActivePricingPlans(): Promise<PricingPlan[]> {
    const response = await apiClient.get<PricingPlan[]>(
      '/api/cms/landing/pricing-plans/active'
    );
    return extractDataArray(response);
  }

  /**
   * Get active features
   */
  async getActiveFeatures(): Promise<Feature[]> {
    const response = await apiClient.get<Feature[]>(
      '/api/cms/landing/features/active'
    );
    return extractDataArray(response);
  }

  /**
   * Get featured features
   */
  async getFeaturedFeatures(): Promise<Feature[]> {
    const response = await apiClient.get<Feature[]>(
      '/api/cms/landing/features/featured'
    );
    return extractDataArray(response);
  }

  /**
   * Get active industries
   */
  async getActiveIndustries(): Promise<Industry[]> {
    const response = await apiClient.get<Industry[]>(
      '/api/cms/landing/industries/active'
    );
    return extractDataArray(response);
  }

  /**
   * Get active integrations
   */
  async getActiveIntegrations(): Promise<Integration[]> {
    const response = await apiClient.get<Integration[]>(
      '/api/cms/landing/integrations/active'
    );
    return extractDataArray(response);
  }

  /**
   * Get active stats
   */
  async getActiveStats(): Promise<Stat[]> {
    const response = await apiClient.get<Stat[]>(
      '/api/cms/landing/stats/active'
    );
    return extractDataArray(response);
  }

  /**
   * Get active partners
   */
  async getActivePartners(): Promise<Partner[]> {
    const response = await apiClient.get<Partner[]>(
      '/api/cms/landing/partners/active'
    );
    return extractDataArray(response);
  }

  /**
   * Get active achievements
   */
  async getActiveAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get<Achievement[]>(
      '/api/cms/landing/achievements/active'
    );
    return extractDataArray(response);
  }

  // =====================================
  // COMPANY PAGE ENDPOINTS
  // =====================================

  /**
   * Get active team members
   */
  async getActiveTeamMembers(): Promise<TeamMember[]> {
    const response = await apiClient.get<TeamMember[]>(
      '/api/cms/company/team-members/active'
    );
    return extractDataArray(response);
  }

  /**
   * Get leadership team
   */
  async getLeadershipTeamMembers(): Promise<TeamMember[]> {
    const response = await apiClient.get<TeamMember[]>(
      '/api/cms/company/team-members/leadership'
    );
    return extractDataArray(response);
  }

  /**
   * Get active company values
   */
  async getActiveCompanyValues(): Promise<CompanyValue[]> {
    const response = await apiClient.get<CompanyValue[]>(
      '/api/cms/company/values/active'
    );
    return extractDataArray(response);
  }

  /**
   * Get active contact info
   */
  async getActiveContactInfo(): Promise<ContactInfo[]> {
    const response = await apiClient.get<ContactInfo[]>(
      '/api/cms/company/contact-info/active'
    );
    return extractDataArray(response);
  }

  /**
   * Get active social links
   */
  async getActiveSocialLinks(): Promise<SocialLink[]> {
    const response = await apiClient.get<SocialLink[]>(
      '/api/cms/company/social-links/active'
    );
    return extractDataArray(response);
  }
}

export const cmsService = new CmsService();
export default cmsService;
