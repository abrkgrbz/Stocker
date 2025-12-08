// =====================================
// Purchase Module - TypeScript Type Definitions
// Aligned with Backend .NET DTOs
// =====================================

export type DateTime = string; // ISO 8601 format

// =====================================
// ENUMS
// =====================================

export enum SupplierType {
  Manufacturer = 'Manufacturer',
  Wholesaler = 'Wholesaler',
  Distributor = 'Distributor',
  Importer = 'Importer',
  Retailer = 'Retailer',
  ServiceProvider = 'ServiceProvider',
  Other = 'Other'
}

export enum SupplierStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Pending = 'Pending',
  Blacklisted = 'Blacklisted',
  OnHold = 'OnHold'
}

export enum PurchaseRequestStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Converted = 'Converted',
  Cancelled = 'Cancelled'
}

export enum PurchaseRequestPriority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Urgent = 'Urgent'
}

export enum PurchaseOrderStatus {
  Draft = 'Draft',
  PendingApproval = 'PendingApproval',
  Confirmed = 'Confirmed',
  Rejected = 'Rejected',
  Sent = 'Sent',
  PartiallyReceived = 'PartiallyReceived',
  Received = 'Received',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Closed = 'Closed'
}

export enum PurchaseOrderType {
  Standard = 'Standard',
  Blanket = 'Blanket',
  Contract = 'Contract',
  Urgent = 'Urgent',
  DropShip = 'DropShip'
}

export enum GoodsReceiptStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum GoodsReceiptType {
  Standard = 'Standard',
  PartialDelivery = 'PartialDelivery',
  ReturnReceipt = 'ReturnReceipt',
  DirectDelivery = 'DirectDelivery',
  Consignment = 'Consignment'
}

export enum ItemCondition {
  Good = 'Good',
  Damaged = 'Damaged',
  Defective = 'Defective',
  Expired = 'Expired',
  Other = 'Other'
}

export enum PurchaseInvoiceStatus {
  Draft = 'Draft',
  PendingApproval = 'PendingApproval',
  Approved = 'Approved',
  Rejected = 'Rejected',
  PartiallyPaid = 'PartiallyPaid',
  Paid = 'Paid',
  Cancelled = 'Cancelled'
}

export enum PurchaseInvoiceType {
  Standard = 'Standard',
  Credit = 'Credit',
  Debit = 'Debit',
  Advance = 'Advance'
}

export enum PurchaseReturnStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Shipped = 'Shipped',
  Received = 'Received',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum PurchaseReturnType {
  Standard = 'Standard',
  Defective = 'Defective',
  Warranty = 'Warranty',
  Exchange = 'Exchange'
}

export enum PurchaseReturnReason {
  Defective = 'Defective',
  WrongItem = 'WrongItem',
  WrongQuantity = 'WrongQuantity',
  Damaged = 'Damaged',
  QualityIssue = 'QualityIssue',
  Expired = 'Expired',
  NotAsDescribed = 'NotAsDescribed',
  Other = 'Other'
}

export enum PurchaseReturnItemReason {
  Defective = 'Defective',
  WrongItem = 'WrongItem',
  WrongQuantity = 'WrongQuantity',
  Damaged = 'Damaged',
  QualityIssue = 'QualityIssue',
  Expired = 'Expired',
  NotAsDescribed = 'NotAsDescribed',
  Other = 'Other'
}

export enum RefundMethod {
  Credit = 'Credit',
  BankTransfer = 'BankTransfer',
  Check = 'Check',
  Cash = 'Cash',
  Replacement = 'Replacement'
}

export enum SupplierPaymentStatus {
  Draft = 'Draft',
  PendingApproval = 'PendingApproval',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Processed = 'Processed',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Failed = 'Failed'
}

export enum SupplierPaymentType {
  Standard = 'Standard',
  Advance = 'Advance',
  Partial = 'Partial',
  Final = 'Final',
  Refund = 'Refund'
}

export enum PaymentMethod {
  Cash = 'Cash',
  BankTransfer = 'BankTransfer',
  CreditCard = 'CreditCard',
  Check = 'Check',
  DirectDebit = 'DirectDebit',
  Other = 'Other'
}

