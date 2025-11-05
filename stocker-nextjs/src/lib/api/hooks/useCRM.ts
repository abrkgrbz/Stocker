/**
 * React Query Hooks for CRM Module
 * Comprehensive hooks for all 116 CRM endpoints with optimistic updates and cache management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { CRMService } from '../services/crm.service';
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
  documents: (entityId: number, entityType: string) => ['crm', 'documents', entityType, entityId] as const,
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
      message.success('Aktivite başarıyla oluşturuldu');
    },
    onError: () => {
      message.error('Aktivite oluşturulamadı');
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
      message.success('Aktivite güncellendi');
    },
    onError: () => {
      message.error('Aktivite güncellenemedi');
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
      message.success('Aktivite tamamlandı');
    },
    onError: () => {
      message.error('Aktivite tamamlanamadı');
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
      message.success('Aktivite iptal edildi');
    },
    onError: () => {
      message.error('Aktivite iptal edilemedi');
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
      message.success('Aktivite yeniden planlandı');
    },
    onError: () => {
      message.error('Aktivite yeniden planlanamadı');
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CRMService.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.activities });
      message.success('Aktivite silindi');
    },
    onError: () => {
      message.error('Aktivite silinemedi');
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
    mutationFn: (data: any) => CRMService.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads });
      message.success('Lead oluşturuldu');
    },
    onError: () => {
      message.error('Lead oluşturulamadı');
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
      message.success('Lead güncellendi');
    },
    onError: () => {
      message.error('Lead güncellenemedi');
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CRMService.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads });
      message.success('Lead silindi');
    },
    onError: () => {
      message.error('Lead silinemedi');
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
      message.success('Lead nitelikli olarak işaretlendi');
    },
    onError: () => {
      message.error('Lead niteliklendirilemedi');
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
      message.success('Lead niteliksiz olarak işaretlendi');
    },
    onError: () => {
      message.error('İşlem başarısız');
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
      message.success('Lead atandı');
    },
    onError: () => {
      message.error('Lead atanamadı');
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
      message.success('Lead skoru güncellendi');
    },
    onError: () => {
      message.error('Skor güncellenemedi');
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
      message.success('Lead müşteriye dönüştürüldü');
    },
    onError: () => {
      message.error('Dönüştürme başarısız');
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
    queryFn: () => CRMService.getDeal(Number(id)),
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
      message.success('Ürün eklendi');
    },
    onError: () => {
      message.error('Ürün eklenemedi');
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
      message.success('Ürün kaldırıldı');
    },
    onError: () => {
      message.error('Ürün kaldırılamadı');
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
    onSuccess: () => {
      // Invalidate all deal queries (including those with filters)
      queryClient.invalidateQueries({ queryKey: ['crm', 'deals'] });
      // Don't show message here - let the calling component handle it
    },
    onError: (error: any) => {
      console.error('Deal creation error:', error);
      // Don't show message here - let the calling component handle it
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Deal> }) =>
      CRMService.updateDeal(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.deal(variables.id.toString()) });
      queryClient.invalidateQueries({ queryKey: crmKeys.deals });
      message.success('Fırsat güncellendi');
    },
    onError: () => {
      message.error('Fırsat güncellenemedi');
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CRMService.deleteDeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.deals });
      message.success('Fırsat silindi');
    },
    onError: () => {
      message.error('Fırsat silinemedi');
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
      message.success('Deal aşamaya taşındı');
    },
    onError: () => {
      message.error('Taşıma başarısız');
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
      message.success('🎉 Deal kazanıldı!');
    },
    onError: () => {
      message.error('İşlem başarısız');
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
      message.info('Deal kaybedildi olarak işaretlendi');
    },
    onError: () => {
      message.error('İşlem başarısız');
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
      queryClient.invalidateQueries({ queryKey: crmKeys.opportunities });
      message.success('Fırsat oluşturuldu');
    },
    onError: () => {
      message.error('Fırsat oluşturulamadı');
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
      queryClient.invalidateQueries({ queryKey: crmKeys.opportunities });
      message.success('🎉 Fırsat kazanıldı!');
    },
    onError: () => {
      message.error('İşlem başarısız');
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
      message.success('Ürün eklendi');
    },
    onError: () => {
      message.error('Ürün eklenemedi');
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
      message.success('Ürün kaldırıldı');
    },
    onError: () => {
      message.error('Ürün kaldırılamadı');
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
      queryClient.invalidateQueries({ queryKey: crmKeys.opportunities });
      message.info('Fırsat kaybedildi olarak işaretlendi');
    },
    onError: () => {
      message.error('İşlem başarısız');
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

export function useDocumentsByEntity(entityId: number, entityType: string) {
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
      entityId: number;
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
      message.success('Döküman yüklendi');
    },
    onError: () => {
      message.error('Döküman yüklenemedi');
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
      message.success('Döküman indirildi');
    },
    onError: () => {
      message.error('Döküman indirilemedi');
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
      message.success('Döküman güncellendi');
    },
    onError: () => {
      message.error('Döküman güncellenemedi');
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CRMService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'documents'] });
      message.success('Döküman silindi');
    },
    onError: () => {
      message.error('Döküman silinemedi');
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
      message.success('Etiket eklendi');
    },
    onError: () => {
      message.error('Etiket eklenemedi');
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
      message.success('Etiket kaldırıldı');
    },
    onError: () => {
      message.error('Etiket kaldırılamadı');
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
      message.success('Segment yeniden hesaplandı');
    },
    onError: () => {
      message.error('Hesaplama başarısız');
    },
  });
}
