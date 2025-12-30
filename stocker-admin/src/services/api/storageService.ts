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

// File Browser Types
export interface StorageObject {
  name: string;
  key: string;
  size: number;
  lastModified: string;
  contentType: string;
  isFolder: boolean;
  etag?: string;
  url?: string;
}

export interface ListObjectsResponse {
  success: boolean;
  data: StorageObject[];
  bucketName: string;
  prefix: string;
  totalCount: number;
  totalSize: number;
  folderCount: number;
  fileCount: number;
}

export interface UploadResult {
  success: boolean;
  fileName: string;
  objectName?: string;
  size?: number;
  etag?: string;
  url?: string;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  results: UploadResult[];
  successCount: number;
  failCount: number;
}

export interface PresignedUrlResponse {
  success: boolean;
  url: string;
  objectName: string;
  expiresInHours: number;
  expiresAt: string;
}

export interface CreateBucketResponse {
  success: boolean;
  message: string;
  bucketName?: string;
}

export interface CreateFolderResponse {
  success: boolean;
  message: string;
  folderPath?: string;
}

export interface DeleteObjectsResponse {
  success: boolean;
  message: string;
  deletedCount: number;
}

// API Functions
export const storageService = {
  /**
   * Get all MinIO buckets
   * Note: Using raw axios client because we need the full response structure
   */
  async getAllBuckets(): Promise<BucketsResponse> {
    const response = await apiClient.getClient().get<BucketsResponse>('/api/master/storage/buckets');
    return response.data;
  },

  /**
   * Delete a single bucket by name
   */
  async deleteBucket(bucketName: string): Promise<DeleteBucketResponse> {
    const response = await apiClient.getClient().delete<DeleteBucketResponse>(`/api/master/storage/buckets/${encodeURIComponent(bucketName)}`);
    return response.data;
  },

  /**
   * Delete multiple buckets
   */
  async deleteMultipleBuckets(bucketNames: string[]): Promise<DeleteMultipleBucketsResponse> {
    const response = await apiClient.getClient().post<DeleteMultipleBucketsResponse>('/api/master/storage/buckets/delete-multiple', {
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
  },

  // ==================== FILE BROWSER OPERATIONS ====================

  /**
   * Create a new bucket
   */
  async createBucket(bucketName: string): Promise<CreateBucketResponse> {
    const response = await apiClient.getClient().post<CreateBucketResponse>('/api/master/storage/buckets', {
      bucketName
    });
    return response.data;
  },

  /**
   * List objects in a bucket
   */
  async listObjects(bucketName: string, prefix?: string): Promise<ListObjectsResponse> {
    const params = prefix ? { prefix } : {};
    const response = await apiClient.getClient().get<ListObjectsResponse>(
      `/api/master/storage/buckets/${encodeURIComponent(bucketName)}/objects`,
      { params }
    );
    return response.data;
  },

  /**
   * Upload files to a bucket
   */
  async uploadFiles(bucketName: string, files: File[], path?: string): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const params = path ? { path } : {};
    const response = await apiClient.getClient().post<UploadResponse>(
      `/api/master/storage/buckets/${encodeURIComponent(bucketName)}/upload`,
      formData,
      { params }
    );
    return response.data;
  },

  /**
   * Download a file from a bucket
   */
  async downloadFile(bucketName: string, objectName: string): Promise<Blob> {
    const response = await apiClient.getClient().get(
      `/api/master/storage/buckets/${encodeURIComponent(bucketName)}/objects/download`,
      {
        params: { objectName },
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Get presigned URL for a file
   */
  async getPresignedUrl(bucketName: string, objectName: string, expiresInHours: number = 24): Promise<PresignedUrlResponse> {
    const response = await apiClient.getClient().get<PresignedUrlResponse>(
      `/api/master/storage/buckets/${encodeURIComponent(bucketName)}/objects/url`,
      { params: { objectName, expiresInHours } }
    );
    return response.data;
  },

  /**
   * Delete a single object from a bucket
   */
  async deleteObject(bucketName: string, objectName: string): Promise<DeleteBucketResponse> {
    const response = await apiClient.getClient().delete<DeleteBucketResponse>(
      `/api/master/storage/buckets/${encodeURIComponent(bucketName)}/objects`,
      { params: { objectName } }
    );
    return response.data;
  },

  /**
   * Delete multiple objects from a bucket
   */
  async deleteObjects(bucketName: string, objectNames: string[]): Promise<DeleteObjectsResponse> {
    const response = await apiClient.getClient().post<DeleteObjectsResponse>(
      `/api/master/storage/buckets/${encodeURIComponent(bucketName)}/objects/delete-multiple`,
      { objectNames }
    );
    return response.data;
  },

  /**
   * Create a folder in a bucket
   */
  async createFolder(bucketName: string, folderPath: string): Promise<CreateFolderResponse> {
    const response = await apiClient.getClient().post<CreateFolderResponse>(
      `/api/master/storage/buckets/${encodeURIComponent(bucketName)}/folders`,
      { folderPath }
    );
    return response.data;
  },

  /**
   * Helper: Trigger file download in browser
   */
  triggerDownload(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Helper: Get file icon based on content type
   */
  getFileIcon(contentType: string, isFolder: boolean): string {
    if (isFolder) return 'folder';
    if (contentType.startsWith('image/')) return 'file-image';
    if (contentType.startsWith('video/')) return 'file-video';
    if (contentType.startsWith('audio/')) return 'file-audio';
    if (contentType.includes('pdf')) return 'file-pdf';
    if (contentType.includes('zip') || contentType.includes('rar') || contentType.includes('tar')) return 'file-zip';
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'file-excel';
    if (contentType.includes('word') || contentType.includes('document')) return 'file-word';
    if (contentType.includes('text')) return 'file-text';
    if (contentType.includes('json') || contentType.includes('javascript')) return 'file-code';
    return 'file';
  }
};

export default storageService;
