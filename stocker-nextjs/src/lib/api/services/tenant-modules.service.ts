import { ApiService } from '../api-service';

/**
 * Module DTO from backend
 */
export interface TenantModuleDto {
  id: string;
  tenantId: string;
  moduleCode: string;
  moduleName: string;
  isEnabled: boolean;
  enabledDate?: string;
  disabledDate?: string;
  expiryDate?: string;
  isTrial: boolean;
  isExpired: boolean;
  userLimit?: number;
  storageLimit?: number;
  recordLimit?: number;
  configuration?: string;
}

/**
 * Toggle module request
 */
export interface ToggleModuleRequest {
  enable: boolean;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

/**
 * Modules summary
 */
export interface ModulesSummaryDto {
  totalModules: number;
  enabledModules: number;
  disabledModules: number;
  trialModules: number;
  expiredModules: number;
  modules: TenantModuleDto[];
}

/**
 * Service for tenant module management operations
 */
export class TenantModulesService {
  private static readonly BASE_URL = '/tenant/modules';

  /**
   * Get all modules for current tenant
   */
  static async getModules(isEnabled?: boolean): Promise<TenantModuleDto[]> {
    const params = isEnabled !== undefined ? `?isEnabled=${isEnabled}` : '';
    const response = await ApiService.get<ApiResponse<TenantModuleDto[]>>(`${this.BASE_URL}${params}`);
    return response.data;
  }

  /**
   * Get modules summary for current tenant
   */
  static async getModulesSummary(): Promise<ModulesSummaryDto> {
    const response = await ApiService.get<ApiResponse<ModulesSummaryDto>>(`${this.BASE_URL}/summary`);
    return response.data;
  }

  /**
   * Toggle module enabled/disabled status
   */
  static async toggleModule(moduleCode: string, enable: boolean): Promise<boolean> {
    const response = await ApiService.post<ApiResponse<boolean>>(
      `${this.BASE_URL}/${moduleCode}/toggle`,
      { enable }
    );
    return response.data;
  }

  /**
   * Enable a specific module
   */
  static async enableModule(moduleCode: string): Promise<boolean> {
    return this.toggleModule(moduleCode, true);
  }

  /**
   * Disable a specific module
   */
  static async disableModule(moduleCode: string): Promise<boolean> {
    return this.toggleModule(moduleCode, false);
  }
}
