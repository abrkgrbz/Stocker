
import axios from 'axios';

export interface ModulePricing {
    id: string;
    moduleCode: string;
    moduleName: string;
    description: string;
    icon: string;
    monthlyPrice: number;
    yearlyPrice: number;
    isCore: boolean;
    isActive: boolean;
    features?: string[];
}

export interface BundlePricing {
    id: string;
    bundleCode: string;
    bundleName: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    discountPercent: number;
    moduleCodes: string[];
    isActive: boolean;
}

export interface AddOnPricing {
    id: string;
    code: string;
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    isActive: boolean;
}

class MarketplaceService {
    private baseUrl = '/api/master/pricing';

    async getModules(): Promise<ModulePricing[]> {
        const response = await axios.get<{ modules: ModulePricing[] }>(`${this.baseUrl}/modules`);
        return response.data.modules;
    }

    async getBundles(): Promise<BundlePricing[]> {
        const response = await axios.get<{ bundles: BundlePricing[] }>(`${this.baseUrl}/bundles`);
        return response.data.bundles;
    }

    async getAddOns(): Promise<AddOnPricing[]> {
        const response = await axios.get<{ addOns: AddOnPricing[] }>(`${this.baseUrl}/addons`);
        return response.data.addOns;
    }
}

export const marketplaceService = new MarketplaceService();
