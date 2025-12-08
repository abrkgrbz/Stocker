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

// =====================================
// QUOTATION / RFQ ENUMS
// =====================================

export enum QuotationStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  PartiallyResponded = 'PartiallyResponded',
  FullyResponded = 'FullyResponded',
  UnderReview = 'UnderReview',
  Evaluated = 'Evaluated',
  SupplierSelected = 'SupplierSelected',
  Awarded = 'Awarded',
  Converted = 'Converted',
  Expired = 'Expired',
  Cancelled = 'Cancelled',
  Closed = 'Closed'
}

export enum QuotationType {
  Standard = 'Standard',
  Urgent = 'Urgent',
  Framework = 'Framework',
  Blanket = 'Blanket'
}

export enum QuotationPriority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Urgent = 'Urgent'
}

export enum SupplierResponseStatus {
  Pending = 'Pending',
  Responded = 'Responded',
  Declined = 'Declined',
  NoResponse = 'NoResponse'
}

// =====================================
// QUOTATION / RFQ
// =====================================

export interface QuotationDto {
  id: string;
  quotationNumber: string;
  title?: string;
  description?: string;
  status: string;
  type: string;
  priority: string;
  quotationDate: DateTime;
  responseDeadline?: DateTime;
  validUntil?: DateTime;
  validityPeriod?: string;
  purchaseRequestId?: string;
  purchaseRequestNumber?: string;
  warehouseId?: string;
  warehouseName?: string;
  currency: string;
  supplierCount: number;
  respondedSupplierCount: number;
  paymentTerms?: string;
  deliveryLocation?: string;
  notes?: string;
  internalNotes?: string;
  terms?: string;
  selectedSupplierId?: string;
  selectedSupplierName?: string;
  selectionReason?: string;
  selectionById?: string;
  selectionByName?: string;
  selectionDate?: DateTime;
  convertedToOrderId?: string;
  convertedOrderNumber?: string;
  convertedDate?: DateTime;
  createdById?: string;
  createdByName?: string;
  cancellationReason?: string;
  cancelledDate?: DateTime;
  createdAt: DateTime;
  updatedAt?: DateTime;
  items: QuotationItemDto[];
  suppliers: QuotationSupplierDto[];
}

export interface QuotationItemDto {
  id: string;
  quotationId: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit?: string;
  quantity: number;
  specifications?: string;
  notes?: string;
}

export interface QuotationSupplierDto {
  id: string;
  quotationId: string;
  supplierId: string;
  supplierCode?: string;
  supplierName: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  sentDate?: DateTime;
  responseDate?: DateTime;
  status: string;
  responseStatus: string;
  totalAmount: number;
  currency?: string;
  deliveryDays?: number;
  paymentTerms?: string;
  validUntil?: DateTime;
  supplierNotes?: string;
  internalEvaluation?: string;
  evaluationScore: number;
  isSelected: boolean;
  items: QuotationSupplierItemDto[];
}

export interface QuotationSupplierItemDto {
  id: string;
  quotationSupplierId: string;
  quotationItemId: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  currency?: string;
  deliveryDays?: number;
  notes?: string;
  isAvailable: boolean;
  alternativeProductCode?: string;
  alternativeProductName?: string;
}

export interface QuotationListDto {
  id: string;
  quotationNumber: string;
  title?: string;
  status: string;
  type: string;
  priority: string;
  quotationDate: DateTime;
  responseDeadline?: DateTime;
  purchaseRequestNumber?: string;
  supplierCount: number;
  respondedSupplierCount: number;
  itemCount: number;
  createdAt: DateTime;
}

export interface CreateQuotationDto {
  title?: string;
  description?: string;
  type?: QuotationType;
  priority?: QuotationPriority;
  responseDeadline?: DateTime;
  validityPeriod?: number;
  validUntil?: DateTime;
  purchaseRequestId?: string;
  purchaseRequestNumber?: string;
  warehouseId?: string;
  warehouseName?: string;
  currency?: string;
  deliveryLocation?: string;
  paymentTerms?: string;
  notes?: string;
  internalNotes?: string;
  terms?: string;
  items: CreateQuotationItemDto[];
  supplierIds: string[];
}

export interface CreateQuotationItemDto {
  productId?: string;
  productCode?: string;
  productName?: string;
  unit?: string;
  quantity: number;
  specifications?: string;
  notes?: string;
}

