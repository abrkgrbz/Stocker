import { apiClient } from './apiClient';

/**
 * Tenant Module Types
 */
export interface AvailableModuleDto {
  moduleCode: string;
  moduleName: string;
  description?: string;
  isActive: boolean;
  isAvailableInPackage: boolean;
  recordLimit?: number;
  enabledDate?: string;
  expiryDate?: string;
  isTrial: boolean;
}

export interface TenantModuleStatusDto {
  tenantId: string;
  tenantName: string;
  modules: AvailableModuleDto[];
}

export interface ModuleActivationResult {
  success: boolean;
  message: string;
}

/**
 * Tenant Module Service - Handles tenant module activation/deactivation
 */
class TenantModuleService {
  private baseUrl = '/api/master/ModuleActivation';

  /**
   * Get all available modules in the system
   */
  async getAvailableModules(): Promise<AvailableModuleDto[]> {
    const response = await apiClient.get<{ success: boolean; modules: AvailableModuleDto[] }>(
      `${this.baseUrl}/available-modules`
    );
    return response.modules;
  }

  /**
   * Get tenant module status with package availability info
   */
  async getTenantModuleStatus(tenantId: string): Promise<TenantModuleStatusDto> {
    const response = await apiClient.get<{ success: boolean; data: TenantModuleStatusDto }>(
      `${this.baseUrl}/${tenantId}/status`
    );
    return response.data;
  }

  /**
   * Activate a module for tenant
   */
  async activateModule(tenantId: string, moduleName: string): Promise<ModuleActivationResult> {
    const response = await apiClient.post<ModuleActivationResult>(
      `${this.baseUrl}/${tenantId}/modules/${moduleName}/activate`
    );
    return response;
  }

  /**
   * Deactivate a module for tenant
   */
  async deactivateModule(tenantId: string, moduleName: string): Promise<ModuleActivationResult> {
    const response = await apiClient.post<ModuleActivationResult>(
      `${this.baseUrl}/${tenantId}/modules/${moduleName}/deactivate`
    );
    return response;
  }

  /**
   * Get single module status for tenant
   */
  async getModuleStatus(tenantId: string, moduleName: string): Promise<{ isActive: boolean }> {
    const response = await apiClient.get<{ success: boolean; isActive: boolean }>(
      `${this.baseUrl}/${tenantId}/modules/${moduleName}/status`
    );
    return { isActive: response.isActive };
  }

  /**
   * Get list of active modules for tenant
   */
  async getActiveModules(tenantId: string): Promise<string[]> {
    const response = await apiClient.get<{ success: boolean; activeModules: string[] }>(
      `${this.baseUrl}/${tenantId}/modules`
    );
    return response.activeModules;
  }

  /**
   * Initialize CRM module with default data
   */
  async initializeCRMModule(tenantId: string): Promise<ModuleActivationResult & { features?: string[] }> {
    const response = await apiClient.post<ModuleActivationResult & { features?: string[] }>(
      `${this.baseUrl}/${tenantId}/modules/crm/initialize`
    );
    return response;
  }
}

export const tenantModuleService = new TenantModuleService();
