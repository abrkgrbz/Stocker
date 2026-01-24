import { ApiService } from '@/lib/api/api-service';
import type {
  SalesPipelineDto,
  SalesPipelineListDto,
  CreateSalesPipelineDto,
  AddPipelineStageDto,
  SalesPipelineQueryParams,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/SalesPipelines';

export const pipelineService = {
  async getPipelines(params?: SalesPipelineQueryParams): Promise<PagedResult<SalesPipelineListDto>> {
    return ApiService.get<PagedResult<SalesPipelineListDto>>(BASE_URL, { params });
  },
  async getPipeline(id: string): Promise<SalesPipelineDto> {
    return ApiService.get<SalesPipelineDto>(`${BASE_URL}/${id}`);
  },
  async getPipelineByCode(code: string): Promise<SalesPipelineDto> {
    return ApiService.get<SalesPipelineDto>(`${BASE_URL}/by-code/${code}`);
  },
  async getDefaultPipeline(): Promise<SalesPipelineDto> {
    return ApiService.get<SalesPipelineDto>(`${BASE_URL}/default`);
  },
  async getActivePipelines(): Promise<SalesPipelineListDto[]> {
    return ApiService.get<SalesPipelineListDto[]>(`${BASE_URL}/active`);
  },
  async createPipeline(data: CreateSalesPipelineDto): Promise<SalesPipelineDto> {
    return ApiService.post<SalesPipelineDto>(BASE_URL, data);
  },
  async updatePipeline(id: string, data: { name?: string; description?: string; type?: string }): Promise<void> {
    await ApiService.put(`${BASE_URL}/${id}`, data);
  },
  async addStage(id: string, data: AddPipelineStageDto): Promise<SalesPipelineDto> {
    return ApiService.post<SalesPipelineDto>(`${BASE_URL}/${id}/stages`, data);
  },
  async removeStage(id: string, stageId: string): Promise<void> {
    await ApiService.delete(`${BASE_URL}/${id}/stages/${stageId}`);
  },
  async reorderStage(id: string, stageId: string, newOrderIndex: number): Promise<void> {
    await ApiService.put(`${BASE_URL}/${id}/stages/${stageId}/reorder`, { newOrderIndex });
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
};
