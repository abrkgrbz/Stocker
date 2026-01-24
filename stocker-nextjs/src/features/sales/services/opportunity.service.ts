import { ApiService } from '@/lib/api/api-service';
import type {
  OpportunityDto,
  OpportunityListDto,
  CreateOpportunityDto,
  OpportunityQueryParams,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/Opportunities';

export const opportunityService = {
  async getOpportunities(params?: OpportunityQueryParams): Promise<PagedResult<OpportunityListDto>> {
    return ApiService.get<PagedResult<OpportunityListDto>>(BASE_URL, { params });
  },
  async getOpportunity(id: string): Promise<OpportunityDto> {
    return ApiService.get<OpportunityDto>(`${BASE_URL}/${id}`);
  },
  async getByCustomer(customerId: string): Promise<OpportunityListDto[]> {
    return ApiService.get<OpportunityListDto[]>(`${BASE_URL}/by-customer/${customerId}`);
  },
  async getBySalesPerson(salesPersonId: string): Promise<OpportunityListDto[]> {
    return ApiService.get<OpportunityListDto[]>(`${BASE_URL}/by-salesperson/${salesPersonId}`);
  },
  async getByPipeline(pipelineId: string): Promise<OpportunityListDto[]> {
    return ApiService.get<OpportunityListDto[]>(`${BASE_URL}/by-pipeline/${pipelineId}`);
  },
  async getActive(): Promise<OpportunityListDto[]> {
    return ApiService.get<OpportunityListDto[]>(`${BASE_URL}/active`);
  },
  async createOpportunity(data: CreateOpportunityDto): Promise<OpportunityDto> {
    return ApiService.post<OpportunityDto>(BASE_URL, data);
  },
  async updateStage(id: string, stage: string): Promise<void> {
    await ApiService.put(`${BASE_URL}/${id}/stage`, { stage });
  },
  async updateValue(id: string, estimatedValue: number, currency?: string): Promise<void> {
    await ApiService.put(`${BASE_URL}/${id}/value`, { estimatedValue, currency });
  },
  async markWon(id: string, data?: { salesOrderId?: string; salesOrderNumber?: string }): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/won`, data || {});
  },
  async markLost(id: string, reason: string, lostToCompetitor?: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/lost`, { reason, lostToCompetitor });
  },
  async assign(id: string, salesPersonId: string, salesPersonName?: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/assign`, { salesPersonId, salesPersonName });
  },
  async linkQuotation(id: string, quotationId: string, quotationNumber: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/quotation`, { quotationId, quotationNumber });
  },
  async moveToPipelineStage(id: string, pipelineId: string, stageId: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/pipeline-stage`, { pipelineId, stageId });
  },
};
