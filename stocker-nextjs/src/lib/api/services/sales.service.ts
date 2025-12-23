import { ApiService } from '../api-service';

// =====================================
// TYPES - Based on Backend API
// Synchronized with C# DTOs: 2025-12-21
// =====================================

// =====================================
// ENUMS
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

export type DiscountType =
  | 'Percentage'
  | 'FixedAmount'
  | 'BuyXGetY'
  | 'Tiered';

// C#: DiscountValueType enum
export type DiscountValueType =
  | 'Percentage'
  | 'FixedAmount';

// C#: DiscountApplicability enum
export type DiscountApplicability =
  | 'All'
  | 'SpecificProducts'
  | 'SpecificCategories'
  | 'SpecificCustomers';

export type CommissionType =
  | 'Percentage'
  | 'FixedAmount'
  | 'Tiered'
  | 'Target';

// C#: CommissionCalculationType enum
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

// C#: SalesReturnType enum
export type SalesReturnType =
  | 'Full'
  | 'Partial';

// C#: RefundMethod enum
export type RefundMethod =
  | 'Original'
  | 'Cash'
  | 'BankTransfer'
  | 'Credit'
  | 'Replacement';

// C#: SalesReturnItemCondition enum
export type SalesReturnItemCondition =
  | 'Good'
  | 'Damaged'
  | 'Defective'
  | 'Opened'
  | 'UsedButWorking';

// C#: InvoiceStatus enum
export type InvoiceStatus =
  | 'Draft'
  | 'Issued'
  | 'Sent'
  | 'Paid'
  | 'PartiallyPaid'
  | 'Overdue'
  | 'Cancelled'
  | 'Voided';

// C#: InvoiceType enum
export type InvoiceType =
  | 'Standard'
  | 'Proforma'
  | 'Credit'
  | 'Debit';

// C#: PaymentMethod enum
export type PaymentMethod =
  | 'Cash'
  | 'CreditCard'
  | 'DebitCard'
  | 'BankTransfer'
  | 'Check'
  | 'OnlinePayment'
  | 'Other';

// C#: PaymentStatus enum
export type PaymentStatus =
  | 'Pending'
  | 'Completed'
  | 'Failed'
  | 'Refunded'
  | 'Cancelled';

// C#: PromotionType enum
export type PromotionType =
  | 'Percentage'
  | 'FixedAmount'
  | 'BuyXGetY'
  | 'FreeShipping'
  | 'Bundle';

// C#: PromotionStatus enum
export type PromotionStatus =
  | 'Draft'
  | 'Active'
  | 'Paused'
  | 'Expired'
  | 'Cancelled';

// C#: PromotionRuleType enum
export type PromotionRuleType =
  | 'MinimumPurchase'
  | 'ProductQuantity'
  | 'CategoryDiscount'
  | 'BuyXGetY'
  | 'FreeProduct';

// =====================================
// QUOTATIONS
// C#: QuotationDto.cs
// =====================================

/**
 * Backend: QuotationItemDto (QuotationDto.cs:53-70)
 */
export interface QuotationItem {
  id: string;
  quotationId: string;
  productId: string; // C#: Guid ProductId (required)
  productName: string;
  productCode?: string; // C#: nullable
  description?: string; // C#: nullable
  quantity: number;
  unit: string;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  sortOrder: number; // C#: SortOrder (added)
}

/**
 * Backend: QuotationDto (QuotationDto.cs:5-51)
 */
export interface Quotation {
  id: string;
  quotationNumber: string;
  name?: string; // C#: Name (added)
  quotationDate: string;
  expirationDate?: string; // C#: ExpirationDate (renamed from validUntil)
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string; // C#: CustomerPhone (added)
  customerTaxNumber?: string; // C#: CustomerTaxNumber (added)
  contactId?: string; // C#: ContactId (added)
  contactName?: string;
  opportunityId?: string; // C#: OpportunityId (added)
  salesPersonId?: string;
  salesPersonName?: string;
  subTotal: number;
  discountAmount: number;
  discountRate: number;
  vatAmount: number; // C#: VatAmount (renamed from taxTotal)
  shippingAmount: number; // C#: ShippingAmount (added)
  totalAmount: number; // C#: TotalAmount (renamed from grandTotal)
  currency: string;
  exchangeRate: number; // C#: ExchangeRate (added)
  status: string; // C#: returns string from enum
  shippingAddress?: string;
  billingAddress?: string;
  paymentTerms?: string; // C#: PaymentTerms (added)
  deliveryTerms?: string; // C#: DeliveryTerms (added)
  validityDays: number; // C#: ValidityDays (added)
  notes?: string;
  termsAndConditions?: string;
  approvedBy?: string; // C#: Guid? ApprovedBy
  approvedDate?: string;
  sentDate?: string; // C#: SentDate (added)
  acceptedDate?: string; // C#: AcceptedDate (added)
  rejectedDate?: string; // C#: RejectedDate (added)
  rejectionReason?: string; // C#: RejectionReason (added)
  convertedToOrderId?: string; // C#: ConvertedToOrderId
  convertedDate?: string; // C#: ConvertedDate (added)
  revisionNumber: number;
  parentQuotationId?: string;
  createdAt: string;
  updatedAt?: string;
  items: QuotationItem[];
}

