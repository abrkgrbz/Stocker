import { apiClient } from './apiClient';

// Types
export interface CpuMetrics {
  usage: number;
  cores: number;
  frequency: number;
}

export interface MemoryMetrics {
  used: number;
  total: number;
  available: number;
  usagePercentage: number;
}

export interface DiskMetrics {
  used: number;
  total: number;
  free: number;
  usagePercentage: number;
}

export interface NetworkMetrics {
  bytesSent: number;
  bytesReceived: number;
  speed: number;
}

export interface SystemMetrics {
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
  timestamp: string;
}

export interface ServiceHealth {
  name: string;
  status: string;
  responseTime: number;
  lastCheck: string;
}

export interface SystemHealth {
  overallStatus: string;
  services: ServiceHealth[];
  uptime: number;
  timestamp: string;
}

export interface ServiceStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  uptime: number;
  lastCheck: string;
  responseTime: number;
  errorRate: number;
}

// API Service
export const systemMonitoringService = {
  /**
   * Get current system metrics (CPU, Memory, Disk, Network)
   */
  getSystemMetrics: async (): Promise<SystemMetrics> => {
    const response = await apiClient.get<{ data: SystemMetrics }>('/api/master/system-monitoring/metrics');
    return response.data.data;
  },

  /**
   * Get overall system health status
   */
  getSystemHealth: async (): Promise<SystemHealth> => {
    const response = await apiClient.get<{ data: SystemHealth }>('/api/master/system-monitoring/health');
    return response.data.data;
  },

  /**
   * Get status of all monitored services
   */
  getServiceStatus: async (): Promise<ServiceStatus[]> => {
    const response = await apiClient.get<{ data: ServiceStatus[] }>('/api/master/system-monitoring/services');
    return response.data.data;
  },
};

export default systemMonitoringService;
