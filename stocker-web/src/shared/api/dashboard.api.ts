import { apiClient } from './client';

export const dashboardApi = {
  stats: {
    get: async () => {
      return apiClient.get('/api/master/dashboard/stats');
    }
  },
  
  recentActivities: {
    get: async () => {
      return apiClient.get('/api/master/dashboard/recent-activities');
    }
  },
  
  revenueChart: {
    get: async (period: string = 'month') => {
      return apiClient.get('/api/master/dashboard/revenue-chart', {
        params: { period }
      });
    }
  },
  
  topTenants: {
    get: async () => {
      return apiClient.get('/api/master/dashboard/top-tenants');
    }
  }
};