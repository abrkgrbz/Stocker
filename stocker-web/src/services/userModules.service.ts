import { apiClient } from '@/shared/api/client';

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

class UserModulesService {
  /**
   * Get current user's active modules based on subscription
   */
  async getActiveModules(): Promise<UserModulesResponse> {
    const response = await apiClient.get<UserModulesResponse>('/api/tenant/user-modules/active');
    return response.data;
  }

  /**
   * Check if user has access to a specific module
   */
  hasModuleAccess(modules: ModuleInfo[], moduleCode: string): boolean {
    return modules.some(m => m.code === moduleCode && m.isActive);
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(modules: ModuleInfo[], category: string): ModuleInfo[] {
    return modules.filter(m => m.category === category && m.isActive);
  }

  /**
   * Get module route
   */
  getModuleRoute(modules: ModuleInfo[], moduleCode: string): string | null {
    const module = modules.find(m => m.code === moduleCode && m.isActive);
    return module?.route || null;
  }
}

export const userModulesService = new UserModulesService();
export default userModulesService;
