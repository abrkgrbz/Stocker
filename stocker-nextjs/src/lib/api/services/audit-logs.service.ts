/**
 * Audit Logs Service
 * Handles tenant audit log operations for security monitoring
 * Uses /api/tenant/AuditLogs endpoints (tenant-specific, filtered by TenantCode)
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
  location?: string;
  country?: string;
  city?: string;
  riskFactors?: string;
  blockReason?: string;
  sessionId?: string;
  deviceFingerprint?: string;
  requestPath?: string;
  requestMethod?: string;
  responseStatusCode?: number;
  additionalData?: string;
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
   * Uses tenant endpoint - automatically filters by current user's tenant
   */
  async getAuditLogs(filters?: AuditLogFilters): Promise<AuditLogsResponse> {
    const params = new URLSearchParams();

    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.event) params.append('event', filters.event);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.email) params.append('email', filters.email);
    if (filters?.ipAddress) params.append('ipAddress', filters.ipAddress);
    if (filters?.minRiskScore !== undefined) params.append('minRiskScore', filters.minRiskScore.toString());
    if (filters?.maxRiskScore !== undefined) params.append('maxRiskScore', filters.maxRiskScore.toString());
    if (filters?.blocked !== undefined) params.append('blocked', filters.blocked.toString());
    if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters?.pageNumber) params.append('pageNumber', filters.pageNumber.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

    const queryString = params.toString();
    const url = `/api/tenant/AuditLogs${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ApiResponseWrapper<AuditLogsResponse>>(url);
    return (response as ApiResponseWrapper<AuditLogsResponse>).data || response as AuditLogsResponse;
  },

  /**
   * Get audit log by ID
   * Uses tenant endpoint - ensures log belongs to current user's tenant
   */
  async getAuditLogById(id: string): Promise<AuditLogDetail> {
    const response = await apiClient.get<ApiResponseWrapper<AuditLogDetail>>(
      `/api/tenant/AuditLogs/${id}`
    );
    return (response as ApiResponseWrapper<AuditLogDetail>).data || response as AuditLogDetail;
  },

  /**
   * Get audit log statistics for dashboard
   * Uses tenant endpoint - statistics for current user's tenant only
   */
  async getStatistics(fromDate?: string, toDate?: string): Promise<AuditLogStatistics> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const queryString = params.toString();
    const url = `/api/tenant/AuditLogs/statistics${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ApiResponseWrapper<AuditLogStatistics>>(url);
    return (response as ApiResponseWrapper<AuditLogStatistics>).data || response as AuditLogStatistics;
  },

  /**
   * Get security events for security monitoring
   * Derived from audit logs with security-relevant events
   */
  async getSecurityEvents(
    fromDate?: string,
    toDate?: string,
    severity?: string,
    type?: string
  ): Promise<SecurityEvent[]> {
    // Use the main audit logs endpoint with appropriate filters
    const filters: AuditLogFilters = {
      fromDate,
      toDate,
      pageSize: 100, // Get latest security events
    };

    // Filter by blocked or high risk for security events
    if (severity === 'critical') {
      filters.minRiskScore = 80;
    } else if (severity === 'error' || severity === 'high') {
      filters.minRiskScore = 60;
    } else if (severity === 'warning') {
      filters.minRiskScore = 40;
    }

    if (type) {
      filters.event = type;
    }

    const response = await this.getAuditLogs(filters);

    // Map to SecurityEvent format
    return response.logs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      event: log.event,
      severity: log.riskScore && log.riskScore >= 80 ? 'critical' :
               log.riskScore && log.riskScore >= 60 ? 'error' :
               log.riskScore && log.riskScore >= 40 ? 'warning' : 'info',
      email: log.email,
      ipAddress: log.ipAddress,
      description: log.event,
      blocked: log.blocked,
    }));
  },

  /**
   * Export audit logs to CSV
   * Uses tenant endpoint for tenant-specific export
   */
  async exportToCsv(filters?: AuditLogFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.event) params.append('event', filters.event);
    if (filters?.email) params.append('email', filters.email);

    const queryString = params.toString();
    const url = `/api/tenant/AuditLogs/export/csv${queryString ? `?${queryString}` : ''}`;

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
   * Uses tenant endpoint for tenant-specific export
   */
  async exportToExcel(filters?: AuditLogFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.event) params.append('event', filters.event);
    if (filters?.email) params.append('email', filters.email);

    const queryString = params.toString();
    const url = `/api/tenant/AuditLogs/export/excel${queryString ? `?${queryString}` : ''}`;

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
