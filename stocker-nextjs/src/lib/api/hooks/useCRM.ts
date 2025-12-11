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
  WorkflowDto,
  CreateWorkflowCommand,
  ExecuteWorkflowCommand,
  WorkflowExecutionResponse,
  // New CRM types
  CallLogDto,
  CallLogFilters,
  CreateCallLogCommand,
  CallOutcome,
  MeetingDto,
  MeetingFilters,
  CreateMeetingCommand,
  TerritoryDto,
  TerritoryFilters,
  CreateTerritoryCommand,
  UpdateTerritoryCommand,
  SalesTeamDto,
  SalesTeamFilters,
  CreateSalesTeamCommand,
  CompetitorDto,
  CompetitorFilters,
  CreateCompetitorCommand,
  UpdateCompetitorCommand,
  LoyaltyProgramDto,
  LoyaltyProgramFilters,
  CreateLoyaltyProgramCommand,
  UpdateLoyaltyProgramCommand,
  ReferralDto,
  ReferralFilters,
  CreateReferralCommand,
} from '../services/crm.types';
import type { Activity, Lead, Deal, Customer } from '../services/crm.service';

import logger from '../../utils/logger';
// =====================================
// QUERY KEYS
// =====================================

export const crmKeys = {
  // Customers
  customers: ['crm', 'customers'] as const,
  customer: (id: string) => ['crm', 'customers', id] as const,

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

  // Workflows
  workflows: ['crm', 'workflows'] as const,
  workflow: (id: number) => ['crm', 'workflows', id] as const,

  // Call Logs
  callLogs: ['crm', 'call-logs'] as const,
  callLog: (id: Guid) => ['crm', 'call-logs', id] as const,
  callLogsByCustomer: (customerId: Guid) => ['crm', 'call-logs', 'customer', customerId] as const,

  // Meetings
  meetings: ['crm', 'meetings'] as const,
  meeting: (id: Guid) => ['crm', 'meetings', id] as const,

  // Territories
  territories: ['crm', 'territories'] as const,
  territory: (id: Guid) => ['crm', 'territories', id] as const,

  // Sales Teams
  salesTeams: ['crm', 'sales-teams'] as const,
  salesTeam: (id: Guid) => ['crm', 'sales-teams', id] as const,

  // Competitors
  competitors: ['crm', 'competitors'] as const,
  competitor: (id: Guid) => ['crm', 'competitors', id] as const,

  // Loyalty Programs
  loyaltyPrograms: ['crm', 'loyalty-programs'] as const,
  loyaltyProgram: (id: Guid) => ['crm', 'loyalty-programs', id] as const,

  // Referrals
  referrals: ['crm', 'referrals'] as const,
  referral: (id: Guid) => ['crm', 'referrals', id] as const,
};

// =====================================
// CUSTOMERS HOOKS
// =====================================

export function useCustomers(filters?: any) {
  return useQuery({
    queryKey: [...crmKeys.customers, filters],
    queryFn: () => CRMService.getCustomers(filters),
    staleTime: 30000,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: crmKeys.customer(id),
    queryFn: () => CRMService.getCustomer(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => CRMService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.customers });
      showSuccess('Müşteri oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Müşteri oluşturulamadı');
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      CRMService.updateCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.customer(variables.id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.customers });
      showSuccess('Müşteri güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Müşteri güncellenemedi');
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CRMService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.customers });
      showSuccess('Müşteri silindi');
    },
    onError: (error) => {
      showApiError(error, 'Müşteri silinemedi');
    },
  });
}

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
    queryFn: () => CRMService.getLead(id),
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
      logger.info('🎯 Hook received data', { metadata: { data } });
      logger.info('🎯 Data keys', { metadata: { keys: Object.keys(data) } });

      // Backend expects data wrapped in LeadData property (CreateLeadDto)
      // Form now uses correct field names matching backend DTO
      const leadData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        companyName: data.companyName || null,
        jobTitle: data.jobTitle || null,
        source: data.source || null,
        status: data.status || 0,  // Numeric enum: 0=New, 1=Contacted, 2=Working, 3=Qualified, 4=Unqualified, 5=Converted
        rating: 0,  // Default to Unrated (0)
        score: data.score || 0,  // Lead score (0-100)
        description: data.description || null,
      };

      logger.info('🎯 Mapped leadData', { metadata: { leadData } });

      return CRMService.createLead(leadData as any);
    },
    onSuccess: () => {
      // Force immediate refetch of leads list to show new lead
      queryClient.invalidateQueries({ queryKey: crmKeys.leads });
      queryClient.refetchQueries({ queryKey: crmKeys.leads });
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
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) =>
      CRMService.updateLead(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.lead(variables.id) });
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
    mutationFn: (id: string) => CRMService.deleteLead(Number(id)),
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
    mutationFn: ({ leadId, customerData }: { leadId: string; customerData: any }) =>
      CRMService.convertLeadToCustomer(Number(leadId), customerData),
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
      logger.error('Deal creation error:', error.response?.data);
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

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: Guid; data: any }) =>
      CRMService.updateOpportunity(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.opportunity(variables.id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.opportunities });
      showSuccess('Fırsat güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Fırsat güncellenemedi');
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: Guid) => CRMService.deleteOpportunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.opportunities });
      showSuccess('Fırsat silindi');
    },
    onError: (error) => {
      showApiError(error, 'Fırsat silinemedi');
    },
  });
}

