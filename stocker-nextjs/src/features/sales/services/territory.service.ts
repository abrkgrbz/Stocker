// =====================================
// SALES TERRITORY SERVICE
// Feature-Based Architecture
// =====================================

import { ApiService } from '@/lib/api/api-service';
import type {
  SalesTerritoryDto,
  SalesTerritoryListDto,
  SalesTerritoryQueryParams,
  CreateSalesTerritoryCommand,
  UpdateSalesTerritoryCommand,
  AssignSalesRepCommand,
  AssignCustomerToTerritoryCommand,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/territories';

export const territoryService = {
  /**
   * Get all sales territories with pagination and filtering
   */
  async getSalesTerritories(params?: SalesTerritoryQueryParams): Promise<PagedResult<SalesTerritoryListDto>> {
    return ApiService.get<PagedResult<SalesTerritoryListDto>>(BASE_URL, { params });
  },

  /**
   * Get a single sales territory by ID
   */
  async getSalesTerritory(id: string): Promise<SalesTerritoryDto> {
    return ApiService.get<SalesTerritoryDto>(`${BASE_URL}/${id}`);
  },

  /**
   * Get sales territory by code
   */
  async getSalesTerritoryByCode(code: string): Promise<SalesTerritoryDto> {
    return ApiService.get<SalesTerritoryDto>(`${BASE_URL}/by-code/${code}`);
  },

  /**
   * Get child territories
   */
  async getChildTerritories(parentId: string): Promise<SalesTerritoryListDto[]> {
    return ApiService.get<SalesTerritoryListDto[]>(`${BASE_URL}/${parentId}/children`);
  },

  /**
   * Get root territories
   */
  async getRootTerritories(): Promise<SalesTerritoryListDto[]> {
    return ApiService.get<SalesTerritoryListDto[]>(`${BASE_URL}/roots`);
  },

  /**
   * Create a new sales territory
   */
  async createSalesTerritory(data: CreateSalesTerritoryCommand): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(BASE_URL, data);
  },

  /**
   * Update a sales territory
   */
  async updateSalesTerritory(id: string, data: UpdateSalesTerritoryCommand): Promise<SalesTerritoryDto> {
    return ApiService.put<SalesTerritoryDto>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Delete a sales territory
   */
  async deleteSalesTerritory(id: string): Promise<void> {
    return ApiService.delete<void>(`${BASE_URL}/${id}`);
  },

  /**
   * Activate a territory
   */
  async activateTerritory(id: string): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(`${BASE_URL}/${id}/activate`);
  },

  /**
   * Deactivate a territory
   */
  async deactivateTerritory(id: string): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(`${BASE_URL}/${id}/deactivate`);
  },

  /**
   * Suspend a territory
   */
  async suspendTerritory(id: string, reason: string): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(`${BASE_URL}/${id}/suspend`, { reason });
  },

  /**
   * Assign manager to territory
   */
  async assignManager(id: string, managerId: string, managerName: string): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(`${BASE_URL}/${id}/manager`, { managerId, managerName });
  },

  /**
   * Remove manager from territory
   */
  async removeManager(id: string): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(`${BASE_URL}/${id}/manager/remove`);
  },

  /**
   * Assign sales rep to territory
   */
  async assignSalesRep(id: string, data: AssignSalesRepCommand): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(`${BASE_URL}/${id}/assignments`, data);
  },

  /**
   * Remove assignment from territory
   */
  async removeAssignment(id: string, assignmentId: string): Promise<SalesTerritoryDto> {
    return ApiService.delete<SalesTerritoryDto>(`${BASE_URL}/${id}/assignments/${assignmentId}`);
  },

  /**
   * Assign customer to territory
   */
  async assignCustomer(id: string, data: AssignCustomerToTerritoryCommand): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(`${BASE_URL}/${id}/customers`, data);
  },

  /**
   * Remove customer from territory
   */
  async removeCustomer(id: string, customerId: string): Promise<SalesTerritoryDto> {
    return ApiService.delete<SalesTerritoryDto>(`${BASE_URL}/${id}/customers/${customerId}`);
  },

  /**
   * Add postal code to territory
   */
  async addPostalCode(id: string, postalCode: string, areaName?: string): Promise<SalesTerritoryDto> {
    return ApiService.post<SalesTerritoryDto>(`${BASE_URL}/${id}/postal-codes`, { postalCode, areaName });
  },

  /**
   * Remove postal code from territory
   */
  async removePostalCode(id: string, postalCodeId: string): Promise<SalesTerritoryDto> {
    return ApiService.delete<SalesTerritoryDto>(`${BASE_URL}/${id}/postal-codes/${postalCodeId}`);
  },
};
