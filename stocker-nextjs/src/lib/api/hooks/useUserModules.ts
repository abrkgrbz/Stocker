/**
 * React Query Hooks for User/Tenant Module Information
 * Provides access to subscribed modules and package information
 */

import { useQuery } from '@tanstack/react-query';
import { UserModulesService } from '../services/user-modules.service';
import type { UserModulesResponse, ModuleInfo } from '../services/user-modules.service';

// =====================================
// QUERY KEYS
// =====================================

export const userModulesKeys = {
  all: ['user-modules'] as const,
  active: () => [...userModulesKeys.all, 'active'] as const,
};

// =====================================
// QUERIES
// =====================================

/**
 * Hook to fetch current user's active modules
 */
export function useActiveModules() {
  return useQuery<UserModulesResponse>({
    queryKey: userModulesKeys.active(),
    queryFn: () => UserModulesService.getActiveModules(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to check if a specific module is active
 */
export function useIsModuleActive(moduleCode: string) {
  const { data, isLoading, error } = useActiveModules();

  const isActive = data?.modules?.some(
    m => m.code.toLowerCase() === moduleCode.toLowerCase() && m.isActive
  ) ?? false;

  return {
    isActive,
    isLoading,
    error,
  };
}

/**
 * Hook to get module codes as a Set for quick lookup
 */
export function useModuleCodes() {
  const { data, isLoading, error } = useActiveModules();

  const moduleCodes = new Set(
    data?.modules?.filter(m => m.isActive).map(m => m.code.toLowerCase()) ?? []
  );

  return {
    moduleCodes,
    hasModule: (code: string) => moduleCodes.has(code.toLowerCase()),
    isLoading,
    error,
  };
}
