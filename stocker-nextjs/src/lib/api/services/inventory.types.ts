// =====================================
// Inventory Module - TypeScript Type Definitions
// Aligned with Backend .NET DTOs
// =====================================

export type DateTime = string; // ISO 8601 format

// =====================================
// ENUMS
// =====================================

export enum ProductType {
  Raw = 'Raw',
  SemiFinished = 'SemiFinished',
  Finished = 'Finished',
  Service = 'Service',
  Consumable = 'Consumable',
  FixedAsset = 'FixedAsset'
}

export enum StockMovementType {
  Purchase = 'Purchase',
  Sales = 'Sales',
  PurchaseReturn = 'PurchaseReturn',
  SalesReturn = 'SalesReturn',
  Transfer = 'Transfer',
  Production = 'Production',
  Consumption = 'Consumption',
  AdjustmentIncrease = 'AdjustmentIncrease',
  AdjustmentDecrease = 'AdjustmentDecrease',
  Opening = 'Opening',
  Counting = 'Counting',
  Damage = 'Damage',
  Loss = 'Loss',
  Found = 'Found'
}

export enum ReservationStatus {
  Active = 'Active',
  PartiallyFulfilled = 'PartiallyFulfilled',
  Fulfilled = 'Fulfilled',
  Cancelled = 'Cancelled',
  Expired = 'Expired'
}

export enum ReservationType {
  SalesOrder = 'SalesOrder',
  Transfer = 'Transfer',
  Production = 'Production',
  Project = 'Project',
  Manual = 'Manual',
  Assembly = 'Assembly',
  Service = 'Service'
}

export enum TransferType {
  Standard = 'Standard',
  Urgent = 'Urgent',
  Replenishment = 'Replenishment',
  Return = 'Return',
  Internal = 'Internal',
  CrossDock = 'CrossDock',
  Consolidation = 'Consolidation'
}

export enum TransferStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  InTransit = 'InTransit',
  Received = 'Received',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  PartiallyReceived = 'PartiallyReceived'
}

export enum StockCountType {
  Full = 'Full',
  Cycle = 'Cycle',
  Spot = 'Spot',
  Annual = 'Annual',
  Category = 'Category',
  Location = 'Location',
  ABC = 'ABC',
  Perpetual = 'Perpetual'
}

export enum StockCountStatus {
  Draft = 'Draft',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Adjusted = 'Adjusted',
  Cancelled = 'Cancelled'
}

export enum SerialNumberStatus {
  Available = 'Available',
  InStock = 'InStock',
  Reserved = 'Reserved',
  Sold = 'Sold',
  Returned = 'Returned',
  Defective = 'Defective',
  InRepair = 'InRepair',
  Scrapped = 'Scrapped',
  Lost = 'Lost',
  OnLoan = 'OnLoan',
  InTransit = 'InTransit'
}

// =====================================
// PRODUCT
// =====================================

export interface ProductAttributeDto {
  id: number;
  attributeName: string;
  value: string;
}

export interface ProductImageDto {
  id: number;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  barcode?: string;
  sku?: string;
  categoryId: number;
  categoryName?: string;
  brandId?: number;
  brandName?: string;
  unitId: number;
  unitName?: string;
  productType: ProductType;
  unitPrice?: number;
  unitPriceCurrency?: string;
  costPrice?: number;
  costPriceCurrency?: string;
  weight?: number;
  weightUnit?: string;
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: string;
  minStockLevel: number;
  maxStockLevel: number;
  reorderLevel: number;
  reorderQuantity: number;
  leadTimeDays: number;
  trackSerialNumbers: boolean;
  trackLotNumbers: boolean;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt?: DateTime;
  totalStockQuantity: number;
  availableStockQuantity: number;
  attributes: ProductAttributeDto[];
  images: ProductImageDto[];
}

