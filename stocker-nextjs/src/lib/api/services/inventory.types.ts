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

export enum ImageType {
  Primary = 1,
  Gallery = 2,
  Thumbnail = 3,
  Technical = 4,
  Packaging = 5
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

export enum LotBatchStatus {
  Pending = 'Pending',
  Received = 'Received',
  Approved = 'Approved',
  Quarantined = 'Quarantined',
  Rejected = 'Rejected',
  Exhausted = 'Exhausted',
  Expired = 'Expired',
  Recalled = 'Recalled'
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
  unitSymbol?: string;
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

// Initial stock entry for product creation
export interface InitialStockEntryDto {
  warehouseId: number;
  locationId?: number;
  quantity: number;
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
  initialStock?: InitialStockEntryDto[];
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
  sku?: string;
  categoryName?: string;
  brandName?: string;
  unitName?: string;
  productType: ProductType;
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
  globalDiscountPercentage?: number;
  globalMarkupPercentage?: number;
  priority: number;
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

// =====================================
// SERIAL NUMBERS
// =====================================

export interface SerialNumberListDto {
  id: number;
  serial: string;
  productId: number;
  productCode: string;
  productName: string;
  warehouseName?: string;
  status: SerialNumberStatus;
  isUnderWarranty: boolean;
  remainingWarrantyDays?: number;
}

export interface SerialNumberDto {
  id: number;
  serial: string;
  productId: number;
  productCode: string;
  productName: string;
  warehouseId?: number;
  warehouseName?: string;
  locationId?: number;
  locationName?: string;
  status: SerialNumberStatus;
  manufacturedDate?: DateTime;
  receivedDate?: DateTime;
  soldDate?: DateTime;
  warrantyStartDate?: DateTime;
  warrantyEndDate?: DateTime;
  customerId?: string;
  salesOrderId?: string;
  purchaseOrderId?: string;
  notes?: string;
  batchNumber?: string;
  supplierSerial?: string;
  isUnderWarranty: boolean;
  remainingWarrantyDays?: number;
  createdAt: DateTime;
}

export interface CreateSerialNumberDto {
  serial: string;
  productId: number;
  warehouseId?: number;
  locationId?: number;
  manufacturedDate?: DateTime;
  batchNumber?: string;
  supplierSerial?: string;
  notes?: string;
}

export interface SerialNumberFilterDto {
  productId?: number;
  warehouseId?: number;
  status?: SerialNumberStatus;
  underWarrantyOnly?: boolean;
}

export interface ReceiveSerialNumberRequest {
  purchaseOrderId?: string;
}

export interface ReserveSerialNumberRequest {
  salesOrderId: string;
}

export interface SellSerialNumberRequest {
  customerId: string;
  salesOrderId: string;
  warrantyMonths?: number;
}

export interface ReasonRequest {
  reason?: string;
}

// =====================================
// LOT BATCHES
// =====================================

export interface LotBatchListDto {
  id: number;
  lotNumber: string;
  productId: number;
  productCode: string;
  productName: string;
  status: LotBatchStatus;
  expiryDate?: DateTime;
  currentQuantity: number;
  availableQuantity: number;
  isQuarantined: boolean;
  isExpired: boolean;
  daysUntilExpiry?: number;
}

export interface LotBatchDto {
  id: number;
  lotNumber: string;
  productId: number;
  productCode: string;
  productName: string;
  supplierId?: number;
  supplierName?: string;
  status: LotBatchStatus;
  manufacturedDate?: DateTime;
  expiryDate?: DateTime;
  receivedDate?: DateTime;
  initialQuantity: number;
  currentQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  supplierLotNumber?: string;
  certificateNumber?: string;
  notes?: string;
  isQuarantined: boolean;
  quarantinedDate?: DateTime;
  quarantineReason?: string;
  inspectedDate?: DateTime;
  inspectionNotes?: string;
  isExpired: boolean;
  daysUntilExpiry?: number;
  remainingShelfLifePercentage?: number;
  createdAt: DateTime;
}

export interface CreateLotBatchDto {
  lotNumber: string;
  productId: number;
  initialQuantity: number;
  supplierId?: number;
  supplierLotNumber?: string;
  manufacturedDate?: DateTime;
  expiryDate?: DateTime;
  certificateNumber?: string;
  notes?: string;
}

export interface LotBatchFilterDto {
  productId?: number;
  status?: LotBatchStatus;
  expiredOnly?: boolean;
  expiringWithinDays?: number;
}

export interface QuarantineRequest {
  reason: string;
}

// =====================================
// PRODUCT ATTRIBUTES (EAV System)
// =====================================

export enum AttributeType {
  Text = 'Text',
  Number = 'Number',
  Boolean = 'Boolean',
  Date = 'Date',
  Select = 'Select',
  MultiSelect = 'MultiSelect',
  Color = 'Color',
  Size = 'Size'
}

/**
 * Backend: ProductAttributeOptionDto (ProductAttributeDto.cs:32-42)
 * Synchronized with C# DTO
 */
export interface ProductAttributeOptionDto {
  id: number;
  productAttributeId: number;
  value: string;
  label: string; // Added: C# has Label field
  displayOrder: number;
  colorCode?: string;
  imageUrl?: string;
  isActive: boolean;
  // Note: isDefault removed - not in C# DTO
}

export interface ProductAttributeDetailDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  attributeType: AttributeType;
  isRequired: boolean;
  isFilterable: boolean;
  isVisible: boolean;
  displayOrder: number;
  isActive: boolean;
  groupName?: string;
  validationPattern?: string;
  minValue?: number;
  maxValue?: number;
  defaultValue?: string;
  createdAt: DateTime;
  updatedAt?: DateTime;
  options: ProductAttributeOptionDto[];
}

export interface CreateProductAttributeDto {
  code: string;
  name: string;
  description?: string;
  attributeType: AttributeType;
  isRequired?: boolean;
  isFilterable?: boolean;
  isSearchable?: boolean;
  showInList?: boolean;
  displayOrder?: number;
  defaultValue?: string;
  validationPattern?: string;
  options?: CreateProductAttributeOptionDto[];
}

export interface UpdateProductAttributeDto {
  name: string;
  description?: string;
  isRequired: boolean;
  isFilterable: boolean;
  isVisible: boolean;
  displayOrder: number;
  groupName?: string;
  validationPattern?: string;
  minValue?: number;
  maxValue?: number;
  defaultValue?: string;
}

export interface CreateProductAttributeOptionDto {
  value: string;
  label: string;
  colorCode?: string;
  imageUrl?: string;
  displayOrder?: number;
}

export interface UpdateProductAttributeOptionDto {
  value: string;
  label: string;
  colorCode?: string;
  imageUrl?: string;
  displayOrder: number;
}

export interface ProductAttributeValueDto {
  id: number;
  productId: number;
  productAttributeId: number;
  attributeCode: string;
  attributeName: string;
  attributeType: AttributeType;
  value: string;
  optionId?: number;
}

// =====================================
// PRODUCT VARIANTS
// =====================================

/**
 * Backend: ProductVariantOptionDto (ProductVariantDto.cs:39-49)
 * Synchronized with C# DTO
 */
export interface ProductVariantOptionDto {
  id: number;
  productVariantId: number;
  productAttributeId: number;
  attributeCode: string;
  attributeName: string;
  productAttributeOptionId?: number;
  value: string;
  displayOrder: number; // Added: C# has DisplayOrder
}

/**
 * Backend: ProductVariantDto (ProductVariantDto.cs:6-34)
 * Synchronized with C# DTO
 */
export interface ProductVariantDto {
  id: number;
  productId: number;
  productName: string; // C#: required field
  sku: string;
  barcode?: string;
  variantName: string; // C#: VariantName (renamed from 'name')
  price?: number;
  priceCurrency?: string;
  costPrice?: number;
  costPriceCurrency?: string;
  compareAtPrice?: number; // Added from C#
  compareAtPriceCurrency?: string; // Added from C#
  weight?: number;
  weightUnit?: string; // Added from C#
  dimensions?: string; // Added from C#
  imageUrl?: string;
  isDefault: boolean;
  isActive: boolean;
  trackInventory: boolean; // Added from C#
  allowBackorder: boolean; // Added from C#
  lowStockThreshold: number; // Added from C#
  displayOrder: number; // Added from C#
  createdAt: DateTime;
  updatedAt?: DateTime;
  options: ProductVariantOptionDto[];
  totalStock: number; // C#: TotalStock (renamed from 'stockQuantity')
}

export interface CreateProductVariantDto {
  productId: number;
  sku: string;
  barcode?: string;
  variantName: string;
  price?: number;
  priceCurrency?: string;
  costPrice?: number;
  costPriceCurrency?: string;
  compareAtPrice?: number;
  compareAtPriceCurrency?: string;
  weight?: number;
  weightUnit?: string;
  dimensions?: string;
  imageUrl?: string;
  isDefault?: boolean;
  trackInventory?: boolean;
  allowBackorder?: boolean;
  lowStockThreshold?: number;
  displayOrder?: number;
  options?: CreateProductVariantOptionDto[];
}

export interface UpdateProductVariantDto {
  sku: string;
  barcode?: string;
  name: string;
  price?: number;
  priceCurrency?: string;
  costPrice?: number;
  costPriceCurrency?: string;
  weight?: number;
  imageUrl?: string;
  isDefault: boolean;
}

export interface CreateProductVariantOptionDto {
  productAttributeId: number;
  productAttributeOptionId?: number;
  value: string;
  displayOrder?: number;
}

// =====================================
// PRODUCT BUNDLES
// =====================================

export enum BundleType {
  Fixed = 'Fixed',
  Configurable = 'Configurable',
  Kit = 'Kit',
  Package = 'Package',
  Combo = 'Combo'
}

export enum BundlePricingType {
  FixedPrice = 'FixedPrice',
  DynamicSum = 'DynamicSum',
  DiscountedSum = 'DiscountedSum',
  PercentageDiscount = 'PercentageDiscount'
}

export interface ProductBundleItemDto {
  id: number;
  productBundleId: number;
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  isRequired: boolean;
  isDefault: boolean;
  overridePrice?: number;
  overridePriceCurrency?: string;
  discountPercentage?: number;
  displayOrder: number;
  minQuantity?: number;
  maxQuantity?: number;
  productPrice?: number;
  productPriceCurrency?: string;
}

export interface ProductBundleDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  bundleType: BundleType;
  pricingType: BundlePricingType;
  fixedPrice?: number;
  fixedPriceCurrency?: string;
  discountPercentage?: number;
  discountAmount?: number;
  requireAllItems: boolean;
  minSelectableItems?: number;
  maxSelectableItems?: number;
  validFrom?: DateTime;
  validTo?: DateTime;
  isActive: boolean;
  imageUrl?: string;
  displayOrder: number;
  isValid: boolean;
  createdAt: DateTime;
  updatedAt?: DateTime;
  items: ProductBundleItemDto[];
  calculatedPrice: number;
}

export interface CreateProductBundleDto {
  code: string;
  name: string;
  description?: string;
  bundleType: BundleType;
  pricingType: BundlePricingType;
  fixedPrice?: number;
  fixedPriceCurrency?: string;
  discountPercentage?: number;
  discountAmount?: number;
  requireAllItems?: boolean;
  minSelectableItems?: number;
  maxSelectableItems?: number;
  validFrom?: DateTime;
  validTo?: DateTime;
  imageUrl?: string;
  displayOrder?: number;
  items?: CreateProductBundleItemDto[];
}

export interface UpdateProductBundleDto {
  name: string;
  description?: string;
  pricingType: BundlePricingType;
  fixedPrice?: number;
  fixedPriceCurrency?: string;
  discountPercentage?: number;
  discountAmount?: number;
  requireAllItems: boolean;
  minSelectableItems?: number;
  maxSelectableItems?: number;
  validFrom?: DateTime;
  validTo?: DateTime;
  imageUrl?: string;
  displayOrder: number;
}

export interface CreateProductBundleItemDto {
  productId: number;
  quantity: number;
  isRequired?: boolean;
  isDefault?: boolean;
  overridePrice?: number;
  overridePriceCurrency?: string;
  discountPercentage?: number;
  displayOrder?: number;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface UpdateProductBundleItemDto {
  quantity: number;
  isRequired: boolean;
  isDefault: boolean;
  overridePrice?: number;
  overridePriceCurrency?: string;
  discountPercentage?: number;
  displayOrder: number;
  minQuantity?: number;
  maxQuantity?: number;
}

// =====================================
// INVENTORY ANALYTICS
// =====================================

export interface InventoryKPIDto {
  totalProducts: number;
  activeProducts: number;
  totalStockValue: number;
  totalStockQuantity: number;
  lowStockProductsCount: number;
  outOfStockProductsCount: number;
  expiringStockCount: number;
  activeReservationsCount: number;
  pendingTransfersCount: number;
  activeStockCountsCount: number;
}

export interface StockBreakdownByCategoryDto {
  categoryId: number;
  categoryName: string;
  productCount: number;
  totalQuantity: number;
  stockValue: number;
}

export interface StockBreakdownByWarehouseDto {
  warehouseId: number;
  warehouseName: string;
  productCount: number;
  totalQuantity: number;
  stockValue: number;
  utilizationPercentage: number;
}

export interface StockBreakdownByStatusDto {
  status: string;
  productCount: number;
  totalQuantity: number;
  stockValue: number;
}

export interface MovementTrendDto {
  date: DateTime;
  inbound: number;
  outbound: number;
  netChange: number;
  inboundValue: number;
  outboundValue: number;
}

export interface TopProductByValueDto {
  productId: number;
  productCode: string;
  productName: string;
  totalQuantity: number;
  unitPrice: number;
  totalValue: number;
  categoryName?: string;
}

export interface InventoryAlertDto {
  alertType: string;
  severity: string;
  message: string;
  productId?: number;
  productName?: string;
  warehouseId?: number;
  warehouseName?: string;
  currentValue?: number;
  thresholdValue?: number;
  createdAt: DateTime;
}

export interface InventoryDashboardDto {
  kpis: InventoryKPIDto;
  byCategory: StockBreakdownByCategoryDto[];
  byWarehouse: StockBreakdownByWarehouseDto[];
  byStatus: StockBreakdownByStatusDto[];
  movementTrend: MovementTrendDto[];
  topProductsByValue: TopProductByValueDto[];
  alerts: InventoryAlertDto[];
  lastUpdated: DateTime;
}

// Stock Valuation Report
export interface ValuationSummaryDto {
  averageUnitCost: number;
  highestValueProduct: number;
  lowestValueProduct: number;
  medianProductValue: number;
  valueChangePercent: number;
}

export interface ProductValuationDto {
  productId: number;
  productCode: string;
  productName: string;
  sku?: string;
  categoryName?: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  percentageOfTotal: number;
}

export interface CategoryValuationDto {
  categoryId: number;
  categoryName: string;
  productCount: number;
  totalQuantity: number;
  totalValue: number;
  percentageOfTotal: number;
}

export interface WarehouseValuationDto {
  warehouseId: number;
  warehouseName: string;
  warehouseCode?: string;
  productCount: number;
  totalQuantity: number;
  totalValue: number;
  percentageOfTotal: number;
}

export interface StockValuationDto {
  asOfDate: DateTime;
  totalValue: number;
  totalQuantity: number;
  totalProducts: number;
  totalSKUs: number;
  currency: string;
  summary: ValuationSummaryDto;
  products: ProductValuationDto[];
  byCategory: CategoryValuationDto[];
  byWarehouse: WarehouseValuationDto[];
}

// Inventory KPIs Report
export interface KPIComparisonDto {
  turnoverChange: number;
  stockValueChange: number;
  movementsChange: number;
  turnoverTrend: string;
  stockValueTrend: string;
  movementsTrend: string;
}

export interface TurnoverByCategoryDto {
  categoryId: number;
  categoryName: string;
  turnoverRatio: number;
  daysOfInventory: number;
  productCount: number;
}

export interface MonthlyKPIDto {
  year: number;
  month: number;
  monthName: string;
  turnoverRatio: number;
  stockValue: number;
  movementsCount: number;
}

export interface InventoryKPIsReportDto {
  startDate: DateTime;
  endDate: DateTime;
  inventoryTurnoverRatio: number;
  daysOfInventory: number;
  stockoutRate: number;
  fillRate: number;
  orderAccuracyRate: number;
  receivingEfficiency: number;
  grossMarginReturnOnInventory: number;
  carryingCostPercentage: number;
  shrinkageRate: number;
  deadStockPercentage: number;
  totalInboundMovements: number;
  totalOutboundMovements: number;
  totalInboundQuantity: number;
  totalOutboundQuantity: number;
  averageMovementsPerDay: number;
  comparison: KPIComparisonDto;
  turnoverByCategory: TurnoverByCategoryDto[];
  monthlyTrend: MonthlyKPIDto[];
}

// =====================================
// BARCODE / QR CODE
// =====================================

export enum BarcodeFormat {
  EAN13 = 'EAN13',
  EAN8 = 'EAN8',
  UPC_A = 'UPC_A',
  UPC_E = 'UPC_E',
  Code128 = 'Code128',
  Code39 = 'Code39',
  QRCode = 'QRCode',
  DataMatrix = 'DataMatrix',
  PDF417 = 'PDF417',
  ITF14 = 'ITF14'
}

export enum LabelSize {
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
  Wide = 'Wide',
  Square = 'Square',
  Custom = 'Custom'
}

// Generate Barcode
export interface GenerateBarcodeRequest {
  content: string;
  format: BarcodeFormat;
  width?: number;
  height?: number;
  includeText?: boolean;
}

export interface GenerateBarcodeResponse {
  content: string;
  format: BarcodeFormat;
  imageBase64: string;
  imageUrl: string;
  contentType: string;
  width: number;
  height: number;
}

// Generate Product Label
export interface GenerateProductLabelRequest {
  productId: number;
  labelSize: LabelSize;
  barcodeFormat?: BarcodeFormat;
  includeProductName?: boolean;
  includePrice?: boolean;
  includeSKU?: boolean;
  includeQRCode?: boolean;
  customWidth?: number;
  customHeight?: number;
}

export interface GenerateProductLabelResponse {
  productId: number;
  productCode: string;
  productName: string;
  barcode?: string;
  price?: number;
  priceCurrency?: string;
  labelImageBase64: string;
  labelImageUrl: string;
  contentType: string;
  labelSize: LabelSize;
  width: number;
  height: number;
}

// Bulk Label Generation
export interface BulkLabelProductItem {
  productId: number;
  quantity: number;
}

export interface BulkLabelGenerationRequest {
  products: BulkLabelProductItem[];
  labelSize: LabelSize;
  barcodeFormat?: BarcodeFormat;
  includeProductName?: boolean;
  includePrice?: boolean;
}

export interface BulkLabelGenerationResponse {
  totalLabels: number;
  totalProducts: number;
  fileBase64: string;
  fileUrl: string;
  contentType: string;
  fileName: string;
}

// Barcode Lookup (Scan)
export interface BarcodeLookupRequest {
  barcode: string;
  includeStock?: boolean;
  warehouseId?: number;
}

export interface WarehouseStockInfo {
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
}

export interface ProductLookupResult {
  id: number;
  code: string;
  name: string;
  barcode?: string;
  sku?: string;
  categoryName?: string;
  unitPrice?: number;
  unitPriceCurrency?: string;
  unitName?: string;
  primaryImageUrl?: string;
  totalStockQuantity: number;
  availableStockQuantity: number;
  stockByWarehouse?: WarehouseStockInfo[];
}

export interface ProductVariantLookupResult {
  id: number;
  productId: number;
  productName: string;
  variantCode: string;
  barcode?: string;
  sku: string;
  variantName: string;
  unitPrice?: number;
  totalStockQuantity: number;
}

export interface SerialNumberLookupResult {
  id: number;
  serialNumber: string;
  productId: number;
  productName: string;
  status: string;
  warehouseId?: number;
  warehouseName?: string;
  receivedDate?: DateTime;
  soldDate?: DateTime;
}

export interface LotBatchLookupResult {
  id: number;
  lotNumber: string;
  productId: number;
  productName: string;
  status: string;
  quantity: number;
  availableQuantity: number;
  manufactureDate?: DateTime;
  expiryDate?: DateTime;
  daysUntilExpiry?: number;
}

export interface BarcodeLookupResponse {
  searchedBarcode: string;
  found: boolean;
  matchType?: 'Product' | 'ProductVariant' | 'SerialNumber' | 'LotBatch';
  product?: ProductLookupResult;
  variant?: ProductVariantLookupResult;
  serialNumber?: SerialNumberLookupResult;
  lotBatch?: LotBatchLookupResult;
}

// Auto Generate Barcode
export interface AutoGenerateBarcodeRequest {
  productId: number;
  format: BarcodeFormat;
  updateProduct?: boolean;
}

export interface AutoGenerateBarcodeResponse {
  productId: number;
  generatedBarcode: string;
  format: BarcodeFormat;
  productUpdated: boolean;
  validationMessage?: string;
}

// Barcode Validation
export interface BarcodeValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export interface BarcodeUniquenessResult {
  isUnique: boolean;
  conflictingProductCode?: string;
}

// Barcode Format Info
export interface BarcodeFormatInfo {
  value: string;
  label: string;
  description: string;
  isLinear: boolean;
}

export interface LabelSizeInfo {
  value: string;
  label: string;
  width: number;
  height: number;
}

// =====================================
// INVENTORY AUDIT TRAIL
// =====================================

// Entity types tracked for audit
export const InventoryEntityTypes = {
  Product: 'Product',
  Category: 'Category',
  Brand: 'Brand',
  Unit: 'Unit',
  Warehouse: 'Warehouse',
  Location: 'Location',
  Supplier: 'Supplier',
  Stock: 'Stock',
  StockMovement: 'StockMovement',
  StockReservation: 'StockReservation',
  StockTransfer: 'StockTransfer',
  StockCount: 'StockCount',
  PriceList: 'PriceList',
  SerialNumber: 'SerialNumber',
  LotBatch: 'LotBatch',
  ProductAttribute: 'ProductAttribute',
  ProductVariant: 'ProductVariant',
  ProductBundle: 'ProductBundle',
} as const;

export type InventoryEntityType = typeof InventoryEntityTypes[keyof typeof InventoryEntityTypes];

// Entity type labels (Turkish)
export const InventoryEntityTypeLabels: Record<InventoryEntityType, string> = {
  Product: 'Ürün',
  Category: 'Kategori',
  Brand: 'Marka',
  Unit: 'Birim',
  Warehouse: 'Depo',
  Location: 'Konum',
  Supplier: 'Tedarikçi',
  Stock: 'Stok',
  StockMovement: 'Stok Hareketi',
  StockReservation: 'Stok Rezervasyonu',
  StockTransfer: 'Stok Transferi',
  StockCount: 'Stok Sayımı',
  PriceList: 'Fiyat Listesi',
  SerialNumber: 'Seri Numarası',
  LotBatch: 'Parti/Lot',
  ProductAttribute: 'Ürün Özelliği',
  ProductVariant: 'Ürün Varyantı',
  ProductBundle: 'Ürün Paketi',
};

// Action types for audit
export const InventoryAuditActions = {
  Created: 'Created',
  Updated: 'Updated',
  Deleted: 'Deleted',
  Activated: 'Activated',
  Deactivated: 'Deactivated',
  StatusChanged: 'StatusChanged',
  QuantityAdjusted: 'QuantityAdjusted',
  PriceChanged: 'PriceChanged',
  Transferred: 'Transferred',
  Reserved: 'Reserved',
  Released: 'Released',
  Counted: 'Counted',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Received: 'Received',
  Shipped: 'Shipped',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
} as const;

export type InventoryAuditAction = typeof InventoryAuditActions[keyof typeof InventoryAuditActions];

// Action labels (Turkish)
export const InventoryAuditActionLabels: Record<InventoryAuditAction, string> = {
  Created: 'Oluşturuldu',
  Updated: 'Güncellendi',
  Deleted: 'Silindi',
  Activated: 'Aktifleştirildi',
  Deactivated: 'Deaktifleştirildi',
  StatusChanged: 'Durum Değişti',
  QuantityAdjusted: 'Miktar Ayarlandı',
  PriceChanged: 'Fiyat Değişti',
  Transferred: 'Transfer Edildi',
  Reserved: 'Rezerve Edildi',
  Released: 'Serbest Bırakıldı',
  Counted: 'Sayıldı',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Received: 'Teslim Alındı',
  Shipped: 'Gönderildi',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal Edildi',
};

// Filter for inventory audit logs
export interface InventoryAuditFilterDto {
  entityType?: string;
  entityId?: string;
  action?: string;
  userId?: number;
  fromDate?: DateTime;
  toDate?: DateTime;
  pageNumber?: number;
  pageSize?: number;
}

// Field change details
export interface FieldChangeDto {
  fieldName: string;
  fieldLabel: string;
  oldValue?: string;
  newValue?: string;
}

// Inventory audit log entry
export interface InventoryAuditLogDto {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  action: string;
  actionLabel: string;
  oldValues?: string;
  newValues?: string;
  changes?: FieldChangeDto[];
  userId: string;
  userName: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: DateTime;
  additionalData?: string;
}

// Summary of audit logs by entity type
export interface AuditSummaryByEntityDto {
  entityType: string;
  entityTypeLabel: string;
  totalCount: number;
  createdCount: number;
  updatedCount: number;
  deletedCount: number;
  lastActivityDate?: DateTime;
}

// Summary of audit logs by user
export interface AuditSummaryByUserDto {
  userId: string;
  userName: string;
  totalActions: number;
  lastActivityDate?: DateTime;
}

// Summary of audit activity by date
export interface AuditActivityByDateDto {
  date: DateTime;
  createdCount: number;
  updatedCount: number;
  deletedCount: number;
  totalCount: number;
}

// Overall audit dashboard
export interface InventoryAuditDashboardDto {
  totalAuditLogs: number;
  todayCount: number;
  thisWeekCount: number;
  thisMonthCount: number;
  byEntityType: AuditSummaryByEntityDto[];
  topUsers: AuditSummaryByUserDto[];
  activityTrend: AuditActivityByDateDto[];
  recentActivities: InventoryAuditLogDto[];
}

// Entity history - all changes for a specific entity
export interface EntityHistoryDto {
  entityType: string;
  entityId: string;
  entityName: string;
  createdAt: DateTime;
  createdBy: string;
  lastModifiedAt?: DateTime;
  lastModifiedBy?: string;
  totalChanges: number;
  changes: InventoryAuditLogDto[];
}

// Paginated response for audit logs
export interface PaginatedAuditLogsDto {
  items: InventoryAuditLogDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// =====================================
// STOCK FORECASTING & AUTO-REORDER
// =====================================

// Forecasting method types
export enum ForecastingMethod {
  SimpleMovingAverage = 'SimpleMovingAverage',
  WeightedMovingAverage = 'WeightedMovingAverage',
  ExponentialSmoothing = 'ExponentialSmoothing',
  LinearRegression = 'LinearRegression',
  SeasonalDecomposition = 'SeasonalDecomposition'
}

// Auto-reorder rule status
export enum ReorderRuleStatus {
  Active = 'Active',
  Paused = 'Paused',
  Disabled = 'Disabled'
}

// Reorder suggestion status
export enum ReorderSuggestionStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Ordered = 'Ordered',
  Expired = 'Expired'
}

// Filter for stock forecasting
export interface StockForecastFilterDto {
  productId?: number;
  categoryId?: number;
  warehouseId?: number;
  forecastDays?: number;
  method?: ForecastingMethod;
  includeSeasonality?: boolean;
  historicalDays?: number;
}

// Daily forecast data point
export interface DailyForecastDto {
  date: DateTime;
  forecastedDemand: number;
  lowerBound: number;
  upperBound: number;
  confidenceLevel: number;
}

// Product stock forecast
export interface ProductForecastDto {
  productId: number;
  productCode: string;
  productName: string;
  categoryName?: string;

