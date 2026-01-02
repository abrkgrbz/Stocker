// Inventory Module Types

export interface Product {
    id: string;
    sku: string;
    barcode?: string;
    name: string;
    description?: string;
    categoryId?: string;
    categoryName?: string;
    brandId?: string;
    brandName?: string;
    unitId?: string;
    unitName?: string;
    price: number;
    cost?: number;
    currency: string;
    stockQuantity: number;
    minStockLevel?: number;
    maxStockLevel?: number;
    status: ProductStatus;
    imageUrl?: string;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    createdAt: string;
    updatedAt: string;
}

export type ProductStatus = 'active' | 'inactive' | 'discontinued' | 'out_of_stock';

export interface ProductListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    status?: ProductStatus;
    lowStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ProductListResponse {
    items: Product[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Stock
export interface StockLevel {
    productId: string;
    warehouseId: string;
    warehouseName: string;
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    minLevel?: number;
    maxLevel?: number;
    lastUpdated: string;
}

export interface StockMovement {
    id: string;
    productId: string;
    productName?: string;
    warehouseId?: string;
    warehouseName?: string;
    type: StockMovementType;
    quantity: number;
    fromWarehouse?: string;
    toWarehouse?: string;
    reason?: string;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    createdBy: string;
    createdByName?: string;
    createdAt: string;
}

export type StockMovementType = 'in' | 'out' | 'adjustment' | 'transfer' | 'count';

// Stock Count
export interface StockCount {
    id: string;
    warehouseId: string;
    warehouseName: string;
    status: StockCountStatus;
    startedAt: string;
    completedAt?: string;
    createdBy: string;
    createdByName: string;
    items: StockCountItem[];
}

export type StockCountStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';

export interface StockCountItem {
    productId: string;
    productName: string;
    sku: string;
    barcode?: string;
    expectedQuantity: number;
    countedQuantity?: number;
    variance?: number;
}

// Warehouse
export interface Warehouse {
    id: string;
    code: string;
    name: string;
    address?: string;
    city?: string;
    isDefault: boolean;
    isActive: boolean;
}

// Category
export interface Category {
    id: string;
    name: string;
    parentId?: string;
    productCount: number;
}

// Barcode Scan Result
export interface BarcodeScanResult {
    barcode: string;
    product?: Product;
    found: boolean;
}

// Create/Update Requests
export interface CreateProductRequest {
    sku: string;
    barcode?: string;
    name: string;
    description?: string;
    categoryId?: string;
    brandId?: string;
    unitId?: string;
    price: number;
    cost?: number;
    currency?: string;
    minStockLevel?: number;
    maxStockLevel?: number;
    imageUrl?: string;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
    status?: ProductStatus;
}

export interface StockMovementRequest {
    productId: string;
    warehouseId: string;
    type: StockMovementType;
    quantity: number;
    reason?: string;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
}

export interface StockCountRequest {
    warehouseId: string;
    categoryId?: string;
    productIds?: string[];
    notes?: string;
}

export interface StockCountItemUpdate {
    countedQuantity: number;
    notes?: string;
}

// Stock Transfer
export interface StockTransfer {
    id: string;
    transferNumber: string;
    fromWarehouseId: string;
    fromWarehouseName: string;
    toWarehouseId: string;
    toWarehouseName: string;
    status: StockTransferStatus;
    requestedAt: string;
    approvedAt?: string;
    shippedAt?: string;
    receivedAt?: string;
    requestedBy: string;
    requestedByName: string;
    approvedBy?: string;
    approvedByName?: string;
    notes?: string;
    items: StockTransferItem[];
}

export type StockTransferStatus = 'draft' | 'pending' | 'approved' | 'shipped' | 'received' | 'cancelled';

export interface StockTransferItem {
    productId: string;
    productName: string;
    sku: string;
    requestedQuantity: number;
    shippedQuantity?: number;
    receivedQuantity?: number;
}

export interface StockTransferRequest {
    fromWarehouseId: string;
    toWarehouseId: string;
    notes?: string;
    items: {
        productId: string;
        quantity: number;
    }[];
}

// Category with children
export interface CategoryTree extends Category {
    children?: CategoryTree[];
}

// Brand
export interface Brand {
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
    isActive: boolean;
}

// Unit
export interface Unit {
    id: string;
    name: string;
    abbreviation: string;
    isBaseUnit: boolean;
}
