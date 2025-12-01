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
} from '../services/inventory.types';

// =====================================
// QUERY KEYS
// =====================================

export const inventoryKeys = {
  // Products
  products: ['inventory', 'products'] as const,
  product: (id: number) => ['inventory', 'products', id] as const,
  productsLowStock: (warehouseId?: number) => ['inventory', 'products', 'low-stock', warehouseId] as const,

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
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products });
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
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categories });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categoryTree });
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
      queryClient.invalidateQueries({ queryKey: inventoryKeys.brands });
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
      queryClient.invalidateQueries({ queryKey: inventoryKeys.units });
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