export function useMoveOpportunityStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stageId }: { id: Guid; stageId: Guid }) =>
      CRMService.moveOpportunityStage(id, stageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.opportunity(variables.id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.opportunities });
      showSuccess('Fırsat aşaması güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Aşama değiştirilemedi');
    },
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

export function usePipeline(id: string) {
  return useQuery({
    queryKey: crmKeys.pipeline(id),
    queryFn: () => CRMService.getPipeline(id),
    enabled: !!id,
  });
}

export function usePipelineStages(pipelineId: string) {
  return useQuery({
    queryKey: crmKeys.pipelineStages(pipelineId),
    queryFn: () => CRMService.getPipelineStages(pipelineId),
    enabled: !!pipelineId,
  });
}

export function useCreatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.createPipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelines });
      showSuccess('Pipeline oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Pipeline oluşturulamadı');
    },
  });
}

export function useUpdatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      CRMService.updatePipeline(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipeline(variables.id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelines });
      showSuccess('Pipeline güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Pipeline güncellenemedi');
    },
  });
}

export function useDeletePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.deletePipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelines });
      showSuccess('Pipeline silindi');
    },
    onError: (error) => {
      showApiError(error, 'Pipeline silinemedi');
    },
  });
}

export function useActivatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.activatePipeline,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipeline(id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelines });
      showSuccess('Pipeline aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Pipeline aktifleştirilemedi');
    },
  });
}

export function useDeactivatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.deactivatePipeline,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipeline(id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelines });
      showInfo('Pipeline devre dışı bırakıldı');
    },
    onError: (error) => {
      showApiError(error, 'Pipeline devre dışı bırakılamadı');
    },
  });
}

export function useSetDefaultPipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.setDefaultPipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelines });
      showSuccess('Varsayılan pipeline ayarlandı');
    },
    onError: (error) => {
      showApiError(error, 'Varsayılan pipeline ayarlanamadı');
    },
  });
}

export function useAddPipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pipelineId, stage }: { pipelineId: string; stage: any }) =>
      CRMService.addPipelineStage(pipelineId, stage),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipeline(variables.pipelineId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStages(variables.pipelineId) });
      showSuccess('Aşama eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Aşama eklenemedi');
    },
  });
}

export function useUpdatePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pipelineId, stageId, data }: { pipelineId: string; stageId: string; data: any }) =>
      CRMService.updatePipelineStage(pipelineId, stageId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipeline(variables.pipelineId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStages(variables.pipelineId) });
      showSuccess('Aşama güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Aşama güncellenemedi');
    },
  });
}

export function useRemovePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pipelineId, stageId }: { pipelineId: string; stageId: string }) =>
      CRMService.removePipelineStage(pipelineId, stageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipeline(variables.pipelineId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStages(variables.pipelineId) });
      showSuccess('Aşama kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'Aşama kaldırılamadı');
    },
  });
}

export function useReorderPipelineStages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pipelineId, stageOrders }: { pipelineId: string; stageOrders: { stageId: string; newOrder: number }[] }) =>
      CRMService.reorderPipelineStages(pipelineId, stageOrders),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipeline(variables.pipelineId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStages(variables.pipelineId) });
      showSuccess('Aşamalar yeniden sıralandı');
    },
    onError: (error) => {
      showApiError(error, 'Sıralama başarısız');
    },
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