  // Current Stock Status
  currentStock: number;
  availableStock: number;
  reservedStock: number;
  minStockLevel: number;
  reorderLevel: number;
  reorderQuantity: number;
  leadTimeDays: number;

  // Historical Analysis
  averageDailyDemand: number;
  demandStandardDeviation: number;
  seasonalityFactor: number;
  trendDirection: number; // Positive = increasing, Negative = decreasing

  // Forecast Results
  methodUsed: ForecastingMethod;
  forecastAccuracy: number; // MAPE (Mean Absolute Percentage Error)
  estimatedDaysUntilStockout: number;
  expectedStockoutDate?: DateTime;
  totalForecastedDemand: number;

  // Daily Forecasts
  dailyForecasts: DailyForecastDto[];

  // Recommendations
  needsReorder: boolean;
  suggestedReorderQuantity: number;
  suggestedOrderDate?: DateTime;
  reorderReason?: string;
}

// Aggregate forecast summary
export interface ForecastSummaryDto {
  generatedAt: DateTime;
  forecastPeriodDays: number;
  methodUsed: ForecastingMethod;

  // Overall Stats
  totalProductsAnalyzed: number;
  productsNeedingReorder: number;
  productsAtRisk: number; // Within lead time of stockout
  productsInStockout: number;

  // Value Projections
  totalForecastedDemandValue: number;
  totalSuggestedReorderValue: number;
  currency: string;

