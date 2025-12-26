// =====================================
// COMMISSION HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commissionService } from '../services/commission.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  CommissionPlan,
  CommissionPlanListItem,
  SalesCommission,
  SalesCommissionListItem,
  CommissionSummary,
  SalesPersonCommissionSummary,
  PagedResult,
  GetCommissionPlansParams,
  GetSalesCommissionsParams,
  CreateCommissionPlanDto,
  UpdateCommissionPlanDto,
  CreateCommissionTierDto,
  CalculateCommissionDto,
} from '../types';

// =====================================
// COMMISSION PLAN QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated commission plans
 */
export function useCommissionPlans(params?: GetCommissionPlansParams) {
  return useQuery<PagedResult<CommissionPlanListItem>>({
    queryKey: salesKeys.commissionPlans.list(params),
    queryFn: () => commissionService.getCommissionPlans(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single commission plan by ID
 */
export function useCommissionPlan(id: string) {
  return useQuery<CommissionPlan>({
    queryKey: salesKeys.commissionPlans.detail(id),
    queryFn: () => commissionService.getCommissionPlanById(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch active commission plans
 */
export function useActiveCommissionPlans() {
  return useQuery<CommissionPlanListItem[]>({
    queryKey: salesKeys.commissionPlans.active(),
    queryFn: () => commissionService.getActiveCommissionPlans(),
    ...queryOptions.list(),
  });
}

// =====================================
// COMMISSION PLAN MUTATION HOOKS
// =====================================

/**
 * Hook to create a new commission plan
 */
export function useCreateCommissionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommissionPlanDto) => commissionService.createCommissionPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlans.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlans.active() });
      showSuccess('Commission plan created successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create commission plan');
    },
  });
}

/**
 * Hook to update a commission plan
 */
export function useUpdateCommissionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommissionPlanDto }) =>
      commissionService.updateCommissionPlan(id, data),
    onSuccess: (updatedPlan) => {
      queryClient.setQueryData(salesKeys.commissionPlans.detail(updatedPlan.id), updatedPlan);
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlans.lists() });
      showSuccess('Commission plan updated successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update commission plan');
    },
  });
}

/**
 * Hook to add a tier to a commission plan
 */
export function useAddCommissionTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, tier }: { planId: string; tier: CreateCommissionTierDto }) =>
      commissionService.addCommissionTier(planId, tier),
    onSuccess: (updatedPlan) => {
      queryClient.setQueryData(salesKeys.commissionPlans.detail(updatedPlan.id), updatedPlan);
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlans.lists() });
      showSuccess('Commission tier added');
    },
    onError: (error) => {
      showApiError(error, 'Failed to add commission tier');
    },
  });
}

/**
 * Hook to remove a tier from a commission plan
 */
export function useRemoveCommissionTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, tierId }: { planId: string; tierId: string }) =>
      commissionService.removeCommissionTier(planId, tierId),
    onSuccess: (updatedPlan) => {
      queryClient.setQueryData(salesKeys.commissionPlans.detail(updatedPlan.id), updatedPlan);
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlans.lists() });
      showSuccess('Commission tier removed');
    },
    onError: (error) => {
      showApiError(error, 'Failed to remove commission tier');
    },
  });
}

/**
 * Hook to activate a commission plan
 */
export function useActivateCommissionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => commissionService.activateCommissionPlan(id),
    onSuccess: (updatedPlan) => {
      queryClient.setQueryData(salesKeys.commissionPlans.detail(updatedPlan.id), updatedPlan);
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlans.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlans.active() });
      showSuccess('Commission plan activated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to activate commission plan');
    },
  });
}

/**
 * Hook to deactivate a commission plan
 */
export function useDeactivateCommissionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => commissionService.deactivateCommissionPlan(id),
    onSuccess: (updatedPlan) => {
      queryClient.setQueryData(salesKeys.commissionPlans.detail(updatedPlan.id), updatedPlan);
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlans.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlans.active() });
      showSuccess('Commission plan deactivated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to deactivate commission plan');
    },
  });
}

/**
 * Hook to delete a commission plan
 */
export function useDeleteCommissionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => commissionService.deleteCommissionPlan(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: salesKeys.commissionPlans.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlans.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlans.active() });
      showSuccess('Commission plan deleted successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to delete commission plan');
    },
  });
}

// =====================================
// SALES COMMISSION QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated sales commissions
 */
