import { ApiService } from '../api-service';

// =====================================
// TYPES - Based on Backend API
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

export type CommissionType =
  | 'Percentage'
  | 'FixedAmount'
  | 'Tiered'
  | 'Target';

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

// =====================================
// QUOTATIONS
// =====================================

export interface QuotationItem {
  id: string;
  quotationId: string;
  lineNumber: number;
  productId: string | null;
  productCode: string;
  productName: string;
  description: string | null;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  lineTotalWithVat: number;
}

export interface Quotation {
  id: string;
  tenantId: string;
  quotationNumber: string;
  quotationDate: string;
  validUntil: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status: QuotationStatus;
  currency: string;
  subTotal: number;
  discountAmount: number;
  discountRate: number;
  taxTotal: number;
  taxAmount?: number;
  grandTotal: number;
  shippingAddress: string | null;
  billingAddress: string | null;
  notes: string | null;
  termsAndConditions: string | null;
  salesPersonId: string | null;
  salesPersonName: string | null;
  revisionNumber: number;
  parentQuotationId: string | null;
  convertedOrderId: string | null;
  items: QuotationItem[];
  approvedAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationListItem {
  id: string;
  quotationNumber: string;
  quotationDate: string;
  validUntil: string;
  customerName: string;
  status: QuotationStatus;
  grandTotal: number;
  currency: string;
  itemCount: number;
  salesPersonName: string | null;
  revisionNumber: number;
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
// DISCOUNTS
// =====================================

export interface Discount {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string | null;
  type: DiscountType;
  value: number;
  percentage?: number;
  amount?: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  minimumAmount?: number | null;
  maximumDiscount?: number | null;
  minQuantity: number | null;
  maxUsageCount: number | null;
  maxUsagePerCustomer?: number | null;
  usageCount: number;
  totalDiscountGiven?: number;
  validFrom: string | null;
  validUntil: string | null;
  startDate?: string;
  endDate?: string | null;
  firstOrderOnly?: boolean;
  canCombine?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountListItem {
  id: string;
  code: string;
  name: string;
  type: DiscountType;
  value: number;
  percentage?: number;
  amount?: number;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
  usageCount: number;
  maxUsageCount: number | null;
}

export interface CreateDiscountDto {
  code: string;
  name: string;
  description?: string;
  type: DiscountType;
  value?: number;
  percentage?: number;
  amount?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  minQuantity?: number;
  maxUsageCount?: number;
  maxUsagePerCustomer?: number;
  startDate?: string;
  endDate?: string;
  validFrom?: string;
  validUntil?: string;
  firstOrderOnly?: boolean;
  canCombine?: boolean;
  isActive?: boolean;
}

export interface UpdateDiscountDto {
  code?: string;
  name?: string;
  description?: string;
  type?: DiscountType;
  value?: number;
  percentage?: number;
  amount?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  minQuantity?: number;
  maxUsageCount?: number;
  maxUsagePerCustomer?: number;
  startDate?: string;
  endDate?: string;
  validFrom?: string;
  validUntil?: string;
  firstOrderOnly?: boolean;
  canCombine?: boolean;
  isActive?: boolean;
}

export interface ApplyDiscountDto {
  code: string;
  orderAmount: number;
  quantity?: number;
}

export interface DiscountValidationResult {
  isValid: boolean;
  discountAmount: number;
  errorMessage: string | null;
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
// COMMISSIONS
// =====================================

export interface CommissionTier {
  id: string;
  commissionPlanId: string;
  fromAmount: number;
  toAmount: number | null;
  rate: number;
}

export interface CommissionPlan {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  type: CommissionType;
  baseRate: number;
  fixedAmount?: number | null;
  minimumSalesAmount?: number | null;
  maximumCommission?: number | null;
  targetAmount: number | null;
  bonusRate: number | null;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
  tiers: CommissionTier[];
  createdAt: string;
  updatedAt: string;
}

export interface CommissionPlanListItem {
  id: string;
  name: string;
  type: CommissionType;
  baseRate: number;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
}

export interface CreateCommissionPlanDto {
  name: string;
  description?: string;
  type: CommissionType;
  baseRate: number;
  fixedAmount?: number;
  minimumSalesAmount?: number;
  maximumCommission?: number;
  targetAmount?: number;
  bonusRate?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
}

export interface UpdateCommissionPlanDto {
  name?: string;
  description?: string;
  type?: CommissionType;
  baseRate?: number;
  fixedAmount?: number;
  minimumSalesAmount?: number;
  maximumCommission?: number;
  targetAmount?: number;
  bonusRate?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
}

export interface CreateCommissionTierDto {
  fromAmount: number;
  toAmount?: number;
  rate: number;
}

export interface SalesCommission {
  id: string;
  tenantId: string;
  referenceNumber?: string;
  salesPersonId: string;
  salesPersonName: string;
  salesOrderId: string;
  salesOrderNumber: string;
  orderId?: string;
  orderNumber?: string;
  orderDate?: string;
  customerName?: string;
  commissionPlanId: string;
  commissionPlanName: string;
  planName?: string;
  orderAmount: number;
  commissionAmount: number;
  rate: number;
  commissionRate?: number;
  status: SalesCommissionStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedAt?: string | null;
  paidAt: string | null;
  paymentReference: string | null;
  rejectionReason: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalesCommissionListItem {
  id: string;
  referenceNumber?: string;
  salesPersonName: string;
  salesOrderNumber: string;
  orderId?: string;
  orderNumber?: string;
  orderAmount: number;
  commissionAmount: number;
  rate: number;
  status: SalesCommissionStatus;
  createdAt: string;
}

export interface CommissionSummary {
  totalCommission?: number;
  totalCommissions: number;
  pendingCount?: number;
  pendingCommissions: number;
  approvedCount?: number;
  approvedCommissions: number;
  paidCommissions: number;
  paidAmount?: number;
  totalPendingAmount: number;
  totalApprovedAmount: number;
  totalPaidAmount: number;
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
}

export interface CalculateCommissionDto {
  salesPersonId: string;
  salesOrderId: string;
  commissionPlanId?: string;
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
// =====================================

export interface SalesReturnItem {
  id: string;
  salesReturnId: string;
  lineNumber: number;
  salesOrderItemId: string | null;
  productId: string | null;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  reason: SalesReturnReason;
  condition: string | null;
  notes: string | null;
  isRestocked: boolean;
  restockedAt: string | null;
  lineTotal: number;
}

export interface SalesReturn {
  id: string;
  tenantId: string;
  returnNumber: string;
  returnDate: string;
  salesOrderId: string;
  salesOrderNumber: string;
  orderId?: string;
  orderNumber?: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string | null;
  status: SalesReturnStatus;
  reason: SalesReturnReason;
  reasonDetails: string | null;
  subTotal: number;
  totalAmount?: number;
  refundAmount: number;
  currency?: string;
  refundMethod: string | null;
  refundReference: string | null;
  refundedAt: string | null;
  notes: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  submittedAt?: string | null;
  receivedBy: string | null;
  receivedAt: string | null;
  completedAt: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  items: SalesReturnItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesReturnListItem {
  id: string;
  returnNumber: string;
  returnDate: string;
  salesOrderNumber: string;
  orderId?: string;
  customerName: string;
  status: SalesReturnStatus;
  reason: SalesReturnReason;
  refundAmount: number;
  currency?: string;
  itemCount: number;
}

export interface SalesReturnSummary {
  totalReturns: number;
  pendingReturns: number;
  approvedReturns: number;
  completedReturns: number;
  cancelledReturns: number;
  totalRefundAmount: number;
  averageRefundAmount: number;
  returnRate: number;
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
  returnDate: string;
  salesOrderId: string;
  reason: SalesReturnReason;
  reasonDetails?: string;
  notes?: string;
  items: CreateSalesReturnItemDto[];
}

export interface CreateSalesReturnItemDto {
  salesOrderItemId?: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  reason: SalesReturnReason;
  condition?: string;
  notes?: string;
}

export interface UpdateSalesReturnDto {
  returnDate?: string;
  reason?: SalesReturnReason;
  reasonDetails?: string;
  notes?: string;
  items?: UpdateSalesReturnItemDto[];
}

export interface UpdateSalesReturnItemDto {
  id?: string;
  orderItemId?: string;
  productId?: string;
  quantity: number;
  unitPrice: number;
}

export interface ProcessRefundDto {
  refundMethod: string;
  refundReference?: string;
  refundAmount?: number;
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
// SALES ORDERS (existing)
// =====================================

export interface SalesOrderItem {
  id: string;
  salesOrderId: string;
  lineNumber: number;
  productId: string | null;
  productCode: string;
  productName: string;
  description: string | null;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  lineTotalWithVat: number;
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrder {
  id: string;
  tenantId: string;
  orderNumber: string;
  orderDate: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string | null;
  status: SalesOrderStatus;
  currency: string;
  subTotal: number;
  discountAmount: number;
  discountRate: number;
  taxTotal: number;
  grandTotal: number;
  shippingAddress: string | null;
  billingAddress: string | null;
  notes: string | null;
  deliveryDate: string | null;
  salesPersonId: string | null;
  salesPersonName: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  cancelledReason: string | null;
  cancelledAt: string | null;
  items: SalesOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrderListItem {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  status: SalesOrderStatus;
  grandTotal: number;
  currency: string;
  itemCount: number;
  salesPersonName: string | null;
  deliveryDate: string | null;
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

const BASE_URL = '/api/sales/orders';

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
