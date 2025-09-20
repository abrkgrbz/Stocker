import { create } from 'zustand';

interface LoadingState {
  // Loading states for different operations
  operations: Map<string, boolean>;
  
  // Global loading state
  isGlobalLoading: boolean;
  
  // Actions
  setLoading: (key: string, loading: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
  isLoading: (key: string) => boolean;
  clearLoading: (key: string) => void;
  clearAllLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  operations: new Map(),
  isGlobalLoading: false,

  setLoading: (key: string, loading: boolean) => {
    set((state) => {
      const newOperations = new Map(state.operations);
      if (loading) {
        newOperations.set(key, true);
      } else {
        newOperations.delete(key);
      }
      return { operations: newOperations };
    });
  },

  setGlobalLoading: (loading: boolean) => {
    set({ isGlobalLoading: loading });
  },

  isLoading: (key: string) => {
    return get().operations.get(key) || false;
  },

  clearLoading: (key: string) => {
    set((state) => {
      const newOperations = new Map(state.operations);
      newOperations.delete(key);
      return { operations: newOperations };
    });
  },

  clearAllLoading: () => {
    set({ operations: new Map(), isGlobalLoading: false });
  },
}));

// Helper hooks for common loading states
export const useApiLoading = (operationKey: string) => {
  const { isLoading, setLoading } = useLoadingStore();
  
  return {
    isLoading: isLoading(operationKey),
    startLoading: () => setLoading(operationKey, true),
    stopLoading: () => setLoading(operationKey, false),
  };
};

// Common loading keys
export const LOADING_KEYS = {
  // Auth
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout',
  REFRESH_TOKEN: 'auth:refresh',
  
  // Dashboard
  DASHBOARD_STATS: 'dashboard:stats',
  DASHBOARD_REVENUE: 'dashboard:revenue',
  DASHBOARD_HEALTH: 'dashboard:health',
  
  // Tenants
  TENANTS_LIST: 'tenants:list',
  TENANT_CREATE: 'tenant:create',
  TENANT_UPDATE: 'tenant:update',
  TENANT_DELETE: 'tenant:delete',
  TENANT_DETAILS: 'tenant:details',
  
  // Users
  USERS_LIST: 'users:list',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_DETAILS: 'user:details',
  
  // General
  DATA_EXPORT: 'data:export',
  DATA_IMPORT: 'data:import',
  FILE_UPLOAD: 'file:upload',
} as const;