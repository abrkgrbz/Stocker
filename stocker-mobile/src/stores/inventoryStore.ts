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

interface InventoryState {
    products: Product[];
    warehouses: Warehouse[];
    lowStockProducts: Product[];
    expiringStock: any[]; // Define proper type if needed
    stats: InventoryStats | null;

    isLoading: boolean;
    error: string | null;
    lastUpdated: number | null;

    // Actions
    fetchDashboardData: () => Promise<void>;
    fetchProducts: (params?: any) => Promise<void>;
    fetchProductDetails: (id: number) => Promise<Product | null>;
    fetchWarehouses: () => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
    products: [],
    warehouses: [],
    lowStockProducts: [],
    expiringStock: [],
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
            if (response.data?.success) {
                set({ products: response.data.data, isLoading: false });
            }
        } catch (error: any) {
            set({ isLoading: false, error: error.message });
        }
    },

    fetchProductDetails: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.inventory.getProduct(id);
            set({ isLoading: false });
            if (response.data?.success) {
                return response.data.data;
            }
            return null;
        } catch (error: any) {
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
    }
}));
