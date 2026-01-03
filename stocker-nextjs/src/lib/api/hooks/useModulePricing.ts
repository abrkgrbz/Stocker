/**
 * React Query Hooks for Module Pricing
 * Provides module definitions and pricing calculations
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ModulePricingService,
  ModuleDefinitionDto,
  CustomPackagePriceRequest,
  CustomPackagePriceResponse,
} from '../services/module-pricing.service';

// =====================================
// QUERY KEYS
// =====================================

export const modulePricingKeys = {
  all: ['module-pricing'] as const,
  definitions: () => [...modulePricingKeys.all, 'definitions'] as const,
  definition: (code: string) => [...modulePricingKeys.all, 'definition', code] as const,
  price: (codes: string[]) => [...modulePricingKeys.all, 'price', codes.sort().join(',')] as const,
};

// =====================================
// QUERIES
// =====================================

/**
 * Hook to fetch all module definitions with pricing
 */
export function useModuleDefinitions() {
  return useQuery<ModuleDefinitionDto[]>({
    queryKey: modulePricingKeys.definitions(),
    queryFn: () => ModulePricingService.getModuleDefinitions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get a single module by code
 */
export function useModuleDefinition(code: string) {
  const { data: modules, ...rest } = useModuleDefinitions();

  const module = modules?.find(
    m => m.code.toLowerCase() === code.toLowerCase()
  );

  return {
    data: module,
    ...rest,
  };
}

// =====================================
// MUTATIONS
// =====================================

/**
 * Hook to calculate price for selected modules
 */
export function useCalculateModulePrice() {
  return useMutation<CustomPackagePriceResponse, Error, CustomPackagePriceRequest>({
    mutationFn: (request) => ModulePricingService.calculatePrice(request),
  });
}

/**
 * Hook for calculating price with automatic trigger
 */
export function useModulePrice(moduleCodes: string[], userCount: number = 1) {
  return useQuery<CustomPackagePriceResponse>({
    queryKey: [...modulePricingKeys.price(moduleCodes), userCount],
    queryFn: () => ModulePricingService.calculatePrice({
      selectedModuleCodes: moduleCodes,
      userCount,
    }),
    enabled: moduleCodes.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