export interface CreateProductDto {
  code: string;
  name: string;
  description?: string;
  barcode?: string;
  sku?: string;
  categoryId: number;
  brandId?: number;
  unitId: number;
  productType?: ProductType;
  unitPrice?: number;
  unitPriceCurrency?: string;
  costPrice?: number;
  costPriceCurrency?: string;
  weight?: number;
  weightUnit?: string;
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: string;
  minStockLevel: number;
  maxStockLevel: number;
  reorderLevel: number;
  reorderQuantity: number;
  leadTimeDays: number;
  trackSerialNumbers: boolean;
  trackLotNumbers: boolean;
}

export interface UpdateProductDto {
  name: string;
  description?: string;
  barcode?: string;
  sku?: string;
  categoryId: number;
  brandId?: number;
  unitId: number;
  productType: ProductType;
  unitPrice?: number;
  unitPriceCurrency?: string;
  costPrice?: number;
  costPriceCurrency?: string;
  weight?: number;
  weightUnit?: string;
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: string;
  minStockLevel: number;
  maxStockLevel: number;
  reorderLevel: number;
  reorderQuantity: number;
  leadTimeDays: number;
  trackSerialNumbers: boolean;
  trackLotNumbers: boolean;
}

export interface ProductListDto {
  id: number;
  code: string;
  name: string;
  barcode?: string;
  categoryName?: string;
  brandName?: string;
  unitPrice?: number;
  totalStockQuantity: number;
  isActive: boolean;
}

// =====================================
// CATEGORY
// =====================================

export interface CategoryDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  parentCategoryId?: number;
  parentCategoryName?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt?: DateTime;
  productCount: number;
  subCategories: CategoryDto[];
}

export interface CreateCategoryDto {
  code: string;
  name: string;
  description?: string;
  parentCategoryId?: number;
  displayOrder: number;
}

export interface UpdateCategoryDto {
  name: string;
  description?: string;
  parentCategoryId?: number;
  displayOrder: number;
}

export interface CategoryTreeDto {
  id: number;
  code: string;
  name: string;
  level: number;
  hasChildren: boolean;
  children: CategoryTreeDto[];
}

// =====================================
// BRAND
// =====================================

export interface BrandDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt?: DateTime;
  productCount: number;
}

export interface CreateBrandDto {
  code: string;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
}

export interface UpdateBrandDto {
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
}

export interface BrandListDto {
  id: number;
  code: string;
  name: string;
  logoUrl?: string;
  isActive: boolean;
  productCount: number;
}

// =====================================
// UNIT
// =====================================

export interface UnitDto {
  id: number;
  code: string;
  name: string;
  symbol?: string;
  baseUnitId?: number;
  baseUnitName?: string;
  conversionFactor: number;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt?: DateTime;
  derivedUnits: UnitDto[];
}

export interface CreateUnitDto {
  code: string;
  name: string;
  symbol?: string;
  baseUnitId?: number;
  conversionFactor?: number;
}

export interface UpdateUnitDto {
  name: string;
  symbol?: string;
  baseUnitId?: number;
  conversionFactor: number;
}

export interface UnitListDto {
  id: number;
  code: string;
  name: string;
  symbol?: string;
  isBaseUnit: boolean;
  isActive: boolean;
}

export interface UnitConversionDto {
  fromUnitId: number;
  fromUnitName: string;
  toUnitId: number;
  toUnitName: string;
  conversionFactor: number;
}

// =====================================
// WAREHOUSE
// =====================================

export interface WarehouseDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  branchId?: number;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  manager?: string;
  totalArea: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: DateTime;
  updatedAt?: DateTime;
  locationCount: number;
  productCount: number;
  totalStockValue: number;
  locations: LocationDto[];
}

export interface CreateWarehouseDto {
  code: string;
  name: string;
  description?: string;
  branchId?: number;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  manager?: string;
  totalArea: number;
  isDefault: boolean;
}

export interface UpdateWarehouseDto {
  name: string;
  description?: string;
  branchId?: number;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  manager?: string;
  totalArea: number;
}

export interface WarehouseListDto {
  id: number;
  code: string;
  name: string;
  city?: string;
  isActive: boolean;
  isDefault: boolean;
  locationCount: number;
}

// =====================================
// LOCATION
// =====================================

