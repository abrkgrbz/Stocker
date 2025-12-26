// =====================================
// SHIPMENT HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shipmentService } from '../services/shipment.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  ShipmentDto,
  ShipmentListDto,
  PagedResult,
  ShipmentQueryParams,
  CreateShipmentCommand,
  CreateShipmentFromOrderCommand,
  UpdateShipmentCommand,
  ShipShipmentCommand,
  DeliverShipmentCommand,
  AddShipmentItemCommand,
  UpdateShipmentItemCommand,
  UpdateTrackingCommand,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated shipments
 */
export function useShipments(params?: ShipmentQueryParams) {
  return useQuery<PagedResult<ShipmentListDto>>({
    queryKey: salesKeys.shipments.list(params),
    queryFn: () => shipmentService.getShipments(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single shipment by ID
 */
export function useShipment(id: string) {
  return useQuery<ShipmentDto>({
    queryKey: salesKeys.shipments.detail(id),
    queryFn: () => shipmentService.getShipment(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch a shipment by number
 */
export function useShipmentByNumber(shipmentNumber: string) {
  return useQuery<ShipmentDto>({
    queryKey: salesKeys.shipments.byNumber(shipmentNumber),
    queryFn: () => shipmentService.getShipmentByNumber(shipmentNumber),
    ...queryOptions.detail({ enabled: !!shipmentNumber }),
  });
}

/**
 * Hook to fetch shipments by order
 */
export function useShipmentsByOrder(orderId: string) {
  return useQuery<ShipmentListDto[]>({
    queryKey: salesKeys.shipments.byOrder(orderId),
    queryFn: () => shipmentService.getShipmentsByOrder(orderId),
    ...queryOptions.list({ enabled: !!orderId }),
  });
}

/**
 * Hook to fetch shipments by customer
 */
export function useShipmentsByCustomer(customerId: string) {
  return useQuery<ShipmentListDto[]>({
    queryKey: salesKeys.shipments.byCustomer(customerId),
    queryFn: () => shipmentService.getShipmentsByCustomer(customerId),
    ...queryOptions.list({ enabled: !!customerId }),
  });
}

/**
 * Hook to fetch pending shipments
 */
export function usePendingShipments() {
  return useQuery<ShipmentListDto[]>({
    queryKey: salesKeys.shipments.pending(),
    queryFn: () => shipmentService.getPendingShipments(),
    ...queryOptions.realtime(),
  });
}

/**
 * Hook to fetch in-transit shipments
 */
export function useInTransitShipments() {
  return useQuery<ShipmentListDto[]>({
    queryKey: salesKeys.shipments.inTransit(),
    queryFn: () => shipmentService.getInTransitShipments(),
    ...queryOptions.realtime(),
  });
}

/**
 * Hook to fetch overdue shipments
 */
export function useOverdueShipments() {
  return useQuery<ShipmentListDto[]>({
    queryKey: salesKeys.shipments.overdue(),
    queryFn: () => shipmentService.getOverdueShipments(),
    ...queryOptions.realtime(),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new shipment
 */
export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShipmentCommand) => shipmentService.createShipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.pending() });
      showSuccess('Shipment created successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create shipment');
    },
  });
}

/**
 * Hook to create shipment from order
 */
export function useCreateShipmentFromOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShipmentFromOrderCommand) => shipmentService.createShipmentFromOrder(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.pending() });
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.byOrder(variables.salesOrderId) });
      // Also invalidate the order
      queryClient.invalidateQueries({ queryKey: salesKeys.orders.detail(variables.salesOrderId) });
      showSuccess('Shipment created from order');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create shipment from order');
    },
  });
}

/**
 * Hook to update a shipment
 */
export function useUpdateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShipmentCommand }) =>
      shipmentService.updateShipment(id, data),
    onSuccess: (updatedShipment) => {
      queryClient.setQueryData(salesKeys.shipments.detail(updatedShipment.id), updatedShipment);
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.lists() });
      showSuccess('Shipment updated successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update shipment');
    },
  });
}

/**
 * Hook to delete a shipment
 */
export function useDeleteShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shipmentService.deleteShipment(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: salesKeys.shipments.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.pending() });
      showSuccess('Shipment deleted successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to delete shipment');
    },
  });
}

// =====================================
// WORKFLOW HOOKS
// =====================================

/**
 * Hook to confirm a shipment
 */
