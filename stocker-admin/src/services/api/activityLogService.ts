import { apiClient } from './apiClient';

// Activity Log DTOs
export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'auth' | 'user' | 'data' | 'system' | 'billing' | 'security' | 'api';
  severity: 'info' | 'warning' | 'error' | 'success';
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  target?: string;
  description: string;
  details?: any;
  ipAddress: string;
  userAgent: string;
  location?: string;
  sessionId?: string;
}

export interface GetActivityLogsQuery {
  category?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

export interface ActivityLogsResponse {
  logs: ActivityLog[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

class ActivityLogService {
  private readonly basePath = '/api/master/tenants';

  /**
   * Get activity logs for a tenant
   */
  async getTenantLogs(tenantId: string, query?: GetActivityLogsQuery): Promise<ActivityLogsResponse> {
    const params = {
      category: query?.category && query.category !== 'all' ? query.category : undefined,
      severity: query?.severity && query.severity !== 'all' ? query.severity : undefined,
      startDate: query?.startDate,
      endDate: query?.endDate,
      pageNumber: query?.pageNumber || 1,
      pageSize: query?.pageSize || 50,
      searchTerm: query?.searchTerm,
    };

    return apiClient.get<ActivityLogsResponse>(`${this.basePath}/${tenantId}/activity-logs`, params);
  }

  /**
   * Get security events for a tenant
   */
  async getSecurityEvents(tenantId: string): Promise<any[]> {
    return apiClient.get<any[]>(`${this.basePath}/${tenantId}/security-events`);
  }

  /**
   * Export activity logs
   */
  async exportLogs(tenantId: string, query?: GetActivityLogsQuery): Promise<Blob> {
    const params = {
      category: query?.category && query.category !== 'all' ? query.category : undefined,
      severity: query?.severity && query.severity !== 'all' ? query.severity : undefined,
      startDate: query?.startDate,
      endDate: query?.endDate,
    };

    return apiClient.get<Blob>(`${this.basePath}/${tenantId}/activity-logs/export`, params, {
      responseType: 'blob'
    });
  }
}

// Export singleton instance
export const activityLogService = new ActivityLogService();
