// =====================================
// SALES TARGET HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { targetService } from '../services/target.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  SalesTargetDto,
  SalesTargetListDto,
  SalesTargetStatisticsDto,
  LeaderboardEntryDto,
  PagedResult,
  SalesTargetQueryParams,
  CreateSalesTargetCommand,
  UpdateSalesTargetCommand,
  UpdateTargetProgressCommand,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated sales targets
 */
export function useSalesTargets(params?: SalesTargetQueryParams) {
  return useQuery<PagedResult<SalesTargetListDto>>({
    queryKey: salesKeys.targets.list(params),
    queryFn: () => targetService.getTargets(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single target by ID
 */
export function useSalesTarget(id: string) {
  return useQuery<SalesTargetDto>({
    queryKey: salesKeys.targets.detail(id),
    queryFn: () => targetService.getTarget(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch targets by sales rep
 */
export function useSalesTargetsBySalesRep(salesRepId: string) {
  return useQuery<SalesTargetListDto[]>({
    queryKey: salesKeys.targets.bySalesRep(salesRepId),
    queryFn: () => targetService.getTargetsBySalesRep(salesRepId),
    ...queryOptions.list({ enabled: !!salesRepId }),
  });
}

/**
 * Hook to fetch targets by team
 */
export function useSalesTargetsByTeam(teamId: string) {
  return useQuery<SalesTargetListDto[]>({
    queryKey: salesKeys.targets.byTeam(teamId),
    queryFn: () => targetService.getTargetsByTeam(teamId),
    ...queryOptions.list({ enabled: !!teamId }),
  });
}

/**
 * Hook to fetch current period targets
 */
export function useCurrentSalesTargets() {
  return useQuery<SalesTargetListDto[]>({
    queryKey: salesKeys.targets.current(),
    queryFn: () => targetService.getCurrentTargets(),
    ...queryOptions.realtime(),
  });
}

/**
 * Hook to fetch my targets (current user)
 */
export function useMyTargets() {
  return useQuery<SalesTargetListDto[]>({
    queryKey: salesKeys.targets.my(),
    queryFn: () => targetService.getMyTargets(),
    ...queryOptions.realtime(),
  });
}

/**
 * Hook to fetch target statistics
 */
export function useSalesTargetStatistics() {
  return useQuery<SalesTargetStatisticsDto>({
    queryKey: salesKeys.targets.statistics(),
    queryFn: () => targetService.getTargetStatistics(),
    ...queryOptions.realtime(),
  });
}

/**
 * Hook to fetch leaderboard
 */
export function useLeaderboard(period?: string, limit?: number) {
  return useQuery<LeaderboardEntryDto[]>({
    queryKey: salesKeys.targets.leaderboard(period, limit),
    queryFn: () => targetService.getLeaderboard(period, limit),
    ...queryOptions.realtime(),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new target
 */
export function useCreateSalesTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesTargetCommand) => targetService.createTarget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.statistics() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.leaderboard() });
      showSuccess('Sales target created successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create sales target');
    },
  });
}

/**
 * Hook to update a target
 */
export function useUpdateSalesTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalesTargetCommand }) =>
      targetService.updateTarget(id, data),
    onSuccess: (updatedTarget) => {
      queryClient.setQueryData(salesKeys.targets.detail(updatedTarget.id), updatedTarget);
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      showSuccess('Sales target updated successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update sales target');
    },
  });
}

/**
 * Hook to delete a target
 */
export function useDeleteSalesTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => targetService.deleteTarget(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: salesKeys.targets.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.statistics() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.leaderboard() });
      showSuccess('Sales target deleted successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to delete sales target');
    },
  });
}

// =====================================
// WORKFLOW HOOKS
// =====================================

/**
 * Hook to update target progress
 */
export function useUpdateTargetProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTargetProgressCommand }) =>
      targetService.updateProgress(id, data),
    onSuccess: (updatedTarget) => {
      queryClient.setQueryData(salesKeys.targets.detail(updatedTarget.id), updatedTarget);
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.statistics() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.leaderboard() });
      showSuccess('Progress updated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update progress');
    },
  });
}

/**
 * Hook to activate a target
 */
export function useActivateSalesTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => targetService.activateTarget(id),
    onSuccess: (updatedTarget) => {
      queryClient.setQueryData(salesKeys.targets.detail(updatedTarget.id), updatedTarget);
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.current() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.statistics() });
      showSuccess('Target activated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to activate target');
    },
  });
}

/**
 * Hook to deactivate a target
 */
export function useDeactivateSalesTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => targetService.deactivateTarget(id),
    onSuccess: (updatedTarget) => {
      queryClient.setQueryData(salesKeys.targets.detail(updatedTarget.id), updatedTarget);
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.current() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.statistics() });
      showSuccess('Target deactivated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to deactivate target');
    },
  });
}

/**
 * Hook to recalculate target progress
 */
export function useRecalculateTargetProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => targetService.recalculateProgress(id),
    onSuccess: (updatedTarget) => {
      queryClient.setQueryData(salesKeys.targets.detail(updatedTarget.id), updatedTarget);
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.statistics() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.leaderboard() });
      showSuccess('Progress recalculated');
    },
    onError: (error) => {
      showApiError(error, 'Failed to recalculate progress');
    },
  });
}

/**
 * Hook to bulk create targets for team
 */
export function useBulkCreateTeamTargets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: Omit<CreateSalesTargetCommand, 'salesRepId'>[] }) =>
      targetService.bulkCreateForTeam(teamId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.byTeam(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.statistics() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.leaderboard() });
      showSuccess('Team targets created successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to create team targets');
    },
  });
}
