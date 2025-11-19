import { apiClient } from './apiClient';

// System Health DTOs
export interface SystemHealthDto {
  status: string;
  uptime: string;
  cpuUsage: number;
  memoryUsage: MemoryUsageDto;
  diskUsage: DiskUsageDto;
  activeConnections: number;
  environment: string;
  version: string;
  lastChecked: string;
}

export interface MemoryUsageDto {
  total: number;
  used: number;
  free: number;
  percentage: number;
}

export interface DiskUsageDto {
  total: number;
  used: number;
  free: number;
  percentage: number;
}

export interface SystemMetricsDto {
  timestamp: string;
  cpuMetrics: CpuMetrics;
  memoryMetrics: MemoryMetrics;
  diskMetrics: DiskMetrics;
  networkMetrics: NetworkMetrics;
  databaseMetrics: DatabaseMetrics;
  applicationMetrics: ApplicationMetrics;
}

export interface CpuMetrics {
  usage: number;
  cores: number;
  temperature?: number;
}

export interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  cached: number;
}

export interface DiskMetrics {
  total: number;
  used: number;
  free: number;
  readSpeed: number;
  writeSpeed: number;
}

export interface NetworkMetrics {
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsSent: number;
}

export interface DatabaseMetrics {
  connectionCount: number;
  activeQueries: number;
  avgQueryTime: number;
  cacheHitRate: number;
}

export interface ApplicationMetrics {
  requestsPerSecond: number;
  avgResponseTime: number;
  activeUsers: number;
  errorRate: number;
}

export interface ServiceStatusDto {
  name: string;
  status: string;
  uptime: string;
  lastChecked: string;
  details?: Record<string, any>;
}

class MonitoringService {
  private readonly basePath = '/api/master/monitoring';

  /**
   * Get system health status
   */
  async getHealth(): Promise<SystemHealthDto> {
    try {
      return await apiClient.get<SystemHealthDto>(`${this.basePath}/health`);
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      throw error;
    }
  }

  /**
   * Get system metrics
   */
  async getMetrics(): Promise<SystemMetricsDto> {
    try {
      return await apiClient.get<SystemMetricsDto>(`${this.basePath}/metrics`);
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      throw error;
    }
  }

  /**
   * Get service status
   */
  async getServiceStatus(): Promise<ServiceStatusDto[]> {
    try {
      return await apiClient.get<ServiceStatusDto[]>(`${this.basePath}/services`);
    } catch (error) {
      console.error('Failed to fetch service status:', error);
      throw error;
    }
  }

  /**
   * Get alerts
   */
  async getAlerts(): Promise<any[]> {
    try {
      return await apiClient.get<any[]>(`${this.basePath}/alerts`);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      throw error;
    }
  }

  /**
   * Helper: Get status color
   */
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'online':
      case 'ok':
        return 'success';
      case 'warning':
      case 'degraded':
        return 'warning';
      case 'error':
      case 'offline':
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();
