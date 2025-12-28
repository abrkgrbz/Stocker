/**
 * Backup React Query Hooks
 * Provides data fetching and mutations for backup operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BackupService } from '../services/backup.service';
import type {
  BackupFilters,
  BackupDto,
  BackupDetailDto,
  BackupStatisticsDto,
  CreateBackupRequest,
  RestoreBackupRequest,
  PagedResult,
  BackupScheduleDto,
  CreateBackupScheduleRequest,
  UpdateBackupScheduleRequest,
} from '../services/backup.service';

// Query Keys
export const backupKeys = {
  all: ['backups'] as const,
  lists: () => [...backupKeys.all, 'list'] as const,
  list: (filters?: BackupFilters) => [...backupKeys.lists(), filters] as const,
  details: () => [...backupKeys.all, 'detail'] as const,
  detail: (id: string) => [...backupKeys.details(), id] as const,
  statistics: () => [...backupKeys.all, 'statistics'] as const,
  schedules: () => [...backupKeys.all, 'schedules'] as const,
  schedule: (id: string) => [...backupKeys.schedules(), id] as const,
};

/**
 * Hook to fetch paginated backups with filtering
 */
export function useBackups(filters?: BackupFilters) {
  return useQuery<PagedResult<BackupDto>, Error>({
    queryKey: backupKeys.list(filters),
    queryFn: () => BackupService.getBackups(filters),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Hook to fetch a single backup by ID
 */
export function useBackupDetail(id: string) {
  return useQuery<BackupDetailDto, Error>({
    queryKey: backupKeys.detail(id),
    queryFn: () => BackupService.getBackupById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch backup statistics
 */
export function useBackupStatistics() {
  return useQuery<BackupStatisticsDto, Error>({
    queryKey: backupKeys.statistics(),
    queryFn: () => BackupService.getStatistics(),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to create a new backup
 */
export function useCreateBackup() {
  const queryClient = useQueryClient();

  return useMutation<BackupDto, Error, CreateBackupRequest>({
    mutationFn: (request) => BackupService.createBackup(request),
    onSuccess: () => {
      // Invalidate backup lists and statistics
      queryClient.invalidateQueries({ queryKey: backupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: backupKeys.statistics() });
    },
  });
}

/**
 * Hook to delete a backup
 */
export function useDeleteBackup() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => BackupService.deleteBackup(id),
    onSuccess: () => {
      // Invalidate backup lists and statistics
      queryClient.invalidateQueries({ queryKey: backupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: backupKeys.statistics() });
    },
  });
}

/**
 * Hook to restore from a backup
 */
export function useRestoreBackup() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; request?: RestoreBackupRequest }>({
    mutationFn: ({ id, request }) => BackupService.restoreBackup(id, request),
    onSuccess: (_, variables) => {
      // Invalidate the specific backup detail
      queryClient.invalidateQueries({ queryKey: backupKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: backupKeys.lists() });
    },
  });
}

/**
 * Hook to get download URL for a backup
 */
export function useBackupDownload() {
  return useMutation<{ downloadUrl: string; fileName: string; expiresAt: string }, Error, { id: string; expiryMinutes?: number }>({
    mutationFn: ({ id, expiryMinutes }) => BackupService.getDownloadUrl(id, expiryMinutes),
  });
}

// =====================================
// SCHEDULE HOOKS
// =====================================

/**
 * Hook to fetch all backup schedules
 */
export function useBackupSchedules() {
  return useQuery<BackupScheduleDto[], Error>({
    queryKey: backupKeys.schedules(),
    queryFn: () => BackupService.getSchedules(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single schedule by ID
 */
export function useBackupSchedule(id: string) {
  return useQuery<BackupScheduleDto, Error>({
    queryKey: backupKeys.schedule(id),
    queryFn: () => BackupService.getScheduleById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new backup schedule
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation<BackupScheduleDto, Error, CreateBackupScheduleRequest>({
    mutationFn: (request) => BackupService.createSchedule(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backupKeys.schedules() });
    },
  });
}

/**
 * Hook to update a backup schedule
 */
export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; request: UpdateBackupScheduleRequest }>({
    mutationFn: ({ id, request }) => BackupService.updateSchedule(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: backupKeys.schedules() });
      queryClient.invalidateQueries({ queryKey: backupKeys.schedule(variables.id) });
    },
  });
}

/**
 * Hook to delete a backup schedule
 */
export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => BackupService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backupKeys.schedules() });
    },
  });
}

/**
 * Hook to enable a backup schedule
 */
export function useEnableSchedule() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => BackupService.enableSchedule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: backupKeys.schedules() });
      queryClient.invalidateQueries({ queryKey: backupKeys.schedule(id) });
    },
  });
}

/**
 * Hook to disable a backup schedule
 */
export function useDisableSchedule() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => BackupService.disableSchedule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: backupKeys.schedules() });
      queryClient.invalidateQueries({ queryKey: backupKeys.schedule(id) });
    },
  });
}

/**
 * Hook to trigger manual cleanup
 */
export function useTriggerCleanup() {
  return useMutation<{ jobId: string }, Error, number | undefined>({
    mutationFn: (retentionDays) => BackupService.triggerCleanup(retentionDays),
  });
}

// Re-export utility functions
export {
  formatBytes,
  getStatusColor,
  getStatusLabel,
  getBackupTypeLabel,
  getScheduleTypeLabel,
  getCronDescription,
} from '../services/backup.service';

// Re-export types
export type {
  BackupScheduleDto,
  CreateBackupScheduleRequest,
  UpdateBackupScheduleRequest,
} from '../services/backup.service';
