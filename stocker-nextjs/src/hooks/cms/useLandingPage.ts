/**
 * React Query hooks for CMS Landing Page entities
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  // Testimonials
  getTestimonials,
  getActiveTestimonials,
  getFeaturedTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  // Pricing Plans
  getPricingPlans,
  getActivePricingPlans,
  getPricingPlanById,
  getPricingPlanBySlug,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  // Pricing Features
  getPricingFeaturesByPlan,
  createPricingFeature,
  updatePricingFeature,
  deletePricingFeature,
  // Features
  getFeatures,
  getActiveFeatures,
  getFeaturedFeatures,
  getFeaturesByCategory,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature,
  // Industries
  getIndustries,
  getActiveIndustries,
  getIndustryById,
  getIndustryBySlug,
  createIndustry,
  updateIndustry,
  deleteIndustry,
  // Integrations
  getIntegrations,
  getActiveIntegrations,
  getIntegrationById,
  getIntegrationBySlug,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  // Integration Items
  getIntegrationItemsByIntegration,
  createIntegrationItem,
  updateIntegrationItem,
  deleteIntegrationItem,
  // Stats
  getStats,
  getActiveStats,
  getStatsBySection,
  getStatById,
  createStat,
  updateStat,
  deleteStat,
  // Partners
  getPartners,
  getActivePartners,
  getFeaturedPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  // Achievements
  getAchievements,
  getActiveAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from '@/lib/api/cms/landing';
import type {
  CreateTestimonialRequest,
  UpdateTestimonialRequest,
  CreatePricingPlanRequest,
  UpdatePricingPlanRequest,
  CreatePricingFeatureRequest,
  UpdatePricingFeatureRequest,
  CreateFeatureRequest,
  UpdateFeatureRequest,
  CreateIndustryRequest,
  UpdateIndustryRequest,
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  CreateIntegrationItemRequest,
  UpdateIntegrationItemRequest,
  CreateStatRequest,
  UpdateStatRequest,
  CreatePartnerRequest,
  UpdatePartnerRequest,
  CreateAchievementRequest,
  UpdateAchievementRequest,
} from '@/lib/api/cms/types';
import {
  showCreateSuccess,
  showUpdateSuccess,
  showDeleteSuccess,
  showError,
} from '@/lib/utils/sweetalert';

// Query Keys
export const CMS_QUERY_KEYS = {
  testimonials: ['cms', 'testimonials'] as const,
  pricingPlans: ['cms', 'pricing-plans'] as const,
  pricingFeatures: (planId: string) => ['cms', 'pricing-features', planId] as const,
  features: ['cms', 'features'] as const,
  industries: ['cms', 'industries'] as const,
  integrations: ['cms', 'integrations'] as const,
  integrationItems: (integrationId: string) => ['cms', 'integration-items', integrationId] as const,
  stats: ['cms', 'stats'] as const,
  partners: ['cms', 'partners'] as const,
  achievements: ['cms', 'achievements'] as const,
};

// ==================== Testimonials ====================
export function useTestimonials() {
  return useQuery({ queryKey: CMS_QUERY_KEYS.testimonials, queryFn: getTestimonials });
}

export function useActiveTestimonials() {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.testimonials, 'active'], queryFn: getActiveTestimonials });
}

export function useFeaturedTestimonials() {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.testimonials, 'featured'], queryFn: getFeaturedTestimonials });
}

export function useTestimonial(id: string) {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.testimonials, id], queryFn: () => getTestimonialById(id), enabled: !!id });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTestimonialRequest) => createTestimonial(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.testimonials }); showCreateSuccess('testimonial'); },
    onError: (error: any) => { showError(error.message || 'Testimonial oluşturulurken hata oluştu'); },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTestimonialRequest }) => updateTestimonial(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.testimonials }); showUpdateSuccess('testimonial'); },
    onError: (error: any) => { showError(error.message || 'Testimonial güncellenirken hata oluştu'); },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTestimonial(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.testimonials }); showDeleteSuccess('testimonial'); },
    onError: (error: any) => { showError(error.message || 'Testimonial silinirken hata oluştu'); },
  });
}

// ==================== Pricing Plans ====================
export function usePricingPlans() {
  return useQuery({ queryKey: CMS_QUERY_KEYS.pricingPlans, queryFn: getPricingPlans });
}

export function useActivePricingPlans() {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.pricingPlans, 'active'], queryFn: getActivePricingPlans });
}

export function usePricingPlan(id: string) {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.pricingPlans, id], queryFn: () => getPricingPlanById(id), enabled: !!id });
}

export function usePricingPlanBySlug(slug: string) {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.pricingPlans, 'slug', slug], queryFn: () => getPricingPlanBySlug(slug), enabled: !!slug });
}

export function useCreatePricingPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePricingPlanRequest) => createPricingPlan(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.pricingPlans }); showCreateSuccess('fiyat planı'); },
    onError: (error: any) => { showError(error.message || 'Fiyat planı oluşturulurken hata oluştu'); },
  });
}

export function useUpdatePricingPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePricingPlanRequest }) => updatePricingPlan(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.pricingPlans }); showUpdateSuccess('fiyat planı'); },
    onError: (error: any) => { showError(error.message || 'Fiyat planı güncellenirken hata oluştu'); },
  });
}

export function useDeletePricingPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePricingPlan(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.pricingPlans }); showDeleteSuccess('fiyat planı'); },
    onError: (error: any) => { showError(error.message || 'Fiyat planı silinirken hata oluştu'); },
  });
}

// ==================== Pricing Features ====================
export function usePricingFeatures(planId: string) {
  return useQuery({ queryKey: CMS_QUERY_KEYS.pricingFeatures(planId), queryFn: () => getPricingFeaturesByPlan(planId), enabled: !!planId });
}

export function useCreatePricingFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePricingFeatureRequest) => createPricingFeature(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.pricingFeatures(variables.planId) });
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.pricingPlans });
      showCreateSuccess('özellik');
    },
    onError: (error: any) => { showError(error.message || 'Özellik oluşturulurken hata oluştu'); },
  });
}

export function useUpdatePricingFeature(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePricingFeatureRequest }) => updatePricingFeature(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.pricingFeatures(planId) });
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.pricingPlans });
      showUpdateSuccess('özellik');
    },
    onError: (error: any) => { showError(error.message || 'Özellik güncellenirken hata oluştu'); },
  });
}

export function useDeletePricingFeature(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePricingFeature(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.pricingFeatures(planId) });
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.pricingPlans });
      showDeleteSuccess('özellik');
    },
    onError: (error: any) => { showError(error.message || 'Özellik silinirken hata oluştu'); },
  });
}

// ==================== Features ====================
export function useFeatures() {
  return useQuery({ queryKey: CMS_QUERY_KEYS.features, queryFn: getFeatures });
}

export function useActiveFeatures() {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.features, 'active'], queryFn: getActiveFeatures });
}

export function useFeaturedFeatures() {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.features, 'featured'], queryFn: getFeaturedFeatures });
}

export function useFeaturesByCategory(category: string) {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.features, 'category', category], queryFn: () => getFeaturesByCategory(category), enabled: !!category });
}

export function useFeature(id: string) {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.features, id], queryFn: () => getFeatureById(id), enabled: !!id });
}

export function useCreateFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFeatureRequest) => createFeature(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.features }); showCreateSuccess('özellik'); },
    onError: (error: any) => { showError(error.message || 'Özellik oluşturulurken hata oluştu'); },
  });
}

export function useUpdateFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeatureRequest }) => updateFeature(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.features }); showUpdateSuccess('özellik'); },
    onError: (error: any) => { showError(error.message || 'Özellik güncellenirken hata oluştu'); },
  });
}

export function useDeleteFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFeature(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.features }); showDeleteSuccess('özellik'); },
    onError: (error: any) => { showError(error.message || 'Özellik silinirken hata oluştu'); },
  });
}

// ==================== Industries ====================
export function useIndustries() {
  return useQuery({ queryKey: CMS_QUERY_KEYS.industries, queryFn: getIndustries });
}

export function useActiveIndustries() {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.industries, 'active'], queryFn: getActiveIndustries });
}

export function useIndustry(id: string) {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.industries, id], queryFn: () => getIndustryById(id), enabled: !!id });
}

export function useIndustryBySlug(slug: string) {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.industries, 'slug', slug], queryFn: () => getIndustryBySlug(slug), enabled: !!slug });
}

export function useCreateIndustry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIndustryRequest) => createIndustry(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.industries }); showCreateSuccess('sektör'); },
    onError: (error: any) => { showError(error.message || 'Sektör oluşturulurken hata oluştu'); },
  });
}

export function useUpdateIndustry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIndustryRequest }) => updateIndustry(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.industries }); showUpdateSuccess('sektör'); },
    onError: (error: any) => { showError(error.message || 'Sektör güncellenirken hata oluştu'); },
  });
}

export function useDeleteIndustry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIndustry(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.industries }); showDeleteSuccess('sektör'); },
    onError: (error: any) => { showError(error.message || 'Sektör silinirken hata oluştu'); },
  });
}

// ==================== Integrations ====================
export function useIntegrations() {
  return useQuery({ queryKey: CMS_QUERY_KEYS.integrations, queryFn: getIntegrations });
}

export function useActiveIntegrations() {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.integrations, 'active'], queryFn: getActiveIntegrations });
}

export function useIntegration(id: string) {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.integrations, id], queryFn: () => getIntegrationById(id), enabled: !!id });
}

export function useIntegrationBySlug(slug: string) {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.integrations, 'slug', slug], queryFn: () => getIntegrationBySlug(slug), enabled: !!slug });
}

export function useCreateIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIntegrationRequest) => createIntegration(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.integrations }); showCreateSuccess('entegrasyon'); },
    onError: (error: any) => { showError(error.message || 'Entegrasyon oluşturulurken hata oluştu'); },
  });
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIntegrationRequest }) => updateIntegration(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.integrations }); showUpdateSuccess('entegrasyon'); },
    onError: (error: any) => { showError(error.message || 'Entegrasyon güncellenirken hata oluştu'); },
  });
}

export function useDeleteIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIntegration(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.integrations }); showDeleteSuccess('entegrasyon'); },
    onError: (error: any) => { showError(error.message || 'Entegrasyon silinirken hata oluştu'); },
  });
}

// ==================== Integration Items ====================
export function useIntegrationItems(integrationId: string) {
  return useQuery({ queryKey: CMS_QUERY_KEYS.integrationItems(integrationId), queryFn: () => getIntegrationItemsByIntegration(integrationId), enabled: !!integrationId });
}

export function useCreateIntegrationItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIntegrationItemRequest) => createIntegrationItem(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.integrationItems(variables.integrationId) });
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.integrations });
      showCreateSuccess('entegrasyon öğesi');
    },
    onError: (error: any) => { showError(error.message || 'Entegrasyon öğesi oluşturulurken hata oluştu'); },
  });
}

export function useUpdateIntegrationItem(integrationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIntegrationItemRequest }) => updateIntegrationItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.integrationItems(integrationId) });
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.integrations });
      showUpdateSuccess('entegrasyon öğesi');
    },
    onError: (error: any) => { showError(error.message || 'Entegrasyon öğesi güncellenirken hata oluştu'); },
  });
}

export function useDeleteIntegrationItem(integrationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIntegrationItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.integrationItems(integrationId) });
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.integrations });
      showDeleteSuccess('entegrasyon öğesi');
    },
    onError: (error: any) => { showError(error.message || 'Entegrasyon öğesi silinirken hata oluştu'); },
  });
}

// ==================== Stats ====================
export function useStats() {
  return useQuery({ queryKey: CMS_QUERY_KEYS.stats, queryFn: getStats });
}

export function useActiveStats() {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.stats, 'active'], queryFn: getActiveStats });
}

export function useStatsBySection(section: string) {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.stats, 'section', section], queryFn: () => getStatsBySection(section), enabled: !!section });
}

export function useStat(id: string) {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.stats, id], queryFn: () => getStatById(id), enabled: !!id });
}

export function useCreateStat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStatRequest) => createStat(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.stats }); showCreateSuccess('istatistik'); },
    onError: (error: any) => { showError(error.message || 'İstatistik oluşturulurken hata oluştu'); },
  });
}

export function useUpdateStat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStatRequest }) => updateStat(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.stats }); showUpdateSuccess('istatistik'); },
    onError: (error: any) => { showError(error.message || 'İstatistik güncellenirken hata oluştu'); },
  });
}

export function useDeleteStat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStat(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.stats }); showDeleteSuccess('istatistik'); },
    onError: (error: any) => { showError(error.message || 'İstatistik silinirken hata oluştu'); },
  });
}

// ==================== Partners ====================
export function usePartners() {
  return useQuery({ queryKey: CMS_QUERY_KEYS.partners, queryFn: getPartners });
}

export function useActivePartners() {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.partners, 'active'], queryFn: getActivePartners });
}

export function useFeaturedPartners() {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.partners, 'featured'], queryFn: getFeaturedPartners });
}

export function usePartner(id: string) {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.partners, id], queryFn: () => getPartnerById(id), enabled: !!id });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePartnerRequest) => createPartner(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.partners }); showCreateSuccess('partner'); },
    onError: (error: any) => { showError(error.message || 'Partner oluşturulurken hata oluştu'); },
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartnerRequest }) => updatePartner(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.partners }); showUpdateSuccess('partner'); },
    onError: (error: any) => { showError(error.message || 'Partner güncellenirken hata oluştu'); },
  });
}

export function useDeletePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePartner(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.partners }); showDeleteSuccess('partner'); },
    onError: (error: any) => { showError(error.message || 'Partner silinirken hata oluştu'); },
  });
}

// ==================== Achievements ====================
export function useAchievements() {
  return useQuery({ queryKey: CMS_QUERY_KEYS.achievements, queryFn: getAchievements });
}

export function useActiveAchievements() {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.achievements, 'active'], queryFn: getActiveAchievements });
}

export function useAchievement(id: string) {
  return useQuery({ queryKey: [...CMS_QUERY_KEYS.achievements, id], queryFn: () => getAchievementById(id), enabled: !!id });
}

export function useCreateAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAchievementRequest) => createAchievement(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.achievements }); showCreateSuccess('başarı'); },
    onError: (error: any) => { showError(error.message || 'Başarı oluşturulurken hata oluştu'); },
  });
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAchievementRequest }) => updateAchievement(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.achievements }); showUpdateSuccess('başarı'); },
    onError: (error: any) => { showError(error.message || 'Başarı güncellenirken hata oluştu'); },
  });
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAchievement(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.achievements }); showDeleteSuccess('başarı'); },
    onError: (error: any) => { showError(error.message || 'Başarı silinirken hata oluştu'); },
  });
}
