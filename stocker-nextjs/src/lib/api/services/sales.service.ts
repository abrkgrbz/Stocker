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
  // UI aliases for backwards compatibility
  validUntil?: string; // alias for expirationDate
  contactEmail?: string; // alias for customerEmail
  contactPhone?: string; // alias for customerPhone
  taxAmount?: number; // alias for vatAmount
  taxTotal?: number; // alias for vatAmount
  grandTotal?: number; // alias for totalAmount
  approvedAt?: string; // alias for approvedDate
  sentAt?: string; // alias for sentDate
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
  productId?: number;
  productCode?: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  description?: string;
  discountRate?: number;
  discountAmount?: number;
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
 * Extended with UI-required fields
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
  // UI-required fields (aliases/computed)
  percentage?: number; // alias for value when type=Percentage
  amount?: number; // alias for value when type=FixedAmount
  minimumAmount?: number; // alias for minimumOrderAmount
  maximumDiscount?: number; // alias for maximumDiscountAmount
  maxUsageCount?: number; // alias for usageLimit
  maxUsagePerCustomer?: number;
  firstOrderOnly?: boolean;
  canCombine?: boolean; // alias for isStackable
  totalDiscountGiven?: number;
}

/**
 * Backend: DiscountListDto (DiscountDto.cs:37-51)
 * Extended with UI-required fields
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
  // UI-required fields
  percentage?: number;
  amount?: number;
  maxUsageCount?: number;
}

/**
 * Backend: CreateDiscountDto (DiscountDto.cs:53-76)
 * Extended with UI-required fields
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
  // UI-required fields (aliases)
  percentage?: number;
  amount?: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  maxUsageCount?: number;
  maxUsagePerCustomer?: number;
  firstOrderOnly?: boolean;
  canCombine?: boolean;
  isActive?: boolean;
}

/**
 * Backend: UpdateDiscountDto (DiscountDto.cs:78-91)
 * Extended with UI-required fields
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
  // UI-required fields
  code?: string;
  type?: DiscountType;
  valueType?: DiscountValueType;
  percentage?: number;
  amount?: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  maxUsageCount?: number;
  maxUsagePerCustomer?: number;
  firstOrderOnly?: boolean;
  canCombine?: boolean;
  isActive?: boolean;
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
 * Extended with UI-required fields
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
  // UI-required fields (aliases)
  fixedAmount?: number;
  minimumSalesAmount?: number; // alias for minimumSaleAmount
  maximumCommission?: number; // alias for maximumCommissionAmount
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
 * Extended with UI-required fields
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
  // UI-required fields
  fixedAmount?: number;
  isActive?: boolean;
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
 * Extended with UI-required fields
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
  // UI-required fields
  type?: CommissionType;
  fixedAmount?: number;
  minimumSalesAmount?: number;
  maximumCommission?: number;
  isActive?: boolean;
}

/**
 * Backend: SalesCommissionDto (CommissionDto.cs:104-124)
 * Extended with UI-required fields
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
  // UI-required fields (mapped from backend or computed)
  referenceNumber?: string;
  planName?: string;
  orderId?: string;
  orderNumber?: string;
  orderAmount?: number;
  customerName?: string;
  orderDate?: string;
  paidAt?: string; // alias for paidDate
  approvedAt?: string; // alias for approvedDate
  rejectedAt?: string;
  rejectionReason?: string;
}

/**
 * Backend: SalesCommissionListDto (CommissionDto.cs:126-137)
 * Extended with UI-required fields
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
  // UI-required fields
  orderId?: string;
}

/**
 * Backend: CommissionSummaryDto (CommissionDto.cs:149-160)
 * Extended with UI-required fields
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
  // UI-required fields
  pendingCount?: number;
  approvedCount?: number;
  paidAmount?: number;
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
  // UI aliases for backwards compatibility
  currency?: string; // UI field (default TRY)
  orderId?: string; // alias for salesOrderId
  orderNumber?: string; // alias for salesOrderNumber
  submittedAt?: string; // alias for createdAt
  receivedAt?: string; // alias for processedDate
  completedAt?: string; // alias for refundDate
  refundedAt?: string; // alias for refundDate
  approvedAt?: string; // alias for approvedDate
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
  // UI aliases
  orderId?: string; // UI field
  currency?: string; // UI field
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
  // UI fields
  returnDate?: string;
}

/**
 * Backend: CreateSalesReturnItemDto (SalesReturnDto.cs:93-106)
 */
export interface CreateSalesReturnItemDto {
  quantity?: number;
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
  reason?: string; // UI field for item-level reason
}

/**
 * Backend: UpdateSalesReturnDto (SalesReturnDto.cs:108-114)
 */
