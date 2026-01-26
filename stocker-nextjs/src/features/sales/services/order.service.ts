// =====================================
// SALES ORDER SERVICE
// Feature-Based Architecture
// =====================================

import { ApiService } from '@/lib/api/api-service';
import type {
  SalesOrder,
  SalesOrderListItem,
  SalesOrderStatistics,
  GetSalesOrdersParams,
  CreateSalesOrderCommand,
  UpdateSalesOrderCommand,
  AddSalesOrderItemCommand,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/orders';

export const orderService = {
  /**
   * Get all sales orders with pagination and filtering
   */
  async getOrders(params?: GetSalesOrdersParams): Promise<PagedResult<SalesOrderListItem>> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
      if (params.fuzzySearch !== undefined) queryParams.append('fuzzySearch', params.fuzzySearch.toString());
      if (params.minRelevanceScore !== undefined) queryParams.append('minRelevanceScore', params.minRelevanceScore.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.customerId) queryParams.append('customerId', params.customerId);
      if (params.salesPersonId) queryParams.append('salesPersonId', params.salesPersonId);
      if (params.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params.toDate) queryParams.append('toDate', params.toDate);
      if (params.invoicingStatus) queryParams.append('invoicingStatus', params.invoicingStatus);
      if (params.fulfillmentStatus) queryParams.append('fulfillmentStatus', params.fulfillmentStatus);
      if (params.isReturnable !== undefined) queryParams.append('isReturnable', params.isReturnable.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDescending !== undefined) queryParams.append('sortDescending', params.sortDescending.toString());
    }

    const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
    return ApiService.get<PagedResult<SalesOrderListItem>>(url);
  },

  /**
   * Get a single sales order by ID
   */
  async getOrderById(id: string): Promise<SalesOrder> {
    return ApiService.get<SalesOrder>(`${BASE_URL}/${id}`);
  },

  /**
   * Get sales order statistics
   */
  async getStatistics(fromDate?: string, toDate?: string): Promise<SalesOrderStatistics> {
    const queryParams = new URLSearchParams();
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);

    const url = queryParams.toString()
      ? `${BASE_URL}/statistics?${queryParams}`
      : `${BASE_URL}/statistics`;
    return ApiService.get<SalesOrderStatistics>(url);
  },

  /**
   * Create a new sales order
   */
  async createOrder(data: CreateSalesOrderCommand): Promise<SalesOrder> {
    return ApiService.post<SalesOrder>(BASE_URL, data);
  },

  /**
   * Update an existing sales order
   */
  async updateOrder(id: string, data: UpdateSalesOrderCommand): Promise<SalesOrder> {
    return ApiService.put<SalesOrder>(`${BASE_URL}/${id}`, { ...data, id });
  },

  /**
   * Add an item to a sales order
   */
  async addItem(orderId: string, data: Omit<AddSalesOrderItemCommand, 'salesOrderId'>): Promise<SalesOrder> {
    return ApiService.post<SalesOrder>(`${BASE_URL}/${orderId}/items`, { ...data, salesOrderId: orderId });
  },

  /**
   * Remove an item from a sales order
   */
  async removeItem(orderId: string, itemId: string): Promise<SalesOrder> {
    return ApiService.delete<SalesOrder>(`${BASE_URL}/${orderId}/items/${itemId}`);
  },

  /**
   * Approve a sales order
   */
  async approveOrder(id: string): Promise<SalesOrder> {
    return ApiService.post<SalesOrder>(`${BASE_URL}/${id}/approve`);
  },

  /**
   * Cancel a sales order
   */
  async cancelOrder(id: string, reason: string): Promise<SalesOrder> {
    return ApiService.post<SalesOrder>(`${BASE_URL}/${id}/cancel`, { id, reason });
  },

  /**
   * Confirm a sales order (customer confirmed)
   */
  async confirmOrder(id: string): Promise<SalesOrder> {
    return ApiService.post<SalesOrder>(`${BASE_URL}/${id}/confirm`);
  },

  /**
   * Ship a sales order
   */
  async shipOrder(id: string): Promise<SalesOrder> {
    return ApiService.post<SalesOrder>(`${BASE_URL}/${id}/ship`);
  },

  /**
   * Mark a sales order as delivered
   */
  async deliverOrder(id: string): Promise<SalesOrder> {
    return ApiService.post<SalesOrder>(`${BASE_URL}/${id}/deliver`);
  },

  /**
   * Complete a sales order
   */
  async completeOrder(id: string): Promise<SalesOrder> {
    return ApiService.post<SalesOrder>(`${BASE_URL}/${id}/complete`);
  },

  /**
   * Delete a sales order
   */
  async deleteOrder(id: string): Promise<void> {
    return ApiService.delete<void>(`${BASE_URL}/${id}`);
  },
};
