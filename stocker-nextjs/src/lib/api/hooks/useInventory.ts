/**
 * React Query Hooks for Inventory Module
 * Comprehensive hooks for all Inventory endpoints with optimistic updates and cache management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { InventoryService } from '../services/inventory.service';
import { showSuccess, showError, showApiError } from '@/lib/utils/notifications';
import type {
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
  ProductImageDto,
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  BrandDto,
  CreateBrandDto,
  UpdateBrandDto,
  UnitDto,
  CreateUnitDto,
  UpdateUnitDto,
  WarehouseDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  LocationDto,
  CreateLocationDto,
  UpdateLocationDto,
  SupplierDto,
  CreateSupplierDto,
  UpdateSupplierDto,
  CreateSupplierProductDto,
  StockDto,
  StockAdjustmentDto,
  StockMoveDto,
  StockMovementDto,
  CreateStockMovementDto,
  StockReservationDto,
  CreateStockReservationDto,
  StockTransferDto,
  CreateStockTransferDto,
  UpdateStockTransferDto,
  StockCountDto,
  CreateStockCountDto,
  UpdateStockCountDto,
  PriceListDto,
  CreatePriceListDto,
  UpdatePriceListDto,
  CreatePriceListItemDto,
  BulkPriceUpdateDto,
  StockMovementType,
  ReservationStatus,
  TransferStatus,
  StockCountStatus,
  // Serial Numbers
  SerialNumberDto,
  SerialNumberListDto,
  CreateSerialNumberDto,
  SerialNumberFilterDto,
  ReceiveSerialNumberRequest,
  ReserveSerialNumberRequest,
  SellSerialNumberRequest,
  ReasonRequest,
  SerialNumberStatus,
  // Lot Batches
  LotBatchDto,
  LotBatchListDto,
  CreateLotBatchDto,
  LotBatchFilterDto,
  QuarantineRequest,
  LotBatchStatus,
  // Image Types
  ImageType,
  // Product Attributes
  ProductAttributeDetailDto,
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
  CreateProductBundleDto,
  UpdateProductBundleDto,
  CreateProductBundleItemDto,
  UpdateProductBundleItemDto,
  // Barcodes
  BarcodeFormat,
  LabelSize,
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
  COGSReportDto,
  COGSReportFilterDto,
  SetStandardCostDto,
  CostVarianceAnalysisDto,
  CostAdjustmentDto,
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
} from '../services/inventory.types';

// =====================================
// QUERY KEYS
// =====================================

export const inventoryKeys = {
  // Products
  products: ['inventory', 'products'] as const,
  product: (id: number) => ['inventory', 'products', id] as const,
  productsLowStock: (warehouseId?: number) => ['inventory', 'products', 'low-stock', warehouseId] as const,
  productImages: (productId: number) => ['inventory', 'products', productId, 'images'] as const,

  // Categories
  categories: ['inventory', 'categories'] as const,
  category: (id: number) => ['inventory', 'categories', id] as const,
  categoryTree: ['inventory', 'categories', 'tree'] as const,

  // Brands
  brands: ['inventory', 'brands'] as const,
  brand: (id: number) => ['inventory', 'brands', id] as const,

  // Units
  units: ['inventory', 'units'] as const,
  unit: (id: number) => ['inventory', 'units', id] as const,

  // Warehouses
  warehouses: ['inventory', 'warehouses'] as const,
  warehouse: (id: number) => ['inventory', 'warehouses', id] as const,
  warehouseStockSummary: (id: number) => ['inventory', 'warehouses', id, 'stock-summary'] as const,

  // Locations
  locations: (warehouseId?: number) => ['inventory', 'locations', warehouseId] as const,
  location: (id: number) => ['inventory', 'locations', 'detail', id] as const,

  // Suppliers
  suppliers: ['inventory', 'suppliers'] as const,
  supplier: (id: number) => ['inventory', 'suppliers', id] as const,

  // Stock
  stock: (warehouseId?: number, productId?: number, locationId?: number) =>
    ['inventory', 'stock', warehouseId, productId, locationId] as const,
  stockSummary: (productId: number) => ['inventory', 'stock', 'summary', productId] as const,
  stockExpiring: (days: number) => ['inventory', 'stock', 'expiring', days] as const,

  // Stock Movements
  stockMovements: ['inventory', 'stock-movements'] as const,
  stockMovement: (id: number) => ['inventory', 'stock-movements', id] as const,
  stockMovementSummary: (startDate: string, endDate: string, warehouseId?: number) =>
    ['inventory', 'stock-movements', 'summary', startDate, endDate, warehouseId] as const,

  // Stock Reservations
  stockReservations: ['inventory', 'stock-reservations'] as const,
  stockReservation: (id: number) => ['inventory', 'stock-reservations', id] as const,

  // Stock Transfers
  stockTransfers: ['inventory', 'stock-transfers'] as const,
  stockTransfer: (id: number) => ['inventory', 'stock-transfers', id] as const,

  // Stock Counts
  stockCounts: ['inventory', 'stock-counts'] as const,
  stockCount: (id: number) => ['inventory', 'stock-counts', id] as const,
  stockCountSummary: (id: number) => ['inventory', 'stock-counts', id, 'summary'] as const,

  // Price Lists
  priceLists: ['inventory', 'price-lists'] as const,
  priceList: (id: number) => ['inventory', 'price-lists', id] as const,
  productPrice: (productId: number, priceListId?: number) =>
    ['inventory', 'product-price', productId, priceListId] as const,

  // Serial Numbers
  serialNumbers: (filter?: SerialNumberFilterDto) => ['inventory', 'serial-numbers', filter] as const,
  serialNumber: (id: number) => ['inventory', 'serial-numbers', id] as const,

  // Lot Batches
  lotBatches: (filter?: LotBatchFilterDto) => ['inventory', 'lot-batches', filter] as const,
  lotBatch: (id: number) => ['inventory', 'lot-batches', id] as const,

  // Product Attributes
  productAttributes: ['inventory', 'product-attributes'] as const,
  productAttribute: (id: number) => ['inventory', 'product-attributes', id] as const,

  // Product Variants
  productVariants: (productId?: number) => ['inventory', 'product-variants', productId] as const,
  productVariant: (id: number) => ['inventory', 'product-variants', 'detail', id] as const,

  // Product Bundles
  productBundles: ['inventory', 'product-bundles'] as const,
  productBundle: (id: number) => ['inventory', 'product-bundles', id] as const,

  // Analytics
  analytics: ['inventory', 'analytics'] as const,
  analyticsDashboard: (warehouseId?: number, days?: number) =>
    ['inventory', 'analytics', 'dashboard', warehouseId, days] as const,
  analyticsValuation: (warehouseId?: number, categoryId?: number, asOfDate?: string) =>
    ['inventory', 'analytics', 'valuation', warehouseId, categoryId, asOfDate] as const,
  analyticsKPIs: (startDate: string, endDate: string, warehouseId?: number) =>
    ['inventory', 'analytics', 'kpis', startDate, endDate, warehouseId] as const,

  // Barcodes
  barcodeFormats: ['inventory', 'barcodes', 'formats'] as const,
  labelSizes: ['inventory', 'barcodes', 'label-sizes'] as const,
  barcodeLookup: (barcode: string, warehouseId?: number) =>
    ['inventory', 'barcodes', 'lookup', barcode, warehouseId] as const,

  // Audit Trail
  auditLogs: (filter?: InventoryAuditFilterDto) => ['inventory', 'audit', 'logs', filter] as const,
  auditDashboard: (days: number) => ['inventory', 'audit', 'dashboard', days] as const,
  entityHistory: (entityType: string, entityId: string) =>
    ['inventory', 'audit', 'history', entityType, entityId] as const,
  auditLogById: (id: string) => ['inventory', 'audit', 'log', id] as const,
  auditEntityTypes: ['inventory', 'audit', 'entity-types'] as const,
  auditActionTypes: ['inventory', 'audit', 'action-types'] as const,

  // Stock Forecasting
  forecasting: ['inventory', 'forecasting'] as const,
  productForecast: (productId: number, warehouseId?: number, forecastDays?: number, method?: ForecastingMethod) =>
    ['inventory', 'forecasting', 'product', productId, { warehouseId, forecastDays, method }] as const,
  productForecasts: (filter?: StockForecastFilterDto) =>
    ['inventory', 'forecasting', 'products', filter] as const,
  forecastSummary: (filter?: StockForecastFilterDto) =>
    ['inventory', 'forecasting', 'summary', filter] as const,
  stockoutRisk: (riskDays?: number, warehouseId?: number) =>
    ['inventory', 'forecasting', 'stockout-risk', { riskDays, warehouseId }] as const,
  demandAnalysis: (productId: number, warehouseId?: number, analysisDays?: number) =>
    ['inventory', 'forecasting', 'demand-analysis', productId, { warehouseId, analysisDays }] as const,
  seasonalPatterns: (productId: number) =>
    ['inventory', 'forecasting', 'seasonal-patterns', productId] as const,
  abcClassification: (categoryId?: number, analysisDays?: number) =>
    ['inventory', 'forecasting', 'abc-classification', { categoryId, analysisDays }] as const,
  safetyStock: (productId: number, serviceLevel?: number) =>
    ['inventory', 'forecasting', 'safety-stock', productId, serviceLevel] as const,
  stockOptimization: (productId: number) =>
    ['inventory', 'forecasting', 'optimization', productId] as const,
  bulkStockOptimizations: (categoryId?: number, warehouseId?: number) =>
    ['inventory', 'forecasting', 'optimization', 'bulk', { categoryId, warehouseId }] as const,

  // Reorder Rules
  reorderRules: (productId?: number, categoryId?: number, warehouseId?: number, status?: ReorderRuleStatus) =>
    ['inventory', 'forecasting', 'reorder-rules', { productId, categoryId, warehouseId, status }] as const,
  reorderRule: (id: number) =>
    ['inventory', 'forecasting', 'reorder-rules', id] as const,

  // Reorder Suggestions
  reorderSuggestions: (filter?: ReorderSuggestionFilterDto) =>
    ['inventory', 'forecasting', 'suggestions', filter] as const,
  reorderSuggestion: (id: number) =>
    ['inventory', 'forecasting', 'suggestions', id] as const,

  // Inventory Costing (FIFO/LIFO/WAC)
  costing: ['inventory', 'costing'] as const,
  costLayers: (filter?: CostLayerFilterDto) =>
    ['inventory', 'costing', 'layers', filter] as const,
  productCostLayers: (productId: number, warehouseId?: number, includeFullyConsumed?: boolean) =>
    ['inventory', 'costing', 'layers', 'product', productId, { warehouseId, includeFullyConsumed }] as const,
  productCostingSummary: (productId: number, warehouseId?: number) =>
    ['inventory', 'costing', 'products', productId, { warehouseId }] as const,
  productCostingSummaries: (categoryId?: number, warehouseId?: number) =>
    ['inventory', 'costing', 'products', { categoryId, warehouseId }] as const,
  costMethodComparison: (productId: number, quantity: number, warehouseId?: number) =>
    ['inventory', 'costing', 'products', productId, 'compare', { quantity, warehouseId }] as const,
  inventoryValuation: (filter?: InventoryValuationFilterDto) =>
    ['inventory', 'costing', 'valuation', filter] as const,
  totalInventoryValue: (method?: CostingMethod, warehouseId?: number) =>
    ['inventory', 'costing', 'valuation', 'total', { method, warehouseId }] as const,
  cogsReport: (filter: COGSReportFilterDto) =>
    ['inventory', 'costing', 'cogs-report', filter] as const,
  costVarianceAnalysis: (categoryId?: number) =>
    ['inventory', 'costing', 'variance-analysis', categoryId] as const,
  productCostingMethod: (productId: number) =>
    ['inventory', 'costing', 'products', productId, 'method'] as const,
  costingMethods: ['inventory', 'costing', 'methods'] as const,

  // Excel Export/Import
  excelProductsExport: (productIds?: number[]) => ['inventory', 'excel', 'products', 'export', productIds] as const,
  excelStockExport: (warehouseId?: number) => ['inventory', 'excel', 'stock', 'export', warehouseId] as const,
  excelStockSummaryExport: ['inventory', 'excel', 'stock', 'summary', 'export'] as const,

  // Inventory Analysis (ABC/XYZ)
  analysis: ['inventory', 'analysis'] as const,
  abcXyzAnalysis: (filter?: AbcXyzAnalysisFilterDto) =>
    ['inventory', 'analysis', 'abc-xyz', filter] as const,
  productAbcXyzClassification: (productId: number, analysisPeriodDays?: number, warehouseId?: number) =>
    ['inventory', 'analysis', 'abc-xyz', 'products', productId, { analysisPeriodDays, warehouseId }] as const,
  inventoryTurnover: (filter?: InventoryTurnoverFilterDto) =>
    ['inventory', 'analysis', 'turnover', filter] as const,
  deadStock: (filter?: DeadStockFilterDto) =>
    ['inventory', 'analysis', 'dead-stock', filter] as const,
  serviceLevel: (filter?: ServiceLevelFilterDto) =>
    ['inventory', 'analysis', 'service-level', filter] as const,
  inventoryHealthScore: (filter?: InventoryHealthScoreFilterDto) =>
    ['inventory', 'analysis', 'health-score', filter] as const,
};

// =====================================
// PRODUCTS HOOKS
// =====================================

export function useProducts(includeInactive: boolean = false, categoryId?: number, brandId?: number) {
  return useQuery({
    queryKey: [...inventoryKeys.products, { includeInactive, categoryId, brandId }],
    queryFn: () => InventoryService.getProducts(includeInactive, categoryId, brandId),
    staleTime: 30000,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: inventoryKeys.product(id),
    queryFn: () => InventoryService.getProduct(id),
    enabled: !!id && id > 0,
  });
}

export function useLowStockProducts(warehouseId?: number) {
  return useQuery({
    queryKey: inventoryKeys.productsLowStock(warehouseId),
    queryFn: () => InventoryService.getLowStockProducts(warehouseId),
    staleTime: 60000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => InventoryService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'], refetchType: 'all' });
      showSuccess('Ürün oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Ürün oluşturulamadı');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductDto }) =>
      InventoryService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.product(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products });
      showSuccess('Ürün güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Ürün güncellenemedi');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products });
      showSuccess('Ürün silindi');
    },
    onError: (error) => {
      showApiError(error, 'Ürün silinemedi');
    },
  });
}

export function useActivateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.activateProduct(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.product(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products });
      showSuccess('Ürün aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Ürün aktifleştirilemedi');
    },
  });
}

export function useDeactivateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.deactivateProduct(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.product(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products });
      showSuccess('Ürün pasifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Ürün pasifleştirilemedi');
    },
  });
}

// =====================================
// CATEGORIES HOOKS
// =====================================

export function useCategories(includeInactive: boolean = false) {
  return useQuery({
    queryKey: [...inventoryKeys.categories, { includeInactive }],
    queryFn: () => InventoryService.getCategories(includeInactive),
    staleTime: 60000,
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: inventoryKeys.category(id),
    queryFn: () => InventoryService.getCategory(id),
    enabled: !!id && id > 0,
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: inventoryKeys.categoryTree,
    queryFn: () => InventoryService.getCategoryTree(),
    staleTime: 60000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => InventoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'categories'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categoryTree, refetchType: 'all' });
      showSuccess('Kategori oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Kategori oluşturulamadı');
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryDto }) =>
      InventoryService.updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.category(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categories });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categoryTree });
      showSuccess('Kategori güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Kategori güncellenemedi');
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categories });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categoryTree });
      showSuccess('Kategori silindi');
    },
    onError: (error) => {
      showApiError(error, 'Kategori silinemedi');
    },
  });
}

// =====================================
// BRANDS HOOKS
// =====================================

export function useBrands(includeInactive: boolean = false) {
  return useQuery({
    queryKey: [...inventoryKeys.brands, { includeInactive }],
    queryFn: () => InventoryService.getBrands(includeInactive),
    staleTime: 60000,
  });
}

export function useBrand(id: number) {
  return useQuery({
    queryKey: inventoryKeys.brand(id),
    queryFn: () => InventoryService.getBrand(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBrandDto) => InventoryService.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'brands'], refetchType: 'all' });
      showSuccess('Marka oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Marka oluşturulamadı');
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBrandDto }) =>
      InventoryService.updateBrand(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.brand(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.brands });
      showSuccess('Marka güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Marka güncellenemedi');
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.brands });
      showSuccess('Marka silindi');
    },
    onError: (error) => {
      showApiError(error, 'Marka silinemedi');
    },
  });
}

// =====================================
// UNITS HOOKS
// =====================================

export function useUnits(includeInactive: boolean = false) {
  return useQuery({
    queryKey: [...inventoryKeys.units, { includeInactive }],
    queryFn: () => InventoryService.getUnits(includeInactive),
    staleTime: 60000,
  });
}

export function useUnit(id: number) {
  return useQuery({
    queryKey: inventoryKeys.unit(id),
    queryFn: () => InventoryService.getUnit(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUnitDto) => InventoryService.createUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'units'], refetchType: 'all' });
      showSuccess('Birim oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Birim oluşturulamadı');
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUnitDto }) =>
      InventoryService.updateUnit(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.unit(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.units });
      showSuccess('Birim güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Birim güncellenemedi');
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.units });
      showSuccess('Birim silindi');
    },
    onError: (error) => {
      showApiError(error, 'Birim silinemedi');
    },
  });
}

// =====================================
// WAREHOUSES HOOKS
// =====================================

export function useWarehouses(includeInactive: boolean = false) {
  return useQuery({
    queryKey: [...inventoryKeys.warehouses, { includeInactive }],
    queryFn: () => InventoryService.getWarehouses(includeInactive),
    staleTime: 60000,
  });
}

export function useWarehouse(id: number) {
  return useQuery({
    queryKey: inventoryKeys.warehouse(id),
    queryFn: () => InventoryService.getWarehouse(id),
    enabled: !!id && id > 0,
  });
}

export function useWarehouseStockSummary(id: number) {
  return useQuery({
    queryKey: inventoryKeys.warehouseStockSummary(id),
    queryFn: () => InventoryService.getWarehouseStockSummary(id),
    enabled: !!id && id > 0,
    staleTime: 30000,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWarehouseDto) => InventoryService.createWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses });
      showSuccess('Depo oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Depo oluşturulamadı');
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWarehouseDto }) =>
      InventoryService.updateWarehouse(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouse(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses });
      showSuccess('Depo güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Depo güncellenemedi');
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses });
      showSuccess('Depo silindi');
    },
    onError: (error) => {
      showApiError(error, 'Depo silinemedi');
    },
  });
}

export function useSetDefaultWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.setDefaultWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses });
      showSuccess('Varsayılan depo ayarlandı');
    },
    onError: (error) => {
      showApiError(error, 'Varsayılan depo ayarlanamadı');
    },
  });
}

// =====================================
// LOCATIONS HOOKS
// =====================================

export function useLocations(warehouseId?: number) {
  return useQuery({
    queryKey: inventoryKeys.locations(warehouseId),
    queryFn: () => InventoryService.getLocations(warehouseId),
    staleTime: 60000,
  });
}

export function useLocation(id: number) {
  return useQuery({
    queryKey: inventoryKeys.location(id),
    queryFn: () => InventoryService.getLocation(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLocationDto) => InventoryService.createLocation(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.locations(data.warehouseId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.locations(undefined) });
      showSuccess('Konum oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Konum oluşturulamadı');
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLocationDto }) =>
      InventoryService.updateLocation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.location(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'locations'] });
      showSuccess('Konum güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Konum güncellenemedi');
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'locations'] });
      showSuccess('Konum silindi');
    },
    onError: (error) => {
      showApiError(error, 'Konum silinemedi');
    },
  });
}

// =====================================
// SUPPLIERS HOOKS
// =====================================

export function useSuppliers(includeInactive: boolean = false) {
  return useQuery({
    queryKey: [...inventoryKeys.suppliers, { includeInactive }],
    queryFn: () => InventoryService.getSuppliers(includeInactive),
    staleTime: 60000,
  });
}

export function useSupplier(id: number) {
  return useQuery({
    queryKey: inventoryKeys.supplier(id),
    queryFn: () => InventoryService.getSupplier(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierDto) => InventoryService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.suppliers });
      showSuccess('Tedarikçi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Tedarikçi oluşturulamadı');
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSupplierDto }) =>
      InventoryService.updateSupplier(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.supplier(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.suppliers });
      showSuccess('Tedarikçi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Tedarikçi güncellenemedi');
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.suppliers });
      showSuccess('Tedarikçi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Tedarikçi silinemedi');
    },
  });
}

export function useAddSupplierProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierProductDto) => InventoryService.addSupplierProduct(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.supplier(data.supplierId) });
      showSuccess('Tedarikçi ürünü eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Tedarikçi ürünü eklenemedi');
    },
  });
}

export function useRemoveSupplierProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ supplierId, productId }: { supplierId: number; productId: number }) =>
      InventoryService.removeSupplierProduct(supplierId, productId),
    onSuccess: (_, { supplierId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.supplier(supplierId) });
      showSuccess('Tedarikçi ürünü kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'Tedarikçi ürünü kaldırılamadı');
    },
  });
}

// =====================================
// STOCK HOOKS
// =====================================

export function useStock(warehouseId?: number, productId?: number, locationId?: number) {
  return useQuery({
    queryKey: inventoryKeys.stock(warehouseId, productId, locationId),
    queryFn: () => InventoryService.getStock(warehouseId, productId, locationId),
    staleTime: 30000,
  });
}

export function useProductStockSummary(productId: number) {
  return useQuery({
    queryKey: inventoryKeys.stockSummary(productId),
    queryFn: () => InventoryService.getProductStockSummary(productId),
    enabled: !!productId && productId > 0,
    staleTime: 30000,
  });
}

export function useExpiringStock(daysUntilExpiry: number = 30) {
  return useQuery({
    queryKey: inventoryKeys.stockExpiring(daysUntilExpiry),
    queryFn: () => InventoryService.getExpiringStock(daysUntilExpiry),
    staleTime: 60000,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockAdjustmentDto) => InventoryService.adjustStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stock'] });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products });
      showSuccess('Stok düzeltmesi yapıldı');
    },
    onError: (error) => {
      showApiError(error, 'Stok düzeltmesi yapılamadı');
    },
  });
}

export function useMoveStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockMoveDto) => InventoryService.moveStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stock'] });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockMovements });
      showSuccess('Stok taşındı');
    },
    onError: (error) => {
      showApiError(error, 'Stok taşınamadı');
    },
  });
}

// =====================================
// STOCK MOVEMENTS HOOKS
// =====================================

export function useStockMovements(
  productId?: number,
  warehouseId?: number,
  movementType?: StockMovementType,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: [...inventoryKeys.stockMovements, { productId, warehouseId, movementType, startDate, endDate }],
    queryFn: () => InventoryService.getStockMovements(productId, warehouseId, movementType, startDate, endDate),
    staleTime: 30000,
  });
}

export function useStockMovement(id: number) {
  return useQuery({
    queryKey: inventoryKeys.stockMovement(id),
    queryFn: () => InventoryService.getStockMovement(id),
    enabled: !!id && id > 0,
  });
}

export function useStockMovementSummary(startDate: string, endDate: string, warehouseId?: number) {
  return useQuery({
    queryKey: inventoryKeys.stockMovementSummary(startDate, endDate, warehouseId),
    queryFn: () => InventoryService.getStockMovementSummary(startDate, endDate, warehouseId),
    enabled: !!startDate && !!endDate,
    staleTime: 60000,
  });
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockMovementDto) => InventoryService.createStockMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockMovements });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stock'] });
      showSuccess('Stok hareketi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Stok hareketi oluşturulamadı');
    },
  });
}

export function useReverseStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      InventoryService.reverseStockMovement(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockMovements });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stock'] });
      showSuccess('Stok hareketi tersine çevrildi');
    },
    onError: (error) => {
      showApiError(error, 'Stok hareketi tersine çevrilemedi');
    },
  });
}

// =====================================
// STOCK RESERVATIONS HOOKS
// =====================================

export function useStockReservations(
  productId?: number,
  warehouseId?: number,
  status?: ReservationStatus,
  expiredOnly: boolean = false
) {
  return useQuery({
    queryKey: [...inventoryKeys.stockReservations, { productId, warehouseId, status, expiredOnly }],
    queryFn: () => InventoryService.getStockReservations(productId, warehouseId, status, expiredOnly),
    staleTime: 30000,
  });
}

export function useStockReservation(id: number) {
  return useQuery({
    queryKey: inventoryKeys.stockReservation(id),
    queryFn: () => InventoryService.getStockReservation(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateStockReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockReservationDto) => InventoryService.createStockReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockReservations });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stock'] });
      showSuccess('Stok rezervasyonu oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Stok rezervasyonu oluşturulamadı');
    },
  });
}

export function useFulfillStockReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity?: number }) =>
      InventoryService.fulfillStockReservation(id, quantity),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockReservation(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockReservations });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stock'] });
      showSuccess('Rezervasyon karşılandı');
    },
    onError: (error) => {
      showApiError(error, 'Rezervasyon karşılanamadı');
    },
  });
}

export function useCancelStockReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      InventoryService.cancelStockReservation(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockReservations });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stock'] });
      showSuccess('Rezervasyon iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Rezervasyon iptal edilemedi');
    },
  });
}

export function useExtendStockReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newExpirationDate }: { id: number; newExpirationDate: string }) =>
      InventoryService.extendStockReservation(id, newExpirationDate),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockReservation(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockReservations });
      showSuccess('Rezervasyon süresi uzatıldı');
    },
    onError: (error) => {
      showApiError(error, 'Rezervasyon süresi uzatılamadı');
    },
  });
}

// =====================================
// STOCK TRANSFERS HOOKS
// =====================================

export function useStockTransfers(
  sourceWarehouseId?: number,
  destinationWarehouseId?: number,
  status?: TransferStatus,
  fromDate?: string,
  toDate?: string
) {
  return useQuery({
    queryKey: [...inventoryKeys.stockTransfers, { sourceWarehouseId, destinationWarehouseId, status, fromDate, toDate }],
    queryFn: () => InventoryService.getStockTransfers(sourceWarehouseId, destinationWarehouseId, status, fromDate, toDate),
    staleTime: 30000,
  });
}

export function useStockTransfer(id: number) {
  return useQuery({
    queryKey: inventoryKeys.stockTransfer(id),
    queryFn: () => InventoryService.getStockTransfer(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockTransferDto) => InventoryService.createStockTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockTransfers });
      showSuccess('Transfer oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Transfer oluşturulamadı');
    },
  });
}

export function useUpdateStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStockTransferDto }) =>
      InventoryService.updateStockTransfer(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockTransfer(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockTransfers });
      showSuccess('Transfer güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Transfer güncellenemedi');
    },
  });
}

export function useSubmitStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.submitStockTransfer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockTransfer(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockTransfers });
      showSuccess('Transfer onaya gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Transfer onaya gönderilemedi');
    },
  });
}

export function useApproveStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, approvedByUserId }: { id: number; approvedByUserId: number }) =>
      InventoryService.approveStockTransfer(id, approvedByUserId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockTransfer(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockTransfers });
      showSuccess('Transfer onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Transfer onaylanamadı');
    },
  });
}

export function useRejectStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      InventoryService.rejectStockTransfer(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockTransfer(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockTransfers });
      showSuccess('Transfer reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'Transfer reddedilemedi');
    },
  });
}

export function useShipStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, shippedByUserId }: { id: number; shippedByUserId: number }) =>
      InventoryService.shipStockTransfer(id, shippedByUserId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockTransfer(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockTransfers });
      showSuccess('Transfer sevk edildi');
    },
    onError: (error) => {
      showApiError(error, 'Transfer sevk edilemedi');
    },
  });
}

export function useReceiveStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, receivedByUserId }: { id: number; receivedByUserId: number }) =>
      InventoryService.receiveStockTransfer(id, receivedByUserId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockTransfer(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockTransfers });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stock'] });
      showSuccess('Transfer teslim alındı');
    },
    onError: (error) => {
      showApiError(error, 'Transfer teslim alınamadı');
    },
  });
}

export function useCancelStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      InventoryService.cancelStockTransfer(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockTransfers });
      showSuccess('Transfer iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Transfer iptal edilemedi');
    },
  });
}

// =====================================
// STOCK COUNTS HOOKS
// =====================================

export function useStockCounts(
  warehouseId?: number,
  status?: StockCountStatus,
  fromDate?: string,
  toDate?: string
) {
  return useQuery({
    queryKey: [...inventoryKeys.stockCounts, { warehouseId, status, fromDate, toDate }],
    queryFn: () => InventoryService.getStockCounts(warehouseId, status, fromDate, toDate),
    staleTime: 30000,
  });
}

export function useStockCount(id: number) {
  return useQuery({
    queryKey: inventoryKeys.stockCount(id),
    queryFn: () => InventoryService.getStockCount(id),
    enabled: !!id && id > 0,
  });
}

export function useStockCountSummary(id: number) {
  return useQuery({
    queryKey: inventoryKeys.stockCountSummary(id),
    queryFn: () => InventoryService.getStockCountSummary(id),
    enabled: !!id && id > 0,
    staleTime: 30000,
  });
}

export function useCreateStockCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockCountDto) => InventoryService.createStockCount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockCounts });
      showSuccess('Sayım oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Sayım oluşturulamadı');
    },
  });
}

export function useUpdateStockCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStockCountDto }) =>
      InventoryService.updateStockCount(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockCount(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockCounts });
      showSuccess('Sayım güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Sayım güncellenemedi');
    },
  });
}

export function useStartStockCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, countedByUserId }: { id: number; countedByUserId: number }) =>
      InventoryService.startStockCount(id, countedByUserId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockCount(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockCounts });
      showSuccess('Sayım başlatıldı');
    },
    onError: (error) => {
      showApiError(error, 'Sayım başlatılamadı');
    },
  });
}

export function useCountStockCountItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stockCountId,
      itemId,
      countedQuantity,
      notes,
    }: {
      stockCountId: number;
      itemId: number;
      countedQuantity: number;
      notes?: string;
    }) => InventoryService.countStockCountItem(stockCountId, itemId, countedQuantity, notes),
    onSuccess: (_, { stockCountId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockCount(stockCountId) });
      showSuccess('Ürün sayıldı');
    },
    onError: (error) => {
      showApiError(error, 'Ürün sayılamadı');
    },
  });
}

export function useCompleteStockCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.completeStockCount(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockCount(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockCounts });
      showSuccess('Sayım tamamlandı');
    },
    onError: (error) => {
      showApiError(error, 'Sayım tamamlanamadı');
    },
  });
}

export function useApproveStockCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, approvedByUserId }: { id: number; approvedByUserId: number }) =>
      InventoryService.approveStockCount(id, approvedByUserId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockCount(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockCounts });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stock'] });
      showSuccess('Sayım onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Sayım onaylanamadı');
    },
  });
}

export function useCancelStockCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      InventoryService.cancelStockCount(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockCounts });
      showSuccess('Sayım iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Sayım iptal edilemedi');
    },
  });
}

// =====================================
// PRICE LISTS HOOKS
// =====================================

export function usePriceLists(activeOnly: boolean = true) {
  return useQuery({
    queryKey: [...inventoryKeys.priceLists, { activeOnly }],
    queryFn: () => InventoryService.getPriceLists(activeOnly),
    staleTime: 60000,
  });
}

export function usePriceList(id: number) {
  return useQuery({
    queryKey: inventoryKeys.priceList(id),
    queryFn: () => InventoryService.getPriceList(id),
    enabled: !!id && id > 0,
  });
}

export function useProductPrice(productId: number, priceListId?: number, quantity?: number) {
  return useQuery({
    queryKey: inventoryKeys.productPrice(productId, priceListId),
    queryFn: () => InventoryService.getProductPrice(productId, priceListId, quantity),
    enabled: !!productId && productId > 0,
    staleTime: 60000,
  });
}

export function useCreatePriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePriceListDto) => InventoryService.createPriceList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.priceLists });
      showSuccess('Fiyat listesi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi oluşturulamadı');
    },
  });
}

export function useUpdatePriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePriceListDto }) =>
      InventoryService.updatePriceList(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.priceList(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.priceLists });
      showSuccess('Fiyat listesi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi güncellenemedi');
    },
  });
}

export function useDeletePriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.deletePriceList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.priceLists });
      showSuccess('Fiyat listesi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi silinemedi');
    },
  });
}

export function useActivatePriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.activatePriceList(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.priceList(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.priceLists });
      showSuccess('Fiyat listesi aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi aktifleştirilemedi');
    },
  });
}

export function useDeactivatePriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.deactivatePriceList(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.priceList(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.priceLists });
      showSuccess('Fiyat listesi pasifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi pasifleştirilemedi');
    },
  });
}

export function useSetDefaultPriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.setDefaultPriceList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.priceLists });
      showSuccess('Varsayılan fiyat listesi ayarlandı');
    },
    onError: (error) => {
      showApiError(error, 'Varsayılan fiyat listesi ayarlanamadı');
    },
  });
}

export function useAddPriceListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ priceListId, data }: { priceListId: number; data: CreatePriceListItemDto }) =>
      InventoryService.addPriceListItem(priceListId, data),
    onSuccess: (_, { priceListId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.priceList(priceListId) });
      showSuccess('Fiyat listesi kalemi eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi kalemi eklenemedi');
    },
  });
}

export function useUpdatePriceListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      priceListId,
      itemId,
      data,
    }: {
      priceListId: number;
      itemId: number;
      data: CreatePriceListItemDto;
    }) => InventoryService.updatePriceListItem(priceListId, itemId, data),
    onSuccess: (_, { priceListId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.priceList(priceListId) });
      showSuccess('Fiyat listesi kalemi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi kalemi güncellenemedi');
    },
  });
}

export function useRemovePriceListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ priceListId, itemId }: { priceListId: number; itemId: number }) =>
      InventoryService.removePriceListItem(priceListId, itemId),
    onSuccess: (_, { priceListId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.priceList(priceListId) });
      showSuccess('Fiyat listesi kalemi kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi kalemi kaldırılamadı');
    },
  });
}

export function useBulkUpdatePriceListItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkPriceUpdateDto) => InventoryService.bulkUpdatePriceListItems(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.priceList(data.priceListId) });
      showSuccess('Fiyat listesi toplu güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi toplu güncellenemedi');
    },
  });
}

// =====================================
// SERIAL NUMBERS HOOKS
// =====================================

export function useSerialNumbers(filter?: SerialNumberFilterDto) {
  return useQuery({
    queryKey: inventoryKeys.serialNumbers(filter),
    queryFn: () => InventoryService.getSerialNumbers(filter),
    staleTime: 30000,
  });
}

export function useSerialNumber(id: number) {
  return useQuery({
    queryKey: inventoryKeys.serialNumber(id),
    queryFn: () => InventoryService.getSerialNumber(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateSerialNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSerialNumberDto) => InventoryService.createSerialNumber(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'serial-numbers'] });
      showSuccess('Seri numarası oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Seri numarası oluşturulamadı');
    },
  });
}

export function useReceiveSerialNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request?: ReceiveSerialNumberRequest }) =>
      InventoryService.receiveSerialNumber(id, request),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'serial-numbers'] });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.serialNumber(id) });
      showSuccess('Seri numarası teslim alındı');
    },
    onError: (error) => {
      showApiError(error, 'Seri numarası teslim alınamadı');
    },
  });
}

export function useReserveSerialNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: ReserveSerialNumberRequest }) =>
      InventoryService.reserveSerialNumber(id, request),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'serial-numbers'] });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.serialNumber(id) });
      showSuccess('Seri numarası rezerve edildi');
    },
    onError: (error) => {
      showApiError(error, 'Seri numarası rezerve edilemedi');
    },
  });
}

export function useReleaseSerialNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.releaseSerialNumber(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'serial-numbers'] });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.serialNumber(id) });
      showSuccess('Seri numarası rezervasyonu kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'Seri numarası rezervasyonu kaldırılamadı');
    },
  });
}

export function useSellSerialNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: SellSerialNumberRequest }) =>
      InventoryService.sellSerialNumber(id, request),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'serial-numbers'] });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.serialNumber(id) });
      showSuccess('Seri numarası satıldı');
    },
    onError: (error) => {
      showApiError(error, 'Seri numarası satılamadı');
    },
  });
}

export function useMarkSerialNumberDefective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request?: ReasonRequest }) =>
      InventoryService.markSerialNumberDefective(id, request),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'serial-numbers'] });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.serialNumber(id) });
      showSuccess('Seri numarası arızalı olarak işaretlendi');
    },
    onError: (error) => {
      showApiError(error, 'Seri numarası arızalı olarak işaretlenemedi');
    },
  });
}

export function useScrapSerialNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request?: ReasonRequest }) =>
      InventoryService.scrapSerialNumber(id, request),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'serial-numbers'] });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.serialNumber(id) });
      showSuccess('Seri numarası hurda olarak işaretlendi');
    },
    onError: (error) => {
      showApiError(error, 'Seri numarası hurda olarak işaretlenemedi');
    },
  });
}

// =====================================
// LOT BATCHES HOOKS
// =====================================

export function useLotBatches(filter?: LotBatchFilterDto) {
  return useQuery({
    queryKey: inventoryKeys.lotBatches(filter),
    queryFn: () => InventoryService.getLotBatches(filter),
    staleTime: 30000,
  });
}

export function useLotBatch(id: number) {
  return useQuery({
    queryKey: inventoryKeys.lotBatch(id),
    queryFn: () => InventoryService.getLotBatch(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateLotBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLotBatchDto) => InventoryService.createLotBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'lot-batches'] });
      showSuccess('Lot/Parti oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Lot/Parti oluşturulamadı');
    },
  });
}

export function useApproveLotBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.approveLotBatch(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'lot-batches'] });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lotBatch(id) });
      showSuccess('Lot/Parti onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Lot/Parti onaylanamadı');
    },
  });
}

export function useQuarantineLotBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: QuarantineRequest }) =>
      InventoryService.quarantineLotBatch(id, request),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'lot-batches'] });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lotBatch(id) });
      showSuccess('Lot/Parti karantinaya alındı');
    },
    onError: (error) => {
      showApiError(error, 'Lot/Parti karantinaya alınamadı');
    },
  });
}

// =====================================
// PRODUCT IMAGES HOOKS
// =====================================

export function useProductImages(productId: number, includeInactive: boolean = false) {
  return useQuery({
    queryKey: [...inventoryKeys.productImages(productId), { includeInactive }],
    queryFn: () => InventoryService.getProductImages(productId, includeInactive),
    enabled: !!productId && productId > 0,
    staleTime: 30000,
  });
}

export function useUploadProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      file,
      options,
    }: {
      productId: number;
      file: File;
      options?: {
        altText?: string;
        title?: string;
        imageType?: ImageType;
        setAsPrimary?: boolean;
      };
    }) => InventoryService.uploadProductImage(productId, file, options),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productImages(productId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.product(productId) });
      showSuccess('Ürün resmi yüklendi');
    },
    onError: (error) => {
      showApiError(error, 'Ürün resmi yüklenemedi');
    },
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      InventoryService.deleteProductImage(productId, imageId),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productImages(productId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.product(productId) });
      showSuccess('Ürün resmi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Ürün resmi silinemedi');
    },
  });
}

export function useSetProductImageAsPrimary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      InventoryService.setProductImageAsPrimary(productId, imageId),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productImages(productId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.product(productId) });
      showSuccess('Ana resim ayarlandı');
    },
    onError: (error) => {
      showApiError(error, 'Ana resim ayarlanamadı');
    },
  });
}

export function useReorderProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, imageIds }: { productId: number; imageIds: number[] }) =>
      InventoryService.reorderProductImages(productId, imageIds),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productImages(productId) });
      showSuccess('Resim sıralaması güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Resim sıralaması güncellenemedi');
    },
  });
}

// =====================================
// PRODUCT ATTRIBUTES HOOKS
// =====================================

export function useProductAttributes(includeInactive: boolean = false, filterableOnly: boolean = false) {
  return useQuery({
    queryKey: [...inventoryKeys.productAttributes, { includeInactive, filterableOnly }],
    queryFn: () => InventoryService.getProductAttributes(includeInactive, filterableOnly),
    staleTime: 60000,
  });
}

export function useProductAttribute(id: number) {
  return useQuery({
    queryKey: inventoryKeys.productAttribute(id),
    queryFn: () => InventoryService.getProductAttribute(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateProductAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductAttributeDto) => InventoryService.createProductAttribute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productAttributes });
      showSuccess('Ürün özelliği oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Ürün özelliği oluşturulamadı');
    },
  });
}

export function useUpdateProductAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductAttributeDto }) =>
      InventoryService.updateProductAttribute(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productAttribute(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productAttributes });
      showSuccess('Ürün özelliği güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Ürün özelliği güncellenemedi');
    },
  });
}

export function useDeleteProductAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.deleteProductAttribute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productAttributes });
      showSuccess('Ürün özelliği silindi');
    },
    onError: (error) => {
      showApiError(error, 'Ürün özelliği silinemedi');
    },
  });
}

export function useAddProductAttributeOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attributeId, data }: { attributeId: number; data: CreateProductAttributeOptionDto }) =>
      InventoryService.addProductAttributeOption(attributeId, data),
    onSuccess: (_, { attributeId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productAttribute(attributeId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productAttributes });
      showSuccess('Özellik seçeneği eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Özellik seçeneği eklenemedi');
    },
  });
}

export function useUpdateProductAttributeOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attributeId,
      optionId,
      data,
    }: {
      attributeId: number;
      optionId: number;
      data: UpdateProductAttributeOptionDto;
    }) => InventoryService.updateProductAttributeOption(attributeId, optionId, data),
    onSuccess: (_, { attributeId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productAttribute(attributeId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productAttributes });
      showSuccess('Özellik seçeneği güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Özellik seçeneği güncellenemedi');
    },
  });
}

export function useDeleteProductAttributeOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attributeId, optionId }: { attributeId: number; optionId: number }) =>
      InventoryService.deleteProductAttributeOption(attributeId, optionId),
    onSuccess: (_, { attributeId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productAttribute(attributeId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productAttributes });
      showSuccess('Özellik seçeneği silindi');
    },
    onError: (error) => {
      showApiError(error, 'Özellik seçeneği silinemedi');
    },
  });
}

// =====================================
// PRODUCT VARIANTS HOOKS
// =====================================

export function useProductVariants(productId: number, includeInactive: boolean = false) {
  return useQuery({
    queryKey: [...inventoryKeys.productVariants(productId), { includeInactive }],
    queryFn: () => InventoryService.getProductVariants(productId, includeInactive),
    enabled: !!productId && productId > 0,
    staleTime: 30000,
  });
}

export function useProductVariant(id: number) {
  return useQuery({
    queryKey: inventoryKeys.productVariant(id),
    queryFn: () => InventoryService.getProductVariant(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductVariantDto) => InventoryService.createProductVariant(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productVariants(data.productId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productVariants(undefined) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.product(data.productId) });
      showSuccess('Ürün varyantı oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Ürün varyantı oluşturulamadı');
    },
  });
}

export function useUpdateProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductVariantDto }) =>
      InventoryService.updateProductVariant(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productVariant(id) });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'product-variants'] });
      showSuccess('Ürün varyantı güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Ürün varyantı güncellenemedi');
    },
  });
}

export function useDeleteProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.deleteProductVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'product-variants'] });
      showSuccess('Ürün varyantı silindi');
    },
    onError: (error) => {
      showApiError(error, 'Ürün varyantı silinemedi');
    },
  });
}

// =====================================
// PRODUCT BUNDLES HOOKS
// =====================================

export function useProductBundles(
  includeInactive: boolean = false,
  validOnly: boolean = false
) {
  return useQuery({
    queryKey: [...inventoryKeys.productBundles, { includeInactive, validOnly }],
    queryFn: () => InventoryService.getProductBundles(includeInactive, validOnly),
    staleTime: 30000,
  });
}

export function useProductBundle(id: number) {
  return useQuery({
    queryKey: inventoryKeys.productBundle(id),
    queryFn: () => InventoryService.getProductBundle(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateProductBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductBundleDto) => InventoryService.createProductBundle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productBundles });
      showSuccess('Ürün paketi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Ürün paketi oluşturulamadı');
    },
  });
}

export function useUpdateProductBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductBundleDto }) =>
      InventoryService.updateProductBundle(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productBundle(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productBundles });
      showSuccess('Ürün paketi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Ürün paketi güncellenemedi');
    },
  });
}

export function useDeleteProductBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.deleteProductBundle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productBundles });
      showSuccess('Ürün paketi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Ürün paketi silinemedi');
    },
  });
}

export function useAddProductBundleItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bundleId, data }: { bundleId: number; data: CreateProductBundleItemDto }) =>
      InventoryService.addProductBundleItem(bundleId, data),
    onSuccess: (_, { bundleId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productBundle(bundleId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productBundles });
      showSuccess('Paket ürünü eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Paket ürünü eklenemedi');
    },
  });
}

export function useUpdateProductBundleItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bundleId,
      itemId,
      data,
    }: {
      bundleId: number;
      itemId: number;
      data: UpdateProductBundleItemDto;
    }) => InventoryService.updateProductBundleItem(bundleId, itemId, data),
    onSuccess: (_, { bundleId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productBundle(bundleId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productBundles });
      showSuccess('Paket ürünü güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Paket ürünü güncellenemedi');
    },
  });
}

export function useRemoveProductBundleItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bundleId, itemId }: { bundleId: number; itemId: number }) =>
      InventoryService.removeProductBundleItem(bundleId, itemId),
    onSuccess: (_, { bundleId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productBundle(bundleId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productBundles });
      showSuccess('Paket ürünü kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'Paket ürünü kaldırılamadı');
    },
  });
}

// =====================================
// ANALYTICS HOOKS
// =====================================

/**
 * Get inventory dashboard data with KPIs, breakdowns, trends, and alerts
 */
