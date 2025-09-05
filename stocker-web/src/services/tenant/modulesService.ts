import api from '../api';
import { ModuleDto, ModulesSummaryDto } from '../../types/tenant/modules';

export interface ToggleModuleRequest {
  enable: boolean;
}

class TenantModulesService {
  private baseUrl = '/api/tenant/modules';

  async getModules(isEnabled?: boolean): Promise<ModuleDto[]> {
    const params = new URLSearchParams();
    if (isEnabled !== undefined) {
      params.append('isEnabled', isEnabled.toString());
    }

    const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl;
    const response = await api.get(url);
    return response.data.data;
  }

  async toggleModule(moduleCode: string, enable: boolean): Promise<boolean> {
    const response = await api.post(`${this.baseUrl}/${moduleCode}/toggle`, { enable });
    return response.data.data;
  }

  async getModulesSummary(): Promise<ModulesSummaryDto> {
    const response = await api.get(`${this.baseUrl}/summary`);
    return response.data.data;
  }

  async enableModule(moduleCode: string): Promise<boolean> {
    return this.toggleModule(moduleCode, true);
  }

  async disableModule(moduleCode: string): Promise<boolean> {
    return this.toggleModule(moduleCode, false);
  }

  async isModuleEnabled(moduleCode: string): Promise<boolean> {
    const modules = await this.getModules();
    const module = modules.find(m => m.moduleCode === moduleCode);
    return module?.isEnabled || false;
  }

  async getModuleByCode(moduleCode: string): Promise<ModuleDto | undefined> {
    const modules = await this.getModules();
    return modules.find(m => m.moduleCode === moduleCode);
  }
}

export default new TenantModulesService();