  // Risk Distribution
  highRiskProducts: number; // Days until stockout < lead time
  mediumRiskProducts: number; // Days until stockout < 2x lead time
  lowRiskProducts: number; // Days until stockout >= 2x lead time

  // Category Breakdown
  byCategory: CategoryForecastSummaryDto[];

  // Top Products to Reorder
  topReorderProducts: ProductForecastDto[];
}

// Category-level forecast summary
export interface CategoryForecastSummaryDto {
  categoryId: number;
  categoryName: string;
  productCount: number;
  productsNeedingReorder: number;
  totalForecastedDemand: number;
  totalSuggestedReorderValue: number;
}

// Auto-reorder rule configuration
export interface ReorderRuleDto {
  id: number;
  name: string;
  description?: string;

  // Scope
  productId?: number;
  productCode?: string;
  productName?: string;
  categoryId?: number;
  categoryName?: string;
  warehouseId?: number;
  warehouseName?: string;
  supplierId?: number;
  supplierName?: string;

  // Trigger Conditions
  triggerBelowQuantity?: number;
  triggerBelowDaysOfStock?: number;
  triggerOnForecast: boolean;
  forecastLeadTimeDays?: number;

  // Reorder Settings
  fixedReorderQuantity?: number;
  reorderUpToQuantity?: number; // Order up to this level
  useEconomicOrderQuantity: boolean;
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;
  roundToPackSize: boolean;
  packSize?: number;