export function useCampaign(id: string) {
  return useQuery({
    queryKey: crmKeys.campaign(id),
    queryFn: () => CRMService.getCampaign(id),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaigns });
      showSuccess('Kampanya oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Kampanya oluşturulamadı');
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      CRMService.updateCampaign(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaign(variables.id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.campaigns });
      showSuccess('Kampanya güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Kampanya güncellenemedi');
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaigns });
      showSuccess('Kampanya silindi');
    },
    onError: (error) => {
      showApiError(error, 'Kampanya silinemedi');
    },
  });
}

export function useStartCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.startCampaign,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaign(id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.campaigns });
      showSuccess('Kampanya başlatıldı');
    },
    onError: (error) => {
      showApiError(error, 'Kampanya başlatılamadı');
    },
  });
}

export function usePauseCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.pauseCampaign,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaign(id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.campaigns });
      showInfo('Kampanya duraklatıldı');
    },
    onError: (error) => {
      showApiError(error, 'Kampanya duraklatılamadı');
    },
  });
}

export function useCompleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.completeCampaign,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaign(id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.campaigns });
      showSuccess('Kampanya tamamlandı');
    },
    onError: (error) => {
      showApiError(error, 'Kampanya tamamlanamadı');
    },
  });
}

export function useAbortCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.abortCampaign,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaign(id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.campaigns });
      showInfo('Kampanya iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Kampanya iptal edilemedi');
    },
  });
}

export function useAddCampaignMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, data }: { campaignId: string; data: any }) =>
      CRMService.addCampaignMember(campaignId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaignMembers(variables.campaignId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.campaign(variables.campaignId) });
      showSuccess('Üye eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Üye eklenemedi');
    },
  });
}

export function useRemoveCampaignMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, memberId }: { campaignId: string; memberId: string }) =>
      CRMService.removeCampaignMember(campaignId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaignMembers(variables.campaignId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.campaign(variables.campaignId) });
      showSuccess('Üye kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'Üye kaldırılamadı');
    },
  });
}

export function useBulkImportCampaignMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, data }: { campaignId: string; data: any }) =>
      CRMService.bulkImportCampaignMembers(campaignId, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaignMembers(variables.campaignId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.campaign(variables.campaignId) });
      showSuccess(`${result.successCount} üye eklendi`);
    },
    onError: (error) => {
      showApiError(error, 'Toplu import başarısız');
    },
  });
}

export function useConvertCampaignMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, memberId }: { campaignId: string; memberId: string }) =>
      CRMService.convertCampaignMember(campaignId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.campaignMembers(variables.campaignId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.campaignStats(variables.campaignId) });
      showSuccess('Üye dönüştürüldü');
    },
    onError: (error) => {
      showApiError(error, 'Dönüştürme başarısız');
    },
  });
}

// =====================================
// SEGMENTS HOOKS
// =====================================

export function useSegments() {
  return useQuery({
    queryKey: crmKeys.segments,
    queryFn: () => CRMService.getCustomerSegments(),
  });
}

export function useSegment(id: string) {
  return useQuery({
    queryKey: crmKeys.segment(id),
    queryFn: () => CRMService.getCustomerSegment(id),
    enabled: !!id,
  });
}

export function useSegmentMembers(id: string) {
  return useQuery({
    queryKey: crmKeys.segmentMembers(id),
    queryFn: () => CRMService.getSegmentMembers(id),
    enabled: !!id,
  });
}

export function useCreateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.createCustomerSegment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.segments });
      showSuccess('Segment oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Segment oluşturulamadı');
    },
  });
}

export function useUpdateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      CRMService.updateCustomerSegment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.segment(variables.id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.segments });
      showSuccess('Segment güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Segment güncellenemedi');
    },
  });
}

export function useDeleteSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.deleteCustomerSegment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.segments });
      showSuccess('Segment silindi');
    },
    onError: (error) => {
      showApiError(error, 'Segment silinemedi');
    },
  });
}

export function useActivateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.activateCustomerSegment,
    onSuccess: (result, _) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.segment(result.id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.segments });
      showSuccess('Segment aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Segment aktifleştirilemedi');
    },
  });
}

