import { apiClient } from './apiClient';

export interface SystemMetricsDto {
    cpu: { usage: number; cores: number };
    memory: { total: number; used: number; free: number };
    disk: { total: number; used: number; free: number };
    network: { rx: number; tx: number };
}

export interface SystemHealthStatusDto {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: string;
    services: Record<string, string>;
}

export interface SystemServiceStatusDto {
    name: string;
    status: 'running' | 'stopped' | 'failed';
    uptime: number;
}

export interface SystemLogDto {
    id: string;
    timestamp: string;
    level: string;
    message: string;
    source: string;
    stackTrace?: string;
}

export interface SystemAlertDto {
    id: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: string;
    acknowledged: boolean;
}

class SystemMonitoringService {
    private readonly baseUrl = '/api/master/system-monitoring';

    async getMetrics(): Promise<SystemMetricsDto> {
        const response = await apiClient.get<SystemMetricsDto>(`${this.baseUrl}/metrics`);
        // @ts-ignore
        return response;
    }

    async getHealth(): Promise<SystemHealthStatusDto> {
        const response = await apiClient.get<SystemHealthStatusDto>(`${this.baseUrl}/health`);
        // @ts-ignore
        return response;
    }

    async getServices(): Promise<SystemServiceStatusDto[]> {
        const response = await apiClient.get<SystemServiceStatusDto[]>(`${this.baseUrl}/services`);
        // @ts-ignore
        return response;
    }

    async getLogs(params?: any): Promise<{ items: SystemLogDto[]; totalCount: number }> {
        const response = await apiClient.get<{ items: SystemLogDto[]; totalCount: number }>(`${this.baseUrl}/logs`, { params });
        // @ts-ignore
        return response;
    }

    async getAlerts(): Promise<SystemAlertDto[]> {
        const response = await apiClient.get<SystemAlertDto[]>(`${this.baseUrl}/alerts`);
        // @ts-ignore
        return response;
    }

    async acknowledgeAlert(alertId: string): Promise<boolean> {
        const response = await apiClient.put(`${this.baseUrl}/alerts/${alertId}/acknowledge`);
        // @ts-ignore
        return response.success;
    }

    async deleteAlert(alertId: string): Promise<boolean> {
        const response = await apiClient.delete(`${this.baseUrl}/alerts/${alertId}`);
        // @ts-ignore
        return response.success;
    }
}

export const systemMonitoringService = new SystemMonitoringService();