export interface UpdateSalesReturnDto {
  reason?: string;
  returnDate?: string; // UI field
  reasonDetails?: string;
  refundMethod?: RefundMethod;
  restockItems?: boolean;
  restockWarehouseId?: string;
  notes?: string;
  items?: CreateSalesReturnItemDto[]; // UI field for editing items
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
  // UI-required fields
  approvedAt?: string; // alias for approvedDate
  cancelledAt?: string;
  cancelledReason?: string; // alias for cancellationReason
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
  static async getSalesPersonCommissionSummary(salesPersonId: string, fromDate?: string, toDate?: string): Promise<CommissionSummary> {
    return ApiService.get<CommissionSummary>(`/sales/commissions/summary/salesperson/${salesPersonId}`, {
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

  // =====================================
  // CUSTOMER CONTRACTS
  // =====================================

  static async getCustomerContracts(params?: CustomerContractQueryParams): Promise<PagedResult<CustomerContractListDto>> {
    return ApiService.get<PagedResult<CustomerContractListDto>>('/sales/customercontracts', { params });
  }

  static async getCustomerContract(id: string): Promise<CustomerContractDto> {
    return ApiService.get<CustomerContractDto>(`/sales/customercontracts/${id}`);
  }

  static async getCustomerContractByNumber(contractNumber: string): Promise<CustomerContractDto> {
    return ApiService.get<CustomerContractDto>(`/sales/customercontracts/by-number/${contractNumber}`);
  }

  static async getCustomerContractsByCustomer(customerId: string): Promise<CustomerContractListDto[]> {
    return ApiService.get<CustomerContractListDto[]>(`/sales/customercontracts/by-customer/${customerId}`);
  }

  static async getActiveContractsByCustomer(customerId: string): Promise<CustomerContractListDto[]> {
    return ApiService.get<CustomerContractListDto[]>(`/sales/customercontracts/by-customer/${customerId}/active`);
  }

  static async createCustomerContract(data: CreateCustomerContractCommand): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>('/sales/customercontracts', data);
  }

  static async updateCustomerContract(id: string, data: UpdateCustomerContractCommand): Promise<CustomerContractDto> {
    return ApiService.put<CustomerContractDto>(`/sales/customercontracts/${id}`, data);
  }

  static async deleteCustomerContract(id: string): Promise<void> {
    return ApiService.delete<void>(`/sales/customercontracts/${id}`);
  }

  static async activateContract(id: string): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`/sales/customercontracts/${id}/activate`);
  }

