import { useQuery } from '@tanstack/react-query';
import { dashboardService, type DashboardStats } from '../services/dashboardService';

export const useDashboard = () => {
    return useQuery<DashboardStats>({
        queryKey: ['dashboard-stats'],
        queryFn: () => dashboardService.getStats(),
    });
};
