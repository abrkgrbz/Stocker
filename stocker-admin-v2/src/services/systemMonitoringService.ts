import { apiClient } from './apiClient';


export interface SystemHealthDto {
    status: "Healthy" | "Degraded" | "Unhealthy";
    checks: HealthCheck[];
    totalDuration: number;
}

export interface HealthCheck {
    name: string;
    status: string;
    duration: number;
    description?: string;
    exception?: string;
}

export interface SystemMetricsDto {
    cpu: number | { usage: number; cores: number; frequency: number };
    memory: number | { used: number; total: number; available: number; usagePercentage: number };
    diskUsage: number | { used: number; total: number; available: number; usagePercentage: number };
    networkIn: number;
    networkOut: number;
    activeConnections: number;
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
}

export interface ServiceStatusDto {
    name: string;
    status: "Running" | "Stopped" | "Degraded" | "Unknown";
    lastCheck: string;
    responseTime: number;
    uptime: number;
    errorCount: number;
}

export interface SystemLogsResponseDto {
    logs: SystemLogDto[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface SystemLogDto {
    id: string;
    timestamp: string;
    level: string;
    source: string;
    message: string;
    exception?: string;
    properties?: Record<string, any>;
}

export interface SystemAlertDto {
    id: string;
    type: string;
    severity: "Critical" | "Warning" | "Info";
    message: string;
    source: string;
    isActive: boolean;
    isAcknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: string;
    createdAt: string;
}

export interface MetricsStreamInfoDto {
    signalRHub: string;
    methods: { name: string; description: string }[];
    events: { name: string; description: string }[];
    note: string;
}

class SystemMonitoringService {
    private readonly baseUrl = '/api/master/monitoring';

    async getHealth(): Promise<SystemHealthDto> {
        const response = await apiClient.get<SystemHealthDto>(`${this.baseUrl}/health`);
        // @ts-ignore
        return response;
    }

    async getMetrics(): Promise<SystemMetricsDto> {
        const response = await apiClient.get<SystemMetricsDto>(`${this.baseUrl}/metrics`);
        // @ts-ignore
        return response;
    }

    async getServices(): Promise<ServiceStatusDto[]> {
        const response = await apiClient.get<ServiceStatusDto[]>(`${this.baseUrl}/services`);
        // @ts-ignore
        return response;
    }

    async getLogs(params?: {
        level?: string;
        source?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        pageSize?: number;
    }): Promise<SystemLogsResponseDto> {
        const response = await apiClient.get<SystemLogsResponseDto>(`${this.baseUrl}/logs`, { params });
        // @ts-ignore
        return response;
    }

    async getAlerts(activeOnly = true): Promise<SystemAlertDto[]> {
        const response = await apiClient.get<SystemAlertDto[]>(`${this.baseUrl}/alerts`, { params: { activeOnly } });
        // @ts-ignore
        return response;
    }

    async acknowledgeAlert(alertId: string): Promise<SystemAlertDto> {
        const response = await apiClient.post<SystemAlertDto>(`${this.baseUrl}/alerts/${alertId}/acknowledge`);
        // @ts-ignore
        return response;
    }

    async dismissAlert(alertId: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/alerts/${alertId}/dismiss`);
        // @ts-ignore
        return response.success; // Assuming API wrapper handles this, but based on docs it returns ApiResponse<boolean>
    }

    async getMetricsStreamInfo(): Promise<MetricsStreamInfoDto> {
        const response = await apiClient.get<MetricsStreamInfoDto>(`${this.baseUrl}/metrics/stream`);
        // @ts-ignore
        return response;
    }
}

export const systemMonitoringService = new SystemMonitoringService();
