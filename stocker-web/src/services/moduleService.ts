import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/shared/types';

export interface Module {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon?: string;
  route: string;
  isActive: boolean;
  order: number;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleDto {
  name: string;
  displayName: string;
  description: string;
  icon?: string;
  route: string;
  order?: number;
  permissions?: string[];
}

export interface UpdateModuleDto {
  displayName?: string;
  description?: string;
  icon?: string;
  route?: string;
  order?: number;
  isActive?: boolean;
  permissions?: string[];
}

export interface TenantModule {
  id: string;
  tenantId: string;
  moduleId: string;
  module: Module;
  isEnabled: boolean;
  enabledAt: string;
  disabledAt?: string;
}

class ModuleService {
  private basePath = '/api/modules';

  async getModules(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{ items: Module[]; total: number }>> {
    const response = await apiClient.get(this.basePath, { params });
    return response.data;
  }

  async getModuleById(id: string): Promise<ApiResponse<Module>> {
    const response = await apiClient.get(`${this.basePath}/${id}`);
    return response.data;
  }

  async createModule(data: CreateModuleDto): Promise<ApiResponse<Module>> {
    const response = await apiClient.post(this.basePath, data);
    return response.data;
  }

  async updateModule(id: string, data: UpdateModuleDto): Promise<ApiResponse<Module>> {
    const response = await apiClient.put(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async deleteModule(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.basePath}/${id}`);
    return response.data;
  }

  async toggleModuleStatus(id: string): Promise<ApiResponse<Module>> {
    const response = await apiClient.post(`${this.basePath}/${id}/toggle-status`);
    return response.data;
  }

  // Tenant Module Management
  async getTenantModules(tenantId: string): Promise<ApiResponse<TenantModule[]>> {
    const response = await apiClient.get(`/api/tenants/${tenantId}/modules`);
    return response.data;
  }

  async enableModuleForTenant(
    tenantId: string,
    moduleId: string
  ): Promise<ApiResponse<TenantModule>> {
    const response = await apiClient.post(`/api/tenants/${tenantId}/modules/${moduleId}/enable`);
    return response.data;
  }

  async disableModuleForTenant(
    tenantId: string,
    moduleId: string
  ): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`/api/tenants/${tenantId}/modules/${moduleId}/disable`);
    return response.data;
  }

  async updateModuleOrder(modules: { id: string; order: number }[]): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`${this.basePath}/update-order`, { modules });
    return response.data;
  }
}

export const moduleService = new ModuleService();