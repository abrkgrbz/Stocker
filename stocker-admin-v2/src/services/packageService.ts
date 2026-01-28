import { apiClient } from './apiClient';

export interface PackageFeatureDto {
    featureCode: string;
    featureName: string;
    isEnabled: boolean;
    value?: string; // Keeping value as optional if it's used elsewhere or future proofing
}

export interface PackageModuleDto {
    moduleCode: string;
    moduleName: string;
    isIncluded: boolean;
}

export interface PackageDto {
    id: string;
    name: string;
    description?: string;
    basePrice: {
        amount: number;
        currency: string;
    };
    currency: string;
    billingCycle: string;
    maxUsers: number;
    maxStorage: number; // in GB
    trialDays?: number;
    type?: string;
    isActive: boolean;
    isPublic?: boolean;
    displayOrder: number;
    features: PackageFeatureDto[];
    modules: PackageModuleDto[];
    createdAt: string;
}

export interface CreatePackageCommand {
    name: string;
    description?: string;
    basePrice: {
        amount: number;
        currency: string;
    };
    currency: string;
    billingCycle: string;
    maxUsers: number;
    maxStorage: number;
    isActive?: boolean;
    displayOrder?: number;
    trialDays?: number;
    type?: string;
    isPopular?: boolean;
    isBestValue?: boolean;
    features?: string[]; // Assuming backend handles list of feature codes
    limits?: any; // To align with formData structure if needed, or define strict type
}

export interface UpdatePackageCommand {
    name?: string;
    description?: string;
    basePrice?: {
        amount: number;
        currency: string;
    };
    billingCycle?: string;
    maxUsers?: number;
    maxStorage?: number;
    isActive?: boolean;
    trialDays?: number;
    type?: string;
    isPopular?: boolean;
    isBestValue?: boolean;
}

export interface AddPackageFeatureCommand {
    featureCode: string;
    value?: string;
}

export interface AddPackageModuleCommand {
    moduleCode: string;
}

class PackageService {
    private readonly baseUrl = '/api/master/packages';

    async getAll(): Promise<PackageDto[]> {
        const response = await apiClient.get<PackageDto[]>(this.baseUrl);
        // @ts-ignore
        const data = response.data || response;
        if (Array.isArray(data)) return data;
        // @ts-ignore
        if (data.items && Array.isArray(data.items)) return data.items;
        return [];
    }

    async getById(id: string): Promise<PackageDto> {
        return await apiClient.get<PackageDto>(`${this.baseUrl}/${id}`) as any;
    }

    async create(data: CreatePackageCommand): Promise<PackageDto> {
        return await apiClient.post<PackageDto>(this.baseUrl, data) as any;
    }

    async update(id: string, data: UpdatePackageCommand): Promise<boolean> {
        const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
        // @ts-ignore
        return response.success ?? true;
    }

    async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete(`${this.baseUrl}/${id}`);
        // @ts-ignore
        return response.success ?? true;
    }

    async addFeature(id: string, data: AddPackageFeatureCommand): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/features`, data);
        // @ts-ignore
        return response.success ?? true;
    }

    async removeFeature(id: string, featureCode: string): Promise<boolean> {
        const response = await apiClient.delete(`${this.baseUrl}/${id}/features/${featureCode}`);
        // @ts-ignore
        return response.success ?? true;
    }

    async addModule(id: string, data: AddPackageModuleCommand): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/modules`, data);
        // @ts-ignore
        return response.success ?? true;
    }

    async removeModule(id: string, moduleCode: string): Promise<boolean> {
        const response = await apiClient.delete(`${this.baseUrl}/${id}/modules/${moduleCode}`);
        // @ts-ignore
        return response.success ?? true;
    }
}

export const packageService = new PackageService();
