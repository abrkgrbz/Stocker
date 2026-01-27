import { apiClient } from './apiClient';

export interface BillingStatisticsDto {
    totalRevenue: number;
    monthlyRevenue: number;
    activeSubscriptions: number;
    overdueInvoices: number;
}

export interface PaymentDto {
    id: string;
    tenantId: string;
    amount: number;
    currency: string;
    status: string;
    date: string;
    method: string;
}

class BillingService {
    private readonly baseUrl = '/api/master/billing';

    async getSubscriptions(): Promise<any[]> {
        const response = await apiClient.get<any[]>(`${this.baseUrl}/subscriptions`);
        // @ts-ignore
        return response;
    }

    async getTenantSubscription(tenantId: string): Promise<any> {
        const response = await apiClient.get<any>(`${this.baseUrl}/subscriptions/${tenantId}`);
        // @ts-ignore
        return response;
    }

    async getStatistics(): Promise<BillingStatisticsDto> {
        const response = await apiClient.get<BillingStatisticsDto>(`${this.baseUrl}/statistics`);
        // @ts-ignore
        return response;
    }

    async getPayments(tenantId?: string): Promise<PaymentDto[]> {
        const url = tenantId ? `${this.baseUrl}/payments/${tenantId}` : `${this.baseUrl}/payments`;
        const response = await apiClient.get<PaymentDto[]>(url);
        // @ts-ignore
        return response;
    }

    async syncStripe(tenantId: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/subscriptions/${tenantId}/sync`);
        // @ts-ignore
        return response.success;
    }
}

export const billingService = new BillingService();
