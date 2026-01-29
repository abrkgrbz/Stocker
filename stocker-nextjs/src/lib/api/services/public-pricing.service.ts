/**
 * Public Pricing Service
 * Handles public (unauthenticated) pricing endpoints for visitors
 * These endpoints allow users to view pricing before signing up
 */

import { apiClient } from '../client';

// =====================================
// TYPES
// =====================================

export interface PublicModulePricing {
  id: string;
  moduleCode: string;
  moduleName: string;
  description?: string;
  icon?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  isCore: boolean;
  trialDays?: number;
  displayOrder: number;
  includedFeatures: string[];
}

export interface PublicBundlePricing {
  id: string;
  bundleCode: string;
  bundleName: string;
  description?: string;
  icon?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  discountPercent: number;
  displayOrder: number;
  moduleCodes: string[];
  originalMonthlyPrice: number;
  savingsAmount: number;
}

export interface PublicAddOnPricing {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  type: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  currency: string;
  displayOrder: number;
  category?: string;
  requiredModuleCode?: string;
  quantity?: number;
  quantityUnit?: string;
  features: string[];
}

export interface FullPricingResponse {
  success: boolean;
  modules: PublicModulePricing[];
  bundles: PublicBundlePricing[];
  addOns: PublicAddOnPricing[];
}

export interface CalculatePriceRequest {
  packageId?: string;
  bundleCode?: string;
  moduleCodes?: string[];
  addOnCodes?: string[];
  userCount: number;
  billingCycle?: 'monthly' | 'yearly';
}

export interface PriceLineItem {
  code: string;
  name: string;
  type: 'Bundle' | 'Module' | 'AddOn' | 'Users';
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface CalculatePriceResponse {
  success: boolean;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  billingCycle: string;
  basePackagePrice: number;
  modulesPrice: number;
  bundlePrice: number;
  addOnsPrice: number;
  userPrice: number;
  includedUsers: number;
  additionalUsers: number;
  pricePerAdditionalUser: number;
  lineItems: PriceLineItem[];
}

// =====================================
// SERVICE
// =====================================

const BASE_PATH = '/api/public/pricing';

export const PublicPricingService = {
  /**
   * Get all active module pricings
   * No authentication required
   */
  async getModules(): Promise<PublicModulePricing[]> {
    const response = await apiClient.get<{ success: boolean; modules: PublicModulePricing[] }>(
      `${BASE_PATH}/modules`
    );
    return response.modules ?? [];
  },

  /**
   * Get all active bundles with included modules
   * No authentication required
   */
  async getBundles(): Promise<PublicBundlePricing[]> {
    const response = await apiClient.get<{ success: boolean; bundles: PublicBundlePricing[] }>(
      `${BASE_PATH}/bundles`
    );
    return response.bundles ?? [];
  },

  /**
   * Get all active add-ons
   * No authentication required
   * @param moduleCode - Optional filter by required module
   */
  async getAddOns(moduleCode?: string): Promise<PublicAddOnPricing[]> {
    const params = moduleCode ? { moduleCode } : undefined;
    const response = await apiClient.get<{ success: boolean; addOns: PublicAddOnPricing[] }>(
      `${BASE_PATH}/addons`,
      params
    );
    return response.addOns ?? [];
  },

  /**
   * Get full pricing information (modules, bundles, and add-ons)
   * No authentication required
   */
  async getFullPricing(): Promise<FullPricingResponse> {
    const response = await apiClient.get<FullPricingResponse>(BASE_PATH);
    return response;
  },

  /**
   * Calculate price preview for selected items
   * No authentication required
   */
  async calculatePrice(request: CalculatePriceRequest): Promise<CalculatePriceResponse> {
    const response = await apiClient.post<CalculatePriceResponse>(
      `${BASE_PATH}/calculate`,
      request
    );
    return response;
  },

  /**
   * Get module by code
   * Convenience method that filters from all modules
   */
  async getModuleByCode(code: string): Promise<PublicModulePricing | null> {
    const modules = await this.getModules();
    return modules.find(m => m.moduleCode.toLowerCase() === code.toLowerCase()) || null;
  },

  /**
   * Get bundle by code
   * Convenience method that filters from all bundles
   */
  async getBundleByCode(code: string): Promise<PublicBundlePricing | null> {
    const bundles = await this.getBundles();
    return bundles.find(b => b.bundleCode.toLowerCase() === code.toLowerCase()) || null;
  },
};

export default PublicPricingService;