/**
 * Backend: QuotationListDto (QuotationDto.cs:72-87)
 */
export interface QuotationListItem {
  id: string;
  quotationNumber: string;
  name?: string; // C#: Name (added)
  quotationDate: string;
  expirationDate?: string; // C#: ExpirationDate (renamed from validUntil)
  customerName?: string;
  salesPersonName?: string;
  totalAmount: number; // C#: TotalAmount (renamed from grandTotal)
  currency: string;
  status: string;
  itemCount: number;
  revisionNumber: number;
  createdAt: string; // C#: CreatedAt (added)
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
  quotationDate: string;
  validUntil: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  currency?: string;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
  termsAndConditions?: string;
  salesPersonId?: string;
  salesPersonName?: string;
  discountRate?: number;
  discountAmount?: number;
  items: CreateQuotationItemDto[];
}

export interface CreateQuotationItemDto {
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

export interface UpdateQuotationDto {
  validUntil?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  currency?: string;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
  termsAndConditions?: string;
  salesPersonId?: string;
  salesPersonName?: string;
  discountAmount?: number;
  discountRate?: number;
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
// INVOICES
// C#: InvoiceDto.cs
// =====================================

/**
 * Backend: InvoiceItemDto (InvoiceDto.cs:72-92)
 */
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

/**
 * Backend: InvoiceDto (InvoiceDto.cs:5-70)
 */
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
  eInvoiceId?: string;
  isEInvoice: boolean;
  eInvoiceDate?: string;
  createdAt: string;
  updatedAt?: string;
  items: InvoiceItem[];
}

/**
 * Backend: InvoiceListDto (InvoiceDto.cs:119-156)
 */
export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
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
}

// =====================================
// PAYMENTS
// C#: PaymentDto.cs
// =====================================

/**
 * Backend: PaymentDto (PaymentDto.cs:5-62)
 */
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

/**
 * Backend: PaymentListDto (PaymentDto.cs:64-93)
 */
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
// DISCOUNTS
// C#: DiscountDto.cs
// =====================================

/**
 * Backend: DiscountDto (DiscountDto.cs:5-35)
 */
export interface Discount {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string; // C#: returns string from enum
  valueType: string; // C#: ValueType (added)
  value: number;
  minimumOrderAmount?: number; // C#: MinimumOrderAmount
  maximumDiscountAmount?: number; // C#: MaximumDiscountAmount
  minimumQuantity?: number; // C#: MinimumQuantity
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  usageLimit?: number; // C#: UsageLimit
  usageCount: number;
  isStackable: boolean; // C#: IsStackable (added)
  priority: number; // C#: Priority (added)
  applicability: string; // C#: Applicability (added)
  applicableProductIds?: string; // C#: string (JSON array)
  applicableCategoryIds?: string;
  applicableCustomerIds?: string;
  applicableCustomerGroupIds?: string;
  excludedProductIds?: string;
  excludedCategoryIds?: string;
  requiresCouponCode: boolean; // C#: RequiresCouponCode (added)
  createdAt: string;
  updatedAt?: string;
  isValid: boolean; // C#: IsValid (added)
}

/**
 * Backend: DiscountListDto (DiscountDto.cs:37-51)
 */
export interface DiscountListItem {
  id: string;
  code: string;
  name: string;
  type: string;
  valueType: string; // C#: ValueType (added)
  value: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  usageCount: number;
  usageLimit?: number;
  isValid: boolean; // C#: IsValid (added)
}

/**
 * Backend: CreateDiscountDto (DiscountDto.cs:53-76)
 */
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

/**
 * Backend: UpdateDiscountDto (DiscountDto.cs:78-91)
 */
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

/**
 * Backend: ApplyDiscountDto (DiscountDto.cs:93-98)
 */
export interface ApplyDiscountDto {
  code: string;
  orderAmount: number;
  quantity?: number;
}

/**
 * Backend: DiscountCalculationResultDto (DiscountDto.cs:100-105)
 */
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
// PROMOTIONS
// C#: PromotionDto.cs
// =====================================

/**
 * Backend: PromotionRuleDto (PromotionDto.cs:37-51)
 */
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

/**
 * Backend: PromotionDto (PromotionDto.cs:5-35)
 */
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

/**
 * Backend: PromotionListDto (PromotionDto.cs:53-66)
 */
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

/**
 * Backend: CreatePromotionDto (PromotionDto.cs:68-91)
 */
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

/**
 * Backend: CreatePromotionRuleDto (PromotionDto.cs:93-105)
 */
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

/**
 * Backend: UpdatePromotionDto (PromotionDto.cs:107-123)
 */
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
// COMMISSIONS
// C#: CommissionDto.cs
// =====================================

