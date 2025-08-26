import axios from 'axios';
import { getApiUrl } from '../utils/config';

const API_URL = getApiUrl();

export interface SubscriptionDto {
  id: string;
  tenantId: string;
  tenantName: string;
  packageId: string;
  packageName: string;
  status: 'Active' | 'Trial' | 'Suspended' | 'Cancelled' | 'Expired';
  price: {
    amount: number;
    currency: string;
  };
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  features: string[];
  createdAt: string;
}

export interface CreateSubscriptionDto {
  tenantId: string;
  packageId: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export interface UpdateSubscriptionDto {
  packageId?: string;
  autoRenew?: boolean;
  endDate?: string;
}

export const subscriptionsApi = {
  getAll: async (params?: { tenantId?: string; status?: string; autoRenew?: boolean }) => {
    return axios.get(`${API_URL}/api/master/subscriptions`, { params });
  },

  getById: async (id: string) => {
    return axios.get(`${API_URL}/api/master/subscriptions/${id}`);
  },

  create: async (data: CreateSubscriptionDto) => {
    return axios.post(`${API_URL}/api/master/subscriptions`, data);
  },

  update: async (id: string, data: UpdateSubscriptionDto) => {
    return axios.put(`${API_URL}/api/master/subscriptions/${id}`, data);
  },

  cancel: async (id: string, reason?: string) => {
    return axios.post(`${API_URL}/api/master/subscriptions/${id}/cancel`, { reason });
  },

  renew: async (id: string, months?: number) => {
    return axios.post(`${API_URL}/api/master/subscriptions/${id}/renew`, { months });
  },

  suspend: async (id: string, reason: string) => {
    return axios.post(`${API_URL}/api/master/subscriptions/${id}/suspend`, { reason });
  },

  activate: async (id: string) => {
    return axios.post(`${API_URL}/api/master/subscriptions/${id}/activate`);
  },

  getUsage: async (id: string) => {
    return axios.get(`${API_URL}/api/master/subscriptions/${id}/usage`);
  },
};