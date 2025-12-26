// =====================================
// CUSTOMER SEGMENT SERVICE
// Feature-Based Architecture
// =====================================

import { ApiService } from '@/lib/api/api-service';
import type {
  CustomerSegmentDto,
  CustomerSegmentListDto,
  CustomerSegmentStatisticsDto,
  CustomerSegmentQueryParams,
  CreateCustomerSegmentCommand,
  UpdateCustomerSegmentCommand,
  AssignCustomersToSegmentCommand,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/segments';

export const segmentService = {
  // =====================================
  // QUERY OPERATIONS
  // =====================================

  /**
   * Get paginated customer segments
   */
  async getSegments(params?: CustomerSegmentQueryParams): Promise<PagedResult<CustomerSegmentListDto>> {
    return ApiService.get<PagedResult<CustomerSegmentListDto>>(BASE_URL, { params });
  },

  /**
   * Get a single segment by ID
   */
  async getSegment(id: string): Promise<CustomerSegmentDto> {
    return ApiService.get<CustomerSegmentDto>(`${BASE_URL}/${id}`);
  },

  /**
   * Get segment by code
   */
  async getSegmentByCode(code: string): Promise<CustomerSegmentDto> {
    return ApiService.get<CustomerSegmentDto>(`${BASE_URL}/code/${code}`);
  },

  /**
   * Get active segments
   */
  async getActiveSegments(): Promise<CustomerSegmentListDto[]> {
    return ApiService.get<CustomerSegmentListDto[]>(`${BASE_URL}/active`);
  },

  /**
   * Get segment statistics
   */
  async getSegmentStatistics(): Promise<CustomerSegmentStatisticsDto> {
    return ApiService.get<CustomerSegmentStatisticsDto>(`${BASE_URL}/statistics`);
  },

  /**
   * Get customers in a segment
   */
  async getSegmentCustomers(id: string): Promise<string[]> {
    return ApiService.get<string[]>(`${BASE_URL}/${id}/customers`);
  },

  // =====================================
  // MUTATION OPERATIONS
  // =====================================

  /**
   * Create a new segment
   */
  async createSegment(data: CreateCustomerSegmentCommand): Promise<CustomerSegmentDto> {
    return ApiService.post<CustomerSegmentDto>(BASE_URL, data);
  },

  /**
   * Update a segment
   */
  async updateSegment(id: string, data: UpdateCustomerSegmentCommand): Promise<CustomerSegmentDto> {
    return ApiService.put<CustomerSegmentDto>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Delete a segment
   */
  async deleteSegment(id: string): Promise<void> {
    await ApiService.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Activate a segment
   */
  async activateSegment(id: string): Promise<CustomerSegmentDto> {
    return ApiService.post<CustomerSegmentDto>(`${BASE_URL}/${id}/activate`);
  },

  /**
   * Deactivate a segment
   */
  async deactivateSegment(id: string): Promise<CustomerSegmentDto> {
    return ApiService.post<CustomerSegmentDto>(`${BASE_URL}/${id}/deactivate`);
  },

  /**
   * Assign customers to a segment
   */
  async assignCustomers(id: string, data: AssignCustomersToSegmentCommand): Promise<CustomerSegmentDto> {
    return ApiService.post<CustomerSegmentDto>(`${BASE_URL}/${id}/customers`, data);
  },

  /**
   * Remove customer from a segment
   */
  async removeCustomer(id: string, customerId: string): Promise<CustomerSegmentDto> {
    return ApiService.delete<CustomerSegmentDto>(`${BASE_URL}/${id}/customers/${customerId}`);
  },

  /**
   * Recalculate segment membership based on criteria
   */
  async recalculateSegment(id: string): Promise<CustomerSegmentDto> {
    return ApiService.post<CustomerSegmentDto>(`${BASE_URL}/${id}/recalculate`);
  },
};
