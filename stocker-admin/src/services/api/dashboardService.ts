import { apiClient } from './apiClient';

// Dashboard DTOs
export interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  growthRate: number;
  newTenantsThisMonth: number;
}

export interface RevenueOverview {
  daily: RevenueData[];
  monthly: RevenueData[];
  yearly: RevenueData[];
  totalRevenue: number;
  averageRevenue: number;
  growthPercentage: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  count: number;
}

export interface TenantStats {
  byStatus: StatusCount[];
  byPackage: PackageCount[];
  byCreatedDate: DateCount[];
  averageUsersPerTenant: number;
  churnRate: number;
  retentionRate: number;
}

export interface StatusCount {
  status: string;
  count: number;
  percentage: number;
}

export interface PackageCount {
  packageName: string;
  count: number;
  revenue: number;
}

export interface DateCount {
  date: string;
  count: number;
}

export interface SystemHealth {
  apiStatus: 'healthy' | 'degraded' | 'down';
  databaseStatus: 'healthy' | 'degraded' | 'down';
  cacheStatus: 'healthy' | 'degraded' | 'down';
  queueStatus: 'healthy' | 'degraded' | 'down';
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: string;
  lastCheck: string;
}

export interface RecentTenant {
  id: string;
  name: string;
  code: string;
  domain: string;
  createdAt: string;
  packageName: string;
  userCount: number;
  status: string;
}

export interface RecentUser {
  id: string;
  fullName: string;
  email: string;
  tenantName: string;
  createdAt: string;
  lastLogin: string;
  role: string;
}

export interface Activity {
  id: string;
  type: 'tenant_created' | 'user_added' | 'payment_received' | 'subscription_renewed' | 'tenant_suspended';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }[];
}

class DashboardService {
  private readonly basePath = '/api/master/dashboard';

  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>(`${this.basePath}/stats`);
  }

  /**
   * Get revenue overview
   */
  async getRevenueOverview(): Promise<RevenueOverview> {
    return apiClient.get<RevenueOverview>(`${this.basePath}/revenue-overview`);
  }

  /**
   * Get tenant statistics
   */
  async getTenantStats(): Promise<TenantStats> {
    return apiClient.get<TenantStats>(`${this.basePath}/tenant-stats`);
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    return apiClient.get<SystemHealth>(`${this.basePath}/system-health`);
  }

  /**
   * Get recent tenants
   */
  async getRecentTenants(): Promise<RecentTenant[]> {
    const response = await apiClient.get<{ tenants: RecentTenant[] }>(`${this.basePath}/recent-tenants`);
    return response.tenants;
  }

  /**
   * Get recent users
   */
  async getRecentUsers(): Promise<RecentUser[]> {
    const response = await apiClient.get<{ users: RecentUser[] }>(`${this.basePath}/recent-users`);
    return response.users;
  }

  /**
   * Get recent activities (mock for now, will be replaced with real endpoint)
   */
  async getRecentActivities(): Promise<Activity[]> {
    // Mock data for now
    const activities: Activity[] = [
      {
        id: '1',
        type: 'tenant_created',
        title: 'Yeni Tenant Oluşturuldu',
        description: 'ABC Şirketi sisteme eklendi',
        timestamp: new Date().toISOString(),
        icon: 'plus',
        color: 'green',
      },
      {
        id: '2',
        type: 'payment_received',
        title: 'Ödeme Alındı',
        description: 'XYZ Şirketi - 5000 TL',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        icon: 'dollar',
        color: 'blue',
      },
      {
        id: '3',
        type: 'user_added',
        title: 'Yeni Kullanıcı',
        description: 'John Doe eklendi',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        icon: 'user',
        color: 'purple',
      },
    ];
    
    return Promise.resolve(activities);
  }

  /**
   * Get chart data for revenue
   */
  async getRevenueChartData(period: 'daily' | 'monthly' | 'yearly' = 'monthly'): Promise<ChartData> {
    const revenue = await this.getRevenueOverview();
    const data = revenue[period] || revenue.monthly;
    
    return {
      labels: data.map(item => {
        const date = new Date(item.date);
        if (period === 'daily') {
          return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        } else if (period === 'monthly') {
          return date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
        } else {
          return date.getFullYear().toString();
        }
      }),
      datasets: [
        {
          label: 'Gelir',
          data: data.map(item => item.revenue),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
        },
      ],
    };
  }

  /**
   * Get chart data for tenant growth
   */
  async getTenantGrowthChartData(): Promise<ChartData> {
    const stats = await this.getTenantStats();
    const data = stats.byCreatedDate || [];
    
    return {
      labels: data.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Yeni Tenant',
          data: data.map(item => item.count),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
        },
      ],
    };
  }

  /**
   * Get package distribution data
   */
  async getPackageDistribution(): Promise<ChartData> {
    const stats = await this.getTenantStats();
    const data = stats.byPackage || [];
    
    return {
      labels: data.map(item => item.packageName),
      datasets: [
        {
          label: 'Tenant Sayısı',
          data: data.map(item => item.count),
          backgroundColor: [
            '#667eea',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
          ],
        },
      ],
    };
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();