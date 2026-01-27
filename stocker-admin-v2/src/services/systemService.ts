import { apiClient } from './apiClient';

export interface DockerCacheInfo {
    type: string;
    total: string;
    active: string;
    size: string;
    reclaimable: string;
}

export interface DockerCleanupResult {
    success: boolean;
    message: string;
    spaceClaimed?: string;
    details?: {
        imagesRemoved: number;
        containersRemoved: number;
        volumesRemoved: number;
        buildCacheRemoved: string;
    };
}

export interface SystemError {
    id: string;
    timestamp: string;
    level: 'error' | 'warning' | 'info';
    source: string;
    message: string;
    stackTrace?: string;
    resolved: boolean;
    resolvedAt?: string;
    resolvedBy?: string;
}

export interface ErrorStatistics {
    totalErrors: number;
    unresolvedErrors: number;
    criticalErrors: number;
    errorsBySeverity: { [key: string]: number };
    errorsBySource: { [key: string]: number };
    last7Days: { date: string; count: number }[];
}

export interface DockerStats {
    containers: { running: number; stopped: number; total: number };
    images: { total: number; size: string };
    volumes: { total: number; size: string };
    networks: number;
    cacheInfo: DockerCacheInfo[];
}

class SystemService {
    async getDockerStats(): Promise<DockerStats> {
        return apiClient.get('/api/master/system-management/docker/stats');
    }

    async cleanDockerBuildCache(): Promise<DockerCleanupResult> {
        return apiClient.post('/api/master/system-management/docker/clean-build-cache', {});
    }

    async cleanDockerImages(): Promise<DockerCleanupResult> {
        return apiClient.post('/api/master/system-management/docker/clean-images', {});
    }

    async cleanDockerContainers(): Promise<DockerCleanupResult> {
        return apiClient.post('/api/master/system-management/docker/clean-containers', {});
    }

    async cleanDockerVolumes(): Promise<DockerCleanupResult> {
        return apiClient.post('/api/master/system-management/docker/clean-volumes', {});
    }

    async cleanAllDocker(): Promise<DockerCleanupResult> {
        return apiClient.post('/api/master/system-management/docker/clean-all', {});
    }

    async getSystemErrors(params?: {
        level?: string;
        source?: string;
        resolved?: boolean;
        page?: number;
        pageSize?: number;
    }): Promise<SystemError[]> {
        return apiClient.get('/api/master/system-management/errors', { params });
    }

    async getErrorStatistics(): Promise<ErrorStatistics> {
        return apiClient.get('/api/master/system-management/errors/statistics');
    }

    async resolveError(errorId: string): Promise<void> {
        return apiClient.post(`/api/master/system-management/errors/${errorId}/resolve`, {});
    }

    async deleteError(errorId: string): Promise<void> {
        return apiClient.delete(`/api/master/system-management/errors/${errorId}`);
    }

    async clearResolvedErrors(): Promise<void> {
        return apiClient.delete('/api/master/system-management/errors/resolved');
    }
}

export const systemService = new SystemService();
