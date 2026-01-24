// =====================================
// SALES MODULE TYPES
// Feature-Based Architecture
// Synchronized with C# DTOs: 2025-12-26
// =====================================

// =====================================
// COMMON TYPES
// =====================================

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PagedResultExtended<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface MoneyDto {
  amount: number;
  currency: string;
}

export interface AddressSnapshot {
  recipientName: string;
  recipientPhone?: string;
  companyName?: string;
  addressLine1: string;
  addressLine2?: string;
  district?: string;
  town?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  taxId?: string;
  taxOffice?: string;
}

// =====================================
// SALES ORDER ENUMS & TYPES
// =====================================

export type SalesOrderStatus =
  | 'Draft'
  | 'Approved'
  | 'Confirmed'
  | 'Shipped'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled';

export interface SalesOrderItem {
  id: string;
  salesOrderId: string;
  productId?: string;
  productCode: string;
  productName: string;
  description?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  lineNumber: number;
  deliveredQuantity: number;
  isDelivered: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  deliveryDate?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  branchId?: string;
  warehouseId?: string;
  customerOrderNumber?: string;
  subTotal: number;
  discountAmount: number;
  discountRate: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  exchangeRate: number;
  status: string;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
  salesPersonId?: string;
  salesPersonName?: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedDate?: string;
  isCancelled: boolean;
  cancellationReason?: string;
  // Address Snapshots
  shippingAddressSnapshot?: AddressSnapshot;
  billingAddressSnapshot?: AddressSnapshot;

  // Source Document Relations
  quotationId?: string;
  quotationNumber?: string;
  opportunityId?: string;
  customerContractId?: string;

  // Invoicing Status
  invoicingStatus: string;
  totalInvoicedAmount: number;

  // Fulfillment Status
  fulfillmentStatus: string;
  completedShipmentCount: number;

  createdAt: string;
  updatedAt?: string;
  items: SalesOrderItem[];
}

export interface SalesOrderListItem {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerName?: string;
  totalAmount: number;
  currency: string;
  status: string;
  isApproved: boolean;
  isCancelled: boolean;
  itemCount: number;
  quotationNumber?: string;
  invoicingStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
}

export interface SalesOrderStatistics {
  totalOrders: number;
  draftOrders: number;
  approvedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface GetSalesOrdersParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: string;
  customerId?: string;
  salesPersonId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface CreateSalesOrderCommand {
  orderDate: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  currency?: string;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
  salesPersonId?: string;
  salesPersonName?: string;
  deliveryDate?: string;
  discountRate?: number;
  discountAmount?: number;
  items: CreateSalesOrderItemCommand[];
}

export interface CreateSalesOrderItemCommand {
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  description?: string;
  discountRate?: number;
}

export interface UpdateSalesOrderCommand {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  currency?: string;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
  deliveryDate?: string;
  salesPersonId?: string;
  salesPersonName?: string;
  discountAmount?: number;
  discountRate?: number;
}

export interface AddSalesOrderItemCommand {
  salesOrderId: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  description?: string;
  discountRate?: number;
}

export interface CancelSalesOrderCommand {
  id: string;
  reason: string;
}

// =====================================
// QUOTATION ENUMS & TYPES
// =====================================

export type QuotationStatus =
  | 'Draft'
  | 'PendingApproval'
  | 'Approved'
  | 'Sent'
  | 'Accepted'
  | 'Rejected'
  | 'Expired'
  | 'Cancelled'
  | 'ConvertedToOrder';

export interface QuotationItem {
  id: string;
  quotationId: string;
  productId: string;
  productName: string;
  productCode?: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  sortOrder: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  name?: string;
  quotationDate: string;
  expirationDate?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerTaxNumber?: string;
  contactId?: string;
  contactName?: string;
  opportunityId?: string;
  salesPersonId?: string;
  salesPersonName?: string;
  subTotal: number;
  discountAmount: number;
  discountRate: number;
  vatAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  exchangeRate: number;
  status: string;
  shippingAddress?: string;
  billingAddress?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  validityDays: number;
  notes?: string;
  termsAndConditions?: string;
  approvedBy?: string;
  approvedDate?: string;
  sentDate?: string;
  acceptedDate?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  convertedToOrderId?: string;
  convertedDate?: string;
  revisionNumber: number;
  parentQuotationId?: string;
  createdAt: string;
  updatedAt?: string;
  items: QuotationItem[];
}

export interface QuotationListItem {
  id: string;
  quotationNumber: string;
  name?: string;
  quotationDate: string;
  expirationDate?: string;
  customerName?: string;
  salesPersonName?: string;
  totalAmount: number;
  currency: string;
  status: string;
  itemCount: number;
  revisionNumber: number;
  createdAt: string;
}

export interface QuotationStatistics {
  totalQuotations: number;
  draftQuotations: number;
  pendingApprovalQuotations: number;
  sentQuotations: number;
  acceptedQuotations: number;
  rejectedQuotations: number;
  expiredQuotations: number;
  totalValue: number;
  conversionRate: number;
  averageQuotationValue: number;
}

export interface CreateQuotationDto {
  name?: string;
  quotationDate?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerTaxNumber?: string;
  contactId?: string;
  contactName?: string;
  opportunityId?: string;
  salesPersonId?: string;
  salesPersonName?: string;
  currency?: string;
  validityDays?: number;
  shippingAddress?: string;
  billingAddress?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  termsAndConditions?: string;
  items: CreateQuotationItemDto[];
}

export interface CreateQuotationItemDto {
  productId: string;
  productName: string;
  productCode?: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountRate?: number;
  discountAmount?: number;
  vatRate?: number;
}

export interface UpdateQuotationDto {
  name?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerTaxNumber?: string;
  contactId?: string;
  contactName?: string;
  salesPersonId?: string;
  salesPersonName?: string;
  validityDays?: number;
  shippingAmount?: number;
  discountAmount?: number;
  discountRate?: number;
  shippingAddress?: string;
  billingAddress?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  termsAndConditions?: string;
}

export interface GetQuotationsParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: QuotationStatus;
  customerId?: string;
  salesPersonId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

// =====================================
// INVOICE ENUMS & TYPES
// Synchronized with Backend: Invoice.cs, InvoiceDto.cs
// =====================================

export type InvoiceStatus =
  | 'Draft'
  | 'Issued'
  | 'Sent'
  | 'PartiallyPaid'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled'
  | 'Voided';

export type InvoiceType =
  | 'Sales'
  | 'Return'
  | 'Credit'
  | 'Debit'
  | 'Proforma'
  | 'Advance'
  | 'Export';

export type EInvoiceStatus =
  | 'Pending'
  | 'Sending'
  | 'Sent'
  | 'Accepted'
  | 'Rejected'
  | 'Error';

export type EArchiveStatus =
  | 'Pending'
  | 'Created'
  | 'Signed'
  | 'Sent'
  | 'Error';

export type TaxIdType = 'VKN' | 'TCKN' | 'Foreign';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  salesOrderItemId?: string;
  productId?: string;
  productCode: string;
  productName: string;
  description?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  lineNumber: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  salesOrderId?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerTaxNumber?: string;
  customerAddress?: string;
  subTotal: number;
  discountAmount: number;
  discountRate: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  exchangeRate: number;
  status: string;
  type: string;
  notes?: string;

