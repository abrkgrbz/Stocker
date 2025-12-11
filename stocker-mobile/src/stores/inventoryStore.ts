import { create } from 'zustand';
import { apiService } from '../services/api';

// Types
export interface Product {
    id: number;
    name: string;
    code: string;
    description?: string;
    categoryId?: number;
    categoryName?: string;
    brandId?: number;
    brandName?: string;
    unitId?: number;
    unitName?: string;
    purchasePrice: number;
    salePrice: number;
    vatRate: number;
    isActive: boolean;
    minStockLevel: number;
    maxStockLevel?: number;
    currentStock: number;
    imageUrl?: string;
    // New fields
    barcode?: string;
    productType?: string;
    reorderLevel?: number;
    reorderQuantity?: number;
    leadTimeDays?: number;
    trackSerialNumbers?: boolean;
    trackLotNumbers?: boolean;
    createdAt?: string;
}

export interface Warehouse {
    id: number;
    name: string;
    code?: string;
    address?: string;
    city?: string;
    isActive: boolean;
    isDefault: boolean;
}

export interface InventoryStats {
    totalProducts: number;
    activeProducts: number;
    totalWarehouses: number;
    lowStockCount: number;
    expiringCount: number;
}

export interface StockMovement {
    id: number;
    productId: number;
    productName: string;
    warehouseId: number;
    warehouseName: string;
    type: string;
    quantity: number;
    reference?: string;
    description?: string;
    createdAt: string;
    createdByName: string;
}

export interface StockTransfer {
    id: number;
    sourceWarehouseId: number;
    sourceWarehouseName: string;
    destinationWarehouseId: number;
    destinationWarehouseName: string;
    status: 'Pending' | 'Completed' | 'Rejected' | 'Cancelled';
    transferDate: string;
    reference?: string;
    description?: string;
    items: StockTransferItem[];
    createdByName: string;
}

export interface StockTransferItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
}

export interface StockCount {
    id: number;
    warehouseId: number;
    warehouseName: string;
    status: 'Draft' | 'InProgress' | 'Completed' | 'Cancelled';
    countDate: string;
    description?: string;
    items: StockCountItem[];
    createdByName: string;
}

export interface StockCountItem {
    id: number;
    productId: number;
    productName: string;
    expectedQuantity: number;
    countedQuantity: number;
    difference: number;
}

interface InventoryState {
    products: Product[];
    warehouses: Warehouse[];
    lowStockProducts: Product[];
    expiringStock: any[]; // Define proper type if needed
    stockMovements: StockMovement[];
    stockTransfers: StockTransfer[];
    stockCounts: StockCount[];
    stats: InventoryStats | null;

    isLoading: boolean;
    error: string | null;
    lastUpdated: number | null;

    // Actions
    fetchDashboardData: () => Promise<void>;
    fetchProducts: (params?: any) => Promise<void>;
    fetchProductDetails: (id: number) => Promise<Product | null>;
    fetchWarehouses: () => Promise<void>;
    fetchStockMovements: (params?: any) => Promise<void>;
    fetchStockTransfers: (params?: any) => Promise<void>;
    fetchStockCounts: (params?: any) => Promise<void>;
    fetchStockCountDetails: (id: number) => Promise<StockCount | null>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
    products: [],
    warehouses: [],
    lowStockProducts: [],
    expiringStock: [],
    stockMovements: [],
    stockTransfers: [],
    stockCounts: [],
    stats: null,

    isLoading: false,
    error: null,
    lastUpdated: null,

    fetchDashboardData: async () => {
        set({ isLoading: true, error: null });
        try {
            // Fetch summary data in parallel
            const [productsRes, warehousesRes, lowStockRes, expiringRes] = await Promise.all([
                apiService.inventory.getProducts({ includeInactive: true }),
                apiService.inventory.getWarehouses(),
                apiService.inventory.getLowStockProducts(),
                apiService.inventory.getExpiringStock(30)
            ]);

            const products = productsRes.data?.data || [];
            const warehouses = warehousesRes.data?.data || [];
            const lowStock = lowStockRes.data?.data || [];
            const expiring = expiringRes.data?.data || [];

            // Calculate stats locally for now (or use a specific stats endpoint if available)
            const stats: InventoryStats = {
                totalProducts: products.length,
                activeProducts: products.filter((p: Product) => p.isActive).length,
                totalWarehouses: warehouses.length,
                lowStockCount: lowStock.length,
                expiringCount: expiring.length
            };

            set({
                products,
                warehouses,
                lowStockProducts: lowStock,
                expiringStock: expiring,
                stats,
                isLoading: false,
                lastUpdated: Date.now()
            });

        } catch (error: any) {
            console.error('Inventory dashboard fetch error:', error);
            set({
                isLoading: false,
                error: error.message || 'Envanter verileri yüklenirken hata oluştu'
            });
        }
    },

