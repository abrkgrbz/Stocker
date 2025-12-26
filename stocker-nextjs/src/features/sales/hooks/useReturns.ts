// =====================================
// SALES RETURN HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { returnService } from '../services/return.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  SalesReturn,
  SalesReturnListItem,
  SalesReturnSummary,
  ReturnableItem,
  PagedResult,
  GetSalesReturnsParams,
  CreateSalesReturnDto,
  UpdateSalesReturnDto,
  CreateSalesReturnItemDto,
  ProcessRefundDto,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated sales returns
 */
export function useSalesReturns(params?: GetSalesReturnsParams) {
  return useQuery<PagedResult<SalesReturnListItem>>({
    queryKey: salesKeys.returns.list(params),
    queryFn: () => returnService.getSalesReturns(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single sales return by ID
 */
export function useSalesReturn(id: string) {
  return useQuery<SalesReturn>({
    queryKey: salesKeys.returns.detail(id),
    queryFn: () => returnService.getSalesReturnById(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch sales returns by order
 */
export function useSalesReturnsByOrder(orderId: string) {
  return useQuery<SalesReturnListItem[]>({
    queryKey: salesKeys.returns.byOrder(orderId),
    queryFn: () => returnService.getSalesReturnsByOrder(orderId),
    ...queryOptions.list({ enabled: !!orderId }),
  });
}

/**
 * Hook to fetch sales returns by customer
 */
export function useSalesReturnsByCustomer(customerId: string, page?: number, pageSize?: number) {
  return useQuery<PagedResult<SalesReturnListItem>>({
    queryKey: salesKeys.returns.byCustomer(customerId, page, pageSize),
    queryFn: () => returnService.getSalesReturnsByCustomer(customerId, page, pageSize),
    ...queryOptions.list({ enabled: !!customerId }),
  });
}

/**
 * Hook to fetch pending returns
 */
export function usePendingReturns() {
  return useQuery<SalesReturnListItem[]>({
    queryKey: salesKeys.returns.pending(),
    queryFn: () => returnService.getPendingReturns(),
    ...queryOptions.realtime(),
  });
}

/**
 * Hook to fetch return summary
 */
export function useReturnSummary(fromDate?: string, toDate?: string) {
  return useQuery<SalesReturnSummary>({
    queryKey: salesKeys.returns.summary(fromDate, toDate),
    queryFn: () => returnService.getReturnSummary(fromDate, toDate),
    ...queryOptions.realtime(),
  });
}

/**
 * Hook to fetch returnable items for an order
 */
export function useReturnableItems(orderId: string) {
  return useQuery<ReturnableItem[]>({
    queryKey: salesKeys.returns.returnableItems(orderId),
    queryFn: () => returnService.getReturnableItems(orderId),
    ...queryOptions.detail({ enabled: !!orderId }),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new sales return
 */
export function useCreateSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesReturnDto) => returnService.createSalesReturn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.pending() });
      showSuccess('Sales return created successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create sales return');
    },
  });
}

/**
 * Hook to update a sales return
 */
export function useUpdateSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalesReturnDto }) =>
      returnService.updateSalesReturn(id, data),
    onSuccess: (updatedReturn) => {
      queryClient.setQueryData(salesKeys.returns.detail(updatedReturn.id), updatedReturn);
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.lists() });
      showSuccess('Sales return updated successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update sales return');
    },
  });
}

/**
 * Hook to delete a sales return
 */
export function useDeleteSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => returnService.deleteSalesReturn(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: salesKeys.returns.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.pending() });
      showSuccess('Sales return deleted successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to delete sales return');
    },
  });
}

// =====================================
// ITEM MANAGEMENT HOOKS
// =====================================

/**
 * Hook to add an item to a sales return
 */
export function useAddSalesReturnItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ returnId, item }: { returnId: string; item: CreateSalesReturnItemDto }) =>
      returnService.addSalesReturnItem(returnId, item),
    onSuccess: (updatedReturn) => {
      queryClient.setQueryData(salesKeys.returns.detail(updatedReturn.id), updatedReturn);
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.lists() });
      showSuccess('Item added to return');
    },
    onError: (error) => {
      showApiError(error, 'Failed to add item');
    },
  });
}

/**
 * Hook to remove an item from a sales return
 */
