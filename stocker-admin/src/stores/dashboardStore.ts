import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  dashboardService, 
  DashboardStats, 
  RevenueOverview, 
  TenantStats, 
  SystemHealth,
  RecentTenant,
  RecentUser,
  Activity,
  ChartData
} from '../services/api/dashboardService';
import { errorService } from '../services/errorService';

interface DashboardState {
  // Data
  stats: DashboardStats | null;
  revenueOverview: RevenueOverview | null;
  tenantStats: TenantStats | null;
  systemHealth: SystemHealth | null;
  recentTenants: RecentTenant[];
  recentUsers: RecentUser[];
  activities: Activity[];
  
  // Chart Data
  revenueChartData: ChartData | null;
  tenantGrowthChartData: ChartData | null;
  packageDistributionData: ChartData | null;
  
  // UI State
  loading: boolean;
  refreshing: boolean;
  selectedPeriod: 'daily' | 'monthly' | 'yearly';
  
  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchRevenueOverview: () => Promise<void>;
  fetchTenantStats: () => Promise<void>;
  fetchSystemHealth: () => Promise<void>;
  fetchRecentTenants: () => Promise<void>;
  fetchRecentUsers: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  fetchChartData: () => Promise<void>;
  
  // UI Actions
  setSelectedPeriod: (period: 'daily' | 'monthly' | 'yearly') => void;
  refreshData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      // Initial state
      stats: null,
      revenueOverview: null,
      tenantStats: null,
      systemHealth: null,
      recentTenants: [],
      recentUsers: [],
      activities: [],
      revenueChartData: null,
      tenantGrowthChartData: null,
      packageDistributionData: null,
      loading: false,
      refreshing: false,
      selectedPeriod: 'monthly',

      // Fetch all dashboard data
      fetchDashboardData: async () => {
        set({ loading: true });
        
        try {
          // Fetch all data in parallel for better performance
          await Promise.all([
            get().fetchStats(),
            get().fetchRevenueOverview(),
            get().fetchTenantStats(),
            get().fetchSystemHealth(),
            get().fetchRecentTenants(),
            get().fetchRecentUsers(),
            get().fetchActivities(),
            get().fetchChartData(),
          ]);
        } catch (error) {
          errorService.handleError(error);
        } finally {
          set({ loading: false });
        }
      },

      // Fetch dashboard statistics
      fetchStats: async () => {
        try {
          const stats = await dashboardService.getStats();
          set({ stats });
        } catch (error) {
          console.error('Failed to fetch dashboard stats:', error);
        }
      },

      // Fetch revenue overview
      fetchRevenueOverview: async () => {
        try {
          const revenueOverview = await dashboardService.getRevenueOverview();
          set({ revenueOverview });
        } catch (error) {
          console.error('Failed to fetch revenue overview:', error);
        }
      },

      // Fetch tenant statistics
      fetchTenantStats: async () => {
        try {
          const tenantStats = await dashboardService.getTenantStats();
          set({ tenantStats });
        } catch (error) {
          console.error('Failed to fetch tenant stats:', error);
        }
      },

      // Fetch system health
      fetchSystemHealth: async () => {
        try {
          const systemHealth = await dashboardService.getSystemHealth();
          set({ systemHealth });
        } catch (error) {
          console.error('Failed to fetch system health:', error);
        }
      },

      // Fetch recent tenants
      fetchRecentTenants: async () => {
        try {
          const recentTenants = await dashboardService.getRecentTenants();
          set({ recentTenants });
        } catch (error) {
          console.error('Failed to fetch recent tenants:', error);
        }
      },

      // Fetch recent users
      fetchRecentUsers: async () => {
        try {
          const recentUsers = await dashboardService.getRecentUsers();
          set({ recentUsers });
        } catch (error) {
          console.error('Failed to fetch recent users:', error);
        }
      },

      // Fetch activities
      fetchActivities: async () => {
        try {
          const activities = await dashboardService.getRecentActivities();
          set({ activities });
        } catch (error) {
          console.error('Failed to fetch activities:', error);
        }
      },

      // Fetch chart data
      fetchChartData: async () => {
        try {
          const period = get().selectedPeriod;
          const [revenueChartData, tenantGrowthChartData, packageDistributionData] = await Promise.all([
            dashboardService.getRevenueChartData(period),
            dashboardService.getTenantGrowthChartData(),
            dashboardService.getPackageDistribution(),
          ]);
          
          set({
            revenueChartData,
            tenantGrowthChartData,
            packageDistributionData,
          });
        } catch (error) {
          console.error('Failed to fetch chart data:', error);
        }
      },

      // Set selected period
      setSelectedPeriod: (period: 'daily' | 'monthly' | 'yearly') => {
        set({ selectedPeriod: period });
        // Refetch chart data with new period
        get().fetchChartData();
      },

      // Refresh all data
      refreshData: async () => {
        set({ refreshing: true });
        
        try {
          await get().fetchDashboardData();
        } finally {
          set({ refreshing: false });
        }
      },
    }),
    {
      name: 'dashboard-store',
    }
  )
);

// Auto-refresh hook
export const useAutoRefresh = (intervalMs: number = 30000) => {
  const refreshData = useDashboardStore((state) => state.refreshData);
  
  // Set up auto-refresh
  if (typeof window !== 'undefined') {
    setInterval(() => {
      refreshData();
    }, intervalMs);
  }
};