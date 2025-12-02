import { ApiService } from '../api-service';
import type {
  // DTOs
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
  ProductListDto,
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryTreeDto,
  BrandDto,
  CreateBrandDto,
  UpdateBrandDto,
  BrandListDto,
  UnitDto,
  CreateUnitDto,
  UpdateUnitDto,
  UnitListDto,
  WarehouseDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseListDto,
  LocationDto,
  CreateLocationDto,
  UpdateLocationDto,
  LocationListDto,
  StockDto,
  StockAdjustmentDto,
  StockMoveDto,
  StockSummaryDto,
  WarehouseStockSummaryDto,
  LocationStockDto,
  ExpiringStockDto,
  LowStockAlertDto,
  SupplierDto,
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierListDto,
  SupplierProductDto,
  CreateSupplierProductDto,
  StockMovementDto,
  CreateStockMovementDto,
  StockMovementListDto,
  StockMovementFilterDto,
  StockMovementSummaryDto,
  StockReservationDto,
  CreateStockReservationDto,
  StockReservationListDto,
  StockReservationFilterDto,
  StockTransferDto,
  CreateStockTransferDto,
  UpdateStockTransferDto,
  StockTransferListDto,
  StockTransferFilterDto,
  StockCountDto,
  CreateStockCountDto,
  UpdateStockCountDto,
  StockCountListDto,
  StockCountFilterDto,
  StockCountSummaryDto,
  PriceListDto,
  CreatePriceListDto,
  UpdatePriceListDto,
  PriceListListDto,
  PriceListItemDto,
  CreatePriceListItemDto,
  BulkPriceUpdateDto,
  ProductPriceDto,
  // Enums
  StockMovementType,
  ReservationStatus,
  TransferStatus,
  StockCountStatus,
  SerialNumberStatus,
  LotBatchStatus,
  // Filters
  ProductFilterDto,
  PaginatedResponse,
  // Serial Numbers
  SerialNumberDto,
  SerialNumberListDto,
  CreateSerialNumberDto,
  SerialNumberFilterDto,
  ReceiveSerialNumberRequest,
  ReserveSerialNumberRequest,
  SellSerialNumberRequest,
  ReasonRequest,
  // Lot Batches
  LotBatchDto,
  LotBatchListDto,
  CreateLotBatchDto,
  LotBatchFilterDto,
  QuarantineRequest,
} from './inventory.types';

// =====================================
// INVENTORY API SERVICE
// =====================================

export class InventoryService {
  /**
   * Build Inventory module API path
   * @param resource - Resource path (e.g., 'products', 'warehouses')
   * @returns Inventory API path (without /api prefix as it's in baseURL)
   *
   * Inventory module uses: /api/inventory/{resource}
   * Tenant context is handled by backend middleware via X-Tenant-Code header (not in URL)
   */
  private static getPath(resource: string): string {
    return `/inventory/${resource}`;
  }

  // =====================================
  // PRODUCTS
  // =====================================

  /**
   * Get all products
   */
  static async getProducts(
    includeInactive: boolean = false,
    categoryId?: number,
    brandId?: number
  ): Promise<ProductDto[]> {
    return ApiService.get<ProductDto[]>(this.getPath('products'), {
      params: { includeInactive, categoryId, brandId },
    });
  }

  /**
   * Get product by ID
   */
  static async getProduct(id: number): Promise<ProductDto> {
    return ApiService.get<ProductDto>(this.getPath(`products/${id}`));
  }

  /**
   * Get products with low stock
   */
  static async getLowStockProducts(warehouseId?: number): Promise<LowStockAlertDto[]> {
    return ApiService.get<LowStockAlertDto[]>(this.getPath('products/low-stock'), {
      params: { warehouseId },
    });
  }

  /**
   * Create a new product
   */
  static async createProduct(data: CreateProductDto): Promise<ProductDto> {
    return ApiService.post<ProductDto>(this.getPath('products'), data);
  }

