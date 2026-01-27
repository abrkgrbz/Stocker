import { apiClient } from './apiClient';

export interface AvailableModuleDto {
    moduleCode: string;
    moduleName: string;
    description: string;
    isActive: boolean;
    isAvailableInPackage: boolean;
    isTrial: boolean;
    enabledDate?: string;
    recordLimit?: number;
}

export interface TenantModuleStatusDto {
    tenantId: string;
    tenantName: string;
    modules: AvailableModuleDto[];
}

export interface InitializationResultDto {
    success: boolean;
    message: string;
    features?: string[];
}

class TenantModuleService {
    private readonly baseUrl = '/api/master/moduleactivation';

    async getAvailableModules(): Promise<AvailableModuleDto[]> {
        const response = await apiClient.get<AvailableModuleDto[]>(`${this.baseUrl}/available-modules`);
        // @ts-ignore
        return response;
    }

    async getTenantModuleStatus(tenantId: string): Promise<TenantModuleStatusDto> {
        const response = await apiClient.get<TenantModuleStatusDto>(`${this.baseUrl}/${tenantId}/status`);
        // @ts-ignore
        return response;
    }

    async getTenantModules(tenantId: string): Promise<AvailableModuleDto[]> {
        const response = await apiClient.get<AvailableModuleDto[]>(`${this.baseUrl}/${tenantId}/modules`);
        // @ts-ignore
        return response;
    }

    async getModuleStatus(tenantId: string, moduleName: string): Promise<any> {
        const response = await apiClient.get<any>(`${this.baseUrl}/${tenantId}/modules/${moduleName}/status`);
        // @ts-ignore
        return response;
    }

    async activateModule(tenantId: string, moduleCode: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.post<{ success: boolean; message: string }>(`${this.baseUrl}/${tenantId}/modules/${moduleCode}/activate`);
        // @ts-ignore
        return response;
    }

    async deactivateModule(tenantId: string, moduleCode: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.post<{ success: boolean; message: string }>(`${this.baseUrl}/${tenantId}/modules/${moduleCode}/deactivate`);
        // @ts-ignore
        return response;
    }

    async initializeCRMModule(tenantId: string): Promise<InitializationResultDto> {
        const response = await apiClient.post<InitializationResultDto>(`${this.baseUrl}/${tenantId}/modules/crm/initialize`);
        // @ts-ignore
        return response;
    }

    async initializeHRModule(tenantId: string): Promise<InitializationResultDto> {
        const response = await apiClient.post<InitializationResultDto>(`${this.baseUrl}/${tenantId}/modules/hr/initialize`);
        // @ts-ignore
        return response;
    }

    async initializeInventoryModule(tenantId: string): Promise<InitializationResultDto> {
        const response = await apiClient.post<InitializationResultDto>(`${this.baseUrl}/${tenantId}/modules/inventory/initialize`);
        // @ts-ignore
        return response;
    }

    async initializeSalesModule(tenantId: string): Promise<InitializationResultDto> {
        const response = await apiClient.post<InitializationResultDto>(`${this.baseUrl}/${tenantId}/modules/sales/initialize`);
        // @ts-ignore
        return response;
    }
}

export const tenantModuleService = new TenantModuleService();
