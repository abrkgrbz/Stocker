import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/shared/types';

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  tenantId?: string;
  userId?: string;
  status?: string;
  type?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalUsers: number;
  totalTenants: number;
  activeSubscriptions: number;
  revenueGrowth: number;
  userGrowth: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  topTenants: Array<{
    id: string;
    name: string;
    revenue: number;
  }>;
}

export interface TenantReport {
  id: string;
  tenantName: string;
  subscriptionStatus: string;
  packageName: string;
  totalUsers: number;
  totalRevenue: number;
  lastPaymentDate: string;
  nextPaymentDate: string;
  createdAt: string;
}

export interface UserActivityReport {
  userId: string;
  userName: string;
  email: string;
  lastLogin: string;
  totalLogins: number;
  actionsPerformed: number;
  role: string;
}

export interface FinancialReport {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  subscriptionRevenue: number;
  additionalRevenue: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts?: boolean;
  includeDetails?: boolean;
}

class ReportService {
  private basePath = '/api/reports';

  // Dashboard & Analytics
  async getDashboardStats(filter?: ReportFilter): Promise<ApiResponse<DashboardStats>> {
    const response = await apiClient.get(`${this.basePath}/dashboard`, { params: filter });
    return response.data;
  }

  // Tenant Reports
  async getTenantReports(filter?: ReportFilter): Promise<ApiResponse<TenantReport[]>> {
    const response = await apiClient.get(`${this.basePath}/tenants`, { params: filter });
    return response.data;
  }

  async getTenantDetailReport(tenantId: string): Promise<ApiResponse<TenantReport>> {
    const response = await apiClient.get(`${this.basePath}/tenants/${tenantId}`);
    return response.data;
  }

  // User Activity Reports
  async getUserActivityReports(filter?: ReportFilter): Promise<ApiResponse<UserActivityReport[]>> {
    const response = await apiClient.get(`${this.basePath}/user-activity`, { params: filter });
    return response.data;
  }

  // Financial Reports
  async getFinancialReport(filter?: ReportFilter): Promise<ApiResponse<FinancialReport>> {
    const response = await apiClient.get(`${this.basePath}/financial`, { params: filter });
    return response.data;
  }

  async getRevenueReport(filter?: ReportFilter): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`${this.basePath}/revenue`, { params: filter });
    return response.data;
  }

  async getSubscriptionReport(filter?: ReportFilter): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`${this.basePath}/subscriptions`, { params: filter });
    return response.data;
  }

  // Export Reports
  async exportReport(
    reportType: string,
    filter: ReportFilter,
    options: ExportOptions
  ): Promise<Blob> {
    const response = await apiClient.post(
      `${this.basePath}/export`,
      { reportType, filter, options },
      { responseType: 'blob' }
    );
    return response.data;
  }

  async scheduleReport(data: {
    reportType: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    filter?: ReportFilter;
  }): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`${this.basePath}/schedule`, data);
    return response.data;
  }

  // Custom Reports
  async generateCustomReport(data: {
    name: string;
    query: any;
    columns: string[];
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.post(`${this.basePath}/custom`, data);
    return response.data;
  }

  async getSavedReports(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`${this.basePath}/saved`);
    return response.data;
  }

  async saveReport(data: {
    name: string;
    type: string;
    filter: ReportFilter;
    configuration: any;
  }): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`${this.basePath}/save`, data);
    return response.data;
  }
}

export const reportService = new ReportService();