import { apiClient } from '@/lib/api-client';
import type { SystemMetrics, ServiceStatus, SystemHealth } from '../types';

export const systemMonitoringService = {
  /**
   * Get comprehensive system metrics (CPU, Memory, Disk, Network)
   */
  getSystemMetrics: async (): Promise<SystemMetrics> => {
    const response = await apiClient.get<SystemMetrics>('/api/master/system-monitoring/metrics');
    return response.data;
  },

  /**
   * Get health status of all services
   */
  getServiceStatus: async (): Promise<ServiceStatus[]> => {
    const response = await apiClient.get<ServiceStatus[]>('/api/master/system-monitoring/services');
    return response.data;
  },

  /**
   * Get overall system health status
   */
  getSystemHealth: async (): Promise<SystemHealth> => {
    const response = await apiClient.get<SystemHealth>('/api/master/system-monitoring/health');
    return response.data;
  },
};
