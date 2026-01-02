import api from '@/lib/axios';
import type {
    Product,
    ProductListParams,
    ProductListResponse,
    StockLevel,
    StockMovement,
    StockCount,
    Warehouse,
    Category,
    BarcodeScanResult,
    CreateProductRequest,
    UpdateProductRequest,
    StockMovementRequest,
    StockCountRequest,
    StockCountItemUpdate,
    StockTransfer,
    StockTransferRequest,
} from '../types/inventory.types';

class InventoryService {
    private readonly baseUrl = '/inventory';

    // Products
    async getProducts(params?: ProductListParams): Promise<ProductListResponse> {
        const response = await api.get<ProductListResponse>(`${this.baseUrl}/products`, { params });
        return response.data;
    }

    async getProduct(id: string): Promise<Product> {
        const response = await api.get<Product>(`${this.baseUrl}/products/${id}`);
        return response.data;
    }

    async createProduct(data: CreateProductRequest): Promise<Product> {
        const response = await api.post<Product>(`${this.baseUrl}/products`, data);
        return response.data;
    }

    async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
        const response = await api.put<Product>(`${this.baseUrl}/products/${id}`, data);
        return response.data;
    }

    async deleteProduct(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/products/${id}`);
    }

    async searchProducts(query: string): Promise<Product[]> {
        const response = await api.get<Product[]>(`${this.baseUrl}/products/search`, {
            params: { q: query }
        });
        return response.data;
    }

    async getProductByBarcode(barcode: string): Promise<BarcodeScanResult> {
        const response = await api.get<BarcodeScanResult>(`${this.baseUrl}/products/barcode/${barcode}`);
        return response.data;
    }

    async getLowStockProducts(): Promise<Product[]> {
        const response = await api.get<Product[]>(`${this.baseUrl}/products/low-stock`);
        return response.data;
    }

    // Stock Levels
    async getStockLevels(productId: string): Promise<StockLevel[]> {
        const response = await api.get<StockLevel[]>(`${this.baseUrl}/products/${productId}/stock`);
        return response.data;
    }

    async getWarehouseStock(warehouseId: string, params?: ProductListParams): Promise<ProductListResponse> {
        const response = await api.get<ProductListResponse>(`${this.baseUrl}/warehouses/${warehouseId}/stock`, { params });
        return response.data;
    }

    // Stock Movements
    async getStockMovements(params?: {
        productId?: string;
        warehouseId?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{ items: StockMovement[]; totalCount: number }> {
        const response = await api.get(`${this.baseUrl}/movements`, { params });
        return response.data;
    }

    async createStockMovement(data: StockMovementRequest): Promise<StockMovement> {
        const response = await api.post<StockMovement>(`${this.baseUrl}/movements`, data);
        return response.data;
    }

    async adjustStock(productId: string, warehouseId: string, quantity: number, reason: string): Promise<StockMovement> {
        const response = await api.post<StockMovement>(`${this.baseUrl}/movements/adjust`, {
            productId,
            warehouseId,
            quantity,
            reason
        });
        return response.data;
    }

    // Stock Transfers
    async getStockTransfers(params?: {
        status?: string;
        fromWarehouseId?: string;
        toWarehouseId?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{ items: StockTransfer[]; totalCount: number }> {
        const response = await api.get(`${this.baseUrl}/transfers`, { params });
        return response.data;
    }

    async getStockTransfer(id: string): Promise<StockTransfer> {
        const response = await api.get<StockTransfer>(`${this.baseUrl}/transfers/${id}`);
        return response.data;
    }

    async createStockTransfer(data: StockTransferRequest): Promise<StockTransfer> {
        const response = await api.post<StockTransfer>(`${this.baseUrl}/transfers`, data);
        return response.data;
    }

    async approveStockTransfer(id: string): Promise<StockTransfer> {
        const response = await api.post<StockTransfer>(`${this.baseUrl}/transfers/${id}/approve`);
        return response.data;
    }

    async shipStockTransfer(id: string): Promise<StockTransfer> {
        const response = await api.post<StockTransfer>(`${this.baseUrl}/transfers/${id}/ship`);
        return response.data;
    }

    async receiveStockTransfer(id: string): Promise<StockTransfer> {
        const response = await api.post<StockTransfer>(`${this.baseUrl}/transfers/${id}/receive`);
        return response.data;
    }

    async cancelStockTransfer(id: string, reason?: string): Promise<void> {
        await api.post(`${this.baseUrl}/transfers/${id}/cancel`, { reason });
    }

    // Stock Counts
    async getStockCounts(params?: {
        warehouseId?: string;
        status?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{ items: StockCount[]; totalCount: number }> {
        const response = await api.get(`${this.baseUrl}/counts`, { params });
        return response.data;
    }

    async getStockCount(id: string): Promise<StockCount> {
        const response = await api.get<StockCount>(`${this.baseUrl}/counts/${id}`);
        return response.data;
    }

    async createStockCount(data: StockCountRequest): Promise<StockCount> {
        const response = await api.post<StockCount>(`${this.baseUrl}/counts`, data);
        return response.data;
    }

    async updateStockCountItem(countId: string, productId: string, data: StockCountItemUpdate): Promise<void> {
        await api.patch(`${this.baseUrl}/counts/${countId}/items/${productId}`, data);
    }

    async completeStockCount(id: string, applyVariance: boolean = true): Promise<StockCount> {
        const response = await api.post<StockCount>(`${this.baseUrl}/counts/${id}/complete`, { applyVariance });
        return response.data;
    }

    async cancelStockCount(id: string): Promise<void> {
        await api.post(`${this.baseUrl}/counts/${id}/cancel`);
    }

    // Warehouses
    async getWarehouses(): Promise<Warehouse[]> {
        const response = await api.get<Warehouse[]>(`${this.baseUrl}/warehouses`);
        return response.data;
    }

    async getWarehouse(id: string): Promise<Warehouse> {
        const response = await api.get<Warehouse>(`${this.baseUrl}/warehouses/${id}`);
        return response.data;
    }

    // Categories
    async getCategories(): Promise<Category[]> {
        const response = await api.get<Category[]>(`${this.baseUrl}/categories`);
        return response.data;
    }

    async getCategoryTree(): Promise<Category[]> {
        const response = await api.get<Category[]>(`${this.baseUrl}/categories/tree`);
        return response.data;
    }

    // Dashboard / KPIs
    async getInventoryKPIs(): Promise<{
        totalProducts: number;
        activeProducts: number;
        lowStockCount: number;
        outOfStockCount: number;
        totalStockValue: number;
        totalWarehouses: number;
        recentMovements: number;
    }> {
        const response = await api.get(`${this.baseUrl}/kpis`);
        return response.data;
    }

    async getTopSellingProducts(limit?: number): Promise<Product[]> {
        const response = await api.get<Product[]>(`${this.baseUrl}/products/top-selling`, {
            params: { limit: limit || 10 }
        });
        return response.data;
    }
}

export const inventoryService = new InventoryService();
export default inventoryService;
