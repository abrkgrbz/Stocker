/**
 * React Query Hooks for Sales Module
 * Comprehensive hooks for sales order management with optimistic updates and cache management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SalesService } from '../services/sales.service';
import type {
  SalesOrder,
  SalesOrderListItem,
  SalesOrderStatistics,
  PagedResult,
  GetSalesOrdersParams,
  CreateSalesOrderCommand,
  UpdateSalesOrderCommand,
  AddSalesOrderItemCommand,
} from '../services/sales.service';

// =====================================
// QUERY KEYS
// =====================================

export const salesKeys = {
  // Orders
  orders: ['sales', 'orders'] as const,
  ordersList: (params?: GetSalesOrdersParams) => ['sales', 'orders', 'list', params] as const,
  order: (id: string) => ['sales', 'orders', id] as const,
  statistics: (from?: string, to?: string) => ['sales', 'statistics', from, to] as const,
};

// =====================================
// ORDER QUERIES
// =====================================

/**
 * Hook to fetch paginated sales orders
 */
export function useSalesOrders(params?: GetSalesOrdersParams) {
  return useQuery<PagedResult<SalesOrderListItem>>({
    queryKey: salesKeys.ordersList(params),
    queryFn: () => SalesService.getOrders(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single sales order by ID
 */
export function useSalesOrder(id: string) {
  return useQuery<SalesOrder>({
    queryKey: salesKeys.order(id),
    queryFn: () => SalesService.getOrderById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch sales order statistics
 */
export function useSalesStatistics(fromDate?: string, toDate?: string) {
  return useQuery<SalesOrderStatistics>({
    queryKey: salesKeys.statistics(fromDate, toDate),
    queryFn: () => SalesService.getStatistics(fromDate, toDate),
    staleTime: 60 * 1000, // 1 minute
  });
}

// =====================================
// ORDER MUTATIONS
// =====================================

/**
 * Hook to create a new sales order
 */
export function useCreateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesOrderCommand) => SalesService.createOrder(data),
    onSuccess: () => {
      // Invalidate orders list to refetch
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
      queryClient.invalidateQueries({ queryKey: ['sales', 'statistics'] });
    },
  });
}

/**
 * Hook to update a sales order
 */
export function useUpdateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<UpdateSalesOrderCommand, 'id'> }) =>
      SalesService.updateOrder(id, { ...data, id }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.order(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
    },
  });
}

/**
 * Hook to add an item to a sales order
 */
export function useAddSalesOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: Omit<AddSalesOrderItemCommand, 'salesOrderId'> }) =>
      SalesService.addItem(orderId, data),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.order(orderId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
    },
  });
}

/**
 * Hook to remove an item from a sales order
 */
export function useRemoveSalesOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string }) =>
      SalesService.removeItem(orderId, itemId),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.order(orderId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
    },
  });
}

/**
 * Hook to approve a sales order
 */
export function useApproveSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.approveOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.order(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
      queryClient.invalidateQueries({ queryKey: ['sales', 'statistics'] });
    },
  });
}

/**
 * Hook to cancel a sales order
 */
export function useCancelSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      SalesService.cancelOrder(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.order(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
      queryClient.invalidateQueries({ queryKey: ['sales', 'statistics'] });
    },
  });
}

/**
 * Hook to delete a sales order
 */
export function useDeleteSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
      queryClient.invalidateQueries({ queryKey: ['sales', 'statistics'] });
    },
  });
}
