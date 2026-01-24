import { ApiService } from '@/lib/api/api-service';
import type {
  DeliveryNoteDto,
  DeliveryNoteListDto,
  CreateDeliveryNoteDto,
  DispatchDeliveryNoteDto,
  DeliveryNoteQueryParams,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/DeliveryNotes';

export const deliveryNoteService = {
  async getDeliveryNotes(params?: DeliveryNoteQueryParams): Promise<PagedResult<DeliveryNoteListDto>> {
    return ApiService.get<PagedResult<DeliveryNoteListDto>>(BASE_URL, { params });
  },
  async getDeliveryNote(id: string): Promise<DeliveryNoteDto> {
    return ApiService.get<DeliveryNoteDto>(`${BASE_URL}/${id}`);
  },
  async getByNumber(number: string): Promise<DeliveryNoteDto> {
    return ApiService.get<DeliveryNoteDto>(`${BASE_URL}/by-number/${number}`);
  },
  async getBySalesOrder(salesOrderId: string): Promise<DeliveryNoteListDto[]> {
    return ApiService.get<DeliveryNoteListDto[]>(`${BASE_URL}/by-order/${salesOrderId}`);
  },
  async createDeliveryNote(data: CreateDeliveryNoteDto): Promise<DeliveryNoteDto> {
    return ApiService.post<DeliveryNoteDto>(BASE_URL, data);
  },
  async dispatch(id: string, data: DispatchDeliveryNoteDto): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/dispatch`, data);
  },
  async deliver(id: string, data: { receivedBy?: string; signature?: string }): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/deliver`, data);
  },
  async cancel(id: string, reason: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/cancel`, { reason });
  },
  async print(id: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/print`);
  },
  async sign(id: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/sign`);
  },
};