  // E-Fatura / E-Arşiv
  eInvoiceId?: string;
  isEInvoice: boolean;
  eInvoiceDate?: string;
  gibUuid?: string;
  eInvoiceStatus?: string;
  eInvoiceErrorMessage?: string;
  isEArchive: boolean;
  eArchiveNumber?: string;
  eArchiveDate?: string;
  eArchiveStatus?: string;

  // Tevkifat (Withholding Tax)
  hasWithholdingTax: boolean;
  withholdingTaxRate: number;
  withholdingTaxAmount: number;
  withholdingTaxCode?: string;

  // Fatura Numaralama (VUK Uyumlu)
  invoiceSeries?: string;
  sequenceNumber: number;
  invoiceYear: number;

  // Müşteri Vergi Bilgileri (Genişletilmiş)
  customerTaxIdType?: string;
  customerTaxOfficeCode?: string;
  customerPhone?: string;
  customerTaxOffice?: string;

  // Kaynak Belge İlişkileri
  salesOrderNumber?: string;
  shipmentId?: string;
  shipmentNumber?: string;
  deliveryNoteId?: string;
  deliveryNoteNumber?: string;
  quotationId?: string;

  // Billing Address Snapshot
  billingAddressSnapshot?: AddressSnapshot;

  createdAt: string;
  updatedAt?: string;
  items: InvoiceItem[];
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  customerId?: string;
  customerName?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  status: string;
  type: string;
  isEInvoice: boolean;
  itemCount: number;
  createdAt: string;
  // Kaynak Belge Referansları
  salesOrderNumber?: string;
  shipmentNumber?: string;
  deliveryNoteNumber?: string;
}

// =====================================
// PAYMENT ENUMS & TYPES
// =====================================

export type PaymentMethod =
  | 'Cash'
  | 'CreditCard'
  | 'DebitCard'
  | 'BankTransfer'
  | 'Check'
  | 'OnlinePayment'
  | 'Other';

export type PaymentStatus =
  | 'Pending'
  | 'Completed'
  | 'Failed'
  | 'Refunded'
  | 'Cancelled';

export interface Payment {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  invoiceId?: string;
  customerId?: string;
  customerName?: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  method: string;
  status: string;
  referenceNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  checkNumber?: string;
  checkDueDate?: string;
  cardLastFourDigits?: string;
  cardType?: string;
  transactionId?: string;
  notes?: string;
  receivedBy?: string;
  receivedByName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentListItem {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  customerName?: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  referenceNumber?: string;
  createdAt: string;
}

// =====================================
// DISCOUNT ENUMS & TYPES
// =====================================

export type DiscountType =
  | 'Percentage'
  | 'FixedAmount'
  | 'BuyXGetY'
  | 'Tiered';

export type DiscountValueType =
  | 'Percentage'
  | 'FixedAmount';

export type DiscountApplicability =
  | 'All'
  | 'SpecificProducts'
  | 'SpecificCategories'
  | 'SpecificCustomers';

export interface Discount {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  valueType: string;
  value: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  minimumQuantity?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  isStackable: boolean;
  priority: number;
  applicability: string;
  applicableProductIds?: string;
  applicableCategoryIds?: string;
  applicableCustomerIds?: string;
  applicableCustomerGroupIds?: string;
  excludedProductIds?: string;
  excludedCategoryIds?: string;
  requiresCouponCode: boolean;
  createdAt: string;
  updatedAt?: string;
  isValid: boolean;
}

export interface DiscountListItem {
  id: string;
  code: string;
  name: string;
  type: string;
  valueType: string;
  value: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  usageCount: number;
  usageLimit?: number;
  isValid: boolean;
}

export interface CreateDiscountDto {
  code: string;
  name: string;
  description?: string;
  type: DiscountType;
  valueType: DiscountValueType;
  value: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  minimumQuantity?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  isStackable?: boolean;
  priority?: number;
  applicability: DiscountApplicability;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  applicableCustomerIds?: string[];
  applicableCustomerGroupIds?: string[];
  excludedProductIds?: string[];
  excludedCategoryIds?: string[];
}

export interface UpdateDiscountDto {
  name: string;
  description?: string;
  value: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  minimumQuantity?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  isStackable?: boolean;
  priority?: number;
}

export interface ApplyDiscountDto {
  code: string;
  orderAmount: number;
  quantity?: number;
}

export interface DiscountValidationResult {
  isValid: boolean;
  discountAmount: number;
  errorMessage?: string;
}

export interface GetDiscountsParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  type?: DiscountType;
  isActive?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
}

// =====================================
// PROMOTION ENUMS & TYPES
// =====================================

export type PromotionType =
  | 'Percentage'
  | 'FixedAmount'
  | 'BuyXGetY'
  | 'FreeShipping'
  | 'Bundle';

export type PromotionStatus =
  | 'Draft'
  | 'Active'
  | 'Paused'
  | 'Expired'
  | 'Cancelled';

export type PromotionRuleType =
  | 'MinimumPurchase'
  | 'ProductQuantity'
  | 'CategoryDiscount'
  | 'BuyXGetY'
  | 'FreeProduct';

export interface PromotionRule {
  id: string;
  ruleType: string;
  condition?: string;
  discountType: string;
  discountValue: number;
  applicableProducts?: string;
  applicableCategories?: string;
  minimumQuantity?: number;
  maximumQuantity?: number;
  freeProductId?: string;
  freeProductQuantity?: number;
  sortOrder: number;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  isActive: boolean;
  priority: number;
  isStackable: boolean;
  isExclusive: boolean;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  totalUsageCount: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  applicableChannels?: string;
  targetCustomerSegments?: string;
  targetProductCategories?: string;
  excludedProducts?: string;
  imageUrl?: string;
  bannerUrl?: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt?: string;
  isValid: boolean;
  rules: PromotionRule[];
}

export interface PromotionListItem {
  id: string;
  code: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  isActive: boolean;
  totalUsageCount: number;
  ruleCount: number;
  isValid: boolean;
}

export interface CreatePromotionDto {
  code: string;
  name: string;
  description?: string;
  type: PromotionType;
  startDate: string;
  endDate: string;
  priority?: number;
  isStackable?: boolean;
  isExclusive?: boolean;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  applicableChannels?: string;
  targetCustomerSegments?: string;
  targetProductCategories?: string;
  excludedProducts?: string;
  imageUrl?: string;
  bannerUrl?: string;
  termsAndConditions?: string;
  rules?: CreatePromotionRuleDto[];
}

export interface CreatePromotionRuleDto {
  ruleType: PromotionRuleType;
  condition?: string;
  discountType: DiscountValueType;
  discountValue: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  minimumQuantity?: number;
  maximumQuantity?: number;
  freeProductId?: string;
  freeProductQuantity?: number;
}

export interface UpdatePromotionDto {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  priority?: number;
  isStackable?: boolean;
  isExclusive?: boolean;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  imageUrl?: string;
  bannerUrl?: string;
  termsAndConditions?: string;
}

// =====================================
// COMMISSION ENUMS & TYPES
// =====================================

export type CommissionType =
  | 'Percentage'
  | 'FixedAmount'
  | 'Tiered'
  | 'Target';

