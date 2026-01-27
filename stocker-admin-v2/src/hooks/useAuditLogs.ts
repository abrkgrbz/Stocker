import { useQuery } from '@tanstack/react-query';
import { auditLogService, type AuditLogsResponse } from '../services/auditLogService';

export const useAuditLogs = () => {
    return useQuery<AuditLogsResponse>({
        queryKey: ['audit-logs'],
        queryFn: () => auditLogService.getAll(),
    });
};