export interface UpdateQuotationDto {
  title?: string;
  priority?: QuotationPriority;
  responseDeadline?: DateTime;
  validUntil?: DateTime;
  notes?: string;
  internalNotes?: string;
  terms?: string;
}

export interface SendQuotationDto {
  supplierIds?: string[];
  emailMessage?: string;
}

export interface ReceiveQuotationResponseDto {
  supplierId: string;
  totalAmount: number;
  currency?: string;
  deliveryDays?: number;
  paymentTerms?: string;
  validUntil?: DateTime;
  supplierNotes?: string;
  items: ReceiveQuotationResponseItemDto[];
}

export interface ReceiveQuotationResponseItemDto {
  quotationItemId: string;
  unitPrice: number;
  discountRate?: number;
  vatRate?: number;
  deliveryDays?: number;
  isAvailable: boolean;
  alternativeProductCode?: string;
  alternativeProductName?: string;
  notes?: string;
}

export interface SelectSupplierDto {
  supplierId: string;
  selectionReason?: string;
}

export interface QuotationQueryParams extends PurchaseQueryParams {
  status?: QuotationStatus;
  type?: QuotationType;
  priority?: QuotationPriority;
  purchaseRequestId?: string;
  fromDate?: DateTime;
  toDate?: DateTime;
}

// =====================================
// PURCHASE CONTRACT ENUMS
// =====================================

export enum PurchaseContractStatus {
  Draft = 'Draft',
  PendingApproval = 'PendingApproval',
  Active = 'Active',
  Suspended = 'Suspended',
  Expired = 'Expired',
  Terminated = 'Terminated',
  Renewed = 'Renewed',
  Cancelled = 'Cancelled'
}

export enum PurchaseContractType {
  Standard = 'Standard',
  Blanket = 'Blanket',
  Framework = 'Framework',
  Volume = 'Volume',
  ServiceLevel = 'ServiceLevel'
}

// =====================================
// PURCHASE CONTRACT
// =====================================

export interface PurchaseContractDto {
  id: string;
  contractNumber: string;
  title: string;
  status: string;
  type: string;
  supplierId: string;
  supplierCode?: string;
  supplierName: string;
  startDate: DateTime;
  endDate: DateTime;
  autoRenewal: boolean;
  renewalPeriodMonths?: number;
  renewalNoticeDays?: number;
  terminationNoticeDays: number;
  minOrderValue: number;
  maxOrderValue: number;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  totalContractValue: number;
  usedValue: number;
  remainingValue: number;
  totalOrders: number;
  currency: string;
  paymentTerms?: string;
  paymentTermDays: number;
  discountRate: number;
  additionalDiscount: number;
  deliveryTerms?: string;
  warrantyTerms?: string;
  qualityStandards?: string;
  penaltyTerms?: string;
  approvedById?: string;
  approvedByName?: string;
  approvalDate?: DateTime;
  signedById?: string;
  signedByName?: string;
  signedDate?: DateTime;
  supplierSignedByName?: string;
  supplierSignedDate?: DateTime;
  previousContractId?: string;
  renewedContractId?: string;
  terminationReason?: string;
  terminationDate?: DateTime;
  notes?: string;
  internalNotes?: string;
  createdAt: DateTime;
  updatedAt?: DateTime;
  items: PurchaseContractItemDto[];
}

export interface PurchaseContractItemDto {
  id: string;
  purchaseContractId: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit?: string;
  contractedQuantity: number;
  orderedQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  discountRate: number;
  discountedPrice: number;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  deliveryLeadDays: number;
  specifications?: string;
  notes?: string;
  priceBreaks: PurchaseContractPriceBreakDto[];
}

export interface PurchaseContractPriceBreakDto {
  id: string;
  purchaseContractItemId: string;
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
  discountRate: number;
}

export interface PurchaseContractListDto {
  id: string;
  contractNumber: string;
  title: string;
  status: string;
  type: string;
  supplierName: string;
  startDate: DateTime;
  endDate: DateTime;
  totalContractValue: number;
  usedValue: number;
  remainingValue: number;
  currency: string;
  itemCount: number;
  createdAt: DateTime;
}

