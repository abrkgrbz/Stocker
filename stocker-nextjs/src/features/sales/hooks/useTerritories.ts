// =====================================
// SALES TERRITORY HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { territoryService } from '../services/territory.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  SalesTerritoryDto,
  SalesTerritoryListDto,
  PagedResult,
  SalesTerritoryQueryParams,
  CreateSalesTerritoryCommand,
  UpdateSalesTerritoryCommand,
  AssignSalesRepCommand,
  AssignCustomerToTerritoryCommand,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated sales territories
 */
export function useSalesTerritories(params?: SalesTerritoryQueryParams) {
  return useQuery<PagedResult<SalesTerritoryListDto>>({
    queryKey: salesKeys.territories.list(params),
    queryFn: () => territoryService.getSalesTerritories(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single sales territory by ID
 */
export function useSalesTerritory(id: string) {
  return useQuery<SalesTerritoryDto>({
    queryKey: salesKeys.territories.detail(id),
    queryFn: () => territoryService.getSalesTerritory(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch a sales territory by code
 */
export function useSalesTerritoryByCode(code: string) {
  return useQuery<SalesTerritoryDto>({
    queryKey: salesKeys.territories.byCode(code),
    queryFn: () => territoryService.getSalesTerritoryByCode(code),
    ...queryOptions.detail({ enabled: !!code }),
  });
}

/**
 * Hook to fetch child territories
 */
export function useChildTerritories(parentId: string) {
  return useQuery<SalesTerritoryListDto[]>({
    queryKey: salesKeys.territories.children(parentId),
    queryFn: () => territoryService.getChildTerritories(parentId),
    ...queryOptions.list({ enabled: !!parentId }),
  });
}

/**
 * Hook to fetch root territories
 */
export function useRootTerritories() {
  return useQuery<SalesTerritoryListDto[]>({
    queryKey: salesKeys.territories.roots(),
    queryFn: () => territoryService.getRootTerritories(),
    ...queryOptions.list(),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new sales territory
 */
export function useCreateSalesTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesTerritoryCommand) => territoryService.createSalesTerritory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.territories.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.territories.roots() });
      showSuccess('Sales territory created successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create sales territory');
    },
  });
}

/**
 * Hook to update a sales territory
 */
export function useUpdateSalesTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalesTerritoryCommand }) =>
      territoryService.updateSalesTerritory(id, data),
    onSuccess: (updatedTerritory) => {
      queryClient.setQueryData(salesKeys.territories.detail(updatedTerritory.id), updatedTerritory);
      queryClient.invalidateQueries({ queryKey: salesKeys.territories.lists() });
      showSuccess('Sales territory updated successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update sales territory');
    },
  });
}

/**
 * Hook to delete a sales territory
 */
export function useDeleteSalesTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => territoryService.deleteSalesTerritory(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: salesKeys.territories.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.territories.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.territories.roots() });
      showSuccess('Sales territory deleted successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to delete sales territory');
    },
  });
}

// =====================================
// WORKFLOW HOOKS
// =====================================

/**
 * Hook to activate a territory
 */
export function useActivateTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => territoryService.activateTerritory(id),
    onSuccess: (updatedTerritory) => {
      queryClient.setQueryData(salesKeys.territories.detail(updatedTerritory.id), updatedTerritory);
      queryClient.invalidateQueries({ queryKey: salesKeys.territories.lists() });
      showSuccess('Territory activated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to activate territory');
    },
  });
}

/**
 * Hook to deactivate a territory
 */
export function useDeactivateTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => territoryService.deactivateTerritory(id),
    onSuccess: (updatedTerritory) => {
      queryClient.setQueryData(salesKeys.territories.detail(updatedTerritory.id), updatedTerritory);
      queryClient.invalidateQueries({ queryKey: salesKeys.territories.lists() });
      showSuccess('Territory deactivated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to deactivate territory');
    },
  });
}

/**
 * Hook to suspend a territory
 */
export function useSuspendTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      territoryService.suspendTerritory(id, reason),
    onSuccess: (updatedTerritory) => {
      queryClient.setQueryData(salesKeys.territories.detail(updatedTerritory.id), updatedTerritory);
      queryClient.invalidateQueries({ queryKey: salesKeys.territories.lists() });
      showSuccess('Territory suspended');
    },
    onError: (error) => {
      showApiError(error, 'Failed to suspend territory');
    },
  });
}

// =====================================
// ASSIGNMENT HOOKS
// =====================================

/**
 * Hook to assign manager to territory
 */
