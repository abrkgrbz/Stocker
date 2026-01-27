import axios from 'axios';
import { apiClient } from './apiClient';
import { tokenStorage } from '../utils/tokenStorage';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.stoocker.app';

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

export interface DeleteMultipleBucketsResponse {
    success: boolean;
    message: string;
    results: any[];
    successCount: number;
    failCount: number;
}

class StorageService {
    private readonly baseUrl = '/api/master/storage/buckets';

    private getHeaders() {
        const token = tokenStorage.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    async getAllBuckets(): Promise<BucketsResponse> {
        // Use raw axios to get full response including success, totalCount etc.
        // apiClient unwraps too aggressively for this specific endpoint
        const response = await axios.get<BucketsResponse>(`${BASE_URL}${this.baseUrl}`, {
            headers: this.getHeaders()
        });
        return response.data;
    }

    async listObjects(bucketName: string, prefix?: string): Promise<ListObjectsResponse> {
        const params = prefix ? { prefix } : {};
        // Use raw axios to preservation metadata
        const response = await axios.get<ListObjectsResponse>(
            `${BASE_URL}${this.baseUrl}/${encodeURIComponent(bucketName)}/objects`,
            {
                params,
                headers: this.getHeaders()
            }
        );
        return response.data;
    }

    async createBucket(bucketName: string): Promise<{ success: boolean; message: string }> {
        // @ts-ignore
        return apiClient.post(this.baseUrl, { bucketName });
    }

    async uploadFiles(bucketName: string, files: File[], prefix?: string): Promise<any> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        // Legacy uses 'path' query param instead of 'prefix' form data
        const params = prefix ? { path: prefix } : {};

        return apiClient.post(
            `${this.baseUrl}/${encodeURIComponent(bucketName)}/upload`,
            formData,
            {
                params,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    }

    async deleteObject(bucketName: string, objectKey: string): Promise<any> {
        // @ts-ignore
        return apiClient.delete(`${this.baseUrl}/${encodeURIComponent(bucketName)}/objects`, {
            params: { objectName: objectKey }
        });
    }

    async getPresignedUrl(bucketName: string, objectKey: string, expiresInHours: number = 24): Promise<{ success: boolean; url: string }> {
        // @ts-ignore
        return apiClient.get(`${this.baseUrl}/${encodeURIComponent(bucketName)}/objects/url`, {
            params: { objectName: objectKey, expiresInHours }
        });
    }

    async createFolder(bucketName: string, folderPath: string): Promise<any> {
        return apiClient.post(`${this.baseUrl}/${encodeURIComponent(bucketName)}/folders`, { folderPath });
    }

    async deleteBucket(bucketName: string): Promise<boolean> {
        const response = await apiClient.delete(`${this.baseUrl}/${encodeURIComponent(bucketName)}`);
        // @ts-ignore
        return response;
    }

    async deleteMultipleBuckets(bucketNames: string[]): Promise<DeleteMultipleBucketsResponse> {
        // @ts-ignore
        return apiClient.post(`${this.baseUrl}/delete-multiple`, { bucketNames });
    }

    async deleteMultipleObjects(bucketName: string, objectKeys: string[]): Promise<any> {
        return apiClient.post(`${this.baseUrl}/${encodeURIComponent(bucketName)}/objects/delete-multiple`, { objectKeys });
    }

    formatBytes(bytes: number, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }
}

export const storageService = new StorageService();
export type { BucketInfo as StorageDto }; // Keep compatibility