  /**
   * Update a product
   */
  static async updateProduct(id: number, data: UpdateProductDto): Promise<ProductDto> {
    return ApiService.put<ProductDto>(this.getPath(`products/${id}`), data);
  }

  /**
   * Delete a product
   */
  static async deleteProduct(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`products/${id}`));
  }

  /**
   * Activate a product
   */
  static async activateProduct(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`products/${id}/activate`), {});
  }

  /**
   * Deactivate a product
   */
  static async deactivateProduct(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`products/${id}/deactivate`), {});
  }

  // =====================================
  // CATEGORIES
  // =====================================

  /**
   * Get all categories
   */
  static async getCategories(includeInactive: boolean = false): Promise<CategoryDto[]> {
    return ApiService.get<CategoryDto[]>(this.getPath('categories'), {
      params: { includeInactive },
    });
  }

  /**
   * Get category by ID
   */
  static async getCategory(id: number): Promise<CategoryDto> {
    return ApiService.get<CategoryDto>(this.getPath(`categories/${id}`));
  }

  /**
   * Get category tree (hierarchical)
   */
  static async getCategoryTree(): Promise<CategoryTreeDto[]> {
    return ApiService.get<CategoryTreeDto[]>(this.getPath('categories/tree'));
  }

  /**
   * Create a category
   */
  static async createCategory(data: CreateCategoryDto): Promise<CategoryDto> {
    return ApiService.post<CategoryDto>(this.getPath('categories'), data);
  }

  /**
   * Update a category
   */
  static async updateCategory(id: number, data: UpdateCategoryDto): Promise<CategoryDto> {
    return ApiService.put<CategoryDto>(this.getPath(`categories/${id}`), data);
  }

  /**
   * Delete a category
   */
  static async deleteCategory(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`categories/${id}`));
  }

  // =====================================
  // BRANDS
  // =====================================

  /**
   * Get all brands
   */
  static async getBrands(includeInactive: boolean = false): Promise<BrandDto[]> {
    return ApiService.get<BrandDto[]>(this.getPath('brands'), {
      params: { includeInactive },
    });
  }

  /**
   * Get brand by ID
   */
  static async getBrand(id: number): Promise<BrandDto> {
    return ApiService.get<BrandDto>(this.getPath(`brands/${id}`));
  }

  /**
   * Create a brand
   */
  static async createBrand(data: CreateBrandDto): Promise<BrandDto> {
    return ApiService.post<BrandDto>(this.getPath('brands'), data);
  }

  /**
   * Update a brand
   */
  static async updateBrand(id: number, data: UpdateBrandDto): Promise<BrandDto> {
    return ApiService.put<BrandDto>(this.getPath(`brands/${id}`), data);
  }

  /**
   * Delete a brand
   */
  static async deleteBrand(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`brands/${id}`));
  }

  // =====================================
  // UNITS
  // =====================================

  /**
   * Get all units
   */
  static async getUnits(includeInactive: boolean = false): Promise<UnitDto[]> {
    return ApiService.get<UnitDto[]>(this.getPath('units'), {
      params: { includeInactive },
    });
  }

  /**
   * Get unit by ID
   */
  static async getUnit(id: number): Promise<UnitDto> {
    return ApiService.get<UnitDto>(this.getPath(`units/${id}`));
  }

  /**
   * Create a unit
   */
  static async createUnit(data: CreateUnitDto): Promise<UnitDto> {
    return ApiService.post<UnitDto>(this.getPath('units'), data);
  }

  /**
   * Update a unit
   */
  static async updateUnit(id: number, data: UpdateUnitDto): Promise<UnitDto> {
    return ApiService.put<UnitDto>(this.getPath(`units/${id}`), data);
  }

  /**
   * Delete a unit
   */
  static async deleteUnit(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`units/${id}`));
  }

  // =====================================
  // WAREHOUSES
  // =====================================

  /**
   * Get all warehouses
   */
  static async getWarehouses(includeInactive: boolean = false): Promise<WarehouseDto[]> {
    return ApiService.get<WarehouseDto[]>(this.getPath('warehouses'), {
      params: { includeInactive },
    });
  }

  /**
   * Get warehouse by ID
   */
  static async getWarehouse(id: number): Promise<WarehouseDto> {
    return ApiService.get<WarehouseDto>(this.getPath(`warehouses/${id}`));
  }

  /**
   * Create a warehouse
   */
  static async createWarehouse(data: CreateWarehouseDto): Promise<WarehouseDto> {
    return ApiService.post<WarehouseDto>(this.getPath('warehouses'), data);
  }

  /**
   * Update a warehouse
   */
  static async updateWarehouse(id: number, data: UpdateWarehouseDto): Promise<WarehouseDto> {
    return ApiService.put<WarehouseDto>(this.getPath(`warehouses/${id}`), data);
  }

  /**
   * Delete a warehouse
   */
  static async deleteWarehouse(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`warehouses/${id}`));
  }

  /**
   * Set warehouse as default
   */
  static async setDefaultWarehouse(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`warehouses/${id}/set-default`), {});
  }

  /**
   * Get warehouse stock summary
   */
  static async getWarehouseStockSummary(id: number): Promise<WarehouseStockSummaryDto> {
    return ApiService.get<WarehouseStockSummaryDto>(this.getPath(`warehouses/${id}/stock-summary`));
  }

  // =====================================
  // LOCATIONS
  // =====================================

  /**
   * Get all locations (optionally filtered by warehouse)
   */
  static async getLocations(warehouseId?: number): Promise<LocationDto[]> {
    return ApiService.get<LocationDto[]>(this.getPath('locations'), {
      params: { warehouseId },
    });
  }

  /**
   * Get location by ID
   */
  static async getLocation(id: number): Promise<LocationDto> {
    return ApiService.get<LocationDto>(this.getPath(`locations/${id}`));
  }

  /**
   * Create a location
   */
  static async createLocation(data: CreateLocationDto): Promise<LocationDto> {
    return ApiService.post<LocationDto>(this.getPath('locations'), data);
  }

  /**
   * Update a location
   */
  static async updateLocation(id: number, data: UpdateLocationDto): Promise<LocationDto> {
    return ApiService.put<LocationDto>(this.getPath(`locations/${id}`), data);
  }

  /**
   * Delete a location
   */
  static async deleteLocation(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`locations/${id}`));
  }

  // =====================================
  // SUPPLIERS
  // =====================================

  /**
   * Get all suppliers
   */
  static async getSuppliers(includeInactive: boolean = false): Promise<SupplierDto[]> {
    return ApiService.get<SupplierDto[]>(this.getPath('suppliers'), {
      params: { includeInactive },
    });
  }

  /**
   * Get supplier by ID
   */
  static async getSupplier(id: number): Promise<SupplierDto> {
    return ApiService.get<SupplierDto>(this.getPath(`suppliers/${id}`));
  }

  /**
   * Create a supplier
   */
  static async createSupplier(data: CreateSupplierDto): Promise<SupplierDto> {
    return ApiService.post<SupplierDto>(this.getPath('suppliers'), data);
  }

  /**
   * Update a supplier
   */
  static async updateSupplier(id: number, data: UpdateSupplierDto): Promise<SupplierDto> {
    return ApiService.put<SupplierDto>(this.getPath(`suppliers/${id}`), data);
  }

  /**
   * Delete a supplier
   */
  static async deleteSupplier(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`suppliers/${id}`));
  }

  /**
   * Add product to supplier
   */
  static async addSupplierProduct(data: CreateSupplierProductDto): Promise<SupplierProductDto> {
    return ApiService.post<SupplierProductDto>(
      this.getPath(`suppliers/${data.supplierId}/products`),
      data
    );
  }

  /**
   * Remove product from supplier
   */
  static async removeSupplierProduct(supplierId: number, productId: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`suppliers/${supplierId}/products/${productId}`));
  }

  // =====================================
  // STOCK
  // =====================================

  /**
   * Get stock levels
   */
  static async getStock(
    warehouseId?: number,
    productId?: number,
    locationId?: number
  ): Promise<StockDto[]> {
    return ApiService.get<StockDto[]>(this.getPath('stock'), {
      params: { warehouseId, productId, locationId },
    });
  }

  /**
   * Get stock summary for a product
   */
  static async getProductStockSummary(productId: number): Promise<StockSummaryDto> {
    return ApiService.get<StockSummaryDto>(this.getPath(`stock/summary/${productId}`));
  }

  /**
   * Get stock movements
   */
  static async getStockMovements(
    productId?: number,
    warehouseId?: number,
    movementType?: StockMovementType,
    startDate?: string,
    endDate?: string,
    take: number = 100
  ): Promise<StockMovementDto[]> {
    return ApiService.get<StockMovementDto[]>(this.getPath('stock/movements'), {
      params: { productId, warehouseId, movementType, startDate, endDate, take },
    });
  }

  /**
   * Adjust stock quantity
   */
  static async adjustStock(data: StockAdjustmentDto): Promise<StockDto> {
    return ApiService.post<StockDto>(this.getPath('stock/adjust'), data);
  }

  /**
   * Move stock between warehouses/locations
   */
  static async moveStock(data: StockMoveDto): Promise<StockMovementDto> {
    return ApiService.post<StockMovementDto>(this.getPath('stock/move'), data);
  }

  /**
   * Get expiring stock
   */
  static async getExpiringStock(daysUntilExpiry: number = 30): Promise<ExpiringStockDto[]> {
    return ApiService.get<ExpiringStockDto[]>(this.getPath('stock/expiring'), {
      params: { daysUntilExpiry },
    });
  }

  // =====================================
  // STOCK MOVEMENTS (Dedicated Controller)
  // =====================================

  /**
   * Get stock movements with filters
   */
  static async getStockMovementsFiltered(filters: StockMovementFilterDto): Promise<StockMovementListDto[]> {
    return ApiService.get<StockMovementListDto[]>(this.getPath('stock-movements'), {
      params: filters,
    });
  }

  /**
   * Get stock movement by ID
   */
  static async getStockMovement(id: number): Promise<StockMovementDto> {
    return ApiService.get<StockMovementDto>(this.getPath(`stock-movements/${id}`));
  }

  /**
   * Create a stock movement
   */
  static async createStockMovement(data: CreateStockMovementDto): Promise<StockMovementDto> {
    return ApiService.post<StockMovementDto>(this.getPath('stock-movements'), data);
  }

  /**
   * Reverse a stock movement
   */
  static async reverseStockMovement(id: number, reason?: string): Promise<StockMovementDto> {
    return ApiService.post<StockMovementDto>(this.getPath(`stock-movements/${id}/reverse`), { reason });
  }

  /**
   * Get stock movement summary
   */
  static async getStockMovementSummary(
    startDate: string,
    endDate: string,
    warehouseId?: number
  ): Promise<StockMovementSummaryDto> {
    return ApiService.get<StockMovementSummaryDto>(this.getPath('stock-movements/summary'), {
      params: { startDate, endDate, warehouseId },
    });
  }

  // =====================================
  // STOCK RESERVATIONS
  // =====================================

  /**
   * Get stock reservations with filters
   */
  static async getStockReservations(
    productId?: number,
    warehouseId?: number,
    status?: ReservationStatus,
    expiredOnly: boolean = false
  ): Promise<StockReservationListDto[]> {
    return ApiService.get<StockReservationListDto[]>(this.getPath('stock-reservations'), {
      params: { productId, warehouseId, status, expiredOnly },
    });
  }

  /**
   * Get stock reservation by ID
   */
  static async getStockReservation(id: number): Promise<StockReservationDto> {
    return ApiService.get<StockReservationDto>(this.getPath(`stock-reservations/${id}`));
  }

  /**
   * Create a stock reservation
   */
  static async createStockReservation(data: CreateStockReservationDto): Promise<StockReservationDto> {
    return ApiService.post<StockReservationDto>(this.getPath('stock-reservations'), data);
  }

  /**
   * Fulfill a stock reservation
   */
  static async fulfillStockReservation(id: number, quantity?: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`stock-reservations/${id}/fulfill`), { quantity });
  }

  /**
   * Cancel a stock reservation
   */
  static async cancelStockReservation(id: number, reason?: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`stock-reservations/${id}/cancel`), { reason });
  }

  /**
   * Extend reservation expiration
   */
  static async extendStockReservation(id: number, newExpirationDate: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`stock-reservations/${id}/extend`), { newExpirationDate });
  }

  // =====================================
  // STOCK TRANSFERS
  // =====================================

  /**
   * Get stock transfers with filters
   */
  static async getStockTransfers(
    sourceWarehouseId?: number,
    destinationWarehouseId?: number,
    status?: TransferStatus,
    fromDate?: string,
    toDate?: string
  ): Promise<StockTransferListDto[]> {
    return ApiService.get<StockTransferListDto[]>(this.getPath('stock-transfers'), {
      params: { sourceWarehouseId, destinationWarehouseId, status, fromDate, toDate },
    });
  }

  /**
   * Get stock transfer by ID
   */
  static async getStockTransfer(id: number): Promise<StockTransferDto> {
    return ApiService.get<StockTransferDto>(this.getPath(`stock-transfers/${id}`));
  }

  /**
   * Create a stock transfer
   */
  static async createStockTransfer(data: CreateStockTransferDto): Promise<StockTransferDto> {
    return ApiService.post<StockTransferDto>(this.getPath('stock-transfers'), data);
  }

  /**
   * Update a stock transfer
   */
  static async updateStockTransfer(id: number, data: UpdateStockTransferDto): Promise<StockTransferDto> {
    return ApiService.put<StockTransferDto>(this.getPath(`stock-transfers/${id}`), data);
  }

  /**
   * Submit stock transfer for approval
   */
  static async submitStockTransfer(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`stock-transfers/${id}/submit`), {});
  }

  /**
   * Approve a stock transfer
   */
  static async approveStockTransfer(id: number, approvedByUserId: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`stock-transfers/${id}/approve`), { approvedByUserId });
  }

  /**
   * Reject a stock transfer
   */
  static async rejectStockTransfer(id: number, reason?: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`stock-transfers/${id}/reject`), { reason });
  }

  /**
   * Ship a stock transfer
   */
  static async shipStockTransfer(id: number, shippedByUserId: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`stock-transfers/${id}/ship`), { shippedByUserId });
  }

  /**
   * Receive a stock transfer
   */
  static async receiveStockTransfer(id: number, receivedByUserId: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`stock-transfers/${id}/receive`), { receivedByUserId });
  }

  /**
   * Cancel a stock transfer
   */
  static async cancelStockTransfer(id: number, reason?: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`stock-transfers/${id}/cancel`), { reason });
  }

  // =====================================
  // STOCK COUNTS
  // =====================================

  /**
   * Get stock counts with filters
   */
  static async getStockCounts(
    warehouseId?: number,
    status?: StockCountStatus,
    fromDate?: string,
    toDate?: string
  ): Promise<StockCountListDto[]> {
    return ApiService.get<StockCountListDto[]>(this.getPath('stock-counts'), {
      params: { warehouseId, status, fromDate, toDate },
    });
  }

  /**
   * Get stock count by ID
   */
  static async getStockCount(id: number): Promise<StockCountDto> {
    return ApiService.get<StockCountDto>(this.getPath(`stock-counts/${id}`));
  }

  /**
   * Create a stock count
   */
  static async createStockCount(data: CreateStockCountDto): Promise<StockCountDto> {
    return ApiService.post<StockCountDto>(this.getPath('stock-counts'), data);
  }

  /**
   * Update a stock count
   */
  static async updateStockCount(id: number, data: UpdateStockCountDto): Promise<StockCountDto> {
    return ApiService.put<StockCountDto>(this.getPath(`stock-counts/${id}`), data);
  }

  /**
   * Start a stock count
   */
  static async startStockCount(id: number, countedByUserId: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`stock-counts/${id}/start`), { countedByUserId });
  }

  /**
   * Count an item in a stock count
   */
  static async countStockCountItem(
    stockCountId: number,
    itemId: number,
    countedQuantity: number,
    notes?: string
  ): Promise<void> {
    return ApiService.post<void>(
      this.getPath(`stock-counts/${stockCountId}/items/${itemId}/count`),
      { countedQuantity, notes }
    );
  }

  /**
   * Complete a stock count
   */
  static async completeStockCount(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`stock-counts/${id}/complete`), {});
  }

  /**
   * Approve a stock count
   */
  static async approveStockCount(id: number, approvedByUserId: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`stock-counts/${id}/approve`), { approvedByUserId });
  }

  /**
   * Cancel a stock count
   */
  static async cancelStockCount(id: number, reason?: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`stock-counts/${id}/cancel`), { reason });
  }

  /**
   * Get stock count summary
   */
  static async getStockCountSummary(id: number): Promise<StockCountSummaryDto> {
    return ApiService.get<StockCountSummaryDto>(this.getPath(`stock-counts/${id}/summary`));
  }

  // =====================================
  // PRICE LISTS
  // =====================================

  /**
   * Get all price lists
   */
  static async getPriceLists(activeOnly: boolean = true): Promise<PriceListListDto[]> {
    return ApiService.get<PriceListListDto[]>(this.getPath('price-lists'), {
      params: { activeOnly },
    });
  }

  /**
   * Get price list by ID
   */
  static async getPriceList(id: number): Promise<PriceListDto> {
    return ApiService.get<PriceListDto>(this.getPath(`price-lists/${id}`));
  }

  /**
   * Create a price list
   */
  static async createPriceList(data: CreatePriceListDto): Promise<PriceListDto> {
    return ApiService.post<PriceListDto>(this.getPath('price-lists'), data);
  }

  /**
   * Update a price list
   */
  static async updatePriceList(id: number, data: UpdatePriceListDto): Promise<PriceListDto> {
    return ApiService.put<PriceListDto>(this.getPath(`price-lists/${id}`), data);
  }

  /**
   * Delete a price list
   */
  static async deletePriceList(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`price-lists/${id}`));
  }

  /**
   * Activate a price list
   */
  static async activatePriceList(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`price-lists/${id}/activate`), {});
  }

  /**
   * Deactivate a price list
   */
  static async deactivatePriceList(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`price-lists/${id}/deactivate`), {});
  }

  /**
   * Set price list as default
   */
  static async setDefaultPriceList(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`price-lists/${id}/set-default`), {});
  }

  /**
   * Add item to price list
   */
  static async addPriceListItem(priceListId: number, data: CreatePriceListItemDto): Promise<PriceListItemDto> {
    return ApiService.post<PriceListItemDto>(this.getPath(`price-lists/${priceListId}/items`), data);
  }

  /**
   * Update price list item
   */
  static async updatePriceListItem(
    priceListId: number,
    itemId: number,
    data: CreatePriceListItemDto
  ): Promise<PriceListItemDto> {
    return ApiService.put<PriceListItemDto>(this.getPath(`price-lists/${priceListId}/items/${itemId}`), data);
  }

  /**
   * Remove item from price list
   */
  static async removePriceListItem(priceListId: number, itemId: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`price-lists/${priceListId}/items/${itemId}`));
  }

  /**
   * Bulk update price list items
   */
  static async bulkUpdatePriceListItems(data: BulkPriceUpdateDto): Promise<void> {
    return ApiService.post<void>(this.getPath(`price-lists/${data.priceListId}/bulk-update`), data);
  }

  /**
   * Get product price
   */
  static async getProductPrice(
    productId: number,
    priceListId?: number,
    quantity?: number
  ): Promise<ProductPriceDto> {
    return ApiService.get<ProductPriceDto>(this.getPath(`price-lists/product-price/${productId}`), {
      params: { priceListId, quantity },
    });
  }

  // =====================================
  // SERIAL NUMBERS
  // =====================================

  /**
   * Get all serial numbers with optional filters
   */
  static async getSerialNumbers(filter?: SerialNumberFilterDto): Promise<SerialNumberListDto[]> {
    return ApiService.get<SerialNumberListDto[]>(this.getPath('serial-numbers'), {
      params: filter,
    });
  }

  /**
   * Get serial number by ID
   */
  static async getSerialNumber(id: number): Promise<SerialNumberDto> {
    return ApiService.get<SerialNumberDto>(this.getPath(`serial-numbers/${id}`));
  }

  /**
   * Create a new serial number
   */
  static async createSerialNumber(data: CreateSerialNumberDto): Promise<SerialNumberDto> {
    return ApiService.post<SerialNumberDto>(this.getPath('serial-numbers'), data);
  }

  /**
   * Receive a serial number into inventory
   */
  static async receiveSerialNumber(id: number, request?: ReceiveSerialNumberRequest): Promise<void> {
    return ApiService.post<void>(this.getPath(`serial-numbers/${id}/receive`), request || {});
  }

  /**
   * Reserve a serial number for a sales order
   */
  static async reserveSerialNumber(id: number, request: ReserveSerialNumberRequest): Promise<void> {
    return ApiService.post<void>(this.getPath(`serial-numbers/${id}/reserve`), request);
  }

  /**
   * Release a reserved serial number
   */
  static async releaseSerialNumber(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`serial-numbers/${id}/release`), {});
  }

  /**
   * Sell a serial number to a customer
   */
  static async sellSerialNumber(id: number, request: SellSerialNumberRequest): Promise<void> {
    return ApiService.post<void>(this.getPath(`serial-numbers/${id}/sell`), request);
  }

  /**
   * Mark a serial number as defective
   */
  static async markSerialNumberDefective(id: number, request?: ReasonRequest): Promise<void> {
    return ApiService.post<void>(this.getPath(`serial-numbers/${id}/defective`), request || {});
  }

  /**
   * Scrap a serial number
   */
  static async scrapSerialNumber(id: number, request?: ReasonRequest): Promise<void> {
    return ApiService.post<void>(this.getPath(`serial-numbers/${id}/scrap`), request || {});
  }

  // =====================================
  // LOT BATCHES
  // =====================================

  /**
   * Get all lot batches with optional filters
   */
  static async getLotBatches(filter?: LotBatchFilterDto): Promise<LotBatchListDto[]> {
    return ApiService.get<LotBatchListDto[]>(this.getPath('lot-batches'), {
      params: filter,
    });
  }

  /**
   * Get lot batch by ID
   */
  static async getLotBatch(id: number): Promise<LotBatchDto> {
    return ApiService.get<LotBatchDto>(this.getPath(`lot-batches/${id}`));
  }

  /**
   * Create a new lot batch
   */
  static async createLotBatch(data: CreateLotBatchDto): Promise<LotBatchDto> {
    return ApiService.post<LotBatchDto>(this.getPath('lot-batches'), data);
  }

  /**
   * Approve a lot batch
   */
  static async approveLotBatch(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`lot-batches/${id}/approve`), {});
  }

  /**
   * Quarantine a lot batch
   */
  static async quarantineLotBatch(id: number, request: QuarantineRequest): Promise<void> {
    return ApiService.post<void>(this.getPath(`lot-batches/${id}/quarantine`), request);
  }
}

export default InventoryService;
