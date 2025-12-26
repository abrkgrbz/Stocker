// =====================================
// QUOTATION HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quotationService } from '../services/quotation.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showError, showApiError } from '@/lib/utils/notifications';
import type {
  Quotation,
  QuotationListItem,
  QuotationStatistics,
  PagedResult,
  GetQuotationsParams,
  CreateQuotationDto,
  UpdateQuotationDto,
  CreateQuotationItemDto,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated quotations
 */
export function useQuotations(params?: GetQuotationsParams) {
  return useQuery<PagedResult<QuotationListItem>>({
    queryKey: salesKeys.quotations.list(params),
    queryFn: () => quotationService.getQuotations(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single quotation by ID
 */
export function useQuotation(id: string) {
  return useQuery<Quotation>({
    queryKey: salesKeys.quotations.detail(id),
    queryFn: () => quotationService.getQuotationById(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch quotations by customer
 */
export function useQuotationsByCustomer(customerId: string, page?: number, pageSize?: number) {
  return useQuery<PagedResult<QuotationListItem>>({
    queryKey: salesKeys.quotations.byCustomer(customerId, page, pageSize),
    queryFn: () => quotationService.getQuotationsByCustomer(customerId, page, pageSize),
    ...queryOptions.list({ enabled: !!customerId }),
  });
}

/**
 * Hook to fetch quotations by sales person
 */
export function useQuotationsBySalesPerson(salesPersonId: string, page?: number, pageSize?: number) {
  return useQuery<PagedResult<QuotationListItem>>({
    queryKey: salesKeys.quotations.bySalesPerson(salesPersonId, page, pageSize),
    queryFn: () => quotationService.getQuotationsBySalesPerson(salesPersonId, page, pageSize),
    ...queryOptions.list({ enabled: !!salesPersonId }),
  });
}

/**
 * Hook to fetch expiring quotations
 */
export function useExpiringQuotations(daysUntilExpiry?: number) {
  return useQuery<QuotationListItem[]>({
    queryKey: salesKeys.quotations.expiring(daysUntilExpiry),
    queryFn: () => quotationService.getExpiringQuotations(daysUntilExpiry),
    ...queryOptions.realtime(),
  });
}

/**
 * Hook to fetch quotation revisions
 */
export function useQuotationRevisions(id: string) {
  return useQuery<QuotationListItem[]>({
    queryKey: salesKeys.quotations.revisions(id),
    queryFn: () => quotationService.getQuotationRevisions(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch quotation statistics
 */
export function useQuotationStatistics(fromDate?: string, toDate?: string) {
  return useQuery<QuotationStatistics>({
    queryKey: salesKeys.quotations.statistics(fromDate, toDate),
    queryFn: () => quotationService.getQuotationStatistics(fromDate, toDate),
    ...queryOptions.realtime(),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new quotation
 */
export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuotationDto) => quotationService.createQuotation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.all() });
      showSuccess('Quotation created successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create quotation');
    },
  });
}

/**
 * Hook to update a quotation
 */
export function useUpdateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuotationDto }) =>
      quotationService.updateQuotation(id, data),
    onSuccess: (updatedQuotation) => {
      queryClient.setQueryData(salesKeys.quotations.detail(updatedQuotation.id), updatedQuotation);
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.lists() });
      showSuccess('Quotation updated successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update quotation');
    },
  });
}

/**
 * Hook to delete a quotation
 */
export function useDeleteQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationService.deleteQuotation(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: salesKeys.quotations.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.all() });
      showSuccess('Quotation deleted successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to delete quotation');
    },
  });
}

// =====================================
// ITEM MANAGEMENT HOOKS
// =====================================

/**
 * Hook to add an item to a quotation
 */
export function useAddQuotationItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quotationId, item }: { quotationId: string; item: CreateQuotationItemDto }) =>
      quotationService.addQuotationItem(quotationId, item),
    onSuccess: (updatedQuotation) => {
      queryClient.setQueryData(salesKeys.quotations.detail(updatedQuotation.id), updatedQuotation);
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.lists() });
      showSuccess('Item added to quotation');
    },
    onError: (error) => {
      showApiError(error, 'Failed to add item');
    },
  });
}