export interface CreatePurchaseContractDto {
  title: string;
  type: PurchaseContractType;
  supplierId: string;
  supplierCode?: string;
  supplierName: string;
  startDate: DateTime;
  endDate: DateTime;
  autoRenewal?: boolean;
  renewalPeriodMonths?: number;
  renewalNoticeDays?: number;
  terminationNoticeDays?: number;
  minOrderValue?: number;
  maxOrderValue?: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  totalContractValue?: number;
  currency?: string;
  paymentTerms?: string;
  paymentTermDays?: number;
  discountRate?: number;
  additionalDiscount?: number;
  deliveryTerms?: string;
  warrantyTerms?: string;
  qualityStandards?: string;
  penaltyTerms?: string;
  notes?: string;
  internalNotes?: string;
  items: CreatePurchaseContractItemDto[];
}

export interface CreatePurchaseContractItemDto {
  productId?: string;
  productCode: string;
  productName: string;
  unit?: string;
  contractedQuantity: number;
  unitPrice: number;
  discountRate?: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  deliveryLeadDays?: number;
  specifications?: string;
  notes?: string;
  priceBreaks?: CreatePriceBreakDto[];
}

export interface CreatePriceBreakDto {
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
  discountRate?: number;
}

export interface UpdatePurchaseContractDto {
  title?: string;
  endDate?: DateTime;
  autoRenewal?: boolean;
  renewalPeriodMonths?: number;
  renewalNoticeDays?: number;
  terminationNoticeDays?: number;
  minOrderValue?: number;
  maxOrderValue?: number;
  paymentTerms?: string;
  paymentTermDays?: number;
  additionalDiscount?: number;
  deliveryTerms?: string;
  warrantyTerms?: string;
  qualityStandards?: string;
  penaltyTerms?: string;
  notes?: string;
  internalNotes?: string;
}

export interface TerminateContractDto {
  terminationReason: string;
}

export interface RenewContractDto {
  newEndDate: DateTime;
  newTotalContractValue?: number;
  priceAdjustmentPercent?: number;
  notes?: string;
}

export interface CheckContractPriceDto {
  productId: string;
  quantity: number;
}

export interface ContractPriceResultDto {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  discountedPrice: number;
  totalAmount: number;
  isWithinContractLimits: boolean;
  message?: string;
}

export interface PurchaseContractQueryParams extends PurchaseQueryParams {
  status?: PurchaseContractStatus;
  type?: PurchaseContractType;
  supplierId?: string;
  isExpiringSoon?: boolean;
  fromDate?: DateTime;
  toDate?: DateTime;
}

// =====================================
// PRICE LIST ENUMS
// =====================================

export enum PriceListStatus {
  Draft = 'Draft',
  PendingApproval = 'PendingApproval',
  Approved = 'Approved',
  Active = 'Active',
  Inactive = 'Inactive',
  Expired = 'Expired',
  Superseded = 'Superseded',
  Rejected = 'Rejected'
}

export enum PriceListType {
  Standard = 'Standard',
  Promotional = 'Promotional',
  Contract = 'Contract',
  Seasonal = 'Seasonal',
  Bulk = 'Bulk',
  Supplier = 'Supplier'
}

// =====================================
// PRICE LIST
// =====================================

export interface PriceListDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: string;
  type: string;
  supplierId?: string;
  supplierCode?: string;
  supplierName?: string;
  effectiveFrom: DateTime;
  effectiveTo?: DateTime;
  version: number;
  previousVersionId?: string;
  isDefault: boolean;
  currency: string;
  createdById?: string;
  createdByName?: string;
  approvedById?: string;
  approvedByName?: string;
  approvalDate?: DateTime;
  notes?: string;
  internalNotes?: string;
  createdAt: DateTime;
  updatedAt?: DateTime;
  items: PriceListItemDto[];
}

export interface PriceListItemDto {
  id: string;
  priceListId: string;
  productId: string;
  productCode: string;
  productName: string;
  productSku?: string;
  unit?: string;
  basePrice: number;
  discountRate: number;
  discountedPrice: number;
  discountPercentage?: number;
  currency?: string;
  minQuantity: number;
  maxQuantity?: number;
  effectiveFrom?: DateTime;
  effectiveTo?: DateTime;
  notes?: string;
  tiers: PriceListItemTierDto[];
}

export interface PriceListItemTierDto {
  id: string;
  priceListItemId: string;
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
  discountRate: number;
}

export interface PriceListListDto {
  id: string;
  code: string;
  name: string;
  status: string;
  type: string;
  supplierName?: string;
  effectiveFrom: DateTime;
  effectiveTo?: DateTime;
  version: number;
  isDefault: boolean;
  currency: string;
  itemCount: number;
  createdAt: DateTime;
}

