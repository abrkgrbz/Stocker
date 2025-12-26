// =====================================
// WARRANTY SERVICE
// Feature-Based Architecture
// =====================================

import { ApiService } from '@/lib/api/api-service';
import type {
  WarrantyDto,
  WarrantyListDto,
  WarrantyStatisticsDto,
  WarrantyQueryParams,
  CreateWarrantyCommand,
  UpdateWarrantyCommand,
  ExtendWarrantyCommand,
  CreateWarrantyClaimCommand,
  ApproveWarrantyClaimCommand,
  ResolveWarrantyClaimCommand,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/warranties';

export const warrantyService = {
  /**
   * Get all warranties with pagination and filtering
   */
  async getWarranties(params?: WarrantyQueryParams): Promise<PagedResult<WarrantyListDto>> {
    return ApiService.get<PagedResult<WarrantyListDto>>(BASE_URL, { params });
  },

  /**
   * Get a single warranty by ID
   */
  async getWarranty(id: string): Promise<WarrantyDto> {
    return ApiService.get<WarrantyDto>(`${BASE_URL}/${id}`);
  },

  /**
   * Get warranty by number
   */
  async getWarrantyByNumber(warrantyNumber: string): Promise<WarrantyDto> {
    return ApiService.get<WarrantyDto>(`${BASE_URL}/by-number/${warrantyNumber}`);
  },

  /**
   * Get warranties by customer
   */
  async getWarrantiesByCustomer(customerId: string): Promise<WarrantyListDto[]> {
    return ApiService.get<WarrantyListDto[]>(`${BASE_URL}/by-customer/${customerId}`);
  },

  /**
   * Get warranties by product
   */
  async getWarrantiesByProduct(productId: string): Promise<WarrantyListDto[]> {
    return ApiService.get<WarrantyListDto[]>(`${BASE_URL}/by-product/${productId}`);
  },

  /**
   * Get warranty by serial number
   */
  async getWarrantyBySerial(serialNumber: string): Promise<WarrantyDto> {
    return ApiService.get<WarrantyDto>(`${BASE_URL}/by-serial/${serialNumber}`);
  },

  /**
   * Get warranty statistics
   */
  async getWarrantyStatistics(): Promise<WarrantyStatisticsDto> {
    return ApiService.get<WarrantyStatisticsDto>(`${BASE_URL}/statistics`);
  },

  /**
   * Create a new warranty
   */
  async createWarranty(data: CreateWarrantyCommand): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(BASE_URL, data);
  },

  /**
   * Update a warranty
   */
  async updateWarranty(id: string, data: UpdateWarrantyCommand): Promise<WarrantyDto> {
    return ApiService.put<WarrantyDto>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Delete a warranty
   */
  async deleteWarranty(id: string): Promise<void> {
    return ApiService.delete<void>(`${BASE_URL}/${id}`);
  },

  /**
   * Activate a warranty
   */
  async activateWarranty(id: string): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(`${BASE_URL}/${id}/activate`);
  },

  /**
   * Extend a warranty
   */
  async extendWarranty(id: string, data: ExtendWarrantyCommand): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(`${BASE_URL}/${id}/extend`, data);
  },

  /**
   * Void a warranty
   */
  async voidWarranty(id: string, reason: string): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(`${BASE_URL}/${id}/void`, { reason });
  },

  /**
   * Register a warranty
   */
  async registerWarranty(id: string): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(`${BASE_URL}/${id}/register`);
  },

  /**
   * Create a warranty claim
   */
  async createWarrantyClaim(id: string, data: CreateWarrantyClaimCommand): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(`${BASE_URL}/${id}/claims`, data);
  },

  /**
   * Approve a warranty claim
   */
  async approveWarrantyClaim(id: string, claimId: string, data: ApproveWarrantyClaimCommand): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(`${BASE_URL}/${id}/claims/${claimId}/approve`, data);
  },

  /**
   * Reject a warranty claim
   */
  async rejectWarrantyClaim(id: string, claimId: string, reason: string): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(`${BASE_URL}/${id}/claims/${claimId}/reject`, { reason });
  },

  /**
   * Resolve a warranty claim
   */
  async resolveWarrantyClaim(id: string, claimId: string, data: ResolveWarrantyClaimCommand): Promise<WarrantyDto> {
    return ApiService.post<WarrantyDto>(`${BASE_URL}/${id}/claims/${claimId}/resolve`, data);
  },

  /**
   * Lookup warranty by serial number (returns null if not found)
   */
  async lookupWarranty(serialNumber: string): Promise<WarrantyDto | null> {
    try {
      return await ApiService.get<WarrantyDto>(`${BASE_URL}/lookup/${serialNumber}`);
    } catch {
      return null;
    }
  },
};
