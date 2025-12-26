// =====================================
// SALES RETURN SERVICE
// Feature-Based Architecture
// =====================================

import { ApiService } from '@/lib/api/api-service';
import type {
  SalesReturn,
  SalesReturnListItem,
  SalesReturnSummary,
  ReturnableItem,
  GetSalesReturnsParams,
  CreateSalesReturnDto,
  UpdateSalesReturnDto,
  CreateSalesReturnItemDto,
  ProcessRefundDto,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/salesreturns';

export const returnService = {
  /**
   * Get all sales returns with pagination and filtering
   */
  async getSalesReturns(params?: GetSalesReturnsParams): Promise<PagedResult<SalesReturnListItem>> {
    return ApiService.get<PagedResult<SalesReturnListItem>>(BASE_URL, { params });
  },

  /**
   * Get a single sales return by ID
   */
  async getSalesReturnById(id: string): Promise<SalesReturn> {
    return ApiService.get<SalesReturn>(`${BASE_URL}/${id}`);
  },

  /**
   * Get sales returns by order
   */
  async getSalesReturnsByOrder(orderId: string): Promise<SalesReturnListItem[]> {
    return ApiService.get<SalesReturnListItem[]>(`${BASE_URL}/order/${orderId}`);
  },

  /**
   * Get sales returns by customer
   */
  async getSalesReturnsByCustomer(customerId: string, page: number = 1, pageSize: number = 20): Promise<PagedResult<SalesReturnListItem>> {
    return ApiService.get<PagedResult<SalesReturnListItem>>(`${BASE_URL}/customer/${customerId}`, {
      params: { page, pageSize },
    });
  },

  /**
   * Get pending returns
   */
  async getPendingReturns(): Promise<SalesReturnListItem[]> {
    return ApiService.get<SalesReturnListItem[]>(`${BASE_URL}/pending`);
  },

  /**
   * Get return summary
   */
  async getReturnSummary(fromDate?: string, toDate?: string): Promise<SalesReturnSummary> {
    return ApiService.get<SalesReturnSummary>(`${BASE_URL}/summary`, {
      params: { fromDate, toDate },
    });
  },

  /**
   * Get returnable items for an order
   */
  async getReturnableItems(orderId: string): Promise<ReturnableItem[]> {
    return ApiService.get<ReturnableItem[]>(`${BASE_URL}/returnable-items/${orderId}`);
  },

  /**
   * Create a new sales return
   */
  async createSalesReturn(data: CreateSalesReturnDto): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(BASE_URL, data);
  },

  /**
   * Update a sales return
   */
  async updateSalesReturn(id: string, data: UpdateSalesReturnDto): Promise<SalesReturn> {
    return ApiService.put<SalesReturn>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Add item to sales return
   */
  async addSalesReturnItem(returnId: string, item: CreateSalesReturnItemDto): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`${BASE_URL}/${returnId}/items`, item);
  },

  /**
   * Remove item from sales return
   */
  async removeSalesReturnItem(returnId: string, itemId: string): Promise<SalesReturn> {
    return ApiService.delete<SalesReturn>(`${BASE_URL}/${returnId}/items/${itemId}`);
  },

  /**
   * Submit a sales return
   */
  async submitSalesReturn(id: string): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`${BASE_URL}/${id}/submit`);
  },

  /**
   * Approve a sales return
   */
  async approveSalesReturn(id: string): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`${BASE_URL}/${id}/approve`);
  },

  /**
   * Reject a sales return
   */
  async rejectSalesReturn(id: string, reason: string): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`${BASE_URL}/${id}/reject`, { reason });
  },

  /**
   * Receive a sales return
   */
  async receiveSalesReturn(id: string): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`${BASE_URL}/${id}/receive`);
  },

  /**
   * Process refund for a sales return
   */
  async processRefund(id: string, data: ProcessRefundDto): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`${BASE_URL}/${id}/process-refund`, data);
  },

  /**
   * Complete a sales return
   */
  async completeSalesReturn(id: string): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`${BASE_URL}/${id}/complete`);
  },

  /**
   * Cancel a sales return
   */
  async cancelSalesReturn(id: string, reason: string): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`${BASE_URL}/${id}/cancel`, { reason });
  },

  /**
   * Mark item as restocked
   */
  async markItemAsRestocked(returnId: string, itemId: string): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`${BASE_URL}/${returnId}/items/${itemId}/mark-restocked`);
  },

  /**
   * Mark entire return as restocked
   */
  async markReturnAsRestocked(id: string): Promise<SalesReturn> {
    return ApiService.post<SalesReturn>(`${BASE_URL}/${id}/mark-restocked`);
  },

  /**
   * Delete a sales return
   */
  async deleteSalesReturn(id: string): Promise<void> {
    return ApiService.delete<void>(`${BASE_URL}/${id}`);
  },
};
