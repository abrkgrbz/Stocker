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

export interface SubscriptionAnalytics {
    totalSubscriptions: number;
    churnRate: number;
    subscriptionsByType: { type: string; count: number }[];
}

export interface PerformanceMetrics {
    apiResponseTime: number;
    errorRate: number;
    uptime: number;
}

class AnalyticsService {
    private readonly baseUrl = '/api/master/analytics';

    async getRevenue(): Promise<RevenueAnalytics> {
        const response = await apiClient.get<RevenueAnalytics>(`${this.baseUrl}/revenue`);
        // @ts-ignore
        return response;
    }

    async getUsers(): Promise<UserAnalytics> {
        const response = await apiClient.get<UserAnalytics>(`${this.baseUrl}/users`);
        // @ts-ignore
        return response;
    }

    async getSubscriptions(): Promise<SubscriptionAnalytics> {
        const response = await apiClient.get<SubscriptionAnalytics>(`${this.baseUrl}/subscriptions`);
        // @ts-ignore
        return response;
    }

    async getPerformance(): Promise<PerformanceMetrics> {
        const response = await apiClient.get<PerformanceMetrics>(`${this.baseUrl}/performance`);
        // @ts-ignore
        return response;
    }

    async getUsage(): Promise<any> {
        const response = await apiClient.get<any>(`${this.baseUrl}/usage`);
        // @ts-ignore
        return response;
    }

    async getGrowth(): Promise<any> {
        const response = await apiClient.get<any>(`${this.baseUrl}/growth`);
        // @ts-ignore
        return response;
    }

    async customQuery(query: any): Promise<any> {
        const response = await apiClient.post<any>(`${this.baseUrl}/custom`, query);
        // @ts-ignore
        return response;
    }
}

export const analyticsService = new AnalyticsService();