export function useInventoryDashboard(warehouseId?: number, days: number = 30) {
  return useQuery({
    queryKey: inventoryKeys.analyticsDashboard(warehouseId, days),
    queryFn: () => InventoryService.getInventoryDashboard(warehouseId, days),
    staleTime: 60000, // 1 minute cache
    refetchInterval: 300000, // Auto-refresh every 5 minutes
  });
}

/**
 * Get stock valuation report
 */
export function useStockValuation(
  warehouseId?: number,
  categoryId?: number,
  asOfDate?: string
) {
  return useQuery({
    queryKey: inventoryKeys.analyticsValuation(warehouseId, categoryId, asOfDate),
    queryFn: () => InventoryService.getStockValuation(warehouseId, categoryId, asOfDate),
    staleTime: 120000, // 2 minute cache
  });
}

/**
 * Get inventory KPIs report for a specific period
 */
export function useInventoryKPIs(
  startDate: string,
  endDate: string,
  warehouseId?: number
) {
  return useQuery({
    queryKey: inventoryKeys.analyticsKPIs(startDate, endDate, warehouseId),
    queryFn: () => InventoryService.getInventoryKPIs(startDate, endDate, warehouseId),
    staleTime: 120000, // 2 minute cache
    enabled: !!startDate && !!endDate,
  });
}

