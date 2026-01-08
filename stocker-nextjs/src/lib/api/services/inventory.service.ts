import { ApiService } from '../api-service';
import type {
  // DTOs
  ProductDto,
  ProductImageDto,
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
  UpdateSupplierProductDto,
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
  // Excel Types
  ExcelImportResultDto,
  ExcelValidationResultDto,
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
  // Product Attributes
  ProductAttributeDetailDto,
  ProductAttributeOptionDto,
  CreateProductAttributeDto,
  UpdateProductAttributeDto,
  CreateProductAttributeOptionDto,
  UpdateProductAttributeOptionDto,
  // Product Variants
  ProductVariantDto,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  // Product Bundles
  ProductBundleDto,
  ProductBundleItemDto,
  CreateProductBundleDto,
  UpdateProductBundleDto,
  CreateProductBundleItemDto,
  UpdateProductBundleItemDto,
  // Analytics
  InventoryDashboardDto,
  StockValuationDto,
  InventoryKPIsReportDto,
  // Barcode
  GenerateBarcodeRequest,
  GenerateBarcodeResponse,
  GenerateProductLabelRequest,
  GenerateProductLabelResponse,
  BulkLabelGenerationRequest,
  BulkLabelGenerationResponse,
  BarcodeLookupRequest,
  BarcodeLookupResponse,
  AutoGenerateBarcodeRequest,
  AutoGenerateBarcodeResponse,
  BarcodeValidationResult,
  BarcodeUniquenessResult,
  BarcodeFormatInfo,
  LabelSizeInfo,
  // Audit Trail
  InventoryAuditFilterDto,
  InventoryAuditLogDto,
  InventoryAuditDashboardDto,
  EntityHistoryDto,
  PaginatedAuditLogsDto,
  // Stock Forecasting & Auto-Reorder
  ForecastingMethod,
  ReorderRuleStatus,
  ReorderSuggestionStatus,
  StockForecastFilterDto,
  ProductForecastDto,
  ForecastSummaryDto,
  DemandAnalysisDto,
  SeasonalPatternDto,
  SafetyStockCalculationDto,
  StockOptimizationDto,
  AbcClassificationDto,
  ReorderRuleDto,
  CreateReorderRuleDto,
  ReorderSuggestionDto,
  ReorderSuggestionFilterDto,
  PaginatedReorderSuggestionsDto,
  ProcessReorderSuggestionDto,
  // Inventory Costing (FIFO/LIFO/WAC)
  CostingMethod,
  CostLayerDto,
  CostLayerFilterDto,
  PaginatedCostLayersDto,
  ProductCostingSummaryDto,
  CostCalculationRequestDto,
  CostCalculationResultDto,
  CreateCostLayerDto,
  CostMethodComparisonDto,
  InventoryValuationReportDto,
  InventoryValuationFilterDto,
  TotalInventoryValueResponse,
  COGSReportDto,
  COGSReportFilterDto,
  SetStandardCostDto,
  CostVarianceAnalysisDto,
  CostAdjustmentDto,
  CostingMethodsResponse,
  // Inventory Analysis (ABC/XYZ)
  AbcXyzAnalysisFilterDto,
  AbcXyzAnalysisSummaryDto,
  ProductAbcXyzDto,
  InventoryTurnoverFilterDto,
  InventoryTurnoverDto,
  DeadStockFilterDto,
  DeadStockAnalysisDto,
  ServiceLevelFilterDto,
  ServiceLevelAnalysisDto,
  InventoryHealthScoreFilterDto,
  InventoryHealthScoreDto,
  // Packaging Types
  PackagingTypeDto,
  CreatePackagingTypeDto,
  UpdatePackagingTypeDto,
  // Barcode Definitions
  BarcodeDefinitionDto,
  CreateBarcodeDefinitionDto,
  UpdateBarcodeDefinitionDto,
  // Warehouse Zones
  WarehouseZoneDto,
  CreateWarehouseZoneDto,
  UpdateWarehouseZoneDto,
  // Quality Control
  QualityControlDto,
  CreateQualityControlDto,
  UpdateQualityControlDto,
  QualityControlStatus,
  // Cycle Counts
  CycleCountDto,
  CreateCycleCountDto,
  UpdateCycleCountDto,
  CycleCountStatus,
} from './inventory.types';

// Import enums as values (not types) for use as default parameters
import {
  BarcodeFormat,
  LabelSize,
  ForecastingMethod as ForecastingMethodEnum,
  CostingMethod as CostingMethodEnum,
} from './inventory.types';

