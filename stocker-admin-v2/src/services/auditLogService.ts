import { apiClient } from './apiClient';

export interface AuditLogDto {
    id: string;
    userId: string;
    userName: string;
    tenantId?: string;
    tenantName?: string;
    action: string;
    event?: string;
    entityType: string;
    entityId?: string;
    changes?: Record<string, any>;
    ipAddress: string;
    userAgent?: string;
    timestamp: string;
    success: boolean;
    email?: string;
    riskLevel?: string;
    riskScore?: number;
    blocked?: boolean;
    tenantCode?: string;
    errorMessage?: string;
}

export interface AuditLogsResponse {
    items: AuditLogDto[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

export interface AuditLogStatistics {
    totalLogs: number;
    logsByAction: Record<string, number>;
    logsByRisk: Record<string, number>;
}

class AuditLogService {
    private readonly baseUrl = '/api/master/auditlogs';

    async getAll(params?: any): Promise<AuditLogsResponse> {
        const response = await apiClient.get<AuditLogsResponse>(this.baseUrl, { params });
        // @ts-ignore
        return response;
    }

    async getById(id: string): Promise<AuditLogDto> {
        const response = await apiClient.get<AuditLogDto>(`${this.baseUrl}/${id}`);
        // @ts-ignore
        return response;
    }

    async getStatistics(): Promise<AuditLogStatistics> {
        const response = await apiClient.get<AuditLogStatistics>(`${this.baseUrl}/statistics`);
        // @ts-ignore
        return response;
    }

    async getSecurityEvents(): Promise<any[]> {
        const response = await apiClient.get<any[]>(`${this.baseUrl}/security-events`);
        // @ts-ignore
        return response;
    }

    async getAnalytics(): Promise<any> {
        const response = await apiClient.get<any>(`${this.baseUrl}/analytics`);
        // @ts-ignore
        return response;
    }

    async getCompliance(): Promise<any> {
        const response = await apiClient.get<any>(`${this.baseUrl}/compliance`);
        // @ts-ignore
        return response;
    }

    async exportCsv(params?: any): Promise<Blob> {
        const response = await apiClient.get(`${this.baseUrl}/export/csv`, { params, responseType: 'blob' });
        // @ts-ignore
        return response;
    }

    async exportExcel(params?: any): Promise<Blob> {
        const response = await apiClient.get(`${this.baseUrl}/export/excel`, { params, responseType: 'blob' });
        // @ts-ignore
        return response;
    }
}

export const auditLogService = new AuditLogService();
