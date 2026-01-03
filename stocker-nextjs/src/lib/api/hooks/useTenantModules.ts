/**
 * React Query Hooks for Tenant Module Management
 * Provides module listing, toggling, and status management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TenantModulesService, TenantModuleDto, ModulesSummaryDto } from '../services/tenant-modules.service';
import { userModulesKeys } from './useUserModules';

// =====================================
// QUERY KEYS
// =====================================

export const tenantModulesKeys = {
  all: ['tenant-modules'] as const,
  list: (isEnabled?: boolean) => [...tenantModulesKeys.all, 'list', { isEnabled }] as const,
  summary: () => [...tenantModulesKeys.all, 'summary'] as const,
};

// =====================================
// QUERIES
// =====================================

/**
 * Hook to fetch all tenant modules
 */
export function useTenantModules(isEnabled?: boolean) {
  return useQuery<TenantModuleDto[]>({
    queryKey: tenantModulesKeys.list(isEnabled),
    queryFn: () => TenantModulesService.getModules(isEnabled),
  });
}

/**
 * Hook to fetch modules summary
 */
export function useModulesSummary() {
  return useQuery<ModulesSummaryDto>({
    queryKey: tenantModulesKeys.summary(),
    queryFn: () => TenantModulesService.getModulesSummary(),
  });
}

// =====================================
// MUTATIONS
// =====================================

interface ToggleModuleParams {
  moduleCode: string;
  enable: boolean;
}

/**
 * Hook to toggle module enabled/disabled status
 */
export function useToggleModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleCode, enable }: ToggleModuleParams) =>
      TenantModulesService.toggleModule(moduleCode, enable),
    onSuccess: () => {
      // Invalidate all module-related queries
      queryClient.invalidateQueries({ queryKey: tenantModulesKeys.all });
      queryClient.invalidateQueries({ queryKey: userModulesKeys.all });
    },
  });
}

/**
 * Hook to enable a module
 */
export function useEnableModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleCode: string) => TenantModulesService.enableModule(moduleCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantModulesKeys.all });
      queryClient.invalidateQueries({ queryKey: userModulesKeys.all });
    },
  });
}

/**
 * Hook to disable a module
 */
export function useDisableModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleCode: string) => TenantModulesService.disableModule(moduleCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantModulesKeys.all });
      queryClient.invalidateQueries({ queryKey: userModulesKeys.all });
    },
  });
}
