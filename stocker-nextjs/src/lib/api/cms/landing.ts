import { ApiService } from '../api-service';
import type {
  Testimonial,
  CreateTestimonialRequest,
  UpdateTestimonialRequest,
  PricingPlan,
  CreatePricingPlanRequest,
  UpdatePricingPlanRequest,
  PricingFeature,
  CreatePricingFeatureRequest,
  UpdatePricingFeatureRequest,
  Feature,
  CreateFeatureRequest,
  UpdateFeatureRequest,
  Industry,
  CreateIndustryRequest,
  UpdateIndustryRequest,
  Integration,
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  IntegrationItem,
  CreateIntegrationItemRequest,
  UpdateIntegrationItemRequest,
  Stat,
  CreateStatRequest,
  UpdateStatRequest,
  Partner,
  CreatePartnerRequest,
  UpdatePartnerRequest,
  Achievement,
  CreateAchievementRequest,
  UpdateAchievementRequest,
} from './types';

const BASE_URL = '/api/cms/landing';

// ==================== Testimonials ====================
export const getTestimonials = () =>
  ApiService.get<Testimonial[]>(`${BASE_URL}/testimonials`);

export const getActiveTestimonials = () =>
  ApiService.get<Testimonial[]>(`${BASE_URL}/testimonials/active`);

export const getFeaturedTestimonials = () =>
  ApiService.get<Testimonial[]>(`${BASE_URL}/testimonials/featured`);

export const getTestimonialById = (id: string) =>
  ApiService.get<Testimonial>(`${BASE_URL}/testimonials/${id}`);

export const createTestimonial = (data: CreateTestimonialRequest) =>
  ApiService.post<Testimonial>(`${BASE_URL}/testimonials`, data);

export const updateTestimonial = (id: string, data: UpdateTestimonialRequest) =>
  ApiService.put<Testimonial>(`${BASE_URL}/testimonials/${id}`, data);

export const deleteTestimonial = (id: string) =>
  ApiService.delete<void>(`${BASE_URL}/testimonials/${id}`);

// ==================== Pricing Plans ====================
export const getPricingPlans = () =>
  ApiService.get<PricingPlan[]>(`${BASE_URL}/pricing-plans`);

export const getActivePricingPlans = () =>
  ApiService.get<PricingPlan[]>(`${BASE_URL}/pricing-plans/active`);

export const getPricingPlanById = (id: string) =>
  ApiService.get<PricingPlan>(`${BASE_URL}/pricing-plans/${id}`);

export const getPricingPlanBySlug = (slug: string) =>
  ApiService.get<PricingPlan>(`${BASE_URL}/pricing-plans/slug/${slug}`);

export const createPricingPlan = (data: CreatePricingPlanRequest) =>
  ApiService.post<PricingPlan>(`${BASE_URL}/pricing-plans`, data);

export const updatePricingPlan = (id: string, data: UpdatePricingPlanRequest) =>
  ApiService.put<PricingPlan>(`${BASE_URL}/pricing-plans/${id}`, data);

export const deletePricingPlan = (id: string) =>
  ApiService.delete<void>(`${BASE_URL}/pricing-plans/${id}`);

// ==================== Pricing Features ====================
export const getPricingFeaturesByPlan = (planId: string) =>
  ApiService.get<PricingFeature[]>(`${BASE_URL}/pricing-plans/${planId}/features`);

export const getPricingFeatureById = (id: string) =>
  ApiService.get<PricingFeature>(`${BASE_URL}/pricing-features/${id}`);

export const createPricingFeature = (data: CreatePricingFeatureRequest) =>
  ApiService.post<PricingFeature>(`${BASE_URL}/pricing-features`, data);

export const updatePricingFeature = (id: string, data: UpdatePricingFeatureRequest) =>
  ApiService.put<PricingFeature>(`${BASE_URL}/pricing-features/${id}`, data);

export const deletePricingFeature = (id: string) =>
  ApiService.delete<void>(`${BASE_URL}/pricing-features/${id}`);

// ==================== Features ====================
export const getFeatures = () =>
  ApiService.get<Feature[]>(`${BASE_URL}/features`);

export const getActiveFeatures = () =>
  ApiService.get<Feature[]>(`${BASE_URL}/features/active`);

export const getFeaturedFeatures = () =>
  ApiService.get<Feature[]>(`${BASE_URL}/features/featured`);

export const getFeaturesByCategory = (category: string) =>
  ApiService.get<Feature[]>(`${BASE_URL}/features/category/${category}`);

export const getFeatureById = (id: string) =>
  ApiService.get<Feature>(`${BASE_URL}/features/${id}`);

export const createFeature = (data: CreateFeatureRequest) =>
  ApiService.post<Feature>(`${BASE_URL}/features`, data);

export const updateFeature = (id: string, data: UpdateFeatureRequest) =>
  ApiService.put<Feature>(`${BASE_URL}/features/${id}`, data);

export const deleteFeature = (id: string) =>
  ApiService.delete<void>(`${BASE_URL}/features/${id}`);

// ==================== Industries ====================
export const getIndustries = () =>
  ApiService.get<Industry[]>(`${BASE_URL}/industries`);

