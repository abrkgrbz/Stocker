/**
 * Storage Service
 * Handles tenant storage operations and quota management
 */

import { apiClient } from '../client';

// =====================================
// TYPES
// =====================================

export interface StorageUsageResponse {
  bucketName: string;
  quotaGB: number;
  usedGB: number;
  availableGB: number;
  usagePercentage: number;
  objectCount: number;
  quotaBytes: number;
  usedBytes: number;
  availableBytes: number;
}

export interface BucketExistsResponse {
  exists: boolean;
  bucketName: string;
}

export interface BucketNameResponse {
  bucketName: string;
}

export interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================================
// SERVICE
// =====================================

export const StorageService = {
  /**
   * Get current storage usage for the tenant
   */
  async getStorageUsage(): Promise<StorageUsageResponse> {
    const response = await apiClient.get<ApiResponseWrapper<StorageUsageResponse>>(
      '/tenant/storage/usage'
    );
    return (response as any).data || response;
  },

  /**
   * Check if tenant storage bucket exists
   */
  async checkBucketExists(): Promise<BucketExistsResponse> {
    const response = await apiClient.get<ApiResponseWrapper<BucketExistsResponse>>(
      '/tenant/storage/exists'
    );
    return (response as any).data || response;
  },

  /**
   * Get the bucket name for the current tenant
   */
  async getBucketName(): Promise<BucketNameResponse> {
    const response = await apiClient.get<ApiResponseWrapper<BucketNameResponse>>(
      '/tenant/storage/bucket-name'
    );
    return (response as any).data || response;
  },
};

export default StorageService;
