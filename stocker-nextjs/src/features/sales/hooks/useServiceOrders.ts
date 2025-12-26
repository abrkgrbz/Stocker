// =====================================
// SERVICE ORDER HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { serviceOrderService } from '../services/service-order.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  ServiceOrderDto,
  ServiceOrderListDto,
  ServiceOrderStatisticsDto,
  PagedResult,
  ServiceOrderQueryParams,
  CreateServiceOrderCommand,
  UpdateServiceOrderCommand,
  AssignTechnicianCommand,
  CompleteServiceOrderCommand,
  AddServiceOrderItemCommand,
  UpdateServiceOrderItemCommand,
  AddServiceOrderNoteCommand,
  SubmitServiceFeedbackCommand,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated service orders
 */
export function useServiceOrders(params?: ServiceOrderQueryParams) {
  return useQuery<PagedResult<ServiceOrderListDto>>({
    queryKey: salesKeys.serviceOrders.list(params),
    queryFn: () => serviceOrderService.getServiceOrders(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single service order by ID
 */
export function useServiceOrder(id: string) {
  return useQuery<ServiceOrderDto>({
    queryKey: salesKeys.serviceOrders.detail(id),
    queryFn: () => serviceOrderService.getServiceOrder(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch service orders by customer
 */
export function useServiceOrdersByCustomer(customerId: string) {
  return useQuery<ServiceOrderListDto[]>({
    queryKey: salesKeys.serviceOrders.byCustomer(customerId),
    queryFn: () => serviceOrderService.getServiceOrdersByCustomer(customerId),
    ...queryOptions.list({ enabled: !!customerId }),
  });
}

/**
 * Hook to fetch service order statistics
 */
export function useServiceOrderStatistics() {
  return useQuery<ServiceOrderStatisticsDto>({
    queryKey: salesKeys.serviceOrders.statistics(),
    queryFn: () => serviceOrderService.getServiceOrderStatistics(),
    ...queryOptions.realtime(),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new service order
 */
export function useCreateServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceOrderCommand) => serviceOrderService.createServiceOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.serviceOrders.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.serviceOrders.statistics() });
      showSuccess('Service order created successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create service order');
    },
  });
}

/**
 * Hook to update a service order
 */
export function useUpdateServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceOrderCommand }) =>
      serviceOrderService.updateServiceOrder(id, data),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(salesKeys.serviceOrders.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: salesKeys.serviceOrders.lists() });
      showSuccess('Service order updated successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update service order');
    },
  });
}

/**
 * Hook to delete a service order
 */
export function useDeleteServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => serviceOrderService.deleteServiceOrder(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: salesKeys.serviceOrders.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.serviceOrders.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.serviceOrders.statistics() });
      showSuccess('Service order deleted successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to delete service order');
    },
  });
}

// =====================================
// WORKFLOW HOOKS
// =====================================

/**
 * Hook to assign technician to service order
 */
export function useAssignTechnician() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignTechnicianCommand }) =>
      serviceOrderService.assignTechnician(id, data),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(salesKeys.serviceOrders.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: salesKeys.serviceOrders.lists() });
      showSuccess('Technician assigned');
    },
    onError: (error) => {
      showApiError(error, 'Failed to assign technician');
    },
  });
}

/**
 * Hook to start a service order
 */
export function useStartServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => serviceOrderService.startServiceOrder(id),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(salesKeys.serviceOrders.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: salesKeys.serviceOrders.lists() });
      showSuccess('Service order started');
    },
    onError: (error) => {
      showApiError(error, 'Failed to start service order');
    },
  });
}

/**
 * Hook to complete a service order
 */
export function useCompleteServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteServiceOrderCommand }) =>
      serviceOrderService.completeServiceOrder(id, data),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(salesKeys.serviceOrders.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: salesKeys.serviceOrders.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.serviceOrders.statistics() });
      showSuccess('Service order completed');
    },
    onError: (error) => {
      showApiError(error, 'Failed to complete service order');
    },
  });
}

/**
 * Hook to cancel a service order
 */
export function useCancelServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      serviceOrderService.cancelServiceOrder(id, reason),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(salesKeys.serviceOrders.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: salesKeys.serviceOrders.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.serviceOrders.statistics() });
      showSuccess('Service order cancelled');
    },
    onError: (error) => {
      showApiError(error, 'Failed to cancel service order');
    },
  });
}

// =====================================
// ITEM MANAGEMENT HOOKS
// =====================================

/**
 * Hook to add item to service order
 */
export function useAddServiceOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddServiceOrderItemCommand }) =>
      serviceOrderService.addServiceOrderItem(id, data),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(salesKeys.serviceOrders.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: salesKeys.serviceOrders.lists() });
      showSuccess('Item added to service order');
    },
    onError: (error) => {
      showApiError(error, 'Failed to add item');
    },
  });
}

/**
 * Hook to update service order item
 */
export function useUpdateServiceOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, itemId, data }: { id: string; itemId: string; data: UpdateServiceOrderItemCommand }) =>
      serviceOrderService.updateServiceOrderItem(id, itemId, data),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(salesKeys.serviceOrders.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: salesKeys.serviceOrders.lists() });
      showSuccess('Service order item updated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update item');
    },
  });
}

/**
 * Hook to remove item from service order
 */
export function useRemoveServiceOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, itemId }: { id: string; itemId: string }) =>
      serviceOrderService.removeServiceOrderItem(id, itemId),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(salesKeys.serviceOrders.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: salesKeys.serviceOrders.lists() });
      showSuccess('Item removed from service order');
    },
    onError: (error) => {
      showApiError(error, 'Failed to remove item');
    },
  });
}

// =====================================
// NOTES & FEEDBACK HOOKS
// =====================================

/**
 * Hook to add note to service order
 */
export function useAddServiceOrderNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddServiceOrderNoteCommand }) =>
      serviceOrderService.addServiceOrderNote(id, data),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(salesKeys.serviceOrders.detail(updatedOrder.id), updatedOrder);
      showSuccess('Note added');
    },
    onError: (error) => {
      showApiError(error, 'Failed to add note');
    },
  });
}

/**
 * Hook to submit customer feedback
 */
export function useSubmitServiceFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubmitServiceFeedbackCommand }) =>
      serviceOrderService.submitFeedback(id, data),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(salesKeys.serviceOrders.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: salesKeys.serviceOrders.lists() });
      showSuccess('Feedback submitted');
    },
    onError: (error) => {
      showApiError(error, 'Failed to submit feedback');
    },
  });
}
