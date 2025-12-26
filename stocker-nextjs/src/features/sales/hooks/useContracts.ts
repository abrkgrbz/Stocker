// =====================================
// CUSTOMER CONTRACT HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contractService } from '../services/contract.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  CustomerContractDto,
  CustomerContractListDto,
  PagedResult,
  CustomerContractQueryParams,
  CreateCustomerContractCommand,
  UpdateCustomerContractCommand,
  TerminateContractCommand,
  UpdateCreditLimitCommand,
  ConfigureSLACommand,
  AddPriceAgreementCommand,
  AddPaymentTermCommand,
  AddCommitmentCommand,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated customer contracts
 */
export function useCustomerContracts(params?: CustomerContractQueryParams) {
  return useQuery<PagedResult<CustomerContractListDto>>({
    queryKey: salesKeys.contracts.list(params),
    queryFn: () => contractService.getCustomerContracts(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single customer contract by ID
 */
export function useCustomerContract(id: string) {
  return useQuery<CustomerContractDto>({
    queryKey: salesKeys.contracts.detail(id),
    queryFn: () => contractService.getCustomerContract(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch a customer contract by number
 */
export function useCustomerContractByNumber(contractNumber: string) {
  return useQuery<CustomerContractDto>({
    queryKey: salesKeys.contracts.byNumber(contractNumber),
    queryFn: () => contractService.getCustomerContractByNumber(contractNumber),
    ...queryOptions.detail({ enabled: !!contractNumber }),
  });
}

/**
 * Hook to fetch contracts by customer
 */
export function useCustomerContractsByCustomer(customerId: string) {
  return useQuery<CustomerContractListDto[]>({
    queryKey: salesKeys.contracts.byCustomer(customerId),
    queryFn: () => contractService.getCustomerContractsByCustomer(customerId),
    ...queryOptions.list({ enabled: !!customerId }),
  });
}

/**
 * Hook to fetch active contracts by customer
 */
export function useActiveContractsByCustomer(customerId: string) {
  return useQuery<CustomerContractListDto[]>({
    queryKey: salesKeys.contracts.activeByCustomer(customerId),
    queryFn: () => contractService.getActiveContractsByCustomer(customerId),
    ...queryOptions.list({ enabled: !!customerId }),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new customer contract
 */
export function useCreateCustomerContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerContractCommand) => contractService.createCustomerContract(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.contracts.lists() });
      showSuccess('Customer contract created successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create customer contract');
    },
  });
}

/**
 * Hook to update a customer contract
 */
export function useUpdateCustomerContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerContractCommand }) =>
      contractService.updateCustomerContract(id, data),
    onSuccess: (updatedContract) => {
      queryClient.setQueryData(salesKeys.contracts.detail(updatedContract.id), updatedContract);
      queryClient.invalidateQueries({ queryKey: salesKeys.contracts.lists() });
      showSuccess('Customer contract updated successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update customer contract');
    },
  });
}

/**
 * Hook to delete a customer contract
 */
export function useDeleteCustomerContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contractService.deleteCustomerContract(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: salesKeys.contracts.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.contracts.lists() });
      showSuccess('Customer contract deleted successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to delete customer contract');
    },
  });
}

// =====================================
// WORKFLOW HOOKS
// =====================================

/**
 * Hook to activate a contract
 */
export function useActivateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contractService.activateContract(id),
    onSuccess: (updatedContract) => {
      queryClient.setQueryData(salesKeys.contracts.detail(updatedContract.id), updatedContract);
      queryClient.invalidateQueries({ queryKey: salesKeys.contracts.lists() });
      showSuccess('Contract activated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to activate contract');
    },
  });
}

/**
 * Hook to suspend a contract
 */
export function useSuspendContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      contractService.suspendContract(id, reason),
    onSuccess: (updatedContract) => {
      queryClient.setQueryData(salesKeys.contracts.detail(updatedContract.id), updatedContract);
      queryClient.invalidateQueries({ queryKey: salesKeys.contracts.lists() });
      showSuccess('Contract suspended');
    },
    onError: (error) => {
      showApiError(error, 'Failed to suspend contract');
    },
  });
}

/**
 * Hook to terminate a contract
 */