export type CommissionCalculationType =
  | 'Percentage'
  | 'FixedAmount'
  | 'Tiered';

export type SalesCommissionStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Paid'
  | 'Cancelled';

export interface CommissionTier {
  id: string;
  name?: string;
  fromAmount: number;
  toAmount?: number;
  calculationType: string;
  rate: number;
  fixedAmount?: number;
  sortOrder: number;
}

export interface CommissionPlan {
  id: string;
  name: string;
  description?: string;
  type: string;
  calculationType: string;
  baseRate?: number;
  baseAmount?: number;
  isActive: boolean;
  isTiered: boolean;
  startDate?: string;
  endDate?: string;
  applicableProductCategories?: string;
  applicableProducts?: string;
  excludedProducts?: string;
  applicableSalesPersons?: string;
  applicableRoles?: string;
  includeVat: boolean;
  calculateOnProfit: boolean;
  minimumSaleAmount?: number;
  maximumCommissionAmount?: number;
  createdAt: string;
  updatedAt?: string;
  tiers: CommissionTier[];
}

export interface CommissionPlanListItem {
  id: string;
  name: string;
  type: string;
  calculationType: string;
  baseRate?: number;
  baseAmount?: number;
  isActive: boolean;
  isTiered: boolean;
  tierCount: number;
  createdAt: string;
}

export interface CreateCommissionPlanDto {
  name: string;
  description?: string;
  type: CommissionType;
  calculationType: CommissionCalculationType;
  baseRate?: number;
  baseAmount?: number;
  startDate?: string;
  endDate?: string;
  applicableProductCategories?: string[];
  applicableProducts?: string[];
  excludedProducts?: string[];
  applicableSalesPersons?: string[];
  applicableRoles?: string[];
  includeVat?: boolean;
  calculateOnProfit?: boolean;
  minimumSaleAmount?: number;
  maximumCommissionAmount?: number;
  tiers?: CreateCommissionTierDto[];
}

export interface CreateCommissionTierDto {
  name?: string;
  fromAmount: number;
  toAmount?: number;
  calculationType: CommissionCalculationType;
  rate: number;
  fixedAmount?: number;
}

export interface UpdateCommissionPlanDto {
  name: string;
  description?: string;
  baseRate?: number;
  baseAmount?: number;
  startDate?: string;
  endDate?: string;
  includeVat?: boolean;
  calculateOnProfit?: boolean;
  minimumSaleAmount?: number;
  maximumCommissionAmount?: number;
}

export interface SalesCommission {
  id: string;
  salesOrderId: string;
  invoiceId?: string;
  salesPersonId: string;
  salesPersonName: string;
  commissionPlanId: string;
  commissionPlanName: string;
  saleAmount: number;
  commissionAmount: number;
  commissionRate: number;
  status: string;
  calculatedDate: string;
  approvedDate?: string;
  approvedBy?: string;
  paidDate?: string;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
}

export interface SalesCommissionListItem {
  id: string;
  salesOrderId: string;
  salesPersonName: string;
  commissionPlanName: string;
  saleAmount: number;
  commissionAmount: number;
  status: string;
  calculatedDate: string;
  paidDate?: string;
}

export interface CommissionSummary {
  salesPersonId: string;
  salesPersonName: string;
  totalSales: number;
  totalCommission: number;
  pendingCommission: number;
  approvedCommission: number;
  paidCommission: number;
  orderCount: number;
  lastSaleDate?: string;
}

export interface SalesPersonCommissionSummary {
  salesPersonId: string;
  salesPersonName: string;
  totalSales: number;
  totalCommission: number;
  pendingCommission: number;
  approvedCommission: number;
  paidCommission: number;
  orderCount: number;
  lastSaleDate?: string;
}

export interface CalculateCommissionDto {
  salesOrderId: string;
  salesPersonId: string;
  salesPersonName: string;
  commissionPlanId: string;
  saleAmount: number;
  profitAmount?: number;
}

