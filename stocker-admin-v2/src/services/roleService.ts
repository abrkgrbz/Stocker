import { apiClient } from './apiClient';

export interface RoleDto {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isSystem?: boolean;
}

export interface PermissionDto {
    code: string;
    name: string;
    group: string;
    description?: string;
}

export interface CreateRoleDto {
    name: string;
    description?: string;
    permissions: string[];
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> { }

class RoleService {
    private readonly baseUrl = '/api/master/roles';

    async getAll(): Promise<RoleDto[]> {
        const response = await apiClient.get<RoleDto[]>(this.baseUrl);
        // @ts-ignore
        return response;
    }

    async getById(id: string): Promise<RoleDto> {
        const response = await apiClient.get<RoleDto>(`${this.baseUrl}/${id}`);
        // @ts-ignore
        return response;
    }

    async getPermissions(): Promise<string[]> {
        const response = await apiClient.get<string[]>(`${this.baseUrl}/permissions`);
        // @ts-ignore
        return response;
    }

    async getPermissionsGrouped(): Promise<Record<string, PermissionDto[]>> {
        const response = await apiClient.get<Record<string, PermissionDto[]>>(`${this.baseUrl}/permissions/grouped`);
        // @ts-ignore
        return response;
    }

    async create(data: CreateRoleDto): Promise<RoleDto> {
        const response = await apiClient.post<RoleDto>(this.baseUrl, data);
        // @ts-ignore
        return response;
    }

    async update(id: string, data: UpdateRoleDto): Promise<boolean> {
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

export const roleService = new RoleService();
