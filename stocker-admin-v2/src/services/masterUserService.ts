import { apiClient } from './apiClient';

export interface MasterUserDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    roles: string[];
    createdOn: string;
    lastLoginOn?: string;
    assignedTenants?: string[];
}

export interface CreateMasterUserDto {
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    password?: string;
}

export interface UpdateMasterUserDto {
    firstName?: string;
    lastName?: string;
    roles?: string[];
}

class MasterUserService {
    private readonly baseUrl = '/api/master/masterusers';

    async getAll(): Promise<MasterUserDto[]> {
        const response = await apiClient.get<MasterUserDto[]>(this.baseUrl);
        // @ts-ignore
        return response; // Assuming it returns array directly based on API list, or items wrapper handled by client
    }

    async getById(id: string): Promise<MasterUserDto> {
        const response = await apiClient.get<MasterUserDto>(`${this.baseUrl}/${id}`);
        // @ts-ignore
        return response;
    }

    async create(data: CreateMasterUserDto): Promise<MasterUserDto> {
        const response = await apiClient.post<MasterUserDto>(this.baseUrl, data);
        // @ts-ignore
        return response;
    }

    async update(id: string, data: UpdateMasterUserDto): Promise<boolean> {
        const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
        // @ts-ignore
        return response.success;
    }

    async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete(`${this.baseUrl}/${id}`);
        // @ts-ignore
        return response.success;
    }

    async toggleStatus(id: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/toggle-status`);
        // @ts-ignore
        return response.success;
    }

    async assignTenant(id: string, tenantId: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/assign-tenant`, { tenantId });
        // @ts-ignore
        return response.success;
    }

    async removeTenant(id: string, tenantId: string): Promise<boolean> {
        const response = await apiClient.delete(`${this.baseUrl}/${id}/remove-tenant/${tenantId}`);
        // @ts-ignore
        return response.success;
    }

    async resetPassword(id: string): Promise<{ temporaryPassword?: string }> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/reset-password`);
        // @ts-ignore
        return response;
    }
}

export const masterUserService = new MasterUserService();