// =====================================
// SUPPLIER
// =====================================

export interface SupplierDto {
  id: string;
  code: string;
  name: string;
  taxNumber?: string;
  taxOffice?: string;
  type: string;
  status: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  currency: string;
  paymentTerms: string;
  paymentDueDays: number;
  creditLimit: number;
  currentBalance: number;
  bankName?: string;
  bankAccountNumber?: string;
  iban?: string;
  swiftCode?: string;
  discountRate: number;
  rating: number;
  notes?: string;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt?: DateTime;
  contacts: SupplierContactDto[];
  products: SupplierProductDto[];
}

export interface SupplierContactDto {
  id: string;
  supplierId: string;
  name: string;
  title?: string;
  department?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  isPrimary: boolean;
  notes?: string;
}

export interface SupplierProductDto {
  id: string;
  supplierId: string;
  productId: string;
  productCode?: string;
  productName?: string;
  supplierProductCode?: string;
  supplierProductName?: string;
  unitPrice: number;
  currency: string;
  minOrderQuantity: number;
  leadTimeDays: number;
  isPreferred: boolean;
  lastPurchaseDate?: DateTime;
  lastPurchasePrice: number;
}

export interface SupplierListDto {
  id: string;
  code: string;
  name: string;
  taxNumber?: string;
  type: string;
  status: string;
  city?: string;
  phone?: string;
  email?: string;
  currentBalance: number;
  currency: string;
  rating: number;
  isActive: boolean;
  createdAt: DateTime;
}

export interface CreateSupplierDto {
  code: string;
  name: string;
  taxNumber?: string;
  taxOffice?: string;
  type: SupplierType;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  currency?: string;
  paymentTerms?: string;
  paymentDueDays?: number;
  paymentTermDays?: number;
  creditLimit?: number;
  bankName?: string;
  bankAccountNumber?: string;
  iban?: string;
  swiftCode?: string;
  discountRate?: number;
  notes?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  taxNumber?: string;
  taxOffice?: string;
  type?: SupplierType;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  currency?: string;
  paymentTerms?: string;
  paymentDueDays?: number;
  paymentTermDays?: number;
  creditLimit?: number;
  bankName?: string;
  bankAccountNumber?: string;
  iban?: string;
  swiftCode?: string;
  discountRate?: number;
  notes?: string;
}

export interface CreateSupplierContactDto {
  name: string;
  title?: string;
  department?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  isPrimary: boolean;
  notes?: string;
}

export interface CreateSupplierProductDto {
  productId: string;
  supplierProductCode?: string;
  supplierProductName?: string;
  unitPrice: number;
  currency?: string;
  minOrderQuantity?: number;
  leadTimeDays?: number;
  isPreferred: boolean;
}

export interface SupplierSummaryDto {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  totalBalance: number;
  suppliersByType: Record<string, number>;
  suppliersByCity: Record<string, number>;
}

// =====================================
// PURCHASE REQUEST
// =====================================

export interface PurchaseRequestDto {
  id: string;
  requestNumber: string;
  requestDate: DateTime;
  requiredDate?: DateTime;
  requestedById: string;
  requestedByName?: string;
  departmentId?: string;
  departmentName?: string;
  status: string;
  priority: string;
  purpose?: string;
  justification?: string;
  estimatedTotalAmount: number;
  currency: string;
  budgetAmount: number;
  budgetCode?: string;
  requiresApproval: boolean;
  approvedById?: string;
  approvedByName?: string;
  approvalDate?: DateTime;
  approvalNotes?: string;
  rejectionReason?: string;
  convertedToPurchaseOrderId?: string;
  notes?: string;
  createdAt: DateTime;
  updatedAt?: DateTime;
  items: PurchaseRequestItemDto[];
}

export interface PurchaseRequestItemDto {
  id: string;
  purchaseRequestId: string;
  productId?: string;
  productCode: string;
  productName: string;
  description?: string;
  unit: string;
  quantity: number;
  estimatedUnitPrice: number;
  estimatedTotalPrice: number;
  preferredSupplierId?: string;
  preferredSupplierName?: string;
  specifications?: string;
  notes?: string;
}