export function useRemoveSalesReturnItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ returnId, itemId }: { returnId: string; itemId: string }) =>
      returnService.removeSalesReturnItem(returnId, itemId),
    onSuccess: (updatedReturn) => {
      queryClient.setQueryData(salesKeys.returns.detail(updatedReturn.id), updatedReturn);
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.lists() });
      showSuccess('Item removed from return');
    },
    onError: (error) => {
      showApiError(error, 'Failed to remove item');
    },
  });
}

// =====================================
// WORKFLOW HOOKS
// =====================================

/**
 * Hook to submit a sales return
 */
export function useSubmitSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => returnService.submitSalesReturn(id),
    onSuccess: (updatedReturn) => {
      queryClient.setQueryData(salesKeys.returns.detail(updatedReturn.id), updatedReturn);
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.pending() });
      showSuccess('Sales return submitted');
    },
    onError: (error) => {
      showApiError(error, 'Failed to submit sales return');
    },
  });
}

/**
 * Hook to approve a sales return
 */
export function useApproveSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => returnService.approveSalesReturn(id),
    onSuccess: (updatedReturn) => {
      queryClient.setQueryData(salesKeys.returns.detail(updatedReturn.id), updatedReturn);
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.pending() });
      showSuccess('Sales return approved');
    },
    onError: (error) => {
      showApiError(error, 'Failed to approve sales return');
    },
  });
}

/**
 * Hook to reject a sales return
 */
export function useRejectSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      returnService.rejectSalesReturn(id, reason),
    onSuccess: (updatedReturn) => {
      queryClient.setQueryData(salesKeys.returns.detail(updatedReturn.id), updatedReturn);
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.pending() });
      showSuccess('Sales return rejected');
    },
    onError: (error) => {
      showApiError(error, 'Failed to reject sales return');
    },
  });
}

/**
 * Hook to receive a sales return
 */
export function useReceiveSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => returnService.receiveSalesReturn(id),
    onSuccess: (updatedReturn) => {
      queryClient.setQueryData(salesKeys.returns.detail(updatedReturn.id), updatedReturn);
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.lists() });
      showSuccess('Sales return received');
    },
    onError: (error) => {
      showApiError(error, 'Failed to receive sales return');
    },
  });
}

/**
 * Hook to process refund for a sales return
 */
export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProcessRefundDto }) =>
      returnService.processRefund(id, data),
    onSuccess: (updatedReturn) => {
      queryClient.setQueryData(salesKeys.returns.detail(updatedReturn.id), updatedReturn);
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.lists() });
      showSuccess('Refund processed');
    },
    onError: (error) => {
      showApiError(error, 'Failed to process refund');
    },
  });
}

/**
 * Hook to complete a sales return
 */
export function useCompleteSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => returnService.completeSalesReturn(id),
    onSuccess: (updatedReturn) => {
      queryClient.setQueryData(salesKeys.returns.detail(updatedReturn.id), updatedReturn);
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.all() });
      showSuccess('Sales return completed');
    },
    onError: (error) => {
      showApiError(error, 'Failed to complete sales return');
    },
  });
}

/**
 * Hook to cancel a sales return
 */
export function useCancelSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      returnService.cancelSalesReturn(id, reason),
    onSuccess: (updatedReturn) => {
      queryClient.setQueryData(salesKeys.returns.detail(updatedReturn.id), updatedReturn);
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.pending() });
      showSuccess('Sales return cancelled');
    },
    onError: (error) => {
      showApiError(error, 'Failed to cancel sales return');
    },
  });
}

/**
 * Hook to mark item as restocked
 */
export function useMarkItemAsRestocked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ returnId, itemId }: { returnId: string; itemId: string }) =>
      returnService.markItemAsRestocked(returnId, itemId),
    onSuccess: (updatedReturn) => {
      queryClient.setQueryData(salesKeys.returns.detail(updatedReturn.id), updatedReturn);
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.lists() });
      showSuccess('Item marked as restocked');
    },
    onError: (error) => {
      showApiError(error, 'Failed to mark item as restocked');
    },
  });
}

/**
 * Hook to mark entire return as restocked
 */
export function useMarkReturnAsRestocked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => returnService.markReturnAsRestocked(id),
    onSuccess: (updatedReturn) => {
      queryClient.setQueryData(salesKeys.returns.detail(updatedReturn.id), updatedReturn);
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.lists() });
      showSuccess('Return marked as restocked');
    },
    onError: (error) => {
      showApiError(error, 'Failed to mark return as restocked');
    },
  });
}