/**
 * Backend: CommissionTierDto (CommissionDto.cs:32-42)
 */
export interface CommissionTier {
  id: string;
  name?: string; // C#: Name (added)
  fromAmount: number;
  toAmount?: number;
  calculationType: string; // C#: CalculationType (added)
  rate: number;
  fixedAmount?: number; // C#: FixedAmount (added)
  sortOrder: number; // C#: SortOrder (added)
}

/**
 * Backend: CommissionPlanDto (CommissionDto.cs:5-30)
 */
export interface CommissionPlan {
  id: string;
  name: string;
  description?: string;
  type: string;
  calculationType: string; // C#: CalculationType (added)
  baseRate?: number;
  baseAmount?: number; // C#: BaseAmount (added)
  isActive: boolean;
  isTiered: boolean; // C#: IsTiered (added)
  startDate?: string;
  endDate?: string;
  applicableProductCategories?: string;
  applicableProducts?: string;
  excludedProducts?: string;
  applicableSalesPersons?: string;
  applicableRoles?: string;
  includeVat: boolean; // C#: IncludeVat (added)
  calculateOnProfit: boolean; // C#: CalculateOnProfit (added)
  minimumSaleAmount?: number;
  maximumCommissionAmount?: number;
  createdAt: string;
  updatedAt?: string;
  tiers: CommissionTier[];
}

/**
 * Backend: CommissionPlanListDto (CommissionDto.cs:44-56)
 */
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

/**
 * Backend: CreateCommissionPlanDto (CommissionDto.cs:58-78)
 */
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

/**
 * Backend: CreateCommissionTierDto (CommissionDto.cs:80-88)
 */
export interface CreateCommissionTierDto {
  name?: string;
  fromAmount: number;
  toAmount?: number;
  calculationType: CommissionCalculationType;
  rate: number;
  fixedAmount?: number;
}

/**
 * Backend: UpdateCommissionPlanDto (CommissionDto.cs:90-102)
 */
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

/**
 * Backend: SalesCommissionDto (CommissionDto.cs:104-124)
 */
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

/**
 * Backend: SalesCommissionListDto (CommissionDto.cs:126-137)
 */
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

/**
 * Backend: CommissionSummaryDto (CommissionDto.cs:149-160)
 */
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

/**
 * Backend: CalculateCommissionDto (CommissionDto.cs:139-147)
 */
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
// SALES RETURNS
// C#: SalesReturnDto.cs
// =====================================

/**
 * Backend: SalesReturnItemDto (SalesReturnDto.cs:43-62)
 */
export interface SalesReturnItem {
  id: string;
  salesReturnId: string;
  salesOrderItemId: string;
  productId: string;
  productName: string;
  productCode?: string;
  quantityOrdered: number; // C#: QuantityOrdered (added)
  quantityReturned: number; // C#: QuantityReturned (renamed from quantity)
  unit: string;
  unitPrice: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  condition: string; // C#: Condition (enum as string)
  conditionNotes?: string; // C#: ConditionNotes (added)
  isRestockable: boolean; // C#: IsRestockable (added)
  isRestocked: boolean;
}

/**
 * Backend: SalesReturnDto (SalesReturnDto.cs:5-41)
 */
export interface SalesReturn {
  id: string;
  returnNumber: string;
  returnDate: string;
  salesOrderId: string;
  salesOrderNumber: string;
  invoiceId?: string; // C#: InvoiceId (added)
  invoiceNumber?: string; // C#: InvoiceNumber (added)
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  type: string; // C#: Type (added - SalesReturnType)
  reason: string; // C#: Reason (enum as string)
  reasonDetails?: string;
  status: string; // C#: Status (enum as string)
  subTotal: number;
  vatAmount: number;
  totalAmount: number;
  refundAmount: number;
  refundMethod: string; // C#: RefundMethod (added)
  refundReference?: string;
  refundDate?: string; // C#: RefundDate (added)
  restockItems: boolean; // C#: RestockItems (added)
  restockWarehouseId?: string; // C#: RestockWarehouseId (added)
  isRestocked: boolean; // C#: IsRestocked (added)
  restockedDate?: string; // C#: RestockedDate (added)
  processedBy?: string; // C#: ProcessedBy (added)
  processedDate?: string; // C#: ProcessedDate (added)
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
  creditNoteId?: string; // C#: CreditNoteId (added)
  createdAt: string;
  updatedAt?: string;
  items: SalesReturnItem[];
}

/**
 * Backend: SalesReturnListDto (SalesReturnDto.cs:64-78)
 */
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

/**
 * Backend: SalesReturnSummaryDto (SalesReturnDto.cs:123-133)
 */