export interface CreatePriceListDto {
  code: string;
  name: string;
  description?: string;
  type: PriceListType;
  supplierId?: string;
  supplierCode?: string;
  supplierName?: string;
  effectiveFrom: DateTime;
  effectiveTo?: DateTime;
  isDefault?: boolean;
  currency?: string;
  notes?: string;
  internalNotes?: string;
  items: CreatePriceListItemDto[];
}

export interface CreatePriceListItemDto {
  productId: string;
  productCode?: string;
  productName?: string;
  unit?: string;
  basePrice: number;
  discountRate?: number;
  discountPercentage?: number;
  minQuantity?: number;
  maxQuantity?: number;
  effectiveFrom?: DateTime;
  effectiveTo?: DateTime;
  notes?: string;
  tiers?: CreatePriceListTierDto[];
}

export interface CreatePriceListTierDto {
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
  discountRate?: number;
}

export interface UpdatePriceListDto {
  name?: string;
  description?: string;
  effectiveTo?: DateTime;
  isDefault?: boolean;
  notes?: string;
  internalNotes?: string;
}

export interface CreateNewVersionDto {
  effectiveFrom: DateTime;
  effectiveTo?: DateTime;
  notes?: string;
}

export interface LookupPriceDto {
  productId: string;
  quantity: number;
  supplierId?: string;
}

export interface PriceLookupResultDto {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  discountedPrice: number;
  totalAmount: number;
  priceListId: string;
  priceListName: string;
  currency: string;
  validUntil?: DateTime;
}

export interface PriceListQueryParams extends PurchaseQueryParams {
  status?: PriceListStatus;
  type?: PriceListType;
  supplierId?: string;
  isDefault?: boolean;
  isActive?: boolean;
  search?: string;
  fromDate?: DateTime;
  toDate?: DateTime;
}

// =====================================
// PURCHASE BUDGET ENUMS
// =====================================

export enum PurchaseBudgetStatus {
  Draft = 'Draft',
  PendingApproval = 'PendingApproval',
  Approved = 'Approved',
  Active = 'Active',
  Frozen = 'Frozen',
  Exhausted = 'Exhausted',
  Closed = 'Closed',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled'
}

export enum PurchaseBudgetType {
  Annual = 'Annual',
  Quarterly = 'Quarterly',
  Monthly = 'Monthly',
  Project = 'Project',
  Department = 'Department',
  Category = 'Category',
  CostCenter = 'CostCenter',
  General = 'General'
}

export enum BudgetTransactionType {
  Allocation = 'Allocation',
  Commitment = 'Commitment',
  Spend = 'Spend',
  Release = 'Release',
  Transfer = 'Transfer',
  Adjustment = 'Adjustment'
}

// =====================================
// PURCHASE BUDGET
// =====================================

export interface PurchaseBudgetDto {
  id: string;
  budgetCode: string;
  code: string; // alias for budgetCode
  name: string;
  description?: string;
  status: PurchaseBudgetStatus;
  budgetType: string;
  type: string;
  year: number;
  quarter?: number;
  month?: number;
  departmentId?: string;
  departmentName?: string;
  categoryId?: string;
  categoryName?: string;
  projectId?: string;
  projectName?: string;
  periodStart: DateTime;
  periodEnd: DateTime;
  startDate: DateTime;
  endDate: DateTime;
  totalAmount: number;
  originalAmount: number;
  currentAmount: number;
  usedAmount: number;
  committedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  availableAmount: number;
  utilizationRate: number;
  currency: string;
  alertThreshold: number;
  warningThreshold: number;
  criticalThreshold: number;
  isOverBudget: boolean;
  allowOverBudget: boolean;
  overBudgetLimit: number;
  approvedById?: string;
  approvedByName?: string;
  approvalDate?: DateTime;
  notes?: string;
  internalNotes?: string;
  createdAt: DateTime;
  updatedAt?: DateTime;
  revisions: PurchaseBudgetRevisionDto[];
  transactions: BudgetTransactionDto[];
}

export interface PurchaseBudgetRevisionDto {
  id: string;
  purchaseBudgetId: string;
  revisionNumber: number;
  previousAmount: number;
  newAmount: number;
  changeAmount: number;
  reason: string;
  revisedById?: string;
  revisedByName?: string;
  revisionDate: DateTime;
  approvedById?: string;
  approvedByName?: string;
  approvalDate?: DateTime;
  notes?: string;
}

