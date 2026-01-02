import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventory.service';
import type {
    ProductListParams,
    CreateProductRequest,
    UpdateProductRequest,
    StockMovementRequest,
    StockCountRequest,
    StockCountItemUpdate,
    StockTransferRequest,
    StockCountStatus,
    StockTransferStatus,
} from '../types/inventory.types';

// Query Keys
export const inventoryKeys = {
    all: ['inventory'] as const,
    // Products
    products: () => [...inventoryKeys.all, 'products'] as const,
    productList: (params?: ProductListParams) => [...inventoryKeys.products(), 'list', params] as const,
    productDetail: (id: string) => [...inventoryKeys.products(), 'detail', id] as const,
    productStock: (id: string) => [...inventoryKeys.products(), 'stock', id] as const,
    productBarcode: (barcode: string) => [...inventoryKeys.products(), 'barcode', barcode] as const,
    lowStockProducts: () => [...inventoryKeys.products(), 'low-stock'] as const,
    topSellingProducts: () => [...inventoryKeys.products(), 'top-selling'] as const,
    // Movements
    movements: () => [...inventoryKeys.all, 'movements'] as const,
    movementList: (params?: any) => [...inventoryKeys.movements(), 'list', params] as const,
    // Transfers
    transfers: () => [...inventoryKeys.all, 'transfers'] as const,
    transferList: (params?: any) => [...inventoryKeys.transfers(), 'list', params] as const,
    transferDetail: (id: string) => [...inventoryKeys.transfers(), 'detail', id] as const,
    // Stock Counts
    counts: () => [...inventoryKeys.all, 'counts'] as const,
    countList: (params?: any) => [...inventoryKeys.counts(), 'list', params] as const,
    countDetail: (id: string) => [...inventoryKeys.counts(), 'detail', id] as const,
    // Warehouses
    warehouses: () => [...inventoryKeys.all, 'warehouses'] as const,
    warehouseDetail: (id: string) => [...inventoryKeys.warehouses(), 'detail', id] as const,
    warehouseStock: (id: string, params?: ProductListParams) => [...inventoryKeys.warehouses(), 'stock', id, params] as const,
    // Categories
    categories: () => [...inventoryKeys.all, 'categories'] as const,
    categoryTree: () => [...inventoryKeys.categories(), 'tree'] as const,
    // KPIs
    kpis: () => [...inventoryKeys.all, 'kpis'] as const,
};

// ============= PRODUCT HOOKS =============

export function useProducts(params?: ProductListParams) {
    return useQuery({
        queryKey: inventoryKeys.productList(params),
        queryFn: () => inventoryService.getProducts(params),
    });
}

export function useInfiniteProducts(params?: Omit<ProductListParams, 'page'>) {
    return useInfiniteQuery({
        queryKey: [...inventoryKeys.products(), 'infinite', params],
        queryFn: ({ pageParam = 1 }) => inventoryService.getProducts({ ...params, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
    });
}

export function useProduct(id: string) {
    return useQuery({
        queryKey: inventoryKeys.productDetail(id),
        queryFn: () => inventoryService.getProduct(id),
        enabled: !!id,
    });
}

export function useProductStock(productId: string) {
    return useQuery({
        queryKey: inventoryKeys.productStock(productId),
        queryFn: () => inventoryService.getStockLevels(productId),
        enabled: !!productId,
    });
}

export function useProductByBarcode(barcode: string) {
    return useQuery({
        queryKey: inventoryKeys.productBarcode(barcode),
        queryFn: () => inventoryService.getProductByBarcode(barcode),
        enabled: !!barcode && barcode.length > 0,
    });
}

export function useLowStockProducts() {
    return useQuery({
        queryKey: inventoryKeys.lowStockProducts(),
        queryFn: () => inventoryService.getLowStockProducts(),
    });
}

export function useTopSellingProducts(limit?: number) {
    return useQuery({
        queryKey: [...inventoryKeys.topSellingProducts(), limit],
        queryFn: () => inventoryService.getTopSellingProducts(limit),
    });
}

export function useSearchProducts(query: string) {
    return useQuery({
        queryKey: [...inventoryKeys.products(), 'search', query],
        queryFn: () => inventoryService.searchProducts(query),
        enabled: query.length >= 2,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductRequest) => inventoryService.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.kpis() });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
            inventoryService.updateProduct(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.productDetail(id) });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => inventoryService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.kpis() });
        },
    });
}

// ============= STOCK MOVEMENT HOOKS =============

export function useStockMovements(params?: {
    productId?: string;
    warehouseId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}) {
    return useQuery({
        queryKey: inventoryKeys.movementList(params),
        queryFn: () => inventoryService.getStockMovements(params),
    });
}

