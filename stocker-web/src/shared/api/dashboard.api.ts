import axios from 'axios';
import { getApiUrl } from '../utils/config';

const API_URL = getApiUrl();

export const dashboardApi = {
  stats: {
    get: async () => {
      return axios.get(`${API_URL}/api/master/dashboard/stats`);
    }
  },
  
  recentActivities: {
    get: async () => {
      return axios.get(`${API_URL}/api/master/dashboard/recent-activities`);
    }
  },
  
  revenueChart: {
    get: async (period: string = 'month') => {
      return axios.get(`${API_URL}/api/master/dashboard/revenue-chart`, {
        params: { period }
      });
    }
  },
  
  topTenants: {
    get: async () => {
      return axios.get(`${API_URL}/api/master/dashboard/top-tenants`);
    }
  }
};