export interface PurchaseBudgetTransactionDto {
  id: string;
  purchaseBudgetId: string;
  transactionType: string;
  amount: number;
  referenceType?: string;
  referenceId?: string;
  referenceNumber?: string;
  description?: string;
  transactionDate: DateTime;
  createdById?: string;
  createdByName?: string;
  createdAt: DateTime;
}

// Alias for BudgetTransactionDto used in frontend
export interface BudgetTransactionDto {
  id: string;
  transactionType: string;
  amount: number;
  referenceNumber?: string;
  description?: string;
  createdAt: DateTime;
}

export interface PurchaseBudgetListDto {
  id: string;
  budgetCode: string;
  code: string; // alias for budgetCode
  name: string;
  status: PurchaseBudgetStatus;
  budgetType: string;
  type: string;
  year: number;
  quarter?: number;
  departmentName?: string;
  periodStart: DateTime;
  periodEnd: DateTime;
  totalAmount: number;
  originalAmount: number;
  currentAmount: number;
  usedAmount: number;
  committedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  availableAmount: number;
  utilizationRate: number;
  currency: string;
  alertThreshold: number;
  isOverBudget: boolean;
  createdAt: DateTime;
}

export interface CreatePurchaseBudgetDto {
  budgetCode?: string;
  code?: string; // alias for budgetCode
  name: string;
  description?: string;
  budgetType?: string;
  type?: PurchaseBudgetType;
  year?: number;
  quarter?: number;
  month?: number;
  departmentId?: string;
  departmentName?: string;
  categoryId?: string;
  categoryName?: string;
  projectId?: string;
  projectName?: string;
  periodStart?: DateTime;
  periodEnd?: DateTime;
  startDate?: DateTime;
  endDate?: DateTime;
  totalAmount?: number;
  originalAmount?: number;
  currency?: string;
  alertThreshold?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  allowOverBudget?: boolean;
  overBudgetLimit?: number;
  notes?: string;
  internalNotes?: string;
}

export interface UpdatePurchaseBudgetDto {
  name?: string;
  description?: string;
  endDate?: DateTime;
  warningThreshold?: number;
  criticalThreshold?: number;
  allowOverBudget?: boolean;
  overBudgetLimit?: number;
  notes?: string;
  internalNotes?: string;
}

export interface ReviseBudgetDto {
  newAmount: number;
  reason: string;
  notes?: string;
}

export interface CheckBudgetDto {
  amount: number;
  departmentId?: string;
  categoryId?: string;
  projectId?: string;
}

export interface BudgetCheckResultDto {
  budgetId: string;
  budgetCode: string;
  budgetName: string;
  requestedAmount: number;
  availableAmount: number;
  isAvailable: boolean;
  utilizationAfterCommitment: number;
  warningLevel?: string;
  message: string;
}

export interface CommitBudgetDto {
  amount: number;
  referenceType: string;
  referenceId: string;
  referenceNumber?: string;
  description?: string;
}

export interface SpendBudgetDto {
  amount: number;
  referenceType: string;
  referenceId: string;
  referenceNumber?: string;
  description?: string;
}

export interface ReleaseBudgetDto {
  amount: number;
  referenceType: string;
  referenceId: string;
  referenceNumber?: string;
  description?: string;
}

export interface PurchaseBudgetQueryParams extends PurchaseQueryParams {
  status?: PurchaseBudgetStatus;
  type?: PurchaseBudgetType;
  year?: number;
  quarter?: number;
  departmentId?: string;
  isOverBudget?: boolean;
  search?: string;
}

// =====================================
// SUPPLIER EVALUATION ENUMS
// =====================================

export enum SupplierEvaluationStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  PendingReview = 'PendingReview',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Completed = 'Completed',
  Archived = 'Archived'
}

// Alias for EvaluationStatus used in frontend
export type EvaluationStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export enum SupplierEvaluationType {
  Periodic = 'Periodic',
  Initial = 'Initial',
  Incident = 'Incident',
  Audit = 'Audit',
  Recertification = 'Recertification',
  PostDelivery = 'PostDelivery',
  Annual = 'Annual',
  Quarterly = 'Quarterly'
}

