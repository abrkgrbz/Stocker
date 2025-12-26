// =====================================
// SALES ORDER HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/order.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showError, showApiError } from '@/lib/utils/notifications';
import type {
  SalesOrder,
  SalesOrderListItem,
  SalesOrderStatistics,
  PagedResult,
  GetSalesOrdersParams,
  CreateSalesOrderCommand,
  UpdateSalesOrderCommand,
  AddSalesOrderItemCommand,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated sales orders
 */
export function useSalesOrders(params?: GetSalesOrdersParams) {
  return useQuery<PagedResult<SalesOrderListItem>>({
    queryKey: salesKeys.orders.list(params),
    queryFn: () => orderService.getOrders(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single sales order by ID
 */
export function useSalesOrder(id: string) {
  return useQuery<SalesOrder>({
    queryKey: salesKeys.orders.detail(id),
    queryFn: () => orderService.getOrderById(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch sales order statistics
 */
export function useSalesOrderStatistics(fromDate?: string, toDate?: string) {
  return useQuery<SalesOrderStatistics>({
    queryKey: salesKeys.orders.statistics(fromDate, toDate),
    queryFn: () => orderService.getStatistics(fromDate, toDate),
    ...queryOptions.realtime(),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new sales order
 */
export function useCreateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesOrderCommand) => orderService.createOrder(data),
    onSuccess: (newOrder) => {
      // Invalidate orders lists
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.lists() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.all() });
      showSuccess('Sales order created successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create sales order');
    },
  });
}

/**
 * Hook to update a sales order
 */
export function useUpdateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalesOrderCommand }) =>
      orderService.updateOrder(id, data),
    onSuccess: (updatedOrder) => {
      // Update the specific order in cache
      queryClient.setQueryData(salesKeys.orders.detail(updatedOrder.id), updatedOrder);
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.lists() });
      showSuccess('Sales order updated successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update sales order');
    },
  });
}

/**
 * Hook to delete a sales order
 */
export function useDeleteSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.deleteOrder(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: salesKeys.orders.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.lists() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.all() });
      showSuccess('Sales order deleted successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to delete sales order');
    },
  });
}

// =====================================
// ITEM MANAGEMENT HOOKS
// =====================================

/**
 * Hook to add an item to a sales order
 */
export function useAddSalesOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: Omit<AddSalesOrderItemCommand, 'salesOrderId'> }) =>
      orderService.addItem(orderId, data),
    onSuccess: (updatedOrder) => {
      // Update the order in cache
      queryClient.setQueryData(salesKeys.orders.detail(updatedOrder.id), updatedOrder);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.lists() });
      showSuccess('Item added to order');
    },
    onError: (error) => {
      showApiError(error, 'Failed to add item');
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
      orderService.removeItem(orderId, itemId),
    onSuccess: (updatedOrder) => {
      // Update the order in cache
      queryClient.setQueryData(salesKeys.orders.detail(updatedOrder.id), updatedOrder);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.lists() });
      showSuccess('Item removed from order');
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
 * Hook to approve a sales order
 */
export function useApproveSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.approveOrder(id),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(salesKeys.orders.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.all() });
      showSuccess('Sales order approved');
    },
    onError: (error) => {
      showApiError(error, 'Failed to approve order');
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
      orderService.cancelOrder(id, reason),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(salesKeys.orders.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.all() });
      showSuccess('Sales order cancelled');
    },
    onError: (error) => {
      showApiError(error, 'Failed to cancel order');
    },
  });
}

/**
 * Hook to confirm a sales order (customer confirmed)
 */
export function useConfirmSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.confirmOrder(id),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(salesKeys.orders.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.lists() });
      showSuccess('Sales order confirmed');
    },
    onError: (error) => {
      showApiError(error, 'Failed to confirm order');
    },
  });
}

/**
 * Hook to ship a sales order
 */
export function useShipSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.shipOrder(id),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(salesKeys.orders.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.lists() });
      // Also invalidate shipments as a new one might be created
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.all() });
      showSuccess('Sales order shipped');
    },
    onError: (error) => {
      showApiError(error, 'Failed to ship order');
    },
  });
}

/**
 * Hook to mark a sales order as delivered
 */
export function useDeliverSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.deliverOrder(id),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(salesKeys.orders.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.lists() });
      showSuccess('Sales order marked as delivered');
    },
    onError: (error) => {
      showApiError(error, 'Failed to mark order as delivered');
    },
  });
}

/**
 * Hook to complete a sales order
 */
export function useCompleteSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.completeOrder(id),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(salesKeys.orders.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.all() });
      showSuccess('Sales order completed');
    },
    onError: (error) => {
      showApiError(error, 'Failed to complete order');
    },
  });
}
