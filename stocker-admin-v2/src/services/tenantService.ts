import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';

export interface GetTenantsListQuery {
    searchTerm?: string;
    status?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    pageNumber?: number;
    pageSize?: number;
}

export interface TenantListDto {
    id: string;
    code: string;
    name: string;
    contactEmail: string;
    contactPhone?: string;
    isActive: boolean;
    status: string;
    createdAt: string;
    userCount: number;
    subscriptionStatus?: string;
    packageName?: string;
}

export interface TenantDto {
    id: string;
    code: string;
    name: string;
    contactEmail: string;
    contactPhone?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    taxNumber?: string;
    isActive: boolean;
    status: string;
    createdAt: string;
    updatedAt?: string;
    settings?: {
        language: string;
        timezone: string;
        currency: string;
        dateFormat: string;
    };
    subscription?: {
        packageId: string;
        packageName: string;
        status: string;
        startDate: string;
        endDate?: string;
        autoRenew: boolean;
    };
}

export interface TenantsStatisticsDto {
    totalTenants: number;
    activeTenants: number;
    suspendedTenants: number;
    newTenantsThisMonth: number;
    churnRate: number;
    averageUsersPerTenant: number;
    tenantsByPackage: Record<string, number>;
    tenantGrowthTrend: { date: string; value: number }[];
}

export interface TenantStatisticsDto {
    tenantId: string;
    totalUsers: number;
    activeUsers: number;
    storageUsedBytes: number;
    storageUsedGB: number;
    lastActivityDate?: string;
    moduleUsage: Record<string, number>;
    loginCount30Days: number;
}

export interface CreateTenantCommand {
    name: string;
    code: string;
    contactEmail: string;
    contactPhone?: string;
    packageId: string;
    billingCycle: 'Monthly' | 'Yearly';
    adminEmail: string;
    adminPassword?: string;
}

export interface UpdateTenantCommand {
    name?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    taxNumber?: string;
}

export interface TenantActivityDto {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    icon: string;
    color: string;
}

class TenantService {
    private readonly baseUrl = '/api/master/tenants';

    async getAll(params?: GetTenantsListQuery): Promise<ApiResponse<TenantListDto[]>> {
        const response = await apiClient.get<ApiResponse<TenantListDto[]>>(this.baseUrl, { params });
        // @ts-ignore
        return response;
    }

    async getStatistics(fromDate?: string, toDate?: string): Promise<TenantsStatisticsDto> {
        const response = await apiClient.get<TenantsStatisticsDto>(`${this.baseUrl}/statistics`, { params: { fromDate, toDate } });
        // @ts-ignore
        return response;
    }

    async getById(id: string): Promise<TenantDto> {
        const response = await apiClient.get<TenantDto>(`${this.baseUrl}/${id}`);
        // @ts-ignore
        return response;
    }

    async getByIdStatistics(id: string): Promise<TenantStatisticsDto> {
        const response = await apiClient.get<TenantStatisticsDto>(`${this.baseUrl}/${id}/statistics`);
        // @ts-ignore
        return response;
    }

    async create(data: CreateTenantCommand): Promise<TenantDto> {
        const response = await apiClient.post<TenantDto>(this.baseUrl, data);
        // @ts-ignore
        return response;
    }

    async update(id: string, data: UpdateTenantCommand): Promise<boolean> {
        const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
        // @ts-ignore
        return response; // ApiClient interceptor unpacks boolean responses too
    }

    async delete(id: string, reason?: string, hardDelete = false): Promise<boolean> {
        const response = await apiClient.delete(`${this.baseUrl}/${id}`, { params: { reason, hardDelete } });
        // @ts-ignore
        return response;
    }

    async toggleStatus(id: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/toggle-status`);
        // @ts-ignore
        return response;
    }

    async suspend(id: string, reason: string, suspendedUntil?: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/suspend`, { reason, suspendedUntil });
        // @ts-ignore
        return response;
    }

    async activate(id: string, notes?: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/activate`, { notes });
        // @ts-ignore
        return response;
    }

    async loginAsTenant(id: string): Promise<{ tenantId: string; accessToken: string; redirectUrl: string }> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/login`);
        // @ts-ignore
        return response;
    }

    async getActivities(id: string, limit = 10): Promise<TenantActivityDto[]> {
        const response = await apiClient.get<TenantActivityDto[]>(`${this.baseUrl}/${id}/activities`, { params: { limit } });
        // @ts-ignore
        return response;
    }

    async getActivityLogs(id: string, params?: any): Promise<any> {
        const response = await apiClient.get(`${this.baseUrl}/${id}/activity-logs`, { params });
        // @ts-ignore
        return response;
    }

    async getSecurityEvents(id: string, params?: any): Promise<any> {
        const response = await apiClient.get(`${this.baseUrl}/${id}/security-events`, { params });
        // @ts-ignore
        return response;
    }

    async getSettings(id: string): Promise<any> {
        const response = await apiClient.get(`${this.baseUrl}/${id}/settings`);
        // @ts-ignore
        return response;
    }

    async updateSettings(id: string, data: any): Promise<boolean> {
        const response = await apiClient.put(`${this.baseUrl}/${id}/settings`, data);
        // @ts-ignore
        return response;
    }
}

export const tenantService = new TenantService();
