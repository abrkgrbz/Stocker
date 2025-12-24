/**
 * React Query Hooks for Storage Management
 * Handles tenant storage usage and quota operations
 */

import { useQuery } from '@tanstack/react-query';
import { StorageService } from '../services/storage.service';
import type { StorageUsageResponse, BucketExistsResponse, BucketNameResponse } from '../services/storage.service';
import { queryOptions } from '../query-options';

// =====================================
// QUERY KEYS
// =====================================

export const storageKeys = {
  all: ['storage'] as const,
  usage: () => [...storageKeys.all, 'usage'] as const,
  exists: () => [...storageKeys.all, 'exists'] as const,
  bucketName: () => [...storageKeys.all, 'bucket-name'] as const,
};

// =====================================
// QUERIES
// =====================================

/**
 * Hook to get current storage usage
 */
export function useStorageUsage(options?: { enabled?: boolean }) {
  return useQuery<StorageUsageResponse, Error>({
    queryKey: storageKeys.usage(),
    queryFn: () => StorageService.getStorageUsage(),
    ...queryOptions.static({ enabled: options?.enabled ?? true }),
  });
}

/**
 * Hook to check if tenant bucket exists
 */
export function useBucketExists(options?: { enabled?: boolean }) {
  return useQuery<BucketExistsResponse, Error>({
    queryKey: storageKeys.exists(),
    queryFn: () => StorageService.checkBucketExists(),
    ...queryOptions.static({ staleTime: 30 * 60 * 1000, enabled: options?.enabled ?? true }),
  });
}

/**
 * Hook to get bucket name
 */
export function useBucketName(options?: { enabled?: boolean }) {
  return useQuery<BucketNameResponse, Error>({
    queryKey: storageKeys.bucketName(),
    queryFn: () => StorageService.getBucketName(),
    ...queryOptions.static({ staleTime: Infinity, enabled: options?.enabled ?? true }),
  });
}

// =====================================
// UTILITY FUNCTIONS
// =====================================

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get storage status based on usage percentage
 */
export function getStorageStatus(usagePercentage: number): {
  status: 'success' | 'warning' | 'error';
  label: string;
  color: string;
} {
  if (usagePercentage < 70) {
    return { status: 'success', label: 'İyi', color: '#52c41a' };
  } else if (usagePercentage < 90) {
    return { status: 'warning', label: 'Dikkat', color: '#faad14' };
  } else {
    return { status: 'error', label: 'Kritik', color: '#ff4d4f' };
  }
}
