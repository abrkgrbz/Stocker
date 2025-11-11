/**
 * React Query Hooks for CRM Module
 * Comprehensive hooks for all 116 CRM endpoints with optimistic updates and cache management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CRMService } from '../services/crm.service';
import { showSuccess, showError, showInfo, showApiError } from '@/lib/utils/notifications';
import type {
  Guid,
  DateTime,
  OpportunityDto,
  OpportunityFilters,
  CreateOpportunityCommand,
  DocumentDto,
  DocumentCategory,
  AccessLevel,
  CustomerTagDto,
  CampaignMemberDto,
  CustomerSegmentMemberDto,
  ActivityStatisticsDto,
  LeadStatisticsDto,
  DealStatisticsDto,
  ConversionRatesDto,
  PipelineStatisticsDto,
  CampaignRoiDto,
  CampaignStatisticsDto,
  ScoringCriteria,
} from '../services/crm.types';
import type { Activity, Lead, Deal, Customer } from '../services/crm.service';

// =====================================
// QUERY KEYS
// =====================================

export const crmKeys = {
  // Activities
  activities: ['crm', 'activities'] as const,
  activity: (id: Guid) => ['crm', 'activities', id] as const,
  activitiesUpcoming: (days: number) => ['crm', 'activities', 'upcoming', days] as const,
  activitiesOverdue: () => ['crm', 'activities', 'overdue'] as const,
  activitiesCalendar: (from: DateTime, to: DateTime) => ['crm', 'activities', 'calendar', from, to] as const,
  activitiesStats: (from?: DateTime, to?: DateTime) => ['crm', 'activities', 'stats', from, to] as const,

  // Leads
  leads: ['crm', 'leads'] as const,
  lead: (id: Guid) => ['crm', 'leads', id] as const,
  leadActivities: (id: Guid) => ['crm', 'leads', id, 'activities'] as const,
  leadsStats: (from?: DateTime, to?: DateTime) => ['crm', 'leads', 'stats', from, to] as const,

  // Deals
  deals: ['crm', 'deals'] as const,
  deal: (id: Guid) => ['crm', 'deals', id] as const,
  dealActivities: (id: Guid) => ['crm', 'deals', id, 'activities'] as const,
  dealProducts: (id: Guid) => ['crm', 'deals', id, 'products'] as const,
  dealsStats: (from?: DateTime, to?: DateTime) => ['crm', 'deals', 'stats', from, to] as const,
  dealsConversion: (pipelineId?: Guid, from?: DateTime, to?: DateTime) =>
    ['crm', 'deals', 'conversion', pipelineId, from, to] as const,

  // Opportunities
  opportunities: ['crm', 'opportunities'] as const,
  opportunity: (id: Guid) => ['crm', 'opportunities', id] as const,
  opportunityActivities: (id: Guid) => ['crm', 'opportunities', id, 'activities'] as const,
  opportunityProducts: (id: Guid) => ['crm', 'opportunities', id, 'products'] as const,
  pipelineReport: (pipelineId?: Guid, from?: DateTime, to?: DateTime) =>
    ['crm', 'opportunities', 'report', pipelineId, from, to] as const,
  salesForecast: (from: DateTime, to: DateTime) => ['crm', 'opportunities', 'forecast', from, to] as const,

  // Pipelines
  pipelines: ['crm', 'pipelines'] as const,
  pipeline: (id: string) => ['crm', 'pipelines', id] as const,
  pipelineStages: (id: string) => ['crm', 'pipelines', id, 'stages'] as const,
  pipelineStats: (id: string) => ['crm', 'pipelines', id, 'stats'] as const,

  // Campaigns
  campaigns: ['crm', 'campaigns'] as const,
  campaign: (id: string) => ['crm', 'campaigns', id] as const,
  campaignMembers: (id: string) => ['crm', 'campaigns', id, 'members'] as const,
  campaignRoi: (id: string) => ['crm', 'campaigns', id, 'roi'] as const,
  campaignStats: (id: string) => ['crm', 'campaigns', id, 'stats'] as const,

  // Segments
  segments: ['crm', 'segments'] as const,
  segment: (id: string) => ['crm', 'segments', id] as const,
  segmentMembers: (id: string) => ['crm', 'segments', id, 'members'] as const,

  // Documents
  documents: (entityId: number | string, entityType: string) => ['crm', 'documents', entityType, entityId] as const,
  document: (id: number) => ['crm', 'documents', id] as const,

  // Customer Tags
  customerTags: (customerId: Guid) => ['crm', 'tags', customerId] as const,
  allTags: () => ['crm', 'tags', 'all'] as const,
};

// =====================================
// ACTIVITIES HOOKS
// =====================================

export function useActivities(filters?: any) {
  return useQuery({
    queryKey: [...crmKeys.activities, filters],
    queryFn: () => CRMService.getActivities(filters),
  });
}

export function useActivity(id: Guid) {
  return useQuery({
    queryKey: crmKeys.activity(id),
    queryFn: () => CRMService.getActivity(Number(id)),
    enabled: !!id,
  });
}

export function useUpcomingActivities(days: number = 7) {
  return useQuery({
    queryKey: crmKeys.activitiesUpcoming(days),
    queryFn: () => CRMService.getUpcomingActivities(days),
  });
}

export function useOverdueActivities() {
  return useQuery({
    queryKey: crmKeys.activitiesOverdue(),
    queryFn: () => CRMService.getOverdueActivities(),
  });
}

export function useCalendarActivities(fromDate: DateTime, toDate: DateTime) {
  return useQuery({
    queryKey: crmKeys.activitiesCalendar(fromDate, toDate),
    queryFn: () => CRMService.getCalendarActivities(fromDate, toDate),
    enabled: !!fromDate && !!toDate,
  });
}

export function useActivityStatistics(fromDate?: DateTime, toDate?: DateTime) {
  return useQuery({
    queryKey: crmKeys.activitiesStats(fromDate, toDate),
    queryFn: () => CRMService.getActivityStatistics(fromDate, toDate),
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.activities });
      showSuccess('Aktivite başarıyla oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Aktivite oluşturulamadı');
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Activity> }) =>
      CRMService.updateActivity(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.activity(variables.id.toString()) });
      queryClient.invalidateQueries({ queryKey: crmKeys.activities });
      showSuccess('Aktivite güncellendi');
    },
    onError: (error) => {
      showApiError(error,'Aktivite güncellenemedi');
    },
  });
}

export function useCompleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: Guid; notes?: string }) =>
      CRMService.completeActivity(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.activities });
      showSuccess('Aktivite tamamlandı');
    },
    onError: (error) => {
      showApiError(error,'Aktivite tamamlanamadı');
    },
  });
}

export function useCancelActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: Guid; reason?: string }) =>
      CRMService.cancelActivity(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.activities });
      showSuccess('Aktivite iptal edildi');
    },
    onError: (error) => {
      showApiError(error,'Aktivite iptal edilemedi');
    },
  });
}

export function useRescheduleActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newStartDate, newEndDate, reason }: {
      id: Guid;
      newStartDate: DateTime;
      newEndDate?: DateTime;
      reason?: string;
    }) => CRMService.rescheduleActivity(id, newStartDate, newEndDate, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.activities });
      showSuccess('Aktivite yeniden planlandı');
    },
    onError: (error) => {
      showApiError(error,'Aktivite yeniden planlanamadı');
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CRMService.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.activities });
      showSuccess('Aktivite silindi');
    },
    onError: (error) => {
      showApiError(error,'Aktivite silinemedi');
    },
  });
}

// =====================================
// LEADS HOOKS
// =====================================

export function useLeads(filters?: any) {
  return useQuery({
    queryKey: [...crmKeys.leads, filters],
    queryFn: () => CRMService.getLeads(filters),
  });
}

export function useLead(id: Guid) {
  return useQuery({
    queryKey: crmKeys.lead(id),
    queryFn: () => CRMService.getLead(Number(id)),
    enabled: !!id,
  });
}

export function useLeadActivities(id: Guid) {
  return useQuery({
    queryKey: crmKeys.leadActivities(id),
    queryFn: () => CRMService.getLeadActivities(id),
    enabled: !!id,
  });
}

export function useLeadStatistics(fromDate?: DateTime, toDate?: DateTime) {
  return useQuery({
    queryKey: crmKeys.leadsStats(fromDate, toDate),
    queryFn: () => CRMService.getLeadStatistics(fromDate, toDate),
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => {
      // DEBUG: Log incoming data from form
      console.log('🎯 Hook received data:', data);
      console.log('🎯 Data keys:', Object.keys(data));
      console.log('🎯 firstName from data:', data.firstName);
      console.log('🎯 lastName from data:', data.lastName);
      console.log('🎯 email from data:', data.email);

      // Backend expects data wrapped in LeadData property (CreateLeadDto)
      // Map frontend field names to backend DTO property names
      const leadData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        companyName: data.company || null,  // company → companyName
        jobTitle: data.jobTitle || null,
        source: data.source || null,  // String value like "Website", "Referral"
        status: data.status || 0,  // Numeric enum: 0=New, 1=Contacted, 2=Qualified, 3=Unqualified, 4=Converted
        rating: 0,  // Default to Unrated (0)
        description: data.notes || null,  // notes → description
      };

      console.log('🎯 Mapped leadData:', leadData);

      return CRMService.createLead({ LeadData: leadData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads });
      showSuccess('Lead oluşturuldu');
    },
    onError: (error) => {
      showApiError(error,'Lead oluşturulamadı');
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Lead> }) =>
      CRMService.updateLead(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.lead(variables.id.toString()) });
      queryClient.invalidateQueries({ queryKey: crmKeys.leads });
      showSuccess('Lead güncellendi');
    },
    onError: (error) => {
      showApiError(error,'Lead güncellenemedi');
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CRMService.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads });
      showSuccess('Lead silindi');
    },
    onError: (error) => {
      showApiError(error,'Lead silinemedi');
    },
  });
}

export function useQualifyLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: Guid; notes?: string }) =>
      CRMService.qualifyLead(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads });
      showSuccess('Lead nitelikli olarak işaretlendi');
    },
    onError: (error) => {
      showApiError(error,'Lead niteliklendirilemedi');
    },
  });
}

export function useDisqualifyLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: Guid; reason: string }) =>
      CRMService.disqualifyLead(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads });
      showSuccess('Lead niteliksiz olarak işaretlendi');
    },
    onError: (error) => {
      showApiError(error,'İşlem başarısız');
    },
  });
}

export function useAssignLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignedToId }: { id: Guid; assignedToId: Guid }) =>
      CRMService.assignLead(id, assignedToId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads });
      showSuccess('Lead atandı');
    },
    onError: (error) => {
      showApiError(error,'Lead atanamadı');
    },
  });
}

export function useUpdateLeadScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, score, criteria }: {
      id: Guid;
      score: number;
      criteria?: ScoringCriteria;
    }) => CRMService.updateLeadScore(id, score, criteria),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads });
      showSuccess('Lead skoru güncellendi');
    },
    onError: (error) => {
      showApiError(error,'Skor güncellenemedi');
    },
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, customerData }: { leadId: number; customerData: any }) =>
      CRMService.convertLeadToCustomer(leadId, customerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads });
      showSuccess('Lead müşteriye dönüştürüldü');
    },
    onError: (error) => {
      showApiError(error,'Dönüştürme başarısız');
    },
  });
}

// =====================================
// DEALS HOOKS
// =====================================

export function useDeals(filters?: any) {
  return useQuery({
    queryKey: [...crmKeys.deals, filters],
    queryFn: () => CRMService.getDeals(filters),
  });
}

export function useDeal(id: Guid) {
  return useQuery({
    queryKey: crmKeys.deal(id),
    queryFn: () => CRMService.getDeal(id),
    enabled: !!id,
  });
}

export function useDealActivities(id: Guid) {
  return useQuery({
    queryKey: crmKeys.dealActivities(id),
    queryFn: () => CRMService.getDealActivities(id),
    enabled: !!id,
  });
}

export function useDealProducts(id: Guid) {
  return useQuery({
    queryKey: crmKeys.dealProducts(id),
    queryFn: () => CRMService.getDealProducts(id),
    enabled: !!id,
  });
}

export function useAddDealProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dealId, productId, quantity, unitPrice, discount }: {
      dealId: Guid;
      productId: Guid;
      quantity: number;
      unitPrice: number;
      discount?: number;
    }) => CRMService.addDealProduct(dealId, productId, quantity, unitPrice, discount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.dealProducts(variables.dealId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.deal(variables.dealId) });
      showSuccess('Ürün eklendi');
    },
    onError: (error) => {
      showApiError(error,'Ürün eklenemedi');
    },
  });
}

export function useRemoveDealProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dealId, productId }: { dealId: Guid; productId: Guid }) =>
      CRMService.removeDealProduct(dealId, productId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.dealProducts(variables.dealId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.deal(variables.dealId) });
      showSuccess('Ürün kaldırıldı');
    },
    onError: (error) => {
      showApiError(error,'Ürün kaldırılamadı');
    },
  });
}

export function useDealStatistics(fromDate?: DateTime, toDate?: DateTime) {
  return useQuery({
    queryKey: crmKeys.dealsStats(fromDate, toDate),
    queryFn: () => CRMService.getDealStatistics(fromDate, toDate),
  });
}

export function useConversionRates(pipelineId?: Guid, fromDate?: DateTime, toDate?: DateTime) {
  return useQuery({
    queryKey: crmKeys.dealsConversion(pipelineId, fromDate, toDate),
    queryFn: () => CRMService.getConversionRates(pipelineId, fromDate, toDate),
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => CRMService.createDeal(data),
    onSuccess: async () => {
      // Invalidate and refetch all deal queries (using exact: false to match all filter variations)
      await queryClient.invalidateQueries({ queryKey: crmKeys.deals, exact: false });
      // Don't show message here - let the calling component handle it
    },
    onError: (error: any) => {
      // Don't show message here - let the calling component handle it
      console.error('Deal creation error:', error.response?.data);
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: Guid; data: Partial<Deal> }) =>
      CRMService.updateDeal(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.deal(variables.id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.deals });
      showSuccess('Fırsat güncellendi');
    },
    onError: (error) => {
      showApiError(error,'Fırsat güncellenemedi');
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: Guid) => CRMService.deleteDeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.deals });
      showSuccess('Fırsat silindi');
    },
    onError: (error) => {
      showApiError(error,'Fırsat silinemedi');
    },
  });
}

export function useMoveDealStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newStageId, notes }: { id: Guid; newStageId: Guid; notes?: string }) =>
      CRMService.moveDealStage(id, newStageId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.deals });
      showSuccess('Deal aşamaya taşındı');
    },
    onError: (error) => {
      showApiError(error,'Taşıma başarısız');
    },
  });
}

export function useCloseDealWon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, actualAmount, closedDate, notes }: {
      id: Guid;
      actualAmount?: number;
      closedDate?: DateTime;
      notes?: string;
    }) => CRMService.closeDealWon(id, actualAmount, closedDate, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.deals });
      showSuccess('🎉 Deal kazanıldı!');
    },
    onError: (error) => {
      showApiError(error,'İşlem başarısız');
    },
  });
}

export function useCloseDealLost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, lostReason, competitorName, closedDate, notes }: {
      id: Guid;
      lostReason: string;
      competitorName?: string;
      closedDate?: DateTime;
      notes?: string;
    }) => CRMService.closeDealLost(id, lostReason, competitorName, closedDate, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.deals });
      showInfo('Deal kaybedildi olarak işaretlendi');
    },
    onError: (error) => {
      showApiError(error,'İşlem başarısız');
    },
  });
}

// =====================================
// OPPORTUNITIES HOOKS (NEW)
// =====================================

export function useOpportunities(filters?: OpportunityFilters) {
  return useQuery({
    queryKey: [...crmKeys.opportunities, filters],
    queryFn: () => CRMService.getOpportunities(filters),
  });
}

export function useOpportunity(id: Guid) {
  return useQuery({
    queryKey: crmKeys.opportunity(id),
    queryFn: () => CRMService.getOpportunity(id),
    enabled: !!id,
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOpportunityCommand) => CRMService.createOpportunity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.opportunities, exact: false });
      showSuccess('Fırsat oluşturuldu');
    },
    onError: (error) => {
      showApiError(error,'Fırsat oluşturulamadı');
    },
  });
}

export function useWinOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, actualAmount, closedDate, notes }: {
      id: Guid;
      actualAmount?: number;
      closedDate?: DateTime;
      notes?: string;
    }) => CRMService.winOpportunity(id, actualAmount, closedDate, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.opportunities, exact: false });
      showSuccess('🎉 Fırsat kazanıldı!');
    },
    onError: (error) => {
      showApiError(error,'İşlem başarısız');
    },
  });
}

export function useOpportunityProducts(id: Guid) {
  return useQuery({
    queryKey: crmKeys.opportunityProducts(id),
    queryFn: () => CRMService.getOpportunityProducts(id),
    enabled: !!id,
  });
}

export function useAddOpportunityProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ opportunityId, productId, quantity, unitPrice, discount }: {
      opportunityId: Guid;
      productId: Guid;
      quantity: number;
      unitPrice: number;
      discount?: number;
    }) => CRMService.addOpportunityProduct(opportunityId, productId, quantity, unitPrice, discount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.opportunityProducts(variables.opportunityId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.opportunity(variables.opportunityId) });
      showSuccess('Ürün eklendi');
    },
    onError: (error) => {
      showApiError(error,'Ürün eklenemedi');
    },
  });
}

export function useRemoveOpportunityProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ opportunityId, productId }: { opportunityId: Guid; productId: Guid }) =>
      CRMService.removeOpportunityProduct(opportunityId, productId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.opportunityProducts(variables.opportunityId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.opportunity(variables.opportunityId) });
      showSuccess('Ürün kaldırıldı');
    },
    onError: (error) => {
      showApiError(error,'Ürün kaldırılamadı');
    },
  });
}

export function useLoseOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, lostReason, competitorName, closedDate, notes }: {
      id: Guid;
      lostReason: string;
      competitorName?: string;
      closedDate?: DateTime;
      notes?: string;
    }) => CRMService.loseOpportunity(id, lostReason, competitorName, closedDate, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.opportunities, exact: false });
      showInfo('Fırsat kaybedildi olarak işaretlendi');
    },
    onError: (error) => {
      showApiError(error,'İşlem başarısız');
    },
  });
}

export function useSalesForecast(fromDate: DateTime, toDate: DateTime) {
  return useQuery({
    queryKey: crmKeys.salesForecast(fromDate, toDate),
    queryFn: () => CRMService.getSalesForecast(fromDate, toDate),
    enabled: !!fromDate && !!toDate,
  });
}

// =====================================
// DOCUMENTS HOOKS (NEW)
// =====================================

export function useDocumentsByEntity(entityId: number | string, entityType: string) {
  return useQuery({
    queryKey: crmKeys.documents(entityId, entityType),
    queryFn: () => CRMService.getDocumentsByEntity(entityId, entityType),
    enabled: !!entityId && !!entityType,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, entityId, entityType, category, metadata }: {
      file: File;
      entityId: number | string;
      entityType: string;
      category: DocumentCategory;
      metadata?: {
        description?: string;
        tags?: string;
        accessLevel?: AccessLevel;
        expiresAt?: DateTime;
      };
    }) => CRMService.uploadDocument(file, entityId, entityType, category, metadata),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: crmKeys.documents(variables.entityId, variables.entityType)
      });
      showSuccess('Döküman yüklendi');
    },
    onError: (error) => {
      showApiError(error,'Döküman yüklenemedi');
    },
  });
}

export function useDocument(id: number) {
  return useQuery({
    queryKey: crmKeys.document(id),
    queryFn: () => CRMService.getDocument(id),
    enabled: !!id,
  });
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: (id: number) => CRMService.downloadDocument(id),
    onSuccess: (blob, id) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('Döküman indirildi');
    },
    onError: (error) => {
      showApiError(error,'Döküman indirilemedi');
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, metadata }: { id: number; metadata: any }) =>
      CRMService.updateDocument(id, metadata),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.document(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['crm', 'documents'] });
      showSuccess('Döküman güncellendi');
    },
    onError: (error) => {
      showApiError(error,'Döküman güncellenemedi');
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CRMService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'documents'] });
      showSuccess('Döküman silindi');
    },
    onError: (error) => {
      showApiError(error,'Döküman silinemedi');
    },
  });
}

// =====================================
// CUSTOMER TAGS HOOKS (NEW)
// =====================================

export function useCustomerTags(customerId: Guid) {
  return useQuery({
    queryKey: crmKeys.customerTags(customerId),
    queryFn: () => CRMService.getCustomerTags(customerId),
    enabled: !!customerId,
  });
}

export function useAllTags() {
  return useQuery({
    queryKey: crmKeys.allTags(),
    queryFn: () => CRMService.getDistinctTags(),
  });
}

export function useAddCustomerTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, tagName, color }: {
      customerId: Guid;
      tagName: string;
      color?: string;
    }) => CRMService.addCustomerTag(customerId, tagName, color),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.customerTags(variables.customerId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.allTags() });
      showSuccess('Etiket eklendi');
    },
    onError: (error) => {
      showApiError(error,'Etiket eklenemedi');
    },
  });
}

export function useRemoveCustomerTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, customerId }: { id: Guid; customerId: Guid }) =>
      CRMService.removeCustomerTag(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.customerTags(variables.customerId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.allTags() });
      showSuccess('Etiket kaldırıldı');
    },
    onError: (error) => {
      showApiError(error,'Etiket kaldırılamadı');
    },
  });
}

// =====================================
// PIPELINES HOOKS
// =====================================

export function usePipelines() {
  return useQuery({
    queryKey: crmKeys.pipelines,
    queryFn: () => CRMService.getPipelines(),
  });
}

export function usePipelineStatistics(pipelineId: string) {
  return useQuery({
    queryKey: crmKeys.pipelineStats(pipelineId),
    queryFn: () => CRMService.getPipelineStatistics(pipelineId),
    enabled: !!pipelineId,
  });
}

// =====================================
// CAMPAIGNS HOOKS
// =====================================

export function useCampaigns() {
  return useQuery({
    queryKey: crmKeys.campaigns,
    queryFn: () => CRMService.getCampaigns(),
  });
}

export function useCampaignRoi(id: string) {
  return useQuery({
    queryKey: crmKeys.campaignRoi(id),
    queryFn: () => CRMService.getCampaignRoi(id),
    enabled: !!id,
  });
}

export function useCampaignStatistics(id: string) {
  return useQuery({
    queryKey: crmKeys.campaignStats(id),
    queryFn: () => CRMService.getCampaignStatistics(id),
    enabled: !!id,
  });
}

export function useCampaignMembers(id: string) {
  return useQuery({
    queryKey: crmKeys.campaignMembers(id),
    queryFn: () => CRMService.getCampaignMembers(id),
    enabled: !!id,
  });
}

// =====================================
// SEGMENTS HOOKS
// =====================================

export function useSegmentMembers(id: string) {
  return useQuery({
    queryKey: crmKeys.segmentMembers(id),
    queryFn: () => CRMService.getSegmentMembers(id),
    enabled: !!id,
  });
}

export function useRecalculateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CRMService.recalculateSegmentMembers(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.segmentMembers(id) });
      showSuccess('Segment yeniden hesaplandı');
    },
    onError: (error) => {
      showApiError(error,'Hesaplama başarısız');
    },
  });
}
