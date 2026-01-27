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

export interface CreateModuleDto {
    name: string;
    displayName: string;
    description?: string;
    category: string;
    isActive?: boolean;
}

export interface UpdateModuleDto extends Partial<CreateModuleDto> { }

class ModuleService {
    private readonly baseUrl = '/api/master/modules';

    async getAll(): Promise<ModuleDto[]> {
        const response = await apiClient.get<ModuleDto[]>(this.baseUrl);
        // @ts-ignore
        return response;
    }

    async getById(id: string): Promise<ModuleDto> {
        const response = await apiClient.get<ModuleDto>(`${this.baseUrl}/${id}`);
        // @ts-ignore
        return response;
    }

    async create(data: CreateModuleDto): Promise<ModuleDto> {
        const response = await apiClient.post<ModuleDto>(this.baseUrl, data);
        // @ts-ignore
        return response;
    }

    async update(id: string, data: UpdateModuleDto): Promise<boolean> {
        const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
        // @ts-ignore
        return response.success;
    }

    async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete(`${this.baseUrl}/${id}`);
        // @ts-ignore
        return response.success;
    }
}

export const moduleService = new ModuleService();