  static async suspendContract(id: string, reason: string): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`/sales/customercontracts/${id}/suspend`, { reason });
  }

  static async terminateContract(id: string, data: TerminateContractCommand): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`/sales/customercontracts/${id}/terminate`, data);
  }

  static async renewContract(id: string, extensionMonths?: number): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`/sales/customercontracts/${id}/renew`, { extensionMonths });
  }

  static async blockContract(id: string, reason: string): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`/sales/customercontracts/${id}/block`, { reason });
  }

  static async unblockContract(id: string, notes?: string): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`/sales/customercontracts/${id}/unblock`, { notes });
  }

  static async updateCreditLimit(id: string, data: UpdateCreditLimitCommand): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`/sales/customercontracts/${id}/credit-limit`, data);
  }

  static async configureSLA(id: string, data: ConfigureSLACommand): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`/sales/customercontracts/${id}/sla`, data);
  }

  static async addPriceAgreement(id: string, data: AddPriceAgreementCommand): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`/sales/customercontracts/${id}/price-agreements`, data);
  }

  static async addPaymentTerm(id: string, data: AddPaymentTermCommand): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`/sales/customercontracts/${id}/payment-terms`, data);
  }

  static async addCommitment(id: string, data: AddCommitmentCommand): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`/sales/customercontracts/${id}/commitments`, data);
  }

  static async removePriceAgreement(contractId: string, agreementId: string): Promise<void> {
    return ApiService.delete<void>(`/sales/customercontracts/${contractId}/price-agreements/${agreementId}`);
  }

  static async removePaymentTerm(contractId: string, termId: string): Promise<void> {
    return ApiService.delete<void>(`/sales/customercontracts/${contractId}/payment-terms/${termId}`);
  }

  static async removeCommitment(contractId: string, commitmentId: string): Promise<void> {
    return ApiService.delete<void>(`/sales/customercontracts/${contractId}/commitments/${commitmentId}`);
  }

  // =====================================
  // SALES TERRITORIES
  // =====================================

  static async getSalesTerritories(params?: SalesTerritoryQueryParams): Promise<PagedResult<SalesTerritoryListDto>> {
    return ApiService.get<PagedResult<SalesTerritoryListDto>>('/sales/territories', { params });
  }

  static async getSalesTerritory(id: string): Promise<SalesTerritoryDto> {
    return ApiService.get<SalesTerritoryDto>(`/sales/territories/${id}`);
  }

  static async getSalesTerritoryByCode(code: string): Promise<SalesTerritoryDto> {
    return ApiService.get<SalesTerritoryDto>(`/sales/territories/by-code/${code}`);
  }

  static async getChildTerritories(parentId: string): Promise<SalesTerritoryListDto[]> {
    return ApiService.get<SalesTerritoryListDto[]>(`/sales/territories/${parentId}/children`);
  }

  static async getRootTerritories(): Promise<SalesTerritoryListDto[]> {
    return ApiService.get<SalesTerritoryListDto[]>('/sales/territories/roots');
  }

  static async createSalesTerritory(data: CreateSalesTerritoryCommand): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>('/sales/territories', data);
  }

  static async updateSalesTerritory(id: string, data: UpdateSalesTerritoryCommand): Promise<SalesTerritoryDto> {
    return ApiService.put<SalesTerritoryDto>(`/sales/territories/${id}`, data);
  }

  static async deleteSalesTerritory(id: string): Promise<void> {
    return ApiService.delete<void>(`/sales/territories/${id}`);
  }

  static async activateTerritory(id: string): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(`/sales/territories/${id}/activate`);
  }

  static async deactivateTerritory(id: string): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(`/sales/territories/${id}/deactivate`);
  }

  static async suspendTerritory(id: string, reason: string): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(`/sales/territories/${id}/suspend`, { reason });
  }

  static async assignManager(id: string, managerId: string, managerName: string): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(`/sales/territories/${id}/manager`, { managerId, managerName });
  }

  static async removeManager(id: string): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(`/sales/territories/${id}/manager/remove`);
  }

  static async assignSalesRep(id: string, data: AssignSalesRepCommand): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(`/sales/territories/${id}/assignments`, data);
  }

  static async removeAssignment(id: string, assignmentId: string): Promise<SalesTerritoryDto> {
    return ApiService.delete<SalesTerritoryDto>(`/sales/territories/${id}/assignments/${assignmentId}`);
  }

  static async assignCustomer(id: string, data: AssignCustomerToTerritoryCommand): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(`/sales/territories/${id}/customers`, data);
  }

  static async removeCustomer(id: string, customerId: string): Promise<SalesTerritoryDto> {
    return ApiService.delete<SalesTerritoryDto>(`/sales/territories/${id}/customers/${customerId}`);
  }

  static async addPostalCode(id: string, postalCode: string, areaName?: string): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(`/sales/territories/${id}/postal-codes`, { postalCode, areaName });
  }

  static async removePostalCode(id: string, postalCodeId: string): Promise<SalesTerritoryDto> {
    return ApiService.delete<SalesTerritoryDto>(`/sales/territories/${id}/postal-codes/${postalCodeId}`);
  }

  static async removeSalesRep(territoryId: string, repId: string): Promise<void> {
    return ApiService.delete<void>(`/sales/territories/${territoryId}/reps/${repId}`);
  }

  static async assignCustomerToTerritory(territoryId: string, customerId: string): Promise<void> {
    return ApiService.post<void>(`/sales/territories/${territoryId}/customers/${customerId}`);
  }

  static async removeCustomerFromTerritory(territoryId: string, customerId: string): Promise<void> {
    return ApiService.delete<void>(`/sales/territories/${territoryId}/customers/${customerId}`);
  }

  static async setQuota(territoryId: string, data: { year: number; month: number; amount: number }): Promise<void> {
    return ApiService.post<void>(`/sales/territories/${territoryId}/quota`, data);
  }

  // =====================================
  // SHIPMENTS
  // =====================================

  static async getShipments(params?: ShipmentQueryParams): Promise<PagedResult<ShipmentListDto>> {
    return ApiService.get<PagedResult<ShipmentListDto>>('/sales/shipments', { params });
  }

  static async getShipment(id: string): Promise<ShipmentDto> {
    return ApiService.get<ShipmentDto>(`/sales/shipments/${id}`);
  }

  static async getShipmentByNumber(shipmentNumber: string): Promise<ShipmentDto> {
    return ApiService.get<ShipmentDto>(`/sales/shipments/by-number/${shipmentNumber}`);
  }

  static async getShipmentsByOrder(orderId: string): Promise<ShipmentListDto[]> {
    return ApiService.get<ShipmentListDto[]>(`/sales/shipments/by-order/${orderId}`);
  }

  static async getShipmentsByCustomer(customerId: string): Promise<ShipmentListDto[]> {
    return ApiService.get<ShipmentListDto[]>(`/sales/shipments/by-customer/${customerId}`);
  }

  static async getPendingShipments(): Promise<ShipmentListDto[]> {
    return ApiService.get<ShipmentListDto[]>('/sales/shipments/pending');
  }

  static async getInTransitShipments(): Promise<ShipmentListDto[]> {
    return ApiService.get<ShipmentListDto[]>('/sales/shipments/in-transit');
  }

  static async getOverdueShipments(): Promise<ShipmentListDto[]> {
    return ApiService.get<ShipmentListDto[]>('/sales/shipments/overdue');
  }

  static async createShipment(data: CreateShipmentCommand): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>('/sales/shipments', data);
  }

  static async createShipmentFromOrder(data: CreateShipmentFromOrderCommand): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>('/sales/shipments/from-order', data);
  }

  static async updateShipment(id: string, data: UpdateShipmentCommand): Promise<ShipmentDto> {
    return ApiService.put<ShipmentDto>(`/sales/shipments/${id}`, data);
  }

  static async deleteShipment(id: string): Promise<void> {
    return ApiService.delete<void>(`/sales/shipments/${id}`);
  }

  static async confirmShipment(id: string): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`/sales/shipments/${id}/confirm`);
  }

  static async pickShipment(id: string): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`/sales/shipments/${id}/pick`);
  }

  static async packShipment(id: string): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`/sales/shipments/${id}/pack`);
  }

  static async shipShipment(id: string, data: ShipShipmentCommand): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`/sales/shipments/${id}/ship`, data);
  }

  static async deliverShipment(id: string, data: DeliverShipmentCommand): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`/sales/shipments/${id}/deliver`, data);
  }

  static async cancelShipment(id: string, reason: string): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`/sales/shipments/${id}/cancel`, { reason });
  }


  static async startPreparing(id: string): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`/sales/shipments/${id}/start-preparing`, {});
  }

  static async markInTransit(id: string): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`/sales/shipments/${id}/in-transit`, {});
  }

  static async markOutForDelivery(id: string): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`/sales/shipments/${id}/out-for-delivery`, {});
  }

  static async markFailed(id: string, reason: string): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`/sales/shipments/${id}/failed`, { reason });
  }
  static async addShipmentItem(id: string, data: AddShipmentItemCommand): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`/sales/shipments/${id}/items`, data);
  }

  static async updateShipmentItem(id: string, itemId: string, data: UpdateShipmentItemCommand): Promise<ShipmentDto> {
    return ApiService.put<ShipmentDto>(`/sales/shipments/${id}/items/${itemId}`, data);
  }

  static async removeShipmentItem(id: string, itemId: string): Promise<ShipmentDto> {
    return ApiService.delete<ShipmentDto>(`/sales/shipments/${id}/items/${itemId}`);
  }

  static async updateTrackingInfo(id: string, data: UpdateTrackingCommand): Promise<ShipmentDto> {
    return ApiService.put<ShipmentDto>(`/sales/shipments/${id}/tracking`, data);
  }

  // =====================================
  // ADVANCE PAYMENTS
  // =====================================

  static async getAdvancePayments(params?: AdvancePaymentQueryParams): Promise<PagedResult<AdvancePaymentListDto>> {
    return ApiService.get<PagedResult<AdvancePaymentListDto>>('/sales/advance-payments', { params });
  }

  static async getAdvancePayment(id: string): Promise<AdvancePaymentDto> {
    return ApiService.get<AdvancePaymentDto>(`/sales/advance-payments/${id}`);
  }

  static async getAdvancePaymentsByCustomer(customerId: string): Promise<AdvancePaymentListDto[]> {
    return ApiService.get<AdvancePaymentListDto[]>(`/sales/advance-payments/by-customer/${customerId}`);
  }

  static async getAdvancePaymentStatistics(): Promise<AdvancePaymentStatisticsDto> {
    return ApiService.get<AdvancePaymentStatisticsDto>('/sales/advance-payments/statistics');
  }

  static async createAdvancePayment(data: CreateAdvancePaymentCommand): Promise<AdvancePaymentDto> {
    return ApiService.post<AdvancePaymentDto>('/sales/advance-payments', data);
  }

  static async updateAdvancePayment(id: string, data: UpdateAdvancePaymentCommand): Promise<AdvancePaymentDto> {
    return ApiService.put<AdvancePaymentDto>(`/sales/advance-payments/${id}`, data);
  }

  static async deleteAdvancePayment(id: string): Promise<void> {
    return ApiService.delete<void>(`/sales/advance-payments/${id}`);
  }

  static async captureAdvancePayment(id: string): Promise<AdvancePaymentDto> {
    return ApiService.post<AdvancePaymentDto>(`/sales/advance-payments/${id}/capture`);
  }

  static async applyAdvancePayment(id: string, data: ApplyAdvancePaymentCommand): Promise<AdvancePaymentDto> {
    return ApiService.post<AdvancePaymentDto>(`/sales/advance-payments/${id}/apply`, data);
  }

  static async refundAdvancePayment(id: string, data: RefundAdvancePaymentCommand): Promise<AdvancePaymentDto> {
    return ApiService.post<AdvancePaymentDto>(`/sales/advance-payments/${id}/refund`, data);
  }

  static async issueReceipt(id: string): Promise<AdvancePaymentDto> {
    return ApiService.post<AdvancePaymentDto>(`/sales/advance-payments/${id}/receipt`);
  }

  // =====================================
  // CREDIT NOTES
  // =====================================

  static async getCreditNotes(params?: CreditNoteQueryParams): Promise<PagedResult<CreditNoteListDto>> {
    return ApiService.get<PagedResult<CreditNoteListDto>>('/sales/credit-notes', { params });
  }

  static async getCreditNote(id: string): Promise<CreditNoteDto> {
    return ApiService.get<CreditNoteDto>(`/sales/credit-notes/${id}`);
  }

  static async getCreditNotesByCustomer(customerId: string): Promise<CreditNoteListDto[]> {
    return ApiService.get<CreditNoteListDto[]>(`/sales/credit-notes/by-customer/${customerId}`);
  }

  static async getCreditNoteStatistics(): Promise<CreditNoteStatisticsDto> {
    return ApiService.get<CreditNoteStatisticsDto>('/sales/credit-notes/statistics');
  }

  static async createCreditNote(data: CreateCreditNoteCommand): Promise<CreditNoteDto> {
    return ApiService.post<CreditNoteDto>('/sales/credit-notes', data);
  }

  static async createCreditNoteFromReturn(data: CreateCreditNoteFromReturnCommand): Promise<CreditNoteDto> {
    return ApiService.post<CreditNoteDto>('/sales/credit-notes/from-return', data);
  }

  static async updateCreditNote(id: string, data: UpdateCreditNoteCommand): Promise<CreditNoteDto> {
    return ApiService.put<CreditNoteDto>(`/sales/credit-notes/${id}`, data);
  }

  static async deleteCreditNote(id: string): Promise<void> {
    return ApiService.delete<void>(`/sales/credit-notes/${id}`);
  }

  static async approveCreditNote(id: string, notes?: string): Promise<CreditNoteDto> {
    return ApiService.post<CreditNoteDto>(`/sales/credit-notes/${id}/approve`, { notes });
  }

  static async applyCreditNote(id: string, data: ApplyCreditNoteCommand): Promise<CreditNoteDto> {
    return ApiService.post<CreditNoteDto>(`/sales/credit-notes/${id}/apply`, data);
  }

  static async voidCreditNote(id: string, reason: string): Promise<CreditNoteDto> {
    return ApiService.post<CreditNoteDto>(`/sales/credit-notes/${id}/void`, { reason });
  }

  static async addCreditNoteItem(id: string, data: AddCreditNoteItemCommand): Promise<CreditNoteDto> {
    return ApiService.post<CreditNoteDto>(`/sales/credit-notes/${id}/items`, data);
  }

  static async updateCreditNoteItem(id: string, itemId: string, data: UpdateCreditNoteItemCommand): Promise<CreditNoteDto> {
    return ApiService.put<CreditNoteDto>(`/sales/credit-notes/${id}/items/${itemId}`, data);
  }

  static async removeCreditNoteItem(id: string, itemId: string): Promise<CreditNoteDto> {
    return ApiService.delete<CreditNoteDto>(`/sales/credit-notes/${id}/items/${itemId}`);
  }

  // =====================================
  // SERVICE ORDERS
  // =====================================

  static async getServiceOrders(params?: ServiceOrderQueryParams): Promise<PagedResult<ServiceOrderListDto>> {
    return ApiService.get<PagedResult<ServiceOrderListDto>>('/sales/service-orders', { params });
  }

  static async getServiceOrder(id: string): Promise<ServiceOrderDto> {
    return ApiService.get<ServiceOrderDto>(`/sales/service-orders/${id}`);
  }

  static async getServiceOrdersByCustomer(customerId: string): Promise<ServiceOrderListDto[]> {
    return ApiService.get<ServiceOrderListDto[]>(`/sales/service-orders/by-customer/${customerId}`);
  }

  static async getServiceOrderStatistics(): Promise<ServiceOrderStatisticsDto> {
    return ApiService.get<ServiceOrderStatisticsDto>('/sales/service-orders/statistics');
  }

  static async createServiceOrder(data: CreateServiceOrderCommand): Promise<ServiceOrderDto> {
    return ApiService.post<ServiceOrderDto>('/sales/service-orders', data);
  }

  static async updateServiceOrder(id: string, data: UpdateServiceOrderCommand): Promise<ServiceOrderDto> {
    return ApiService.put<ServiceOrderDto>(`/sales/service-orders/${id}`, data);
  }

  static async deleteServiceOrder(id: string): Promise<void> {
    return ApiService.delete<void>(`/sales/service-orders/${id}`);
  }

  static async assignTechnician(id: string, data: AssignTechnicianCommand): Promise<ServiceOrderDto> {
    return ApiService.post<ServiceOrderDto>(`/sales/service-orders/${id}/assign`, data);
  }

  static async startServiceOrder(id: string): Promise<ServiceOrderDto> {
    return ApiService.post<ServiceOrderDto>(`/sales/service-orders/${id}/start`);
  }

  static async completeServiceOrder(id: string, data: CompleteServiceOrderCommand): Promise<ServiceOrderDto> {
    return ApiService.post<ServiceOrderDto>(`/sales/service-orders/${id}/complete`, data);
  }

  static async cancelServiceOrder(id: string, reason: string): Promise<ServiceOrderDto> {
    return ApiService.post<ServiceOrderDto>(`/sales/service-orders/${id}/cancel`, { reason });
  }

  static async addServiceOrderItem(id: string, data: AddServiceOrderItemCommand): Promise<ServiceOrderDto> {
    return ApiService.post<ServiceOrderDto>(`/sales/service-orders/${id}/items`, data);
  }

  static async updateServiceOrderItem(id: string, itemId: string, data: UpdateServiceOrderItemCommand): Promise<ServiceOrderDto> {
    return ApiService.put<ServiceOrderDto>(`/sales/service-orders/${id}/items/${itemId}`, data);
  }

  static async removeServiceOrderItem(id: string, itemId: string): Promise<ServiceOrderDto> {
    return ApiService.delete<ServiceOrderDto>(`/sales/service-orders/${id}/items/${itemId}`);
  }

  static async addServiceOrderNote(id: string, data: AddServiceOrderNoteCommand): Promise<ServiceOrderDto> {
    return ApiService.post<ServiceOrderDto>(`/sales/service-orders/${id}/notes`, data);
  }

  static async submitFeedback(id: string, data: SubmitServiceFeedbackCommand): Promise<ServiceOrderDto> {
    return ApiService.post<ServiceOrderDto>(`/sales/service-orders/${id}/feedback`, data);
  }

  // =====================================
  // WARRANTIES
  // =====================================

  static async getWarranties(params?: WarrantyQueryParams): Promise<PagedResult<WarrantyListDto>> {
    return ApiService.get<PagedResult<WarrantyListDto>>('/sales/warranties', { params });
  }

  static async getWarranty(id: string): Promise<WarrantyDto> {
    return ApiService.get<WarrantyDto>(`/sales/warranties/${id}`);
  }

  static async getWarrantyByNumber(warrantyNumber: string): Promise<WarrantyDto> {
    return ApiService.get<WarrantyDto>(`/sales/warranties/by-number/${warrantyNumber}`);
  }

  static async getWarrantiesByCustomer(customerId: string): Promise<WarrantyListDto[]> {
    return ApiService.get<WarrantyListDto[]>(`/sales/warranties/by-customer/${customerId}`);
  }

  static async getWarrantiesByProduct(productId: string): Promise<WarrantyListDto[]> {
    return ApiService.get<WarrantyListDto[]>(`/sales/warranties/by-product/${productId}`);
  }

  static async getWarrantyBySerial(serialNumber: string): Promise<WarrantyDto> {
    return ApiService.get<WarrantyDto>(`/sales/warranties/by-serial/${serialNumber}`);
  }

  static async getWarrantyStatistics(): Promise<WarrantyStatisticsDto> {
    return ApiService.get<WarrantyStatisticsDto>('/sales/warranties/statistics');
  }

  static async createWarranty(data: CreateWarrantyCommand): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>('/sales/warranties', data);
  }

  static async updateWarranty(id: string, data: UpdateWarrantyCommand): Promise<WarrantyDto> {
    return ApiService.put<WarrantyDto>(`/sales/warranties/${id}`, data);
  }

  static async deleteWarranty(id: string): Promise<void> {
    return ApiService.delete<void>(`/sales/warranties/${id}`);
  }

  static async activateWarranty(id: string): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(`/sales/warranties/${id}/activate`);
  }

  static async extendWarranty(id: string, data: ExtendWarrantyCommand): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(`/sales/warranties/${id}/extend`, data);
  }

  static async voidWarranty(id: string, reason: string): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(`/sales/warranties/${id}/void`, { reason });
  }

  static async registerWarranty(id: string): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(`/sales/warranties/${id}/register`);
  }

  static async createWarrantyClaim(id: string, data: CreateWarrantyClaimCommand): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(`/sales/warranties/${id}/claims`, data);
  }

  static async approveWarrantyClaim(id: string, claimId: string, data: ApproveWarrantyClaimCommand): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(`/sales/warranties/${id}/claims/${claimId}/approve`, data);
  }

  static async rejectWarrantyClaim(id: string, claimId: string, reason: string): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(`/sales/warranties/${id}/claims/${claimId}/reject`, { reason });
  }

  static async resolveWarrantyClaim(id: string, claimId: string, data: ResolveWarrantyClaimCommand): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(`/sales/warranties/${id}/claims/${claimId}/resolve`, data);
  }

  static async lookupWarranty(serialNumber: string): Promise<WarrantyDto | null> {
    try {
      return await ApiService.get<WarrantyDto>(`/sales/warranties/lookup/${serialNumber}`);
    } catch {
      return null;
    }
  }
}