export function useDeactivateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.deactivateCustomerSegment,
    onSuccess: (result, _) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.segment(result.id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.segments });
      showInfo('Segment devre dışı bırakıldı');
    },
    onError: (error) => {
      showApiError(error, 'Segment devre dışı bırakılamadı');
    },
  });
}

export function useAddSegmentMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ segmentId, customerId }: { segmentId: string; customerId: string }) =>
      CRMService.addSegmentMember(segmentId, customerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.segmentMembers(variables.segmentId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.segment(variables.segmentId) });
      showSuccess('Üye eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Üye eklenemedi');
    },
  });
}

export function useRemoveSegmentMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ segmentId, customerId }: { segmentId: string; customerId: string }) =>
      CRMService.removeSegmentMember(segmentId, customerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.segmentMembers(variables.segmentId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.segment(variables.segmentId) });
      showSuccess('Üye kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'Üye kaldırılamadı');
    },
  });
}

export function useUpdateSegmentCriteria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ segmentId, criteria }: { segmentId: string; criteria: { field: string; operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between'; value: any }[] }) =>
      CRMService.updateSegmentCriteria(segmentId, criteria),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.segment(variables.segmentId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.segmentMembers(variables.segmentId) });
      showSuccess('Segment kriterleri güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Kriterler güncellenemedi');
    },
  });
}

export function useRecalculateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CRMService.recalculateSegmentMembers(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.segmentMembers(id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.segment(id) });
      showSuccess('Segment yeniden hesaplandı');
    },
    onError: (error) => {
      showApiError(error, 'Hesaplama başarısız');
    },
  });
}

// =====================================
// WORKFLOWS HOOKS
// =====================================

/**
 * Get all workflows
 */
export function useWorkflows() {
  return useQuery({
    queryKey: crmKeys.workflows,
    queryFn: () => CRMService.getWorkflows(),
  });
}

/**
 * Get single workflow by ID
 */
export function useWorkflow(id: number) {
  return useQuery({
    queryKey: crmKeys.workflow(id),
    queryFn: () => CRMService.getWorkflow(id),
    enabled: !!id,
  });
}

/**
 * Create workflow mutation
 */
export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.createWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.workflows });
      showSuccess('Workflow başarıyla oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Workflow oluşturulamadı');
    },
  });
}

/**
 * Update workflow mutation
 */
export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      CRMService.updateWorkflow(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.workflow(id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.workflows });
      showSuccess('Workflow güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Workflow güncellenemedi');
    },
  });
}

/**
 * Delete workflow mutation
 */
export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.deleteWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.workflows });
      showSuccess('Workflow silindi');
    },
    onError: (error) => {
      showApiError(error, 'Workflow silinemedi');
    },
  });
}

/**
 * Execute workflow mutation
 */
export function useExecuteWorkflow() {
  return useMutation({
    mutationFn: CRMService.executeWorkflow,
    onSuccess: (result) => {
      showSuccess(`Workflow çalıştırıldı: ${result.message}`);
    },
    onError: (error) => {
      showApiError(error, 'Workflow çalıştırılamadı');
    },
  });
}

/**
 * Activate workflow mutation
 */
export function useActivateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.activateWorkflow,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.workflow(id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.workflows });
      showSuccess('Workflow aktif hale getirildi');
    },
    onError: (error) => {
      showApiError(error, 'Workflow aktifleştirilemedi');
    },
  });
}

/**
 * Deactivate workflow mutation
 */
export function useDeactivateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CRMService.deactivateWorkflow,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.workflow(id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.workflows });
      showInfo('Workflow devre dışı bırakıldı');
    },
    onError: (error) => {
      showApiError(error, 'Workflow devre dışı bırakılamadı');
    },
  });
}

// =====================================
// CALL LOGS HOOKS
// =====================================

export function useCallLogs(filters?: CallLogFilters) {
  return useQuery({
    queryKey: [...crmKeys.callLogs, filters],
    queryFn: () => CRMService.getCallLogs(filters),
  });
}

export function useCallLog(id: Guid) {
  return useQuery({
    queryKey: crmKeys.callLog(id),
    queryFn: () => CRMService.getCallLog(id),
    enabled: !!id,
  });
}