export interface LocationDto {
  id: number;
  warehouseId: number;
  warehouseName?: string;
  code: string;
  name: string;
  description?: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
  capacity: number;
  usedCapacity: number;
  availableCapacity: number;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt?: DateTime;
  productCount: number;
}

export interface CreateLocationDto {
  warehouseId: number;
  code: string;
  name: string;
  description?: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
  capacity: number;
}

export interface UpdateLocationDto {
  name: string;
  description?: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
  capacity: number;
}

export interface LocationListDto {
  id: number;
  code: string;
  name: string;
  warehouseName?: string;
  fullPath: string;
  capacityUsagePercent: number;
  isActive: boolean;
}

// =====================================
// STOCK
// =====================================

export interface StockDto {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  locationId?: number;
  locationName?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  serialNumber?: string;
  lotNumber?: string;
  expiryDate?: DateTime;
  lastMovementDate: DateTime;
  lastCountDate: DateTime;
}

export interface StockAdjustmentDto {
  productId: number;
  warehouseId: number;
  locationId?: number;
  newQuantity: number;
  reason?: string;
  notes?: string;
}

export interface StockMoveDto {
  productId: number;
  sourceWarehouseId: number;
  sourceLocationId?: number;
  destinationWarehouseId: number;
  destinationLocationId?: number;
  quantity: number;
  notes?: string;
}

export interface StockSummaryDto {
  productId: number;
  productCode: string;
  productName: string;
  totalQuantity: number;
  totalReserved: number;
  totalAvailable: number;
  minStockLevel: number;
  reorderLevel: number;
  isBelowMinimum: boolean;
  needsReorder: boolean;
  warehouseCount: number;
}