// =====================================
// BARCODE HOOKS
// =====================================

/**
 * Get supported barcode formats
 */
export function useBarcodeFormats() {
  return useQuery({
    queryKey: inventoryKeys.barcodeFormats,
    queryFn: () => InventoryService.getBarcodeFormats(),
    staleTime: Infinity, // Static data, never stale
  });
}

/**
 * Get label size presets
 */
export function useLabelSizes() {
  return useQuery({
    queryKey: inventoryKeys.labelSizes,
    queryFn: () => InventoryService.getLabelSizes(),
    staleTime: Infinity, // Static data, never stale
  });
}

/**
 * Lookup product by barcode
 */
export function useBarcodeLookup(
  barcode: string,
  includeStock: boolean = true,
  warehouseId?: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: inventoryKeys.barcodeLookup(barcode, warehouseId),
    queryFn: () => InventoryService.lookupBarcode(barcode, includeStock, warehouseId),
    enabled: enabled && !!barcode && barcode.length > 0,
    staleTime: 5000, // 5 seconds cache
    retry: false, // Don't retry on 404
  });
}

/**
 * Generate barcode mutation
 */
export function useGenerateBarcode() {
  return useMutation({
    mutationFn: (request: GenerateBarcodeRequest) => InventoryService.generateBarcode(request),
    onError: (error) => {
      showApiError(error, 'Barkod oluşturulamadı');
    },
  });
}