export function useCallLogsByCustomer(customerId: Guid) {
  return useQuery({
    queryKey: crmKeys.callLogsByCustomer(customerId),
    queryFn: () => CRMService.getCallLogsByCustomer(customerId),
    enabled: !!customerId,
  });
}

export function useCreateCallLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCallLogCommand) => CRMService.createCallLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.callLogs });
      showSuccess('Arama kaydı oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Arama kaydı oluşturulamadı');
    },
  });
}

export function useCompleteCallLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, outcome, outcomeDescription }: { id: Guid; outcome: CallOutcome; outcomeDescription?: string }) =>
      CRMService.completeCallLog(id, outcome, outcomeDescription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.callLogs });
      showSuccess('Arama tamamlandı');
    },
    onError: (error) => {
      showApiError(error, 'Arama tamamlanamadı');
    },
  });
}

export function useSetCallLogFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, followUpDate, followUpNote }: { id: Guid; followUpDate: DateTime; followUpNote?: string }) =>
      CRMService.setCallLogFollowUp(id, followUpDate, followUpNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.callLogs });
      showSuccess('Takip tarihi ayarlandı');
    },
    onError: (error) => {
      showApiError(error, 'Takip tarihi ayarlanamadı');
    },
  });
}

export function useSetCallLogQualityScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, score, customerSatisfaction, qualityNotes }: {
      id: Guid;
      score: number;
      customerSatisfaction?: number;
      qualityNotes?: string;
    }) => CRMService.setCallLogQualityScore(id, score, customerSatisfaction, qualityNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.callLogs });
      showSuccess('Kalite puanı ayarlandı');
    },
    onError: (error) => {
      showApiError(error, 'Kalite puanı ayarlanamadı');
    },
  });
}

export function useDeleteCallLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: Guid) => CRMService.deleteCallLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.callLogs });
      showSuccess('Arama kaydı silindi');
    },
    onError: (error) => {
      showApiError(error, 'Arama kaydı silinemedi');
    },
  });
}

// =====================================
// MEETINGS HOOKS
// =====================================

export function useMeetings(filters?: MeetingFilters) {
  return useQuery({
    queryKey: [...crmKeys.meetings, filters],
    queryFn: () => CRMService.getMeetings(filters),
  });
}

export function useMeeting(id: Guid) {
  return useQuery({
    queryKey: crmKeys.meeting(id),
    queryFn: () => CRMService.getMeeting(id),
    enabled: !!id,
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMeetingCommand) => CRMService.createMeeting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.meetings });
      showSuccess('Toplantı oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Toplantı oluşturulamadı');
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: Guid) => CRMService.deleteMeeting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.meetings });
      showSuccess('Toplantı silindi');
    },
    onError: (error) => {
      showApiError(error, 'Toplantı silinemedi');
    },
  });
}

// =====================================
// TERRITORIES HOOKS
// =====================================

export function useTerritories(filters?: TerritoryFilters) {
  return useQuery({
    queryKey: [...crmKeys.territories, filters],
    queryFn: () => CRMService.getTerritories(filters),
  });
}

export function useTerritory(id: Guid) {
  return useQuery({
    queryKey: crmKeys.territory(id),
    queryFn: () => CRMService.getTerritory(id),
    enabled: !!id,
  });
}

export function useCreateTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTerritoryCommand) => CRMService.createTerritory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.territories });
      showSuccess('Bölge oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Bölge oluşturulamadı');
    },
  });
}

export function useUpdateTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: Guid; data: Omit<UpdateTerritoryCommand, 'id'> }) =>
      CRMService.updateTerritory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.territory(variables.id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.territories });
      showSuccess('Bölge güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Bölge güncellenemedi');
    },
  });
}

export function useDeleteTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: Guid) => CRMService.deleteTerritory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.territories });
      showSuccess('Bölge silindi');
    },
    onError: (error) => {
      showApiError(error, 'Bölge silinemedi');
    },
  });
}

// =====================================
// SALES TEAMS HOOKS
// =====================================

export function useSalesTeams(filters?: SalesTeamFilters) {
  return useQuery({
    queryKey: [...crmKeys.salesTeams, filters],
    queryFn: () => CRMService.getSalesTeams(filters),
  });
}

export function useSalesTeam(id: Guid) {
  return useQuery({
    queryKey: crmKeys.salesTeam(id),
    queryFn: () => CRMService.getSalesTeam(id),
    enabled: !!id,
  });
}

