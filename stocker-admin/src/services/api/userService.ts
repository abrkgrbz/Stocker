import { apiClient } from './apiClient';

// User DTOs
export interface UserDto {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  isActive: boolean;
  isEmailConfirmed: boolean;
  isTwoFactorEnabled: boolean;
  roles: string[];
  tenantId?: string;
  tenantName?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface UserListDto {
  id: string;
  email: string;
  fullName: string;
  username: string;
  isActive: boolean;
  roles: string[];
  tenantName?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface CreateUserCommand {
  email: string;
  username: string;
  fullName: string;
  password: string;
  phoneNumber?: string;
  roles: string[];
  tenantId?: string;
  sendWelcomeEmail?: boolean;
}

export interface UpdateUserCommand {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  isActive: boolean;
  roles: string[];
}

export interface ResetPasswordCommand {
  userId: string;
  temporaryPassword?: string;
  sendEmail?: boolean;
}

export interface GetUsersQuery {
  searchTerm?: string;
  tenantId?: string;
  role?: string;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  regularUsers: number;
  newUsersThisMonth: number;
  averageLoginsPerDay: number;
}

class UserService {
  private readonly basePath = '/api/master/users';

  /**
   * Get all users with pagination and filtering
   */
  async getAll(query?: GetUsersQuery): Promise<UserListDto[]> {
    return apiClient.get<UserListDto[]>(this.basePath, query);
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<UserDto> {
    return apiClient.get<UserDto>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new user
   */
  async create(command: CreateUserCommand): Promise<UserDto> {
    return apiClient.post<UserDto>(this.basePath, command);
  }

  /**
   * Update user information
   */
  async update(id: string, command: UpdateUserCommand): Promise<boolean> {
    return apiClient.put<boolean>(`${this.basePath}/${id}`, command);
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<boolean> {
    return apiClient.delete<boolean>(`${this.basePath}/${id}`);
  }

  /**
   * Activate a user
   */
  async activate(id: string): Promise<boolean> {
    return apiClient.post<boolean>(`${this.basePath}/${id}/activate`);
  }

  /**
   * Deactivate a user
   */
  async deactivate(id: string): Promise<boolean> {
    return apiClient.post<boolean>(`${this.basePath}/${id}/deactivate`);
  }

  /**
   * Reset user password
   */
  async resetPassword(command: ResetPasswordCommand): Promise<boolean> {
    return apiClient.post<boolean>(`${this.basePath}/${command.userId}/reset-password`, command);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userId: string): Promise<boolean> {
    return apiClient.post<boolean>(`${this.basePath}/${userId}/send-password-reset`);
  }

  /**
   * Get user statistics
   */
  async getStatistics(): Promise<UserStatistics> {
    return apiClient.get<UserStatistics>(`${this.basePath}/statistics`);
  }

  /**
   * Export users to CSV/Excel
   */
  async export(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    return apiClient.get<Blob>(`${this.basePath}/export?format=${format}`, undefined);
  }

  /**
   * Get user activity logs
   */
  async getActivityLogs(userId: string, days: number = 30): Promise<any[]> {
    return apiClient.get<any[]>(`${this.basePath}/${userId}/activity-logs?days=${days}`);
  }

  /**
   * Get users by tenant
   */
  async getByTenant(tenantId: string): Promise<UserListDto[]> {
    return apiClient.get<UserListDto[]>(`/api/tenants/${tenantId}/users`);
  }
}

export const userService = new UserService();