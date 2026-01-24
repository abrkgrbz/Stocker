// =====================================
// SALES PIPELINE HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pipelineService } from '../services/pipeline.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  SalesPipelineDto,
  SalesPipelineListDto,
  CreateSalesPipelineDto,
  AddPipelineStageDto,
  SalesPipelineQueryParams,
  PagedResult,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated pipelines
 */
export function usePipelines(params?: SalesPipelineQueryParams) {
  return useQuery<PagedResult<SalesPipelineListDto>>({
    queryKey: salesKeys.pipelines.list(params),
    queryFn: () => pipelineService.getPipelines(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single pipeline by ID
 */
export function usePipeline(id: string) {
  return useQuery<SalesPipelineDto>({
    queryKey: salesKeys.pipelines.detail(id),
    queryFn: () => pipelineService.getPipeline(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch pipeline by code
 */
export function usePipelineByCode(code: string) {
  return useQuery<SalesPipelineDto>({
    queryKey: [...salesKeys.pipelines.all(), 'code', code] as const,
    queryFn: () => pipelineService.getPipelineByCode(code),
    ...queryOptions.detail({ enabled: !!code }),
  });
}

/**
 * Hook to fetch default pipeline
 */
export function useDefaultPipeline() {
  return useQuery<SalesPipelineDto>({
    queryKey: [...salesKeys.pipelines.all(), 'default'] as const,
    queryFn: () => pipelineService.getDefaultPipeline(),
    ...queryOptions.detail({}),
  });
}

/**
 * Hook to fetch active pipelines
 */
export function useActivePipelines() {
  return useQuery<SalesPipelineListDto[]>({
    queryKey: salesKeys.pipelines.active(),
    queryFn: () => pipelineService.getActivePipelines(),
    ...queryOptions.list(),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new pipeline
 */
export function useCreatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesPipelineDto) => pipelineService.createPipeline(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.pipelines.lists() });
      showSuccess('Pipeline başarıyla oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Pipeline oluşturulamadı');
    },
  });
}

/**
 * Hook to update pipeline details
 */
export function useUpdatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string; type?: string } }) =>
      pipelineService.updatePipeline(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.pipelines.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.pipelines.lists() });
      showSuccess('Pipeline güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Pipeline güncellenemedi');
    },
  });
}

/**
 * Hook to add a stage to a pipeline
 */
export function useAddPipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddPipelineStageDto }) =>
      pipelineService.addStage(id, data),
    onSuccess: (updatedPipeline) => {
      queryClient.setQueryData(salesKeys.pipelines.detail(updatedPipeline.id), updatedPipeline);
      queryClient.invalidateQueries({ queryKey: salesKeys.pipelines.lists() });
      showSuccess('Pipeline aşaması eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Pipeline aşaması eklenemedi');
    },
  });
}

/**
 * Hook to remove a stage from a pipeline
 */
export function useRemovePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stageId }: { id: string; stageId: string }) =>
      pipelineService.removeStage(id, stageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.pipelines.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.pipelines.lists() });
      showSuccess('Pipeline aşaması kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'Pipeline aşaması kaldırılamadı');
    },
  });
}

/**
 * Hook to reorder a stage in a pipeline
 */
export function useReorderPipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stageId, newOrderIndex }: { id: string; stageId: string; newOrderIndex: number }) =>
      pipelineService.reorderStage(id, stageId, newOrderIndex),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.pipelines.detail(variables.id) });
      showSuccess('Pipeline aşama sırası güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Pipeline aşama sırası güncellenemedi');
    },
  });
}

// =====================================
// WORKFLOW HOOKS
// =====================================

/**
 * Hook to set a pipeline as default
 */
export function useSetDefaultPipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pipelineService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.pipelines.all() });
      showSuccess('Varsayılan pipeline ayarlandı');
    },
    onError: (error) => {
      showApiError(error, 'Varsayılan pipeline ayarlanamadı');
    },
  });
}

/**
 * Hook to activate a pipeline
 */
export function useActivatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pipelineService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.pipelines.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.pipelines.active() });
      showSuccess('Pipeline aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Pipeline aktifleştirilemedi');
    },
  });
}

/**
 * Hook to deactivate a pipeline
 */
export function useDeactivatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pipelineService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.pipelines.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.pipelines.active() });
      showSuccess('Pipeline deaktif edildi');
    },
    onError: (error) => {
      showApiError(error, 'Pipeline deaktif edilemedi');
    },
  });
}
