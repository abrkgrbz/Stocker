import { apiClient } from './apiClient';

export interface TenantHealthDto {
    tenantId: string;
    isHealthy: boolean;
    issues: string[];
    lastCheck: string;
    responseTimeMs: number;
}

export interface HealthHistoryDto {
    timestamp: string;
    isHealthy: boolean;
    responseTimeMs: number;
}

class TenantHealthService {
    private readonly baseUrl = '/api/master/tenant-health';

    async check(tenantId: string): Promise<TenantHealthDto> {
        const response = await apiClient.post<TenantHealthDto>(`${this.baseUrl}/${tenantId}/check`);
        // @ts-ignore
        return response;
    }

    async getLatest(tenantId: string): Promise<TenantHealthDto> {
        const response = await apiClient.get<TenantHealthDto>(`${this.baseUrl}/${tenantId}/latest`);
        // @ts-ignore
        return response;
    }

    async getSummary(tenantId: string): Promise<any> {
        const response = await apiClient.get<any>(`${this.baseUrl}/${tenantId}/summary`);
        // @ts-ignore
        return response;
    }

    async getHistory(tenantId: string): Promise<HealthHistoryDto[]> {
        const response = await apiClient.get<HealthHistoryDto[]>(`${this.baseUrl}/${tenantId}/history`);
        // @ts-ignore
        return response;
    }

    async getTrend(tenantId: string): Promise<any> {
        const response = await apiClient.get<any>(`${this.baseUrl}/${tenantId}/trend`);
        // @ts-ignore
        return response;
    }

    async getUnhealthy(): Promise<TenantHealthDto[]> {
        const response = await apiClient.get<TenantHealthDto[]>(`${this.baseUrl}/unhealthy`);
        // @ts-ignore
        return response;
    }

    async scheduleCheck(tenantId: string, cronExpression: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${tenantId}/schedule-check`, { cronExpression });
        // @ts-ignore
        return response.success;
    }

    async checkAll(): Promise<{ triggered: number }> {
        const response = await apiClient.post(`${this.baseUrl}/check-all`);
        // @ts-ignore
        return response;
    }
}

export const tenantHealthService = new TenantHealthService();
