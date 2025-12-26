// =====================================
// SHIPMENT SERVICE
// Feature-Based Architecture
// =====================================

import { ApiService } from '@/lib/api/api-service';
import type {
  ShipmentDto,
  ShipmentListDto,
  ShipmentQueryParams,
  CreateShipmentCommand,
  CreateShipmentFromOrderCommand,
  UpdateShipmentCommand,
  ShipShipmentCommand,
  DeliverShipmentCommand,
  AddShipmentItemCommand,
  UpdateShipmentItemCommand,
  UpdateTrackingCommand,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/shipments';

export const shipmentService = {
  /**
   * Get all shipments with pagination and filtering
   */
  async getShipments(params?: ShipmentQueryParams): Promise<PagedResult<ShipmentListDto>> {
    return ApiService.get<PagedResult<ShipmentListDto>>(BASE_URL, { params });
  },

  /**
   * Get a single shipment by ID
   */
  async getShipment(id: string): Promise<ShipmentDto> {
    return ApiService.get<ShipmentDto>(`${BASE_URL}/${id}`);
  },

  /**
   * Get shipment by number
   */
  async getShipmentByNumber(shipmentNumber: string): Promise<ShipmentDto> {
    return ApiService.get<ShipmentDto>(`${BASE_URL}/by-number/${shipmentNumber}`);
  },

  /**
   * Get shipments by order
   */
  async getShipmentsByOrder(orderId: string): Promise<ShipmentListDto[]> {
    return ApiService.get<ShipmentListDto[]>(`${BASE_URL}/by-order/${orderId}`);
  },

  /**
   * Get shipments by customer
   */
  async getShipmentsByCustomer(customerId: string): Promise<ShipmentListDto[]> {
    return ApiService.get<ShipmentListDto[]>(`${BASE_URL}/by-customer/${customerId}`);
  },

  /**
   * Get pending shipments
   */
  async getPendingShipments(): Promise<ShipmentListDto[]> {
    return ApiService.get<ShipmentListDto[]>(`${BASE_URL}/pending`);
  },

  /**
   * Get in-transit shipments
   */
  async getInTransitShipments(): Promise<ShipmentListDto[]> {
    return ApiService.get<ShipmentListDto[]>(`${BASE_URL}/in-transit`);
  },

  /**
   * Get overdue shipments
   */
  async getOverdueShipments(): Promise<ShipmentListDto[]> {
    return ApiService.get<ShipmentListDto[]>(`${BASE_URL}/overdue`);
  },

  /**
   * Create a new shipment
   */
  async createShipment(data: CreateShipmentCommand): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(BASE_URL, data);
  },

  /**
   * Create shipment from order
   */
  async createShipmentFromOrder(data: CreateShipmentFromOrderCommand): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`${BASE_URL}/from-order`, data);
  },

  /**
   * Update a shipment
   */
  async updateShipment(id: string, data: UpdateShipmentCommand): Promise<ShipmentDto> {
    return ApiService.put<ShipmentDto>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Delete a shipment
   */
  async deleteShipment(id: string): Promise<void> {
    return ApiService.delete<void>(`${BASE_URL}/${id}`);
  },

  /**
   * Confirm a shipment
   */
  async confirmShipment(id: string): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`${BASE_URL}/${id}/confirm`);
  },

  /**
   * Pick a shipment
   */
  async pickShipment(id: string): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`${BASE_URL}/${id}/pick`);
  },

  /**
   * Pack a shipment
   */
  async packShipment(id: string): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`${BASE_URL}/${id}/pack`);
  },

  /**
   * Ship a shipment
   */
  async shipShipment(id: string, data: ShipShipmentCommand): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`${BASE_URL}/${id}/ship`, data);
  },

  /**
   * Deliver a shipment
   */
  async deliverShipment(id: string, data: DeliverShipmentCommand): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`${BASE_URL}/${id}/deliver`, data);
  },

  /**
   * Cancel a shipment
   */
  async cancelShipment(id: string, reason: string): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`${BASE_URL}/${id}/cancel`, { reason });
  },

  /**
   * Add item to shipment
   */
  async addShipmentItem(id: string, data: AddShipmentItemCommand): Promise<ShipmentDto> {
    return ApiService.post<ShipmentDto>(`${BASE_URL}/${id}/items`, data);
  },

  /**
   * Update shipment item
   */
  async updateShipmentItem(id: string, itemId: string, data: UpdateShipmentItemCommand): Promise<ShipmentDto> {
    return ApiService.put<ShipmentDto>(`${BASE_URL}/${id}/items/${itemId}`, data);
  },

  /**
   * Remove item from shipment
   */
  async removeShipmentItem(id: string, itemId: string): Promise<ShipmentDto> {
    return ApiService.delete<ShipmentDto>(`${BASE_URL}/${id}/items/${itemId}`);
  },

  /**
   * Update tracking info
   */
  async updateTrackingInfo(id: string, data: UpdateTrackingCommand): Promise<ShipmentDto> {
    return ApiService.put<ShipmentDto>(`${BASE_URL}/${id}/tracking`, data);
  },
};
