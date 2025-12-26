// =====================================
// SALES TARGET SERVICE
// Feature-Based Architecture
// =====================================

import { ApiService } from '@/lib/api/api-service';
import type {
  SalesTargetDto,
  SalesTargetListDto,
  SalesTargetStatisticsDto,
  SalesTargetQueryParams,
  CreateSalesTargetCommand,
  UpdateSalesTargetCommand,
  UpdateTargetProgressCommand,
  LeaderboardEntryDto,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/targets';

export const targetService = {
  // =====================================
  // QUERY OPERATIONS
  // =====================================

  /**
   * Get paginated sales targets
   */
  async getTargets(params?: SalesTargetQueryParams): Promise<PagedResult<SalesTargetListDto>> {
    return ApiService.get<PagedResult<SalesTargetListDto>>(BASE_URL, { params });
  },

  /**
   * Get a single target by ID
   */
  async getTarget(id: string): Promise<SalesTargetDto> {
    return ApiService.get<SalesTargetDto>(`${BASE_URL}/${id}`);
  },

  /**
   * Get targets by sales rep
   */
  async getTargetsBySalesRep(salesRepId: string): Promise<SalesTargetListDto[]> {
    return ApiService.get<SalesTargetListDto[]>(`${BASE_URL}/sales-rep/${salesRepId}`);
  },

  /**
   * Get targets by team
   */
  async getTargetsByTeam(teamId: string): Promise<SalesTargetListDto[]> {
    return ApiService.get<SalesTargetListDto[]>(`${BASE_URL}/team/${teamId}`);
  },

  /**
   * Get current period targets
   */
  async getCurrentTargets(): Promise<SalesTargetListDto[]> {
    return ApiService.get<SalesTargetListDto[]>(`${BASE_URL}/current`);
  },

  /**
   * Get target statistics
   */
  async getTargetStatistics(): Promise<SalesTargetStatisticsDto> {
    return ApiService.get<SalesTargetStatisticsDto>(`${BASE_URL}/statistics`);
  },

  /**
   * Get leaderboard
   */
  async getLeaderboard(period?: string, limit?: number): Promise<LeaderboardEntryDto[]> {
    return ApiService.get<LeaderboardEntryDto[]>(`${BASE_URL}/leaderboard`, {
      params: { period, limit },
    });
  },

  /**
   * Get my targets (current user)
   */
  async getMyTargets(): Promise<SalesTargetListDto[]> {
    return ApiService.get<SalesTargetListDto[]>(`${BASE_URL}/my`);
  },

  // =====================================
  // MUTATION OPERATIONS
  // =====================================

  /**
   * Create a new target
   */
  async createTarget(data: CreateSalesTargetCommand): Promise<SalesTargetDto> {
    return ApiService.post<SalesTargetDto>(BASE_URL, data);
  },

  /**
   * Update a target
   */
  async updateTarget(id: string, data: UpdateSalesTargetCommand): Promise<SalesTargetDto> {
    return ApiService.put<SalesTargetDto>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Delete a target
   */
  async deleteTarget(id: string): Promise<void> {
    await ApiService.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Update target progress
   */
  async updateProgress(id: string, data: UpdateTargetProgressCommand): Promise<SalesTargetDto> {
    return ApiService.post<SalesTargetDto>(`${BASE_URL}/${id}/progress`, data);
  },

  /**
   * Activate a target
   */
  async activateTarget(id: string): Promise<SalesTargetDto> {
    return ApiService.post<SalesTargetDto>(`${BASE_URL}/${id}/activate`);
  },

  /**
   * Deactivate a target
   */
  async deactivateTarget(id: string): Promise<SalesTargetDto> {
    return ApiService.post<SalesTargetDto>(`${BASE_URL}/${id}/deactivate`);
  },

  /**
   * Recalculate target progress from orders
   */
  async recalculateProgress(id: string): Promise<SalesTargetDto> {
    return ApiService.post<SalesTargetDto>(`${BASE_URL}/${id}/recalculate`);
  },

  /**
   * Bulk create targets for team
   */
  async bulkCreateForTeam(teamId: string, data: Omit<CreateSalesTargetCommand, 'salesRepId'>[]): Promise<SalesTargetDto[]> {
    return ApiService.post<SalesTargetDto[]>(`${BASE_URL}/bulk/team/${teamId}`, data);
  },
};
