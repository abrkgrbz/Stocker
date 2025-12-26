// =====================================
// DISCOUNT SERVICE
// Feature-Based Architecture
// =====================================

import { ApiService } from '@/lib/api/api-service';
import type {
  Discount,
  DiscountListItem,
  GetDiscountsParams,
  CreateDiscountDto,
  UpdateDiscountDto,
  ApplyDiscountDto,
  DiscountValidationResult,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/discounts';

export const discountService = {
  /**
   * Get all discounts with pagination and filtering
   */
  async getDiscounts(params?: GetDiscountsParams): Promise<PagedResult<DiscountListItem>> {
    return ApiService.get<PagedResult<DiscountListItem>>(BASE_URL, { params });
  },

  /**
   * Get a single discount by ID
   */
  async getDiscountById(id: string): Promise<Discount> {
    return ApiService.get<Discount>(`${BASE_URL}/${id}`);
  },

  /**
   * Get discount by code
   */
  async getDiscountByCode(code: string): Promise<Discount> {
    return ApiService.get<Discount>(`${BASE_URL}/code/${encodeURIComponent(code)}`);
  },

  /**
   * Get active discounts
   */
  async getActiveDiscounts(): Promise<DiscountListItem[]> {
    return ApiService.get<DiscountListItem[]>(`${BASE_URL}/active`);
  },

  /**
   * Validate discount code
   */
  async validateDiscountCode(data: ApplyDiscountDto): Promise<DiscountValidationResult> {
    return ApiService.post<DiscountValidationResult>(`${BASE_URL}/validate`, data);
  },

  /**
   * Create a new discount
   */
  async createDiscount(data: CreateDiscountDto): Promise<Discount> {
    return ApiService.post<Discount>(BASE_URL, data);
  },

  /**
   * Update a discount
   */
  async updateDiscount(id: string, data: UpdateDiscountDto): Promise<Discount> {
    return ApiService.put<Discount>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Activate a discount
   */
  async activateDiscount(id: string): Promise<Discount> {
    return ApiService.post<Discount>(`${BASE_URL}/${id}/activate`);
  },

  /**
   * Deactivate a discount
   */
  async deactivateDiscount(id: string): Promise<Discount> {
    return ApiService.post<Discount>(`${BASE_URL}/${id}/deactivate`);
  },

  /**
   * Delete a discount
   */
  async deleteDiscount(id: string): Promise<void> {
    return ApiService.delete<void>(`${BASE_URL}/${id}`);
  },
};