export function useAssignManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, managerId, managerName }: { id: string; managerId: string; managerName: string }) =>
      territoryService.assignManager(id, managerId, managerName),
    onSuccess: (updatedTerritory) => {
      queryClient.setQueryData(salesKeys.territories.detail(updatedTerritory.id), updatedTerritory);
      queryClient.invalidateQueries({ queryKey: salesKeys.territories.lists() });
      showSuccess('Manager assigned');
    },
    onError: (error) => {
      showApiError(error, 'Failed to assign manager');
    },
  });
}

/**
 * Hook to remove manager from territory
 */
export function useRemoveManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => territoryService.removeManager(id),
    onSuccess: (updatedTerritory) => {
      queryClient.setQueryData(salesKeys.territories.detail(updatedTerritory.id), updatedTerritory);
      queryClient.invalidateQueries({ queryKey: salesKeys.territories.lists() });
      showSuccess('Manager removed');
    },
    onError: (error) => {
      showApiError(error, 'Failed to remove manager');
    },
  });
}

/**
 * Hook to assign sales rep to territory
 */
export function useAssignSalesRep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignSalesRepCommand }) =>
      territoryService.assignSalesRep(id, data),
    onSuccess: (updatedTerritory) => {
      queryClient.setQueryData(salesKeys.territories.detail(updatedTerritory.id), updatedTerritory);
      queryClient.invalidateQueries({ queryKey: salesKeys.territories.lists() });
      showSuccess('Sales rep assigned');
    },
    onError: (error) => {
      showApiError(error, 'Failed to assign sales rep');
    },
  });
}

/**
 * Hook to remove assignment from territory
 */
export function useRemoveAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignmentId }: { id: string; assignmentId: string }) =>
      territoryService.removeAssignment(id, assignmentId),
    onSuccess: (updatedTerritory) => {
      queryClient.setQueryData(salesKeys.territories.detail(updatedTerritory.id), updatedTerritory);
      queryClient.invalidateQueries({ queryKey: salesKeys.territories.lists() });
      showSuccess('Assignment removed');
    },
    onError: (error) => {
      showApiError(error, 'Failed to remove assignment');
    },
  });
}

/**
 * Hook to assign customer to territory
 */
export function useAssignCustomerToTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignCustomerToTerritoryCommand }) =>
      territoryService.assignCustomer(id, data),
    onSuccess: (updatedTerritory) => {
      queryClient.setQueryData(salesKeys.territories.detail(updatedTerritory.id), updatedTerritory);
      queryClient.invalidateQueries({ queryKey: salesKeys.territories.lists() });
      showSuccess('Customer assigned to territory');
    },
    onError: (error) => {
      showApiError(error, 'Failed to assign customer');
    },
  });
}

/**
 * Hook to remove customer from territory
 */
export function useRemoveCustomerFromTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, customerId }: { id: string; customerId: string }) =>
      territoryService.removeCustomer(id, customerId),
    onSuccess: (updatedTerritory) => {
      queryClient.setQueryData(salesKeys.territories.detail(updatedTerritory.id), updatedTerritory);
      queryClient.invalidateQueries({ queryKey: salesKeys.territories.lists() });
      showSuccess('Customer removed from territory');
    },
    onError: (error) => {
      showApiError(error, 'Failed to remove customer');
    },
  });
}

/**
 * Hook to add postal code to territory
 */
export function useAddPostalCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, postalCode, areaName }: { id: string; postalCode: string; areaName?: string }) =>
      territoryService.addPostalCode(id, postalCode, areaName),
    onSuccess: (updatedTerritory) => {
      queryClient.setQueryData(salesKeys.territories.detail(updatedTerritory.id), updatedTerritory);
      queryClient.invalidateQueries({ queryKey: salesKeys.territories.lists() });
      showSuccess('Postal code added');
    },
    onError: (error) => {
      showApiError(error, 'Failed to add postal code');
    },
  });
}

/**
 * Hook to remove postal code from territory
 */
export function useRemovePostalCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, postalCodeId }: { id: string; postalCodeId: string }) =>
      territoryService.removePostalCode(id, postalCodeId),
    onSuccess: (updatedTerritory) => {
      queryClient.setQueryData(salesKeys.territories.detail(updatedTerritory.id), updatedTerritory);
      queryClient.invalidateQueries({ queryKey: salesKeys.territories.lists() });
      showSuccess('Postal code removed');
    },
    onError: (error) => {
      showApiError(error, 'Failed to remove postal code');
    },
  });
}