export interface PurchaseRequestListDto {
  id: string;
  requestNumber: string;
  requestDate: DateTime;
  requiredDate?: DateTime;
  requestedByName?: string;
  departmentName?: string;
  status: string;
  priority: string;
  estimatedTotalAmount: number;
  currency: string;
  itemCount: number;
  createdAt: DateTime;
}

export interface CreatePurchaseRequestDto {
  requiredDate?: DateTime;
  departmentId?: string;
  departmentName?: string;
  priority: PurchaseRequestPriority;
  purpose?: string;
  justification?: string;
  currency?: string;
  budgetAmount?: number;
  budgetCode?: string;
  notes?: string;
  items: CreatePurchaseRequestItemDto[];
}

export interface CreatePurchaseRequestItemDto {
  productId?: string;
  productCode: string;
  productName: string;
  description?: string;
  unit?: string;
  quantity: number;
  estimatedUnitPrice: number;
  preferredSupplierId?: string;
  preferredSupplierName?: string;
  specifications?: string;
  notes?: string;
}

export interface UpdatePurchaseRequestDto {
  requiredDate?: DateTime;
  priority?: PurchaseRequestPriority;
  purpose?: string;
  justification?: string;
  budgetAmount?: number;
  budgetCode?: string;
  notes?: string;
}

export interface ApprovePurchaseRequestDto {
  approvalNotes?: string;
}

export interface RejectPurchaseRequestDto {
  rejectionReason: string;
}

export interface PurchaseRequestSummaryDto {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  convertedRequests: number;
  totalEstimatedAmount: number;
  requestsByPriority: Record<string, number>;
  requestsByDepartment: Record<string, number>;
}

// =====================================
// PURCHASE ORDER
// =====================================

export interface PurchaseOrderDto {
  id: string;
  orderNumber: string;
  orderDate: DateTime;
  expectedDeliveryDate?: DateTime;
  supplierId: string;
  supplierName?: string;
  supplierCode?: string;
  warehouseId?: string;
  status: string;
  type: string;
  supplierOrderNumber?: string;
  purchaseRequestId?: string;
  purchaseRequestNumber?: string;
  subTotal: number;
  discountAmount: number;
  discountRate: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  exchangeRate: number;
  paymentTerms: string;
  paymentMethod: string;
  paymentDueDate?: DateTime;
  shippingAddress?: string;
  shippingMethod?: string;
  shippingCost: number;
  approvedById?: string;
  approvedByName?: string;
  approvalDate?: DateTime;
  sentDate?: DateTime;
  notes?: string;
  internalNotes?: string;
  createdAt: DateTime;
  updatedAt?: DateTime;
  items: PurchaseOrderItemDto[];
}

export interface PurchaseOrderItemDto {
  id: string;
  purchaseOrderId: string;
  productId?: string;
  productCode: string;
  productName: string;
  description?: string;
  unit: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  subTotal: number;
  totalAmount: number;
  lineNumber: number;
  expectedDeliveryDate?: DateTime;
  notes?: string;
}

export interface PurchaseOrderListDto {
  id: string;
  orderNumber: string;
  orderDate: DateTime;
  expectedDeliveryDate?: DateTime;
  supplierName?: string;
  status: string;
  type: string;
  totalAmount: number;
  currency: string;
  itemCount: number;
  createdAt: DateTime;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  supplierName?: string;
  supplierCode?: string;
  warehouseId?: string;
  warehouseName?: string;
  type: PurchaseOrderType;
  expectedDeliveryDate?: DateTime;
  supplierOrderNumber?: string;
  purchaseRequestId?: string;
  purchaseRequestNumber?: string;
  discountRate?: number;
  currency?: string;
  exchangeRate?: number;
  paymentTerms?: string;
  paymentTermDays?: number;
  paymentMethod: PaymentMethod;
  paymentDueDate?: DateTime;
  shippingAddress?: string;
  shippingMethod?: string;
  shippingCost?: number;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryDistrict?: string;
  deliveryPostalCode?: string;
  deliveryContactPerson?: string;
  deliveryContactPhone?: string;
  supplierNotes?: string;
  notes?: string;
  internalNotes?: string;
  items: CreatePurchaseOrderItemDto[];
}

