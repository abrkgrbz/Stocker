import { ApiService } from '../api-service';

// =====================================
// TYPES - Based on Backend API
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
   * Delete a sales order
   */
  static async deleteOrder(id: string): Promise<void> {
    return ApiService.delete<void>(`${BASE_URL}/${id}`);
  }
}

export default SalesService;