    fetchProducts: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.inventory.getProducts(params);
            console.log('Fetch products response data:', response.data);

            // Handle direct array response (which is what the API returns)
            let productData = [];
            if (Array.isArray(response.data)) {
                productData = response.data;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                productData = response.data.data;
            } else if (response.data?.success && Array.isArray(response.data.data)) {
                productData = response.data.data;
            }

            const mappedProducts = productData.map((p: any) => ({
                id: p.id,
                name: p.name,
                code: p.code,
                description: p.description,
                categoryId: p.categoryId,
                categoryName: p.categoryName,
                brandId: p.brandId,
                brandName: p.brandName,
                unitId: p.unitId,
                unitName: p.unitName,
                purchasePrice: p.costPrice || 0,
                salePrice: p.unitPrice || 0,
                vatRate: p.vatRate || 18,
                isActive: p.isActive,
                minStockLevel: p.minStockLevel || 0,
                maxStockLevel: p.maxStockLevel,
                currentStock: p.totalStockQuantity || 0,
                imageUrl: p.images?.[0] || null,
                barcode: p.barcode,
                productType: p.productType,
                reorderLevel: p.reorderLevel,
                reorderQuantity: p.reorderQuantity,
                leadTimeDays: p.leadTimeDays,
                trackSerialNumbers: p.trackSerialNumbers,
                trackLotNumbers: p.trackLotNumbers,
                createdAt: p.createdAt
            }));

            set({ products: mappedProducts, isLoading: false });

        } catch (error: any) {
            console.error('Fetch products error:', error);
            set({ isLoading: false, error: error.message || 'Ürünler yüklenemedi' });
        }
    },

    fetchProductDetails: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.inventory.getProduct(id);
            console.log('Fetch product detail response:', response.data);
            set({ isLoading: false });

            // Handle direct object response
            const p: any = response.data;

            // Check if it's wrapped or direct
            const rawData = p.success && p.data ? p.data : p;

            if (rawData) {
                return {
                    id: rawData.id,
                    name: rawData.name,
                    code: rawData.code,
                    description: rawData.description,
                    categoryId: rawData.categoryId,
                    categoryName: rawData.categoryName,
                    brandId: rawData.brandId,
                    brandName: rawData.brandName,
                    unitId: rawData.unitId,
                    unitName: rawData.unitName,
                    purchasePrice: rawData.costPrice || 0,
                    salePrice: rawData.unitPrice || 0,
                    vatRate: rawData.vatRate || 18,
                    isActive: rawData.isActive,
                    minStockLevel: rawData.minStockLevel || 0,
                    maxStockLevel: rawData.maxStockLevel,
                    currentStock: rawData.totalStockQuantity || 0,
                    imageUrl: rawData.images?.[0] || null,
                    barcode: rawData.barcode,
                    productType: rawData.productType,
                    reorderLevel: rawData.reorderLevel,
                    reorderQuantity: rawData.reorderQuantity,
                    leadTimeDays: rawData.leadTimeDays,
                    trackSerialNumbers: rawData.trackSerialNumbers,
                    trackLotNumbers: rawData.trackLotNumbers,
                    createdAt: rawData.createdAt
                };
            }
            return null;
        } catch (error: any) {
            console.error('Fetch product detail error:', error);
            set({ isLoading: false, error: error.message });
            return null;
        }
    },

    fetchWarehouses: async () => {
        try {
            const response = await apiService.inventory.getWarehouses();
            if (response.data?.success) {
                set({ warehouses: response.data.data });
            }
        } catch (error) {
            console.error('Fetch warehouses error:', error);
        }
    },

    fetchStockTransfers: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.inventory.getStockTransfers(params);
            if (response.data?.success) {
                set({ stockTransfers: response.data.data, isLoading: false });
            } else {
                set({ error: 'Transferler yüklenemedi', isLoading: false });
            }
        } catch (error: any) {
            set({ isLoading: false, error: error.message });
        }
    },

    fetchStockMovements: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.inventory.getStockMovements(params);
            if (response.data?.success) {
                set({ stockMovements: response.data.data, isLoading: false });
            }
        } catch (error: any) {
            set({ isLoading: false, error: error.message });
        }
    },

    fetchStockCounts: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.inventory.getStockCounts(params);
            if (response.data?.success) {
                set({ stockCounts: response.data.data, isLoading: false });
            } else {
                set({ error: 'Sayımlar yüklenemedi', isLoading: false });
            }
        } catch (error: any) {
            set({ isLoading: false, error: error.message });
        }
    },

    fetchStockCountDetails: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.inventory.getStockCount(id);
            set({ isLoading: false });
            if (response.data?.success) {
                return response.data.data;
            }
            return null;
        } catch (error: any) {
            set({ isLoading: false, error: error.message });
            return null;
        }
    }
}));