  // Schedule
  isScheduled: boolean;
  cronExpression?: string; // e.g., "0 8 * * 1" for every Monday 8am
  nextScheduledRun?: DateTime;

  // Status
  status: ReorderRuleStatus;
  requiresApproval: boolean;
  approverUserId?: number;

  // Audit
  createdAt: DateTime;
  updatedAt?: DateTime;
  lastExecutedAt?: DateTime;
  executionCount: number;
}

// Create/Update reorder rule
export interface CreateReorderRuleDto {
  name: string;
  description?: string;

  // Scope
  productId?: number;
  categoryId?: number;
  warehouseId?: number;
  supplierId?: number;

  // Trigger Conditions
  triggerBelowQuantity?: number;
  triggerBelowDaysOfStock?: number;
  triggerOnForecast: boolean;
  forecastLeadTimeDays?: number;

  // Reorder Settings
  fixedReorderQuantity?: number;
  reorderUpToQuantity?: number;
  useEconomicOrderQuantity: boolean;
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;
  roundToPackSize: boolean;
  packSize?: number;

  // Schedule
  isScheduled: boolean;
  cronExpression?: string;

  // Settings
  requiresApproval: boolean;
  approverUserId?: number;
}

// Reorder suggestion generated by the system
export interface ReorderSuggestionDto {
  id: number;
  generatedAt: DateTime;