// Re-export for convenience
export { ForecastingMethodEnum as ForecastingMethod };
export { CostingMethodEnum as CostingMethod };

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

  /**
   * Build Purchase module API path
   * @param resource - Resource path (e.g., 'suppliers')
   * @returns Purchase API path (without /api prefix as it's in baseURL)
   *
   * Purchase module uses: /api/purchase/{resource}
   * Note: Suppliers are part of the Purchase module, not Inventory
   */
  private static getPurchasePath(resource: string): string {
    return `/purchase/${resource}`;
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
  // PRODUCT IMAGES
  // =====================================

  /**
   * Get all images for a product
   */
  static async getProductImages(productId: number, includeInactive: boolean = false): Promise<ProductImageDto[]> {
    return ApiService.get<ProductImageDto[]>(this.getPath(`products/${productId}/images`), {
      params: { includeInactive },
    });
  }

  /**
   * Upload a product image
   */
  static async uploadProductImage(
    productId: number,
    file: File,
    options?: {
      altText?: string;
      title?: string;
      imageType?: number;
      setAsPrimary?: boolean;
    }
  ): Promise<ProductImageDto> {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.altText) formData.append('altText', options.altText);
    if (options?.title) formData.append('title', options.title);
    if (options?.imageType !== undefined) formData.append('imageType', String(options.imageType));
    if (options?.setAsPrimary) formData.append('setAsPrimary', 'true');

    // Don't set Content-Type header manually - axios will set it with correct boundary for FormData
    return ApiService.post<ProductImageDto>(
      this.getPath(`products/${productId}/images`),
      formData
    );
  }

  /**
   * Delete a product image
   */
  static async deleteProductImage(productId: number, imageId: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`products/${productId}/images/${imageId}`));
  }

  /**
   * Set an image as the primary image for a product
   */
  static async setProductImageAsPrimary(productId: number, imageId: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`products/${productId}/images/${imageId}/set-primary`), {});
  }

  /**
   * Reorder product images
   */
  static async reorderProductImages(productId: number, imageIds: number[]): Promise<void> {
    return ApiService.post<void>(this.getPath(`products/${productId}/images/reorder`), imageIds);
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
   * Add product to supplier (Purchase module)
   */
  static async addSupplierProduct(data: CreateSupplierProductDto): Promise<SupplierProductDto> {
    return ApiService.post<SupplierProductDto>(
      this.getPath(`suppliers/${data.supplierId}/products`),
      data
    );
  }

  /**
   * Update supplier product (Purchase module)
   */
  static async updateSupplierProduct(
    supplierId: string,
    productId: string,
    data: UpdateSupplierProductDto
  ): Promise<SupplierDto> {
    return ApiService.put<SupplierDto>(
      this.getPath(`suppliers/${supplierId}/products/${productId}`),
      data
    );
  }

  /**
   * Remove product from supplier (Purchase module)
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

  // =====================================
  // PRODUCT ATTRIBUTES
  // =====================================

  /**
   * Get all product attributes
   */
  static async getProductAttributes(
    includeInactive: boolean = false,
    filterableOnly: boolean = false
  ): Promise<ProductAttributeDetailDto[]> {
    return ApiService.get<ProductAttributeDetailDto[]>(this.getPath('product-attributes'), {
      params: { includeInactive, filterableOnly },
    });
  }

  /**
   * Get product attribute by ID
   */
  static async getProductAttribute(id: number): Promise<ProductAttributeDetailDto> {
    return ApiService.get<ProductAttributeDetailDto>(this.getPath(`product-attributes/${id}`));
  }

  /**
   * Create a product attribute
   */
  static async createProductAttribute(data: CreateProductAttributeDto): Promise<ProductAttributeDetailDto> {
    return ApiService.post<ProductAttributeDetailDto>(this.getPath('product-attributes'), data);
  }

  /**
   * Update a product attribute
   */
  static async updateProductAttribute(id: number, data: UpdateProductAttributeDto): Promise<ProductAttributeDetailDto> {
    return ApiService.put<ProductAttributeDetailDto>(this.getPath(`product-attributes/${id}`), data);
  }

  /**
   * Delete a product attribute
   */
  static async deleteProductAttribute(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`product-attributes/${id}`));
  }

  /**
   * Add option to product attribute
   */
  static async addProductAttributeOption(
    attributeId: number,
    data: CreateProductAttributeOptionDto
  ): Promise<ProductAttributeOptionDto> {
    return ApiService.post<ProductAttributeOptionDto>(
      this.getPath(`product-attributes/${attributeId}/options`),
      data
    );
  }

  /**
   * Update product attribute option
   */
  static async updateProductAttributeOption(
    attributeId: number,
    optionId: number,
    data: UpdateProductAttributeOptionDto
  ): Promise<ProductAttributeOptionDto> {
    return ApiService.put<ProductAttributeOptionDto>(
      this.getPath(`product-attributes/${attributeId}/options/${optionId}`),
      data
    );
  }

  /**
   * Delete product attribute option
   */
  static async deleteProductAttributeOption(attributeId: number, optionId: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`product-attributes/${attributeId}/options/${optionId}`));
  }

  // =====================================
  // PRODUCT VARIANTS
  // =====================================

  /**
   * Get all product variants, optionally filtered by product
   */
  static async getProductVariants(
    productId?: number,
    includeInactive: boolean = false
  ): Promise<ProductVariantDto[]> {
    const params: Record<string, unknown> = { includeInactive };
    if (productId && productId > 0) {
      params.productId = productId;
    }
    return ApiService.get<ProductVariantDto[]>(this.getPath('product-variants'), {
      params,
    });
  }

  /**
   * Get product variant by ID
   */
  static async getProductVariant(id: number): Promise<ProductVariantDto> {
    return ApiService.get<ProductVariantDto>(this.getPath(`product-variants/${id}`));
  }

  /**
   * Create a product variant
   */
  static async createProductVariant(data: CreateProductVariantDto): Promise<ProductVariantDto> {
    return ApiService.post<ProductVariantDto>(this.getPath('product-variants'), data);
  }

  /**
   * Update a product variant
   */
  static async updateProductVariant(id: number, data: UpdateProductVariantDto): Promise<ProductVariantDto> {
    return ApiService.put<ProductVariantDto>(this.getPath(`product-variants/${id}`), data);
  }

  /**
   * Delete a product variant
   */
  static async deleteProductVariant(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`product-variants/${id}`));
  }

  // =====================================
  // PRODUCT BUNDLES
  // =====================================

  /**
   * Get all product bundles
   */
  static async getProductBundles(
    includeInactive: boolean = false,
    validOnly: boolean = false
  ): Promise<ProductBundleDto[]> {
    return ApiService.get<ProductBundleDto[]>(this.getPath('product-bundles'), {
      params: { includeInactive, validOnly },
    });
  }

  /**
   * Get product bundle by ID
   */
  static async getProductBundle(id: number): Promise<ProductBundleDto> {
    return ApiService.get<ProductBundleDto>(this.getPath(`product-bundles/${id}`));
  }

  /**
   * Create a product bundle
   */
  static async createProductBundle(data: CreateProductBundleDto): Promise<ProductBundleDto> {
    return ApiService.post<ProductBundleDto>(this.getPath('product-bundles'), data);
  }

  /**
   * Update a product bundle
   */
  static async updateProductBundle(id: number, data: UpdateProductBundleDto): Promise<ProductBundleDto> {
    return ApiService.put<ProductBundleDto>(this.getPath(`product-bundles/${id}`), data);
  }

  /**
   * Delete a product bundle
   */
  static async deleteProductBundle(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`product-bundles/${id}`));
  }

  /**
   * Add item to product bundle
   */
  static async addProductBundleItem(bundleId: number, data: CreateProductBundleItemDto): Promise<ProductBundleItemDto> {
    return ApiService.post<ProductBundleItemDto>(this.getPath(`product-bundles/${bundleId}/items`), data);
  }

  /**
   * Update product bundle item
   */
  static async updateProductBundleItem(
    bundleId: number,
    itemId: number,
    data: UpdateProductBundleItemDto
  ): Promise<ProductBundleItemDto> {
    return ApiService.put<ProductBundleItemDto>(
      this.getPath(`product-bundles/${bundleId}/items/${itemId}`),
      data
    );
  }

  /**
   * Remove item from product bundle
   */
  static async removeProductBundleItem(bundleId: number, itemId: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`product-bundles/${bundleId}/items/${itemId}`));
  }

  // =====================================
  // ANALYTICS
  // =====================================

  /**
   * Get inventory dashboard data
   */
  static async getInventoryDashboard(
    warehouseId?: number,
    days: number = 30
  ): Promise<InventoryDashboardDto> {
    return ApiService.get<InventoryDashboardDto>(this.getPath('analytics/dashboard'), {
      params: { warehouseId, days },
    });
  }

  /**
   * Get stock valuation report
   */
  static async getStockValuation(
    warehouseId?: number,
    categoryId?: number,
    asOfDate?: string
  ): Promise<StockValuationDto> {
    return ApiService.get<StockValuationDto>(this.getPath('analytics/valuation'), {
      params: { warehouseId, categoryId, asOfDate },
    });
  }

  /**
   * Get inventory KPIs report
   */
  static async getInventoryKPIs(
    startDate: string,
    endDate: string,
    warehouseId?: number
  ): Promise<InventoryKPIsReportDto> {
    return ApiService.get<InventoryKPIsReportDto>(this.getPath('analytics/kpis'), {
      params: { startDate, endDate, warehouseId },
    });
  }

  // =====================================
  // BARCODES
  // =====================================

  /**
   * Generate a barcode image
   */
  static async generateBarcode(request: GenerateBarcodeRequest): Promise<GenerateBarcodeResponse> {
    return ApiService.post<GenerateBarcodeResponse>(this.getPath('barcodes/generate'), request);
  }

  /**
   * Generate a barcode image (GET - returns file)
   */
  static async generateBarcodeImage(
    content: string,
    format: BarcodeFormat = BarcodeFormat.Code128,
    width: number = 300,
    height: number = 100
  ): Promise<Blob> {
    const response = await ApiService.get<Blob>(this.getPath('barcodes/generate'), {
      params: { content, format, width, height },
      responseType: 'blob',
    });
    return response;
  }

  /**
   * Generate a product label with barcode
   */
  static async generateProductLabel(request: GenerateProductLabelRequest): Promise<GenerateProductLabelResponse> {
    return ApiService.post<GenerateProductLabelResponse>(this.getPath('barcodes/labels/product'), request);
  }

  /**
   * Download product label as image
   */
  static async downloadProductLabel(
    productId: number,
    size: LabelSize = LabelSize.Medium,
    format: BarcodeFormat = BarcodeFormat.Code128
  ): Promise<Blob> {
    const response = await ApiService.get<Blob>(this.getPath(`barcodes/labels/product/${productId}`), {
      params: { size, format },
      responseType: 'blob',
    });
    return response;
  }

  /**
   * Generate multiple product labels (bulk)
   */
  static async generateBulkLabels(request: BulkLabelGenerationRequest): Promise<BulkLabelGenerationResponse> {
    return ApiService.post<BulkLabelGenerationResponse>(this.getPath('barcodes/labels/bulk'), request);
  }

  /**
   * Download bulk labels as ZIP file
   */
  static async downloadBulkLabels(request: BulkLabelGenerationRequest): Promise<Blob> {
    const response = await ApiService.post<Blob>(this.getPath('barcodes/labels/bulk/download'), request, {
      responseType: 'blob',
    });
    return response;
  }

  /**
   * Lookup product/variant/serial by barcode (scan)
   */
  static async lookupBarcode(
    barcode: string,
    includeStock: boolean = true,
    warehouseId?: number
  ): Promise<BarcodeLookupResponse> {
    return ApiService.get<BarcodeLookupResponse>(this.getPath(`barcodes/lookup/${encodeURIComponent(barcode)}`), {
      params: { includeStock, warehouseId },
    });
  }

  /**
   * Lookup barcode (POST for complex barcodes)
   */
  static async lookupBarcodePost(request: BarcodeLookupRequest): Promise<BarcodeLookupResponse> {
    return ApiService.post<BarcodeLookupResponse>(this.getPath('barcodes/lookup'), request);
  }

  /**
   * Auto-generate a unique barcode for a product
   */
  static async autoGenerateBarcode(request: AutoGenerateBarcodeRequest): Promise<AutoGenerateBarcodeResponse> {
    return ApiService.post<AutoGenerateBarcodeResponse>(this.getPath('barcodes/auto-generate'), request);
  }

  /**
   * Validate barcode format and checksum
   */
  static async validateBarcode(
    barcode: string,
    format: BarcodeFormat = BarcodeFormat.Code128
  ): Promise<BarcodeValidationResult> {
    return ApiService.get<BarcodeValidationResult>(this.getPath('barcodes/validate'), {
      params: { barcode, format },
    });
  }

  /**
   * Check if barcode is unique
   */
  static async checkBarcodeUnique(
    barcode: string,
    excludeProductId?: number
  ): Promise<BarcodeUniquenessResult> {
    return ApiService.get<BarcodeUniquenessResult>(this.getPath('barcodes/check-unique'), {
      params: { barcode, excludeProductId },
    });
  }

  /**
   * Get supported barcode formats
   */
  static async getBarcodeFormats(): Promise<BarcodeFormatInfo[]> {
    return ApiService.get<BarcodeFormatInfo[]>(this.getPath('barcodes/formats'));
  }

  /**
   * Get label size presets
   */
  static async getLabelSizes(): Promise<LabelSizeInfo[]> {
    return ApiService.get<LabelSizeInfo[]>(this.getPath('barcodes/label-sizes'));
  }

  // =====================================
  // AUDIT TRAIL
  // =====================================

  /**
   * Get paginated audit logs with filtering
   */
  static async getAuditLogs(filter?: InventoryAuditFilterDto): Promise<PaginatedAuditLogsDto> {
    return ApiService.get<PaginatedAuditLogsDto>(this.getPath('audit'), {
      params: filter,
    });
  }

  /**
   * Get audit dashboard with summaries and trends
   */
  static async getAuditDashboard(days: number = 30): Promise<InventoryAuditDashboardDto> {
    return ApiService.get<InventoryAuditDashboardDto>(this.getPath('audit/dashboard'), {
      params: { days },
    });
  }

  /**
   * Get complete history for a specific entity
   */
  static async getEntityHistory(entityType: string, entityId: string): Promise<EntityHistoryDto | null> {
    return ApiService.get<EntityHistoryDto | null>(this.getPath(`audit/history/${entityType}/${entityId}`));
  }

  /**
   * Get a specific audit log entry by ID
   */
  static async getAuditLogById(id: string): Promise<InventoryAuditLogDto | null> {
    return ApiService.get<InventoryAuditLogDto | null>(this.getPath(`audit/${id}`));
  }

  /**
   * Get supported entity types with labels
   */
  static async getAuditEntityTypes(): Promise<Record<string, string>> {
    return ApiService.get<Record<string, string>>(this.getPath('audit/entity-types'));
  }

  /**
   * Get supported action types with labels
   */
  static async getAuditActionTypes(): Promise<Record<string, string>> {
    return ApiService.get<Record<string, string>>(this.getPath('audit/action-types'));
  }

  // =====================================
  // STOCK FORECASTING & AUTO-REORDER
  // =====================================

  /**
   * Get demand forecast for a single product
   */
  static async getProductForecast(
    productId: number,
    warehouseId?: number,
    forecastDays: number = 30,
    method: ForecastingMethod = ForecastingMethodEnum.ExponentialSmoothing
  ): Promise<ProductForecastDto | null> {
    return ApiService.get<ProductForecastDto | null>(this.getPath(`forecasting/products/${productId}`), {
      params: { warehouseId, forecastDays, method },
    });
  }

  /**
   * Get forecasts for multiple products
   */
  static async getProductForecasts(filter?: StockForecastFilterDto): Promise<ProductForecastDto[]> {
    return ApiService.get<ProductForecastDto[]>(this.getPath('forecasting/products'), {
      params: filter,
    });
  }

  /**
   * Get aggregate forecast summary with risk analysis
   */
  static async getForecastSummary(filter?: StockForecastFilterDto): Promise<ForecastSummaryDto> {
    return ApiService.get<ForecastSummaryDto>(this.getPath('forecasting/summary'), {
      params: filter,
    });
  }

  /**
   * Get products at risk of stockout
   */
  static async getStockoutRiskProducts(riskDays: number = 7, warehouseId?: number): Promise<ProductForecastDto[]> {
    return ApiService.get<ProductForecastDto[]>(this.getPath('forecasting/stockout-risk'), {
      params: { riskDays, warehouseId },
    });
  }

  /**
   * Analyze historical demand patterns for a product
   */
  static async getDemandAnalysis(
    productId: number,
    warehouseId?: number,
    analysisDays: number = 90
  ): Promise<DemandAnalysisDto | null> {
    return ApiService.get<DemandAnalysisDto | null>(this.getPath(`forecasting/demand-analysis/${productId}`), {
      params: { warehouseId, analysisDays },
    });
  }

  /**
   * Get seasonal patterns for a product
   */
  static async getSeasonalPatterns(productId: number): Promise<SeasonalPatternDto[]> {
    return ApiService.get<SeasonalPatternDto[]>(this.getPath(`forecasting/seasonal-patterns/${productId}`));
  }

  /**
   * Get ABC classification for products
   */
  static async getAbcClassification(categoryId?: number, analysisDays: number = 365): Promise<AbcClassificationDto> {
    return ApiService.get<AbcClassificationDto>(this.getPath('forecasting/abc-classification'), {
      params: { categoryId, analysisDays },
    });
  }

  /**
   * Calculate recommended safety stock levels
   */
  static async getSafetyStockCalculation(
    productId: number,
    serviceLevel: number = 0.95
  ): Promise<SafetyStockCalculationDto | null> {
    return ApiService.get<SafetyStockCalculationDto | null>(this.getPath(`forecasting/safety-stock/${productId}`), {
      params: { serviceLevel },
    });
  }

  /**
   * Get stock optimization recommendations for a product
   */
  static async getStockOptimization(productId: number): Promise<StockOptimizationDto | null> {
    return ApiService.get<StockOptimizationDto | null>(this.getPath(`forecasting/optimization/${productId}`));
  }

  /**
   * Get bulk stock optimization recommendations
   */
  static async getBulkStockOptimizations(categoryId?: number, warehouseId?: number): Promise<StockOptimizationDto[]> {
    return ApiService.get<StockOptimizationDto[]>(this.getPath('forecasting/optimization'), {
      params: { categoryId, warehouseId },
    });
  }

  // =====================================
  // REORDER RULES
  // =====================================

  /**
   * Get all reorder rules
   */
  static async getReorderRules(
    productId?: number,
    categoryId?: number,
    warehouseId?: number,
    status?: ReorderRuleStatus
  ): Promise<ReorderRuleDto[]> {
    return ApiService.get<ReorderRuleDto[]>(this.getPath('forecasting/reorder-rules'), {
      params: { productId, categoryId, warehouseId, status },
    });
  }

  /**
   * Get a specific reorder rule by ID
   */
  static async getReorderRuleById(id: number): Promise<ReorderRuleDto | null> {
    return ApiService.get<ReorderRuleDto | null>(this.getPath(`forecasting/reorder-rules/${id}`));
  }

  /**
   * Create a new reorder rule
   */
  static async createReorderRule(dto: CreateReorderRuleDto): Promise<ReorderRuleDto> {
    return ApiService.post<ReorderRuleDto>(this.getPath('forecasting/reorder-rules'), dto);
  }

  /**
   * Update an existing reorder rule
   */
  static async updateReorderRule(id: number, dto: CreateReorderRuleDto): Promise<ReorderRuleDto | null> {
    return ApiService.put<ReorderRuleDto | null>(this.getPath(`forecasting/reorder-rules/${id}`), dto);
  }

  /**
   * Delete a reorder rule
   */
  static async deleteReorderRule(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`forecasting/reorder-rules/${id}`));
  }

  /**
   * Activate a reorder rule
   */
  static async activateReorderRule(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`forecasting/reorder-rules/${id}/activate`), {});
  }

  /**
   * Pause a reorder rule
   */
  static async pauseReorderRule(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`forecasting/reorder-rules/${id}/pause`), {});
  }

  /**
   * Disable a reorder rule
   */
  static async disableReorderRule(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`forecasting/reorder-rules/${id}/disable`), {});
  }

  /**
   * Execute a reorder rule manually
   */
  static async executeReorderRule(id: number): Promise<ReorderSuggestionDto[]> {
    return ApiService.post<ReorderSuggestionDto[]>(this.getPath(`forecasting/reorder-rules/${id}/execute`), {});
  }

  // =====================================
  // REORDER SUGGESTIONS
  // =====================================

  /**
   * Get paginated reorder suggestions
   */
  static async getReorderSuggestions(filter?: ReorderSuggestionFilterDto): Promise<PaginatedReorderSuggestionsDto> {
    return ApiService.get<PaginatedReorderSuggestionsDto>(this.getPath('forecasting/suggestions'), {
      params: filter,
    });
  }

  /**
   * Get a specific reorder suggestion by ID
   */
  static async getReorderSuggestionById(id: number): Promise<ReorderSuggestionDto | null> {
    return ApiService.get<ReorderSuggestionDto | null>(this.getPath(`forecasting/suggestions/${id}`));
  }

  /**
   * Generate new reorder suggestions
   */
  static async generateReorderSuggestions(categoryId?: number, warehouseId?: number): Promise<ReorderSuggestionDto[]> {
    return ApiService.post<ReorderSuggestionDto[]>(this.getPath('forecasting/suggestions/generate'), {}, {
      params: { categoryId, warehouseId },
    });
  }

  /**
   * Process a reorder suggestion (approve/reject)
   */
  static async processReorderSuggestion(id: number, dto: ProcessReorderSuggestionDto): Promise<ReorderSuggestionDto | null> {
    return ApiService.post<ReorderSuggestionDto | null>(this.getPath(`forecasting/suggestions/${id}/process`), dto);
  }

  /**
   * Bulk process reorder suggestions
   */
  static async bulkProcessReorderSuggestions(ids: number[], dto: ProcessReorderSuggestionDto): Promise<{ processedCount: number }> {
    return ApiService.post<{ processedCount: number }>(this.getPath('forecasting/suggestions/bulk-process'), {
      ids,
      processDto: dto,
    });
  }

  /**
   * Expire old pending suggestions
   */
  static async expireOldSuggestions(daysOld: number = 7): Promise<{ expiredCount: number }> {
    return ApiService.post<{ expiredCount: number }>(this.getPath('forecasting/suggestions/expire-old'), {}, {
      params: { daysOld },
    });
  }

  // =====================================
  // INVENTORY COSTING (FIFO/LIFO/WAC)
  // =====================================

  /**
   * Get paginated cost layers with filtering
   */
  static async getCostLayers(filter?: CostLayerFilterDto): Promise<PaginatedCostLayersDto> {
    return ApiService.get<PaginatedCostLayersDto>(this.getPath('costing/layers'), {
      params: filter,
    });
  }

  /**
   * Get cost layers for a specific product
   */
  static async getProductCostLayers(
    productId: number,
    warehouseId?: number,
    includeFullyConsumed: boolean = false
  ): Promise<CostLayerDto[]> {
    return ApiService.get<CostLayerDto[]>(this.getPath(`costing/layers/product/${productId}`), {
      params: { warehouseId, includeFullyConsumed },
    });
  }

  /**
   * Create a new cost layer (when receiving inventory)
   */
  static async createCostLayer(dto: CreateCostLayerDto): Promise<CostLayerDto> {
    return ApiService.post<CostLayerDto>(this.getPath('costing/layers'), dto);
  }

  /**
   * Consume from cost layers (when issuing inventory)
   */
  static async consumeFromCostLayers(request: CostCalculationRequestDto): Promise<CostCalculationResultDto> {
    return ApiService.post<CostCalculationResultDto>(this.getPath('costing/layers/consume'), request);
  }

  /**
   * Get costing summary for a specific product
   */
  static async getProductCostingSummary(productId: number, warehouseId?: number): Promise<ProductCostingSummaryDto | null> {
    return ApiService.get<ProductCostingSummaryDto | null>(this.getPath(`costing/products/${productId}`), {
      params: { warehouseId },
    });
  }

  /**
   * Get costing summaries for multiple products
   */
  static async getProductCostingSummaries(categoryId?: number, warehouseId?: number): Promise<ProductCostingSummaryDto[]> {
    return ApiService.get<ProductCostingSummaryDto[]>(this.getPath('costing/products'), {
      params: { categoryId, warehouseId },
    });
  }

  /**
   * Calculate COGS for a quantity using specific method
   */
  static async calculateCOGS(request: CostCalculationRequestDto): Promise<CostCalculationResultDto> {
    return ApiService.post<CostCalculationResultDto>(this.getPath('costing/calculate-cogs'), request);
  }

  /**
   * Compare costs across different methods
   */
  static async compareCostMethods(productId: number, quantity: number, warehouseId?: number): Promise<CostMethodComparisonDto> {
    return ApiService.get<CostMethodComparisonDto>(this.getPath(`costing/products/${productId}/compare`), {
      params: { quantity, warehouseId },
    });
  }

  /**
   * Generate inventory valuation report
   */
  static async getInventoryValuation(filter?: InventoryValuationFilterDto): Promise<InventoryValuationReportDto> {
    return ApiService.get<InventoryValuationReportDto>(this.getPath('costing/valuation'), {
      params: filter,
    });
  }

  /**
   * Get total inventory value
   */
  static async getTotalInventoryValue(
    method: CostingMethod = CostingMethodEnum.WeightedAverageCost,
    warehouseId?: number
  ): Promise<TotalInventoryValueResponse> {
    return ApiService.get<TotalInventoryValueResponse>(this.getPath('costing/valuation/total'), {
      params: { method, warehouseId },
    });
  }

  /**
   * Generate COGS report for a period
   */
  static async getCOGSReport(filter: COGSReportFilterDto): Promise<COGSReportDto> {
    return ApiService.get<COGSReportDto>(this.getPath('costing/cogs-report'), {
      params: filter,
    });
  }

  /**
   * Set standard cost for a product
   */
  static async setStandardCost(productId: number, dto: SetStandardCostDto): Promise<void> {
    return ApiService.post<void>(this.getPath(`costing/products/${productId}/standard-cost`), dto);
  }

  /**
   * Get cost variance analysis
   */
  static async getCostVarianceAnalysis(categoryId?: number): Promise<CostVarianceAnalysisDto[]> {
    return ApiService.get<CostVarianceAnalysisDto[]>(this.getPath('costing/variance-analysis'), {
      params: { categoryId },
    });
  }

  /**
   * Adjust cost for inventory
   */
  static async adjustCost(dto: CostAdjustmentDto): Promise<void> {
    return ApiService.post<void>(this.getPath('costing/adjust'), dto);
  }

  /**
   * Recalculate weighted average cost for a product
   */
  static async recalculateWAC(productId: number, warehouseId?: number): Promise<{ productId: number; weightedAverageCost: number; currency: string }> {
    return ApiService.post<{ productId: number; weightedAverageCost: number; currency: string }>(
      this.getPath(`costing/products/${productId}/recalculate-wac`),
      {},
      { params: { warehouseId } }
    );
  }

  /**
   * Get current costing method for a product
   */
  static async getProductCostingMethod(productId: number): Promise<{ productId: number; costingMethod: string }> {
    return ApiService.get<{ productId: number; costingMethod: string }>(this.getPath(`costing/products/${productId}/method`));
  }

  /**
   * Set costing method for a product
   */
  static async setProductCostingMethod(productId: number, method: CostingMethod): Promise<void> {
    return ApiService.put<void>(this.getPath(`costing/products/${productId}/method`), { method });
  }

  /**
   * Get supported costing methods
   */
  static async getCostingMethods(): Promise<CostingMethodsResponse> {
    return ApiService.get<CostingMethodsResponse>(this.getPath('costing/methods'));
  }

  // =====================================
  // EXCEL EXPORT/IMPORT
  // =====================================

  /**
   * Export products to Excel
   */
  static async exportProductsToExcel(productIds?: number[]): Promise<Blob> {
    const params = productIds?.length ? { productIds: productIds.join(',') } : {};
    return ApiService.getBlob(this.getPath('excel/products/export'), { params });
  }

  /**
   * Export stock data to Excel
   */
  static async exportStockToExcel(warehouseId?: number, includeZeroStock: boolean = false): Promise<Blob> {
    return ApiService.getBlob(this.getPath('excel/stock/export'), {
      params: { warehouseId, includeZeroStock },
    });
  }

  /**
   * Export stock summary to Excel
   */
  static async exportStockSummaryToExcel(): Promise<Blob> {
    return ApiService.getBlob(this.getPath('excel/stock/summary/export'));
  }

  /**
   * Get product import template
   */
  static async getProductImportTemplate(): Promise<Blob> {
    return ApiService.getBlob(this.getPath('excel/products/template'));
  }

  /**
   * Get stock adjustment template
   */
  static async getStockAdjustmentTemplate(): Promise<Blob> {
    return ApiService.getBlob(this.getPath('excel/stock/template'));
  }

  /**
   * Import products from Excel
   */
  static async importProductsFromExcel(file: File, updateExisting: boolean = false): Promise<ExcelImportResultDto> {
    const formData = new FormData();
    formData.append('file', file);
    return ApiService.postForm<ExcelImportResultDto>(
      this.getPath(`excel/products/import?updateExisting=${updateExisting}`),
      formData
    );
  }

  /**
   * Import stock adjustments from Excel
   */
  static async importStockAdjustmentsFromExcel(file: File): Promise<ExcelImportResultDto> {
    const formData = new FormData();
    formData.append('file', file);
    return ApiService.postForm<ExcelImportResultDto>(this.getPath('excel/stock/import'), formData);
  }

  /**
   * Validate Excel import file
   */
  static async validateExcelImport(file: File, importType: 'Products' | 'StockAdjustments'): Promise<ExcelValidationResultDto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('importType', importType);
    return ApiService.postForm<ExcelValidationResultDto>(this.getPath('excel/validate'), formData);
  }

  // =====================================
  // INVENTORY ANALYSIS (ABC/XYZ)
  // =====================================

  /**
   * Get ABC/XYZ Analysis Summary
   */
  static async getAbcXyzAnalysis(filter?: AbcXyzAnalysisFilterDto): Promise<AbcXyzAnalysisSummaryDto> {
    return ApiService.get<AbcXyzAnalysisSummaryDto>(this.getPath('analysis/abc-xyz'), {
      params: filter,
    });
  }

  /**
   * Get ABC/XYZ classification for a single product
   */
  static async getProductAbcXyzClassification(
    productId: number,
    analysisPeriodDays: number = 365,
    warehouseId?: number
  ): Promise<ProductAbcXyzDto | null> {
    return ApiService.get<ProductAbcXyzDto | null>(this.getPath(`analysis/abc-xyz/products/${productId}`), {
      params: { analysisPeriodDays, warehouseId },
    });
  }

  /**
   * Get inventory turnover analysis
   */
  static async getInventoryTurnoverAnalysis(filter?: InventoryTurnoverFilterDto): Promise<InventoryTurnoverDto[]> {
    return ApiService.get<InventoryTurnoverDto[]>(this.getPath('analysis/turnover'), {
      params: filter,
    });
  }

  /**
   * Get dead stock analysis
   */
  static async getDeadStockAnalysis(filter?: DeadStockFilterDto): Promise<DeadStockAnalysisDto> {
    return ApiService.get<DeadStockAnalysisDto>(this.getPath('analysis/dead-stock'), {
      params: filter,
    });
  }

  /**
   * Get service level analysis
   */
  static async getServiceLevelAnalysis(filter?: ServiceLevelFilterDto): Promise<ServiceLevelAnalysisDto[]> {
    return ApiService.get<ServiceLevelAnalysisDto[]>(this.getPath('analysis/service-level'), {
      params: filter,
    });
  }

  /**
   * Get inventory health score
   */
  static async getInventoryHealthScore(filter?: InventoryHealthScoreFilterDto): Promise<InventoryHealthScoreDto> {
    return ApiService.get<InventoryHealthScoreDto>(this.getPath('analysis/health-score'), {
      params: filter,
    });
  }

  // =====================================
  // PACKAGING TYPES
  // =====================================

  /**
   * Get all packaging types
   */
  static async getPackagingTypes(includeInactive: boolean = false): Promise<PackagingTypeDto[]> {
    return ApiService.get<PackagingTypeDto[]>(this.getPath('packaging-types'), {
      params: { includeInactive },
    });
  }

  /**
   * Get a packaging type by ID
   */
  static async getPackagingType(id: number): Promise<PackagingTypeDto> {
    return ApiService.get<PackagingTypeDto>(this.getPath(`packaging-types/${id}`));
  }

  /**
   * Create a new packaging type
   */
  static async createPackagingType(dto: CreatePackagingTypeDto): Promise<PackagingTypeDto> {
    return ApiService.post<PackagingTypeDto>(this.getPath('packaging-types'), dto);
  }

  /**
   * Update a packaging type
   */
  static async updatePackagingType(id: number, dto: UpdatePackagingTypeDto): Promise<PackagingTypeDto> {
    return ApiService.put<PackagingTypeDto>(this.getPath(`packaging-types/${id}`), dto);
  }

  /**
   * Delete a packaging type
   */
  static async deletePackagingType(id: number): Promise<void> {
    return ApiService.delete(this.getPath(`packaging-types/${id}`));
  }

  // =====================================
  // BARCODE DEFINITIONS
  // =====================================

  /**
   * Get barcode definitions
   */
  static async getBarcodeDefinitions(productId?: number, includeInactive: boolean = false): Promise<BarcodeDefinitionDto[]> {
    return ApiService.get<BarcodeDefinitionDto[]>(this.getPath('barcode-definitions'), {
      params: { productId, includeInactive },
    });
  }

  /**
   * Get a barcode definition by ID
   */
  static async getBarcodeDefinition(id: number): Promise<BarcodeDefinitionDto> {
    return ApiService.get<BarcodeDefinitionDto>(this.getPath(`barcode-definitions/${id}`));
  }

  /**
   * Create a new barcode definition
   */
  static async createBarcodeDefinition(dto: CreateBarcodeDefinitionDto): Promise<BarcodeDefinitionDto> {
    return ApiService.post<BarcodeDefinitionDto>(this.getPath('barcode-definitions'), dto);
  }

  /**
   * Update a barcode definition
   */
  static async updateBarcodeDefinition(id: number, dto: UpdateBarcodeDefinitionDto): Promise<BarcodeDefinitionDto> {
    return ApiService.put<BarcodeDefinitionDto>(this.getPath(`barcode-definitions/${id}`), dto);
  }

  /**
   * Delete a barcode definition
   */
  static async deleteBarcodeDefinition(id: number): Promise<void> {
    return ApiService.delete(this.getPath(`barcode-definitions/${id}`));
  }

  /**
   * Lookup barcode
   */
  static async lookupBarcodeDefinition(barcode: string): Promise<BarcodeDefinitionDto | null> {
    return ApiService.get<BarcodeDefinitionDto | null>(this.getPath(`barcode-definitions/lookup/${barcode}`));
  }

  // =====================================
  // WAREHOUSE ZONES
  // =====================================

  static async getWarehouseZones(warehouseId?: number): Promise<WarehouseZoneDto[]> {
    const params = warehouseId ? `?warehouseId=${warehouseId}` : '';
    return ApiService.get<WarehouseZoneDto[]>(this.getPath(`warehouse-zones${params}`));
  }

  static async getWarehouseZone(id: number): Promise<WarehouseZoneDto> {
    return ApiService.get<WarehouseZoneDto>(this.getPath(`warehouse-zones/${id}`));
  }

  static async createWarehouseZone(dto: CreateWarehouseZoneDto): Promise<WarehouseZoneDto> {
    return ApiService.post<WarehouseZoneDto>(this.getPath('warehouse-zones'), dto);
  }

  static async updateWarehouseZone(id: number, dto: UpdateWarehouseZoneDto): Promise<WarehouseZoneDto> {
    return ApiService.put<WarehouseZoneDto>(this.getPath(`warehouse-zones/${id}`), dto);
  }

  static async deleteWarehouseZone(id: number): Promise<void> {
    return ApiService.delete(this.getPath(`warehouse-zones/${id}`));
  }

  // =====================================
  // QUALITY CONTROL
  // =====================================

  static async getQualityControls(params?: { status?: QualityControlStatus }): Promise<QualityControlDto[]> {
    const queryParams = params?.status ? `?status=${params.status}` : '';
    return ApiService.get<QualityControlDto[]>(this.getPath(`quality-controls${queryParams}`));
  }

  static async getQualityControl(id: number): Promise<QualityControlDto> {
    return ApiService.get<QualityControlDto>(this.getPath(`quality-controls/${id}`));
  }

  static async createQualityControl(dto: CreateQualityControlDto): Promise<QualityControlDto> {
    return ApiService.post<QualityControlDto>(this.getPath('quality-controls'), dto);
  }

  static async approveQualityControl(id: number, notes?: string): Promise<QualityControlDto> {
    return ApiService.post<QualityControlDto>(this.getPath(`quality-controls/${id}/approve`), { notes });
  }

  static async rejectQualityControl(id: number, reason: string): Promise<QualityControlDto> {
    return ApiService.post<QualityControlDto>(this.getPath(`quality-controls/${id}/reject`), { reason });
  }

  static async updateQualityControl(id: number, dto: UpdateQualityControlDto): Promise<QualityControlDto> {
    return ApiService.put<QualityControlDto>(this.getPath(`quality-controls/${id}`), dto);
  }

  static async deleteQualityControl(id: number): Promise<void> {
    return ApiService.delete(this.getPath(`quality-controls/${id}`));
  }

  // =====================================
  // CYCLE COUNTS
  // =====================================

  static async getCycleCounts(params?: { status?: CycleCountStatus; warehouseId?: number }): Promise<CycleCountDto[]> {
    let queryString = '';
    if (params) {
      const parts: string[] = [];
      if (params.status) parts.push(`status=${params.status}`);
      if (params.warehouseId) parts.push(`warehouseId=${params.warehouseId}`);
      if (parts.length > 0) queryString = `?${parts.join('&')}`;
    }
    return ApiService.get<CycleCountDto[]>(this.getPath(`cycle-counts${queryString}`));
  }

  static async getCycleCount(id: number): Promise<CycleCountDto> {
    return ApiService.get<CycleCountDto>(this.getPath(`cycle-counts/${id}`));
  }

  static async createCycleCount(dto: CreateCycleCountDto): Promise<CycleCountDto> {
    return ApiService.post<CycleCountDto>(this.getPath('cycle-counts'), dto);
  }

  static async startCycleCount(id: number): Promise<CycleCountDto> {
    return ApiService.post<CycleCountDto>(this.getPath(`cycle-counts/${id}/start`), {});
  }

  static async completeCycleCount(id: number): Promise<CycleCountDto> {
    return ApiService.post<CycleCountDto>(this.getPath(`cycle-counts/${id}/complete`), {});
  }

  static async updateCycleCount(id: number, dto: UpdateCycleCountDto): Promise<CycleCountDto> {
    return ApiService.put<CycleCountDto>(this.getPath(`cycle-counts/${id}`), dto);
  }

  static async deleteCycleCount(id: number): Promise<void> {
    return ApiService.delete(this.getPath(`cycle-counts/${id}`));
  }

  // =====================================
  // SHELF LIFE (Expiring Lot Batches)
  // =====================================

  static async getExpiringLotBatches(daysUntilExpiry: number = 30): Promise<LotBatchDto[]> {
    return ApiService.get<LotBatchDto[]>(this.getPath(`lot-batches/expiring?daysUntilExpiry=${daysUntilExpiry}`));
  }
}

export default InventoryService;
