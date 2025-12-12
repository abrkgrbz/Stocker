// ==================== Testimonial Types ====================
export interface Testimonial {
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

export interface CreateTestimonialRequest {
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

export interface UpdateTestimonialRequest extends CreateTestimonialRequest {}

// ==================== Pricing Types ====================
export interface PricingPlan {
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
  features: PricingFeature[];
  createdAt: string;
}

export interface CreatePricingPlanRequest {
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

export interface UpdatePricingPlanRequest extends CreatePricingPlanRequest {}

export interface PricingFeature {
  id: string;
  name: string;
  description?: string;
  isIncluded: boolean;
  value?: string;
  sortOrder: number;
  isActive: boolean;
  planId: string;
}

export interface CreatePricingFeatureRequest {
  name: string;
  description?: string;
  isIncluded?: boolean;
  value?: string;
  sortOrder?: number;
  isActive?: boolean;
  planId: string;
}

export interface UpdatePricingFeatureRequest {
  name: string;
  description?: string;
  isIncluded: boolean;
  value?: string;
  sortOrder: number;
  isActive: boolean;
}

// ==================== Feature Types ====================
export interface Feature {
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

export interface CreateFeatureRequest {
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

export interface UpdateFeatureRequest extends CreateFeatureRequest {}

// ==================== Industry Types ====================
export interface Industry {
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

export interface CreateIndustryRequest {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  image?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateIndustryRequest extends CreateIndustryRequest {}

// ==================== Integration Types ====================
export interface Integration {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  items: IntegrationItem[];
  createdAt: string;
}

export interface CreateIntegrationRequest {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateIntegrationRequest extends CreateIntegrationRequest {}

export interface IntegrationItem {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  url?: string;
  sortOrder: number;
  isActive: boolean;
  integrationId: string;
}

export interface CreateIntegrationItemRequest {
  name: string;
  description?: string;
  logo?: string;
  url?: string;
  sortOrder?: number;
  isActive?: boolean;
  integrationId: string;
}

export interface UpdateIntegrationItemRequest {
  name: string;
  description?: string;
  logo?: string;
  url?: string;
  sortOrder: number;
  isActive: boolean;
}

// ==================== Stat Types ====================
export interface Stat {
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

export interface CreateStatRequest {
  label: string;
  value: string;
  suffix?: string;
  prefix?: string;
  icon?: string;
  section?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateStatRequest extends CreateStatRequest {}

// ==================== Partner Types ====================
export interface Partner {
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

export interface CreatePartnerRequest {
  name: string;
  logo?: string;
  logoDark?: string;
  url?: string;
  sortOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdatePartnerRequest extends CreatePartnerRequest {}

// ==================== Achievement Types ====================
export interface Achievement {
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

export interface CreateAchievementRequest {
  title: string;
  value: string;
  icon?: string;
  iconColor?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateAchievementRequest extends CreateAchievementRequest {}

// ==================== Team Member Types ====================
export interface TeamMember {
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

export interface CreateTeamMemberRequest {
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

export interface UpdateTeamMemberRequest extends CreateTeamMemberRequest {}

// ==================== Company Value Types ====================
export interface CompanyValue {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCompanyValueRequest {
  title: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCompanyValueRequest extends CreateCompanyValueRequest {}

// ==================== Contact Info Types ====================
export interface ContactInfo {
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

export interface CreateContactInfoRequest {
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

export interface UpdateContactInfoRequest extends CreateContactInfoRequest {}

// ==================== Social Link Types ====================
export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: string;
  label?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSocialLinkRequest {
  platform: string;
  url: string;
  icon?: string;
  label?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateSocialLinkRequest extends CreateSocialLinkRequest {}

// ==================== Doc Category Types ====================
export interface DocCategory {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  articleCount: number;
  articles: DocArticle[];
  createdAt: string;
}

export interface DocCategoryList {
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

export interface CreateDocCategoryRequest {
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateDocCategoryRequest extends CreateDocCategoryRequest {}

// ==================== Doc Article Types ====================
export interface DocArticle {
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

export interface DocArticleList {
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

export interface CreateDocArticleRequest {
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

export interface UpdateDocArticleRequest extends CreateDocArticleRequest {}