  // Product Info
  productId: number;
  productCode: string;
  productName: string;
  categoryName?: string;

  // Warehouse
  warehouseId?: number;
  warehouseName?: string;

  // Current Status
  currentStock: number;
  availableStock: number;
  minStockLevel: number;
  reorderLevel: number;

  // Suggestion Details
  suggestedQuantity: number;
  estimatedCost: number;
  currency: string;
  suggestedSupplierId?: number;
  suggestedSupplierName?: string;

  // Trigger Info
  triggeredByRuleId?: number;
  triggerReason?: string;
  estimatedDaysUntilStockout?: number;
  expectedStockoutDate?: DateTime;

  // Status
  status: ReorderSuggestionStatus;
  statusReason?: string;
  processedByUserId?: number;
  processedByUserName?: string;
  processedAt?: DateTime;
  purchaseOrderId?: number;
  purchaseOrderNumber?: string;

  // Validity
  expiresAt: DateTime;
  isExpired: boolean;
}

// Filter for reorder suggestions
export interface ReorderSuggestionFilterDto {
  productId?: number;
  categoryId?: number;
  warehouseId?: number;
  supplierId?: number;
  status?: ReorderSuggestionStatus;
  showExpired?: boolean;
  fromDate?: DateTime;
  toDate?: DateTime;
  pageNumber?: number;
  pageSize?: number;
}

// Paginated reorder suggestions response
export interface PaginatedReorderSuggestionsDto {
  items: ReorderSuggestionDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  // Summary
  pendingCount: number;
  approvedCount: number;
  totalPendingValue: number;
}

// Process reorder suggestion (approve/reject)
export interface ProcessReorderSuggestionDto {
  newStatus: ReorderSuggestionStatus;
  reason?: string;
  adjustedQuantity?: number;
  alternateSupplierId?: number;
}

// Safety stock calculation parameters
export interface SafetyStockCalculationDto {
  productId: number;
  productCode: string;
  productName: string;

