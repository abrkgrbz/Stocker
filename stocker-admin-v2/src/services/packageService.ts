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
    private readonly baseUrl = '/api/master/packages';

    async getAll(): Promise<PackageDto[]> {
        const response = await apiClient.get<PackageDto[]>(this.baseUrl);
        // @ts-ignore
        return response;
    }

    async getById(id: string): Promise<PackageDto> {
        const response = await apiClient.get<PackageDto>(`${this.baseUrl}/${id}`);
        // @ts-ignore
        return response;
    }

    async create(pkg: CreatePackageDto): Promise<PackageDto> {
        const response = await apiClient.post<PackageDto>(this.baseUrl, pkg);
        // @ts-ignore
        return response;
    }

    async update(id: string, pkg: UpdatePackageDto): Promise<boolean> {
        await apiClient.put(`${this.baseUrl}/${id}`, pkg);
        return true;
    }

    async delete(id: string): Promise<boolean> {
        await apiClient.delete(`${this.baseUrl}/${id}`);
        return true;
    }

    async addFeature(id: string, feature: string): Promise<boolean> {
        await apiClient.post(`${this.baseUrl}/${id}/features`, { feature });
        return true;
    }

    async removeFeature(id: string, featureCode: string): Promise<boolean> {
        await apiClient.delete(`${this.baseUrl}/${id}/features/${featureCode}`);
        return true;
    }

    async addModule(id: string, moduleCode: string): Promise<boolean> {
        await apiClient.post(`${this.baseUrl}/${id}/modules`, { moduleCode });
        return true;
    }

    async removeModule(id: string, moduleCode: string): Promise<boolean> {
        await apiClient.delete(`${this.baseUrl}/${id}/modules/${moduleCode}`);
        return true;
    }
}

export const packageService = new PackageService();
