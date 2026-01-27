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
    invoiceDate: string;
    totalAmount: number;
    status: InvoiceStatus;
    currency: string;
}

class InvoiceService {
    private readonly basePath = '/api/master/invoices';

    async getAll(): Promise<InvoiceDto[]> {
        return apiClient.get('/api/master/invoices');
    }

    async sendReminder(id: string): Promise<boolean> {
        return apiClient.post(`/api/master/invoices/${id}/send-reminder`);
    }
}

export const invoiceService = new InvoiceService();
