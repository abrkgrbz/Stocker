import { apiClient } from './apiClient';

export interface AuditLogDto {
    id: string;
    userId: string;
    userName: string;
    tenantId?: string;
    tenantName?: string;
    action: string;
    event?: string; // Legacy field
    entityType: string;
    entityId?: string;
    changes?: Record<string, any>;
    ipAddress: string;
    userAgent?: string;
    timestamp: string;
    success: boolean;
    email?: string; // Often returned instead of/with userName
    riskLevel?: string; // Critical, High, Medium, Low
    riskScore?: number;
    blocked?: boolean; // True if action was blocked
    tenantCode?: string;
    errorMessage?: string;
}

export interface AuditLogsResponse {
    data: AuditLogDto[];
    logs: AuditLogDto[]; // Added for compatibility with some backend versions
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

class AuditLogService {
    private readonly basePath = '/api/master/auditlogs';

    async getAll(): Promise<AuditLogsResponse> {
        const response = await apiClient.get<AuditLogsResponse>(this.basePath);
        // @ts-ignore
        return response;
    }
}

export const auditLogService = new AuditLogService();
