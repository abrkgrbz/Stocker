import { apiClient } from './apiClient';

export interface DashboardStats {
    totalRevenue: number;
    activeTenants: number;
    systemLoad: number;
    newUsers: number;
    revenueChange: string;
    tenantsChange: string;
    loadChange: string;
    usersChange: string;
    recentActivities: Array<{
        id: string;
        title: string;
        description: string;
        time: string;
    }>;
}

class DashboardService {
    async getStats(): Promise<DashboardStats> {
        return apiClient.get('/api/master/dashboard/stats');
    }
}

export const dashboardService = new DashboardService();
