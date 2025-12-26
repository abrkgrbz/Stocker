// =====================================
// DISCOUNT HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { discountService } from '../services/discount.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  Discount,
  DiscountListItem,
  DiscountValidationResult,
  PagedResult,
  GetDiscountsParams,
  CreateDiscountDto,
  UpdateDiscountDto,
  ApplyDiscountDto,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated discounts
 */
export function useDiscounts(params?: GetDiscountsParams) {
  return useQuery<PagedResult<DiscountListItem>>({
    queryKey: salesKeys.discounts.list(params),
    queryFn: () => discountService.getDiscounts(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single discount by ID
 */
export function useDiscount(id: string) {
  return useQuery<Discount>({
    queryKey: salesKeys.discounts.detail(id),
    queryFn: () => discountService.getDiscountById(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch a discount by code
 */
export function useDiscountByCode(code: string) {
  return useQuery<Discount>({
    queryKey: salesKeys.discounts.byCode(code),
    queryFn: () => discountService.getDiscountByCode(code),
    ...queryOptions.detail({ enabled: !!code }),
  });
}

/**
 * Hook to fetch active discounts
 */
export function useActiveDiscounts() {
  return useQuery<DiscountListItem[]>({
    queryKey: salesKeys.discounts.active(),
    queryFn: () => discountService.getActiveDiscounts(),
    ...queryOptions.list(),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to validate a discount code
 */
export function useValidateDiscountCode() {
  return useMutation({
    mutationFn: (data: ApplyDiscountDto) => discountService.validateDiscountCode(data),
    onError: (error) => {
      showApiError(error, 'Failed to validate discount code');
    },
  });
}

/**
 * Hook to create a new discount
 */
export function useCreateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiscountDto) => discountService.createDiscount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.discounts.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.discounts.active() });
      showSuccess('Discount created successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create discount');
    },
  });
}

/**
 * Hook to update a discount
 */
export function useUpdateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDiscountDto }) =>
      discountService.updateDiscount(id, data),
    onSuccess: (updatedDiscount) => {
      queryClient.setQueryData(salesKeys.discounts.detail(updatedDiscount.id), updatedDiscount);
      queryClient.invalidateQueries({ queryKey: salesKeys.discounts.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.discounts.active() });
      showSuccess('Discount updated successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update discount');
    },
  });
}

/**
 * Hook to activate a discount
 */
export function useActivateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discountService.activateDiscount(id),
    onSuccess: (updatedDiscount) => {
      queryClient.setQueryData(salesKeys.discounts.detail(updatedDiscount.id), updatedDiscount);
      queryClient.invalidateQueries({ queryKey: salesKeys.discounts.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.discounts.active() });
      showSuccess('Discount activated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to activate discount');
    },
  });
}

/**
 * Hook to deactivate a discount
 */
export function useDeactivateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discountService.deactivateDiscount(id),
    onSuccess: (updatedDiscount) => {
      queryClient.setQueryData(salesKeys.discounts.detail(updatedDiscount.id), updatedDiscount);
      queryClient.invalidateQueries({ queryKey: salesKeys.discounts.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.discounts.active() });
      showSuccess('Discount deactivated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to deactivate discount');
    },
  });
}

/**
 * Hook to delete a discount
 */
export function useDeleteDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discountService.deleteDiscount(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: salesKeys.discounts.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.discounts.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.discounts.active() });
      showSuccess('Discount deleted successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to delete discount');
    },
  });
}