/**
 * Generate product label mutation
 */
export function useGenerateProductLabel() {
  return useMutation({
    mutationFn: (request: GenerateProductLabelRequest) => InventoryService.generateProductLabel(request),
    onError: (error) => {
      showApiError(error, 'Ürün etiketi oluşturulamadı');
    },
  });
}

/**
 * Generate bulk labels mutation
 */
export function useGenerateBulkLabels() {
  return useMutation({
    mutationFn: (request: BulkLabelGenerationRequest) => InventoryService.generateBulkLabels(request),
    onSuccess: (data) => {
      showSuccess(`${data.totalLabels} etiket oluşturuldu`);
    },
    onError: (error) => {
      showApiError(error, 'Toplu etiket oluşturulamadı');
    },
  });
}

/**
 * Download bulk labels as ZIP mutation
 */
export function useDownloadBulkLabels() {
  return useMutation({
    mutationFn: (request: BulkLabelGenerationRequest) => InventoryService.downloadBulkLabels(request),
    onError: (error) => {
      showApiError(error, 'Etiketler indirilemedi');
    },
  });
}

/**
 * Auto-generate barcode for product mutation
 */
export function useAutoGenerateBarcode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AutoGenerateBarcodeRequest) => InventoryService.autoGenerateBarcode(request),
    onSuccess: (data) => {
      if (data.productUpdated) {
        queryClient.invalidateQueries({ queryKey: inventoryKeys.products });
        queryClient.invalidateQueries({ queryKey: inventoryKeys.product(data.productId) });
        showSuccess(`Barkod oluşturuldu ve ürüne kaydedildi: ${data.generatedBarcode}`);
      } else {
        showSuccess(`Barkod oluşturuldu: ${data.generatedBarcode}`);
      }
    },
    onError: (error) => {
      showApiError(error, 'Barkod oluşturulamadı');
    },
  });
}

