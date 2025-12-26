// =====================================
// CREDIT NOTE HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { creditNoteService } from '../services/credit-note.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  CreditNoteDto,
  CreditNoteListDto,
  CreditNoteStatisticsDto,
  PagedResult,
  CreditNoteQueryParams,
  CreateCreditNoteCommand,
  CreateCreditNoteFromReturnCommand,
  UpdateCreditNoteCommand,
  ApplyCreditNoteCommand,
  AddCreditNoteItemCommand,
  UpdateCreditNoteItemCommand,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated credit notes
 */
export function useCreditNotes(params?: CreditNoteQueryParams) {
  return useQuery<PagedResult<CreditNoteListDto>>({
    queryKey: salesKeys.creditNotes.list(params),
    queryFn: () => creditNoteService.getCreditNotes(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single credit note by ID
 */
export function useCreditNote(id: string) {
  return useQuery<CreditNoteDto>({
    queryKey: salesKeys.creditNotes.detail(id),
    queryFn: () => creditNoteService.getCreditNote(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch credit notes by customer
 */
export function useCreditNotesByCustomer(customerId: string) {
  return useQuery<CreditNoteListDto[]>({
    queryKey: salesKeys.creditNotes.byCustomer(customerId),
    queryFn: () => creditNoteService.getCreditNotesByCustomer(customerId),
    ...queryOptions.list({ enabled: !!customerId }),
  });
}

/**
 * Hook to fetch credit note statistics
 */
export function useCreditNoteStatistics() {
  return useQuery<CreditNoteStatisticsDto>({
    queryKey: salesKeys.creditNotes.statistics(),
    queryFn: () => creditNoteService.getCreditNoteStatistics(),
    ...queryOptions.realtime(),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new credit note
 */
export function useCreateCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCreditNoteCommand) => creditNoteService.createCreditNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.creditNotes.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.creditNotes.statistics() });
      showSuccess('Credit note created successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create credit note');
    },
  });
}

/**
 * Hook to create a credit note from a sales return
 */
export function useCreateCreditNoteFromReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCreditNoteFromReturnCommand) => creditNoteService.createCreditNoteFromReturn(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.creditNotes.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.creditNotes.statistics() });
      // Also invalidate the return that was used
      queryClient.invalidateQueries({ queryKey: salesKeys.returns.detail(variables.salesReturnId) });
      showSuccess('Credit note created from return');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create credit note from return');
    },
  });
}

/**
 * Hook to update a credit note
 */
export function useUpdateCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCreditNoteCommand }) =>
      creditNoteService.updateCreditNote(id, data),
    onSuccess: (updatedCreditNote) => {
      queryClient.setQueryData(salesKeys.creditNotes.detail(updatedCreditNote.id), updatedCreditNote);
      queryClient.invalidateQueries({ queryKey: salesKeys.creditNotes.lists() });
      showSuccess('Credit note updated successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update credit note');
    },
  });
}

/**
 * Hook to delete a credit note
 */
export function useDeleteCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => creditNoteService.deleteCreditNote(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: salesKeys.creditNotes.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.creditNotes.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.creditNotes.statistics() });
      showSuccess('Credit note deleted successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to delete credit note');
    },
  });
}

// =====================================
// WORKFLOW HOOKS
// =====================================

/**
 * Hook to approve a credit note
 */
export function useApproveCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      creditNoteService.approveCreditNote(id, notes),
    onSuccess: (updatedCreditNote) => {
      queryClient.setQueryData(salesKeys.creditNotes.detail(updatedCreditNote.id), updatedCreditNote);
      queryClient.invalidateQueries({ queryKey: salesKeys.creditNotes.lists() });
      showSuccess('Credit note approved');
    },
    onError: (error) => {
      showApiError(error, 'Failed to approve credit note');
    },
  });
}

/**
 * Hook to apply a credit note to an invoice
 */
export function useApplyCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApplyCreditNoteCommand }) =>
      creditNoteService.applyCreditNote(id, data),
    onSuccess: (updatedCreditNote) => {
      queryClient.setQueryData(salesKeys.creditNotes.detail(updatedCreditNote.id), updatedCreditNote);
      queryClient.invalidateQueries({ queryKey: salesKeys.creditNotes.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.creditNotes.statistics() });
      showSuccess('Credit note applied');
    },
    onError: (error) => {
      showApiError(error, 'Failed to apply credit note');
    },
  });
}

/**
 * Hook to void a credit note
 */
export function useVoidCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      creditNoteService.voidCreditNote(id, reason),
    onSuccess: (updatedCreditNote) => {
      queryClient.setQueryData(salesKeys.creditNotes.detail(updatedCreditNote.id), updatedCreditNote);
      queryClient.invalidateQueries({ queryKey: salesKeys.creditNotes.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.creditNotes.statistics() });
      showSuccess('Credit note voided');
    },
    onError: (error) => {
      showApiError(error, 'Failed to void credit note');
    },
  });
}

// =====================================
// ITEM MANAGEMENT HOOKS
// =====================================

/**
 * Hook to add item to credit note
 */
export function useAddCreditNoteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddCreditNoteItemCommand }) =>
      creditNoteService.addCreditNoteItem(id, data),
    onSuccess: (updatedCreditNote) => {
      queryClient.setQueryData(salesKeys.creditNotes.detail(updatedCreditNote.id), updatedCreditNote);
      queryClient.invalidateQueries({ queryKey: salesKeys.creditNotes.lists() });
      showSuccess('Item added to credit note');
    },
    onError: (error) => {
      showApiError(error, 'Failed to add item');
    },
  });
}

/**
 * Hook to update credit note item
 */
export function useUpdateCreditNoteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, itemId, data }: { id: string; itemId: string; data: UpdateCreditNoteItemCommand }) =>
      creditNoteService.updateCreditNoteItem(id, itemId, data),
    onSuccess: (updatedCreditNote) => {
      queryClient.setQueryData(salesKeys.creditNotes.detail(updatedCreditNote.id), updatedCreditNote);
      queryClient.invalidateQueries({ queryKey: salesKeys.creditNotes.lists() });
      showSuccess('Credit note item updated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update item');
    },
  });
}

/**
 * Hook to remove item from credit note
 */
export function useRemoveCreditNoteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, itemId }: { id: string; itemId: string }) =>
      creditNoteService.removeCreditNoteItem(id, itemId),
    onSuccess: (updatedCreditNote) => {
      queryClient.setQueryData(salesKeys.creditNotes.detail(updatedCreditNote.id), updatedCreditNote);
      queryClient.invalidateQueries({ queryKey: salesKeys.creditNotes.lists() });
      showSuccess('Item removed from credit note');
    },
    onError: (error) => {
      showApiError(error, 'Failed to remove item');
    },
  });
}
