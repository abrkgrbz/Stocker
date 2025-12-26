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
  CustomerSegmentStatisticsDto,
  PagedResult,
  CustomerSegmentQueryParams,
  CreateCustomerSegmentCommand,
  UpdateCustomerSegmentCommand,
  AssignCustomersToSegmentCommand,
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
 * Hook to fetch segment statistics
 */
export function useSegmentStatistics() {
  return useQuery<CustomerSegmentStatisticsDto>({
    queryKey: salesKeys.segments.statistics(),
    queryFn: () => segmentService.getSegmentStatistics(),
    ...queryOptions.realtime(),
  });
}

/**
 * Hook to fetch customers in a segment
 */
export function useSegmentCustomers(id: string) {
  return useQuery<string[]>({
    queryKey: salesKeys.segments.customers(id),
    queryFn: () => segmentService.getSegmentCustomers(id),
    ...queryOptions.list({ enabled: !!id }),
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
    mutationFn: (data: CreateCustomerSegmentCommand) => segmentService.createSegment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.statistics() });
      showSuccess('Segment created successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create segment');
    },
  });
}

/**
 * Hook to update a segment
 */
export function useUpdateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerSegmentCommand }) =>
      segmentService.updateSegment(id, data),
    onSuccess: (updatedSegment) => {
      queryClient.setQueryData(salesKeys.segments.detail(updatedSegment.id), updatedSegment);
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      showSuccess('Segment updated successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update segment');
    },
  });
}

/**
 * Hook to delete a segment
 */
export function useDeleteSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => segmentService.deleteSegment(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: salesKeys.segments.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.statistics() });
      showSuccess('Segment deleted successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to delete segment');
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
    mutationFn: (id: string) => segmentService.activateSegment(id),
    onSuccess: (updatedSegment) => {
      queryClient.setQueryData(salesKeys.segments.detail(updatedSegment.id), updatedSegment);
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.active() });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.statistics() });
      showSuccess('Segment activated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to activate segment');
    },
  });
}

/**
 * Hook to deactivate a segment
 */
export function useDeactivateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => segmentService.deactivateSegment(id),
    onSuccess: (updatedSegment) => {
      queryClient.setQueryData(salesKeys.segments.detail(updatedSegment.id), updatedSegment);
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.active() });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.statistics() });
      showSuccess('Segment deactivated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to deactivate segment');
    },
  });
}

/**
 * Hook to assign customers to a segment
 */
export function useAssignCustomersToSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignCustomersToSegmentCommand }) =>
      segmentService.assignCustomers(id, data),
    onSuccess: (updatedSegment) => {
      queryClient.setQueryData(salesKeys.segments.detail(updatedSegment.id), updatedSegment);
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.customers(updatedSegment.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.statistics() });
      showSuccess('Customers assigned to segment');
    },
    onError: (error) => {
      showApiError(error, 'Failed to assign customers');
    },
  });
}

/**
 * Hook to remove customer from a segment
 */
export function useRemoveCustomerFromSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, customerId }: { id: string; customerId: string }) =>
      segmentService.removeCustomer(id, customerId),
    onSuccess: (updatedSegment) => {
      queryClient.setQueryData(salesKeys.segments.detail(updatedSegment.id), updatedSegment);
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.customers(updatedSegment.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      showSuccess('Customer removed from segment');
    },
    onError: (error) => {
      showApiError(error, 'Failed to remove customer');
    },
  });
}

/**
 * Hook to recalculate segment membership
 */
export function useRecalculateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => segmentService.recalculateSegment(id),
    onSuccess: (updatedSegment) => {
      queryClient.setQueryData(salesKeys.segments.detail(updatedSegment.id), updatedSegment);
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.customers(updatedSegment.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.segments.statistics() });
      showSuccess('Segment recalculated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to recalculate segment');
    },
  });
}