/**
 * Validate barcode mutation
 */
export function useValidateBarcode() {
  return useMutation({
    mutationFn: ({ barcode, format }: { barcode: string; format?: BarcodeFormat }) =>
      InventoryService.validateBarcode(barcode, format),
  });
}

/**
 * Check barcode uniqueness mutation
 */
export function useCheckBarcodeUnique() {
  return useMutation({
    mutationFn: ({ barcode, excludeProductId }: { barcode: string; excludeProductId?: number }) =>
      InventoryService.checkBarcodeUnique(barcode, excludeProductId),
  });
}

// =====================================
// AUDIT TRAIL HOOKS
// =====================================

/**
 * Get paginated audit logs with filtering
 */
export function useAuditLogs(filter?: InventoryAuditFilterDto) {
  return useQuery({
    queryKey: inventoryKeys.auditLogs(filter),
    queryFn: () => InventoryService.getAuditLogs(filter),
    staleTime: 30000,
  });
}

/**
 * Get audit dashboard with summaries and trends
 */
export function useAuditDashboard(days: number = 30) {
  return useQuery({
    queryKey: inventoryKeys.auditDashboard(days),
    queryFn: () => InventoryService.getAuditDashboard(days),
    staleTime: 60000,
  });
}

/**
 * Get complete history for a specific entity
 */
