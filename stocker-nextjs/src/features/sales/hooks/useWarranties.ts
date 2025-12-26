// =====================================
// WARRANTY HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { warrantyService } from '../services/warranty.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  WarrantyDto,
  WarrantyListDto,
  WarrantyStatisticsDto,
  PagedResult,
  WarrantyQueryParams,
  CreateWarrantyCommand,
  UpdateWarrantyCommand,
  ExtendWarrantyCommand,
  CreateWarrantyClaimCommand,
  ApproveWarrantyClaimCommand,
  ResolveWarrantyClaimCommand,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated warranties
 */
export function useWarranties(params?: WarrantyQueryParams) {
  return useQuery<PagedResult<WarrantyListDto>>({
    queryKey: salesKeys.warranties.list(params),
    queryFn: () => warrantyService.getWarranties(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single warranty by ID
 */
export function useWarranty(id: string) {
  return useQuery<WarrantyDto>({
    queryKey: salesKeys.warranties.detail(id),
    queryFn: () => warrantyService.getWarranty(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch a warranty by number
 */
export function useWarrantyByNumber(warrantyNumber: string) {
  return useQuery<WarrantyDto>({
    queryKey: salesKeys.warranties.byNumber(warrantyNumber),
    queryFn: () => warrantyService.getWarrantyByNumber(warrantyNumber),
    ...queryOptions.detail({ enabled: !!warrantyNumber }),
  });
}

/**
 * Hook to fetch warranties by customer
 */
export function useWarrantiesByCustomer(customerId: string) {
  return useQuery<WarrantyListDto[]>({
    queryKey: salesKeys.warranties.byCustomer(customerId),
    queryFn: () => warrantyService.getWarrantiesByCustomer(customerId),
    ...queryOptions.list({ enabled: !!customerId }),
  });
}

/**
 * Hook to fetch warranties by product
 */
export function useWarrantiesByProduct(productId: string) {
  return useQuery<WarrantyListDto[]>({
    queryKey: salesKeys.warranties.byProduct(productId),
    queryFn: () => warrantyService.getWarrantiesByProduct(productId),
    ...queryOptions.list({ enabled: !!productId }),
  });
}

/**
 * Hook to fetch warranty by serial number
 */
export function useWarrantyBySerial(serialNumber: string) {
  return useQuery<WarrantyDto>({
    queryKey: salesKeys.warranties.bySerial(serialNumber),
    queryFn: () => warrantyService.getWarrantyBySerial(serialNumber),
    ...queryOptions.detail({ enabled: !!serialNumber }),
  });
}

/**
 * Hook to fetch warranty statistics
 */
export function useWarrantyStatistics() {
  return useQuery<WarrantyStatisticsDto>({
    queryKey: salesKeys.warranties.statistics(),
    queryFn: () => warrantyService.getWarrantyStatistics(),
    ...queryOptions.realtime(),
  });
}

/**
 * Hook to lookup warranty by serial (returns null if not found)
 */
export function useWarrantyLookup(serialNumber: string) {
  return useQuery<WarrantyDto | null>({
    queryKey: salesKeys.warranties.lookup(serialNumber),
    queryFn: () => warrantyService.lookupWarranty(serialNumber),
    ...queryOptions.detail({ enabled: !!serialNumber }),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new warranty
 */
export function useCreateWarranty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWarrantyCommand) => warrantyService.createWarranty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.statistics() });
      showSuccess('Warranty created successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create warranty');
    },
  });
}

/**
 * Hook to update a warranty
 */
export function useUpdateWarranty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWarrantyCommand }) =>
      warrantyService.updateWarranty(id, data),
    onSuccess: (updatedWarranty) => {
      queryClient.setQueryData(salesKeys.warranties.detail(updatedWarranty.id), updatedWarranty);
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.lists() });
      showSuccess('Warranty updated successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update warranty');
    },
  });
}

/**
 * Hook to delete a warranty
 */
export function useDeleteWarranty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => warrantyService.deleteWarranty(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: salesKeys.warranties.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.statistics() });
      showSuccess('Warranty deleted successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to delete warranty');
    },
  });
}

