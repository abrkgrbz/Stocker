/**
 * Audit Logs React Query Hooks
 * Provides data fetching and caching for audit logs
 */

import { useQuery } from '@tanstack/react-query';
import { AuditLogsService } from '../services/audit-logs.service';
import type {
  AuditLogFilters,
  AuditLogsResponse,
  AuditLogDetail,
  AuditLogStatistics,
  SecurityEvent,
} from '../services/audit-logs.service';

// Query Keys
export const auditLogsKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditLogsKeys.all, 'list'] as const,
  list: (filters?: AuditLogFilters) => [...auditLogsKeys.lists(), filters] as const,
  details: () => [...auditLogsKeys.all, 'detail'] as const,
  detail: (id: string) => [...auditLogsKeys.details(), id] as const,
  statistics: (fromDate?: string, toDate?: string) =>
    [...auditLogsKeys.all, 'statistics', { fromDate, toDate }] as const,
  securityEvents: (fromDate?: string, toDate?: string, severity?: string, type?: string) =>
    [...auditLogsKeys.all, 'security-events', { fromDate, toDate, severity, type }] as const,
};

/**
 * Hook to fetch paginated audit logs with filtering
 */
export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery<AuditLogsResponse, Error>({
    queryKey: auditLogsKeys.list(filters),
    queryFn: () => AuditLogsService.getAuditLogs(filters),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for near real-time updates
  });
}

/**
 * Hook to fetch a single audit log by ID
 */
export function useAuditLogDetail(id: string) {
  return useQuery<AuditLogDetail, Error>({
    queryKey: auditLogsKeys.detail(id),
    queryFn: () => AuditLogsService.getAuditLogById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch audit log statistics for dashboard
 */
export function useAuditLogStatistics(fromDate?: string, toDate?: string) {
  return useQuery<AuditLogStatistics, Error>({
    queryKey: auditLogsKeys.statistics(fromDate, toDate),
    queryFn: () => AuditLogsService.getStatistics(fromDate, toDate),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch security events
 */
export function useSecurityEvents(
  fromDate?: string,
  toDate?: string,
  severity?: string,
  type?: string
) {
  return useQuery<SecurityEvent[], Error>({
    queryKey: auditLogsKeys.securityEvents(fromDate, toDate, severity, type),
    queryFn: () => AuditLogsService.getSecurityEvents(fromDate, toDate, severity, type),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Utility functions
export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Az önce';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`;
  return date.toLocaleDateString('tr-TR');
}

export function getRiskLevelColor(riskLevel?: string): string {
  switch (riskLevel) {
    case 'Critical':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'High':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Medium':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Low':
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function getRiskLevelLabel(riskLevel?: string): string {
  switch (riskLevel) {
    case 'Critical':
      return 'Kritik';
    case 'High':
      return 'Yüksek';
    case 'Medium':
      return 'Orta';
    case 'Low':
    default:
      return 'Düşük';
  }
}
