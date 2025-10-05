import { apiClient } from './apiClient';

export interface Module {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  category: string;
  icon?: string;
  route?: string;
  parentModuleId?: string;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
  requiredFeatures: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateModuleDto {
  name: string;
  displayName: string;
  description?: string;
  category: string;
  icon?: string;
  route?: string;
  parentModuleId?: string;
  sortOrder?: number;
  isActive?: boolean;
  isDefault?: boolean;
  requiredFeatures?: string[];
}

export interface UpdateModuleDto {
  displayName?: string;
  description?: string;
  category?: string;
  icon?: string;
  route?: string;
  parentModuleId?: string;
  sortOrder?: number;
  isActive?: boolean;
  isDefault?: boolean;
  requiredFeatures?: string[];
}

class ModuleService {
  private readonly baseUrl = '/api/master/modules';

  async getAll(): Promise<Module[]> {
    return apiClient.get<Module[]>(this.baseUrl);
  }

  async getById(id: string): Promise<Module> {
    return apiClient.get<Module>(`${this.baseUrl}/${id}`);
  }

  async create(data: CreateModuleDto): Promise<Module> {
    return apiClient.post<Module>(this.baseUrl, data);
  }

  async update(id: string, data: UpdateModuleDto): Promise<Module> {
    return apiClient.put<Module>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getByCategory(category: string): Promise<Module[]> {
    return apiClient.get<Module[]>(`${this.baseUrl}/category/${category}`);
  }

  async toggleActive(id: string): Promise<Module> {
    return apiClient.patch<Module>(`${this.baseUrl}/${id}/toggle-active`);
  }

  async getHierarchy(): Promise<Module[]> {
    return apiClient.get<Module[]>(`${this.baseUrl}/hierarchy`);
  }

  async updateSortOrder(updates: Array<{ id: string; sortOrder: number }>): Promise<void> {
    return apiClient.post(`${this.baseUrl}/sort-order`, { updates });
  }

  async getCategories(): Promise<string[]> {
    return apiClient.get<string[]>(`${this.baseUrl}/categories`);
  }
}

export const moduleService = new ModuleService();
