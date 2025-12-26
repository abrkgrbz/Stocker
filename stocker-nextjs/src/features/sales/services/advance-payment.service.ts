// =====================================
// ADVANCE PAYMENT SERVICE
// Feature-Based Architecture
// =====================================

import { ApiService } from '@/lib/api/api-service';
import type {
  AdvancePaymentDto,
  AdvancePaymentListDto,
  AdvancePaymentStatisticsDto,
  AdvancePaymentQueryParams,
  CreateAdvancePaymentCommand,
  UpdateAdvancePaymentCommand,
  ApplyAdvancePaymentCommand,
  RefundAdvancePaymentCommand,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/advance-payments';

export const advancePaymentService = {
  /**
   * Get all advance payments with pagination and filtering
   */
  async getAdvancePayments(params?: AdvancePaymentQueryParams): Promise<PagedResult<AdvancePaymentListDto>> {
    return ApiService.get<PagedResult<AdvancePaymentListDto>>(BASE_URL, { params });
  },

  /**
   * Get a single advance payment by ID
   */
  async getAdvancePayment(id: string): Promise<AdvancePaymentDto> {
    return ApiService.get<AdvancePaymentDto>(`${BASE_URL}/${id}`);
  },

  /**
   * Get advance payments by customer
   */
  async getAdvancePaymentsByCustomer(customerId: string): Promise<AdvancePaymentListDto[]> {
    return ApiService.get<AdvancePaymentListDto[]>(`${BASE_URL}/by-customer/${customerId}`);
  },

  /**
   * Get advance payment statistics
   */
  async getAdvancePaymentStatistics(): Promise<AdvancePaymentStatisticsDto> {
    return ApiService.get<AdvancePaymentStatisticsDto>(`${BASE_URL}/statistics`);
  },

  /**
   * Create a new advance payment
   */
  async createAdvancePayment(data: CreateAdvancePaymentCommand): Promise<AdvancePaymentDto> {
    return ApiService.post<AdvancePaymentDto>(BASE_URL, data);
  },

  /**
   * Update an advance payment
   */
  async updateAdvancePayment(id: string, data: UpdateAdvancePaymentCommand): Promise<AdvancePaymentDto> {
    return ApiService.put<AdvancePaymentDto>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Delete an advance payment
   */
  async deleteAdvancePayment(id: string): Promise<void> {
    return ApiService.delete<void>(`${BASE_URL}/${id}`);
  },

  /**
   * Capture an advance payment
   */
  async captureAdvancePayment(id: string): Promise<AdvancePaymentDto> {
    return ApiService.post<AdvancePaymentDto>(`${BASE_URL}/${id}/capture`);
  },

  /**
   * Apply an advance payment to an invoice or order
   */
  async applyAdvancePayment(id: string, data: ApplyAdvancePaymentCommand): Promise<AdvancePaymentDto> {
    return ApiService.post<AdvancePaymentDto>(`${BASE_URL}/${id}/apply`, data);
  },

  /**
   * Refund an advance payment
   */
  async refundAdvancePayment(id: string, data: RefundAdvancePaymentCommand): Promise<AdvancePaymentDto> {
    return ApiService.post<AdvancePaymentDto>(`${BASE_URL}/${id}/refund`, data);
  },

  /**
   * Issue a receipt for an advance payment
   */
  async issueReceipt(id: string): Promise<AdvancePaymentDto> {
    return ApiService.post<AdvancePaymentDto>(`${BASE_URL}/${id}/receipt`);
  },
};
