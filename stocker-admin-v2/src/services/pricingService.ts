import { apiClient } from './apiClient';

export interface ModulePricingDto {
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
    isActive: boolean;
}

export interface CreateModulePricingCommand {
    moduleCode: string;
    moduleName: string;
    description?: string;
    icon?: string;
    monthlyPrice: number;
    yearlyPrice: number;
    currency: string;
    isCore: boolean;
    trialDays: number;
    displayOrder: number;
    includedFeatures: string[];
}

export interface UpdateModulePricingCommand {
    moduleName?: string;
    description?: string;
    icon?: string;
    monthlyPrice?: number;
    yearlyPrice?: number;
    isCore?: boolean;
    trialDays?: number;
    displayOrder?: number;
    includedFeatures?: string[];
    isActive?: boolean;
}

export interface BundleDto {
    id: string;
    bundleCode: string;
    bundleName: string;
    description?: string;
    monthlyPrice: number;
    yearlyPrice: number;
    discountPercent: number;
    displayOrder: number;
    moduleCodes: string[];
    originalMonthlyPrice: number;
    savingsAmount: number;
    isActive: boolean;
}

export interface CreateBundleCommand {
    bundleCode: string;
    bundleName: string;
    description?: string;
    monthlyPrice: number;
    yearlyPrice: number;
    discountPercent: number;
    displayOrder: number;
    moduleCodes: string[];
}

export interface UpdateBundleCommand {
    bundleName?: string;
    description?: string;
    monthlyPrice?: number;
    yearlyPrice?: number;
    discountPercent?: number;
    displayOrder?: number;
    moduleCodes?: string[];
    isActive?: boolean;
}

export interface AddOnDto {
    id: string;
    code: string;
    name: string;
    description?: string;
    monthlyPrice: number;
    yearlyPrice: number;
    currency: string;
    isActive: boolean;
}

export interface UpdateAddOnCommand {
    name?: string;
    description?: string;
    monthlyPrice?: number;
    yearlyPrice?: number;
    isActive?: boolean;
}

export interface PriceLineItem {
    code: string;
    name: string;
    type: 'Module' | 'Bundle' | 'AddOn';
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}

export interface CalculatePriceRequest {
    packageId?: string;
    bundleCode?: string;
    moduleCodes?: string[];
    addOnCodes?: string[];
    userCount: number;
    billingCycle: 'monthly' | 'yearly';
}

export interface PriceCalculationResponse {
    success: boolean;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    currency: string;
    billingCycle: string;
    lineItems: PriceLineItem[];
}

class PricingService {
    private readonly baseUrl = '/api/master/pricing';

    // Modules
    async getModules(): Promise<ModulePricingDto[]> {
        const response = await apiClient.get<{ modules: ModulePricingDto[] }>(`${this.baseUrl}/modules`);
        // @ts-ignore
        return (response.data?.modules || response.modules || []) as ModulePricingDto[];
    }

    async createModule(data: CreateModulePricingCommand): Promise<ModulePricingDto> {
        return await apiClient.post<ModulePricingDto>(`${this.baseUrl}/modules`, data) as any;
    }

    async updateModule(code: string, data: UpdateModulePricingCommand): Promise<boolean> {
        const response = await apiClient.put(`${this.baseUrl}/modules/${code}`, data);
        // @ts-ignore
        return response.success ?? true;
    }

    // Bundles
    async getBundles(): Promise<BundleDto[]> {
        const response = await apiClient.get<{ bundles: BundleDto[] }>(`${this.baseUrl}/bundles`);
        // @ts-ignore
        return (response.data?.bundles || response.bundles || []) as BundleDto[];
    }

    async createBundle(data: CreateBundleCommand): Promise<BundleDto> {
        return await apiClient.post<BundleDto>(`${this.baseUrl}/bundles`, data) as any;
    }

    async updateBundle(code: string, data: UpdateBundleCommand): Promise<boolean> {
        const response = await apiClient.put(`${this.baseUrl}/bundles/${code}`, data);
        // @ts-ignore
        return response.success ?? true;
    }

    async deleteBundle(code: string): Promise<boolean> {
        const response = await apiClient.delete(`${this.baseUrl}/bundles/${code}`);
        // @ts-ignore
        return response.success ?? true;
    }

    // AddOns
    async getAddOns(): Promise<AddOnDto[]> {
        const response = await apiClient.get<{ addOns: AddOnDto[] }>(`${this.baseUrl}/addons`);
        // @ts-ignore
        return (response.data?.addOns || response.addOns || []) as AddOnDto[];
    }

    async updateAddOn(code: string, data: UpdateAddOnCommand): Promise<boolean> {
        const response = await apiClient.put(`${this.baseUrl}/addons/${code}`, data);
        // @ts-ignore
        return response.success ?? true;
    }

    // Calculation
    async calculatePrice(request: CalculatePriceRequest): Promise<PriceCalculationResponse> {
        return await apiClient.post<PriceCalculationResponse>(`${this.baseUrl}/calculate`, request) as any;
    }
}

export const pricingService = new PricingService();
