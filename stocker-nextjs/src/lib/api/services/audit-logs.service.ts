/**
 * Audit Logs Service
 * Handles tenant audit log operations for security monitoring
 */

import { apiClient } from '../client';

// =====================================
// TYPES
// =====================================

export interface AuditLogListItem {
  id: string;
  timestamp: string;
  event: string;
  email?: string;
  tenantCode?: string;
  ipAddress?: string;
  riskScore?: number;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  blocked: boolean;
  timeAgo?: string;
}

export interface AuditLogDetail extends AuditLogListItem {
  userId?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: string;
  durationMs?: number;
  gdprCategory?: string;
  retentionDays: number;
  createdAt: string;
}

export interface AuditLogsResponse {
  logs: AuditLogListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AuditLogStatistics {
  totalEvents: number;
  failedLogins: number;
  successfulOperations: number;
  totalOperations: number;
  uniqueUsers: number;
  blockedEvents: number;
  highRiskEvents: number;
  criticalEvents: number;
  topEvents: { event: string; count: number }[];
  topUsers: { email: string; eventCount: number; failedAttempts: number }[];
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  event: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  email?: string;
  ipAddress?: string;
  description?: string;
  blocked: boolean;
}

export interface AuditLogFilters {
  fromDate?: string;
  toDate?: string;
  event?: string;
  severity?: string;
  email?: string;
  tenantCode?: string;
  ipAddress?: string;
  minRiskScore?: number;
  maxRiskScore?: number;
  blocked?: boolean;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================================
// SERVICE
// =====================================

export const AuditLogsService = {
  /**
   * Get paginated audit logs with filtering
   */
  async getAuditLogs(filters?: AuditLogFilters): Promise<AuditLogsResponse> {
    const params = new URLSearchParams();

    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.event) params.append('event', filters.event);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.email) params.append('email', filters.email);
    if (filters?.tenantCode) params.append('tenantCode', filters.tenantCode);
    if (filters?.ipAddress) params.append('ipAddress', filters.ipAddress);
    if (filters?.minRiskScore !== undefined) params.append('minRiskScore', filters.minRiskScore.toString());
    if (filters?.maxRiskScore !== undefined) params.append('maxRiskScore', filters.maxRiskScore.toString());
    if (filters?.blocked !== undefined) params.append('blocked', filters.blocked.toString());
    if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters?.pageNumber) params.append('pageNumber', filters.pageNumber.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

    const queryString = params.toString();
    const url = `/api/master/AuditLogs${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ApiResponseWrapper<AuditLogsResponse>>(url);
    return (response as ApiResponseWrapper<AuditLogsResponse>).data || response as AuditLogsResponse;
  },

  /**
   * Get audit log by ID
   */
  async getAuditLogById(id: string): Promise<AuditLogDetail> {
    const response = await apiClient.get<ApiResponseWrapper<AuditLogDetail>>(
      `/api/master/AuditLogs/${id}`
    );
    return (response as ApiResponseWrapper<AuditLogDetail>).data || response as AuditLogDetail;
  },

  /**
   * Get audit log statistics for dashboard
   */
  async getStatistics(fromDate?: string, toDate?: string): Promise<AuditLogStatistics> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const queryString = params.toString();
    const url = `/api/master/AuditLogs/statistics${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ApiResponseWrapper<AuditLogStatistics>>(url);
    return (response as ApiResponseWrapper<AuditLogStatistics>).data || response as AuditLogStatistics;
  },

  /**
   * Get security events for security monitoring
   */
  async getSecurityEvents(
    fromDate?: string,
    toDate?: string,
    severity?: string,
    type?: string
  ): Promise<SecurityEvent[]> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (severity) params.append('severity', severity);
    if (type) params.append('type', type);

    const queryString = params.toString();
    const url = `/api/master/AuditLogs/security-events${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ApiResponseWrapper<SecurityEvent[]>>(url);
    return (response as ApiResponseWrapper<SecurityEvent[]>).data || response as SecurityEvent[];
  },

  /**
   * Export audit logs to CSV
   */
  async exportToCsv(filters?: AuditLogFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.event) params.append('event', filters.event);
    if (filters?.email) params.append('email', filters.email);
    if (filters?.tenantCode) params.append('tenantCode', filters.tenantCode);

    const queryString = params.toString();
    const url = `/api/master/AuditLogs/export/csv${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    return response.blob();
  },

  /**
   * Export audit logs to Excel
   */
  async exportToExcel(filters?: AuditLogFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.event) params.append('event', filters.event);
    if (filters?.email) params.append('email', filters.email);
    if (filters?.tenantCode) params.append('tenantCode', filters.tenantCode);

    const queryString = params.toString();
    const url = `/api/master/AuditLogs/export/excel${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    return response.blob();
  },
};

export default AuditLogsService;