export interface CreatePurchaseOrderItemDto {
  productId?: string;
  productCode: string;
  productName: string;
  description?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  vatRate?: number;
  expectedDeliveryDate?: DateTime;
  notes?: string;
}

export interface UpdatePurchaseOrderDto {
  expectedDeliveryDate?: DateTime;
  supplierOrderNumber?: string;
  discountRate?: number;
  paymentTerms?: string;
  paymentTermDays?: number;
  paymentMethod?: PaymentMethod;
  paymentDueDate?: DateTime;
  shippingAddress?: string;
  shippingMethod?: string;
  shippingCost?: number;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryDistrict?: string;
  deliveryPostalCode?: string;
  deliveryContactPerson?: string;
  deliveryContactPhone?: string;
  supplierNotes?: string;
  notes?: string;
  internalNotes?: string;
}

export interface PurchaseOrderSummaryDto {
  totalOrders: number;
  draftOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  receivedOrders: number;
  completedOrders: number;
  totalAmount: number;
  pendingAmount: number;
  ordersByStatus: Record<string, number>;
  amountBySupplier: Record<string, number>;
}

// =====================================
// GOODS RECEIPT
// =====================================

export interface GoodsReceiptDto {
  id: string;
  receiptNumber: string;
  receiptDate: DateTime;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  supplierId: string;
  supplierName?: string;
  warehouseId?: string;
  warehouseName?: string;
  status: string;
  type: string;
  deliveryNoteNumber?: string;
  deliveryDate?: DateTime;
  carrierName?: string;
  driverName?: string;
  vehiclePlate?: string;
  totalPackages: number;
  totalWeight: number;
  receivedByName?: string;
  requiresQualityCheck: boolean;
  qualityCheckedById?: string;
  qualityCheckedByName?: string;
  qualityCheckDate?: DateTime;
  qualityNotes?: string;
  notes?: string;
  internalNotes?: string;
  createdAt: DateTime;
  updatedAt?: DateTime;
  items: GoodsReceiptItemDto[];
}

export interface GoodsReceiptItemDto {
  id: string;
  goodsReceiptId: string;
  purchaseOrderItemId?: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  condition: string;
  conditionNotes?: string;
  lotNumber?: string;
  serialNumber?: string;
  expiryDate?: DateTime;
  storageLocation?: string;
  notes?: string;
}

export interface GoodsReceiptListDto {
  id: string;
  receiptNumber: string;
  receiptDate: DateTime;
  purchaseOrderNumber?: string;
  supplierName?: string;
  warehouseName?: string;
  status: string;
  type: string;
  itemCount: number;
  requiresQualityCheck: boolean;
  createdAt: DateTime;
}

export interface CreateGoodsReceiptDto {
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  supplierId: string;
  supplierName?: string;
  warehouseId?: string;
  warehouseName?: string;
  type: GoodsReceiptType;
  deliveryNoteNumber?: string;
  deliveryDate?: DateTime;
  carrierName?: string;
  driverName?: string;
  vehiclePlate?: string;
  totalPackages?: number;
  totalWeight?: number;
  requiresQualityCheck: boolean;
  notes?: string;
  internalNotes?: string;
  items: CreateGoodsReceiptItemDto[];
}

export interface CreateGoodsReceiptItemDto {
  purchaseOrderItemId?: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit?: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice?: number;
  condition: ItemCondition;
  conditionNotes?: string;
  lotNumber?: string;
  batchNumber?: string;
  serialNumber?: string;
  serialNumbers?: string[];
  expiryDate?: DateTime;
  storageLocation?: string;
  notes?: string;
}

export interface UpdateGoodsReceiptDto {
  deliveryNoteNumber?: string;
  deliveryDate?: DateTime;
  carrierName?: string;
  driverName?: string;
  vehiclePlate?: string;
  totalPackages?: number;
  totalWeight?: number;
  notes?: string;
  internalNotes?: string;
}