/**
 * Hook to remove an item from a quotation
 */
export function useRemoveQuotationItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quotationId, itemId }: { quotationId: string; itemId: string }) =>
      quotationService.removeQuotationItem(quotationId, itemId),
    onSuccess: (updatedQuotation) => {
      queryClient.setQueryData(salesKeys.quotations.detail(updatedQuotation.id), updatedQuotation);
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.lists() });
      showSuccess('Item removed from quotation');
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
 * Hook to submit quotation for approval
 */
export function useSubmitQuotationForApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationService.submitQuotationForApproval(id),
    onSuccess: (updatedQuotation) => {
      queryClient.setQueryData(salesKeys.quotations.detail(updatedQuotation.id), updatedQuotation);
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.lists() });
      showSuccess('Quotation submitted for approval');
    },
    onError: (error) => {
      showApiError(error, 'Failed to submit quotation');
    },
  });
}

/**
 * Hook to approve a quotation
 */
export function useApproveQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationService.approveQuotation(id),
    onSuccess: (updatedQuotation) => {
      queryClient.setQueryData(salesKeys.quotations.detail(updatedQuotation.id), updatedQuotation);
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.lists() });
      showSuccess('Quotation approved');
    },
    onError: (error) => {
      showApiError(error, 'Failed to approve quotation');
    },
  });
}

/**
 * Hook to send a quotation
 */
export function useSendQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationService.sendQuotation(id),
    onSuccess: (updatedQuotation) => {
      queryClient.setQueryData(salesKeys.quotations.detail(updatedQuotation.id), updatedQuotation);
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.lists() });
      showSuccess('Quotation sent');
    },
    onError: (error) => {
      showApiError(error, 'Failed to send quotation');
    },
  });
}

/**
 * Hook to accept a quotation
 */
export function useAcceptQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationService.acceptQuotation(id),
    onSuccess: (updatedQuotation) => {
      queryClient.setQueryData(salesKeys.quotations.detail(updatedQuotation.id), updatedQuotation);
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.all() });
      showSuccess('Quotation accepted');
    },
    onError: (error) => {
      showApiError(error, 'Failed to accept quotation');
    },
  });
}

/**
 * Hook to reject a quotation
 */
export function useRejectQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      quotationService.rejectQuotation(id, reason),
    onSuccess: (updatedQuotation) => {
      queryClient.setQueryData(salesKeys.quotations.detail(updatedQuotation.id), updatedQuotation);
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.lists() });
      showSuccess('Quotation rejected');
    },
    onError: (error) => {
      showApiError(error, 'Failed to reject quotation');
    },
  });
}

/**
 * Hook to cancel a quotation
 */
export function useCancelQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      quotationService.cancelQuotation(id, reason),
    onSuccess: (updatedQuotation) => {
      queryClient.setQueryData(salesKeys.quotations.detail(updatedQuotation.id), updatedQuotation);
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.all() });
      showSuccess('Quotation cancelled');
    },
    onError: (error) => {
      showApiError(error, 'Failed to cancel quotation');
    },
  });
}

/**
 * Hook to convert quotation to order
 */
export function useConvertQuotationToOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationService.convertQuotationToOrder(id),
    onSuccess: (result, quotationId) => {
      // Invalidate quotation data
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.detail(quotationId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.all() });
      // Invalidate orders since a new one was created
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.all() });
      showSuccess('Quotation converted to order');
    },
    onError: (error) => {
      showApiError(error, 'Failed to convert quotation');
    },
  });
}

/**
 * Hook to create a quotation revision
 */
export function useCreateQuotationRevision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationService.createQuotationRevision(id),
    onSuccess: (newRevision, originalId) => {
      // Invalidate the original quotation's revisions
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.revisions(originalId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations.lists() });
      showSuccess('Quotation revision created');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create revision');
    },
  });
}
