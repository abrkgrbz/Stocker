import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/shared/types';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  password: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: string;
  isActive?: boolean;
}

class UserService {
  private basePath = '/api/users';

  async getUsers(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{ items: User[]; total: number }>> {
    const response = await apiClient.get(this.basePath, { params });
    return response.data;
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get(`${this.basePath}/${id}`);
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get(`${this.basePath}/me`);
    return response.data;
  }

  async createUser(data: CreateUserDto): Promise<ApiResponse<User>> {
    const response = await apiClient.post(this.basePath, data);
    return response.data;
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<ApiResponse<User>> {
    const response = await apiClient.put(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async updateProfile(data: UpdateUserDto): Promise<ApiResponse<User>> {
    const response = await apiClient.put(`${this.basePath}/me`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.basePath}/${id}`);
    return response.data;
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`${this.basePath}/change-password`, data);
    return response.data;
  }

  async resetPassword(userId: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`${this.basePath}/${userId}/reset-password`, {
      newPassword,
    });
    return response.data;
  }

  async toggleUserStatus(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.post(`${this.basePath}/${id}/toggle-status`);
    return response.data;
  }

  async assignRole(userId: string, role: string): Promise<ApiResponse<User>> {
    const response = await apiClient.post(`${this.basePath}/${userId}/assign-role`, { role });
    return response.data;
  }
}

export const userService = new UserService();