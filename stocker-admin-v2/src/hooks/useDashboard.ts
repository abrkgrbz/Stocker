import { useQuery } from '@tanstack/react-query';
import { dashboardService, type DashboardStatsDto } from '../services/dashboardService';

export const useDashboard = () => {
    return useQuery<DashboardStatsDto>({
        queryKey: ['dashboard-stats'],
        queryFn: () => dashboardService.getStats(),
    });
};