// =====================================
// WORKFLOW HOOKS
// =====================================

/**
 * Hook to activate a warranty
 */
export function useActivateWarranty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => warrantyService.activateWarranty(id),
    onSuccess: (updatedWarranty) => {
      queryClient.setQueryData(salesKeys.warranties.detail(updatedWarranty.id), updatedWarranty);
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.statistics() });
      showSuccess('Warranty activated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to activate warranty');
    },
  });
}

/**
 * Hook to extend a warranty
 */
export function useExtendWarranty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExtendWarrantyCommand }) =>
      warrantyService.extendWarranty(id, data),
    onSuccess: (updatedWarranty) => {
      queryClient.setQueryData(salesKeys.warranties.detail(updatedWarranty.id), updatedWarranty);
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.lists() });
      showSuccess('Warranty extended');
    },
    onError: (error) => {
      showApiError(error, 'Failed to extend warranty');
    },
  });
}

/**
 * Hook to void a warranty
 */
export function useVoidWarranty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      warrantyService.voidWarranty(id, reason),
    onSuccess: (updatedWarranty) => {
      queryClient.setQueryData(salesKeys.warranties.detail(updatedWarranty.id), updatedWarranty);
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.statistics() });
      showSuccess('Warranty voided');
    },
    onError: (error) => {
      showApiError(error, 'Failed to void warranty');
    },
  });
}

/**
 * Hook to register a warranty
 */
export function useRegisterWarranty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => warrantyService.registerWarranty(id),
    onSuccess: (updatedWarranty) => {
      queryClient.setQueryData(salesKeys.warranties.detail(updatedWarranty.id), updatedWarranty);
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.lists() });
      showSuccess('Warranty registered');
    },
    onError: (error) => {
      showApiError(error, 'Failed to register warranty');
    },
  });
}

// =====================================
// WARRANTY CLAIM HOOKS
// =====================================

/**
 * Hook to create a warranty claim
 */
export function useCreateWarrantyClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateWarrantyClaimCommand }) =>
      warrantyService.createWarrantyClaim(id, data),
    onSuccess: (updatedWarranty) => {
      queryClient.setQueryData(salesKeys.warranties.detail(updatedWarranty.id), updatedWarranty);
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.statistics() });
      showSuccess('Warranty claim created');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create warranty claim');
    },
  });
}

/**
 * Hook to approve a warranty claim
 */
export function useApproveWarrantyClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, claimId, data }: { id: string; claimId: string; data: ApproveWarrantyClaimCommand }) =>
      warrantyService.approveWarrantyClaim(id, claimId, data),
    onSuccess: (updatedWarranty) => {
      queryClient.setQueryData(salesKeys.warranties.detail(updatedWarranty.id), updatedWarranty);
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.lists() });
      showSuccess('Warranty claim approved');
    },
    onError: (error) => {
      showApiError(error, 'Failed to approve warranty claim');
    },
  });
}

/**
 * Hook to reject a warranty claim
 */
export function useRejectWarrantyClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, claimId, reason }: { id: string; claimId: string; reason: string }) =>
      warrantyService.rejectWarrantyClaim(id, claimId, reason),
    onSuccess: (updatedWarranty) => {
      queryClient.setQueryData(salesKeys.warranties.detail(updatedWarranty.id), updatedWarranty);
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.lists() });
      showSuccess('Warranty claim rejected');
    },
    onError: (error) => {
      showApiError(error, 'Failed to reject warranty claim');
    },
  });
}

/**
 * Hook to resolve a warranty claim
 */
export function useResolveWarrantyClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, claimId, data }: { id: string; claimId: string; data: ResolveWarrantyClaimCommand }) =>
      warrantyService.resolveWarrantyClaim(id, claimId, data),
    onSuccess: (updatedWarranty) => {
      queryClient.setQueryData(salesKeys.warranties.detail(updatedWarranty.id), updatedWarranty);
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.warranties.statistics() });
      showSuccess('Warranty claim resolved');
    },
    onError: (error) => {
      showApiError(error, 'Failed to resolve warranty claim');
    },
  });
}