export function useTerminateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TerminateContractCommand }) =>
      contractService.terminateContract(id, data),
    onSuccess: (updatedContract) => {
      queryClient.setQueryData(salesKeys.contracts.detail(updatedContract.id), updatedContract);
      queryClient.invalidateQueries({ queryKey: salesKeys.contracts.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.contracts.all() });
      showSuccess('Contract terminated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to terminate contract');
    },
  });
}

/**
 * Hook to renew a contract
 */
export function useRenewContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, extensionMonths }: { id: string; extensionMonths?: number }) =>
      contractService.renewContract(id, extensionMonths),
    onSuccess: (updatedContract) => {
      queryClient.setQueryData(salesKeys.contracts.detail(updatedContract.id), updatedContract);
      queryClient.invalidateQueries({ queryKey: salesKeys.contracts.lists() });
      showSuccess('Contract renewed');
    },
    onError: (error) => {
      showApiError(error, 'Failed to renew contract');
    },
  });
}

/**
 * Hook to block a contract
 */
export function useBlockContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      contractService.blockContract(id, reason),
    onSuccess: (updatedContract) => {
      queryClient.setQueryData(salesKeys.contracts.detail(updatedContract.id), updatedContract);
      queryClient.invalidateQueries({ queryKey: salesKeys.contracts.lists() });
      showSuccess('Contract blocked');
    },
    onError: (error) => {
      showApiError(error, 'Failed to block contract');
    },
  });
}

/**
 * Hook to unblock a contract
 */
export function useUnblockContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      contractService.unblockContract(id, notes),
    onSuccess: (updatedContract) => {
      queryClient.setQueryData(salesKeys.contracts.detail(updatedContract.id), updatedContract);
      queryClient.invalidateQueries({ queryKey: salesKeys.contracts.lists() });
      showSuccess('Contract unblocked');
    },
    onError: (error) => {
      showApiError(error, 'Failed to unblock contract');
    },
  });
}

// =====================================
// CONFIGURATION HOOKS
// =====================================

/**
 * Hook to update credit limit
 */
export function useUpdateCreditLimit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCreditLimitCommand }) =>
      contractService.updateCreditLimit(id, data),
    onSuccess: (updatedContract) => {
      queryClient.setQueryData(salesKeys.contracts.detail(updatedContract.id), updatedContract);
      queryClient.invalidateQueries({ queryKey: salesKeys.contracts.lists() });
      showSuccess('Credit limit updated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update credit limit');
    },
  });
}

/**
 * Hook to configure SLA
 */
export function useConfigureSLA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConfigureSLACommand }) =>
      contractService.configureSLA(id, data),
    onSuccess: (updatedContract) => {
      queryClient.setQueryData(salesKeys.contracts.detail(updatedContract.id), updatedContract);
      queryClient.invalidateQueries({ queryKey: salesKeys.contracts.lists() });
      showSuccess('SLA configured');
    },
    onError: (error) => {
      showApiError(error, 'Failed to configure SLA');
    },
  });
}

/**
 * Hook to add a price agreement
 */
export function useAddPriceAgreement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddPriceAgreementCommand }) =>
      contractService.addPriceAgreement(id, data),
    onSuccess: (updatedContract) => {
      queryClient.setQueryData(salesKeys.contracts.detail(updatedContract.id), updatedContract);
      queryClient.invalidateQueries({ queryKey: salesKeys.contracts.lists() });
      showSuccess('Price agreement added');
    },
    onError: (error) => {
      showApiError(error, 'Failed to add price agreement');
    },
  });
}

/**
 * Hook to add a payment term
 */
export function useAddPaymentTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddPaymentTermCommand }) =>
      contractService.addPaymentTerm(id, data),
    onSuccess: (updatedContract) => {
      queryClient.setQueryData(salesKeys.contracts.detail(updatedContract.id), updatedContract);
      queryClient.invalidateQueries({ queryKey: salesKeys.contracts.lists() });
      showSuccess('Payment term added');
    },
    onError: (error) => {
      showApiError(error, 'Failed to add payment term');
    },
  });
}

/**
 * Hook to add a commitment
 */
export function useAddCommitment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddCommitmentCommand }) =>
      contractService.addCommitment(id, data),
    onSuccess: (updatedContract) => {
      queryClient.setQueryData(salesKeys.contracts.detail(updatedContract.id), updatedContract);
      queryClient.invalidateQueries({ queryKey: salesKeys.contracts.lists() });
      showSuccess('Commitment added');
    },
    onError: (error) => {
      showApiError(error, 'Failed to add commitment');
    },
  });
}