export const getActiveIndustries = () =>
  ApiService.get<Industry[]>(`${BASE_URL}/industries/active`);

export const getIndustryById = (id: string) =>
  ApiService.get<Industry>(`${BASE_URL}/industries/${id}`);

export const getIndustryBySlug = (slug: string) =>
  ApiService.get<Industry>(`${BASE_URL}/industries/slug/${slug}`);

export const createIndustry = (data: CreateIndustryRequest) =>
  ApiService.post<Industry>(`${BASE_URL}/industries`, data);

export const updateIndustry = (id: string, data: UpdateIndustryRequest) =>
  ApiService.put<Industry>(`${BASE_URL}/industries/${id}`, data);

export const deleteIndustry = (id: string) =>
  ApiService.delete<void>(`${BASE_URL}/industries/${id}`);

// ==================== Integrations ====================
export const getIntegrations = () =>
  ApiService.get<Integration[]>(`${BASE_URL}/integrations`);

export const getActiveIntegrations = () =>
  ApiService.get<Integration[]>(`${BASE_URL}/integrations/active`);

export const getIntegrationById = (id: string) =>
  ApiService.get<Integration>(`${BASE_URL}/integrations/${id}`);

export const getIntegrationBySlug = (slug: string) =>
  ApiService.get<Integration>(`${BASE_URL}/integrations/slug/${slug}`);

export const createIntegration = (data: CreateIntegrationRequest) =>
  ApiService.post<Integration>(`${BASE_URL}/integrations`, data);

export const updateIntegration = (id: string, data: UpdateIntegrationRequest) =>
  ApiService.put<Integration>(`${BASE_URL}/integrations/${id}`, data);

export const deleteIntegration = (id: string) =>
  ApiService.delete<void>(`${BASE_URL}/integrations/${id}`);

// ==================== Integration Items ====================
export const getIntegrationItemsByIntegration = (integrationId: string) =>
  ApiService.get<IntegrationItem[]>(`${BASE_URL}/integrations/${integrationId}/items`);

export const getIntegrationItemById = (id: string) =>
  ApiService.get<IntegrationItem>(`${BASE_URL}/integration-items/${id}`);

export const createIntegrationItem = (data: CreateIntegrationItemRequest) =>
  ApiService.post<IntegrationItem>(`${BASE_URL}/integration-items`, data);

export const updateIntegrationItem = (id: string, data: UpdateIntegrationItemRequest) =>
  ApiService.put<IntegrationItem>(`${BASE_URL}/integration-items/${id}`, data);

export const deleteIntegrationItem = (id: string) =>
  ApiService.delete<void>(`${BASE_URL}/integration-items/${id}`);

// ==================== Stats ====================
export const getStats = () =>
  ApiService.get<Stat[]>(`${BASE_URL}/stats`);

export const getActiveStats = () =>
  ApiService.get<Stat[]>(`${BASE_URL}/stats/active`);

export const getStatsBySection = (section: string) =>
  ApiService.get<Stat[]>(`${BASE_URL}/stats/section/${section}`);

export const getStatById = (id: string) =>
  ApiService.get<Stat>(`${BASE_URL}/stats/${id}`);

export const createStat = (data: CreateStatRequest) =>
  ApiService.post<Stat>(`${BASE_URL}/stats`, data);

export const updateStat = (id: string, data: UpdateStatRequest) =>
  ApiService.put<Stat>(`${BASE_URL}/stats/${id}`, data);

export const deleteStat = (id: string) =>
  ApiService.delete<void>(`${BASE_URL}/stats/${id}`);

// ==================== Partners ====================
export const getPartners = () =>
  ApiService.get<Partner[]>(`${BASE_URL}/partners`);

export const getActivePartners = () =>
  ApiService.get<Partner[]>(`${BASE_URL}/partners/active`);

export const getFeaturedPartners = () =>
  ApiService.get<Partner[]>(`${BASE_URL}/partners/featured`);

export const getPartnerById = (id: string) =>
  ApiService.get<Partner>(`${BASE_URL}/partners/${id}`);

export const createPartner = (data: CreatePartnerRequest) =>
  ApiService.post<Partner>(`${BASE_URL}/partners`, data);

export const updatePartner = (id: string, data: UpdatePartnerRequest) =>
  ApiService.put<Partner>(`${BASE_URL}/partners/${id}`, data);

export const deletePartner = (id: string) =>
  ApiService.delete<void>(`${BASE_URL}/partners/${id}`);

// ==================== Achievements ====================
export const getAchievements = () =>
  ApiService.get<Achievement[]>(`${BASE_URL}/achievements`);

export const getActiveAchievements = () =>
  ApiService.get<Achievement[]>(`${BASE_URL}/achievements/active`);

export const getAchievementById = (id: string) =>
  ApiService.get<Achievement>(`${BASE_URL}/achievements/${id}`);

export const createAchievement = (data: CreateAchievementRequest) =>
  ApiService.post<Achievement>(`${BASE_URL}/achievements`, data);

export const updateAchievement = (id: string, data: UpdateAchievementRequest) =>
  ApiService.put<Achievement>(`${BASE_URL}/achievements/${id}`, data);

export const deleteAchievement = (id: string) =>
  ApiService.delete<void>(`${BASE_URL}/achievements/${id}`);
