/**
 * CMS Types for Public Frontend
 * Matches backend DTOs from Stocker.Modules.CMS
 */

// =====================================
// COMMON TYPES
// =====================================

export type ContentStatus = 'draft' | 'published' | 'archived' | 'scheduled';

export interface CmsAuthor {
  id: string;
  name: string;
  avatar?: string;
}

// =====================================
// BLOG TYPES
// =====================================

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  postCount?: number;
}

export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  categoryId: string;
  category?: BlogCategory;
  tags: string[];
  status: ContentStatus;
  publishedAt?: string;
  author?: CmsAuthor;
  featuredImage?: string;
  views: number;
  readTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost extends BlogPostListItem {
  content: string;
  metaTitle?: string;
  metaDescription?: string;
}

// =====================================
// DOCS TYPES
// =====================================

export interface DocCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  articleCount?: number;
}

export interface DocArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  categoryId: string;
  category?: DocCategory;
  order: number;
  isActive: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocArticle extends DocArticleListItem {
  content: string;
  metaTitle?: string;
  metaDescription?: string;
}

// =====================================
// CMS PAGE TYPES
// =====================================

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: ContentStatus;
  template?: string;
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
  author?: CmsAuthor;
  createdAt: string;
  updatedAt: string;
  views: number;
}

// =====================================
// FAQ TYPES
// =====================================

export interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  itemCount?: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  categoryId: string;
  category?: FaqCategory;
  order: number;
  isActive: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
}

// =====================================
// LANDING PAGE TYPES
// =====================================

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  content: string;
  avatar?: string;
  rating: number;
  isFeatured: boolean;
  order: number;
  isActive: boolean;
}

export interface PricingFeature {
  id: string;
  name: string;
  description?: string;
  isIncluded: boolean;
  order: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  isFeatured: boolean;
  isPopular: boolean;
  order: number;
  isActive: boolean;
  features: PricingFeature[];
  ctaText?: string;
  ctaLink?: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string;
  category?: string;
  isFeatured: boolean;
  order: number;
  isActive: boolean;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  benefits: string[];
  order: number;
  isActive: boolean;
}

export interface IntegrationItem {
  id: string;
  name: string;
  icon?: string;
  url?: string;
}

export interface Integration {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  category?: string;
  website?: string;
  isFeatured: boolean;
  order: number;
  isActive: boolean;
  items?: IntegrationItem[];
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  suffix?: string;
  prefix?: string;
  description?: string;
  icon?: string;
  section?: string;
  order: number;
  isActive: boolean;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string;
  description?: string;
  isFeatured: boolean;
  order: number;
  isActive: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  year?: number;
  order: number;
  isActive: boolean;
}

// =====================================
// COMPANY PAGE TYPES
// =====================================

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  department?: string;
  bio?: string;
  photo?: string;
  email?: string;
  linkedIn?: string;
  twitter?: string;
  isLeadership: boolean;
  order: number;
  isActive: boolean;
}

export interface CompanyValue {
  id: string;
  title: string;
  description: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export interface ContactInfo {
  id: string;
  type: string; // 'email' | 'phone' | 'address' | 'support'
  label: string;
  value: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

// =====================================
// MEDIA TYPES
// =====================================

export interface CmsMedia {
  id: string;
  fileName: string;
  storedFileName: string;
  filePath: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'other';
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  altText?: string;
  title?: string;
  folder?: string;
  uploadedAt: string;
}

// =====================================
// API RESPONSE WRAPPER
// =====================================

export interface CmsApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ code: string; message: string }>;
}
