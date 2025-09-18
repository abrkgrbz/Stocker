import { api } from './client';

export interface UserModule {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  isActive: boolean;
  isPremium: boolean;
  order: number;
  features?: string[];
}

export interface UserModulesResponse {
  modules: UserModule[];
  isCompanyOwner: boolean;
  permissions: string[];
}

export const modulesApi = {
  // Get user's subscribed modules and permissions
  getUserModules: async (): Promise<UserModulesResponse> => {
    const response = await api.get('/api/user/modules');
    return response.data;
  },

  // Get all available modules (for admin)
  getAllModules: async (): Promise<UserModule[]> => {
    const response = await api.get('/api/modules');
    return response.data;
  },

  // Assign modules to user
  assignModulesToUser: async (userId: string, moduleIds: string[]): Promise<void> => {
    await api.post(`/api/users/${userId}/modules`, { moduleIds });
  },

  // Remove module from user
  removeModuleFromUser: async (userId: string, moduleId: string): Promise<void> => {
    await api.delete(`/api/users/${userId}/modules/${moduleId}`);
  }
};