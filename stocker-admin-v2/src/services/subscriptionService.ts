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

export interface CreateSubscriptionDto {
    tenantId: string;
    packageId: string;
    autoRenew?: boolean;
}

export interface UpdateSubscriptionDto {
    autoRenew?: boolean;
}

class SubscriptionService {
    private readonly baseUrl = '/api/master/subscriptions';

    async getAll(): Promise<SubscriptionDto[]> {
        const response = await apiClient.get<any>(this.baseUrl) as any;
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.items)) return response.items;
        return [];
    }

    async getById(id: string): Promise<SubscriptionDto> {
        const response = await apiClient.get<SubscriptionDto>(`${this.baseUrl}/${id}`);
        // @ts-ignore
        return response;
    }

    async create(data: CreateSubscriptionDto): Promise<SubscriptionDto> {
        const response = await apiClient.post<SubscriptionDto>(this.baseUrl, data);
        // @ts-ignore
        return response;
    }

    async update(id: string, data: UpdateSubscriptionDto): Promise<boolean> {
        const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
        // @ts-ignore
        return response.success;
    }

    async cancel(id: string, reason: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/cancel`, { reason });
        // @ts-ignore
        return response.success;
    }

    async renew(id: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/renew`);
        // @ts-ignore
        return response.success;
    }

    async suspend(id: string, reason: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/suspend`, { reason });
        // @ts-ignore
        return response.success;
    }

    async reactivate(id: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/reactivate`);
        // @ts-ignore
        return response.success;
    }

    async changePackage(tenantId: string, packageId: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/tenant/${tenantId}/change-package`, { packageId });
        // @ts-ignore
        return response.success;
    }
}

export const subscriptionService = new SubscriptionService();