export interface QualityCheckDto {
  qualityNotes?: string;
  items: QualityCheckItemDto[];
}

export interface QualityCheckItemDto {
  itemId: string;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  condition: ItemCondition;
  conditionNotes?: string;
  rejectionReason?: string;
}

export interface GoodsReceiptSummaryDto {
  totalReceipts: number;
  pendingReceipts: number;
  pendingQualityCheck: number;
  completedReceipts: number;
  totalItemsReceived: number;
  totalItemsRejected: number;
  receiptsByStatus: Record<string, number>;
  receiptsBySupplier: Record<string, number>;
}

// =====================================
// PURCHASE INVOICE
// =====================================

export interface PurchaseInvoiceDto {
  id: string;
  invoiceNumber: string;
  supplierInvoiceNumber?: string;
  invoiceDate: DateTime;
  dueDate?: DateTime;
  supplierId: string;
  supplierName?: string;
  supplierTaxNumber?: string;
  status: string;
  type: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  goodsReceiptId?: string;
  goodsReceiptNumber?: string;
  subTotal: number;
  discountAmount: number;
  discountRate: number;
  vatAmount: number;
  withholdingTaxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  exchangeRate: number;
  eInvoiceId?: string;
  eInvoiceUUID?: string;
  eInvoiceStatus?: string;
  approvedById?: string;
  approvedByName?: string;
  approvalDate?: DateTime;
  notes?: string;
  internalNotes?: string;
  createdAt: DateTime;
  updatedAt?: DateTime;
  items: PurchaseInvoiceItemDto[];
}

export interface PurchaseInvoiceItemDto {
  id: string;
  purchaseInvoiceId: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  subTotal: number;
  totalAmount: number;
  description?: string;
}

export interface PurchaseInvoiceListDto {
  id: string;
  invoiceNumber: string;
  supplierInvoiceNumber?: string;
  invoiceDate: DateTime;
  dueDate?: DateTime;
  supplierName?: string;
  status: string;
  type: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  eInvoiceStatus?: string;
  itemCount: number;
  createdAt: DateTime;
}

export interface CreatePurchaseInvoiceDto {
  supplierInvoiceNumber?: string;
  invoiceDate: DateTime;
  dueDate?: DateTime;
  supplierId: string;
  supplierName?: string;
  supplierTaxNumber?: string;
  type: PurchaseInvoiceType;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  goodsReceiptId?: string;
  goodsReceiptNumber?: string;
  discountRate?: number;
  withholdingTaxAmount?: number;
  currency?: string;
  exchangeRate?: number;
  paymentTermDays?: number;
  eInvoiceId?: string;
  eInvoiceUUID?: string;
  notes?: string;
  internalNotes?: string;
  items: CreatePurchaseInvoiceItemDto[];
}

export interface CreatePurchaseInvoiceItemDto {
  productId?: string;
  productCode: string;
  productName: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  vatRate?: number;
  description?: string;
}

export interface UpdatePurchaseInvoiceDto {
  supplierInvoiceNumber?: string;
  dueDate?: DateTime;
  discountRate?: number;
  withholdingTaxAmount?: number;
  eInvoiceId?: string;
  eInvoiceUUID?: string;
  notes?: string;
  internalNotes?: string;
}

export interface RecordPaymentDto {
  amount: number;
  paymentReference?: string;
}

export interface PurchaseInvoiceSummaryDto {
  totalInvoices: number;
  draftInvoices: number;
  pendingInvoices: number;
  approvedInvoices: number;
  paidInvoices: number;
  totalAmount: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  overdueAmount: number;
  overdueInvoices: number;
  invoicesByStatus: Record<string, number>;
  amountBySupplier: Record<string, number>;
}

// =====================================
// PURCHASE RETURN
// =====================================

