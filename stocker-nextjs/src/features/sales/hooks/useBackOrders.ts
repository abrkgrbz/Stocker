// =====================================
// BACK ORDER HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backOrderService } from '../services/back-order.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  BackOrderDto,
  BackOrderListDto,
  CreateBackOrderDto,
  FulfillBackOrderItemDto,
  BackOrderQueryParams,
  PagedResult,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated back orders
 */
export function useBackOrders(params?: BackOrderQueryParams) {
  return useQuery<PagedResult<BackOrderListDto>>({
    queryKey: salesKeys.backOrders.list(params),
    queryFn: () => backOrderService.getBackOrders(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single back order by ID
 */
export function useBackOrder(id: string) {
  return useQuery<BackOrderDto>({
    queryKey: salesKeys.backOrders.detail(id),
    queryFn: () => backOrderService.getBackOrder(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch back orders by sales order
 */
export function useBackOrdersByOrder(orderId: string) {
  return useQuery<BackOrderListDto[]>({
    queryKey: salesKeys.backOrders.byOrder(orderId),
    queryFn: () => backOrderService.getBySalesOrder(orderId),
    ...queryOptions.list({ enabled: !!orderId }),
  });
}

/**
 * Hook to fetch back orders by customer
 */
export function useBackOrdersByCustomer(customerId: string) {
  return useQuery<BackOrderListDto[]>({
    queryKey: salesKeys.backOrders.byCustomer(customerId),
    queryFn: () => backOrderService.getByCustomer(customerId),
    ...queryOptions.list({ enabled: !!customerId }),
  });
}

/**
 * Hook to fetch pending (critical) back orders
 */
export function usePendingBackOrders() {
  return useQuery<BackOrderListDto[]>({
    queryKey: salesKeys.backOrders.critical(),
    queryFn: () => backOrderService.getPending(),
    ...queryOptions.list(),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new back order
 */
export function useCreateBackOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBackOrderDto) => backOrderService.createBackOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.backOrders.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.backOrders.critical() });
      showSuccess('Arka sipariş başarıyla oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Arka sipariş oluşturulamadı');
    },
  });
}

/**
 * Hook to fulfill a back order item
 */
export function useFulfillBackOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FulfillBackOrderItemDto }) =>
      backOrderService.fulfillItem(id, data),
    onSuccess: (updatedBackOrder) => {
      queryClient.setQueryData(salesKeys.backOrders.detail(updatedBackOrder.id), updatedBackOrder);
      queryClient.invalidateQueries({ queryKey: salesKeys.backOrders.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.backOrders.critical() });
      showSuccess('Arka sipariş kalemi karşılandı');
    },
    onError: (error) => {
      showApiError(error, 'Arka sipariş kalemi karşılanamadı');
    },
  });
}

// =====================================
// WORKFLOW HOOKS
// =====================================

/**
 * Hook to cancel a back order
 */
export function useCancelBackOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      backOrderService.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.backOrders.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.backOrders.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.backOrders.critical() });
      showSuccess('Arka sipariş iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Arka sipariş iptal edilemedi');
    },
  });
}

/**
 * Hook to update back order priority
 */
export function useUpdateBackOrderPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: string }) =>
      backOrderService.setPriority(id, priority),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.backOrders.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.backOrders.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.backOrders.critical() });
      showSuccess('Arka sipariş önceliği güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Arka sipariş önceliği güncellenemedi');
    },
  });
}

/**
 * Hook to notify customer about a back order
 */
export function useNotifyBackOrderCustomer() {
  return useMutation({
    mutationFn: (id: string) => backOrderService.notifyCustomer(id),
    onSuccess: () => {
      showSuccess('Müşteri bilgilendirildi');
    },
    onError: (error) => {
      showApiError(error, 'Müşteri bilgilendirilemedi');
    },
  });
}