// =====================================
// CUSTOMER CONTRACT TYPES
// Based on Backend DTOs: 2025-12-25
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
  signedDate?: string;
  status: ContractStatus;
  contractValue?: MoneyDto;
  minimumAnnualCommitment?: MoneyDto;
  priceListId?: string;
  generalDiscountPercentage?: number;
  defaultPaymentDueDays: number;
  creditLimit?: MoneyDto;
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
  internalNotes?: string;
  terminatedDate?: string;
  terminationReason?: string;
  terminationType?: TerminationType;
  serviceLevel: ServiceLevelAgreement;
  responseTimeHours?: number;
  resolutionTimeHours?: number;
  supportHours?: string;
  dedicatedSupportContact?: string;
  supportPriority: SupportPriority;
  includesOnSiteSupport: boolean;
  currentCreditBalance?: MoneyDto;
  availableCredit?: MoneyDto;
  creditLimitLastReviewDate?: string;
  renewalGracePeriodDays?: number;
  isBlocked: boolean;
  blockReason?: string;
  priceAgreements: ContractPriceAgreementDto[];
  paymentTerms: ContractPaymentTermDto[];
  commitments: ContractCommitmentDto[];
  documents: ContractDocumentDto[];
  daysUntilExpiration: number;
  isExpiringSoon: boolean;
}

