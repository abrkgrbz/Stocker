/**
 * Marketplace Service
 * Handles pricing data for modules, bundles, and add-ons
 * Uses PUBLIC endpoints - No authentication required
 */

import { apiClient } from '../client';

export interface ModulePricing {
    id: string;
    moduleCode: string;
    moduleName: string;
    description: string;
    icon: string;
    monthlyPrice: number;
    yearlyPrice: number;
    currency: string;
    isCore: boolean;
    isActive: boolean;
    trialDays?: number;
    displayOrder: number;
    includedFeatures?: string[];
}

export interface BundlePricing {
    id: string;
    bundleCode: string;
    bundleName: string;
    description: string;
    icon: string;
    monthlyPrice: number;
    yearlyPrice: number;
    currency: string;
    discountPercent: number;
    displayOrder: number;
    moduleCodes: string[];
    originalMonthlyPrice: number;
    savingsAmount: number;
    isActive: boolean;
}

export interface AddOnPricing {
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    type: string;
    monthlyPrice: number;
    yearlyPrice?: number;
    currency: string;
    displayOrder: number;
    category?: string;
    requiredModuleCode?: string;
    quantity?: number;
    quantityUnit?: string;
    features?: string[];
    isActive: boolean;
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

export interface FullPricingResponse {
    success: boolean;
    modules: ModulePricing[];
    bundles: BundlePricing[];
    addOns: AddOnPricing[];
}

class MarketplaceService {
    // Using PUBLIC endpoints - No authentication required
    private baseUrl = '/api/public/pricing';

    /**
     * Get all active modules with pricing
     * No authentication required
     */
    async getModules(): Promise<ModulePricing[]> {
        const response = await apiClient.get<{ success: boolean; modules: ModulePricing[] }>(
            `${this.baseUrl}/modules`
        );
        return response.modules ?? [];
    }

    /**
     * Get all active bundles with pricing
     * No authentication required
     */
    async getBundles(): Promise<BundlePricing[]> {
        const response = await apiClient.get<{ success: boolean; bundles: BundlePricing[] }>(
            `${this.baseUrl}/bundles`
        );
        return response.bundles ?? [];
    }

    /**
     * Get all active add-ons with pricing
     * No authentication required
     * @param moduleCode - Optional filter by required module
     */
    async getAddOns(moduleCode?: string): Promise<AddOnPricing[]> {
        const params = moduleCode ? { moduleCode } : undefined;
        const response = await apiClient.get<{ success: boolean; addOns: AddOnPricing[] }>(
            `${this.baseUrl}/addons`,
            params
        );
        return response.addOns ?? [];
    }

    /**
     * Get full pricing information (modules, bundles, and add-ons)
     * No authentication required
     */
    async getFullPricing(): Promise<FullPricingResponse> {
        const response = await apiClient.get<FullPricingResponse>(this.baseUrl);
        return response;
    }

    /**
     * Calculate price preview for selected items
     * No authentication required
     */
    async calculatePrice(request: CalculatePriceRequest): Promise<CalculatePriceResponse> {
        const response = await apiClient.post<CalculatePriceResponse>(
            `${this.baseUrl}/calculate`,
            request
        );
        return response;
    }

    /**
     * Get module by code
     * Convenience method that filters from all modules
     */
    async getModuleByCode(code: string): Promise<ModulePricing | null> {
        const modules = await this.getModules();
        return modules.find(m => m.moduleCode.toLowerCase() === code.toLowerCase()) || null;
    }

    /**
     * Get bundle by code
     * Convenience method that filters from all bundles
     */
    async getBundleByCode(code: string): Promise<BundlePricing | null> {
        const bundles = await this.getBundles();
        return bundles.find(b => b.bundleCode.toLowerCase() === code.toLowerCase()) || null;
    }
}

export const marketplaceService = new MarketplaceService();
