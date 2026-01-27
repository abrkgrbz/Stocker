import { apiClient } from './apiClient';

export interface ReportTypeDto {
    id: string;
    name: string;
    description: string;
    category: string;
}

export interface ReportHistoryDto {
    id: string;
    type: string;
    generatedAt: string;
    status: string;
    downloadUrl?: string;
}

export interface ScheduledReportDto {
    id: string;
    type: string;
    schedule: string;
    recipients: string[];
    isActive: boolean;
}

class ReportService {
    private readonly baseUrl = '/api/master/reports';

    async getTypes(): Promise<ReportTypeDto[]> {
        const response = await apiClient.get<ReportTypeDto[]>(`${this.baseUrl}/types`);
        // @ts-ignore
        return response;
    }

    async getTypesGrouped(): Promise<Record<string, ReportTypeDto[]>> {
        const response = await apiClient.get<Record<string, ReportTypeDto[]>>(`${this.baseUrl}/types/grouped`);
        // @ts-ignore
        return response;
    }

    async generate(typeId: string, parameters?: any): Promise<{ reportId: string }> {
        const response = await apiClient.post<{ reportId: string }>(`${this.baseUrl}/generate`, { typeId, parameters });
        // @ts-ignore
        return response;
    }

    async getHistory(): Promise<ReportHistoryDto[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/history`) as any;
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.items)) return response.items;
        return [];
    }

    async download(reportId: string): Promise<Blob> {
        const response = await apiClient.get(`${this.baseUrl}/download/${reportId}`, { responseType: 'blob' });
        // @ts-ignore
        return response;
    }

    async schedule(data: any): Promise<ScheduledReportDto> {
        const response = await apiClient.post<ScheduledReportDto>(`${this.baseUrl}/schedule`, data);
        // @ts-ignore
        return response;
    }

    async getScheduled(): Promise<ScheduledReportDto[]> {
        const response = await apiClient.get<ScheduledReportDto[]>(`${this.baseUrl}/scheduled`);
        // @ts-ignore
        return response;
    }

    async toggleSchedule(id: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/scheduled/${id}/toggle`);
        // @ts-ignore
        return response.success;
    }

    async deleteScheduled(id: string): Promise<boolean> {
        const response = await apiClient.delete(`${this.baseUrl}/scheduled/${id}`);
        // @ts-ignore
        return response.success;
    }
}

export const reportService = new ReportService();
