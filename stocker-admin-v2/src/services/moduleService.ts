import { apiClient } from './apiClient';

export interface ModuleDto {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    category: string;
    icon?: string;
    isActive: boolean;
    isDefault: boolean;
    sortOrder: number;
}

class ModuleService {
    private readonly baseUrl = '/api/master/modules';

    async getAll(): Promise<ModuleDto[]> {
        const response = await apiClient.get<ModuleDto[]>(this.baseUrl);
        // @ts-ignore
        return response;
    }

    async toggleActive(id: string): Promise<boolean> {
        const response = await apiClient.patch(`${this.baseUrl}/${id}/toggle-active`);
        // @ts-ignore
        return response.success;
    }
}

export const moduleService = new ModuleService();
