import { apiClient } from './apiClient';

export interface UserDto {
    id: string;
    tenantId?: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdOn: string;
    lastLoginOn?: string;
}

class UserService {
    private readonly baseUrl = '/api/master/users';

    async getAll(): Promise<UserDto[]> {
        const response = await apiClient.get<UserDto[]>(this.baseUrl);
        // @ts-ignore
        return response;
    }

    async getById(id: string): Promise<UserDto> {
        const response = await apiClient.get<UserDto>(`${this.baseUrl}/${id}`);
        // @ts-ignore
        return response;
    }

    async toggleStatus(id: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/toggle-status`);
        // @ts-ignore
        return response.success;
    }

    async assignTenant(userId: string, tenantId: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${userId}/assign-tenant/${tenantId}`);
        // @ts-ignore
        return response.success;
    }
}

export const userService = new UserService();
