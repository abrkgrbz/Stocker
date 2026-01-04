/**
 * React Query Hooks for User/Tenant Module Information
 * Provides access to subscribed modules and package information
 */

import { useQuery } from '@tanstack/react-query';
import { UserModulesService } from '../services/user-modules.service';
import type { UserModulesResponse, ModuleInfo } from '../services/user-modules.service';
import { queryOptions } from '../query-options';

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

// Dev bypass mock modules - all modules active
const DEV_MOCK_MODULES: UserModulesResponse = {
  tenantId: 'dev-tenant-id',
  packageName: 'Dev Package',
  packageType: 'Enterprise',
  subscriptionStatus: 'Active',
  modules: [
    { code: 'crm', name: 'CRM', isActive: true },
    { code: 'inventory', name: 'Inventory', isActive: true },
    { code: 'sales', name: 'Sales', isActive: true },
    { code: 'purchase', name: 'Purchase', isActive: true },
    { code: 'hr', name: 'HR', isActive: true },
  ],
};

/**
 * Hook to fetch current user's active modules
 */
export function useActiveModules() {
  // Check for auth bypass in development
  const isAuthBypassed = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true';

  return useQuery<UserModulesResponse>({
    queryKey: userModulesKeys.active(),
    queryFn: () => {
      if (isAuthBypassed) {
        console.log('🔓 Modules bypassed - using all modules');
        return Promise.resolve(DEV_MOCK_MODULES);
      }
      return UserModulesService.getActiveModules();
    },
    ...queryOptions.static(),
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
