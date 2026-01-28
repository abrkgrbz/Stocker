import { apiClient } from './apiClient';

export interface InvoiceDto {
    id: string;
    invoiceNumber: string;
    tenantId: string;
    tenantName: string;
    status: string; // "Taslak" | "Gonderildi" | "Odendi" | "Gecikti" | "IptalEdildi"
    amount: number;
    tax: number;
    totalAmount: number;
    currency: string;
    issueDate: string;
    dueDate: string;
    paidDate?: string;
    createdAt: string;
}

export interface InvoiceLineItemDto {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
}

export interface InvoiceSummary {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
}

export interface InvoicesListResponse {
    invoices: InvoiceDto[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    summary: InvoiceSummary;
}

export interface CreateInvoiceCommand {
    tenantId: string;
    lineItems: {
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
    }[];
    dueDate: string;
    notes?: string;
}

export interface MarkAsPaidCommand {
    paymentDate?: string;
    paymentMethod?: string;
    transactionId?: string;
    notes?: string;
}

export interface CancelInvoiceCommand {
    reason: string;
}

export interface RefundInvoiceRequest {
    refundAmount: number;
    reason: string;
    isFullRefund: boolean;
}

export interface RefundInvoiceResponse {
    creditNoteId: string;
    creditNoteNumber: string;
    refundAmount: number;
    originalInvoiceId: string;
}

export interface BulkSendRemindersRequest {
    invoiceIds?: string[];
    sendToAllOverdue?: boolean;
    daysOverdue?: number;
}

export interface BulkSendRemindersResponse {
    successCount: number;
    failedCount: number;
    results: {
        invoiceId: string;
        success: boolean;
        error?: string;
    }[];
}

class InvoiceService {
    private readonly baseUrl = '/api/master/invoices';

    async getAll(params?: any): Promise<InvoicesListResponse> {
        return await apiClient.get<InvoicesListResponse>(this.baseUrl, { params }) as any;
    }

    async getById(id: string): Promise<InvoiceDto> {
        return await apiClient.get<InvoiceDto>(`${this.baseUrl}/${id}`) as any;
    }

    async getByTenant(tenantId: string, status?: string): Promise<InvoiceDto[]> {
        return await apiClient.get<InvoiceDto[]>(`${this.baseUrl}/tenant/${tenantId}`, { params: { status } }) as any;
    }

    async create(data: CreateInvoiceCommand): Promise<InvoiceDto> {
        return await apiClient.post<InvoiceDto>(this.baseUrl, data) as any;
    }

    async markPaid(id: string, data: MarkAsPaidCommand): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/mark-paid`, data);
        // @ts-ignore
        return response.success ?? true;
    }

    async updateStatus(id: string, newStatus: string, notes?: string): Promise<boolean> {
        const response = await apiClient.put(`${this.baseUrl}/${id}/status`, { newStatus, notes });
        // @ts-ignore
        return response.success ?? true;
    }

    async cancel(id: string, reason: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/cancel`, { reason });
        // @ts-ignore
        return response.success ?? true;
    }

    async getOverdue(): Promise<InvoicesListResponse> {
        return await apiClient.get<InvoicesListResponse>(`${this.baseUrl}/overdue`) as any;
    }

    async sendReminder(id: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/send-reminder`);
        // @ts-ignore
        return response.success ?? true;
    }

    async getLineItems(id: string): Promise<InvoiceLineItemDto[]> {
        return await apiClient.get<InvoiceLineItemDto[]>(`${this.baseUrl}/${id}/line-items`) as any;
    }

    async getPdf(id: string): Promise<Blob> {
        const response = await apiClient.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
        // @ts-ignore
        return response.data || response;
    }

    async refund(id: string, data: RefundInvoiceRequest): Promise<RefundInvoiceResponse> {
        return await apiClient.post<RefundInvoiceResponse>(`${this.baseUrl}/${id}/refund`, data) as any;
    }

    async bulkSendReminders(data: BulkSendRemindersRequest): Promise<BulkSendRemindersResponse> {
        return await apiClient.post<BulkSendRemindersResponse>(`${this.baseUrl}/bulk/send-reminders`, data) as any;
    }
}

export const invoiceService = new InvoiceService();
