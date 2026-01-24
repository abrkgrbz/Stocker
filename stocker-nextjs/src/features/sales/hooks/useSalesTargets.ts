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
  CreateSalesTargetDto,
  AssignSalesTargetDto,
  AddSalesTargetPeriodDto,
  AddSalesTargetProductDto,
  RecordAchievementDto,
  SalesTargetQueryParams,
  PagedResult,
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
 * Hook to fetch target by code
 */
export function useSalesTargetByCode(code: string) {
  return useQuery<SalesTargetDto>({
    queryKey: [...salesKeys.targets.all(), 'code', code] as const,
    queryFn: () => targetService.getTargetByCode(code),
    ...queryOptions.detail({ enabled: !!code }),
  });
}

/**
 * Hook to fetch targets by year
 */
export function useSalesTargetsByYear(year: number) {
  return useQuery<SalesTargetListDto[]>({
    queryKey: [...salesKeys.targets.all(), 'year', year] as const,
    queryFn: () => targetService.getTargetsByYear(year),
    ...queryOptions.list({ enabled: !!year }),
  });
}

/**
 * Hook to fetch targets by sales representative
 */
export function useSalesTargetsByRepresentative(salesRepId: string) {
  return useQuery<SalesTargetListDto[]>({
    queryKey: salesKeys.targets.bySalesRep(salesRepId),
    queryFn: () => targetService.getTargetsByRepresentative(salesRepId),
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
 * Hook to fetch active targets
 */
export function useActiveTargets() {
  return useQuery<SalesTargetListDto[]>({
    queryKey: salesKeys.targets.current(),
    queryFn: () => targetService.getActiveTargets(),
    ...queryOptions.list(),
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
    mutationFn: (data: CreateSalesTargetDto) => targetService.createTarget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      showSuccess('Satış hedefi başarıyla oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Satış hedefi oluşturulamadı');
    },
  });
}

/**
 * Hook to assign target to a representative
 */
export function useAssignTargetToRepresentative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignSalesTargetDto }) =>
      targetService.assignToRepresentative(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      showSuccess('Hedef temsilciye atandı');
    },
    onError: (error) => {
      showApiError(error, 'Hedef temsilciye atanamadı');
    },
  });
}

/**
 * Hook to assign target to a team
 */
export function useAssignTargetToTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignSalesTargetDto }) =>
      targetService.assignToTeam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      showSuccess('Hedef takıma atandı');
    },
    onError: (error) => {
      showApiError(error, 'Hedef takıma atanamadı');
    },
  });
}

/**
 * Hook to assign target to a territory
 */
export function useAssignTargetToTerritory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignSalesTargetDto }) =>
      targetService.assignToTerritory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      showSuccess('Hedef bölgeye atandı');
    },
    onError: (error) => {
      showApiError(error, 'Hedef bölgeye atanamadı');
    },
  });
}

/**
 * Hook to add a period to a target
 */
export function useAddTargetPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddSalesTargetPeriodDto }) =>
      targetService.addPeriod(id, data),
    onSuccess: (updatedTarget) => {
      queryClient.setQueryData(salesKeys.targets.detail(updatedTarget.id), updatedTarget);
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      showSuccess('Hedef dönemi eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Hedef dönemi eklenemedi');
    },
  });
}

/**
 * Hook to generate periods for a target
 */
export function useGenerateTargetPeriods() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => targetService.generatePeriods(id),
    onSuccess: (updatedTarget) => {
      queryClient.setQueryData(salesKeys.targets.detail(updatedTarget.id), updatedTarget);
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      showSuccess('Hedef dönemleri oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Hedef dönemleri oluşturulamadı');
    },
  });
}

/**
 * Hook to add a product to a target
 */
export function useAddTargetProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddSalesTargetProductDto }) =>
      targetService.addProduct(id, data),
    onSuccess: (updatedTarget) => {
      queryClient.setQueryData(salesKeys.targets.detail(updatedTarget.id), updatedTarget);
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      showSuccess('Hedef ürün eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Hedef ürün eklenemedi');
    },
  });
}

/**
 * Hook to record an achievement against a target
 */
export function useRecordAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecordAchievementDto }) =>
      targetService.recordAchievement(id, data),
    onSuccess: (updatedTarget) => {
      queryClient.setQueryData(salesKeys.targets.detail(updatedTarget.id), updatedTarget);
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      showSuccess('Başarı kaydedildi');
    },
    onError: (error) => {
      showApiError(error, 'Başarı kaydedilemedi');
    },
  });
}

// =====================================
// WORKFLOW HOOKS
// =====================================

/**
 * Hook to activate a target
 */
export function useActivateSalesTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => targetService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.current() });
      showSuccess('Satış hedefi aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Satış hedefi aktifleştirilemedi');
    },
  });
}

/**
 * Hook to close a target
 */
export function useCloseSalesTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => targetService.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.current() });
      showSuccess('Satış hedefi kapatıldı');
    },
    onError: (error) => {
      showApiError(error, 'Satış hedefi kapatılamadı');
    },
  });
}

/**
 * Hook to cancel a target
 */
export function useCancelSalesTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      targetService.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.current() });
      showSuccess('Satış hedefi iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Satış hedefi iptal edilemedi');
    },
  });
}

/**
 * Hook to deactivate a sales target
 */
export function useDeactivateSalesTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => targetService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.targets.current() });
      showSuccess('Satış hedefi deaktif edildi');
    },
    onError: (error) => {
      showApiError(error, 'Satış hedefi deaktif edilemedi');
    },
  });
}

/**
 * Hook to get sales target statistics
 */
export function useSalesTargetStatistics() {
  return useQuery({
    queryKey: salesKeys.targets.statistics(),
    queryFn: () => targetService.getStatistics(),
    ...queryOptions.staleShort,
  });
}

/**
 * Hook to get leaderboard data
 */
export function useLeaderboard(period?: string, limit?: number) {
  return useQuery({
    queryKey: [...salesKeys.targets.all(), 'leaderboard', period, limit] as const,
    queryFn: () => targetService.getLeaderboard(period, limit),
    ...queryOptions.staleShort,
  });
}