export interface GetCommissionPlansParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  type?: CommissionType;
  isActive?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface GetSalesCommissionsParams {
  page?: number;
  pageSize?: number;
  salesPersonId?: string;
  status?: SalesCommissionStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

// =====================================
// SALES RETURN ENUMS & TYPES
// =====================================

export type SalesReturnStatus =
  | 'Draft'
  | 'Submitted'
  | 'Approved'
  | 'Rejected'
  | 'Received'
  | 'Processing'
  | 'Completed'
  | 'Cancelled';

export type SalesReturnReason =
  | 'Defective'
  | 'WrongItem'
  | 'NotAsDescribed'
  | 'DamagedInTransit'
  | 'ChangedMind'
  | 'Other';

export type SalesReturnType =
  | 'Full'
  | 'Partial';

export type RefundMethod =
  | 'Original'
  | 'Cash'
  | 'BankTransfer'
  | 'Credit'
  | 'Replacement';

export type SalesReturnItemCondition =
  | 'Good'
  | 'Damaged'
  | 'Defective'
  | 'Opened'
  | 'UsedButWorking';

export interface SalesReturnItem {
  id: string;
  salesReturnId: string;
  salesOrderItemId: string;
  productId: string;
  productName: string;
  productCode?: string;
  quantityOrdered: number;
  quantityReturned: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  condition: string;
  conditionNotes?: string;
  isRestockable: boolean;
  isRestocked: boolean;
}

export interface SalesReturn {
  id: string;
  returnNumber: string;
  returnDate: string;
  salesOrderId: string;
  salesOrderNumber: string;
  invoiceId?: string;
  invoiceNumber?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  type: string;
  reason: string;
  reasonDetails?: string;
  status: string;
  subTotal: number;
  vatAmount: number;
  totalAmount: number;
  refundAmount: number;
  refundMethod: string;
  refundReference?: string;
  refundDate?: string;
  restockItems: boolean;
  restockWarehouseId?: string;
  isRestocked: boolean;
  restockedDate?: string;
  processedBy?: string;
  processedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
  creditNoteId?: string;
  createdAt: string;
  updatedAt?: string;
  items: SalesReturnItem[];
}

export interface SalesReturnListItem {
  id: string;
  returnNumber: string;
  returnDate: string;
  salesOrderNumber: string;
  customerName?: string;
  type: string;
  reason: string;
  status: string;
  totalAmount: number;
  refundAmount: number;
  itemCount: number;
  createdAt: string;
}

export interface SalesReturnSummary {
  totalReturns: number;
  pendingReturns: number;
  approvedReturns: number;
  completedReturns: number;
  totalRefundAmount: number;
  pendingRefundAmount: number;
  returnsByReason: Record<string, number>;
  refundsByMethod: Record<string, number>;
}

export interface ReturnableItem {
  salesOrderItemId: string;
  productId: string | null;
  productCode: string;
  productName: string;
  unit: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  returnedQuantity: number;
  returnableQuantity: number;
  unitPrice: number;
}

export interface CreateSalesReturnDto {
  salesOrderId: string;
  type: SalesReturnType;
  reason: SalesReturnReason;
  reasonDetails?: string;
  refundMethod?: RefundMethod;
  restockItems?: boolean;
  restockWarehouseId?: string;
  notes?: string;
  items: CreateSalesReturnItemDto[];
}

export interface CreateSalesReturnItemDto {
  salesOrderItemId: string;
  productId: string;
  productName: string;
  productCode?: string;
  quantityOrdered: number;
  quantityReturned: number;
  unitPrice: number;
  vatRate: number;
  condition?: SalesReturnItemCondition;
  conditionNotes?: string;
  unit?: string;
}

export interface UpdateSalesReturnDto {
  reasonDetails?: string;
  refundMethod?: RefundMethod;
  restockItems?: boolean;
  restockWarehouseId?: string;
  notes?: string;
}

export interface ProcessRefundDto {
  refundReference: string;
  overrideAmount?: number;
}

export interface GetSalesReturnsParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: SalesReturnStatus;
  reason?: SalesReturnReason;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

// =====================================
// CUSTOMER CONTRACT ENUMS & TYPES
// =====================================

export type ContractStatus = 'Draft' | 'Active' | 'Suspended' | 'Terminated' | 'Expired' | 'PendingApproval';
export type ContractType = 'Standard' | 'Premium' | 'Enterprise' | 'Custom' | 'Framework' | 'ServiceLevel';
export type TerminationType = 'Completed' | 'Mutual' | 'Breach' | 'Convenience' | 'NonPayment' | 'Other';
export type ServiceLevelAgreement = 'None' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type SupportPriority = 'Low' | 'Normal' | 'High' | 'Critical';
export type PaymentTermType = 'Net' | 'DueOnReceipt' | 'EndOfMonth' | 'Prepaid' | 'Custom';
export type CommitmentPeriod = 'Monthly' | 'Quarterly' | 'SemiAnnual' | 'Annual';
export type CommitmentTypeContract = 'MinimumSpend' | 'MinimumQuantity' | 'ExclusiveSupplier';

export interface CustomerContractDto {
  id: string;
  contractNumber: string;
  title: string;
  description?: string;
  contractType: ContractType;
  customerId: string;
  customerName: string;
  customerTaxNumber?: string;
  startDate: string;
  endDate: string;
  signedDate: string;
  status: ContractStatus;
  contractValue?: number;
  contractValueCurrency?: string;
  minimumAnnualCommitment?: number;
  priceListId?: string;
  generalDiscountPercentage?: number;
  defaultPaymentDueDays: number;
  creditLimit?: number;
  creditLimitCurrency?: string;
  autoRenewal: boolean;
  renewalPeriodMonths?: number;
  renewalNoticeBeforeDays?: number;
  salesRepresentativeId?: string;
  salesRepresentativeName?: string;
  customerSignatory?: string;
  customerSignatoryTitle?: string;
  companySignatory?: string;
  companySignatoryTitle?: string;
  specialTerms?: string;
  terminatedDate?: string;
  terminationReason?: string;
  terminationType?: TerminationType;
  // SLA Properties
  serviceLevel: ServiceLevelAgreement;
  responseTimeHours?: number;
  resolutionTimeHours?: number;
  supportHours?: string;
  dedicatedSupportContact?: string;
  supportPriority: SupportPriority;
  includesOnSiteSupport: boolean;
  currentCreditBalance: number;
  availableCredit: number;
  creditLimitLastReviewDate?: string;
  renewalGracePeriodDays: number;
  isBlocked: boolean;
  blockReason?: string;
  daysUntilExpiration: number;
  isActive: boolean;
  isInGracePeriod: boolean;
  priceAgreements: ContractPriceAgreementDto[];
  paymentTerms: ContractPaymentTermDto[];
}

export interface CustomerContractListDto {
  id: string;
  contractNumber: string;
  title: string;
  contractType: ContractType;
  customerName: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  creditLimit?: number;
  availableCredit: number;
  isBlocked: boolean;
  daysUntilExpiration: number;
  requiresRenewalNotification: boolean;
}

export interface ContractPriceAgreementDto {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  specialPrice: number;
  currency: string;
  discountPercentage?: number;
  minimumQuantity?: number;
  isActive: boolean;
}

export interface ContractPaymentTermDto {
  id: string;
  termType: PaymentTermType;
  dueDays: number;
  earlyPaymentDiscountPercentage?: number;
  earlyPaymentDiscountDays?: number;
  isDefault: boolean;
}

export interface ContractCommitmentDto {
  id: string;
  commitmentType: CommitmentTypeContract;
  period: CommitmentPeriod;
  targetValue?: MoneyDto;
  targetQuantity?: number;
  achievedValue?: MoneyDto;
  achievedQuantity?: number;
  startDate: string;
  endDate: string;
  achievementPercentage: number;
  isActive: boolean;
}

export interface ContractDocumentDto {
  id: string;
  documentName: string;
  documentType: string;
  documentPath: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  notes?: string;
}

export interface CustomerContractQueryParams {
  searchTerm?: string;
  status?: ContractStatus;
  contractType?: ContractType;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
  serviceLevel?: ServiceLevelAgreement;
  expiringSoon?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateCustomerContractCommand {
  title: string;
  description?: string;
  contractType: ContractType;
  customerId: string;
  customerName: string;
  customerTaxNumber?: string;
  startDate: string;
  endDate: string;
  defaultPaymentDueDays?: number;
  priceListId?: string;
  generalDiscountPercentage?: number;
  creditLimitAmount?: number;
  creditLimitCurrency?: string;
  autoRenewal?: boolean;
  renewalPeriodMonths?: number;
  renewalNoticeBeforeDays?: number;
  salesRepresentativeId?: string;
  salesRepresentativeName?: string;
  customerSignatory?: string;
  customerSignatoryTitle?: string;
  companySignatory?: string;
  companySignatoryTitle?: string;
  serviceLevel?: ServiceLevelAgreement;
  responseTimeHours?: number;
  resolutionTimeHours?: number;
  supportHours?: string;
  supportPriority?: SupportPriority;
}

export interface UpdateCustomerContractCommand {
  priceListId?: string;
  generalDiscountPercentage?: number;
  autoRenewal?: boolean;
  renewalPeriodMonths?: number;
  renewalNoticeBeforeDays?: number;
  salesRepresentativeId?: string;
  salesRepresentativeName?: string;
}

export interface TerminateContractCommand {
  terminationType: TerminationType;
  reason: string;
}

export interface UpdateCreditLimitCommand {
  amount: number;
  currency: string;
  notes?: string;
}

export interface ConfigureSLACommand {
  serviceLevel: ServiceLevelAgreement;
  responseTimeHours?: number;
  resolutionTimeHours?: number;
  supportHours?: string;
  supportPriority?: SupportPriority;
}

export interface AddPriceAgreementCommand {
  productId: string;
  productCode: string;
  productName: string;
  specialPrice: number;
  currency: string;
  discountPercentage?: number;
  minimumQuantity?: number;
}

export interface AddPaymentTermCommand {
  termType: PaymentTermType;
  dueDays: number;
  discountPercentage?: number;
  discountDays?: number;
  description?: string;
  isDefault?: boolean;
}

export interface AddCommitmentCommand {
  commitmentType: CommitmentTypeContract;
  period: CommitmentPeriod;
  targetAmount?: number;
  targetCurrency?: string;
  targetQuantity?: number;
  startDate: string;
  endDate: string;
}

// =====================================
// SALES TERRITORY ENUMS & TYPES
// =====================================

export type TerritoryType = 'Country' | 'Region' | 'City' | 'District' | 'Zone' | 'Custom';
export type TerritoryStatus = 'Active' | 'Inactive' | 'Suspended';
export type TerritoryAssignmentRole = 'Primary' | 'Secondary' | 'Support' | 'Manager';

export interface SalesTerritoryDto {
  id: string;
  territoryCode: string;
  name: string;
  description?: string;
  territoryType: TerritoryType;
  parentTerritoryId?: string;
  hierarchyLevel: number;
  country?: string;
  region?: string;
  city?: string;
  district?: string;
  geoBoundary?: string;
  status: TerritoryStatus;
  territoryManagerId?: string;
  territoryManagerName?: string;
  defaultPriceListId?: string;
  potentialValue?: number;
  potentialValueCurrency?: string;
  annualTarget?: number;
  annualTargetCurrency?: string;
  lastPerformanceScore?: number;
  lastPerformanceDate?: string;
  notes?: string;
  hierarchyPath: string;
  customerCount: number;
  activeAssignmentCount: number;
  assignments: TerritoryAssignmentDto[];
  customers: TerritoryCustomerDto[];
  postalCodes: TerritoryPostalCodeDto[];
}

export interface SalesTerritoryListDto {
  id: string;
  territoryCode: string;
  name: string;
  territoryType: TerritoryType;
  region?: string;
  city?: string;
  status: TerritoryStatus;
  territoryManagerName?: string;
  customerCount: number;
  activeAssignmentCount: number;
  lastPerformanceScore?: number;
}

export interface TerritoryAssignmentDto {
  id: string;
  salesRepresentativeId: string;
  salesRepresentativeName: string;
  role: TerritoryAssignmentRole;
  effectiveFrom: string;
  effectiveTo?: string;
  commissionRate?: number;
  isActive: boolean;
  isCurrentlyEffective: boolean;
}

export interface TerritoryCustomerDto {
  id: string;
  customerId: string;
  customerName: string;
  primarySalesRepresentativeId?: string;
  primarySalesRepresentativeName?: string;
  assignedAt: string;
  isActive: boolean;
}

export interface TerritoryPostalCodeDto {
  id: string;
  postalCode: string;
  areaName?: string;
}

export interface SalesTerritoryQueryParams {
  searchTerm?: string;
  status?: TerritoryStatus;
  territoryType?: TerritoryType;
  parentTerritoryId?: string;
  managerId?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateSalesTerritoryCommand {
  territoryCode: string;
  name: string;
  description?: string;
  territoryType: TerritoryType;
  parentTerritoryId?: string;
  country?: string;
  region?: string;
  city?: string;
  district?: string;
  geoBoundary?: string;
  territoryManagerId?: string;
  territoryManagerName?: string;
  defaultPriceListId?: string;
  potentialAmount?: number;
  potentialCurrency?: string;
  annualTargetAmount?: number;
  annualTargetCurrency?: string;
  notes?: string;
}

export interface UpdateSalesTerritoryCommand {
  name?: string;
  description?: string;
  country?: string;
  region?: string;
  city?: string;
  district?: string;
  geoBoundary?: string;
  territoryManagerId?: string;
  territoryManagerName?: string;
  defaultPriceListId?: string;
  potentialAmount?: number;
  potentialCurrency?: string;
  annualTargetAmount?: number;
  annualTargetCurrency?: string;
  notes?: string;
}

export interface AssignSalesRepCommand {
  salesRepresentativeId: string;
  salesRepresentativeName: string;
  role: TerritoryAssignmentRole;
  effectiveFrom: string;
  effectiveTo?: string;
  commissionRate?: number;
}

export interface AssignCustomerToTerritoryCommand {
  customerId: string;
  customerName: string;
  primarySalesRepresentativeId?: string;
  primarySalesRepresentativeName?: string;
}

// =====================================
// SHIPMENT ENUMS & TYPES
// Synchronized with Backend: ShipmentDto.cs
// =====================================

export type ShipmentStatus = 'Draft' | 'Confirmed' | 'Preparing' | 'PickedUp' | 'Packed' | 'Shipped' | 'InTransit' | 'OutForDelivery' | 'Delivered' | 'Failed' | 'Cancelled' | 'Returned';
export type ShipmentType = 'Standard' | 'Express' | 'SameDay' | 'NextDay' | 'Economy' | 'Freight';
export type ShipmentPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface ShipmentDto {
  id: string;
  shipmentNumber: string;
  salesOrderId: string;
  salesOrderNumber: string;
  shipmentDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;

  // Customer
  customerId?: string;
  customerName?: string;
  recipientName?: string;
  recipientPhone?: string;

  // Address
  shippingAddress: string;
  shippingDistrict?: string;
  shippingCity?: string;
  shippingCountry: string;
  shippingPostalCode?: string;

  // Carrier
  shipmentType: string;
  carrierId?: string;
  carrierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  vehiclePlate?: string;
  driverName?: string;
  driverPhone?: string;

  // Measurement
  totalWeight: number;
  totalVolume?: number;
  packageCount: number;
  shippingCost: number;
  currency: string;
  insuranceAmount?: number;
  customerShippingFee?: number;
  isFreeShipping: boolean;

  // Warehouse
  warehouseId?: string;
  warehouseName?: string;
  branchId?: string;

  // Status
  status: string;
  isDeliveryNoteCreated: boolean;
  deliveryNoteId?: string;
  isInvoiced: boolean;
  invoiceId?: string;
  proofOfDelivery?: string;
  receivedBy?: string;
  deliveryNotes?: string;

  // General
  notes?: string;
  specialInstructions?: string;
  priority: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;

  items: ShipmentItemDto[];
}

export interface ShipmentListDto {
  id: string;
  shipmentNumber: string;
  salesOrderNumber: string;
  shipmentDate: string;
  expectedDeliveryDate?: string;
  customerName?: string;
  shippingCity?: string;
  shipmentType: string;
  carrierName?: string;
  trackingNumber?: string;
  status: string;
  packageCount: number;
  totalWeight: number;
  priority: string;
  isDeliveryNoteCreated: boolean;
  isInvoiced: boolean;
  createdAt: string;
}

export interface ShipmentItemDto {
  id: string;
  salesOrderItemId: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  unitWeight?: number;
  totalWeight: number;
  packageCount: number;
  lotNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface ShipmentQueryParams {
  searchTerm?: string;
  status?: ShipmentStatus;
  shipmentType?: ShipmentType;
  priority?: ShipmentPriority;
  customerId?: string;
  salesOrderId?: string;
  carrierId?: string;
  warehouseId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateShipmentCommand {
  salesOrderId: string;
  shipmentType?: ShipmentType;
  priority?: ShipmentPriority;
  warehouseId?: string;
  shippingAddress: string;
  shippingDistrict?: string;
  shippingCity?: string;
  shippingCountry?: string;
  shippingPostalCode?: string;
  recipientName?: string;
  recipientPhone?: string;
  carrierId?: string;
  carrierName?: string;
  expectedDeliveryDate?: string;
  notes?: string;
  specialInstructions?: string;
  items?: CreateShipmentItemCommand[];
}

export interface CreateShipmentItemCommand {
  salesOrderItemId: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  unitWeight?: number;
  lotNumber?: string;
  serialNumber?: string;
}

export interface UpdateShipmentCommand {
  shipmentType?: ShipmentType;
  priority?: ShipmentPriority;
  carrierId?: string;
  carrierName?: string;
  expectedDeliveryDate?: string;
  notes?: string;
  specialInstructions?: string;
}

export interface ShipShipmentCommand {
  trackingNumber?: string;
  trackingUrl?: string;
  vehiclePlate?: string;
  driverName?: string;
  driverPhone?: string;
}

export interface DeliverShipmentCommand {
  actualDeliveryDate?: string;
  receivedBy?: string;
  proofOfDelivery?: string;
  deliveryNotes?: string;
}

export interface UpdateTrackingCommand {
  trackingNumber?: string;
  trackingUrl?: string;
  vehiclePlate?: string;
  driverName?: string;
  driverPhone?: string;
}

export interface CreateShipmentFromOrderCommand {
  salesOrderId: string;
  shipmentType?: ShipmentType;
  priority?: ShipmentPriority;
  warehouseId?: string;
  carrierId?: string;
  carrierName?: string;
  expectedDeliveryDate?: string;
  notes?: string;
  specialInstructions?: string;
  includeAllItems?: boolean;
}

export interface AddShipmentItemCommand {
  salesOrderItemId: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  unitWeight?: number;
  lotNumber?: string;
  serialNumber?: string;
}

export interface UpdateShipmentItemCommand {
  quantity?: number;
  unitWeight?: number;
}

// =====================================
// ADVANCE PAYMENT ENUMS & TYPES
// =====================================

export type AdvancePaymentStatus =
  | 'Pending'
  | 'Captured'
  | 'PartiallyApplied'
  | 'FullyApplied'
  | 'Refunded'
  | 'Cancelled';

export interface AdvancePaymentDto {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  customerId?: string;
  customerName: string;
  customerTaxNumber?: string;
  salesOrderId?: string;
  salesOrderNumber?: string;
  orderTotalAmount: number;
  amount: number;
  appliedAmount: number;
  remainingAmount: number;
  refundedAmount: number;
  currency: string;
  exchangeRate: number;
  paymentMethod: string;
  paymentReference?: string;
  bankName?: string;
  bankAccountNumber?: string;
  checkNumber?: string;
  checkDate?: string;
  status: string;
  isCaptured: boolean;
  isFullyApplied: boolean;
  isRefunded: boolean;
  capturedDate?: string;
  capturedBy?: string;
  capturedByName?: string;
  refundedDate?: string;
  refundedBy?: string;
  refundReason?: string;
  receiptNumber?: string;
  receiptDate?: string;
  receiptIssued: boolean;
  notes?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdvancePaymentListDto {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  customerName: string;
  salesOrderNumber?: string;
  amount: number;
  appliedAmount: number;
  remainingAmount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  isCaptured: boolean;
  receiptIssued: boolean;
  createdAt: string;
}

export interface AdvancePaymentStatisticsDto {
  totalCount: number;
  pendingCount: number;
  capturedCount: number;
  totalAmount: number;
  appliedAmount: number;
  remainingAmount: number;
  currency: string;
}

export interface AdvancePaymentQueryParams {
  searchTerm?: string;
  status?: AdvancePaymentStatus;
  customerId?: string;
  salesOrderId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateAdvancePaymentCommand {
  customerId?: string;
  customerName: string;
  customerTaxNumber?: string;
  salesOrderId?: string;
  amount: number;
  currency?: string;
  exchangeRate?: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  bankName?: string;
  bankAccountNumber?: string;
  checkNumber?: string;
  checkDate?: string;
  notes?: string;
}

export interface UpdateAdvancePaymentCommand {
  amount?: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  bankName?: string;
  bankAccountNumber?: string;
  checkNumber?: string;
  checkDate?: string;
  notes?: string;
}

export interface ApplyAdvancePaymentCommand {
  invoiceId?: string;
  salesOrderId?: string;
  amount: number;
  notes?: string;
}

export interface RefundAdvancePaymentCommand {
  amount?: number;
  reason: string;
}

// =====================================
// CREDIT NOTE ENUMS & TYPES
// =====================================

export type CreditNoteType =
  | 'Full'
  | 'Partial'
  | 'Adjustment'
  | 'Goodwill';

export type CreditNoteReason =
  | 'Return'
  | 'Defective'
  | 'PricingError'
  | 'Discount'
  | 'Cancellation'
  | 'Goodwill'
  | 'Other';

export type CreditNoteStatus =
  | 'Draft'
  | 'Pending'
  | 'Approved'
  | 'Applied'
  | 'Voided'
  | 'Cancelled';

export interface CreditNoteDto {
  id: string;
  creditNoteNumber: string;
  creditNoteDate: string;
  type: string;
  reason: string;
  reasonDescription?: string;
  invoiceId: string;
  invoiceNumber: string;
  salesReturnId?: string;
  salesReturnNumber?: string;
  salesOrderId?: string;
  salesOrderNumber?: string;
  customerId?: string;
  customerName: string;
  customerTaxNumber?: string;
  customerAddress?: string;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  exchangeRate: number;
  appliedAmount: number;
  remainingAmount: number;
  isFullyApplied: boolean;
  status: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedDate?: string;
  isVoided: boolean;
  voidReason?: string;
  voidedDate?: string;
  isEDocument: boolean;
  eDocumentId?: string;
  eDocumentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  items: CreditNoteItemDto[];
}

export interface CreditNoteItemDto {
  id: string;
  creditNoteId: string;
  lineNumber: number;
  productId?: string;
  productCode: string;
  productName: string;
  description?: string;
  invoiceItemId?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreditNoteListDto {
  id: string;
  creditNoteNumber: string;
  creditNoteDate: string;
  type: string;
  reason: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  appliedAmount: number;
  remainingAmount: number;
  currency: string;
  status: string;
  isApproved: boolean;
  itemCount: number;
  createdAt: string;
}

export interface CreditNoteStatisticsDto {
  totalCount: number;
  draftCount: number;
  pendingCount: number;
  approvedCount: number;
  totalAmount: number;
  appliedAmount: number;
  remainingAmount: number;
  currency: string;
}

export interface CreditNoteQueryParams {
  searchTerm?: string;
  status?: CreditNoteStatus;
  type?: CreditNoteType;
  reason?: CreditNoteReason;
  customerId?: string;
  invoiceId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateCreditNoteCommand {
  invoiceId: string;
  type: CreditNoteType;
  reason: CreditNoteReason;
  reasonDescription?: string;
  salesReturnId?: string;
  notes?: string;
  items: CreateCreditNoteItemCommand[];
}

export interface CreateCreditNoteFromReturnCommand {
  salesReturnId: string;
  notes?: string;
}

export interface CreateCreditNoteItemCommand {
  invoiceItemId?: string;
  productId?: string;
  productCode: string;
  productName: string;
  description?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discountRate?: number;
  taxRate?: number;
}

export interface UpdateCreditNoteCommand {
  reasonDescription?: string;
  notes?: string;
}

export interface ApplyCreditNoteCommand {
  invoiceId?: string;
  amount: number;
  notes?: string;
}

export interface AddCreditNoteItemCommand {
  invoiceItemId?: string;
  productId?: string;
  productCode: string;
  productName: string;
  description?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discountRate?: number;
  taxRate?: number;
}

export interface UpdateCreditNoteItemCommand {
  quantity?: number;
  unitPrice?: number;
  discountRate?: number;
  taxRate?: number;
}

// =====================================
// SERVICE ORDER ENUMS & TYPES
// =====================================

export type ServiceOrderType =
  | 'Repair'
  | 'Maintenance'
  | 'Installation'
  | 'Inspection'
  | 'Calibration'
  | 'Training'
  | 'Consultation'
  | 'Other';

export type ServiceOrderPriority =
  | 'Low'
  | 'Normal'
  | 'High'
  | 'Urgent'
  | 'Critical';

export type ServiceOrderStatus =
  | 'Draft'
  | 'Pending'
  | 'Assigned'
  | 'InProgress'
  | 'OnHold'
  | 'Completed'
  | 'Cancelled';

export type ServiceLocation =
  | 'InHouse'
  | 'OnSite'
  | 'Remote';

export type ServiceItemType =
  | 'Labor'
  | 'Part'
  | 'Material'
  | 'Travel'
  | 'Other';

export type ServiceNoteType =
  | 'General'
  | 'Diagnosis'
  | 'Repair'
  | 'Customer'
  | 'Internal';

export interface ServiceOrderDto {
  id: string;
  serviceOrderNumber: string;
  orderDate: string;
  type: string;
  priority: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  serialNumber?: string;
  assetTag?: string;
  salesOrderId?: string;
  salesOrderNumber?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  warrantyId?: string;
  warrantyNumber?: string;
  isCoveredByWarranty: boolean;
  reportedIssue?: string;
  diagnosisNotes?: string;
  repairNotes?: string;
  issueCategory?: string;
  scheduledDate?: string;
  scheduledEndDate?: string;
  estimatedDuration?: string;
  location: string;
  serviceAddress?: string;
  technicianId?: string;
  technicianName?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  assignedDate?: string;
  status: string;
  startedDate?: string;
  completedDate?: string;
  cancelledDate?: string;
  cancellationReason?: string;
  actualDuration?: string;
  isBillable: boolean;
  laborCost: number;
  partsCost: number;
  travelCost: number;
  otherCost: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  isInvoiced: boolean;
  serviceInvoiceId?: string;
  serviceInvoiceNumber?: string;
  invoicedDate?: string;
  customerRating?: number;
  customerFeedback?: string;
  feedbackDate?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
  items: ServiceOrderItemDto[];
  notes: ServiceOrderNoteDto[];
}

export interface ServiceOrderItemDto {
  id: string;
  serviceOrderId: string;
  lineNumber: number;
  itemType: string;
  productId?: string;
  code: string;
  name: string;
  description?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  totalPrice: number;
  hoursWorked?: number;
  hourlyRate?: number;
  isCoveredByWarranty: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceOrderNoteDto {
  id: string;
  serviceOrderId: string;
  type: string;
  content: string;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
}

export interface ServiceOrderListDto {
  id: string;
  serviceOrderNumber: string;
  orderDate: string;
  type: string;
  priority: string;
  customerName: string;
  productName?: string;
  serialNumber?: string;
  status: string;
  scheduledDate?: string;
  technicianName?: string;
  isCoveredByWarranty: boolean;
  isBillable: boolean;
  totalAmount: number;
  isInvoiced: boolean;
  customerRating?: number;
  createdAt: string;
}

export interface ServiceOrderStatisticsDto {
  totalCount: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
  averageRating: number;
  totalRevenue: number;
  currency: string;
}

export interface ServiceOrderQueryParams {
  searchTerm?: string;
  status?: ServiceOrderStatus;
  type?: ServiceOrderType;
  priority?: ServiceOrderPriority;
  customerId?: string;
  technicianId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateServiceOrderCommand {
  type: ServiceOrderType;
  priority?: ServiceOrderPriority;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  serialNumber?: string;
  assetTag?: string;
  salesOrderId?: string;
  warrantyId?: string;
  reportedIssue?: string;
  scheduledDate?: string;
  scheduledEndDate?: string;
  estimatedDuration?: string;
  location?: ServiceLocation;
  serviceAddress?: string;
  isBillable?: boolean;
}

export interface UpdateServiceOrderCommand {
  priority?: ServiceOrderPriority;
  reportedIssue?: string;
  diagnosisNotes?: string;
  repairNotes?: string;
  scheduledDate?: string;
  scheduledEndDate?: string;
  estimatedDuration?: string;
  location?: ServiceLocation;
  serviceAddress?: string;
  isBillable?: boolean;
}

export interface AssignTechnicianCommand {
  technicianId: string;
  technicianName: string;
  teamId?: string;
  teamName?: string;
}

export interface CompleteServiceOrderCommand {
  repairNotes?: string;
  actualDuration?: string;
}

export interface AddServiceOrderItemCommand {
  itemType: ServiceItemType;
  productId?: string;
  code: string;
  name: string;
  description?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  hoursWorked?: number;
  hourlyRate?: number;
  isCoveredByWarranty?: boolean;
}

export interface UpdateServiceOrderItemCommand {
  quantity?: number;
  unitPrice?: number;
  discountRate?: number;
  hoursWorked?: number;
}

export interface AddServiceOrderNoteCommand {
  type: ServiceNoteType;
  content: string;
}

export interface SubmitServiceFeedbackCommand {
  rating: number;
  feedback?: string;
}

// =====================================
// WARRANTY ENUMS & TYPES
// =====================================

export type WarrantyType =
  | 'Standard'
  | 'Extended'
  | 'Premium'
  | 'Limited'
  | 'Lifetime';

export type WarrantyCoverageType =
  | 'Full'
  | 'PartsOnly'
  | 'LaborOnly'
  | 'LimitedParts';

export type WarrantyStatus =
  | 'Draft'
  | 'Active'
  | 'Expired'
  | 'Void'
  | 'Suspended';

export type WarrantyClaimType =
  | 'Repair'
  | 'Replacement'
  | 'Refund'
  | 'Service';

export type WarrantyClaimStatus =
  | 'Submitted'
  | 'UnderReview'
  | 'Approved'
  | 'Rejected'
  | 'InProgress'
  | 'Resolved'
  | 'Closed';

export type WarrantyResolutionType =
  | 'Repaired'
  | 'Replaced'
  | 'Refunded'
  | 'Credited';

export interface WarrantyDto {
  id: string;
  warrantyNumber: string;
  productId?: string;
  productCode: string;
  productName: string;
  serialNumber?: string;
  lotNumber?: string;
  salesOrderId?: string;
  salesOrderNumber?: string;
  salesOrderItemId?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  purchaseDate?: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  remainingDays: number;
  type: string;
  coverageType: string;
  coverageDescription?: string;
  maxClaimAmount?: number;
  maxClaimCount?: number;
  status: string;
  isActive: boolean;
  isExpired: boolean;
  isVoid: boolean;
  voidReason?: string;
  voidedDate?: string;
  isExtended: boolean;
  originalWarrantyId?: string;
  extensionPrice?: number;
  extendedDate?: string;
  claimCount: number;
  approvedClaimCount: number;
  totalClaimedAmount: number;
  isRegistered: boolean;
  registeredDate?: string;
  registeredBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  claims: WarrantyClaimDto[];
}

export interface WarrantyClaimDto {
  id: string;
  warrantyId: string;
  claimNumber: string;
  claimDate: string;
  issueDescription: string;
  claimType: string;
  failureCode?: string;
  diagnosticNotes?: string;
  status: string;
  resolution?: string;
  resolutionType?: string;
  resolvedDate?: string;
  resolvedBy?: string;
  claimAmount: number;
  approvedAmount: number;
  paidAmount: number;
  replacementProductId?: string;
  replacementSerialNumber?: string;
  serviceOrderId?: string;
  serviceOrderNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WarrantyListDto {
  id: string;
  warrantyNumber: string;
  productCode: string;
  productName: string;
  serialNumber?: string;
  customerName: string;
  startDate: string;
  endDate: string;
  remainingDays: number;
  type: string;
  coverageType: string;
  status: string;
  isActive: boolean;
  isExpired: boolean;
  claimCount: number;
  createdAt: string;
}

export interface WarrantyStatisticsDto {
  totalCount: number;
  activeCount: number;
  expiredCount: number;
  expiringThisMonthCount: number;
  totalClaimCount: number;
  pendingClaimCount: number;
  averageClaimResolutionDays: number;
}

export interface WarrantyQueryParams {
  searchTerm?: string;
  status?: WarrantyStatus;
  type?: WarrantyType;
  customerId?: string;
  productId?: string;
  isActive?: boolean;
  isExpired?: boolean;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateWarrantyCommand {
  productId?: string;
  productCode: string;
  productName: string;
  serialNumber?: string;
  lotNumber?: string;
  salesOrderId?: string;
  salesOrderItemId?: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  startDate: string;
  durationMonths: number;
  type: WarrantyType;
  coverageType: WarrantyCoverageType;
  coverageDescription?: string;
  maxClaimAmount?: number;
  maxClaimCount?: number;
  notes?: string;
}

export interface UpdateWarrantyCommand {
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  coverageDescription?: string;
  notes?: string;
}

export interface ExtendWarrantyCommand {
  additionalMonths: number;
  extensionPrice?: number;
  notes?: string;
}

export interface CreateWarrantyClaimCommand {
  issueDescription: string;
  claimType: WarrantyClaimType;
  failureCode?: string;
  claimAmount?: number;
  notes?: string;
}

export interface ApproveWarrantyClaimCommand {
  approvedAmount: number;
  resolutionType: WarrantyResolutionType;
  notes?: string;
}

export interface ResolveWarrantyClaimCommand {
  resolution: string;
  resolutionType: WarrantyResolutionType;
  paidAmount?: number;
  replacementProductId?: string;
  replacementSerialNumber?: string;
  serviceOrderId?: string;
  notes?: string;
}

// =====================================
// CUSTOMER SEGMENTS
// =====================================

export type SegmentCriteriaType =
  | 'OrderValue'
  | 'OrderFrequency'
  | 'ProductCategory'
  | 'Location'
  | 'Custom';

export interface CustomerSegmentDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  discountRate: number;
  priority: number;
  customerCount: number;
  isActive: boolean;
  criteriaType?: SegmentCriteriaType;
  criteriaValue?: string;
  minOrderValue?: number;
  maxOrderValue?: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  createdByName?: string;
}

export interface CustomerSegmentListDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  discountRate: number;
  priority: number;
  customerCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface CustomerSegmentStatisticsDto {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  totalCustomersSegmented: number;
  averageDiscountRate: number;
}

export interface CustomerSegmentQueryParams {
  searchTerm?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateCustomerSegmentCommand {
  name: string;
  code: string;
  description?: string;
  discountRate: number;
  priority: number;
  isActive?: boolean;
  criteriaType?: SegmentCriteriaType;
  criteriaValue?: string;
  minOrderValue?: number;
  maxOrderValue?: number;
}

export interface UpdateCustomerSegmentCommand {
  name?: string;
  description?: string;
  discountRate?: number;
  priority?: number;
  isActive?: boolean;
  criteriaType?: SegmentCriteriaType;
  criteriaValue?: string;
  minOrderValue?: number;
  maxOrderValue?: number;
}

export interface AssignCustomersToSegmentCommand {
  customerIds: string[];
}

// =====================================
// SALES TARGETS
// =====================================

export type SalesTargetType =
  | 'Monthly'
  | 'Quarterly'
  | 'Yearly';

export type SalesTargetMetric =
  | 'Revenue'
  | 'OrderCount'
  | 'NewCustomers'
  | 'ProductUnits';

export type SalesTargetStatus =
  | 'NotStarted'
  | 'InProgress'
  | 'Achieved'
  | 'Exceeded'
  | 'Failed';

export interface SalesTargetDto {
  id: string;
  salesRepId: string;
  salesRepName: string;
  salesRepAvatar?: string;
  salesRepEmail?: string;
  department?: string;
  teamId?: string;
  teamName?: string;
  targetType: SalesTargetType;
  metric: SalesTargetMetric;
  period: string;
  periodStart: string;
  periodEnd: string;
  targetAmount: number;
  achievedAmount: number;
  progressPercentage: number;
  remainingAmount: number;
  bonusThreshold: number;
  bonusRate: number;
  estimatedBonus: number;
  rank?: number;
  streak: number;
  status: SalesTargetStatus;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface SalesTargetListDto {
  id: string;
  salesRepId: string;
  salesRepName: string;
  salesRepAvatar?: string;
  department?: string;
  targetType: SalesTargetType;
  period: string;
  targetAmount: number;
  achievedAmount: number;
  progressPercentage: number;
  bonusThreshold: number;
  rank?: number;
  streak: number;
  status: SalesTargetStatus;
  isActive: boolean;
}

export interface SalesTargetStatisticsDto {
  totalTargets: number;
  achievedCount: number;
  inProgressCount: number;
  failedCount: number;
  averageProgress: number;
  topPerformerId?: string;
  topPerformerName?: string;
  topPerformerProgress?: number;
  totalTargetAmount: number;
  totalAchievedAmount: number;
}

export interface SalesTargetQueryParams {
  searchTerm?: string;
  salesRepId?: string;
  teamId?: string;
  targetType?: SalesTargetType;
  metric?: SalesTargetMetric;
  status?: SalesTargetStatus;
  period?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateSalesTargetCommand {
  salesRepId: string;
  targetType: SalesTargetType;
  metric: SalesTargetMetric;
  period: string;
  periodStart: string;
  periodEnd: string;
  targetAmount: number;
  bonusThreshold: number;
  bonusRate: number;
  notes?: string;
}

export interface UpdateSalesTargetCommand {
  targetAmount?: number;
  bonusThreshold?: number;
  bonusRate?: number;
  notes?: string;
}

export interface UpdateTargetProgressCommand {
  achievedAmount: number;
  notes?: string;
}

export interface LeaderboardEntryDto {
  rank: number;
  salesRepId: string;
  salesRepName: string;
  salesRepAvatar?: string;
  department?: string;
  targetAmount: number;
  achievedAmount: number;
  progressPercentage: number;
  streak: number;
  estimatedBonus: number;
}