// Alias for EvaluationType used in frontend
export type EvaluationType = 'Periodic' | 'PostDelivery' | 'Annual' | 'Quarterly' | 'Incident';

export enum EvaluationPeriodType {
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  SemiAnnual = 'SemiAnnual',
  Annual = 'Annual'
}

export enum SupplierRating {
  Excellent = 'Excellent',
  Good = 'Good',
  Satisfactory = 'Satisfactory',
  NeedsImprovement = 'NeedsImprovement',
  Poor = 'Poor'
}

// =====================================
// SUPPLIER EVALUATION
// =====================================

export interface SupplierEvaluationDto {
  id: string;
  evaluationNumber: string;
  supplierId: string;
  supplierCode?: string;
  supplierName: string;
  status: EvaluationStatus;
  evaluationType: string;
  type: string;
  periodType: string;
  evaluationPeriod?: string;
  year: number;
  quarter?: number;
  month?: number;
  startDate: DateTime;
  endDate: DateTime;
  evaluationDate: DateTime;
  qualityScore: number;
  deliveryScore: number;
  priceScore: number;
  serviceScore: number;
  communicationScore: number;
  responsiveness: number;
  reliability: number;
  flexibility: number;
  documentation: number;
  overallScore: number;
  qualityWeight: number;
  deliveryWeight: number;
  priceWeight: number;
  serviceWeight: number;
  communicationWeight: number;
  totalOrders: number;
  onTimeDeliveries: number;
  onTimeDeliveryRate: number;
  totalItems: number;
  acceptedItems: number;
  rejectedItems: number;
  acceptanceRate: number;
  averageLeadTimeDays: number;
  totalReturns: number;
  returnRate: number;
  totalPurchaseAmount: number;
  averageOrderValue: number;
  previousOverallScore?: number;
  scoreChange?: number;
  scoreTrend?: string;
  rating: string;
  rank?: number;
  rankInCategory?: number;
  totalSuppliersInCategory?: number;
  evaluatedById?: string;
  evaluatedByName?: string;
  evaluatorName?: string;
  strengths?: string;
  weaknesses?: string;
  improvementAreas?: string;
  recommendations?: string;
  notes?: string;
  requiresFollowUp: boolean;
  followUpDate?: DateTime;
  followUpNotes?: string;
  followUpCompleted: boolean;
  approvedAt?: DateTime;
  approverName?: string;
  createdAt: DateTime;
  updatedAt?: DateTime;
  criteria: SupplierEvaluationCriteriaDto[];
  history: SupplierEvaluationHistoryDto[];
}

export interface SupplierEvaluationCriteriaDto {
  id: string;
  evaluationId: string;
  category: string;
  name: string;
  description?: string;
  weight: number;
  score: number;
  weightedScore: number;
  evidence?: string;
  notes?: string;
}

export interface SupplierEvaluationHistoryDto {
  id: string;
  supplierId: string;
  year: number;
  quarter?: number;
  month?: number;
  overallScore: number;
  qualityScore: number;
  deliveryScore: number;
  priceScore: number;
  serviceScore: number;
  communicationScore: number;
  rating: string;
  recordedAt: DateTime;
}

export interface SupplierEvaluationListDto {
  id: string;
  evaluationNumber: string;
  supplierCode?: string;
  supplierName: string;
  status: EvaluationStatus;
  evaluationType: string;
  type: string;
  periodType: string;
  evaluationPeriod?: string;
  year: number;
  quarter?: number;
  overallScore: number;
  rating: string;
  rank?: number;
  scoreTrend?: string;
  evaluationDate: DateTime;
  createdAt: DateTime;
}

export interface CreateSupplierEvaluationDto {
  supplierId: string;
  supplierCode?: string;
  supplierName?: string;
  evaluationType?: string;
  type?: SupplierEvaluationType;
  periodType?: EvaluationPeriodType;
  evaluationPeriod?: string;
  evaluationDate?: DateTime;
  year?: number;
  quarter?: number;
  month?: number;
  startDate?: DateTime;
  endDate?: DateTime;
  qualityScore?: number;
  deliveryScore?: number;
  priceScore?: number;
  serviceScore?: number;
  responsiveness?: number;
  reliability?: number;
  flexibility?: number;
  documentation?: number;
  strengths?: string;
  weaknesses?: string;
  recommendations?: string;
  notes?: string;
}

