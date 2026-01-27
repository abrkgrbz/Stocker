import { apiClient } from './apiClient';

export interface RevenueAnalytics {
    totalRevenue: number;
    growthRate: number;
    revenueByPeriod: { period: string; revenue: number }[];
}

export interface UserAnalytics {
    totalUsers: number;
    activeUsers: number;
    userGrowth: { period: string; totalUsers: number }[];
}

class AnalyticsService {
    private readonly codebasePath = '/api/master/analytics';

    async getRevenue(): Promise<RevenueAnalytics> {
        const response = await apiClient.get<RevenueAnalytics>(`${this.codebasePath}/revenue`);
        // @ts-ignore
        return response;
    }

    async getUsers(): Promise<UserAnalytics> {
        const response = await apiClient.get<UserAnalytics>(`${this.codebasePath}/users`);
        // @ts-ignore
        return response;
    }
}

export const analyticsService = new AnalyticsService();