  // Input Parameters
  averageDailyDemand: number;
  demandStandardDeviation: number;
  leadTimeDays: number;
  leadTimeVariationDays: number;
  serviceLevel: number; // e.g., 0.95 for 95%

  // Calculated Values
  currentSafetyStock: number;
  recommendedSafetyStock: number;
  recommendedReorderPoint: number;
  economicOrderQuantity: number;

  // Explanation
  calculationMethod: string;
  formula: string;
}

// Demand analysis result
export interface DemandAnalysisDto {
  productId: number;
  productCode: string;
  productName: string;
  analysisPeriodDays: number;

  // Demand Statistics
  totalDemand: number;
  averageDailyDemand: number;
  medianDailyDemand: number;
  maxDailyDemand: number;
  minDailyDemand: number;
  standardDeviation: number;
  coefficientOfVariation: number;

  // Trend Analysis
  trendDirection: string; // "Increasing", "Decreasing", "Stable"
  trendPercentage: number;

  // Seasonality
  hasSeasonality: boolean;
  seasonalPatterns?: SeasonalPatternDto[];

  // ABC Classification
  abcClass: string; // "A", "B", "C"
  revenueContribution: number;

  // Daily Breakdown
  dailyDemand: DailyDemandDto[];
}

// Seasonal pattern data
export interface SeasonalPatternDto {
  periodType: string; // "Weekly", "Monthly", "Quarterly"
  period: string; // "Monday", "January", "Q1"
  indexValue: number; // 1.0 = average, >1 = above average
  averageDemand: number;
}

// Daily demand data point
export interface DailyDemandDto {
  date: DateTime;
  demand: number;
  isOutlier: boolean;
}

// Stock optimization recommendations
export interface StockOptimizationDto {
  productId: number;
  productCode: string;
  productName: string;

  // Current Settings
  currentMinStock: number;
  currentMaxStock: number;
  currentReorderLevel: number;
  currentReorderQuantity: number;

  // Recommended Settings
  recommendedMinStock: number;
  recommendedMaxStock: number;
  recommendedReorderLevel: number;
  recommendedReorderQuantity: number;
  recommendedSafetyStock: number;

  // Impact Analysis
  currentAverageInventory: number;
  recommendedAverageInventory: number;
  inventoryReductionPercent: number;
  currentServiceLevel: number;
  recommendedServiceLevel: number;
  estimatedAnnualSavings: number;