export interface WarehouseStockSummaryDto {
  warehouseId: number;
  warehouseName: string;
  totalProducts: number;
  totalQuantity: number;
  totalReserved: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface LocationStockDto {
  locationId: number;
  locationCode: string;
  locationName: string;
  fullPath: string;
  productCount: number;
  totalQuantity: number;
  capacityUsed: number;
}

export interface ExpiringStockDto {
  stockId: number;
  productId: number;
  productCode: string;
  productName: string;
  warehouseName: string;
  locationName?: string;
  lotNumber?: string;
  quantity: number;
  expiryDate: DateTime;
  daysUntilExpiry: number;
}

export interface LowStockAlertDto {
  productId: number;
  productCode: string;
  productName: string;
  currentQuantity: number;
  minStockLevel: number;
  reorderLevel: number;
  reorderQuantity: number;
  shortage: number;
}

// =====================================
// SUPPLIER
// =====================================

export interface SupplierDto {
  id: number;
  code: string;
  name: string;
  taxNumber?: string;
  taxOffice?: string;
  email?: string;
  phone?: string;
  fax?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  paymentTermDays?: number;
  creditLimit: number;
  isPreferred: boolean;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt?: DateTime;
  productCount: number;
  products: SupplierProductDto[];
}

export interface CreateSupplierDto {
  code: string;
  name: string;
  taxNumber?: string;
  taxOffice?: string;
  email?: string;
  phone?: string;
  fax?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  paymentTermDays?: number;
  creditLimit: number;
  isPreferred: boolean;
}

export interface UpdateSupplierDto {
  name: string;
  taxNumber?: string;
  taxOffice?: string;
  email?: string;
  phone?: string;
  fax?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  paymentTermDays?: number;
  creditLimit: number;
  isPreferred: boolean;
}

export interface SupplierListDto {
  id: number;
  code: string;
  name: string;
  phone?: string;
  city?: string;
  isPreferred: boolean;
  isActive: boolean;
  productCount: number;
}

export interface SupplierProductDto {
  id: number;
  supplierId: number;
  productId: number;
  productCode: string;
  productName: string;
  supplierProductCode?: string;
  unitCost: number;
  currency: string;
  minimumOrderQuantity: number;
  leadTimeDays: number;
  isPreferred: boolean;
  isActive: boolean;
}

export interface CreateSupplierProductDto {
  supplierId: number;
  productId: number;
  supplierProductCode?: string;
  unitCost: number;
  currency?: string;
  minimumOrderQuantity?: number;
  leadTimeDays: number;
  isPreferred: boolean;
}

// =====================================
// STOCK MOVEMENT
// =====================================

export interface StockMovementDto {
  id: number;
  documentNumber: string;
  movementDate: DateTime;
  productId: number;
  productCode: string;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  fromLocationId?: number;
  fromLocationName?: string;
  toLocationId?: number;
  toLocationName?: string;
  movementType: StockMovementType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  referenceDocumentType?: string;
  referenceDocumentNumber?: string;
  referenceDocumentId?: number;
  serialNumber?: string;
  lotNumber?: string;
  description?: string;
  userId: number;
  isReversed: boolean;
  reversedMovementId?: number;
  createdAt: DateTime;
}

export interface CreateStockMovementDto {
  documentNumber: string;
  movementDate: DateTime;
  productId: number;
  warehouseId: number;
  fromLocationId?: number;
  toLocationId?: number;
  movementType: StockMovementType;
  quantity: number;
  unitCost: number;
  referenceDocumentType?: string;
  referenceDocumentNumber?: string;
  referenceDocumentId?: number;
  serialNumber?: string;
  lotNumber?: string;
  description?: string;
  userId: number;
}

export interface StockMovementListDto {
  id: number;
  documentNumber: string;
  productCode: string;
  productName: string;
  warehouseName: string;
  movementType: StockMovementType;
  quantity: number;
  movementDate: DateTime;
}

export interface StockMovementFilterDto {
  productId?: number;
  warehouseId?: number;
  locationId?: number;
  movementType?: StockMovementType;
  fromDate?: DateTime;
  toDate?: DateTime;
  referenceDocumentType?: string;
  referenceDocumentNumber?: string;
  lotNumber?: string;
  serialNumber?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface StockMovementSummaryDto {
  totalMovements: number;
  totalInbound: number;
  totalOutbound: number;
  totalAdjustments: number;
  totalTransfers: number;
  netChange: number;
  periodStart: DateTime;
  periodEnd: DateTime;
}

// =====================================
// STOCK RESERVATION
// =====================================

export interface StockReservationDto {
  id: number;
  reservationNumber: string;
  productId: number;
  productCode: string;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  locationId?: number;
  locationName?: string;
  quantity: number;
  fulfilledQuantity: number;
  remainingQuantity: number;
  status: ReservationStatus;
  reservationType: ReservationType;
  referenceDocumentType?: string;
  referenceDocumentNumber?: string;
  referenceDocumentId?: string;
  reservationDate: DateTime;
  expirationDate?: DateTime;
  notes?: string;
  createdByUserId: number;
  createdAt: DateTime;
}

export interface CreateStockReservationDto {
  reservationNumber: string;
  productId: number;
  warehouseId: number;
  locationId?: number;
  quantity: number;
  reservationType: ReservationType;
  referenceDocumentType?: string;
  referenceDocumentNumber?: string;
  referenceDocumentId?: string;
  expirationDate?: DateTime;
  notes?: string;
  createdByUserId: number;
}

export interface FulfillReservationDto {
  reservationId: number;
  quantityToFulfill: number;
  notes?: string;
}

export interface StockReservationListDto {
  id: number;
  reservationNumber: string;
  productCode: string;
  productName: string;
  warehouseName: string;
  quantity: number;
  fulfilledQuantity: number;
  status: ReservationStatus;
  reservationDate: DateTime;
  expirationDate?: DateTime;
}

export interface StockReservationFilterDto {
  productId?: number;
  warehouseId?: number;
  status?: ReservationStatus;
  reservationType?: ReservationType;
  referenceDocumentType?: string;
  referenceDocumentId?: number;
  fromDate?: DateTime;
  toDate?: DateTime;
  expiringSoon?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// =====================================
// STOCK TRANSFER
// =====================================

export interface StockTransferItemDto {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  sourceLocationId?: number;
  sourceLocationName?: string;
  destinationLocationId?: number;
  destinationLocationName?: string;
  requestedQuantity: number;
  shippedQuantity: number;
  receivedQuantity: number;
  damagedQuantity: number;
  serialNumber?: string;
  lotNumber?: string;
  notes?: string;
}

export interface CreateStockTransferItemDto {
  productId: number;
  sourceLocationId?: number;
  destinationLocationId?: number;
  requestedQuantity: number;
  serialNumber?: string;
  lotNumber?: string;
  notes?: string;
}

export interface ReceiveTransferItemDto {
  itemId: number;
  receivedQuantity: number;
  damagedQuantity: number;
  notes?: string;
}

export interface StockTransferDto {
  id: number;
  transferNumber: string;
  transferDate: DateTime;
  sourceWarehouseId: number;
  sourceWarehouseName: string;
  destinationWarehouseId: number;
  destinationWarehouseName: string;
  status: TransferStatus;
  transferType: TransferType;
  description?: string;
  notes?: string;
  expectedArrivalDate?: DateTime;
  shippedDate?: DateTime;
  receivedDate?: DateTime;
  completedDate?: DateTime;
  cancelledDate?: DateTime;
  cancellationReason?: string;
  createdByUserId: number;
  approvedByUserId?: number;
  shippedByUserId?: number;
  receivedByUserId?: number;
  createdAt: DateTime;
  totalRequestedQuantity: number;
  totalShippedQuantity: number;
  totalReceivedQuantity: number;
  items: StockTransferItemDto[];
}

export interface CreateStockTransferDto {
  transferNumber: string;
  transferDate: DateTime;
  sourceWarehouseId: number;
  destinationWarehouseId: number;
  transferType: TransferType;
  description?: string;
  notes?: string;
  expectedArrivalDate?: DateTime;
  createdByUserId: number;
  items: CreateStockTransferItemDto[];
}

export interface UpdateStockTransferDto {
  description?: string;
  notes?: string;
  expectedArrivalDate?: DateTime;
}

export interface StockTransferListDto {
  id: number;
  transferNumber: string;
  transferDate: DateTime;
  sourceWarehouseName: string;
  destinationWarehouseName: string;
  status: TransferStatus;
  transferType: TransferType;
  itemCount: number;
  totalQuantity: number;
}

export interface StockTransferFilterDto {
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  status?: TransferStatus;
  transferType?: TransferType;
  fromDate?: DateTime;
  toDate?: DateTime;
  pageNumber?: number;
  pageSize?: number;
}

// =====================================
// STOCK COUNT
// =====================================

export interface StockCountItemDto {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  locationId?: number;
  locationName?: string;
  systemQuantity: number;
  countedQuantity?: number;
  difference?: number;
  hasDifference: boolean;
  serialNumber?: string;
  lotNumber?: string;
  notes?: string;
  isCounted: boolean;
}

export interface CreateStockCountItemDto {
  productId: number;
  systemQuantity: number;
  locationId?: number;
  serialNumber?: string;
  lotNumber?: string;
}

export interface RecordCountDto {
  itemId: number;
  countedQuantity: number;
  notes?: string;
}

export interface BatchRecordCountDto {
  stockCountId: number;
  items: RecordCountDto[];
}

export interface StockCountDto {
  id: number;
  countNumber: string;
  countDate: DateTime;
  warehouseId: number;
  warehouseName: string;
  locationId?: number;
  locationName?: string;
  status: StockCountStatus;
  countType: StockCountType;
  description?: string;
  notes?: string;
  autoAdjust: boolean;
  startedDate?: DateTime;
  completedDate?: DateTime;
  cancelledDate?: DateTime;
  cancellationReason?: string;
  createdByUserId: number;
  completedByUserId?: number;
  createdAt: DateTime;
  totalItems: number;
  countedItems: number;
  itemsWithDifferenceCount: number;
  totalSystemQuantity: number;
  totalCountedQuantity: number;
  totalDifference: number;
  items: StockCountItemDto[];
}

export interface CreateStockCountDto {
  countNumber: string;
  countDate: DateTime;
  warehouseId: number;
  locationId?: number;
  countType: StockCountType;
  description?: string;
  notes?: string;
  autoAdjust: boolean;
  createdByUserId: number;
  items: CreateStockCountItemDto[];
}

export interface UpdateStockCountDto {
  description?: string;
  notes?: string;
}

export interface StockCountListDto {
  id: number;
  countNumber: string;
  countDate: DateTime;
  warehouseName: string;
  locationName?: string;
  status: StockCountStatus;
  countType: StockCountType;
  totalItems: number;
  countedItems: number;
  itemsWithDifference: number;
}

export interface StockCountFilterDto {
  warehouseId?: number;
  locationId?: number;
  status?: StockCountStatus;
  countType?: StockCountType;
  fromDate?: DateTime;
  toDate?: DateTime;
  pageNumber?: number;
  pageSize?: number;
}

export interface StockCountSummaryDto {
  stockCountId: number;
  countNumber: string;
  warehouseName: string;
  totalItems: number;
  itemsWithNoChange: number;
  itemsWithPositiveDifference: number;
  itemsWithNegativeDifference: number;
  totalPositiveDifference: number;
  totalNegativeDifference: number;
  netDifference: number;
  estimatedValueImpact: number;
}

// =====================================
// PRICE LIST
// =====================================

export interface PriceListItemDto {
  id: number;
  priceListId: number;
  productId: number;
  productCode: string;
  productName: string;
  price: number;
  currency: string;
  minQuantity?: number;
  maxQuantity?: number;
  discountPercentage?: number;
  validFrom?: DateTime;
  validTo?: DateTime;
  isActive: boolean;
}

export interface CreatePriceListItemDto {
  productId: number;
  price: number;
  minQuantity?: number;
  maxQuantity?: number;
  discountPercentage?: number;
  validFrom?: DateTime;
  validTo?: DateTime;
}

export interface PriceListDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  currency: string;
  validFrom?: DateTime;
  validTo?: DateTime;
  isActive: boolean;
  isDefault: boolean;
  customerGroupId?: number;
  globalDiscountPercentage?: number;
  globalMarkupPercentage?: number;
  priority: number;
  isValid: boolean;
  createdAt: DateTime;
  updatedAt?: DateTime;
  itemCount: number;
  items: PriceListItemDto[];
}

export interface CreatePriceListDto {
  code: string;
  name: string;
  description?: string;
  currency?: string;
  validFrom?: DateTime;
  validTo?: DateTime;
  isDefault: boolean;
  customerGroupId?: number;
  globalDiscountPercentage?: number;
  globalMarkupPercentage?: number;
  priority: number;
}

export interface UpdatePriceListDto {
  name: string;
  description?: string;
  currency?: string;
  validFrom?: DateTime;
  validTo?: DateTime;
  customerGroupId?: number;
  globalDiscountPercentage?: number;
  globalMarkupPercentage?: number;
  priority: number;
}

export interface BulkPriceUpdateDto {
  priceListId: number;
  items: CreatePriceListItemDto[];
  replaceExisting?: boolean;
}

export interface PriceListListDto {
  id: number;
  code: string;
  name: string;
  currency: string;
  validFrom?: DateTime;
  validTo?: DateTime;
  isActive: boolean;
  isDefault: boolean;
  isValid: boolean;
  itemCount: number;
}

export interface ProductPriceDto {
  productId: number;
  productCode: string;
  productName: string;
  basePrice: number;
  listPrice?: number;
  priceListName?: string;
  discountPercentage?: number;
  finalPrice: number;
  currency: string;
}

// =====================================
// FILTERS & PAGINATION
// =====================================

export interface ProductFilterDto {
  search?: string;
  categoryId?: number;
  brandId?: number;
  productType?: ProductType;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  lowStock?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface WarehouseFilterDto {
  search?: string;
  city?: string;
  isActive?: boolean;
  isDefault?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface SupplierFilterDto {
  search?: string;
  city?: string;
  isActive?: boolean;
  isPreferred?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface StockFilterDto {
  productId?: number;
  warehouseId?: number;
  locationId?: number;
  lowStock?: boolean;
  outOfStock?: boolean;
  expiringSoon?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// =====================================
// PAGINATED RESPONSE
// =====================================

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