export function useCreateStockMovement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: StockMovementRequest) => inventoryService.createStockMovement(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.productStock(variables.productId) });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.productDetail(variables.productId) });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.kpis() });
        },
    });
}

export function useAdjustStock() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, warehouseId, quantity, reason }: {
            productId: string;
            warehouseId: string;
            quantity: number;
            reason: string;
        }) => inventoryService.adjustStock(productId, warehouseId, quantity, reason),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.productStock(variables.productId) });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.productDetail(variables.productId) });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.kpis() });
        },
    });
}

// ============= STOCK TRANSFER HOOKS =============

export function useStockTransfers(params?: {
    status?: StockTransferStatus;
    fromWarehouseId?: string;
    toWarehouseId?: string;
    page?: number;
    pageSize?: number;
}) {
    return useQuery({
        queryKey: inventoryKeys.transferList(params),
        queryFn: () => inventoryService.getStockTransfers(params),
    });
}

export function useStockTransfer(id: string) {
    return useQuery({
        queryKey: inventoryKeys.transferDetail(id),
        queryFn: () => inventoryService.getStockTransfer(id),
        enabled: !!id,
    });
}

export function useCreateStockTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: StockTransferRequest) => inventoryService.createStockTransfer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers() });
        },
    });
}

export function useApproveStockTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => inventoryService.approveStockTransfer(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.transferDetail(id) });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers() });
        },
    });
}

export function useShipStockTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => inventoryService.shipStockTransfer(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.transferDetail(id) });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
        },
    });
}

export function useReceiveStockTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => inventoryService.receiveStockTransfer(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.transferDetail(id) });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.kpis() });
        },
    });
}

export function useCancelStockTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            inventoryService.cancelStockTransfer(id, reason),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.transferDetail(id) });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers() });
        },
    });
}

// ============= STOCK COUNT HOOKS =============

export function useStockCounts(params?: {
    warehouseId?: string;
    status?: StockCountStatus;
    page?: number;
    pageSize?: number;
}) {
    return useQuery({
        queryKey: inventoryKeys.countList(params),
        queryFn: () => inventoryService.getStockCounts(params),
    });
}

export function useStockCount(id: string) {
    return useQuery({
        queryKey: inventoryKeys.countDetail(id),
        queryFn: () => inventoryService.getStockCount(id),
        enabled: !!id,
    });
}

export function useCreateStockCount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: StockCountRequest) => inventoryService.createStockCount(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.counts() });
        },
    });
}

export function useUpdateStockCountItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ countId, productId, data }: {
            countId: string;
            productId: string;
            data: StockCountItemUpdate;
        }) => inventoryService.updateStockCountItem(countId, productId, data),
        onSuccess: (_, { countId }) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.countDetail(countId) });
        },
    });
}

export function useCompleteStockCount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, applyVariance = true }: { id: string; applyVariance?: boolean }) =>
            inventoryService.completeStockCount(id, applyVariance),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.countDetail(id) });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.counts() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.kpis() });
        },
    });
}

export function useCancelStockCount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => inventoryService.cancelStockCount(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.countDetail(id) });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.counts() });
        },
    });
}

// ============= WAREHOUSE HOOKS =============

export function useWarehouses() {
    return useQuery({
        queryKey: inventoryKeys.warehouses(),
        queryFn: () => inventoryService.getWarehouses(),
    });
}

export function useWarehouse(id: string) {
    return useQuery({
        queryKey: inventoryKeys.warehouseDetail(id),
        queryFn: () => inventoryService.getWarehouse(id),
        enabled: !!id,
    });
}

export function useWarehouseStock(warehouseId: string, params?: ProductListParams) {
    return useQuery({
        queryKey: inventoryKeys.warehouseStock(warehouseId, params),
        queryFn: () => inventoryService.getWarehouseStock(warehouseId, params),
        enabled: !!warehouseId,
    });
}

// ============= CATEGORY HOOKS =============

export function useCategories() {
    return useQuery({
        queryKey: inventoryKeys.categories(),
        queryFn: () => inventoryService.getCategories(),
    });
}

export function useCategoryTree() {
    return useQuery({
        queryKey: inventoryKeys.categoryTree(),
        queryFn: () => inventoryService.getCategoryTree(),
    });
}

// ============= KPI HOOKS =============

export function useInventoryKPIs() {
    return useQuery({
        queryKey: inventoryKeys.kpis(),
        queryFn: () => inventoryService.getInventoryKPIs(),
    });
}