export interface SalesReturnSummary {
  totalReturns: number;
  pendingReturns: number;
  approvedReturns: number;
  completedReturns: number;
  totalRefundAmount: number;
  pendingRefundAmount: number;
  returnsByReason: Record<string, number>; // C#: Dictionary<string, int>
  refundsByMethod: Record<string, number>; // C#: Dictionary<string, decimal>
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

/**
 * Backend: CreateSalesReturnDto (SalesReturnDto.cs:80-91)
 */
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

/**
 * Backend: CreateSalesReturnItemDto (SalesReturnDto.cs:93-106)
 */
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

/**
 * Backend: UpdateSalesReturnDto (SalesReturnDto.cs:108-114)
 */
export interface UpdateSalesReturnDto {
  reasonDetails?: string;
  refundMethod?: RefundMethod;
  restockItems?: boolean;
  restockWarehouseId?: string;
  notes?: string;
}

/**
 * Backend: ProcessRefundDto (SalesReturnDto.cs:117-121)
 */
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
// SALES ORDERS
// C#: SalesOrderDto.cs
// =====================================

/**
 * Backend: SalesOrderItemDto (SalesOrderDto.cs:78-98)
 */
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
  lineNumber: number; // C#: LineNumber (added)
  deliveredQuantity: number; // C#: DeliveredQuantity (added)
  isDelivered: boolean; // C#: IsDelivered (added)
  createdAt: string;
  updatedAt?: string;
}

/**
 * Backend: SalesOrderDto (SalesOrderDto.cs:5-76)
 */
export interface SalesOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  deliveryDate?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  branchId?: string; // C#: BranchId (added)
  warehouseId?: string; // C#: WarehouseId (added)
  customerOrderNumber?: string; // C#: CustomerOrderNumber (added)
  subTotal: number;
  discountAmount: number;
  discountRate: number;
  vatAmount: number; // C#: VatAmount (renamed from taxTotal)
  totalAmount: number; // C#: TotalAmount (renamed from grandTotal)
  currency: string;
  exchangeRate: number; // C#: ExchangeRate (added)
  status: string;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
  salesPersonId?: string;
  salesPersonName?: string;
  isApproved: boolean; // C#: IsApproved (added)
  approvedBy?: string;
  approvedDate?: string;
  isCancelled: boolean; // C#: IsCancelled (added)
  cancellationReason?: string;
  createdAt: string;
  updatedAt?: string;
  items: SalesOrderItem[];
}

/**
 * Backend: SalesOrderListDto (SalesOrderDto.cs:127-158)
 */
export interface SalesOrderListItem {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerName?: string;
  totalAmount: number; // C#: TotalAmount (renamed from grandTotal)
  currency: string;
  status: string;
  isApproved: boolean; // C#: IsApproved (added)
  isCancelled: boolean; // C#: IsCancelled (added)
  itemCount: number;
  createdAt: string; // C#: CreatedAt (added)
}

export type SalesOrderStatus =
  | 'Draft'
  | 'Approved'
  | 'Confirmed'
  | 'Shipped'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled';

export interface SalesOrderStatistics {
  totalOrders: number;
  draftOrders: number;
  approvedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =====================================
// REQUEST TYPES
// =====================================

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
// SERVICE CLASS
// =====================================

const BASE_URL = '/sales/orders';

export class SalesService {
  // =====================================
  // SALES ORDERS
  // =====================================

