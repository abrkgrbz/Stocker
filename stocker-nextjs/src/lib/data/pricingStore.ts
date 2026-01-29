
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
    trialDays: number;
    displayOrder: number;
    includedFeatures: string[];
    isActive: boolean;
}

export interface BundlePricing {
    id: string;
    bundleCode: string;
    bundleName: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    discountPercent: number;
    displayOrder: number;
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
    currency: string;
    isActive: boolean;
}

// Initial Mock Data
let modules: ModulePricing[] = [
    { id: '1', moduleCode: 'CMS', moduleName: 'İçerik Yönetimi', description: 'Stok takibi ve envanter yönetimi', icon: '📦', monthlyPrice: 0, yearlyPrice: 0, currency: 'TRY', isCore: true, trialDays: 30, displayOrder: 1, includedFeatures: [], isActive: true },
    { id: '2', moduleCode: 'INVENTORY', moduleName: 'Envanter Yönetimi', description: 'Stok takibi', icon: '📦', monthlyPrice: 199, yearlyPrice: 1990, currency: 'TRY', isCore: false, trialDays: 14, displayOrder: 2, includedFeatures: [], isActive: true },
    { id: '3', moduleCode: 'SALES', moduleName: 'Satış Yönetimi', description: 'Satış süreçleri', icon: '💰', monthlyPrice: 249, yearlyPrice: 2490, currency: 'TRY', isCore: false, trialDays: 14, displayOrder: 3, includedFeatures: [], isActive: true },
    { id: '4', moduleCode: 'PURCHASE', moduleName: 'Satın Alma', description: 'Satın alma süreçleri', icon: '🛒', monthlyPrice: 179, yearlyPrice: 1790, currency: 'TRY', isCore: false, trialDays: 14, displayOrder: 4, includedFeatures: [], isActive: true },
    { id: '5', moduleCode: 'FINANCE', moduleName: 'Finans & Muhasebe', description: 'Finansal yönetim', icon: '💵', monthlyPrice: 299, yearlyPrice: 2990, currency: 'TRY', isCore: false, trialDays: 14, displayOrder: 5, includedFeatures: [], isActive: true },
    { id: '6', moduleCode: 'HR', moduleName: 'İnsan Kaynakları', description: 'İK yönetimi', icon: '👥', monthlyPrice: 199, yearlyPrice: 1990, currency: 'TRY', isCore: false, trialDays: 14, displayOrder: 6, includedFeatures: [], isActive: true },
    { id: '7', moduleCode: 'CRM', moduleName: 'Müşteri İlişkileri', description: 'Müşteri takibi', icon: '🤝', monthlyPrice: 199, yearlyPrice: 1990, currency: 'TRY', isCore: false, trialDays: 14, displayOrder: 7, includedFeatures: [], isActive: true },
    { id: '8', moduleCode: 'MANUFACTURING', moduleName: 'Üretim Yönetimi', description: 'Üretim planlama', icon: '🏭', monthlyPrice: 349, yearlyPrice: 3490, currency: 'TRY', isCore: false, trialDays: 14, displayOrder: 8, includedFeatures: [], isActive: true },
    { id: '9', moduleCode: 'WAREHOUSE', moduleName: 'Depo Yönetimi', description: 'Depo takibi', icon: '🏭', monthlyPrice: 149, yearlyPrice: 1490, currency: 'TRY', isCore: false, trialDays: 14, displayOrder: 9, includedFeatures: [], isActive: true },
    { id: '10', moduleCode: 'LOGISTICS', moduleName: 'Lojistik', description: 'Lojistik süreçleri', icon: '🚚', monthlyPrice: 179, yearlyPrice: 1790, currency: 'TRY', isCore: false, trialDays: 14, displayOrder: 10, includedFeatures: [], isActive: true },
    { id: '11', moduleCode: 'QUALITY', moduleName: 'Kalite Kontrol', description: 'Kalite süreçleri', icon: '✅', monthlyPrice: 149, yearlyPrice: 1490, currency: 'TRY', isCore: false, trialDays: 14, displayOrder: 11, includedFeatures: [], isActive: true },
    { id: '12', moduleCode: 'REPORTING', moduleName: 'Gelişmiş Raporlama', description: 'Detaylı raporlar', icon: '📊', monthlyPrice: 99, yearlyPrice: 990, currency: 'TRY', isCore: false, trialDays: 14, displayOrder: 12, includedFeatures: [], isActive: true },
];

let bundles: BundlePricing[] = [
    { id: '1', bundleCode: 'SALES_BUNDLE', bundleName: 'Satış Paketi', description: 'Sales, CRM, Finance', monthlyPrice: 599, yearlyPrice: 5990, discountPercent: 20, displayOrder: 1, moduleCodes: ['SALES', 'CRM', 'FINANCE'], isActive: true },
    { id: '2', bundleCode: 'MANUFACTURING_BUNDLE', bundleName: 'Üretim Paketi', description: 'Production focus', monthlyPrice: 699, yearlyPrice: 6990, discountPercent: 20, displayOrder: 2, moduleCodes: ['INVENTORY', 'MANUFACTURING', 'PURCHASE', 'QUALITY'], isActive: true },
    { id: '3', bundleCode: 'HR_BUNDLE', bundleName: 'İK Paketi', description: 'HR focus', monthlyPrice: 399, yearlyPrice: 3990, discountPercent: 20, displayOrder: 3, moduleCodes: ['HR', 'FINANCE'], isActive: true },
    { id: '4', bundleCode: 'FULL_ERP', bundleName: 'Tam ERP Paketi', description: 'All modules', monthlyPrice: 1499, yearlyPrice: 14990, discountPercent: 30, displayOrder: 4, moduleCodes: modules.map(m => m.moduleCode), isActive: true },
];

let addOns: AddOnPricing[] = [
    { id: '1', code: 'STORAGE_100GB', name: '100 GB Ek Depolama', description: 'Ekstra dosya alanı', monthlyPrice: 49, yearlyPrice: 490, currency: 'TRY', isActive: true },
    { id: '2', code: 'API_LIMIT_X2', name: '2x API Limiti', description: 'API hız limitini ikiye katlar', monthlyPrice: 199, yearlyPrice: 1990, currency: 'TRY', isActive: true },
    { id: '3', code: 'DEDICATED_SUPPORT', name: 'Öncelikli Destek', description: '7/24 destek hattı', monthlyPrice: 499, yearlyPrice: 4990, currency: 'TRY', isActive: true },
];

export const pricingStore = {
    getModules: () => modules,
    updateModule: (code: string, data: Partial<ModulePricing>) => {
        modules = modules.map(m => m.moduleCode === code ? { ...m, ...data } : m);
        return modules.find(m => m.moduleCode === code);
    },

    getBundles: () => bundles,
    createBundle: (data: BundlePricing) => {
        bundles.push({ ...data, id: Math.random().toString(36).substr(2, 9) });
        return data;
    },
    updateBundle: (code: string, data: Partial<BundlePricing>) => {
        bundles = bundles.map(b => b.bundleCode === code ? { ...b, ...data } : b);
        return bundles.find(b => b.bundleCode === code);
    },
    deleteBundle: (code: string) => {
        bundles = bundles.filter(b => b.bundleCode !== code);
        return true;
    },

    getAddOns: () => addOns,
    updateAddOn: (code: string, data: Partial<AddOnPricing>) => {
        addOns = addOns.map(a => a.code === code ? { ...a, ...data } : a);
        return addOns.find(a => a.code === code);
    }
};
