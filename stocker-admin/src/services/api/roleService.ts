import { apiClient } from './apiClient';

// Role DTOs
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  color: string;
}

export interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

class RoleService {
  private readonly basePath = '/api/master/roles';

  /**
   * Get all roles
   */
  async getAll(): Promise<Role[]> {
    return apiClient.get<Role[]>(this.basePath);
  }

  /**
   * Get role by ID
   */
  async getById(id: string): Promise<Role> {
    return apiClient.get<Role>(`${this.basePath}/${id}`);
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    return apiClient.get<Permission[]>(`${this.basePath}/permissions`);
  }

  /**
   * Create a new role
   */
  async create(role: Omit<Role, 'id' | 'userCount' | 'isSystem'>): Promise<Role> {
    return apiClient.post<Role>(this.basePath, role);
  }

  /**
   * Update role
   */
  async update(id: string, role: Partial<Role>): Promise<boolean> {
    return apiClient.put<boolean>(`${this.basePath}/${id}`, role);
  }

  /**
   * Delete role
   */
  async delete(id: string): Promise<boolean> {
    return apiClient.delete<boolean>(`${this.basePath}/${id}`);
  }
}

// Export singleton instance
export const roleService = new RoleService();