  /**
   * Get all sales orders with pagination and filtering
   */
  static async getOrders(params?: GetSalesOrdersParams): Promise<PagedResult<SalesOrderListItem>> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
      if (params.status) queryParams.append('status', params.status);
      if (params.customerId) queryParams.append('customerId', params.customerId);
      if (params.salesPersonId) queryParams.append('salesPersonId', params.salesPersonId);
      if (params.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params.toDate) queryParams.append('toDate', params.toDate);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDescending !== undefined) queryParams.append('sortDescending', params.sortDescending.toString());
    }

    const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
    return ApiService.get<PagedResult<SalesOrderListItem>>(url);
  }

  /**
   * Get a single sales order by ID
   */
  static async getOrderById(id: string): Promise<SalesOrder> {
    return ApiService.get<SalesOrder>(`${BASE_URL}/${id}`);
  }

  /**
   * Get sales order statistics
   */
  static async getStatistics(fromDate?: string, toDate?: string): Promise<SalesOrderStatistics> {
    const queryParams = new URLSearchParams();
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);

    const url = queryParams.toString()
      ? `${BASE_URL}/statistics?${queryParams}`
      : `${BASE_URL}/statistics`;
    return ApiService.get<SalesOrderStatistics>(url);
  }

  /**
   * Create a new sales order
   */
  static async createOrder(data: CreateSalesOrderCommand): Promise<SalesOrder> {
    return ApiService.post<SalesOrder>(BASE_URL, data);
  }

  /**
   * Update an existing sales order
   */
  static async updateOrder(id: string, data: UpdateSalesOrderCommand): Promise<SalesOrder> {
    return ApiService.put<SalesOrder>(`${BASE_URL}/${id}`, { ...data, id });
  }

  /**
   * Add an item to a sales order
   */
  static async addItem(orderId: string, data: Omit<AddSalesOrderItemCommand, 'salesOrderId'>): Promise<SalesOrder> {
    return ApiService.post<SalesOrder>(`${BASE_URL}/${orderId}/items`, { ...data, salesOrderId: orderId });
  }

  /**
   * Remove an item from a sales order
   */
  static async removeItem(orderId: string, itemId: string): Promise<SalesOrder> {
    return ApiService.delete<SalesOrder>(`${BASE_URL}/${orderId}/items/${itemId}`);
  }

  /**
   * Approve a sales order
   */
  static async approveOrder(id: string): Promise<SalesOrder> {
    return ApiService.post<SalesOrder>(`${BASE_URL}/${id}/approve`);
  }

  /**
   * Cancel a sales order
   */
  static async cancelOrder(id: string, reason: string): Promise<SalesOrder> {
    return ApiService.post<SalesOrder>(`${BASE_URL}/${id}/cancel`, { id, reason });
  }

  /**
   * Confirm a sales order (customer confirmed)
   */
  static async confirmOrder(id: string): Promise<SalesOrder> {
    return ApiService.post<SalesOrder>(`${BASE_URL}/${id}/confirm`);
  }

  /**
   * Ship a sales order
   */
  static async shipOrder(id: string): Promise<SalesOrder> {
    return ApiService.post<SalesOrder>(`${BASE_URL}/${id}/ship`);
  }

  /**
   * Mark a sales order as delivered
   */
  static async deliverOrder(id: string): Promise<SalesOrder> {
    return ApiService.post<SalesOrder>(`${BASE_URL}/${id}/deliver`);
  }

  /**
   * Complete a sales order
   */
  static async completeOrder(id: string): Promise<SalesOrder> {
    return ApiService.post<SalesOrder>(`${BASE_URL}/${id}/complete`);
  }

  /**
   * Delete a sales order
   */
  static async deleteOrder(id: string): Promise<void> {
    return ApiService.delete<void>(`${BASE_URL}/${id}`);
  }

  // =====================================
  // QUOTATIONS
  // =====================================

  /**
   * Get all quotations with pagination and filtering
   */
  static async getQuotations(params?: GetQuotationsParams): Promise<PagedResult<QuotationListItem>> {
    return ApiService.get<PagedResult<QuotationListItem>>('/sales/quotations', { params });
  }

  /**
   * Get a single quotation by ID
   */
  static async getQuotationById(id: string): Promise<Quotation> {
    return ApiService.get<Quotation>(`/sales/quotations/${id}`);
  }

  /**
   * Get quotations by customer
   */
  static async getQuotationsByCustomer(customerId: string, page: number = 1, pageSize: number = 20): Promise<PagedResult<QuotationListItem>> {
    return ApiService.get<PagedResult<QuotationListItem>>(`/sales/quotations/customer/${customerId}`, {
      params: { page, pageSize },
    });
  }

  /**
   * Get quotations by sales person
   */
  static async getQuotationsBySalesPerson(salesPersonId: string, page: number = 1, pageSize: number = 20): Promise<PagedResult<QuotationListItem>> {
    return ApiService.get<PagedResult<QuotationListItem>>(`/sales/quotations/salesperson/${salesPersonId}`, {
      params: { page, pageSize },
    });
  }

  /**
   * Get expiring quotations
   */
  static async getExpiringQuotations(daysUntilExpiry: number = 7): Promise<QuotationListItem[]> {
    return ApiService.get<QuotationListItem[]>('/sales/quotations/expiring', {
      params: { daysUntilExpiry },
    });
  }

  /**
   * Get quotation revisions
   */
  static async getQuotationRevisions(id: string): Promise<QuotationListItem[]> {
    return ApiService.get<QuotationListItem[]>(`/sales/quotations/${id}/revisions`);
  }

  /**
   * Get quotation statistics
   */
  static async getQuotationStatistics(fromDate?: string, toDate?: string): Promise<QuotationStatistics> {
    return ApiService.get<QuotationStatistics>('/sales/quotations/statistics', {
      params: { fromDate, toDate },
    });
  }

  /**
   * Create a new quotation
   */
  static async createQuotation(data: CreateQuotationDto): Promise<Quotation> {
    return ApiService.post<Quotation>('/sales/quotations', data);
  }

  /**
   * Update a quotation
   */
  static async updateQuotation(id: string, data: UpdateQuotationDto): Promise<Quotation> {
    return ApiService.put<Quotation>(`/sales/quotations/${id}`, data);
  }

  /**
   * Add item to quotation
   */
  static async addQuotationItem(quotationId: string, item: CreateQuotationItemDto): Promise<Quotation> {
    return ApiService.post<Quotation>(`/sales/quotations/${quotationId}/items`, item);
  }

  /**
   * Remove item from quotation
   */
  static async removeQuotationItem(quotationId: string, itemId: string): Promise<Quotation> {
    return ApiService.delete<Quotation>(`/sales/quotations/${quotationId}/items/${itemId}`);
  }

  /**
   * Submit quotation for approval
   */
  static async submitQuotationForApproval(id: string): Promise<Quotation> {
    return ApiService.post<Quotation>(`/sales/quotations/${id}/submit-for-approval`);
  }

  /**
   * Approve a quotation
   */
  static async approveQuotation(id: string): Promise<Quotation> {
    return ApiService.post<Quotation>(`/sales/quotations/${id}/approve`);
  }

  /**
   * Send a quotation
   */
  static async sendQuotation(id: string): Promise<Quotation> {
    return ApiService.post<Quotation>(`/sales/quotations/${id}/send`);
  }

  /**
   * Accept a quotation
   */
  static async acceptQuotation(id: string): Promise<Quotation> {
    return ApiService.post<Quotation>(`/sales/quotations/${id}/accept`);
  }

  /**
   * Reject a quotation
   */
  static async rejectQuotation(id: string, reason: string): Promise<Quotation> {
    return ApiService.post<Quotation>(`/sales/quotations/${id}/reject`, { reason });
  }

  /**
   * Cancel a quotation
   */
  static async cancelQuotation(id: string, reason: string): Promise<Quotation> {
    return ApiService.post<Quotation>(`/sales/quotations/${id}/cancel`, { reason });
  }

  /**
   * Convert quotation to order
   */
  static async convertQuotationToOrder(id: string): Promise<{ orderId: string }> {
    return ApiService.post<{ orderId: string }>(`/sales/quotations/${id}/convert-to-order`);
  }

  /**
   * Create quotation revision
   */
  static async createQuotationRevision(id: string): Promise<Quotation> {
    return ApiService.post<Quotation>(`/sales/quotations/${id}/create-revision`);
  }

  /**
   * Delete a quotation
   */
  static async deleteQuotation(id: string): Promise<void> {
    return ApiService.delete<void>(`/sales/quotations/${id}`);
  }

  // =====================================
  // DISCOUNTS
  // =====================================

  /**
   * Get all discounts with pagination and filtering
   */
  static async getDiscounts(params?: GetDiscountsParams): Promise<PagedResult<DiscountListItem>> {
    return ApiService.get<PagedResult<DiscountListItem>>('/sales/discounts', { params });
  }

  /**
   * Get a single discount by ID
   */
  static async getDiscountById(id: string): Promise<Discount> {
    return ApiService.get<Discount>(`/sales/discounts/${id}`);
  }

  /**
   * Get discount by code
   */
  static async getDiscountByCode(code: string): Promise<Discount> {
    return ApiService.get<Discount>(`/sales/discounts/code/${encodeURIComponent(code)}`);
  }

  /**
   * Get active discounts
   */
  static async getActiveDiscounts(): Promise<DiscountListItem[]> {
    return ApiService.get<DiscountListItem[]>('/sales/discounts/active');
  }

  /**
   * Validate discount code
   */
  static async validateDiscountCode(data: ApplyDiscountDto): Promise<DiscountValidationResult> {
    return ApiService.post<DiscountValidationResult>('/sales/discounts/validate', data);
  }

  /**
   * Create a new discount
   */
  static async createDiscount(data: CreateDiscountDto): Promise<Discount> {
    return ApiService.post<Discount>('/sales/discounts', data);
  }

  /**
   * Update a discount
   */
  static async updateDiscount(id: string, data: UpdateDiscountDto): Promise<Discount> {
    return ApiService.put<Discount>(`/sales/discounts/${id}`, data);
  }

  /**
   * Activate a discount
   */
  static async activateDiscount(id: string): Promise<Discount> {
    return ApiService.post<Discount>(`/sales/discounts/${id}/activate`);
  }

  /**
   * Deactivate a discount
   */
  static async deactivateDiscount(id: string): Promise<Discount> {
    return ApiService.post<Discount>(`/sales/discounts/${id}/deactivate`);
  }

  /**
   * Delete a discount
   */
  static async deleteDiscount(id: string): Promise<void> {
    return ApiService.delete<void>(`/sales/discounts/${id}`);
  }

  // =====================================
  // COMMISSION PLANS
  // =====================================

  /**
   * Get all commission plans with pagination and filtering
   */
  static async getCommissionPlans(params?: GetCommissionPlansParams): Promise<PagedResult<CommissionPlanListItem>> {
    return ApiService.get<PagedResult<CommissionPlanListItem>>('/sales/commissions/plans', { params });
  }

  /**
   * Get a single commission plan by ID
   */
  static async getCommissionPlanById(id: string): Promise<CommissionPlan> {
    return ApiService.get<CommissionPlan>(`/sales/commissions/plans/${id}`);
  }

  /**
   * Get active commission plans
   */
  static async getActiveCommissionPlans(): Promise<CommissionPlanListItem[]> {
    return ApiService.get<CommissionPlanListItem[]>('/sales/commissions/plans/active');
  }

  /**
   * Create a new commission plan
   */
  static async createCommissionPlan(data: CreateCommissionPlanDto): Promise<CommissionPlan> {
    return ApiService.post<CommissionPlan>('/sales/commissions/plans', data);
  }

  /**
   * Update a commission plan
   */
  static async updateCommissionPlan(id: string, data: UpdateCommissionPlanDto): Promise<CommissionPlan> {
    return ApiService.put<CommissionPlan>(`/sales/commissions/plans/${id}`, data);
  }

  /**
   * Add tier to commission plan
   */
  static async addCommissionTier(planId: string, tier: CreateCommissionTierDto): Promise<CommissionPlan> {
    return ApiService.post<CommissionPlan>(`/sales/commissions/plans/${planId}/tiers`, tier);
  }

  /**
   * Remove tier from commission plan
   */
  static async removeCommissionTier(planId: string, tierId: string): Promise<CommissionPlan> {
    return ApiService.delete<CommissionPlan>(`/sales/commissions/plans/${planId}/tiers/${tierId}`);
  }

  /**
   * Activate a commission plan
   */
  static async activateCommissionPlan(id: string): Promise<CommissionPlan> {
    return ApiService.post<CommissionPlan>(`/sales/commissions/plans/${id}/activate`);
  }

  /**
   * Deactivate a commission plan
   */
  static async deactivateCommissionPlan(id: string): Promise<CommissionPlan> {
    return ApiService.post<CommissionPlan>(`/sales/commissions/plans/${id}/deactivate`);
  }

  /**
   * Delete a commission plan
   */
  static async deleteCommissionPlan(id: string): Promise<void> {
    return ApiService.delete<void>(`/sales/commissions/plans/${id}`);
  }

  // =====================================
  // SALES COMMISSIONS
  // =====================================

  /**
   * Get all sales commissions with pagination and filtering
   */
  static async getSalesCommissions(params?: GetSalesCommissionsParams): Promise<PagedResult<SalesCommissionListItem>> {
    return ApiService.get<PagedResult<SalesCommissionListItem>>('/sales/commissions', { params });
  }

  /**
   * Get a single sales commission by ID
   */
  static async getSalesCommissionById(id: string): Promise<SalesCommission> {
    return ApiService.get<SalesCommission>(`/sales/commissions/${id}`);
  }

  /**
   * Get commissions by sales person
   */
  static async getCommissionsBySalesPerson(salesPersonId: string, fromDate?: string, toDate?: string): Promise<SalesCommissionListItem[]> {
    return ApiService.get<SalesCommissionListItem[]>(`/sales/commissions/salesperson/${salesPersonId}`, {
      params: { fromDate, toDate },
    });
  }

  /**
   * Get pending commissions
   */
  static async getPendingCommissions(): Promise<SalesCommissionListItem[]> {
    return ApiService.get<SalesCommissionListItem[]>('/sales/commissions/pending');
  }

  /**
   * Get approved commissions
   */
  static async getApprovedCommissions(): Promise<SalesCommissionListItem[]> {
    return ApiService.get<SalesCommissionListItem[]>('/sales/commissions/approved');
  }

  /**
   * Get commission summary
   */
  static async getCommissionSummary(fromDate?: string, toDate?: string): Promise<CommissionSummary> {
    return ApiService.get<CommissionSummary>('/sales/commissions/summary', {
      params: { fromDate, toDate },
    });
  }

  /**
   * Get sales person commission summary
   */
  static async getSalesPersonCommissionSummary(salesPersonId: string, fromDate?: string, toDate?: string): Promise<SalesPersonCommissionSummary> {
    return ApiService.get<SalesPersonCommissionSummary>(`/sales/commissions/summary/salesperson/${salesPersonId}`, {
      params: { fromDate, toDate },
    });
  }

  /**
   * Calculate commission for a sale
   */
  static async calculateCommission(data: CalculateCommissionDto): Promise<SalesCommission> {
    return ApiService.post<SalesCommission>('/sales/commissions/calculate', data);
  }

  /**
   * Approve a sales commission
   */
  static async approveCommission(id: string): Promise<SalesCommission> {
    return ApiService.post<SalesCommission>(`/sales/commissions/${id}/approve`);
  }

  /**
   * Reject a sales commission
   */
  static async rejectCommission(id: string, reason: string): Promise<SalesCommission> {
    return ApiService.post<SalesCommission>(`/sales/commissions/${id}/reject`, { reason });
  }

  /**
   * Mark commission as paid
   */
  static async markCommissionAsPaid(id: string, paymentReference: string): Promise<SalesCommission> {
    return ApiService.post<SalesCommission>(`/sales/commissions/${id}/mark-paid`, { paymentReference });
  }

  /**
   * Cancel a sales commission
   */
  static async cancelCommission(id: string, reason: string): Promise<SalesCommission> {
    return ApiService.post<SalesCommission>(`/sales/commissions/${id}/cancel`, { reason });
  }

  /**
   * Bulk approve commissions
   */
  static async bulkApproveCommissions(ids: string[]): Promise<{ approvedCount: number }> {
    return ApiService.post<{ approvedCount: number }>('/sales/commissions/bulk/approve', { ids });
  }

  /**
   * Bulk mark commissions as paid
   */
  static async bulkMarkCommissionsAsPaid(ids: string[], paymentReference: string): Promise<{ paidCount: number }> {
    return ApiService.post<{ paidCount: number }>('/sales/commissions/bulk/mark-paid', { ids, paymentReference });
  }

  // =====================================
  // SALES RETURNS
  // =====================================

  /**
   * Get all sales returns with pagination and filtering
   */
  static async getSalesReturns(params?: GetSalesReturnsParams): Promise<PagedResult<SalesReturnListItem>> {
    return ApiService.get<PagedResult<SalesReturnListItem>>('/sales/salesreturns', { params });
  }

  /**
   * Get a single sales return by ID
   */
  static async getSalesReturnById(id: string): Promise<SalesReturn> {
    return ApiService.get<SalesReturn>(`/sales/salesreturns/${id}`);
  }

  /**
   * Get sales returns by order
   */
  static async getSalesReturnsByOrder(orderId: string): Promise<SalesReturnListItem[]> {
    return ApiService.get<SalesReturnListItem[]>(`/sales/salesreturns/order/${orderId}`);
  }

  /**
   * Get sales returns by customer
   */
  static async getSalesReturnsByCustomer(customerId: string, page: number = 1, pageSize: number = 20): Promise<PagedResult<SalesReturnListItem>> {
    return ApiService.get<PagedResult<SalesReturnListItem>>(`/sales/salesreturns/customer/${customerId}`, {
      params: { page, pageSize },
    });
  }

  /**
   * Get pending returns
   */
  static async getPendingReturns(): Promise<SalesReturnListItem[]> {
    return ApiService.get<SalesReturnListItem[]>('/sales/salesreturns/pending');
  }

  /**
   * Get return summary
   */
  static async getReturnSummary(fromDate?: string, toDate?: string): Promise<SalesReturnSummary> {
    return ApiService.get<SalesReturnSummary>('/sales/salesreturns/summary', {
      params: { fromDate, toDate },
    });
  }

  /**
   * Get returnable items for an order
   */
  static async getReturnableItems(orderId: string): Promise<ReturnableItem[]> {
    return ApiService.get<ReturnableItem[]>(`/sales/salesreturns/returnable-items/${orderId}`);
  }

  /**
   * Create a new sales return
   */
  static async createSalesReturn(data: CreateSalesReturnDto): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>('/sales/salesreturns', data);
  }

  /**
   * Update a sales return
   */
  static async updateSalesReturn(id: string, data: UpdateSalesReturnDto): Promise<SalesReturn> {
    return ApiService.put<SalesReturn>(`/sales/salesreturns/${id}`, data);
  }

  /**
   * Add item to sales return
   */
  static async addSalesReturnItem(returnId: string, item: CreateSalesReturnItemDto): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`/sales/salesreturns/${returnId}/items`, item);
  }

  /**
   * Remove item from sales return
   */
  static async removeSalesReturnItem(returnId: string, itemId: string): Promise<SalesReturn> {
    return ApiService.delete<SalesReturn>(`/sales/salesreturns/${returnId}/items/${itemId}`);
  }

  /**
   * Submit a sales return
   */
  static async submitSalesReturn(id: string): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`/sales/salesreturns/${id}/submit`);
  }

  /**
   * Approve a sales return
   */
  static async approveSalesReturn(id: string): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`/sales/salesreturns/${id}/approve`);
  }

  /**
   * Reject a sales return
   */
  static async rejectSalesReturn(id: string, reason: string): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`/sales/salesreturns/${id}/reject`, { reason });
  }

  /**
   * Receive a sales return
   */
  static async receiveSalesReturn(id: string): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`/sales/salesreturns/${id}/receive`);
  }

  /**
   * Process refund for a sales return
   */
  static async processRefund(id: string, data: ProcessRefundDto): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`/sales/salesreturns/${id}/process-refund`, data);
  }

  /**
   * Complete a sales return
   */
  static async completeSalesReturn(id: string): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`/sales/salesreturns/${id}/complete`);
  }

  /**
   * Cancel a sales return
   */
  static async cancelSalesReturn(id: string, reason: string): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`/sales/salesreturns/${id}/cancel`, { reason });
  }

  /**
   * Mark item as restocked
   */
  static async markItemAsRestocked(returnId: string, itemId: string): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`/sales/salesreturns/${returnId}/items/${itemId}/mark-restocked`);
  }

  /**
   * Mark entire return as restocked
   */
  static async markReturnAsRestocked(id: string): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`/sales/salesreturns/${id}/mark-restocked`);
  }

  /**
   * Delete a sales return
   */
  static async deleteSalesReturn(id: string): Promise<void> {
    return ApiService.delete<void>(`/sales/salesreturns/${id}`);
  }
}

export default SalesService;
