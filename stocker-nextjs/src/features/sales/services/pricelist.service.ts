import { ApiService } from '@/lib/api/api-service';
import type {
  PriceListDto,
  PriceListListDto,
  CreatePriceListDto,
  AddPriceListItemDto,
  PriceListQueryParams,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/PriceLists';

export const priceListService = {
  async getPriceLists(params?: PriceListQueryParams): Promise<PagedResult<PriceListListDto>> {
    return ApiService.get<PagedResult<PriceListListDto>>(BASE_URL, { params });
  },
  async getPriceList(id: string): Promise<PriceListDto> {
    return ApiService.get<PriceListDto>(`${BASE_URL}/${id}`);
  },
  async getPriceListByCode(code: string): Promise<PriceListDto> {
    return ApiService.get<PriceListDto>(`${BASE_URL}/by-code/${code}`);
  },
  async getActivePriceLists(): Promise<PriceListListDto[]> {
    return ApiService.get<PriceListListDto[]>(`${BASE_URL}/active`);
  },
  async createPriceList(data: CreatePriceListDto): Promise<PriceListDto> {
    return ApiService.post<PriceListDto>(BASE_URL, data);
  },
  async addItem(id: string, data: AddPriceListItemDto): Promise<PriceListDto> {
    return ApiService.post<PriceListDto>(`${BASE_URL}/${id}/items`, data);
  },
  async updateItemPrice(id: string, itemId: string, unitPrice: number): Promise<void> {
    await ApiService.put(`${BASE_URL}/${id}/items/${itemId}/price`, { unitPrice, currency: '' });
  },
  async removeItem(id: string, itemId: string): Promise<void> {
    await ApiService.delete(`${BASE_URL}/${id}/items/${itemId}`);
  },
  async assignCustomer(id: string, data: { customerId: string; customerName: string }): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/customers`, data);
  },
  async removeCustomer(id: string, customerId: string): Promise<void> {
    await ApiService.delete(`${BASE_URL}/${id}/customers/${customerId}`);
  },
  async activate(id: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/activate`);
  },
  async deactivate(id: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/deactivate`);
  },
};
