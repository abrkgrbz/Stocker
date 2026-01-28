import { apiClient } from './apiClient';

export interface SubscriptionDto {
    id: string;
    tenantId: string;
    tenantName: string;
    packageId: string;
    packageName: string;
    status: string; // "Active" | "Suspended" | "Cancelled" | "Expired"
    startDate: string;
    endDate?: string;
    nextBillingDate?: string;
    autoRenew: boolean;
    basePrice: number;
    discount: number;
    finalPrice: number;
    currency: string;
    billingCycle: string; // "Monthly" | "Yearly"
    createdAt: string;
}

export interface SubscriptionModuleDto {
    code: string;
    name: string;
    activatedAt: string;
}

export interface SubscriptionFeatureDto {
    code: string;
    name: string;
    value?: string;
}

export interface SubscriptionHistoryItemDto {
    id: string;
    action: string;
    oldValue?: string;
    newValue?: string;
    changedBy: string;
    changedAt: string;
    notes?: string;
}

export interface SubscriptionUsageDto {
    subscriptionId: string;
    period: { start: string; end: string };
    users: UsageMetric;
    storage: UsageMetric;
    apiCalls: UsageMetric;
    moduleUsage: Record<string, number>;
}

export interface UsageMetric {
    used: number;
    limit: number;
    percentage: number;
}

export interface SubscriptionDetailDto extends SubscriptionDto {
    modules: SubscriptionModuleDto[];
    features: SubscriptionFeatureDto[];
    // invoices: InvoiceSummaryDto[]; // defined in invoiceService or shared
    history: SubscriptionHistoryItemDto[];
}

export interface CreateSubscriptionCommand {
    tenantId: string;
    packageId: string;
    billingCycle: 'Monthly' | 'Yearly';
    autoRenew?: boolean;
    startDate?: string;
    discount?: number;
}

export interface UpgradeSubscriptionRequest {
    newPackageId: string;
    prorateBilling?: boolean;
}

export interface DowngradeSubscriptionRequest {
    newPackageId: string;
    applyAtPeriodEnd?: boolean;
}

class SubscriptionService {
    private readonly baseUrl = '/api/master/subscriptions';

    async getAll(params?: { tenantId?: string; status?: string; autoRenew?: boolean }): Promise<SubscriptionDto[]> {
        const response = await apiClient.get<SubscriptionDto[]>(this.baseUrl, { params });
        // @ts-ignore
        const data = response.data || response;
        // Handle paginated response if wrapped, though API doc says ApiResponse<SubscriptionDto[]>
        if (Array.isArray(data)) return data;
        // @ts-ignore
        if (data.items && Array.isArray(data.items)) return data.items;
        return [];
    }

    async getById(id: string): Promise<SubscriptionDetailDto> {
        return await apiClient.get<SubscriptionDetailDto>(`${this.baseUrl}/${id}`) as any;
    }

    async create(data: CreateSubscriptionCommand): Promise<SubscriptionDto> {
        return await apiClient.post<SubscriptionDto>(this.baseUrl, data) as any;
    }

    async update(id: string, data: any): Promise<boolean> {
        const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
        // @ts-ignore
        return response.success ?? true;
    }

    async cancel(id: string, reason?: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/cancel`, { reason });
        // @ts-ignore
        return response.success ?? true;
    }

    async renew(id: string, additionalMonths: number = 1): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/renew`, { additionalMonths });
        // @ts-ignore
        return response.success ?? true;
    }

    async suspend(id: string, reason: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/suspend`, { reason });
        // @ts-ignore
        return response.success ?? true;
    }

    async reactivate(id: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/reactivate`);
        // @ts-ignore
        return response.success ?? true;
    }

    async getHistory(id: string, limit: number = 50): Promise<SubscriptionHistoryItemDto[]> {
        return await apiClient.get<SubscriptionHistoryItemDto[]>(`${this.baseUrl}/${id}/history`, { params: { limit } }) as any;
    }

    async getUsage(id: string, startDate?: string, endDate?: string): Promise<SubscriptionUsageDto> {
        return await apiClient.get<SubscriptionUsageDto>(`${this.baseUrl}/${id}/usage`, { params: { startDate, endDate } }) as any;
    }

    async upgrade(id: string, data: UpgradeSubscriptionRequest): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/upgrade`, data);
        // @ts-ignore
        return response.success ?? true;
    }

    async downgrade(id: string, data: DowngradeSubscriptionRequest): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/downgrade`, data);
        // @ts-ignore
        return response.success ?? true;
    }
}

export const subscriptionService = new SubscriptionService();