  // Recommendations
  recommendations: string[];
}

// ABC Classification response
export interface AbcClassificationDto {
  A: number[];
  B: number[];
  C: number[];
}

// Bulk process request
export interface BulkProcessSuggestionsRequest {
  ids: number[];
  processDto: ProcessReorderSuggestionDto;
}

// =====================================
// INVENTORY COSTING TYPES
// (FIFO / LIFO / WAC)
// =====================================

// Costing method types
export enum CostingMethod {
  FIFO = 'FIFO',
  LIFO = 'LIFO',
  WeightedAverageCost = 'WeightedAverageCost',
  SpecificIdentification = 'SpecificIdentification',
  StandardCost = 'StandardCost'
}

// Cost layer for FIFO/LIFO tracking
export interface CostLayerDto {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  warehouseId?: number;
  warehouseName?: string;
  layerDate: DateTime;
  referenceNumber?: string;
  referenceType?: string;
  originalQuantity: number;
  remainingQuantity: number;
  unitCost: number;
  totalCost: number;
  currency: string;
  isFullyConsumed: boolean;
  layerOrder: number;
  createdAt: DateTime;
}

// Filter for cost layers
export interface CostLayerFilterDto {
  productId?: number;
  warehouseId?: number;
  includeFullyConsumed?: boolean;
  fromDate?: DateTime;
  toDate?: DateTime;
  pageNumber?: number;
  pageSize?: number;
}

// Paginated cost layers response
export interface PaginatedCostLayersDto {
  items: CostLayerDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalQuantity: number;
  totalValue: number;
  weightedAverageCost: number;
}

// Product costing summary
export interface ProductCostingSummaryDto {
  productId: number;
  productCode: string;
  productName: string;
  categoryName?: string;
  costingMethod: CostingMethod;
  totalQuantity: number;
  totalValue: number;
  weightedAverageCost: number;
  fifoUnitCost?: number;
  lifoUnitCost?: number;
  standardCost?: number;
  activeLayerCount: number;
  oldestLayerDate?: DateTime;
  newestLayerDate?: DateTime;
  currency: string;
  lastCalculatedAt?: DateTime;
}

// Cost calculation request
export interface CostCalculationRequestDto {
  productId: number;
  warehouseId?: number;
  quantity: number;
  method: CostingMethod;
}

// Cost calculation result
export interface CostCalculationResultDto {
  productId: number;
  productCode: string;
  productName: string;
  requestedQuantity: number;
  methodUsed: CostingMethod;
  totalCOGS: number;
  averageUnitCost: number;
  layersConsumed: CostLayerConsumptionDto[];
  remainingInventoryQuantity: number;
  remainingInventoryValue: number;
  currency: string;
  notes: string[];
}

// Cost layer consumption detail
export interface CostLayerConsumptionDto {
  layerId: number;
  layerDate: DateTime;
  referenceNumber?: string;
  unitCost: number;
  quantityConsumed: number;
  totalCost: number;
  remainingAfterConsumption: number;
}

// Create cost layer request
export interface CreateCostLayerDto {
  productId: number;
  warehouseId?: number;
  quantity: number;
  unitCost: number;
  referenceNumber?: string;
  referenceType?: string;
  layerDate?: DateTime;
}

// Cost comparison across methods
export interface CostMethodComparisonDto {
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  fifo: CostMethodResultDto;
  lifo: CostMethodResultDto;
  weightedAverage: CostMethodResultDto;
  standardCost?: CostMethodResultDto;
  cogsVariance: number;
  currency: string;
}

// Individual cost method result
export interface CostMethodResultDto {
  method: CostingMethod;
  totalCOGS: number;
  averageUnitCost: number;
  remainingInventoryValue: number;
  notes?: string;
}

// Inventory valuation report
export interface InventoryValuationReportDto {
  reportDate: DateTime;
  method: CostingMethod;
  currency: string;
  totalInventoryValue: number;
  totalQuantity: number;
  productCount: number;
  byCategory: CategoryValuationDto[];
  byWarehouse: WarehouseValuationDto[];
  products: ProductValuationDto[];
}

// Category valuation summary
export interface CategoryValuationDto {
  categoryId: number;
  categoryName: string;
  productCount: number;
  totalQuantity: number;
  totalValue: number;
  percentageOfTotal: number;
}

// Warehouse valuation summary
export interface WarehouseValuationDto {
  warehouseId: number;
  warehouseName: string;
  productCount: number;
  totalQuantity: number;
  totalValue: number;
  percentageOfTotal: number;
}

// Product valuation detail
export interface ProductValuationDto {
  productId: number;
  productCode: string;
  productName: string;
  categoryName?: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  layerCount: number;
}

// Cost adjustment request
export interface CostAdjustmentDto {
  productId: number;
  warehouseId?: number;
  newUnitCost: number;
  reason: string;
  applyToAllLayers: boolean;
  specificLayerId?: number;
}

// Standard cost setting
export interface SetStandardCostDto {
  productId: number;
  standardCost: number;
  effectiveFrom?: DateTime;
  reason?: string;
}

// Cost variance analysis
export interface CostVarianceAnalysisDto {
  productId: number;
  productCode: string;
  productName: string;
  standardCost: number;
  actualCost: number;
  varianceAmount: number;
  variancePercentage: number;
  varianceType: string; // "Favorable", "Unfavorable"
  totalQuantity: number;
  totalVarianceImpact: number;
  currency: string;
}

// COGS report for a period
export interface COGSReportDto {
  startDate: DateTime;
  endDate: DateTime;
  method: CostingMethod;
  currency: string;
  totalCOGS: number;
  totalQuantitySold: number;
  beginningInventoryValue: number;
  purchasesDuringPeriod: number;
  endingInventoryValue: number;
  calculatedCOGS: number;
  cogsVariance: number;
  byCategory: CategoryCOGSDto[];
  monthlyBreakdown: MonthlyCOGSDto[];
}

// Category COGS
export interface CategoryCOGSDto {
  categoryId: number;
  categoryName: string;
  cogs: number;
  quantitySold: number;
  percentageOfTotal: number;
}

// Monthly COGS breakdown
export interface MonthlyCOGSDto {
  year: number;
  month: number;
  monthName: string;
  cogs: number;
  quantitySold: number;
  averageUnitCost: number;
}

// Filter for inventory valuation
export interface InventoryValuationFilterDto {
  categoryId?: number;
  warehouseId?: number;
  method?: CostingMethod;
  asOfDate?: DateTime;
  includeZeroQuantity?: boolean;
}

// Filter for COGS report
export interface COGSReportFilterDto {
  startDate: DateTime;
  endDate: DateTime;
  categoryId?: number;
  warehouseId?: number;
  method?: CostingMethod;
}

// Request for setting costing method
export interface SetCostingMethodRequest {
  method: CostingMethod;
}

// Total inventory value response
export interface TotalInventoryValueResponse {
  totalValue: number;
  method: string;
  currency: string;
}

// Costing methods dictionary response
export type CostingMethodsResponse = Record<string, string>;

// =====================================
// EXCEL EXPORT/IMPORT TYPES
// =====================================

export interface ExcelImportErrorDto {
  rowNumber: number;
  column?: string;
  value?: string;
  errorMessage: string;
}

export interface ExcelImportResultDto {
  success: boolean;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  totalRows: number;
  errors: ExcelImportErrorDto[];
}

export interface ExcelValidationErrorDto {
  rowNumber: number;
  column?: string;
  value?: string;
  errorMessage: string;
}

export interface ExcelValidationResultDto {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  errorCount: number;
  errors: ExcelValidationErrorDto[];
}

export type ExcelImportType = 'Products' | 'StockAdjustments';

// =====================================
// INVENTORY ANALYSIS (ABC/XYZ Analysis)
// =====================================

export enum AbcClass {
  A = 'A',
  B = 'B',
  C = 'C',
}

export enum XyzClass {
  X = 'X',
  Y = 'Y',
  Z = 'Z',
}

export enum AbcXyzClass {
  AX = 'AX',
  AY = 'AY',
  AZ = 'AZ',
  BX = 'BX',
  BY = 'BY',
  BZ = 'BZ',
  CX = 'CX',
  CY = 'CY',
  CZ = 'CZ',
}

export interface AbcXyzAnalysisFilterDto {
  categoryId?: number;
  warehouseId?: number;
  brandId?: number;
  analysisPeriodDays?: number;
  includeInactiveProducts?: boolean;
  abcAThreshold?: number;
  abcBThreshold?: number;
  xyzXThreshold?: number;
  xyzYThreshold?: number;
}

export interface ProductAbcXyzDto {
  productId: number;
  productCode: string;
  productName: string;
  categoryName?: string;
  brandName?: string;
  totalRevenue: number;
  totalQuantitySold: number;
  averageUnitPrice: number;
  revenuePercentage: number;
  cumulativeRevenuePercentage: number;
  averageDailyDemand: number;
  demandStandardDeviation: number;
  coefficientOfVariation: number;
  daysWithDemand: number;
  totalDays: number;
  demandFrequency: number;
  abcClass: AbcClass;
  xyzClass: XyzClass;
  combinedClass: AbcXyzClass;
  currentStock: number;
  availableStock: number;
  stockValue: number;
  estimatedDaysOfStock: number;
  managementStrategy: string;
  recommendations: string[];
}

export interface AbcClassSummaryDto {
  class: AbcClass;
  productCount: number;
  productPercentage: number;
  totalRevenue: number;
  revenuePercentage: number;
  totalStockValue: number;
  stockValuePercentage: number;
  averageInventoryTurnover: number;
}

export interface XyzClassSummaryDto {
  class: XyzClass;
  productCount: number;
  productPercentage: number;
  averageCoefficientOfVariation: number;
  averageDemandFrequency: number;
  demandPattern: string;
}

export interface AbcXyzMatrixCellDto {
  combinedClass: AbcXyzClass;
  productCount: number;
  productPercentage: number;
  totalRevenue: number;
  revenuePercentage: number;
  totalStockValue: number;
  managementPriority: string;
  recommendedStrategy: string;
}

export interface StrategicRecommendationDto {
  category: string;
  priority: string;
  recommendation: string;
  impact: string;
  affectedProductIds: number[];
  estimatedSavings?: number;
}

export interface AbcXyzAnalysisSummaryDto {
  generatedAt: DateTime;
  analysisPeriodDays: number;
  totalProductsAnalyzed: number;
  classA: AbcClassSummaryDto;
  classB: AbcClassSummaryDto;
  classC: AbcClassSummaryDto;
  classX: XyzClassSummaryDto;
  classY: XyzClassSummaryDto;
  classZ: XyzClassSummaryDto;
  matrix: AbcXyzMatrixCellDto[];
  topAProducts: ProductAbcXyzDto[];
  highRiskProducts: ProductAbcXyzDto[];
  totalRevenue: number;
  totalStockValue: number;
  averageInventoryTurnover: number;
  strategicRecommendations: StrategicRecommendationDto[];
}

// =====================================
// INVENTORY TURNOVER TYPES
// =====================================

export interface InventoryTurnoverFilterDto {
  categoryId?: number;
  warehouseId?: number;
  brandId?: number;
  analysisPeriodDays?: number;
  minimumTurnover?: number;
  maximumTurnover?: number;
}

export interface InventoryTurnoverDto {
  productId: number;
  productCode: string;
  productName: string;
  categoryName?: string;
  costOfGoodsSold: number;
  averageInventoryValue: number;
  inventoryTurnoverRatio: number;
  daysOfInventory: number;
  turnoverCategory: string;
  industryBenchmark: number;
  performanceVsBenchmark: number;
  currentStock: number;
  stockValue: number;
  isOverstocked: boolean;
  isUnderstocked: boolean;
  optimalStockLevel: number;
}

// =====================================
// DEAD STOCK TYPES
// =====================================

export interface DeadStockFilterDto {
  categoryId?: number;
  warehouseId?: number;
  minDaysSinceLastSale?: number;
  minStockValue?: number;
}

export interface DeadStockItemDto {
  productId: number;
  productCode: string;
  productName: string;
  categoryName?: string;
  currentStock: number;
  stockValue: number;
  daysSinceLastSale: number;
  daysSinceLastMovement: number;
  lastSaleDate?: DateTime;
  lastMovementDate?: DateTime;
  agingCategory: string;
  depreciationRate: number;
  estimatedRecoveryValue: number;
  disposalOptions: string[];
}

export interface DeadStockAnalysisDto {
  generatedAt: DateTime;
  analysisPeriodDays: number;
  totalDeadStockItems: number;
  totalDeadStockValue: number;
  deadStockPercentage: number;
  items: DeadStockItemDto[];
  recommendations: string[];
  potentialRecoveryValue: number;
}

// =====================================
// SERVICE LEVEL TYPES
// =====================================

export interface ServiceLevelFilterDto {
  categoryId?: number;
  warehouseId?: number;
  targetServiceLevel?: number;
  analysisPeriodDays?: number;
}

export interface ServiceLevelAnalysisDto {
  productId: number;
  productCode: string;
  productName: string;
  currentServiceLevel: number;
  targetServiceLevel: number;
  totalOrders: number;
  fulfilledOrders: number;
  stockoutEvents: number;
  averageStockoutDuration: number;
  estimatedLostSales: number;
  backorderCost: number;
  recommendedSafetyStock: number;
  additionalStockCost: number;
  expectedServiceLevelImprovement: number;
}

// =====================================
// INVENTORY HEALTH SCORE TYPES
// =====================================

export interface InventoryHealthScoreFilterDto {
  warehouseId?: number;
  categoryId?: number;
}

export interface InventoryHealthScoreDto {
  generatedAt: DateTime;
  overallScore: number;
  turnoverScore: number;
  stockoutScore: number;
  deadStockScore: number;
  accuracyScore: number;
  balanceScore: number;
  averageInventoryTurnover: number;
  stockoutRate: number;
  deadStockPercentage: number;
  overstockPercentage: number;
  serviceLevel: number;
  turnoverTrend: string;
  healthTrend: string;
  improvementAreas: string[];
  potentialSavings: number;
}
