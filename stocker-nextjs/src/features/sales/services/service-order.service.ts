// =====================================
// SERVICE ORDER SERVICE
// Feature-Based Architecture
// =====================================

import { ApiService } from '@/lib/api/api-service';
import type {
  ServiceOrderDto,
  ServiceOrderListDto,
  ServiceOrderStatisticsDto,
  ServiceOrderQueryParams,
  CreateServiceOrderCommand,
  UpdateServiceOrderCommand,
  AssignTechnicianCommand,
  CompleteServiceOrderCommand,
  AddServiceOrderItemCommand,
  UpdateServiceOrderItemCommand,
  AddServiceOrderNoteCommand,
  SubmitServiceFeedbackCommand,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/service-orders';

export const serviceOrderService = {
  /**
   * Get all service orders with pagination and filtering
   */
  async getServiceOrders(params?: ServiceOrderQueryParams): Promise<PagedResult<ServiceOrderListDto>> {
    return ApiService.get<PagedResult<ServiceOrderListDto>>(BASE_URL, { params });
  },

  /**
   * Get a single service order by ID
   */
  async getServiceOrder(id: string): Promise<ServiceOrderDto> {
    return ApiService.get<ServiceOrderDto>(`${BASE_URL}/${id}`);
  },

  /**
   * Get service orders by customer
   */
  async getServiceOrdersByCustomer(customerId: string): Promise<ServiceOrderListDto[]> {
    return ApiService.get<ServiceOrderListDto[]>(`${BASE_URL}/by-customer/${customerId}`);
  },

  /**
   * Get service order statistics
   */
  async getServiceOrderStatistics(): Promise<ServiceOrderStatisticsDto> {
    return ApiService.get<ServiceOrderStatisticsDto>(`${BASE_URL}/statistics`);
  },

  /**
   * Create a new service order
   */
  async createServiceOrder(data: CreateServiceOrderCommand): Promise<ServiceOrderDto> {
    return ApiService.post<ServiceOrderDto>(BASE_URL, data);
  },

  /**
   * Update a service order
   */
  async updateServiceOrder(id: string, data: UpdateServiceOrderCommand): Promise<ServiceOrderDto> {
    return ApiService.put<ServiceOrderDto>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Delete a service order
   */
  async deleteServiceOrder(id: string): Promise<void> {
    return ApiService.delete<void>(`${BASE_URL}/${id}`);
  },

  /**
   * Assign technician to service order
   */
  async assignTechnician(id: string, data: AssignTechnicianCommand): Promise<ServiceOrderDto> {
    return ApiService.post<ServiceOrderDto>(`${BASE_URL}/${id}/assign`, data);
  },

  /**
   * Start a service order
   */
  async startServiceOrder(id: string): Promise<ServiceOrderDto> {
    return ApiService.post<ServiceOrderDto>(`${BASE_URL}/${id}/start`);
  },

  /**
   * Complete a service order
   */
  async completeServiceOrder(id: string, data: CompleteServiceOrderCommand): Promise<ServiceOrderDto> {
    return ApiService.post<ServiceOrderDto>(`${BASE_URL}/${id}/complete`, data);
  },

  /**
   * Cancel a service order
   */
  async cancelServiceOrder(id: string, reason: string): Promise<ServiceOrderDto> {
    return ApiService.post<ServiceOrderDto>(`${BASE_URL}/${id}/cancel`, { reason });
  },

  /**
   * Add item to service order
   */
  async addServiceOrderItem(id: string, data: AddServiceOrderItemCommand): Promise<ServiceOrderDto> {
    return ApiService.post<ServiceOrderDto>(`${BASE_URL}/${id}/items`, data);
  },

  /**
   * Update service order item
   */
  async updateServiceOrderItem(id: string, itemId: string, data: UpdateServiceOrderItemCommand): Promise<ServiceOrderDto> {
    return ApiService.put<ServiceOrderDto>(`${BASE_URL}/${id}/items/${itemId}`, data);
  },

  /**
   * Remove item from service order
   */
  async removeServiceOrderItem(id: string, itemId: string): Promise<ServiceOrderDto> {
    return ApiService.delete<ServiceOrderDto>(`${BASE_URL}/${id}/items/${itemId}`);
  },

  /**
   * Add note to service order
   */
  async addServiceOrderNote(id: string, data: AddServiceOrderNoteCommand): Promise<ServiceOrderDto> {
    return ApiService.post<ServiceOrderDto>(`${BASE_URL}/${id}/notes`, data);
  },

  /**
   * Submit customer feedback for service order
   */
  async submitFeedback(id: string, data: SubmitServiceFeedbackCommand): Promise<ServiceOrderDto> {
    return ApiService.post<ServiceOrderDto>(`${BASE_URL}/${id}/feedback`, data);
  },
};
