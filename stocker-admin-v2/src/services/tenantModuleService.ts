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
    private readonly basePath = '/api/master/ModuleActivation';

    async getTenantModuleStatus(tenantId: string): Promise<TenantModuleStatusDto> {
        // @ts-ignore
        return apiClient.get<TenantModuleStatusDto>(`${this.basePath}/${tenantId}/status`);
    }

    async activateModule(tenantId: string, moduleCode: string): Promise<{ success: boolean; message: string }> {
        // @ts-ignore
        return apiClient.post(`${this.basePath}/${tenantId}/modules/${moduleCode}/activate`);
    }

    async deactivateModule(tenantId: string, moduleCode: string): Promise<{ success: boolean; message: string }> {
        // @ts-ignore
        return apiClient.post(`${this.basePath}/${tenantId}/modules/${moduleCode}/deactivate`);
    }

    async initializeCRMModule(tenantId: string): Promise<InitializationResultDto> {
        // @ts-ignore
        return apiClient.post(`${this.basePath}/${tenantId}/modules/crm/initialize`);
    }

    async initializeHRModule(tenantId: string): Promise<InitializationResultDto> {
        // @ts-ignore
        return apiClient.post(`${this.basePath}/${tenantId}/modules/hr/initialize`);
    }

    async initializeInventoryModule(tenantId: string): Promise<InitializationResultDto> {
        // @ts-ignore
        return apiClient.post(`${this.basePath}/${tenantId}/modules/inventory/initialize`);
    }

    async initializeSalesModule(tenantId: string): Promise<InitializationResultDto> {
        // @ts-ignore
        return apiClient.post(`${this.basePath}/${tenantId}/modules/sales/initialize`);
    }
}

export const tenantModuleService = new TenantModuleService();
