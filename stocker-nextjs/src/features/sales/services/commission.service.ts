// =====================================
// COMMISSION SERVICE
// Feature-Based Architecture
// =====================================

import { ApiService } from '@/lib/api/api-service';
import type {
  CommissionPlan,
  CommissionPlanListItem,
  SalesCommission,
  SalesCommissionListItem,
  CommissionSummary,
  SalesPersonCommissionSummary,
  GetCommissionPlansParams,
  GetSalesCommissionsParams,
  CreateCommissionPlanDto,
  UpdateCommissionPlanDto,
  CreateCommissionTierDto,
  CalculateCommissionDto,
  PagedResult,
} from '../types';

const PLANS_BASE_URL = '/sales/commissions/plans';
const COMMISSIONS_BASE_URL = '/sales/commissions';

export const commissionService = {
  // =====================================
  // COMMISSION PLANS
  // =====================================

  /**
   * Get all commission plans with pagination and filtering
   */
  async getCommissionPlans(params?: GetCommissionPlansParams): Promise<PagedResult<CommissionPlanListItem>> {
    return ApiService.get<PagedResult<CommissionPlanListItem>>(PLANS_BASE_URL, { params });
  },

  /**
   * Get a single commission plan by ID
   */
  async getCommissionPlanById(id: string): Promise<CommissionPlan> {
    return ApiService.get<CommissionPlan>(`${PLANS_BASE_URL}/${id}`);
  },

  /**
   * Get active commission plans
   */
  async getActiveCommissionPlans(): Promise<CommissionPlanListItem[]> {
    return ApiService.get<CommissionPlanListItem[]>(`${PLANS_BASE_URL}/active`);
  },

  /**
   * Create a new commission plan
   */
  async createCommissionPlan(data: CreateCommissionPlanDto): Promise<CommissionPlan> {
    return ApiService.post<CommissionPlan>(PLANS_BASE_URL, data);
  },

  /**
   * Update a commission plan
   */
  async updateCommissionPlan(id: string, data: UpdateCommissionPlanDto): Promise<CommissionPlan> {
    return ApiService.put<CommissionPlan>(`${PLANS_BASE_URL}/${id}`, data);
  },

  /**
   * Add tier to commission plan
   */
  async addCommissionTier(planId: string, tier: CreateCommissionTierDto): Promise<CommissionPlan> {
    return ApiService.post<CommissionPlan>(`${PLANS_BASE_URL}/${planId}/tiers`, tier);
  },

  /**
   * Remove tier from commission plan
   */
  async removeCommissionTier(planId: string, tierId: string): Promise<CommissionPlan> {
    return ApiService.delete<CommissionPlan>(`${PLANS_BASE_URL}/${planId}/tiers/${tierId}`);
  },

  /**
   * Activate a commission plan
   */
  async activateCommissionPlan(id: string): Promise<CommissionPlan> {
    return ApiService.post<CommissionPlan>(`${PLANS_BASE_URL}/${id}/activate`);
  },

  /**
   * Deactivate a commission plan
   */
  async deactivateCommissionPlan(id: string): Promise<CommissionPlan> {
    return ApiService.post<CommissionPlan>(`${PLANS_BASE_URL}/${id}/deactivate`);
  },

  /**
   * Delete a commission plan
   */
  async deleteCommissionPlan(id: string): Promise<void> {
    return ApiService.delete<void>(`${PLANS_BASE_URL}/${id}`);
  },

  // =====================================
  // SALES COMMISSIONS
  // =====================================

  /**
   * Get all sales commissions with pagination and filtering
   */
  async getSalesCommissions(params?: GetSalesCommissionsParams): Promise<PagedResult<SalesCommissionListItem>> {
    return ApiService.get<PagedResult<SalesCommissionListItem>>(COMMISSIONS_BASE_URL, { params });
  },

  /**
   * Get a single sales commission by ID
   */
  async getSalesCommissionById(id: string): Promise<SalesCommission> {
    return ApiService.get<SalesCommission>(`${COMMISSIONS_BASE_URL}/${id}`);
  },

  /**
   * Get commissions by sales person
   */
  async getCommissionsBySalesPerson(salesPersonId: string, fromDate?: string, toDate?: string): Promise<SalesCommissionListItem[]> {
    return ApiService.get<SalesCommissionListItem[]>(`${COMMISSIONS_BASE_URL}/salesperson/${salesPersonId}`, {
      params: { fromDate, toDate },
    });
  },

  /**
   * Get pending commissions
   */
  async getPendingCommissions(): Promise<SalesCommissionListItem[]> {
    return ApiService.get<SalesCommissionListItem[]>(`${COMMISSIONS_BASE_URL}/pending`);
  },

  /**
   * Get approved commissions
   */
  async getApprovedCommissions(): Promise<SalesCommissionListItem[]> {
    return ApiService.get<SalesCommissionListItem[]>(`${COMMISSIONS_BASE_URL}/approved`);
  },

  /**
   * Get commission summary
   */
  async getCommissionSummary(fromDate?: string, toDate?: string): Promise<CommissionSummary> {
    return ApiService.get<CommissionSummary>(`${COMMISSIONS_BASE_URL}/summary`, {
      params: { fromDate, toDate },
    });
  },

  /**
   * Get sales person commission summary
   */
  async getSalesPersonCommissionSummary(salesPersonId: string, fromDate?: string, toDate?: string): Promise<SalesPersonCommissionSummary> {
    return ApiService.get<SalesPersonCommissionSummary>(`${COMMISSIONS_BASE_URL}/summary/salesperson/${salesPersonId}`, {
      params: { fromDate, toDate },
    });
  },

  /**
   * Calculate commission for a sale
   */
  async calculateCommission(data: CalculateCommissionDto): Promise<SalesCommission> {
    return ApiService.post<SalesCommission>(`${COMMISSIONS_BASE_URL}/calculate`, data);
  },

  /**
   * Approve a sales commission
   */
  async approveCommission(id: string): Promise<SalesCommission> {
    return ApiService.post<SalesCommission>(`${COMMISSIONS_BASE_URL}/${id}/approve`);
  },

  /**
   * Reject a sales commission
   */
  async rejectCommission(id: string, reason: string): Promise<SalesCommission> {
    return ApiService.post<SalesCommission>(`${COMMISSIONS_BASE_URL}/${id}/reject`, { reason });
  },

  /**
   * Mark commission as paid
   */
  async markCommissionAsPaid(id: string, paymentReference: string): Promise<SalesCommission> {
    return ApiService.post<SalesCommission>(`${COMMISSIONS_BASE_URL}/${id}/mark-paid`, { paymentReference });
  },

  /**
   * Cancel a sales commission
   */
  async cancelCommission(id: string, reason: string): Promise<SalesCommission> {
    return ApiService.post<SalesCommission>(`${COMMISSIONS_BASE_URL}/${id}/cancel`, { reason });
  },

  /**
   * Bulk approve commissions
   */
  async bulkApproveCommissions(ids: string[]): Promise<{ approvedCount: number }> {
    return ApiService.post<{ approvedCount: number }>(`${COMMISSIONS_BASE_URL}/bulk/approve`, { ids });
  },

  /**
   * Bulk mark commissions as paid
   */
  async bulkMarkCommissionsAsPaid(ids: string[], paymentReference: string): Promise<{ paidCount: number }> {
    return ApiService.post<{ paidCount: number }>(`${COMMISSIONS_BASE_URL}/bulk/mark-paid`, { ids, paymentReference });
  },
};
