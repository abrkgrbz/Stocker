import { apiClient } from './apiClient';

export interface DashboardStatsDto {
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

export interface RevenueOverviewDto {
    total: number;
    period: string;
    breakdown: { label: string; value: number }[];
}

export interface TenantStatsDto {
    total: number;
    active: number;
    suspended: number;
    trial: number;
}

export interface SystemHealthDto {
    status: 'healthy' | 'degraded' | 'critical';
    uptime: number;
    cpuUsage: number;
    memoryUsage: number;
}

class DashboardService {
    private readonly baseUrl = '/api/master/dashboard';

    async getStats(): Promise<DashboardStatsDto> {
        const response = await apiClient.get<DashboardStatsDto>(`${this.baseUrl}/stats`);
        // @ts-ignore
        return response;
    }

    async getRevenueOverview(): Promise<RevenueOverviewDto> {
        const response = await apiClient.get<RevenueOverviewDto>(`${this.baseUrl}/revenue-overview`);
        // @ts-ignore
        return response;
    }

    async getTenantStats(): Promise<TenantStatsDto> {
        const response = await apiClient.get<TenantStatsDto>(`${this.baseUrl}/tenant-stats`);
        // @ts-ignore
        return response;
    }

    async getSystemHealth(): Promise<SystemHealthDto> {
        const response = await apiClient.get<SystemHealthDto>(`${this.baseUrl}/system-health`);
        // @ts-ignore
        return response;
    }

    async getRecentTenants(): Promise<any[]> {
        const response = await apiClient.get<any[]>(`${this.baseUrl}/recent-tenants`);
        // @ts-ignore
        return response;
    }

    async getRecentUsers(): Promise<any[]> {
        const response = await apiClient.get<any[]>(`${this.baseUrl}/recent-users`);
        // @ts-ignore
        return response;
    }
}

export const dashboardService = new DashboardService();
