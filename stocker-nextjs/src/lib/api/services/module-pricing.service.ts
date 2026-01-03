/**
 * Module Pricing Service
 * Handles module definitions, pricing calculations, and activation flows
 */

import { apiClient } from '../client';

// =====================================
// TYPES
// =====================================

export interface ModuleFeatureDto {
  featureName: string;
  description?: string;
}

export interface ModuleDefinitionDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  monthlyPrice: number;
  currency: string;
  isCore: boolean;
  isActive: boolean;
  displayOrder: number;
  category?: string;
  features: ModuleFeatureDto[];
  dependencies: string[];
}

export interface CustomPackagePriceRequest {
  selectedModuleCodes: string[];
  userCount: number;
  storagePlanCode?: string;
  selectedAddOnCodes?: string[];
}

export interface ModulePriceBreakdown {
  moduleCode: string;
  moduleName: string;
  monthlyPrice: number;
  isCore: boolean;
  isRequired: boolean; // Required due to dependency
}

export interface UserPricing {
  userCount: number;
  tierCode: string;
  tierName: string;
  pricePerUser: number;
  basePrice: number;
  totalMonthly: number;
}

export interface StoragePricing {
  planCode: string;
  planName: string;
  storageGB: number;
  monthlyPrice: number;
}

export interface AddOnPricing {
  code: string;
  name: string;
  monthlyPrice: number;
}

export interface CustomPackagePriceResponse {
  monthlyTotal: number;
  quarterlyTotal: number;
  semiAnnualTotal: number;
  annualTotal: number;
  currency: string;
  breakdown: ModulePriceBreakdown[];
  quarterlyDiscount: number;
  semiAnnualDiscount: number;
  annualDiscount: number;
  userPricing?: UserPricing;
  storagePricing?: StoragePricing;
  addOns: AddOnPricing[];
}

// =====================================
// SERVICE
// =====================================

export const ModulePricingService = {
  /**
   * Get all available module definitions with pricing
   */
  async getModuleDefinitions(): Promise<ModuleDefinitionDto[]> {
    const response = await apiClient.get<{ success: boolean; data: ModuleDefinitionDto[] }>(
      '/api/public/modules'
    );
    return response.data.data;
  },

  /**
   * Calculate price for selected modules
   */
  async calculatePrice(request: CustomPackagePriceRequest): Promise<CustomPackagePriceResponse> {
    const response = await apiClient.post<{ success: boolean; data: CustomPackagePriceResponse }>(
      '/api/public/calculate-price',
      request
    );
    return response.data.data;
  },

  /**
   * Get single module definition by code
   */
  async getModuleByCode(code: string): Promise<ModuleDefinitionDto | null> {
    const modules = await this.getModuleDefinitions();
    return modules.find(m => m.code.toLowerCase() === code.toLowerCase()) || null;
  },
};
