import { apiClient } from './apiClient';

// Audit Log DTOs
export interface AuditLogDto {
  id: string;
  userId: string;
  userName: string;
  tenantId?: string;
  tenantName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent?: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

export interface GetAuditLogsQuery {
  userId?: string;
  tenantId?: string;
  action?: string;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
  success?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogsResponse {
  data: AuditLogDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface AuditStatistics {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  uniqueUsers: number;
  topActions: { action: string; count: number }[];
  topUsers: { userName: string; count: number }[];
}

class AuditLogService {
  private readonly basePath = '/api/master/auditlogs';

  /**
   * Get audit logs with filtering and pagination
   */
  async getAll(query?: GetAuditLogsQuery): Promise<AuditLogsResponse> {
    try {
      const params = new URLSearchParams();

      if (query) {
        if (query.userId) params.append('userId', query.userId);
        if (query.tenantId) params.append('tenantId', query.tenantId);
        if (query.action) params.append('action', query.action);
        if (query.entityType) params.append('entityType', query.entityType);
        if (query.fromDate) params.append('fromDate', query.fromDate);
        if (query.toDate) params.append('toDate', query.toDate);
        if (query.success !== undefined) params.append('success', query.success.toString());
        if (query.pageNumber) params.append('pageNumber', query.pageNumber.toString());
        if (query.pageSize) params.append('pageSize', query.pageSize.toString());
        if (query.sortBy) params.append('sortBy', query.sortBy);
        if (query.sortOrder) params.append('sortOrder', query.sortOrder);
      }

      const queryString = params.toString();
      const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

      return await apiClient.get<AuditLogsResponse>(url);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit log by ID
   */
  async getById(id: string): Promise<AuditLogDto | null> {
    try {
      return await apiClient.get<AuditLogDto>(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch audit log ${id}:`, error);
      return null;
    }
  }

  /**
   * Get audit statistics
   */
  async getStatistics(fromDate?: string, toDate?: string): Promise<AuditStatistics> {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const queryString = params.toString();
      const url = queryString ? `${this.basePath}/statistics?${queryString}` : `${this.basePath}/statistics`;

      return await apiClient.get<AuditStatistics>(url);
    } catch (error) {
      console.error('Failed to fetch audit statistics:', error);
      throw error;
    }
  }

  /**
   * Export audit logs to CSV/Excel
   */
  async export(query?: GetAuditLogsQuery, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();

      if (query) {
        if (query.userId) params.append('userId', query.userId);
        if (query.tenantId) params.append('tenantId', query.tenantId);
        if (query.action) params.append('action', query.action);
        if (query.fromDate) params.append('fromDate', query.fromDate);
        if (query.toDate) params.append('toDate', query.toDate);
      }

      const endpoint = format === 'csv' ? '/export/csv' : '/export/excel';
      const url = params.toString() ? `${this.basePath}${endpoint}?${params.toString()}` : `${this.basePath}${endpoint}`;

      return await apiClient.get<Blob>(url, undefined);
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      throw error;
    }
  }

  /**
   * Get security events
   */
  async getSecurityEvents(fromDate?: string, toDate?: string, severity?: string, type?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      if (severity) params.append('severity', severity);
      if (type) params.append('type', type);

      const queryString = params.toString();
      const url = queryString ? `${this.basePath}/security-events?${queryString}` : `${this.basePath}/security-events`;

      return await apiClient.get<any[]>(url);
    } catch (error) {
      console.error('Failed to fetch security events:', error);
      return [];
    }
  }

  /**
   * Get compliance status
   */
  async getCompliance(fromDate?: string, toDate?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const queryString = params.toString();
      const url = queryString ? `${this.basePath}/compliance?${queryString}` : `${this.basePath}/compliance`;

      return await apiClient.get<any>(url);
    } catch (error) {
      console.error('Failed to fetch compliance status:', error);
      return null;
    }
  }

  /**
   * Helper: Get action color for UI
   */
  getActionColor(action: string): string {
    const lowerAction = action.toLowerCase();

    if (lowerAction.includes('create') || lowerAction.includes('add')) {
      return 'success';
    } else if (lowerAction.includes('update') || lowerAction.includes('edit')) {
      return 'processing';
    } else if (lowerAction.includes('delete') || lowerAction.includes('remove')) {
      return 'error';
    } else if (lowerAction.includes('login') || lowerAction.includes('logout')) {
      return 'default';
    }

    return 'default';
  }

  /**
   * Helper: Get success color
   */
  getSuccessColor(success: boolean): string {
    return success ? 'success' : 'error';
  }
}

// Export singleton instance
export const auditLogService = new AuditLogService();
