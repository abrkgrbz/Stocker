import { api } from './client';
import { Subscription, CreateSubscriptionRequest, SubscriptionStatus } from '@/shared/types';

export const subscriptionsApi = {
  getAll: (params?: { 
    tenantId?: string; 
    status?: SubscriptionStatus; 
    autoRenew?: boolean 
  }) => 
    api.get<Subscription[]>('/api/master/subscriptions', { params }),
    
  getById: (id: string) => 
    api.get<Subscription>(`/api/master/subscriptions/${id}`),
    
  create: (data: CreateSubscriptionRequest) => 
    api.post<Subscription>('/api/master/subscriptions', data),
    
  update: (id: string, data: Partial<CreateSubscriptionRequest>) => 
    api.put<boolean>(`/api/master/subscriptions/${id}`, data),
    
  cancel: (id: string, reason: string) => 
    api.post<boolean>(`/api/master/subscriptions/${id}/cancel`, { reason }),
    
  renew: (id: string) => 
    api.post<boolean>(`/api/master/subscriptions/${id}/renew`),
    
  suspend: (id: string, reason: string) => 
    api.post<boolean>(`/api/master/subscriptions/${id}/suspend`, { reason }),
    
  reactivate: (id: string) => 
    api.post<boolean>(`/api/master/subscriptions/${id}/reactivate`),
};