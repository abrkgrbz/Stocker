import { apiClient } from './apiClient';

export type InvoiceStatus = 0 | 1 | 2 | 3 | 4 | 5;

export const INVOICE_STATUS = {
    Taslak: 0,
    Gonderildi: 1,
    Odendi: 2,
    KismenOdendi: 3,
    Gecikti: 4,
    Iptal: 5
} as const;

export interface InvoiceDto {
    id: string;
    invoiceNumber: string;
    tenantName: string;
    tenantId: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    status: InvoiceStatus;
    currency: string;
}

export interface CreateInvoiceDto {
    tenantId: string;
    amount: number;
    currency: string;
    dueDate: string;
    items: { description: string; quantity: number; unitPrice: number }[];
}

class InvoiceService {
    private readonly baseUrl = '/api/master/invoices';

    async getAll(): Promise<InvoiceDto[]> {
        const response = await apiClient.get<any>(this.baseUrl) as any;
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.items)) return response.items;
        return [];
    }

    async getById(id: string): Promise<InvoiceDto> {
        const response = await apiClient.get<InvoiceDto>(`${this.baseUrl}/${id}`);
        // @ts-ignore
        return response;
    }

    async getByTenant(tenantId: string): Promise<InvoiceDto[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/tenant/${tenantId}`) as any;
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.items)) return response.items;
        return [];
    }

    async create(data: CreateInvoiceDto): Promise<InvoiceDto> {
        const response = await apiClient.post<InvoiceDto>(this.baseUrl, data);
        // @ts-ignore
        return response;
    }

    async markPaid(id: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/mark-paid`);
        // @ts-ignore
        return response.success;
    }

    async updateStatus(id: string, status: InvoiceStatus): Promise<boolean> {
        const response = await apiClient.put(`${this.baseUrl}/${id}/status`, { status });
        // @ts-ignore
        return response.success;
    }

    async cancel(id: string, reason: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/cancel`, { reason });
        // @ts-ignore
        return response.success;
    }

    async getOverdue(): Promise<InvoiceDto[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/overdue`) as any;
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.items)) return response.items;
        return [];
    }

    async sendReminder(id: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/send-reminder`);
        // @ts-ignore
        return response.success;
    }
}

export const invoiceService = new InvoiceService();