export interface CustomerContractListDto {
  id: string;
  contractNumber: string;
  title: string;
  contractType: ContractType;
  customerId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  contractValue?: MoneyDto;
  serviceLevel: ServiceLevelAgreement;
  salesRepresentativeName?: string;
  daysUntilExpiration: number;
  isExpiringSoon: boolean;
}

export interface ContractPriceAgreementDto {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  specialPrice: MoneyDto;
  discountPercentage?: number;
  minimumQuantity: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface ContractPaymentTermDto {
  id: string;
  termType: PaymentTermType;
  dueDays: number;
  discountPercentage?: number;
  discountDays?: number;
  description?: string;
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

export interface MoneyDto {
  amount: number;
  currency: string;
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
  id?: string; // passed but not used by backend
  priceListId?: string;
  generalDiscountPercentage?: number;
  autoRenewal?: boolean;
  renewalPeriodMonths?: number;
  renewalNoticeBeforeDays?: number;
  salesRepresentativeId?: string;
  salesRepresentativeName?: string;
}

export interface TerminateContractCommand {
  id?: string;
  terminationType: TerminationType;
  reason: string;
}

export interface UpdateCreditLimitCommand {
  id?: string;
  amount: number;
  currency: string;
  notes?: string;
}

export interface ConfigureSLACommand {
  id?: string;
  serviceLevel: ServiceLevelAgreement;
  responseTimeHours?: number;
  resolutionTimeHours?: number;
  supportHours?: string;
  supportPriority?: SupportPriority;
}

export interface AddPriceAgreementCommand {
  contractId?: string;
  productId: string;
  productCode: string;
  productName: string;
  specialPrice: number;
  currency: string;
  discountPercentage?: number;
  minimumQuantity?: number;
}

export interface AddPaymentTermCommand {
  contractId?: string;
  termType: PaymentTermType;
  dueDays: number;
  discountPercentage?: number;
  discountDays?: number;
  description?: string;
  isDefault?: boolean;
}

export interface AddCommitmentCommand {
  contractId?: string;
  commitmentType: CommitmentTypeContract;
  period: CommitmentPeriod;
  targetAmount?: number;
  targetCurrency?: string;
  targetQuantity?: number;
  startDate: string;
  endDate: string;
}

// =====================================
// SALES TERRITORY TYPES
// Based on Backend DTOs: 2025-12-25
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
  potentialValue?: MoneyDto;
  annualTarget?: MoneyDto;
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
  id?: string;
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
  territoryId?: string;
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
// SHIPMENT TYPES
// Based on Backend DTOs: 2025-12-25
// =====================================

export type ShipmentStatus = 'Draft' | 'Confirmed' | 'Preparing' | 'PickedUp' | 'Packed' | 'Shipped' | 'InTransit' | 'OutForDelivery' | 'Delivered' | 'Failed' | 'Cancelled' | 'Returned';
export type ShipmentType = 'Standard' | 'Express' | 'SameDay' | 'NextDay' | 'Economy' | 'Freight';
export type ShipmentPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface ShipmentDto {
  id: string;
  shipmentNumber: string;
  salesOrderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: ShipmentStatus;
  shipmentType: ShipmentType;
  priority: ShipmentPriority;
  warehouseId?: string;
  warehouseName?: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry: string;
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  carrierId?: string;
  carrierName?: string;
  carrierService?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedShipDate?: string;
  actualShipDate?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  totalWeight?: number;
  weightUnit: string;
  totalPackages: number;
  shippingCost?: MoneyDto;
  insuranceValue?: MoneyDto;
  requiresSignature: boolean;
  deliveryInstructions?: string;
  internalNotes?: string;
  items: ShipmentItemDto[];
  createdAt: string;
  updatedAt?: string;
}

export interface ShipmentListDto {
  id: string;
  shipmentNumber: string;
  orderNumber: string;
  customerName: string;
  status: ShipmentStatus;
  shipmentType: ShipmentType;
  priority: ShipmentPriority;
  carrierName?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  shippingCity: string;
  totalPackages: number;
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
  weight?: number;
  isPicked: boolean;
  pickedAt?: string;
  pickedBy?: string;
  isPacked: boolean;
  packedAt?: string;
  packedBy?: string;
}

export interface ShipmentQueryParams {
  searchTerm?: string;
  status?: ShipmentStatus;
  shipmentType?: ShipmentType;
  priority?: ShipmentPriority;
  customerId?: string;
  orderId?: string;
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
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry: string;
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  carrierId?: string;
  carrierName?: string;
  estimatedShipDate?: string;
  estimatedDeliveryDate?: string;
  requiresSignature?: boolean;
  deliveryInstructions?: string;
  internalNotes?: string;
  items?: CreateShipmentItemCommand[];
}

export interface CreateShipmentFromOrderCommand {
  salesOrderId: string;
  shipmentType?: ShipmentType;
  priority?: ShipmentPriority;
  warehouseId?: string;
  carrierId?: string;
  carrierName?: string;
  estimatedShipDate?: string;
  estimatedDeliveryDate?: string;
  requiresSignature?: boolean;
  deliveryInstructions?: string;
  internalNotes?: string;
  includeAllItems?: boolean;
}

export interface CreateShipmentItemCommand {
  salesOrderItemId: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  weight?: number;
}

export interface UpdateShipmentCommand {
  id?: string;
  shipmentType?: ShipmentType;
  priority?: ShipmentPriority;
  carrierId?: string;
  carrierName?: string;
  carrierService?: string;
  estimatedShipDate?: string;
  estimatedDeliveryDate?: string;
  requiresSignature?: boolean;
  deliveryInstructions?: string;
  internalNotes?: string;
}

export interface ShipShipmentCommand {
  id?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrierService?: string;
  actualShipDate?: string;
}

export interface DeliverShipmentCommand {
  id?: string;
  actualDeliveryDate?: string;
  receivedBy?: string;
  signature?: string;
  deliveryNotes?: string;
}

export interface AddShipmentItemCommand {
  shipmentId?: string;
  salesOrderItemId: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  weight?: number;
}

export interface UpdateShipmentItemCommand {
  shipmentId?: string;
  itemId?: string;
  quantity?: number;
  weight?: number;
}

export interface UpdateTrackingCommand {
  id?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrierService?: string;
}

// =====================================
// ADVANCE PAYMENT TYPES
// Based on Backend DTOs: 2025-12-26
// =====================================

export type AdvancePaymentStatus =
  | 'Pending'
  | 'Captured'
  | 'PartiallyApplied'
  | 'FullyApplied'
  | 'Refunded'
  | 'Cancelled';

// PaymentMethod type already defined at top of file (line 118)

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
// CREDIT NOTE TYPES
// Based on Backend DTOs: 2025-12-26
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
// SERVICE ORDER TYPES
// Based on Backend DTOs: 2025-12-26
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
// WARRANTY TYPES
// Based on Backend DTOs: 2025-12-26
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

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export default SalesService;