export interface PurchaseReturnDto {
  id: string;
  returnNumber: string;
  rmaNumber?: string;
  returnDate: DateTime;
  supplierId: string;
  supplierName?: string;
  status: string;
  type: string;
  reason: string;
  reasonDetails?: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  goodsReceiptId?: string;
  goodsReceiptNumber?: string;
  purchaseInvoiceId?: string;
  purchaseInvoiceNumber?: string;
  subTotal: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  exchangeRate: number;
  refundMethod?: string;
  refundAmount: number;
  refundReference?: string;
  refundDate?: DateTime;
  isShipped: boolean;
  shippedDate?: DateTime;
  shippingCarrier?: string;
  trackingNumber?: string;
  isReceived: boolean;
  receivedDate?: DateTime;
  approvedById?: string;
  approvedByName?: string;
  approvalDate?: DateTime;
  notes?: string;
  internalNotes?: string;
  createdAt: DateTime;
  updatedAt?: DateTime;
  items: PurchaseReturnItemDto[];
}

export interface PurchaseReturnItemDto {
  id: string;
  purchaseReturnId: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  reason: string;
  reasonDescription?: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  vatAmount: number;
  subTotal: number;
  totalAmount: number;
  lotNumber?: string;
  serialNumber?: string;
}

export interface PurchaseReturnListDto {
  id: string;
  returnNumber: string;
  rmaNumber?: string;
  returnDate: DateTime;
  supplierName?: string;
  status: string;
  type: string;
  reason: string;
  totalAmount: number;
  refundAmount: number;
  currency: string;
  itemCount: number;
  createdAt: DateTime;
}

export interface CreatePurchaseReturnDto {
  supplierId: string;
  supplierName?: string;
  warehouseId?: string;
  warehouseName?: string;
  type: PurchaseReturnType;
  reason: PurchaseReturnReason;
  reasonDetails?: string;
  reasonDescription?: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  goodsReceiptId?: string;
  goodsReceiptNumber?: string;
  purchaseInvoiceId?: string;
  purchaseInvoiceNumber?: string;
  currency?: string;
  exchangeRate?: number;
  refundMethod?: RefundMethod;
  notes?: string;
  internalNotes?: string;
  items: CreatePurchaseReturnItemDto[];
}

export interface CreatePurchaseReturnItemDto {
  productId?: string;
  productCode: string;
  productName: string;
  unit?: string;
  reason: PurchaseReturnItemReason;
  reasonDescription?: string;
  quantity: number;
  unitPrice: number;
  vatRate?: number;
  condition: ItemCondition;
  lotNumber?: string;
  batchNumber?: string;
  serialNumber?: string;
}

export interface UpdatePurchaseReturnDto {
  rmaNumber?: string;
  reasonDetails?: string;
  refundMethod?: RefundMethod;
  notes?: string;
  internalNotes?: string;
}

export interface ShipReturnDto {
  shippingMethod?: string;
  shippingCarrier: string;
  trackingNumber: string;
  shippingCost?: number;
}

export interface ProcessRefundDto {
  amount: number;
  refundReference: string;
  overrideAmount?: number;
}

export interface PurchaseReturnSummaryDto {
  totalReturns: number;
  pendingReturns: number;
  approvedReturns: number;
  shippedReturns: number;
  completedReturns: number;
  totalReturnAmount: number;
  totalRefundAmount: number;
  pendingRefundAmount: number;
  returnsByReason: Record<string, number>;
  returnsBySupplier: Record<string, number>;
}

// =====================================
// SUPPLIER PAYMENT
// =====================================

export interface SupplierPaymentDto {
  id: string;
  paymentNumber: string;
  paymentDate: DateTime;
  supplierId: string;
  supplierName?: string;
  status: string;
  type: string;
  method: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  amountInBaseCurrency: number;
  bankName?: string;
  bankAccountNumber?: string;
  iban?: string;
  swiftCode?: string;
  checkNumber?: string;
  checkDate?: DateTime;
  transactionReference?: string;
  description?: string;
  purchaseInvoiceId?: string;
  purchaseInvoiceNumber?: string;
  linkedInvoiceIds?: string;
  requiresApproval: boolean;
  approvedById?: string;
  approvedByName?: string;
  approvalDate?: DateTime;
  processedById?: string;
  processedByName?: string;
  processedDate?: DateTime;
  notes?: string;
  internalNotes?: string;
  isReconciled: boolean;
  reconciliationDate?: DateTime;
  reconciliationReference?: string;
  createdAt: DateTime;
  updatedAt?: DateTime;
}

