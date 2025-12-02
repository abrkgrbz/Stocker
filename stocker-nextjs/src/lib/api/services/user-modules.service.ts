import { ApiService } from '../api-service';

export interface ModuleInfo {
  code: string;
  name: string;
  isActive: boolean;
  category?: string;
  description?: string;
  icon?: string;
  route?: string;
}

export interface UserModulesResponse {
  tenantId: string;
  modules: ModuleInfo[];
  packageName: string;
  packageType: string;
  subscriptionStatus: string;
  subscriptionExpiryDate?: string;
}

/**
 * Service for fetching user/tenant module information
 */
export class UserModulesService {
  private static readonly BASE_URL = '/api/tenant/user-modules';

  /**
   * Get current user's active modules based on subscription
   */
  static async getActiveModules(): Promise<UserModulesResponse> {
    return ApiService.get<UserModulesResponse>(`${this.BASE_URL}/active`);
  }

  /**
   * Check if a specific module is active for the current tenant
   */
  static async isModuleActive(moduleCode: string): Promise<boolean> {
    try {
      const response = await this.getActiveModules();
      return response.modules.some(
        m => m.code.toLowerCase() === moduleCode.toLowerCase() && m.isActive
      );
    } catch {
      return false;
    }
  }
}
