/**
 * Server-side CMS Service for Next.js
 * Uses native fetch with Next.js caching for SSR/ISR
 * All endpoints are public (AllowAnonymous) - no auth required
 */

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
  CmsApiResponse,
} from './cms.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// =====================================
// REVALIDATION TIMES (seconds)
// =====================================

export const REVALIDATION = {
  BLOG_LIST: 60,           // 1 minute - fresh blog content
  BLOG_POST: 300,          // 5 minutes - individual posts
  DOCS_LIST: 300,          // 5 minutes - documentation structure
  DOCS_ARTICLE: 600,       // 10 minutes - doc content
  STATIC_PAGE: 3600,       // 1 hour - legal/about pages
  CATEGORIES: 3600,        // 1 hour - categories rarely change
  LANDING: 300,            // 5 minutes - landing page components
  COMPANY: 3600,           // 1 hour - company info
  FAQ: 300,                // 5 minutes - FAQ updates
} as const;

// =====================================
// SERVER FETCH HELPER
// =====================================

async function serverFetch<T>(
  endpoint: string,
  options: {
    revalidate?: number;
    tags?: string[];
    cache?: RequestCache;
  } = {}
): Promise<T | null> {
  const { revalidate = 60, tags = [], cache } = options;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      next: {
        revalidate,
        tags,
      },
      cache: cache ?? 'force-cache',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[CMS] Fetch error: ${endpoint} - ${response.status}`);
      return null;
    }

    const json = await response.json();

    // Handle ApiResponse wrapper from backend
    if (json && typeof json === 'object' && 'data' in json) {
      return (json as CmsApiResponse<T>).data ?? null;
    }

    return json as T;
  } catch (error) {
    console.error(`[CMS] Fetch failed: ${endpoint}`, error);
    return null;
  }
}

// =====================================
// BLOG SERVER FUNCTIONS
// =====================================

/**
 * Get all published blog posts
 */
export async function getPublishedPosts(): Promise<BlogPostListItem[]> {
  const data = await serverFetch<BlogPostListItem[]>(
    '/api/cms/blog/posts/published',
    { revalidate: REVALIDATION.BLOG_LIST, tags: ['blog-posts'] }
  );
  return data ?? [];
}

/**
 * Get blog post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return serverFetch<BlogPost>(
    `/api/cms/blog/posts/slug/${encodeURIComponent(slug)}`,
    { revalidate: REVALIDATION.BLOG_POST, tags: ['blog-post', `blog-${slug}`] }
  );
}

/**
 * Get all blog categories
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  const data = await serverFetch<BlogCategory[]>(
    '/api/cms/blog/categories',
    { revalidate: REVALIDATION.CATEGORIES, tags: ['blog-categories'] }
  );
  return data ?? [];
}

/**
 * Get published posts by category
 */
export async function getPostsByCategory(categoryId: string): Promise<BlogPostListItem[]> {
  const data = await serverFetch<BlogPostListItem[]>(
    `/api/cms/blog/categories/${categoryId}/posts`,
    { revalidate: REVALIDATION.BLOG_LIST, tags: ['blog-posts', `blog-category-${categoryId}`] }
  );
  return data ?? [];
}

// =====================================
// DOCS SERVER FUNCTIONS
// =====================================

/**
 * Get active documentation categories
 */
export async function getActiveDocCategories(): Promise<DocCategory[]> {
  const data = await serverFetch<DocCategory[]>(
    '/api/cms/docs/categories/active',
    { revalidate: REVALIDATION.CATEGORIES, tags: ['doc-categories'] }
  );
  return data ?? [];
}

/**
 * Get doc category by slug
 */
export async function getDocCategoryBySlug(slug: string): Promise<DocCategory | null> {
  return serverFetch<DocCategory>(
    `/api/cms/docs/categories/slug/${encodeURIComponent(slug)}`,
    { revalidate: REVALIDATION.DOCS_LIST, tags: ['doc-category', `doc-cat-${slug}`] }
  );
}

/**
 * Get active documentation articles
 */
export async function getActiveDocArticles(): Promise<DocArticleListItem[]> {
  const data = await serverFetch<DocArticleListItem[]>(
    '/api/cms/docs/articles/active',
    { revalidate: REVALIDATION.DOCS_LIST, tags: ['doc-articles'] }
  );
  return data ?? [];
}

/**
 * Get popular documentation articles
 */
export async function getPopularDocArticles(): Promise<DocArticleListItem[]> {
  const data = await serverFetch<DocArticleListItem[]>(
    '/api/cms/docs/articles/popular',
    { revalidate: REVALIDATION.DOCS_LIST, tags: ['doc-articles-popular'] }
  );
  return data ?? [];
}

/**
 * Get articles by category
 */
export async function getDocArticlesByCategory(categoryId: string): Promise<DocArticleListItem[]> {
  const data = await serverFetch<DocArticleListItem[]>(
    `/api/cms/docs/articles/category/${categoryId}`,
    { revalidate: REVALIDATION.DOCS_LIST, tags: ['doc-articles', `doc-cat-${categoryId}`] }
  );
  return data ?? [];
}

/**
 * Get doc article by slug
 */
export async function getDocArticleBySlug(slug: string): Promise<DocArticle | null> {
  return serverFetch<DocArticle>(
    `/api/cms/docs/articles/slug/${encodeURIComponent(slug)}`,
    { revalidate: REVALIDATION.DOCS_ARTICLE, tags: ['doc-article', `doc-${slug}`] }
  );
}

// =====================================
// CMS PAGES SERVER FUNCTIONS
// =====================================

/**
 * Get published CMS pages
 */
export async function getPublishedPages(): Promise<CmsPage[]> {
  const data = await serverFetch<CmsPage[]>(
    '/api/cms/pages/published',
    { revalidate: REVALIDATION.STATIC_PAGE, tags: ['cms-pages'] }
  );
  return data ?? [];
}

/**
 * Get CMS page by slug
 */
export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  return serverFetch<CmsPage>(
    `/api/cms/pages/slug/${encodeURIComponent(slug)}`,
    { revalidate: REVALIDATION.STATIC_PAGE, tags: ['cms-page', `page-${slug}`] }
  );
}

// =====================================
// FAQ SERVER FUNCTIONS
// =====================================

/**
 * Get active FAQ categories
 */
export async function getActiveFaqCategories(): Promise<FaqCategory[]> {
  const data = await serverFetch<FaqCategory[]>(
    '/api/cms/faq/categories/active',
    { revalidate: REVALIDATION.FAQ, tags: ['faq-categories'] }
  );
  return data ?? [];
}

/**
 * Get FAQ category by slug
 */
export async function getFaqCategoryBySlug(slug: string): Promise<FaqCategory | null> {
  return serverFetch<FaqCategory>(
    `/api/cms/faq/categories/slug/${encodeURIComponent(slug)}`,
    { revalidate: REVALIDATION.FAQ, tags: ['faq-category', `faq-cat-${slug}`] }
  );
}

/**
 * Get active FAQ items
 */
export async function getActiveFaqItems(): Promise<FaqItem[]> {
  const data = await serverFetch<FaqItem[]>(
    '/api/cms/faq/items/active',
    { revalidate: REVALIDATION.FAQ, tags: ['faq-items'] }
  );
  return data ?? [];
}

// =====================================
// LANDING PAGE SERVER FUNCTIONS
// =====================================

/**
 * Get active testimonials
 */
export async function getActiveTestimonials(): Promise<Testimonial[]> {
  const data = await serverFetch<Testimonial[]>(
    '/api/cms/landing/testimonials/active',
    { revalidate: REVALIDATION.LANDING, tags: ['testimonials'] }
  );
  return data ?? [];
}

/**
 * Get featured testimonials
 */
export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  const data = await serverFetch<Testimonial[]>(
    '/api/cms/landing/testimonials/featured',
    { revalidate: REVALIDATION.LANDING, tags: ['testimonials-featured'] }
  );
  return data ?? [];
}

/**
 * Get active pricing plans
 */
export async function getActivePricingPlans(): Promise<PricingPlan[]> {
  const data = await serverFetch<PricingPlan[]>(
    '/api/cms/landing/pricing-plans/active',
    { revalidate: REVALIDATION.LANDING, tags: ['pricing-plans'] }
  );
  return data ?? [];
}

/**
 * Get pricing plan by slug
 */
export async function getPricingPlanBySlug(slug: string): Promise<PricingPlan | null> {
  return serverFetch<PricingPlan>(
    `/api/cms/landing/pricing-plans/slug/${encodeURIComponent(slug)}`,
    { revalidate: REVALIDATION.LANDING, tags: ['pricing-plan', `plan-${slug}`] }
  );
}

/**
 * Get active features
 */
export async function getActiveFeatures(): Promise<Feature[]> {
  const data = await serverFetch<Feature[]>(
    '/api/cms/landing/features/active',
    { revalidate: REVALIDATION.LANDING, tags: ['features'] }
  );
  return data ?? [];
}

/**
 * Get featured features
 */
export async function getFeaturedFeatures(): Promise<Feature[]> {
  const data = await serverFetch<Feature[]>(
    '/api/cms/landing/features/featured',
    { revalidate: REVALIDATION.LANDING, tags: ['features-featured'] }
  );
  return data ?? [];
}

/**
 * Get features by category
 */
export async function getFeaturesByCategory(category: string): Promise<Feature[]> {
  const data = await serverFetch<Feature[]>(
    `/api/cms/landing/features/category/${encodeURIComponent(category)}`,
    { revalidate: REVALIDATION.LANDING, tags: ['features', `features-${category}`] }
  );
  return data ?? [];
}

/**
 * Get active industries
 */
export async function getActiveIndustries(): Promise<Industry[]> {
  const data = await serverFetch<Industry[]>(
    '/api/cms/landing/industries/active',
    { revalidate: REVALIDATION.LANDING, tags: ['industries'] }
  );
  return data ?? [];
}

/**
 * Get industry by slug
 */
export async function getIndustryBySlug(slug: string): Promise<Industry | null> {
  return serverFetch<Industry>(
    `/api/cms/landing/industries/slug/${encodeURIComponent(slug)}`,
    { revalidate: REVALIDATION.LANDING, tags: ['industry', `industry-${slug}`] }
  );
}

/**
 * Get active integrations
 */
export async function getActiveIntegrations(): Promise<Integration[]> {
  const data = await serverFetch<Integration[]>(
    '/api/cms/landing/integrations/active',
    { revalidate: REVALIDATION.LANDING, tags: ['integrations'] }
  );
  return data ?? [];
}

/**
 * Get integration by slug
 */
export async function getIntegrationBySlug(slug: string): Promise<Integration | null> {
  return serverFetch<Integration>(
    `/api/cms/landing/integrations/slug/${encodeURIComponent(slug)}`,
    { revalidate: REVALIDATION.LANDING, tags: ['integration', `integration-${slug}`] }
  );
}

/**
 * Get active stats
 */
export async function getActiveStats(): Promise<Stat[]> {
  const data = await serverFetch<Stat[]>(
    '/api/cms/landing/stats/active',
    { revalidate: REVALIDATION.LANDING, tags: ['stats'] }
  );
  return data ?? [];
}

/**
 * Get stats by section
 */
export async function getStatsBySection(section: string): Promise<Stat[]> {
  const data = await serverFetch<Stat[]>(
    `/api/cms/landing/stats/section/${encodeURIComponent(section)}`,
    { revalidate: REVALIDATION.LANDING, tags: ['stats', `stats-${section}`] }
  );
  return data ?? [];
}

/**
 * Get active partners
 */
export async function getActivePartners(): Promise<Partner[]> {
  const data = await serverFetch<Partner[]>(
    '/api/cms/landing/partners/active',
    { revalidate: REVALIDATION.LANDING, tags: ['partners'] }
  );
  return data ?? [];
}

/**
 * Get featured partners
 */
export async function getFeaturedPartners(): Promise<Partner[]> {
  const data = await serverFetch<Partner[]>(
    '/api/cms/landing/partners/featured',
    { revalidate: REVALIDATION.LANDING, tags: ['partners-featured'] }
  );
  return data ?? [];
}

/**
 * Get active achievements
 */
export async function getActiveAchievements(): Promise<Achievement[]> {
  const data = await serverFetch<Achievement[]>(
    '/api/cms/landing/achievements/active',
    { revalidate: REVALIDATION.LANDING, tags: ['achievements'] }
  );
  return data ?? [];
}

// =====================================
// COMPANY PAGE SERVER FUNCTIONS
// =====================================

/**
 * Get active team members
 */
export async function getActiveTeamMembers(): Promise<TeamMember[]> {
  const data = await serverFetch<TeamMember[]>(
    '/api/cms/company/team-members/active',
    { revalidate: REVALIDATION.COMPANY, tags: ['team-members'] }
  );
  return data ?? [];
}

/**
 * Get leadership team members
 */
export async function getLeadershipTeamMembers(): Promise<TeamMember[]> {
  const data = await serverFetch<TeamMember[]>(
    '/api/cms/company/team-members/leadership',
    { revalidate: REVALIDATION.COMPANY, tags: ['team-leadership'] }
  );
  return data ?? [];
}

/**
 * Get active company values
 */
export async function getActiveCompanyValues(): Promise<CompanyValue[]> {
  const data = await serverFetch<CompanyValue[]>(
    '/api/cms/company/values/active',
    { revalidate: REVALIDATION.COMPANY, tags: ['company-values'] }
  );
  return data ?? [];
}

/**
 * Get active contact info
 */
export async function getActiveContactInfo(): Promise<ContactInfo[]> {
  const data = await serverFetch<ContactInfo[]>(
    '/api/cms/company/contact-info/active',
    { revalidate: REVALIDATION.COMPANY, tags: ['contact-info'] }
  );
  return data ?? [];
}

/**
 * Get contact info by type
 */
export async function getContactInfoByType(type: string): Promise<ContactInfo[]> {
  const data = await serverFetch<ContactInfo[]>(
    `/api/cms/company/contact-info/type/${encodeURIComponent(type)}`,
    { revalidate: REVALIDATION.COMPANY, tags: ['contact-info', `contact-${type}`] }
  );
  return data ?? [];
}

/**
 * Get active social links
 */
export async function getActiveSocialLinks(): Promise<SocialLink[]> {
  const data = await serverFetch<SocialLink[]>(
    '/api/cms/company/social-links/active',
    { revalidate: REVALIDATION.COMPANY, tags: ['social-links'] }
  );
  return data ?? [];
}

// =====================================
// CMS SETTINGS
// =====================================

/**
 * Get CMS setting by key
 */
export async function getCmsSetting<T = unknown>(key: string): Promise<T | null> {
  return serverFetch<T>(
    `/api/cms/settings/${encodeURIComponent(key)}`,
    { revalidate: REVALIDATION.STATIC_PAGE, tags: ['cms-settings', `setting-${key}`] }
  );
}
