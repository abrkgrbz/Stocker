// =====================================
// CUSTOMER SEGMENT HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { segmentService } from '../services/segment.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  CustomerSegmentDto,
  CustomerSegmentListDto,
  CreateCustomerSegmentDto,
  SetSegmentPricingDto,
  SetSegmentCreditTermsDto,
  SetSegmentServiceLevelDto,
  SetSegmentEligibilityDto,
  SetSegmentBenefitsDto,
  SetSegmentVisualDto,
  UpdateSegmentDetailsDto,
  AssignCustomerToSegmentDto,
  CustomerSegmentQueryParams,
  PagedResult,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated customer segments
 */
export function useSegments(params?: CustomerSegmentQueryParams) {
  return useQuery<PagedResult<CustomerSegmentListDto>>({
    queryKey: salesKeys.segments.list(params),
    queryFn: () => segmentService.getSegments(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single segment by ID
 */
export function useSegment(id: string) {
  return useQuery<CustomerSegmentDto>({
    queryKey: salesKeys.segments.detail(id),
    queryFn: () => segmentService.getSegment(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch segment by code
 */
export function useSegmentByCode(code: string) {
  return useQuery<CustomerSegmentDto>({
    queryKey: salesKeys.segments.byCode(code),
    queryFn: () => segmentService.getSegmentByCode(code),
    ...queryOptions.detail({ enabled: !!code }),
  });
}

/**
 * Hook to fetch active segments
 */
export function useActiveSegments() {
  return useQuery<CustomerSegmentListDto[]>({
    queryKey: salesKeys.segments.active(),
    queryFn: () => segmentService.getActiveSegments(),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch default segment
 */
export function useDefaultSegment() {
  return useQuery<CustomerSegmentDto>({
    queryKey: [...salesKeys.segments.all(), 'default'] as const,
    queryFn: () => segmentService.getDefaultSegment(),
    ...queryOptions.detail({}),
  });
}

/**
 * Hook to fetch segments by priority
 */
export function useSegmentsByPriority(priority: string) {
  return useQuery<CustomerSegmentListDto[]>({
    queryKey: [...salesKeys.segments.all(), 'priority', priority] as const,
    queryFn: () => segmentService.getSegmentsByPriority(priority),
    ...queryOptions.list({ enabled: !!priority }),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new segment
 */
export function useCreateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerSegmentDto) => segmentService.createSegment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      showSuccess('Segment başarıyla oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Segment oluşturulamadı');
    },
  });
}

/**
 * Hook to set segment pricing
 */
export function useSetSegmentPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SetSegmentPricingDto }) =>
      segmentService.setPricing(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      showSuccess('Segment fiyatlandırması güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Segment fiyatlandırması güncellenemedi');
    },
  });
}

/**
 * Hook to set segment credit terms
 */
export function useSetSegmentCreditTerms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SetSegmentCreditTermsDto }) =>
      segmentService.setCreditTerms(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      showSuccess('Segment kredi koşulları güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Segment kredi koşulları güncellenemedi');
    },
  });
}

/**
 * Hook to set segment service level
 */
export function useSetSegmentServiceLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SetSegmentServiceLevelDto }) =>
      segmentService.setServiceLevel(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      showSuccess('Segment hizmet seviyesi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Segment hizmet seviyesi güncellenemedi');
    },
  });
}

/**
 * Hook to set segment eligibility
 */
export function useSetSegmentEligibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SetSegmentEligibilityDto }) =>
      segmentService.setEligibility(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      showSuccess('Segment uygunluk kriterleri güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Segment uygunluk kriterleri güncellenemedi');
    },
  });
}

/**
 * Hook to set segment benefits
 */
export function useSetSegmentBenefits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SetSegmentBenefitsDto }) =>
      segmentService.setBenefits(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      showSuccess('Segment avantajları güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Segment avantajları güncellenemedi');
    },
  });
}

/**
 * Hook to set segment visual settings
 */
export function useSetSegmentVisual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SetSegmentVisualDto }) =>
      segmentService.setVisual(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      showSuccess('Segment görsel ayarları güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Segment görsel ayarları güncellenemedi');
    },
  });
}

/**
 * Hook to update segment details
 */
export function useUpdateSegmentDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSegmentDetailsDto }) =>
      segmentService.updateDetails(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      showSuccess('Segment detayları güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Segment detayları güncellenemedi');
    },
  });
}

/**
 * Hook to assign a customer to a segment
 */
export function useAssignCustomerToSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignCustomerToSegmentDto }) =>
      segmentService.assignCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      showSuccess('Müşteri segmente atandı');
    },
    onError: (error) => {
      showApiError(error, 'Müşteri segmente atanamadı');
    },
  });
}

/**
 * Hook to remove a customer from a segment
 */
export function useRemoveCustomerFromSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, customerId }: { id: string; customerId: string }) =>
      segmentService.removeCustomer(id, customerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      showSuccess('Müşteri segmentten çıkarıldı');
    },
    onError: (error) => {
      showApiError(error, 'Müşteri segmentten çıkarılamadı');
    },
  });
}

/**
 * Hook to set a segment as default
 */
export function useSetDefaultSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => segmentService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.all() });
      showSuccess('Varsayılan segment ayarlandı');
    },
    onError: (error) => {
      showApiError(error, 'Varsayılan segment ayarlanamadı');
    },
  });
}

// =====================================
// WORKFLOW HOOKS
// =====================================

/**
 * Hook to activate a segment
 */
export function useActivateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => segmentService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.active() });
      showSuccess('Segment aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Segment aktifleştirilemedi');
    },
  });
}

/**
 * Hook to deactivate a segment
 */
export function useDeactivateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => segmentService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.active() });
      showSuccess('Segment deaktif edildi');
    },
    onError: (error) => {
      showApiError(error, 'Segment deaktif edilemedi');
    },
  });
}

/**
 * Hook to delete a segment
 */
export function useDeleteSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => segmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.active() });
      showSuccess('Segment silindi');
    },
    onError: (error) => {
      showApiError(error, 'Segment silinemedi');
    },
  });
}

/**
 * Hook to recalculate a segment's customers
 */
export function useRecalculateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => segmentService.recalculate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      showSuccess('Segment yeniden hesaplandı');
    },
    onError: (error) => {
      showApiError(error, 'Segment yeniden hesaplanamadı');
    },
  });
}

/**
 * Hook to update a segment
 */
export function useUpdateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      segmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      showSuccess('Segment güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Segment güncellenemedi');
    },
  });
}
