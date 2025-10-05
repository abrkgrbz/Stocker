import { apiClient } from './apiClient';

export interface Feature {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  category: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateFeatureDto {
  name: string;
  displayName: string;
  description?: string;
  category: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface UpdateFeatureDto {
  displayName?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

class FeatureService {
  private readonly baseUrl = '/api/master/features';

  async getAll(): Promise<Feature[]> {
    return apiClient.get<Feature[]>(this.baseUrl);
  }

  async getById(id: string): Promise<Feature> {
    return apiClient.get<Feature>(`${this.baseUrl}/${id}`);
  }

  async create(data: CreateFeatureDto): Promise<Feature> {
    return apiClient.post<Feature>(this.baseUrl, data);
  }

  async update(id: string, data: UpdateFeatureDto): Promise<Feature> {
    return apiClient.put<Feature>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getByCategory(category: string): Promise<Feature[]> {
    return apiClient.get<Feature[]>(`${this.baseUrl}/category/${category}`);
  }

  async toggleActive(id: string): Promise<Feature> {
    return apiClient.patch<Feature>(`${this.baseUrl}/${id}/toggle-active`);
  }

  async getCategories(): Promise<string[]> {
    return apiClient.get<string[]>(`${this.baseUrl}/categories`);
  }
}

export const featureService = new FeatureService();
