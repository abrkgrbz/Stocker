import { apiClient } from './apiClient';

export type SubscriptionStatus = 0 | 1 | 2 | 3 | 4;

export const SUBSCRIPTION_STATUS = {
    Deneme: 0,
    Aktif: 1,
    Askida: 2,
    Iptal: 3,
    Suresi_Dolmus: 4
} as const;

export interface SubscriptionDto {
    id: string;
    tenantId: string;
    packageId: string;
    tenantName: string;
    packageName: string;
    status: SubscriptionStatus;
    currentPeriodEnd: string;
    autoRenew: boolean;
    price: number;
    currency: string;
}

class SubscriptionService {
    private readonly basePath = '/api/master/subscriptions';

    async getAll(): Promise<SubscriptionDto[]> {
        return apiClient.get('/api/master/subscriptions');
    }

    async cancel(id: string, reason: string): Promise<boolean> {
        return apiClient.post(`/api/master/subscriptions/${id}/cancel`, { reason });
    }
}

export const subscriptionService = new SubscriptionService();