export function useConfirmShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shipmentService.confirmShipment(id),
    onSuccess: (updatedShipment) => {
      queryClient.setQueryData(salesKeys.shipments.detail(updatedShipment.id), updatedShipment);
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.lists() });
      showSuccess('Shipment confirmed');
    },
    onError: (error) => {
      showApiError(error, 'Failed to confirm shipment');
    },
  });
}

/**
 * Hook to pick a shipment
 */
export function usePickShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shipmentService.pickShipment(id),
    onSuccess: (updatedShipment) => {
      queryClient.setQueryData(salesKeys.shipments.detail(updatedShipment.id), updatedShipment);
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.pending() });
      showSuccess('Shipment picked');
    },
    onError: (error) => {
      showApiError(error, 'Failed to pick shipment');
    },
  });
}

/**
 * Hook to pack a shipment
 */
export function usePackShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shipmentService.packShipment(id),
    onSuccess: (updatedShipment) => {
      queryClient.setQueryData(salesKeys.shipments.detail(updatedShipment.id), updatedShipment);
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.lists() });
      showSuccess('Shipment packed');
    },
    onError: (error) => {
      showApiError(error, 'Failed to pack shipment');
    },
  });
}

/**
 * Hook to ship a shipment
 */
export function useShipShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ShipShipmentCommand }) =>
      shipmentService.shipShipment(id, data),
    onSuccess: (updatedShipment) => {
      queryClient.setQueryData(salesKeys.shipments.detail(updatedShipment.id), updatedShipment);
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.pending() });
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.inTransit() });
      showSuccess('Shipment shipped');
    },
    onError: (error) => {
      showApiError(error, 'Failed to ship shipment');
    },
  });
}

/**
 * Hook to deliver a shipment
 */
export function useDeliverShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeliverShipmentCommand }) =>
      shipmentService.deliverShipment(id, data),
    onSuccess: (updatedShipment) => {
      queryClient.setQueryData(salesKeys.shipments.detail(updatedShipment.id), updatedShipment);
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.inTransit() });
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.overdue() });
      showSuccess('Shipment delivered');
    },
    onError: (error) => {
      showApiError(error, 'Failed to deliver shipment');
    },
  });
}

/**
 * Hook to cancel a shipment
 */
export function useCancelShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      shipmentService.cancelShipment(id, reason),
    onSuccess: (updatedShipment) => {
      queryClient.setQueryData(salesKeys.shipments.detail(updatedShipment.id), updatedShipment);
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.pending() });
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.inTransit() });
      showSuccess('Shipment cancelled');
    },
    onError: (error) => {
      showApiError(error, 'Failed to cancel shipment');
    },
  });
}

// =====================================
// ITEM MANAGEMENT HOOKS
// =====================================

/**
 * Hook to add item to shipment
 */
export function useAddShipmentItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddShipmentItemCommand }) =>
      shipmentService.addShipmentItem(id, data),
    onSuccess: (updatedShipment) => {
      queryClient.setQueryData(salesKeys.shipments.detail(updatedShipment.id), updatedShipment);
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.lists() });
      showSuccess('Item added to shipment');
    },
    onError: (error) => {
      showApiError(error, 'Failed to add item');
    },
  });
}

/**
 * Hook to update shipment item
 */
export function useUpdateShipmentItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, itemId, data }: { id: string; itemId: string; data: UpdateShipmentItemCommand }) =>
      shipmentService.updateShipmentItem(id, itemId, data),
    onSuccess: (updatedShipment) => {
      queryClient.setQueryData(salesKeys.shipments.detail(updatedShipment.id), updatedShipment);
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.lists() });
      showSuccess('Shipment item updated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update item');
    },
  });
}

/**
 * Hook to remove item from shipment
 */
export function useRemoveShipmentItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, itemId }: { id: string; itemId: string }) =>
      shipmentService.removeShipmentItem(id, itemId),
    onSuccess: (updatedShipment) => {
      queryClient.setQueryData(salesKeys.shipments.detail(updatedShipment.id), updatedShipment);
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.lists() });
      showSuccess('Item removed from shipment');
    },
    onError: (error) => {
      showApiError(error, 'Failed to remove item');
    },
  });
}

/**
 * Hook to update tracking info
 */
export function useUpdateTrackingInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTrackingCommand }) =>
      shipmentService.updateTrackingInfo(id, data),
    onSuccess: (updatedShipment) => {
      queryClient.setQueryData(salesKeys.shipments.detail(updatedShipment.id), updatedShipment);
      queryClient.invalidateQueries({ queryKey: salesKeys.shipments.lists() });
      showSuccess('Tracking info updated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update tracking info');
    },
  });
}