export function useEntityHistory(entityType: string, entityId: string) {
  return useQuery({
    queryKey: inventoryKeys.entityHistory(entityType, entityId),
    queryFn: () => InventoryService.getEntityHistory(entityType, entityId),
    enabled: !!entityType && !!entityId,
    staleTime: 30000,
  });
}

/**
 * Get a specific audit log entry by ID
 */
export function useAuditLogById(id: string) {
  return useQuery({
    queryKey: inventoryKeys.auditLogById(id),
    queryFn: () => InventoryService.getAuditLogById(id),
    enabled: !!id,
    staleTime: 60000,
  });
}

/**
 * Get supported entity types with labels
 */
export function useAuditEntityTypes() {
  return useQuery({
    queryKey: inventoryKeys.auditEntityTypes,
    queryFn: () => InventoryService.getAuditEntityTypes(),
    staleTime: 300000, // 5 minutes - static data
  });
}

/**
 * Get supported action types with labels
 */
export function useAuditActionTypes() {
  return useQuery({
    queryKey: inventoryKeys.auditActionTypes,
    queryFn: () => InventoryService.getAuditActionTypes(),
    staleTime: 300000, // 5 minutes - static data
  });
}

// =====================================
// STOCK FORECASTING HOOKS
// =====================================

/**
 * Get demand forecast for a single product
 */
export function useProductForecast(
  productId: number,
  warehouseId?: number,
  forecastDays: number = 30,
  method?: ForecastingMethod
) {
  return useQuery({
    queryKey: inventoryKeys.productForecast(productId, warehouseId, forecastDays, method),
    queryFn: () => InventoryService.getProductForecast(productId, warehouseId, forecastDays, method),
    enabled: productId > 0,
    staleTime: 60000,
  });
}

/**
 * Get forecasts for multiple products
 */
export function useProductForecasts(filter?: StockForecastFilterDto) {
  return useQuery({
    queryKey: inventoryKeys.productForecasts(filter),
    queryFn: () => InventoryService.getProductForecasts(filter),
    staleTime: 60000,
  });
}

/**
 * Get aggregate forecast summary with risk analysis
 */
export function useForecastSummary(filter?: StockForecastFilterDto) {
  return useQuery({
    queryKey: inventoryKeys.forecastSummary(filter),
    queryFn: () => InventoryService.getForecastSummary(filter),
    staleTime: 60000,
  });
}

/**
 * Get products at risk of stockout
 */
export function useStockoutRiskProducts(riskDays: number = 7, warehouseId?: number) {
  return useQuery({
    queryKey: inventoryKeys.stockoutRisk(riskDays, warehouseId),
    queryFn: () => InventoryService.getStockoutRiskProducts(riskDays, warehouseId),
    staleTime: 60000,
  });
}

/**
 * Analyze historical demand patterns for a product
 */
export function useDemandAnalysis(productId: number, warehouseId?: number, analysisDays: number = 90) {
  return useQuery({
    queryKey: inventoryKeys.demandAnalysis(productId, warehouseId, analysisDays),
    queryFn: () => InventoryService.getDemandAnalysis(productId, warehouseId, analysisDays),
    enabled: productId > 0,
    staleTime: 60000,
  });
}

/**
 * Get seasonal patterns for a product
 */
export function useSeasonalPatterns(productId: number) {
  return useQuery({
    queryKey: inventoryKeys.seasonalPatterns(productId),
    queryFn: () => InventoryService.getSeasonalPatterns(productId),
    enabled: productId > 0,
    staleTime: 300000,
  });
}

/**
 * Get ABC classification for products
 */
export function useAbcClassification(categoryId?: number, analysisDays: number = 365) {
  return useQuery({
    queryKey: inventoryKeys.abcClassification(categoryId, analysisDays),
    queryFn: () => InventoryService.getAbcClassification(categoryId, analysisDays),
    staleTime: 300000,
  });
}

/**
 * Calculate recommended safety stock levels
 */
export function useSafetyStockCalculation(productId: number, serviceLevel: number = 0.95) {
  return useQuery({
    queryKey: inventoryKeys.safetyStock(productId, serviceLevel),
    queryFn: () => InventoryService.getSafetyStockCalculation(productId, serviceLevel),
    enabled: productId > 0,
    staleTime: 60000,
  });
}

/**
 * Get stock optimization recommendations for a product
 */
export function useStockOptimization(productId: number) {
  return useQuery({
    queryKey: inventoryKeys.stockOptimization(productId),
    queryFn: () => InventoryService.getStockOptimization(productId),
    enabled: productId > 0,
    staleTime: 60000,
  });
}