export function useSalesCommissions(params?: GetSalesCommissionsParams) {
  return useQuery<PagedResult<SalesCommissionListItem>>({
    queryKey: salesKeys.commissions.list(params),
    queryFn: () => commissionService.getSalesCommissions(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single sales commission by ID
 */
export function useSalesCommission(id: string) {
  return useQuery<SalesCommission>({
    queryKey: salesKeys.commissions.detail(id),
    queryFn: () => commissionService.getSalesCommissionById(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch commissions by sales person
 */
export function useCommissionsBySalesPerson(salesPersonId: string, fromDate?: string, toDate?: string) {
  return useQuery<SalesCommissionListItem[]>({
    queryKey: salesKeys.commissions.bySalesPerson(salesPersonId, fromDate, toDate),
    queryFn: () => commissionService.getCommissionsBySalesPerson(salesPersonId, fromDate, toDate),
    ...queryOptions.list({ enabled: !!salesPersonId }),
  });
}

/**
 * Hook to fetch pending commissions
 */
export function usePendingCommissions() {
  return useQuery<SalesCommissionListItem[]>({
    queryKey: salesKeys.commissions.pending(),
    queryFn: () => commissionService.getPendingCommissions(),
    ...queryOptions.realtime(),
  });
}

/**
 * Hook to fetch approved commissions
 */
export function useApprovedCommissions() {
  return useQuery<SalesCommissionListItem[]>({
    queryKey: salesKeys.commissions.approved(),
    queryFn: () => commissionService.getApprovedCommissions(),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch commission summary
 */
export function useCommissionSummary(fromDate?: string, toDate?: string) {
  return useQuery<CommissionSummary>({
    queryKey: salesKeys.commissions.summary(fromDate, toDate),
    queryFn: () => commissionService.getCommissionSummary(fromDate, toDate),
    ...queryOptions.realtime(),
  });
}

/**
 * Hook to fetch sales person commission summary
 */
export function useSalesPersonCommissionSummary(salesPersonId: string, fromDate?: string, toDate?: string) {
  return useQuery<SalesPersonCommissionSummary>({
    queryKey: salesKeys.commissions.salesPersonSummary(salesPersonId, fromDate, toDate),
    queryFn: () => commissionService.getSalesPersonCommissionSummary(salesPersonId, fromDate, toDate),
    ...queryOptions.realtime({ enabled: !!salesPersonId }),
  });
}

// =====================================
// SALES COMMISSION MUTATION HOOKS
// =====================================

/**
 * Hook to calculate commission for a sale
 */
export function useCalculateCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CalculateCommissionDto) => commissionService.calculateCommission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.commissions.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissions.pending() });
      showSuccess('Commission calculated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to calculate commission');
    },
  });
}

/**
 * Hook to approve a sales commission
 */
export function useApproveCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => commissionService.approveCommission(id),
    onSuccess: (updatedCommission) => {
      queryClient.setQueryData(salesKeys.commissions.detail(updatedCommission.id), updatedCommission);
      queryClient.invalidateQueries({ queryKey: salesKeys.commissions.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissions.pending() });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissions.approved() });
      showSuccess('Commission approved');
    },
    onError: (error) => {
      showApiError(error, 'Failed to approve commission');
    },
  });
}

/**
 * Hook to reject a sales commission
 */
export function useRejectCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      commissionService.rejectCommission(id, reason),
    onSuccess: (updatedCommission) => {
      queryClient.setQueryData(salesKeys.commissions.detail(updatedCommission.id), updatedCommission);
      queryClient.invalidateQueries({ queryKey: salesKeys.commissions.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissions.pending() });
      showSuccess('Commission rejected');
    },
    onError: (error) => {
      showApiError(error, 'Failed to reject commission');
    },
  });
}

/**
 * Hook to mark a commission as paid
 */
export function useMarkCommissionAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentReference }: { id: string; paymentReference: string }) =>
      commissionService.markCommissionAsPaid(id, paymentReference),
    onSuccess: (updatedCommission) => {
      queryClient.setQueryData(salesKeys.commissions.detail(updatedCommission.id), updatedCommission);
      queryClient.invalidateQueries({ queryKey: salesKeys.commissions.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissions.approved() });
      showSuccess('Commission marked as paid');
    },
    onError: (error) => {
      showApiError(error, 'Failed to mark commission as paid');
    },
  });
}

/**
 * Hook to cancel a sales commission
 */
export function useCancelCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      commissionService.cancelCommission(id, reason),
    onSuccess: (updatedCommission) => {
      queryClient.setQueryData(salesKeys.commissions.detail(updatedCommission.id), updatedCommission);
      queryClient.invalidateQueries({ queryKey: salesKeys.commissions.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissions.pending() });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissions.approved() });
      showSuccess('Commission cancelled');
    },
    onError: (error) => {
      showApiError(error, 'Failed to cancel commission');
    },
  });
}

/**
 * Hook to bulk approve commissions
 */
export function useBulkApproveCommissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => commissionService.bulkApproveCommissions(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.commissions.all() });
      showSuccess(`${result.approvedCount} commissions approved`);
    },
    onError: (error) => {
      showApiError(error, 'Failed to bulk approve commissions');
    },
  });
}

/**
 * Hook to bulk mark commissions as paid
 */
export function useBulkMarkCommissionsAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, paymentReference }: { ids: string[]; paymentReference: string }) =>
      commissionService.bulkMarkCommissionsAsPaid(ids, paymentReference),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.commissions.all() });
      showSuccess(`${result.paidCount} commissions marked as paid`);
    },
    onError: (error) => {
      showApiError(error, 'Failed to bulk mark commissions as paid');
    },
  });
}
