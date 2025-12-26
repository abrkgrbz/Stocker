// =====================================
// ADVANCE PAYMENT HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { advancePaymentService } from '../services/advance-payment.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  AdvancePaymentDto,
  AdvancePaymentListDto,
  AdvancePaymentStatisticsDto,
  PagedResult,
  AdvancePaymentQueryParams,
  CreateAdvancePaymentCommand,
  UpdateAdvancePaymentCommand,
  ApplyAdvancePaymentCommand,
  RefundAdvancePaymentCommand,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated advance payments
 */
export function useAdvancePayments(params?: AdvancePaymentQueryParams) {
  return useQuery<PagedResult<AdvancePaymentListDto>>({
    queryKey: salesKeys.advancePayments.list(params),
    queryFn: () => advancePaymentService.getAdvancePayments(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single advance payment by ID
 */
export function useAdvancePayment(id: string) {
  return useQuery<AdvancePaymentDto>({
    queryKey: salesKeys.advancePayments.detail(id),
    queryFn: () => advancePaymentService.getAdvancePayment(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch advance payments by customer
 */
export function useAdvancePaymentsByCustomer(customerId: string) {
  return useQuery<AdvancePaymentListDto[]>({
    queryKey: salesKeys.advancePayments.byCustomer(customerId),
    queryFn: () => advancePaymentService.getAdvancePaymentsByCustomer(customerId),
    ...queryOptions.list({ enabled: !!customerId }),
  });
}

/**
 * Hook to fetch advance payment statistics
 */
export function useAdvancePaymentStatistics() {
  return useQuery<AdvancePaymentStatisticsDto>({
    queryKey: salesKeys.advancePayments.statistics(),
    queryFn: () => advancePaymentService.getAdvancePaymentStatistics(),
    ...queryOptions.realtime(),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new advance payment
 */
export function useCreateAdvancePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdvancePaymentCommand) => advancePaymentService.createAdvancePayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.advancePayments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.advancePayments.statistics() });
      showSuccess('Advance payment created successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create advance payment');
    },
  });
}

/**
 * Hook to update an advance payment
 */
export function useUpdateAdvancePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdvancePaymentCommand }) =>
      advancePaymentService.updateAdvancePayment(id, data),
    onSuccess: (updatedPayment) => {
      queryClient.setQueryData(salesKeys.advancePayments.detail(updatedPayment.id), updatedPayment);
      queryClient.invalidateQueries({ queryKey: salesKeys.advancePayments.lists() });
      showSuccess('Advance payment updated successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update advance payment');
    },
  });
}

/**
 * Hook to delete an advance payment
 */
export function useDeleteAdvancePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => advancePaymentService.deleteAdvancePayment(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: salesKeys.advancePayments.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.advancePayments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.advancePayments.statistics() });
      showSuccess('Advance payment deleted successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to delete advance payment');
    },
  });
}

// =====================================
// WORKFLOW HOOKS
// =====================================

/**
 * Hook to capture an advance payment
 */
export function useCaptureAdvancePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => advancePaymentService.captureAdvancePayment(id),
    onSuccess: (updatedPayment) => {
      queryClient.setQueryData(salesKeys.advancePayments.detail(updatedPayment.id), updatedPayment);
      queryClient.invalidateQueries({ queryKey: salesKeys.advancePayments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.advancePayments.statistics() });
      showSuccess('Advance payment captured');
    },
    onError: (error) => {
      showApiError(error, 'Failed to capture advance payment');
    },
  });
}

/**
 * Hook to apply an advance payment
 */
export function useApplyAdvancePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApplyAdvancePaymentCommand }) =>
      advancePaymentService.applyAdvancePayment(id, data),
    onSuccess: (updatedPayment) => {
      queryClient.setQueryData(salesKeys.advancePayments.detail(updatedPayment.id), updatedPayment);
      queryClient.invalidateQueries({ queryKey: salesKeys.advancePayments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.advancePayments.statistics() });
      // Also invalidate orders as payment might be applied to an order
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.lists() });
      showSuccess('Advance payment applied');
    },
    onError: (error) => {
      showApiError(error, 'Failed to apply advance payment');
    },
  });
}

/**
 * Hook to refund an advance payment
 */
export function useRefundAdvancePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RefundAdvancePaymentCommand }) =>
      advancePaymentService.refundAdvancePayment(id, data),
    onSuccess: (updatedPayment) => {
      queryClient.setQueryData(salesKeys.advancePayments.detail(updatedPayment.id), updatedPayment);
      queryClient.invalidateQueries({ queryKey: salesKeys.advancePayments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.advancePayments.statistics() });
      showSuccess('Advance payment refunded');
    },
    onError: (error) => {
      showApiError(error, 'Failed to refund advance payment');
    },
  });
}

/**
 * Hook to issue a receipt for an advance payment
 */
export function useIssueAdvancePaymentReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => advancePaymentService.issueReceipt(id),
    onSuccess: (updatedPayment) => {
      queryClient.setQueryData(salesKeys.advancePayments.detail(updatedPayment.id), updatedPayment);
      queryClient.invalidateQueries({ queryKey: salesKeys.advancePayments.lists() });
      showSuccess('Receipt issued');
    },
    onError: (error) => {
      showApiError(error, 'Failed to issue receipt');
    },
  });
}
