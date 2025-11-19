import { apiClient } from './apiClient';

// Report DTOs
export interface ReportDto {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  category: string;
  createdBy: string;
  createdAt: string;
  lastRun?: string;
  status: ReportStatus;
  parameters?: Record<string, any>;
  schedule?: ReportSchedule;
}

export enum ReportType {
  Financial = 'Financial',
  Users = 'Users',
  Subscriptions = 'Subscriptions',
  Performance = 'Performance',
  Custom = 'Custom'
}

export enum ReportStatus {
  Pending = 'Pending',
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
  Scheduled = 'Scheduled'
}

export interface ReportSchedule {
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  enabled: boolean;
}

export interface GenerateReportCommand {
  reportId: string;
  parameters?: Record<string, any>;
  format?: 'pdf' | 'excel' | 'csv';
}

export interface ReportResult {
  id: string;
  reportId: string;
  reportName: string;
  generatedAt: string;
  format: string;
  fileUrl: string;
  fileSize: number;
  status: ReportStatus;
}

export interface GetReportsQuery {
  type?: ReportType;
  category?: string;
  status?: ReportStatus;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ReportsListResponse {
  data: ReportDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

class ReportService {
  private readonly basePath = '/api/master/reports';

  /**
   * Get all reports with filtering
   */
  async getAll(query?: GetReportsQuery): Promise<ReportsListResponse> {
    try {
      const params = new URLSearchParams();

      if (query) {
        if (query.type) params.append('type', query.type);
        if (query.category) params.append('category', query.category);
        if (query.status) params.append('status', query.status);
        if (query.fromDate) params.append('fromDate', query.fromDate);
        if (query.toDate) params.append('toDate', query.toDate);
        if (query.pageNumber) params.append('pageNumber', query.pageNumber.toString());
        if (query.pageSize) params.append('pageSize', query.pageSize.toString());
      }

      const queryString = params.toString();
      const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

      return await apiClient.get<ReportsListResponse>(url);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      throw error;
    }
  }

  /**
   * Get report by ID
   */
  async getById(id: string): Promise<ReportDto | null> {
    try {
      return await apiClient.get<ReportDto>(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch report ${id}:`, error);
      return null;
    }
  }

  /**
   * Generate a report
   */
  async generate(command: GenerateReportCommand): Promise<ReportResult> {
    try {
      return await apiClient.post<ReportResult>(`${this.basePath}/generate`, command);
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  /**
   * Get report results history
   */
  async getResults(reportId?: string): Promise<ReportResult[]> {
    try {
      const url = reportId ? `${this.basePath}/results?reportId=${reportId}` : `${this.basePath}/results`;
      return await apiClient.get<ReportResult[]>(url);
    } catch (error) {
      console.error('Failed to fetch report results:', error);
      throw error;
    }
  }

  /**
   * Download report result
   */
  async download(resultId: string): Promise<Blob> {
    try {
      return await apiClient.get<Blob>(`${this.basePath}/results/${resultId}/download`, undefined);
    } catch (error) {
      console.error(`Failed to download report result ${resultId}:`, error);
      throw error;
    }
  }

  /**
   * Schedule a report
   */
  async schedule(reportId: string, schedule: ReportSchedule): Promise<boolean> {
    try {
      const response = await apiClient.post<boolean>(`${this.basePath}/${reportId}/schedule`, schedule);
      return response === true;
    } catch (error) {
      console.error(`Failed to schedule report ${reportId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel scheduled report
   */
  async cancelSchedule(reportId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<boolean>(`${this.basePath}/${reportId}/schedule`);
      return response === true;
    } catch (error) {
      console.error(`Failed to cancel schedule for report ${reportId}:`, error);
      throw error;
    }
  }

  /**
   * Helper: Get report type color
   */
  getTypeColor(type: ReportType): string {
    switch (type) {
      case ReportType.Financial:
        return 'success';
      case ReportType.Users:
        return 'processing';
      case ReportType.Subscriptions:
        return 'warning';
      case ReportType.Performance:
        return 'error';
      case ReportType.Custom:
        return 'default';
      default:
        return 'default';
    }
  }

  /**
   * Helper: Get status color
   */
  getStatusColor(status: ReportStatus): string {
    switch (status) {
      case ReportStatus.Pending:
        return 'default';
      case ReportStatus.Running:
        return 'processing';
      case ReportStatus.Completed:
        return 'success';
      case ReportStatus.Failed:
        return 'error';
      case ReportStatus.Scheduled:
        return 'warning';
      default:
        return 'default';
    }
  }
}

// Export singleton instance
export const reportService = new ReportService();