export interface UpdateSupplierEvaluationDto {
  notes?: string;
}

export interface SetScoresDto {
  qualityScore: number;
  deliveryScore: number;
  priceScore: number;
  serviceScore: number;
  communicationScore: number;
}

export interface SetWeightsDto {
  qualityWeight: number;
  deliveryWeight: number;
  priceWeight: number;
  serviceWeight: number;
  communicationWeight: number;
}

export interface SetCommentsDto {
  strengths?: string;
  weaknesses?: string;
  improvementAreas?: string;
  recommendations?: string;
  notes?: string;
}

export interface SetFollowUpDto {
  requiresFollowUp: boolean;
  followUpDate?: DateTime;
  followUpNotes?: string;
}

export interface AddCriteriaDto {
  category: string;
  name: string;
  description?: string;
  weight: number;
  score: number;
  evidence?: string;
  notes?: string;
}

export interface SupplierRankingDto {
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  overallScore: number;
  rating: string;
  rank: number;
  totalOrders: number;
  onTimeDeliveryRate: number;
  acceptanceRate: number;
  scoreTrend?: string;
}

export interface SupplierEvaluationQueryParams extends PurchaseQueryParams {
  status?: SupplierEvaluationStatus | EvaluationStatus;
  type?: SupplierEvaluationType;
  periodType?: EvaluationPeriodType;
  supplierId?: string;
  year?: number;
  quarter?: number;
  rating?: SupplierRating;
  search?: string;
}

// =====================================
// APPROVAL WORKFLOW ENUMS
// =====================================

export enum ApprovalWorkflowStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Draft = 'Draft'
}

export enum ApprovalDocumentType {
  PurchaseRequest = 'PurchaseRequest',
  PurchaseOrder = 'PurchaseOrder',
  PurchaseInvoice = 'PurchaseInvoice',
  PurchaseReturn = 'PurchaseReturn',
  SupplierPayment = 'SupplierPayment',
  PurchaseContract = 'PurchaseContract',
  PurchaseBudget = 'PurchaseBudget'
}

export enum ApprovalRuleType {
  AmountBased = 'AmountBased',
  DepartmentBased = 'DepartmentBased',
  CategoryBased = 'CategoryBased',
  SupplierBased = 'SupplierBased',
  Combined = 'Combined'
}

export enum ApprovalConditionOperator {
  GreaterThan = 'GreaterThan',
  GreaterThanOrEqual = 'GreaterThanOrEqual',
  LessThan = 'LessThan',
  LessThanOrEqual = 'LessThanOrEqual',
  Equal = 'Equal',
  Between = 'Between'
}

export enum ApproverType {
  User = 'User',
  Role = 'Role',
  Group = 'Group',
  Manager = 'Manager'
}

// =====================================
// APPROVAL WORKFLOW
// =====================================

export interface ApprovalWorkflowConfigDto {
  id: string;
  name: string;
  description?: string;
  documentType: string;
  status: string;
  isDefault: boolean;
  priority: number;
  effectiveFrom: DateTime;
  effectiveTo?: DateTime;
  createdById?: string;
  createdByName?: string;
  notes?: string;
  createdAt: DateTime;
  updatedAt?: DateTime;
  rules: ApprovalWorkflowRuleDto[];
}

export interface ApprovalWorkflowRuleDto {
  id: string;
  workflowConfigId: string;
  name: string;
  description?: string;
  ruleType: string;
  priority: number;
  isActive: boolean;
  conditionField?: string;
  conditionOperator?: string;
  conditionValue?: string;
  conditionMinValue?: number;
  conditionMaxValue?: number;
  departmentId?: string;
  departmentName?: string;
  categoryId?: string;
  categoryName?: string;
  supplierId?: string;
  supplierName?: string;
  notes?: string;
  steps: ApprovalWorkflowStepDto[];
}

export interface ApprovalWorkflowStepDto {
  id: string;
  workflowRuleId: string;
  stepOrder: number;
  name: string;
  description?: string;
  approverType: string;
  approverId?: string;
  approverName?: string;
  approvalGroupId?: string;
  approvalGroupName?: string;
  requiredApprovals: number;
  timeoutHours?: number;
  canDelegate: boolean;
  canSkip: boolean;
  skipCondition?: string;
  escalationHours?: number;
  escalateToId?: string;
  escalateToName?: string;
  notes?: string;
}

