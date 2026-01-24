// =====================================
// DELIVERY NOTE HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deliveryNoteService } from '../services/delivery-note.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  DeliveryNoteDto,
  DeliveryNoteListDto,
  CreateDeliveryNoteDto,
  DispatchDeliveryNoteDto,
  DeliveryNoteQueryParams,
  PagedResult,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated delivery notes
 */
export function useDeliveryNotes(params?: DeliveryNoteQueryParams) {
  return useQuery<PagedResult<DeliveryNoteListDto>>({
    queryKey: salesKeys.deliveryNotes.list(params),
    queryFn: () => deliveryNoteService.getDeliveryNotes(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single delivery note by ID
 */
export function useDeliveryNote(id: string) {
  return useQuery<DeliveryNoteDto>({
    queryKey: salesKeys.deliveryNotes.detail(id),
    queryFn: () => deliveryNoteService.getDeliveryNote(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch delivery note by number
 */
export function useDeliveryNoteByNumber(number: string) {
  return useQuery<DeliveryNoteDto>({
    queryKey: salesKeys.deliveryNotes.byNumber(number),
    queryFn: () => deliveryNoteService.getByNumber(number),
    ...queryOptions.detail({ enabled: !!number }),
  });
}

/**
 * Hook to fetch delivery notes by sales order
 */
export function useDeliveryNotesByOrder(orderId: string) {
  return useQuery<DeliveryNoteListDto[]>({
    queryKey: salesKeys.deliveryNotes.byOrder(orderId),
    queryFn: () => deliveryNoteService.getBySalesOrder(orderId),
    ...queryOptions.list({ enabled: !!orderId }),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new delivery note
 */
export function useCreateDeliveryNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDeliveryNoteDto) => deliveryNoteService.createDeliveryNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.deliveryNotes.lists() });
      showSuccess('İrsaliye başarıyla oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'İrsaliye oluşturulamadı');
    },
  });
}

// =====================================
// WORKFLOW HOOKS
// =====================================

/**
 * Hook to dispatch a delivery note
 */
export function useDispatchDeliveryNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DispatchDeliveryNoteDto }) =>
      deliveryNoteService.dispatch(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.deliveryNotes.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.deliveryNotes.lists() });
      showSuccess('İrsaliye sevke çıkarıldı');
    },
    onError: (error) => {
      showApiError(error, 'İrsaliye sevke çıkarılamadı');
    },
  });
}

/**
 * Hook to deliver a delivery note
 */
export function useDeliverDeliveryNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { receivedBy?: string; signature?: string } }) =>
      deliveryNoteService.deliver(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.deliveryNotes.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.deliveryNotes.lists() });
      showSuccess('İrsaliye teslim edildi');
    },
    onError: (error) => {
      showApiError(error, 'İrsaliye teslim edilemedi');
    },
  });
}

/**
 * Hook to cancel a delivery note
 */
export function useCancelDeliveryNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      deliveryNoteService.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.deliveryNotes.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.deliveryNotes.lists() });
      showSuccess('İrsaliye iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'İrsaliye iptal edilemedi');
    },
  });
}

/**
 * Hook to print a delivery note
 */
export function usePrintDeliveryNote() {
  return useMutation({
    mutationFn: (id: string) => deliveryNoteService.print(id),
    onSuccess: () => {
      showSuccess('İrsaliye yazdırıldı');
    },
    onError: (error) => {
      showApiError(error, 'İrsaliye yazdırılamadı');
    },
  });
}

/**
 * Hook to sign a delivery note
 */
export function useSignDeliveryNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deliveryNoteService.sign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.deliveryNotes.detail(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.deliveryNotes.lists() });
      showSuccess('İrsaliye imzalandı');
    },
    onError: (error) => {
      showApiError(error, 'İrsaliye imzalanamadı');
    },
  });
}
