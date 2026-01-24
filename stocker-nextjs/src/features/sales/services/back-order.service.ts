import { ApiService } from '@/lib/api/api-service';
import type {
  BackOrderDto,
  BackOrderListDto,
  CreateBackOrderDto,
  FulfillBackOrderItemDto,
  BackOrderQueryParams,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/BackOrders';

export const backOrderService = {
  async getBackOrders(params?: BackOrderQueryParams): Promise<PagedResult<BackOrderListDto>> {
    return ApiService.get<PagedResult<BackOrderListDto>>(BASE_URL, { params });
  },
  async getBackOrder(id: string): Promise<BackOrderDto> {
    return ApiService.get<BackOrderDto>(`${BASE_URL}/${id}`);
  },
  async getBySalesOrder(salesOrderId: string): Promise<BackOrderListDto[]> {
    return ApiService.get<BackOrderListDto[]>(`${BASE_URL}/by-order/${salesOrderId}`);
  },
  async getByCustomer(customerId: string): Promise<BackOrderListDto[]> {
    return ApiService.get<BackOrderListDto[]>(`${BASE_URL}/by-customer/${customerId}`);
  },
  async getPending(): Promise<BackOrderListDto[]> {
    return ApiService.get<BackOrderListDto[]>(`${BASE_URL}/pending`);
  },
  async createBackOrder(data: CreateBackOrderDto): Promise<BackOrderDto> {
    return ApiService.post<BackOrderDto>(BASE_URL, data);
  },
  async fulfillItem(id: string, data: FulfillBackOrderItemDto): Promise<BackOrderDto> {
    return ApiService.post<BackOrderDto>(`${BASE_URL}/${id}/fulfill`, data);
  },
  async cancel(id: string, reason: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/cancel`, { reason });
  },
  async setPriority(id: string, priority: string): Promise<void> {
    await ApiService.put(`${BASE_URL}/${id}/priority`, { priority });
  },
  async notifyCustomer(id: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/notify`);
  },
};