/**
 * Get bulk stock optimization recommendations
 */
export function useBulkStockOptimizations(categoryId?: number, warehouseId?: number) {
  return useQuery({
    queryKey: inventoryKeys.bulkStockOptimizations(categoryId, warehouseId),
    queryFn: () => InventoryService.getBulkStockOptimizations(categoryId, warehouseId),
    staleTime: 60000,
  });
}

// =====================================
// REORDER RULES HOOKS
// =====================================

/**
 * Get all reorder rules
 */
export function useReorderRules(
  productId?: number,
  categoryId?: number,
  warehouseId?: number,
  status?: ReorderRuleStatus
) {
  return useQuery({
    queryKey: inventoryKeys.reorderRules(productId, categoryId, warehouseId, status),
    queryFn: () => InventoryService.getReorderRules(productId, categoryId, warehouseId, status),
    staleTime: 60000,
  });
}

/**
 * Get a specific reorder rule by ID
 */
export function useReorderRule(id: number) {
  return useQuery({
    queryKey: inventoryKeys.reorderRule(id),
    queryFn: () => InventoryService.getReorderRuleById(id),
    enabled: id > 0,
    staleTime: 60000,
  });
}

/**
 * Create a new reorder rule
 */
export function useCreateReorderRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateReorderRuleDto) => InventoryService.createReorderRule(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.forecasting });
      showSuccess('Yeniden sipariş kuralı başarıyla oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Yeniden sipariş kuralı oluşturulurken hata oluştu');
    },
  });
}

/**
 * Update an existing reorder rule
 */
export function useUpdateReorderRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CreateReorderRuleDto }) =>
      InventoryService.updateReorderRule(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.reorderRule(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.forecasting });
      showSuccess('Yeniden sipariş kuralı başarıyla güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Yeniden sipariş kuralı güncellenirken hata oluştu');
    },
  });
}

/**
 * Delete a reorder rule
 */
export function useDeleteReorderRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.deleteReorderRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.forecasting });
      showSuccess('Yeniden sipariş kuralı başarıyla silindi');
    },
    onError: (error) => {
      showApiError(error, 'Yeniden sipariş kuralı silinirken hata oluştu');
    },
  });
}

/**
 * Activate a reorder rule
 */
export function useActivateReorderRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.activateReorderRule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.reorderRule(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.forecasting });
      showSuccess('Yeniden sipariş kuralı aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Kural aktifleştirilirken hata oluştu');
    },
  });
}

/**
 * Pause a reorder rule
 */
export function usePauseReorderRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.pauseReorderRule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.reorderRule(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.forecasting });
      showSuccess('Yeniden sipariş kuralı duraklatıldı');
    },
    onError: (error) => {
      showApiError(error, 'Kural duraklatılırken hata oluştu');
    },
  });
}

/**
 * Disable a reorder rule
 */
export function useDisableReorderRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.disableReorderRule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.reorderRule(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.forecasting });
      showSuccess('Yeniden sipariş kuralı devre dışı bırakıldı');
    },
    onError: (error) => {
      showApiError(error, 'Kural devre dışı bırakılırken hata oluştu');
    },
  });
}

/**
 * Execute a reorder rule manually
 */
export function useExecuteReorderRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => InventoryService.executeReorderRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.forecasting });
      showSuccess('Yeniden sipariş kuralı çalıştırıldı, öneriler oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Kural çalıştırılırken hata oluştu');
    },
  });
}

// =====================================
// REORDER SUGGESTIONS HOOKS
// =====================================

/**
 * Get paginated reorder suggestions
 */
export function useReorderSuggestions(filter?: ReorderSuggestionFilterDto) {
  return useQuery({
    queryKey: inventoryKeys.reorderSuggestions(filter),
    queryFn: () => InventoryService.getReorderSuggestions(filter),
    staleTime: 30000,
  });
}

/**
 * Get a specific reorder suggestion by ID
 */
export function useReorderSuggestion(id: number) {
  return useQuery({
    queryKey: inventoryKeys.reorderSuggestion(id),
    queryFn: () => InventoryService.getReorderSuggestionById(id),
    enabled: id > 0,
    staleTime: 30000,
  });
}

/**
 * Generate new reorder suggestions
 */
export function useGenerateReorderSuggestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, warehouseId }: { categoryId?: number; warehouseId?: number }) =>
      InventoryService.generateReorderSuggestions(categoryId, warehouseId),
    onSuccess: (suggestions) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.forecasting });
      showSuccess(`${suggestions.length} yeniden sipariş önerisi oluşturuldu`);
    },
    onError: (error) => {
      showApiError(error, 'Öneriler oluşturulurken hata oluştu');
    },
  });
}

/**
 * Process a reorder suggestion (approve/reject)
 */
export function useProcessReorderSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ProcessReorderSuggestionDto }) =>
      InventoryService.processReorderSuggestion(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.reorderSuggestion(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.forecasting });
      const statusText = variables.dto.newStatus === 'Approved' ? 'onaylandı' : 'reddedildi';
      showSuccess(`Yeniden sipariş önerisi ${statusText}`);
    },
    onError: (error) => {
      showApiError(error, 'Öneri işlenirken hata oluştu');
    },
  });
}

/**
 * Bulk process reorder suggestions
 */
export function useBulkProcessReorderSuggestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, dto }: { ids: number[]; dto: ProcessReorderSuggestionDto }) =>
      InventoryService.bulkProcessReorderSuggestions(ids, dto),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.forecasting });
      showSuccess(`${result.processedCount} öneri başarıyla işlendi`);
    },
    onError: (error) => {
      showApiError(error, 'Öneriler toplu işlenirken hata oluştu');
    },
  });
}

/**
 * Expire old pending suggestions
 */
export function useExpireOldSuggestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (daysOld: number = 7) => InventoryService.expireOldSuggestions(daysOld),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.forecasting });
      showSuccess(`${result.expiredCount} eski öneri süresi doldu olarak işaretlendi`);
    },
    onError: (error) => {
      showApiError(error, 'Eski öneriler işlenirken hata oluştu');
    },
  });
}

// =====================================
// INVENTORY COSTING HOOKS (FIFO/LIFO/WAC)
// =====================================

/**
 * Get paginated cost layers with filtering
 */
export function useCostLayers(filter?: CostLayerFilterDto) {
  return useQuery({
    queryKey: inventoryKeys.costLayers(filter),
    queryFn: () => InventoryService.getCostLayers(filter),
    staleTime: 60000,
  });
}

/**
 * Get cost layers for a specific product
 */
export function useProductCostLayers(
  productId: number,
  warehouseId?: number,
  includeFullyConsumed: boolean = false
) {
  return useQuery({
    queryKey: inventoryKeys.productCostLayers(productId, warehouseId, includeFullyConsumed),
    queryFn: () => InventoryService.getProductCostLayers(productId, warehouseId, includeFullyConsumed),
    enabled: !!productId && productId > 0,
    staleTime: 60000,
  });
}

/**
 * Create a new cost layer
 */
export function useCreateCostLayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCostLayerDto) => InventoryService.createCostLayer(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.costing });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productCostLayers(variables.productId) });
      showSuccess('Maliyet katmanı oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Maliyet katmanı oluşturulamadı');
    },
  });
}

/**
 * Consume from cost layers
 */
export function useConsumeFromCostLayers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CostCalculationRequestDto) => InventoryService.consumeFromCostLayers(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.costing });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productCostLayers(variables.productId) });
      showSuccess('Maliyet katmanlarından tüketim yapıldı');
    },
    onError: (error) => {
      showApiError(error, 'Maliyet tüketimi başarısız');
    },
  });
}

/**
 * Get costing summary for a specific product
 */
export function useProductCostingSummary(productId: number, warehouseId?: number) {
  return useQuery({
    queryKey: inventoryKeys.productCostingSummary(productId, warehouseId),
    queryFn: () => InventoryService.getProductCostingSummary(productId, warehouseId),
    enabled: !!productId && productId > 0,
    staleTime: 60000,
  });
}

/**
 * Get costing summaries for multiple products
 */
export function useProductCostingSummaries(categoryId?: number, warehouseId?: number) {
  return useQuery({
    queryKey: inventoryKeys.productCostingSummaries(categoryId, warehouseId),
    queryFn: () => InventoryService.getProductCostingSummaries(categoryId, warehouseId),
    staleTime: 60000,
  });
}

/**
 * Calculate COGS for a quantity using specific method
 */
export function useCalculateCOGS() {
  return useMutation({
    mutationFn: (request: CostCalculationRequestDto) => InventoryService.calculateCOGS(request),
    onError: (error) => {
      showApiError(error, 'SMM hesaplanamadı');
    },
  });
}

/**
 * Compare costs across different methods
 */
export function useCostMethodComparison(productId: number, quantity: number, warehouseId?: number) {
  return useQuery({
    queryKey: inventoryKeys.costMethodComparison(productId, quantity, warehouseId),
    queryFn: () => InventoryService.compareCostMethods(productId, quantity, warehouseId),
    enabled: !!productId && productId > 0 && quantity > 0,
    staleTime: 60000,
  });
}

/**
 * Generate inventory valuation report
 */
export function useInventoryValuation(filter?: InventoryValuationFilterDto) {
  return useQuery({
    queryKey: inventoryKeys.inventoryValuation(filter),
    queryFn: () => InventoryService.getInventoryValuation(filter),
    staleTime: 60000,
  });
}

/**
 * Get total inventory value
 */
