/**
 * React Query Hooks for Tenant Settings
 * Handles tenant configuration and settings management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TenantSettingsService } from '../services/tenant-settings.service';
import type {
  TenantSettingsDto,
  UpdateTenantSettingsRequest,
  TenantStatsDto,
} from '../services/tenant-settings.service';
import { queryOptions } from '../query-options';

// =====================================
// QUERY KEYS
// =====================================

export const tenantSettingsKeys = {
  all: ['tenant-settings'] as const,
  settings: () => [...tenantSettingsKeys.all, 'settings'] as const,
  stats: () => [...tenantSettingsKeys.all, 'stats'] as const,
};

// =====================================
// QUERIES
// =====================================

/**
 * Hook to get tenant settings
 */
export function useTenantSettings(options?: { enabled?: boolean }) {
  return useQuery<TenantSettingsDto, Error>({
    queryKey: tenantSettingsKeys.settings(),
    queryFn: () => TenantSettingsService.getSettings(),
    ...queryOptions.static({ enabled: options?.enabled ?? true }),
  });
}

/**
 * Hook to get tenant statistics
 */
export function useTenantStats(options?: { enabled?: boolean }) {
  return useQuery<TenantStatsDto, Error>({
    queryKey: tenantSettingsKeys.stats(),
    queryFn: () => TenantSettingsService.getStats(),
    ...queryOptions.static({ enabled: options?.enabled ?? true }),
  });
}

// =====================================
// MUTATIONS
// =====================================

/**
 * Hook to update tenant settings
 */
export function useUpdateTenantSettings() {
  const queryClient = useQueryClient();

  return useMutation<TenantSettingsDto, Error, UpdateTenantSettingsRequest>({
    mutationFn: (data) => TenantSettingsService.updateSettings(data),
    onSuccess: (data) => {
      // Update the settings cache with new data
      queryClient.setQueryData(tenantSettingsKeys.settings(), data);
    },
  });
}

/**
 * Hook to upload tenant logo
 */
export function useUploadTenantLogo() {
  const queryClient = useQueryClient();

  return useMutation<{ logoUrl: string }, Error, File>({
    mutationFn: (file) => TenantSettingsService.uploadLogo(file),
    onSuccess: (data) => {
      // Update the settings cache with new logo URL
      queryClient.setQueryData<TenantSettingsDto | undefined>(
        tenantSettingsKeys.settings(),
        (old) => (old ? { ...old, logoUrl: data.logoUrl } : undefined)
      );
    },
  });
}

/**
 * Hook to delete tenant logo
 */
export function useDeleteTenantLogo() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => TenantSettingsService.deleteLogo(),
    onSuccess: () => {
      // Update the settings cache to remove logo URL
      queryClient.setQueryData<TenantSettingsDto | undefined>(
        tenantSettingsKeys.settings(),
        (old) => (old ? { ...old, logoUrl: undefined } : undefined)
      );
    },
  });
}

// =====================================
// UTILITY FUNCTIONS
// =====================================

/**
 * Format storage size to human readable string
 */
export function formatStorageSize(sizeGB: number): string {
  if (sizeGB < 1) {
    return `${Math.round(sizeGB * 1024)} MB`;
  }
  return `${sizeGB.toFixed(1)} GB`;
}

/**
 * Get storage usage percentage
 */
export function getStorageUsagePercentage(usedGB: number, quotaGB: number): number {
  if (quotaGB <= 0) return 0;
  return Math.round((usedGB / quotaGB) * 100);
}

/**
 * Get storage status based on usage
 */
export function getStorageStatus(usedGB: number, quotaGB: number): {
  status: 'success' | 'warning' | 'error';
  label: string;
  color: string;
} {
  const percentage = getStorageUsagePercentage(usedGB, quotaGB);

  if (percentage < 70) {
    return { status: 'success', label: 'İyi', color: '#52c41a' };
  } else if (percentage < 90) {
    return { status: 'warning', label: 'Dikkat', color: '#faad14' };
  } else {
    return { status: 'error', label: 'Kritik', color: '#ff4d4f' };
  }
}
