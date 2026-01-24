// =====================================
// OPPORTUNITY HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { opportunityService } from '../services/opportunity.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  OpportunityDto,
  OpportunityListDto,
  CreateOpportunityDto,
  OpportunityQueryParams,
  PagedResult,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated opportunities
 */
export function useOpportunities(params?: OpportunityQueryParams) {
  return useQuery<PagedResult<OpportunityListDto>>({
    queryKey: salesKeys.opportunities.list(params),
    queryFn: () => opportunityService.getOpportunities(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single opportunity by ID
 */
export function useOpportunity(id: string) {
  return useQuery<OpportunityDto>({
    queryKey: salesKeys.opportunities.detail(id),
    queryFn: () => opportunityService.getOpportunity(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch opportunities by pipeline
 */
export function useOpportunitiesByPipeline(pipelineId: string) {
  return useQuery<OpportunityListDto[]>({
    queryKey: salesKeys.opportunities.byPipeline(pipelineId),
    queryFn: () => opportunityService.getByPipeline(pipelineId),
    ...queryOptions.list({ enabled: !!pipelineId }),
  });
}

/**
 * Hook to fetch opportunities by customer
 */
export function useOpportunitiesByCustomer(customerId: string) {
  return useQuery<OpportunityListDto[]>({
    queryKey: salesKeys.opportunities.byCustomer(customerId),
    queryFn: () => opportunityService.getByCustomer(customerId),
    ...queryOptions.list({ enabled: !!customerId }),
  });
}

/**
 * Hook to fetch active opportunities
 */
export function useActiveOpportunities() {
  return useQuery<OpportunityListDto[]>({
    queryKey: [...salesKeys.opportunities.all(), 'active'] as const,
    queryFn: () => opportunityService.getActive(),
    ...queryOptions.list(),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new opportunity
 */
export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOpportunityDto) => opportunityService.createOpportunity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.opportunities.lists() });
      showSuccess('Fırsat başarıyla oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Fırsat oluşturulamadı');
    },
  });
}

/**
 * Hook to update opportunity stage
 */
export function useUpdateOpportunityStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      opportunityService.updateStage(id, stage),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.opportunities.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.opportunities.lists() });
      showSuccess('Fırsat aşaması güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Fırsat aşaması güncellenemedi');
    },
  });
}

/**
 * Hook to update opportunity value
 */
export function useUpdateOpportunityValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estimatedValue, currency }: { id: string; estimatedValue: number; currency?: string }) =>
      opportunityService.updateValue(id, estimatedValue, currency),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.opportunities.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.opportunities.lists() });
      showSuccess('Fırsat değeri güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Fırsat değeri güncellenemedi');
    },
  });
}

// =====================================
// WORKFLOW HOOKS
// =====================================

/**
 * Hook to mark opportunity as won
 */
export function useMarkOpportunityAsWon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { salesOrderId?: string; salesOrderNumber?: string } }) =>
      opportunityService.markWon(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.opportunities.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.opportunities.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.opportunities.won() });
      showSuccess('Fırsat kazanıldı olarak işaretlendi');
    },
    onError: (error) => {
      showApiError(error, 'Fırsat kazanıldı olarak işaretlenemedi');
    },
  });
}

/**
 * Hook to mark opportunity as lost
 */
export function useMarkOpportunityAsLost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason, lostToCompetitor }: { id: string; reason: string; lostToCompetitor?: string }) =>
      opportunityService.markLost(id, reason, lostToCompetitor),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.opportunities.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.opportunities.lists() });
      showSuccess('Fırsat kaybedildi olarak işaretlendi');
    },
    onError: (error) => {
      showApiError(error, 'Fırsat kaybedildi olarak işaretlenemedi');
    },
  });
}

/**
 * Hook to assign opportunity to a sales person
 */
export function useAssignOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, salesPersonId, salesPersonName }: { id: string; salesPersonId: string; salesPersonName?: string }) =>
      opportunityService.assign(id, salesPersonId, salesPersonName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.opportunities.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.opportunities.lists() });
      showSuccess('Fırsat satış temsilcisine atandı');
    },
    onError: (error) => {
      showApiError(error, 'Fırsat satış temsilcisine atanamadı');
    },
  });
}

/**
 * Hook to link a quotation to an opportunity
 */
export function useLinkQuotationToOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quotationId, quotationNumber }: { id: string; quotationId: string; quotationNumber: string }) =>
      opportunityService.linkQuotation(id, quotationId, quotationNumber),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.opportunities.detail(variables.id) });
      showSuccess('Teklif fırsata bağlandı');
    },
    onError: (error) => {
      showApiError(error, 'Teklif fırsata bağlanamadı');
    },
  });
}

/**
 * Hook to move opportunity to a pipeline stage
 */
export function useMoveOpportunityToPipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, pipelineId, stageId }: { id: string; pipelineId: string; stageId: string }) =>
      opportunityService.moveToPipelineStage(id, pipelineId, stageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.opportunities.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.opportunities.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.opportunities.byPipeline(variables.pipelineId) });
      showSuccess('Fırsat pipeline aşamasına taşındı');
    },
    onError: (error) => {
      showApiError(error, 'Fırsat pipeline aşamasına taşınamadı');
    },
  });
}