export function useCreateSalesTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesTeamCommand) => CRMService.createSalesTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.salesTeams });
      showSuccess('Satış ekibi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Satış ekibi oluşturulamadı');
    },
  });
}

export function useDeleteSalesTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: Guid) => CRMService.deleteSalesTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.salesTeams });
      showSuccess('Satış ekibi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Satış ekibi silinemedi');
    },
  });
}

// =====================================
// COMPETITORS HOOKS
// =====================================

export function useCompetitors(filters?: CompetitorFilters) {
  return useQuery({
    queryKey: [...crmKeys.competitors, filters],
    queryFn: () => CRMService.getCompetitors(filters),
  });
}

export function useCompetitor(id: Guid) {
  return useQuery({
    queryKey: crmKeys.competitor(id),
    queryFn: () => CRMService.getCompetitor(id),
    enabled: !!id,
  });
}

export function useCreateCompetitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompetitorCommand) => CRMService.createCompetitor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.competitors });
      showSuccess('Rakip oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Rakip oluşturulamadı');
    },
  });
}

export function useUpdateCompetitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: Guid; data: Omit<UpdateCompetitorCommand, 'id'> }) =>
      CRMService.updateCompetitor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.competitor(variables.id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.competitors });
      showSuccess('Rakip güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Rakip güncellenemedi');
    },
  });
}

export function useDeleteCompetitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: Guid) => CRMService.deleteCompetitor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.competitors });
      showSuccess('Rakip silindi');
    },
    onError: (error) => {
      showApiError(error, 'Rakip silinemedi');
    },
  });
}

// =====================================
// LOYALTY PROGRAMS HOOKS
// =====================================

export function useLoyaltyPrograms(filters?: LoyaltyProgramFilters) {
  return useQuery({
    queryKey: [...crmKeys.loyaltyPrograms, filters],
    queryFn: () => CRMService.getLoyaltyPrograms(filters),
  });
}

export function useLoyaltyProgram(id: Guid) {
  return useQuery({
    queryKey: crmKeys.loyaltyProgram(id),
    queryFn: () => CRMService.getLoyaltyProgram(id),
    enabled: !!id,
  });
}

export function useCreateLoyaltyProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLoyaltyProgramCommand) => CRMService.createLoyaltyProgram(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.loyaltyPrograms });
      showSuccess('Sadakat programı oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Sadakat programı oluşturulamadı');
    },
  });
}

export function useUpdateLoyaltyProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: Guid; data: Omit<UpdateLoyaltyProgramCommand, 'id'> }) =>
      CRMService.updateLoyaltyProgram(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.loyaltyProgram(variables.id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.loyaltyPrograms });
      showSuccess('Sadakat programı güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Sadakat programı güncellenemedi');
    },
  });
}

export function useDeleteLoyaltyProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: Guid) => CRMService.deleteLoyaltyProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.loyaltyPrograms });
      showSuccess('Sadakat programı silindi');
    },
    onError: (error) => {
      showApiError(error, 'Sadakat programı silinemedi');
    },
  });
}

// =====================================
// REFERRALS HOOKS
// =====================================

export function useReferrals(filters?: ReferralFilters) {
  return useQuery({
    queryKey: [...crmKeys.referrals, filters],
    queryFn: () => CRMService.getReferrals(filters),
  });
}

export function useReferral(id: Guid) {
  return useQuery({
    queryKey: crmKeys.referral(id),
    queryFn: () => CRMService.getReferral(id),
    enabled: !!id,
  });
}

export function useCreateReferral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReferralCommand) => CRMService.createReferral(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.referrals });
      showSuccess('Referans oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Referans oluşturulamadı');
    },
  });
}

export function useDeleteReferral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: Guid) => CRMService.deleteReferral(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.referrals });
      showSuccess('Referans silindi');
    },
    onError: (error) => {
      showApiError(error, 'Referans silinemedi');
    },
  });
}

// =====================================
// ALIASES FOR BACKWARD COMPATIBILITY
// =====================================
export { useSegments as useCustomerSegments };
export { useSegment as useCustomerSegment };
export { useDeleteSegment as useDeleteCustomerSegment };
export { useCreateSegment as useCreateCustomerSegment };
export { useUpdateSegment as useUpdateCustomerSegment };