export function useTotalInventoryValue(method?: CostingMethod, warehouseId?: number) {
  return useQuery({
    queryKey: inventoryKeys.totalInventoryValue(method, warehouseId),
    queryFn: () => InventoryService.getTotalInventoryValue(method, warehouseId),
    staleTime: 60000,
  });
}

/**
 * Generate COGS report for a period
 */
export function useCOGSReport(filter: COGSReportFilterDto) {
  return useQuery({
    queryKey: inventoryKeys.cogsReport(filter),
    queryFn: () => InventoryService.getCOGSReport(filter),
    enabled: !!filter.startDate && !!filter.endDate,
    staleTime: 60000,
  });
}

/**
 * Set standard cost for a product
 */
export function useSetStandardCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, dto }: { productId: number; dto: SetStandardCostDto }) =>
      InventoryService.setStandardCost(productId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.costing });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productCostingSummary(variables.productId) });
      showSuccess('Standart maliyet güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Standart maliyet güncellenemedi');
    },
  });
}

/**
 * Get cost variance analysis
 */
export function useCostVarianceAnalysis(categoryId?: number) {
  return useQuery({
    queryKey: inventoryKeys.costVarianceAnalysis(categoryId),
    queryFn: () => InventoryService.getCostVarianceAnalysis(categoryId),
    staleTime: 60000,
  });
}

/**
 * Adjust cost for inventory
 */
export function useAdjustCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CostAdjustmentDto) => InventoryService.adjustCost(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.costing });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productCostLayers(variables.productId) });
      showSuccess('Maliyet düzeltmesi yapıldı');
    },
    onError: (error) => {
      showApiError(error, 'Maliyet düzeltmesi başarısız');
    },
  });
}

/**
 * Recalculate weighted average cost for a product
 */
export function useRecalculateWAC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, warehouseId }: { productId: number; warehouseId?: number }) =>
      InventoryService.recalculateWAC(productId, warehouseId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.costing });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productCostingSummary(result.productId) });
      showSuccess(`Ağırlıklı ortalama maliyet yeniden hesaplandı: ${result.weightedAverageCost.toFixed(2)} ${result.currency}`);
    },
    onError: (error) => {
      showApiError(error, 'AOM yeniden hesaplanamadı');
    },
  });
}

/**
 * Get current costing method for a product
 */
export function useProductCostingMethod(productId: number) {
  return useQuery({
    queryKey: inventoryKeys.productCostingMethod(productId),
    queryFn: () => InventoryService.getProductCostingMethod(productId),
    enabled: !!productId && productId > 0,
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Set costing method for a product
 */
export function useSetProductCostingMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, method }: { productId: number; method: CostingMethod }) =>
      InventoryService.setProductCostingMethod(productId, method),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.productCostingMethod(variables.productId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.costing });
      showSuccess('Maliyetlendirme yöntemi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Maliyetlendirme yöntemi güncellenemedi');
    },
  });
}

/**
 * Get supported costing methods
 */
export function useCostingMethods() {
  return useQuery({
    queryKey: inventoryKeys.costingMethods,
    queryFn: () => InventoryService.getCostingMethods(),
    staleTime: Infinity, // Static data
  });
}

// =====================================
// EXCEL EXPORT/IMPORT HOOKS
// =====================================

/**
 * Helper function to download a blob as file
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export products to Excel
 */
export function useExportProductsToExcel() {
  return useMutation({
    mutationFn: (productIds?: number[]) => InventoryService.exportProductsToExcel(productIds),
    onSuccess: (blob) => {
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `urunler_${timestamp}.xlsx`);
      showSuccess('Ürünler Excel dosyası olarak indirildi');
    },
    onError: (error) => {
      showApiError(error, 'Ürünler dışa aktarılamadı');
    },
  });
}

/**
 * Export stock data to Excel
 */
export function useExportStockToExcel() {
  return useMutation({
    mutationFn: ({ warehouseId, includeZeroStock }: { warehouseId?: number; includeZeroStock?: boolean }) =>
      InventoryService.exportStockToExcel(warehouseId, includeZeroStock),
    onSuccess: (blob) => {
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `stok_${timestamp}.xlsx`);
      showSuccess('Stok bilgileri Excel dosyası olarak indirildi');
    },
    onError: (error) => {
      showApiError(error, 'Stok bilgileri dışa aktarılamadı');
    },
  });
}

/**
 * Export stock summary to Excel
 */
export function useExportStockSummaryToExcel() {
  return useMutation({
    mutationFn: () => InventoryService.exportStockSummaryToExcel(),
    onSuccess: (blob) => {
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `stok_ozet_${timestamp}.xlsx`);
      showSuccess('Stok özeti Excel dosyası olarak indirildi');
    },
    onError: (error) => {
      showApiError(error, 'Stok özeti dışa aktarılamadı');
    },
  });
}

/**
 * Get product import template
 */
export function useGetProductImportTemplate() {
  return useMutation({
    mutationFn: () => InventoryService.getProductImportTemplate(),
    onSuccess: (blob) => {
      downloadBlob(blob, 'urun_import_sablonu.xlsx');
      showSuccess('Ürün içe aktarma şablonu indirildi');
    },
    onError: (error) => {
      showApiError(error, 'Şablon indirilemedi');
    },
  });
}

/**
 * Get stock adjustment template
 */
export function useGetStockAdjustmentTemplate() {
  return useMutation({
    mutationFn: () => InventoryService.getStockAdjustmentTemplate(),
    onSuccess: (blob) => {
      downloadBlob(blob, 'stok_ayarlama_sablonu.xlsx');
      showSuccess('Stok ayarlama şablonu indirildi');
    },
    onError: (error) => {
      showApiError(error, 'Şablon indirilemedi');
    },
  });
}

/**
 * Import products from Excel
 */
export function useImportProductsFromExcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, updateExisting }: { file: File; updateExisting?: boolean }) =>
      InventoryService.importProductsFromExcel(file, updateExisting),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products });
      if (result.success) {
        showSuccess(`${result.successCount} ürün başarıyla içe aktarıldı`);
      } else {
        showError(`İçe aktarma tamamlandı: ${result.successCount} başarılı, ${result.errorCount} hata`);
      }
    },
    onError: (error) => {
      showApiError(error, 'Ürünler içe aktarılamadı');
    },
  });
}

/**
 * Import stock adjustments from Excel
 */
export function useImportStockAdjustmentsFromExcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => InventoryService.importStockAdjustmentsFromExcel(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stock() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockMovements });
      if (result.success) {
        showSuccess(`${result.successCount} stok ayarlaması başarıyla içe aktarıldı`);
      } else {
        showError(`İçe aktarma tamamlandı: ${result.successCount} başarılı, ${result.errorCount} hata`);
      }
    },
    onError: (error) => {
      showApiError(error, 'Stok ayarlamaları içe aktarılamadı');
    },
  });
}

/**
 * Validate Excel import file
 */
export function useValidateExcelImport() {
  return useMutation({
    mutationFn: ({ file, importType }: { file: File; importType: 'Products' | 'StockAdjustments' }) =>
      InventoryService.validateExcelImport(file, importType),
    onError: (error) => {
      showApiError(error, 'Dosya doğrulanamadı');
    },
  });
}

// =====================================
// INVENTORY ANALYSIS HOOKS (ABC/XYZ)
// =====================================

/**
 * Get ABC/XYZ Analysis Summary
 * Provides comprehensive inventory classification analysis
 */
export function useAbcXyzAnalysis(filter?: AbcXyzAnalysisFilterDto, enabled: boolean = true) {
  return useQuery({
    queryKey: inventoryKeys.abcXyzAnalysis(filter),
    queryFn: () => InventoryService.getAbcXyzAnalysis(filter),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - analysis data doesn't change frequently
  });
}

/**
 * Get ABC/XYZ classification for a single product
 */
export function useProductAbcXyzClassification(
  productId: number,
  analysisPeriodDays: number = 365,
  warehouseId?: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: inventoryKeys.productAbcXyzClassification(productId, analysisPeriodDays, warehouseId),
    queryFn: () => InventoryService.getProductAbcXyzClassification(productId, analysisPeriodDays, warehouseId),
    enabled: enabled && !!productId && productId > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get inventory turnover analysis
 * Calculates how quickly inventory is sold and replaced
 */
export function useInventoryTurnoverAnalysis(filter?: InventoryTurnoverFilterDto, enabled: boolean = true) {
  return useQuery({
    queryKey: inventoryKeys.inventoryTurnover(filter),
    queryFn: () => InventoryService.getInventoryTurnoverAnalysis(filter),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get dead stock analysis
 * Identifies products that haven't sold in a specified period
 */
export function useDeadStockAnalysis(filter?: DeadStockFilterDto, enabled: boolean = true) {
  return useQuery({
    queryKey: inventoryKeys.deadStock(filter),
    queryFn: () => InventoryService.getDeadStockAnalysis(filter),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get service level analysis
 * Measures ability to fulfill customer orders from available inventory
 */
export function useServiceLevelAnalysis(filter?: ServiceLevelFilterDto, enabled: boolean = true) {
  return useQuery({
    queryKey: inventoryKeys.serviceLevel(filter),
    queryFn: () => InventoryService.getServiceLevelAnalysis(filter),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get inventory health score
 * Comprehensive health indicator combining multiple inventory metrics
 */
export function useInventoryHealthScore(filter?: InventoryHealthScoreFilterDto, enabled: boolean = true) {
  return useQuery({
    queryKey: inventoryKeys.inventoryHealthScore(filter),
    queryFn: () => InventoryService.getInventoryHealthScore(filter),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
