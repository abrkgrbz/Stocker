import { apiClient } from './apiClient';

export interface TenantListDto {
    id: string;
    name: string;
    code: string;
    domain: string;
    isActive: boolean;
    packageName: string;
    createdDate: string;
    subscriptionEndDate?: string;
    userCount: number;
}

export interface TenantDto extends TenantListDto {
    subdomain: string;
    customDomain?: string;
    contactEmail: string;
    contactPhone: string;
    description?: string;
    owner: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        title?: string;
    };
    company: {
        name: string;
        taxNumber: string;
        taxOffice?: string;
        address: string;
        city: string;
        country: string;
        postalCode: string;
    };
    limits: {
        apiCalls: { used: number; max: number };
        bandwidth: { used: number; max: number };
        emailsSent: { used: number; max: number };
        customDomains: { used: number; max: number };
    };
    storage: number;
    maxStorage: number;
    users: number;
    maxUsers: number;
    billing: {
        amount: number;
        currency: string;
        nextBillingDate: string;
    };
    lastActive?: string;
    database?: {
        region: string;
        size: number;
    };
}

export interface TenantsStatisticsDto {
    totalTenants: number;
    activeTenants: number;
    suspendedTenants: number;
    totalUsers: number;
}

class TenantService {
    private readonly basePath = '/api/master/tenants';

    async getAll(params?: any): Promise<TenantListDto[]> {
        return apiClient.get('/api/master/tenants', { params });
    }

    async getById(id: string): Promise<TenantDto> {
        return apiClient.get(`/api/master/tenants/${id}`);
    }

    async getAllStatistics(): Promise<TenantsStatisticsDto> {
        return apiClient.get('/api/master/tenants/statistics');
    }

    async toggleStatus(id: string): Promise<boolean> {
        return apiClient.post(`/api/master/tenants/${id}/toggle-status`);
    }

    async delete(id: string, hardDelete: boolean = false): Promise<boolean> {
        return apiClient.delete(`/api/master/tenants/${id}`, {
            params: { hardDelete }
        });
    }
}

export const tenantService = new TenantService();