export interface ApprovalGroupDto {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt?: DateTime;
  members: ApprovalGroupMemberDto[];
}

export interface ApprovalGroupMemberDto {
  id: string;
  approvalGroupId: string;
  userId: string;
  userName: string;
  email?: string;
  canApprove: boolean;
  canDelegate: boolean;
  delegateToId?: string;
  delegateToName?: string;
  delegateFrom?: DateTime;
  delegateTo?: DateTime;
  isActive: boolean;
}

export interface ApprovalWorkflowConfigListDto {
  id: string;
  name: string;
  documentType: string;
  status: string;
  isDefault: boolean;
  priority: number;
  effectiveFrom: DateTime;
  effectiveTo?: DateTime;
  ruleCount: number;
  createdAt: DateTime;
}

export interface CreateApprovalWorkflowConfigDto {
  name: string;
  description?: string;
  documentType: ApprovalDocumentType;
  isDefault?: boolean;
  priority?: number;
  effectiveFrom: DateTime;
  effectiveTo?: DateTime;
  notes?: string;
  rules: CreateApprovalWorkflowRuleDto[];
}

export interface CreateApprovalWorkflowRuleDto {
  name: string;
  description?: string;
  ruleType: ApprovalRuleType;
  priority?: number;
  conditionField?: string;
  conditionOperator?: ApprovalConditionOperator;
  conditionValue?: string;
  conditionMinValue?: number;
  conditionMaxValue?: number;
  departmentId?: string;
  departmentName?: string;
  categoryId?: string;
  categoryName?: string;
  supplierId?: string;
  supplierName?: string;
  notes?: string;
  steps: CreateApprovalWorkflowStepDto[];
}

export interface CreateApprovalWorkflowStepDto {
  stepOrder: number;
  name: string;
  description?: string;
  approverType: ApproverType;
  approverId?: string;
  approverName?: string;
  approvalGroupId?: string;
  approvalGroupName?: string;
  requiredApprovals?: number;
  timeoutHours?: number;
  canDelegate?: boolean;
  canSkip?: boolean;
  skipCondition?: string;
  escalationHours?: number;
  escalateToId?: string;
  escalateToName?: string;
  notes?: string;
}

export interface UpdateApprovalWorkflowConfigDto {
  name?: string;
  description?: string;
  isDefault?: boolean;
  priority?: number;
  effectiveTo?: DateTime;
  notes?: string;
}

export interface CreateApprovalGroupDto {
  name: string;
  description?: string;
  members: CreateApprovalGroupMemberDto[];
}

export interface CreateApprovalGroupMemberDto {
  userId: string;
  userName: string;
  email?: string;
  canApprove?: boolean;
  canDelegate?: boolean;
}

export interface UpdateApprovalGroupDto {
  name?: string;
  description?: string;
}

export interface AddGroupMemberDto {
  userId: string;
  userName: string;
  email?: string;
  canApprove?: boolean;
  canDelegate?: boolean;
}

export interface SetDelegationDto {
  delegateToId: string;
  delegateToName: string;
  delegateFrom: DateTime;
  delegateTo: DateTime;
}

export interface GetApplicableWorkflowDto {
  documentType: ApprovalDocumentType;
  amount?: number;
  departmentId?: string;
  categoryId?: string;
  supplierId?: string;
}

export interface ApplicableWorkflowResultDto {
  workflowConfigId: string;
  workflowName: string;
  ruleId: string;
  ruleName: string;
  steps: ApprovalWorkflowStepDto[];
  totalSteps: number;
  estimatedCompletionHours: number;
}

export interface ApprovalWorkflowQueryParams extends PurchaseQueryParams {
  documentType?: ApprovalDocumentType;
  status?: ApprovalWorkflowStatus;
  isDefault?: boolean;
}

// =====================================
// TYPE ALIASES FOR FRONTEND COMPATIBILITY
// =====================================

// Budget type alias for frontend pages
export type BudgetType = 'Department' | 'Category' | 'Project' | 'CostCenter' | 'General';

// Approval Workflow type aliases for hook compatibility
export type ApprovalWorkflowDto = ApprovalWorkflowConfigDto;
export type ApprovalWorkflowListDto = ApprovalWorkflowConfigListDto;
export type CreateApprovalWorkflowDto = CreateApprovalWorkflowConfigDto;
export type UpdateApprovalWorkflowDto = UpdateApprovalWorkflowConfigDto;
