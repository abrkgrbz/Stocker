import { apiClient } from './apiClient';

// Analytics interfaces
export interface RevenueAnalytics {
  period: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
  growthRate: number;
  churnRate: number;
  averageRevenuePerUser: number;
  revenueByPeriod: PeriodRevenue[];
  revenueByPackage: PackageRevenue[];
  topPayingTenants: TopTenant[];
}

export interface PeriodRevenue {
  period: string;
  revenue: number;
  growth: number;
}

export interface PackageRevenue {
  packageName: string;
  revenue: number;
  percentage: number;
}

export interface TopTenant {
  tenantName: string;
  revenue: number;
  packageName: string;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  churnedUsers: number;
  activationRate: number;
  retentionRate: number;
  averageSessionDuration: number;
  userGrowth: UserGrowth[];
  usersByRole: UserRoleDistribution[];
  userActivity: UserActivityMetrics;
}

export interface UserGrowth {
  period: string;
  totalUsers: number;
  newUsers: number;
  churnedUsers: number;
}

export interface UserRoleDistribution {
  role: string;
  count: number;
  percentage: number;
}

export interface UserActivityMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageLoginFrequency: number;
}

export interface SubscriptionAnalytics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
  conversionRate: number;
  upgradeRate: number;
  downgradeRate: number;
  averageSubscriptionValue: number;
  subscriptionsByStatus: SubscriptionStatus[];
  subscriptionTrends: SubscriptionTrend[];
  churnPrediction: ChurnPrediction;
}

export interface SubscriptionStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface SubscriptionTrend {
  month: string;
  newSubscriptions: number;
  cancellations: number;
  upgrades: number;
  downgrades: number;
}

export interface ChurnPrediction {
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  predictedChurnRate: number;
}

export interface PerformanceAnalytics {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  successRate: number;
  totalRequests: number;
  failedRequests: number;
  responseTimeHistory: ResponseTime[];
  endpointPerformance: EndpointMetric[];
  systemMetrics: SystemPerformanceMetrics;
}

export interface ResponseTime {
  timestamp: string;
  averageTime: number;
  p95Time: number;
  p99Time: number;
}

export interface EndpointMetric {
  endpoint: string;
  averageTime: number;
  callCount: number;
}

export interface SystemPerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
}

export interface UsageAnalytics {
  totalApiCalls: number;
  averageApiCallsPerTenant: number;
  totalStorageUsed: number;
  averageStoragePerTenant: number;
  bandwidthUsed: number;
  featureUsage: FeatureUsage[];
  moduleUsage: ModuleUsage[];
  peakUsageTimes: PeakUsage[];
}

export interface FeatureUsage {
  feature: string;
  usageCount: number;
  percentage: number;
}

export interface ModuleUsage {
  module: string;
  activeTenants: number;
  usagePercentage: number;
}

export interface PeakUsage {
  hour: number;
  usageLevel: string;
  requestCount: number;
}

export interface GrowthAnalytics {
  monthlyGrowthRate: number;
  yearlyGrowthRate: number;
  userGrowthRate: number;
  revenueGrowthRate: number;
  tenantGrowthRate: number;
  projectedMonthlyRevenue: number;
  projectedYearlyRevenue: number;
  projectedUserCount: number;
  projectedTenantCount: number;
  growthTrends: GrowthTrend[];
  marketPenetration: MarketPenetration;
}

export interface GrowthTrend {
  category: string;
  currentValue: number;
  previousValue: number;
  growthRate: number;
  projection: number;
}

export interface MarketPenetration {
  totalAddressableMarket: number;
  currentMarketShare: number;
  projectedMarketShare: number;
  competitorAnalysis: Competitor[];
}

export interface Competitor {
  name: string;
  marketShare: number;
}

export interface CustomAnalyticsRequest {
  title?: string;
  description?: string;
  startDate: string;
  endDate: string;
  metrics: string[];
}

export interface CustomAnalyticsResult {
  queryId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  metrics: string[];
  generatedAt: string;
  data: any;
  charts: ChartData[];
  summary: Record<string, any>;
}

export interface ChartData {
  type: string;
  title: string;
  data: any[];
}

class AnalyticsService {
  private readonly basePath = '/api/master/analytics';

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(
    startDate?: string,
    endDate?: string,
    period: string = 'monthly'
  ): Promise<RevenueAnalytics> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('period', period);

      const queryString = params.toString();
      const url = queryString ? `${this.basePath}/revenue?${queryString}` : `${this.basePath}/revenue`;

      return await apiClient.get<RevenueAnalytics>(url);
    } catch (error) {
      console.error('Failed to fetch revenue analytics:', error);
      throw error;
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(period: string = 'monthly'): Promise<UserAnalytics> {
    try {
      return await apiClient.get<UserAnalytics>(`${this.basePath}/users?period=${period}`);
    } catch (error) {
      console.error('Failed to fetch user analytics:', error);
      throw error;
    }
  }

  /**
   * Get subscription analytics
   */
  async getSubscriptionAnalytics(): Promise<SubscriptionAnalytics> {
    try {
      return await apiClient.get<SubscriptionAnalytics>(`${this.basePath}/subscriptions`);
    } catch (error) {
      console.error('Failed to fetch subscription analytics:', error);
      throw error;
    }
  }

  /**
   * Get performance analytics
   */
  async getPerformanceAnalytics(): Promise<PerformanceAnalytics> {
    try {
      return await apiClient.get<PerformanceAnalytics>(`${this.basePath}/performance`);
    } catch (error) {
      console.error('Failed to fetch performance analytics:', error);
      throw error;
    }
  }

  /**
   * Get usage analytics
   */
  async getUsageAnalytics(): Promise<UsageAnalytics> {
    try {
      return await apiClient.get<UsageAnalytics>(`${this.basePath}/usage`);
    } catch (error) {
      console.error('Failed to fetch usage analytics:', error);
      throw error;
    }
  }

  /**
   * Get growth analytics
   */
  async getGrowthAnalytics(): Promise<GrowthAnalytics> {
    try {
      return await apiClient.get<GrowthAnalytics>(`${this.basePath}/growth`);
    } catch (error) {
      console.error('Failed to fetch growth analytics:', error);
      throw error;
    }
  }

  /**
   * Get custom analytics
   */
  async getCustomAnalytics(request: CustomAnalyticsRequest): Promise<CustomAnalyticsResult> {
    try {
      return await apiClient.post<CustomAnalyticsResult>(`${this.basePath}/custom`, request);
    } catch (error) {
      console.error('Failed to fetch custom analytics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
