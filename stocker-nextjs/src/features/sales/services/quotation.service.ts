// =====================================
// QUOTATION SERVICE
// Feature-Based Architecture
// =====================================

import { ApiService } from '@/lib/api/api-service';
import type {
  Quotation,
  QuotationListItem,
  QuotationStatistics,
  GetQuotationsParams,
  CreateQuotationDto,
  UpdateQuotationDto,
  CreateQuotationItemDto,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/quotations';

export const quotationService = {
  /**
   * Get all quotations with pagination and filtering
   */
  async getQuotations(params?: GetQuotationsParams): Promise<PagedResult<QuotationListItem>> {
    return ApiService.get<PagedResult<QuotationListItem>>(BASE_URL, { params });
  },

  /**
   * Get a single quotation by ID
   */
  async getQuotationById(id: string): Promise<Quotation> {
    return ApiService.get<Quotation>(`${BASE_URL}/${id}`);
  },

  /**
   * Get quotations by customer
   */
  async getQuotationsByCustomer(customerId: string, page: number = 1, pageSize: number = 20): Promise<PagedResult<QuotationListItem>> {
    return ApiService.get<PagedResult<QuotationListItem>>(`${BASE_URL}/customer/${customerId}`, {
      params: { page, pageSize },
    });
  },

  /**
   * Get quotations by sales person
   */
  async getQuotationsBySalesPerson(salesPersonId: string, page: number = 1, pageSize: number = 20): Promise<PagedResult<QuotationListItem>> {
    return ApiService.get<PagedResult<QuotationListItem>>(`${BASE_URL}/salesperson/${salesPersonId}`, {
      params: { page, pageSize },
    });
  },

  /**
   * Get expiring quotations
   */
  async getExpiringQuotations(daysUntilExpiry: number = 7): Promise<QuotationListItem[]> {
    return ApiService.get<QuotationListItem[]>(`${BASE_URL}/expiring`, {
      params: { daysUntilExpiry },
    });
  },

  /**
   * Get quotation revisions
   */
  async getQuotationRevisions(id: string): Promise<QuotationListItem[]> {
    return ApiService.get<QuotationListItem[]>(`${BASE_URL}/${id}/revisions`);
  },

  /**
   * Get quotation statistics
   */
  async getQuotationStatistics(fromDate?: string, toDate?: string): Promise<QuotationStatistics> {
    return ApiService.get<QuotationStatistics>(`${BASE_URL}/statistics`, {
      params: { fromDate, toDate },
    });
  },

  /**
   * Create a new quotation
   */
  async createQuotation(data: CreateQuotationDto): Promise<Quotation> {
    return ApiService.post<Quotation>(BASE_URL, data);
  },

  /**
   * Update a quotation
   */
  async updateQuotation(id: string, data: UpdateQuotationDto): Promise<Quotation> {
    return ApiService.put<Quotation>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Add item to quotation
   */
  async addQuotationItem(quotationId: string, item: CreateQuotationItemDto): Promise<Quotation> {
    return ApiService.post<Quotation>(`${BASE_URL}/${quotationId}/items`, item);
  },

  /**
   * Remove item from quotation
   */
  async removeQuotationItem(quotationId: string, itemId: string): Promise<Quotation> {
    return ApiService.delete<Quotation>(`${BASE_URL}/${quotationId}/items/${itemId}`);
  },

  /**
   * Submit quotation for approval
   */
  async submitQuotationForApproval(id: string): Promise<Quotation> {
    return ApiService.post<Quotation>(`${BASE_URL}/${id}/submit-for-approval`);
  },

  /**
   * Approve a quotation
   */
  async approveQuotation(id: string): Promise<Quotation> {
    return ApiService.post<Quotation>(`${BASE_URL}/${id}/approve`);
  },

  /**
   * Send a quotation
   */
  async sendQuotation(id: string): Promise<Quotation> {
    return ApiService.post<Quotation>(`${BASE_URL}/${id}/send`);
  },

  /**
   * Accept a quotation
   */
  async acceptQuotation(id: string): Promise<Quotation> {
    return ApiService.post<Quotation>(`${BASE_URL}/${id}/accept`);
  },

  /**
   * Reject a quotation
   */
  async rejectQuotation(id: string, reason: string): Promise<Quotation> {
    return ApiService.post<Quotation>(`${BASE_URL}/${id}/reject`, { reason });
  },

  /**
   * Cancel a quotation
   */
  async cancelQuotation(id: string, reason: string): Promise<Quotation> {
    return ApiService.post<Quotation>(`${BASE_URL}/${id}/cancel`, { reason });
  },

  /**
   * Convert quotation to order
   */
  async convertQuotationToOrder(id: string): Promise<{ orderId: string }> {
    return ApiService.post<{ orderId: string }>(`${BASE_URL}/${id}/convert-to-order`);
  },

  /**
   * Create quotation revision
   */
  async createQuotationRevision(id: string): Promise<Quotation> {
    return ApiService.post<Quotation>(`${BASE_URL}/${id}/create-revision`);
  },

  /**
   * Delete a quotation
   */
  async deleteQuotation(id: string): Promise<void> {
    return ApiService.delete<void>(`${BASE_URL}/${id}`);
  },
};
