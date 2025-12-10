import { apiClient, ApiResponse } from './apiClient';

// Types
export interface BucketInfo {
  name: string;
  creationDate: string;
  usedBytes: number;
  usedMB: number;
  usedGB: number;
  objectCount: number;
  tenantId?: string;
}

export interface BucketsResponse {
  success: boolean;
  data: BucketInfo[];
  totalCount: number;
  totalUsedBytes: number;
  totalUsedGB: number;
  totalObjects: number;
}

export interface DeleteBucketResponse {
  success: boolean;
  message: string;
}

export interface DeleteMultipleBucketsRequest {
  bucketNames: string[];
}

export interface BucketDeleteResult {
  bucketName: string;
  success: boolean;
  error?: string;
}

export interface DeleteMultipleBucketsResponse {
  success: boolean;
  message: string;
  results: BucketDeleteResult[];
  successCount: number;
  failCount: number;
}

// API Functions
export const storageService = {
  /**
   * Get all MinIO buckets
   */
  async getAllBuckets(): Promise<BucketsResponse> {
    const response = await apiClient.get<BucketsResponse>('/master/storage/buckets');
    return response.data;
  },

  /**
   * Delete a single bucket by name
   */
  async deleteBucket(bucketName: string): Promise<DeleteBucketResponse> {
    const response = await apiClient.delete<DeleteBucketResponse>(`/master/storage/buckets/${encodeURIComponent(bucketName)}`);
    return response.data;
  },

  /**
   * Delete multiple buckets
   */
  async deleteMultipleBuckets(bucketNames: string[]): Promise<DeleteMultipleBucketsResponse> {
    const response = await apiClient.post<DeleteMultipleBucketsResponse>('/master/storage/buckets/delete-multiple', {
      bucketNames
    });
    return response.data;
  },

  /**
   * Format bytes to human-readable string
   */
  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
};

export default storageService;
