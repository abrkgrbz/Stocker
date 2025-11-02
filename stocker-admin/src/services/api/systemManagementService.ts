import { apiClient } from './apiClient';

// Types
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
  total: number;
  unresolved: number;
  byLevel: {
    error: number;
    warning: number;
    info: number;
  };
  bySour: {
    [key: string]: number;
  };
  last24Hours: number;
}

export interface DockerStats {
  containers: {
    running: number;
    stopped: number;
    total: number;
  };
  images: {
    total: number;
    size: string;
  };
  volumes: {
    total: number;
    size: string;
  };
  networks: number;
  cacheInfo: DockerCacheInfo[];
}

// API Service
export const systemManagementService = {
  /**
   * Get Docker system statistics
   */
  getDockerStats: async (): Promise<DockerStats> => {
    return await apiClient.get<DockerStats>('/api/master/system-management/docker/stats');
  },

  /**
   * Clean Docker build cache
   */
  cleanDockerBuildCache: async (): Promise<DockerCleanupResult> => {
    return await apiClient.post<DockerCleanupResult>('/api/master/system-management/docker/clean-build-cache', {});
  },

  /**
   * Clean Docker images
   */
  cleanDockerImages: async (): Promise<DockerCleanupResult> => {
    return await apiClient.post<DockerCleanupResult>('/api/master/system-management/docker/clean-images', {});
  },

  /**
   * Clean Docker containers
   */
  cleanDockerContainers: async (): Promise<DockerCleanupResult> => {
    return await apiClient.post<DockerCleanupResult>('/api/master/system-management/docker/clean-containers', {});
  },

  /**
   * Clean Docker volumes
   */
  cleanDockerVolumes: async (): Promise<DockerCleanupResult> => {
    return await apiClient.post<DockerCleanupResult>('/api/master/system-management/docker/clean-volumes', {});
  },

  /**
   * Clean all Docker resources
   */
  cleanAllDocker: async (): Promise<DockerCleanupResult> => {
    return await apiClient.post<DockerCleanupResult>('/api/master/system-management/docker/clean-all', {});
  },

  /**
   * Get system errors
   */
  getSystemErrors: async (params?: {
    level?: string;
    source?: string;
    resolved?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<{ errors: SystemError[]; total: number }> => {
    return await apiClient.get<{ errors: SystemError[]; total: number }>('/api/master/system-management/errors', { params });
  },

  /**
   * Get error statistics
   */
  getErrorStatistics: async (): Promise<ErrorStatistics> => {
    return await apiClient.get<ErrorStatistics>('/api/master/system-management/errors/statistics');
  },

  /**
   * Mark error as resolved
   */
  resolveError: async (errorId: string): Promise<void> => {
    return await apiClient.post(`/api/master/system-management/errors/${errorId}/resolve`, {});
  },

  /**
   * Delete error
   */
  deleteError: async (errorId: string): Promise<void> => {
    return await apiClient.delete(`/api/master/system-management/errors/${errorId}`);
  },

  /**
   * Clear all resolved errors
   */
  clearResolvedErrors: async (): Promise<void> => {
    return await apiClient.delete('/api/master/system-management/errors/resolved');
  },
};

export default systemManagementService;
