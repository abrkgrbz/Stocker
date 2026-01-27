import { apiClient } from './apiClient';

export interface PackageDto {
    id: string;
    name: string;
    description?: string;
    basePrice: { amount: number; currency: string };
    type: string;
    billingCycle: string;
    maxUsers: number;
    maxStorage: number;
    isActive: boolean;
    displayOrder: number;
    features?: string[];
    limits?: {
        apiCalls: number;
        projects: number;
        customDomains: number;
        emailSupport: boolean;
        phoneSupport: boolean;
        prioritySupport: boolean;
        sla: number;
    };
    trialDays?: number;
    isPopular?: boolean;
    isBestValue?: boolean;
}


export interface CreatePackageDto {
    name: string;
    description?: string;
    basePrice: { amount: number; currency: string };
    type: string;
    billingCycle: string;
    maxUsers: number;
    maxStorage: number;
    isActive: boolean;
    displayOrder: number;
    features: string[];
    limits: {
        apiCalls: number;
        projects: number;
        customDomains: number;
        emailSupport: boolean;
        phoneSupport: boolean;
        prioritySupport: boolean;
        sla: number;
    };
    trialDays?: number;
    isPopular?: boolean;
    isBestValue?: boolean;
}

export interface UpdatePackageDto extends Partial<CreatePackageDto> { }

class PackageService {
    private readonly basePath = '/api/master/packages';

    async getAll(): Promise<PackageDto[]> {
        const response = await apiClient.get<PackageDto[]>('/api/master/packages');
        // @ts-ignore
        return response;
    }

    async getById(id: string): Promise<PackageDto> {
        const response = await apiClient.get<PackageDto>(`${this.basePath}/${id}`);
        // @ts-ignore
        return response;
    }

    async create(pkg: CreatePackageDto): Promise<PackageDto> {
        const response = await apiClient.post<PackageDto>(this.basePath, pkg);
        // @ts-ignore
        return response;
    }

    async update(id: string, pkg: UpdatePackageDto): Promise<boolean> {
        await apiClient.put(`${this.basePath}/${id}`, pkg);
        return true;
    }

    async delete(id: string): Promise<boolean> {
        await apiClient.delete(`${this.basePath}/${id}`);
        return true;
    }

    async toggleStatus(id: string): Promise<boolean> {
        return apiClient.post(`${this.basePath}/${id}/toggle-status`, {});
    }
}

export const packageService = new PackageService();
