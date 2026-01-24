import { ApiService } from '@/lib/api/api-service';
import type {
  CustomerSegmentDto,
  CustomerSegmentListDto,
  CreateCustomerSegmentDto,
  SetSegmentPricingDto,
  SetSegmentCreditTermsDto,
  SetSegmentServiceLevelDto,
  SetSegmentEligibilityDto,
  SetSegmentBenefitsDto,
  SetSegmentVisualDto,
  UpdateSegmentDetailsDto,
  AssignCustomerToSegmentDto,
  CustomerSegmentQueryParams,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/CustomerSegments';

export const segmentService = {
  async getSegments(params?: CustomerSegmentQueryParams): Promise<PagedResult<CustomerSegmentListDto>> {
    return ApiService.get<PagedResult<CustomerSegmentListDto>>(BASE_URL, { params });
  },
  async getSegment(id: string): Promise<CustomerSegmentDto> {
    return ApiService.get<CustomerSegmentDto>(`${BASE_URL}/${id}`);
  },
  async getSegmentByCode(code: string): Promise<CustomerSegmentDto> {
    return ApiService.get<CustomerSegmentDto>(`${BASE_URL}/by-code/${code}`);
  },
  async getActiveSegments(): Promise<CustomerSegmentListDto[]> {
    return ApiService.get<CustomerSegmentListDto[]>(`${BASE_URL}/active`);
  },
  async getDefaultSegment(): Promise<CustomerSegmentDto> {
    return ApiService.get<CustomerSegmentDto>(`${BASE_URL}/default`);
  },
  async getSegmentsByPriority(priority: string): Promise<CustomerSegmentListDto[]> {
    return ApiService.get<CustomerSegmentListDto[]>(`${BASE_URL}/by-priority/${priority}`);
  },
  async createSegment(data: CreateCustomerSegmentDto): Promise<CustomerSegmentDto> {
    return ApiService.post<CustomerSegmentDto>(BASE_URL, data);
  },
  async setPricing(id: string, data: SetSegmentPricingDto): Promise<void> {
    await ApiService.put(`${BASE_URL}/${id}/pricing`, data);
  },
  async setCreditTerms(id: string, data: SetSegmentCreditTermsDto): Promise<void> {
    await ApiService.put(`${BASE_URL}/${id}/credit-terms`, data);
  },
  async setServiceLevel(id: string, data: SetSegmentServiceLevelDto): Promise<void> {
    await ApiService.put(`${BASE_URL}/${id}/service-level`, data);
  },
  async setEligibility(id: string, data: SetSegmentEligibilityDto): Promise<void> {
    await ApiService.put(`${BASE_URL}/${id}/eligibility`, data);
  },
  async setBenefits(id: string, data: SetSegmentBenefitsDto): Promise<void> {
    await ApiService.put(`${BASE_URL}/${id}/benefits`, data);
  },
  async setVisual(id: string, data: SetSegmentVisualDto): Promise<void> {
    await ApiService.put(`${BASE_URL}/${id}/visual`, data);
  },
  async updateDetails(id: string, data: UpdateSegmentDetailsDto): Promise<void> {
    await ApiService.put(`${BASE_URL}/${id}/details`, data);
  },
  async assignCustomer(id: string, data: AssignCustomerToSegmentDto): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/customers`, data);
  },
  async removeCustomer(id: string, customerId: string): Promise<void> {
    await ApiService.delete(`${BASE_URL}/${id}/customers/${customerId}`);
  },
  async setDefault(id: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/set-default`);
  },
  async activate(id: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/activate`);
  },
  async deactivate(id: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/deactivate`);
  },
  async delete(id: string): Promise<void> {
    await ApiService.delete(`${BASE_URL}/${id}`);
  },
  async recalculate(id: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/recalculate`);
  },
  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await ApiService.put(`${BASE_URL}/${id}`, data);
  },
};
