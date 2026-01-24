import { ApiService } from '@/lib/api/api-service';
import type {
  SalesTargetDto,
  SalesTargetListDto,
  CreateSalesTargetDto,
  AssignSalesTargetDto,
  AddSalesTargetPeriodDto,
  AddSalesTargetProductDto,
  RecordAchievementDto,
  SalesTargetQueryParams,
  LeaderboardEntryDto,
  SalesTargetStatisticsDto,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/SalesTargets';

export const targetService = {
  async getTargets(params?: SalesTargetQueryParams): Promise<PagedResult<SalesTargetListDto>> {
    return ApiService.get<PagedResult<SalesTargetListDto>>(BASE_URL, { params });
  },
  async getTarget(id: string): Promise<SalesTargetDto> {
    return ApiService.get<SalesTargetDto>(`${BASE_URL}/${id}`);
  },
  async getTargetByCode(code: string): Promise<SalesTargetDto> {
    return ApiService.get<SalesTargetDto>(`${BASE_URL}/by-code/${code}`);
  },
  async getTargetsByYear(year: number): Promise<SalesTargetListDto[]> {
    return ApiService.get<SalesTargetListDto[]>(`${BASE_URL}/by-year/${year}`);
  },
  async getTargetsByRepresentative(salesRepId: string): Promise<SalesTargetListDto[]> {
    return ApiService.get<SalesTargetListDto[]>(`${BASE_URL}/by-representative/${salesRepId}`);
  },
  async getTargetsByTeam(teamId: string): Promise<SalesTargetListDto[]> {
    return ApiService.get<SalesTargetListDto[]>(`${BASE_URL}/by-team/${teamId}`);
  },
  async getActiveTargets(): Promise<SalesTargetListDto[]> {
    return ApiService.get<SalesTargetListDto[]>(`${BASE_URL}/active`);
  },
  async createTarget(data: CreateSalesTargetDto): Promise<SalesTargetDto> {
    return ApiService.post<SalesTargetDto>(BASE_URL, data);
  },
  async assignToRepresentative(id: string, data: AssignSalesTargetDto): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/assign-representative`, data);
  },
  async assignToTeam(id: string, data: AssignSalesTargetDto): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/assign-team`, data);
  },
  async assignToTerritory(id: string, data: AssignSalesTargetDto): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/assign-territory`, data);
  },
  async addPeriod(id: string, data: AddSalesTargetPeriodDto): Promise<SalesTargetDto> {
    return ApiService.post<SalesTargetDto>(`${BASE_URL}/${id}/periods`, data);
  },
  async generatePeriods(id: string): Promise<SalesTargetDto> {
    return ApiService.post<SalesTargetDto>(`${BASE_URL}/${id}/generate-periods`);
  },
  async addProduct(id: string, data: AddSalesTargetProductDto): Promise<SalesTargetDto> {
    return ApiService.post<SalesTargetDto>(`${BASE_URL}/${id}/products`, data);
  },
  async recordAchievement(id: string, data: RecordAchievementDto): Promise<SalesTargetDto> {
    return ApiService.post<SalesTargetDto>(`${BASE_URL}/${id}/achievements`, data);
  },
  async activate(id: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/activate`);
  },
  async close(id: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/close`);
  },
  async cancel(id: string, reason: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/cancel`, JSON.stringify(reason), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
  async deactivate(id: string): Promise<void> {
    await ApiService.post(`${BASE_URL}/${id}/deactivate`);
  },
  async getStatistics(): Promise<SalesTargetStatisticsDto> {
    return ApiService.get<SalesTargetStatisticsDto>(`${BASE_URL}/statistics`);
  },
  async getLeaderboard(period?: string, limit?: number): Promise<LeaderboardEntryDto[]> {
    return ApiService.get<LeaderboardEntryDto[]>(`${BASE_URL}/leaderboard`, { params: { period, limit } });
  },
};