export interface SupplierPaymentListDto {
  id: string;
  paymentNumber: string;
  paymentDate: DateTime;
  supplierName?: string;
  status: string;
  type: string;
  method: string;
  amount: number;
  currency: string;
  purchaseInvoiceNumber?: string;
  isReconciled: boolean;
  createdAt: DateTime;
}

export interface CreateSupplierPaymentDto {
  supplierId: string;
  supplierName?: string;
  type: SupplierPaymentType;
  method: PaymentMethod;
  amount: number;
  currency?: string;
  exchangeRate?: number;
  paymentDate?: DateTime;
  bankName?: string;
  bankAccountNumber?: string;
  iban?: string;
  swiftCode?: string;
  checkNumber?: string;
  checkDate?: DateTime;
  description?: string;
  purchaseInvoiceId?: string;
  purchaseInvoiceNumber?: string;
  linkedInvoiceIds?: string;
  notes?: string;
  internalNotes?: string;
}

export interface UpdateSupplierPaymentDto {
  paymentDate?: DateTime;
  amount?: number;
  exchangeRate?: number;
  bankName?: string;
  bankAccountNumber?: string;
  iban?: string;
  swiftCode?: string;
  checkNumber?: string;
  checkDate?: DateTime;
  description?: string;
  notes?: string;
  internalNotes?: string;
}

export interface ApprovePaymentDto {
  approvalNotes?: string;
}

export interface RejectPaymentDto {
  reason: string;
}

export interface ProcessPaymentDto {
  transactionReference?: string;
}

export interface ReconcilePaymentDto {
  reconciliationReference?: string;
}

export interface SupplierPaymentSummaryDto {
  totalPayments: number;
  draftPayments: number;
  pendingApprovalPayments: number;
  processedPayments: number;
  completedPayments: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
  unreconciledPayments: number;
  unreconciledAmount: number;
  paymentsByStatus: Record<string, number>;
  amountByMethod: Record<string, number>;
  amountBySupplier: Record<string, number>;
}

// =====================================
// COMMON TYPES
// =====================================

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PurchaseQueryParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface SupplierQueryParams extends PurchaseQueryParams {
  type?: SupplierType;
  status?: SupplierStatus;
  isActive?: boolean;
  city?: string;
}

export interface PurchaseRequestQueryParams extends PurchaseQueryParams {
  status?: PurchaseRequestStatus;
  priority?: PurchaseRequestPriority;
  departmentId?: string;
  fromDate?: DateTime;
  toDate?: DateTime;
}

export interface PurchaseOrderQueryParams extends PurchaseQueryParams {
  status?: PurchaseOrderStatus;
  type?: PurchaseOrderType;
  supplierId?: string;
  fromDate?: DateTime;
  toDate?: DateTime;
}

export interface GoodsReceiptQueryParams extends PurchaseQueryParams {
  status?: GoodsReceiptStatus;
  type?: GoodsReceiptType;
  supplierId?: string;
  warehouseId?: string;
  purchaseOrderId?: string;
  fromDate?: DateTime;
  toDate?: DateTime;
}

export interface PurchaseInvoiceQueryParams extends PurchaseQueryParams {
  status?: PurchaseInvoiceStatus;
  type?: PurchaseInvoiceType;
  supplierId?: string;
  isOverdue?: boolean;
  fromDate?: DateTime;
  toDate?: DateTime;
  dueDateFrom?: DateTime;
  dueDateTo?: DateTime;
}

export interface PurchaseReturnQueryParams extends PurchaseQueryParams {
  status?: PurchaseReturnStatus;
  type?: PurchaseReturnType;
  reason?: PurchaseReturnReason;
  supplierId?: string;
  fromDate?: DateTime;
  toDate?: DateTime;
}

export interface SupplierPaymentQueryParams extends PurchaseQueryParams {
  status?: SupplierPaymentStatus;
  type?: SupplierPaymentType;
  method?: PaymentMethod;
  supplierId?: string;
  isReconciled?: boolean;
  fromDate?: DateTime;
  toDate?: DateTime;
}
