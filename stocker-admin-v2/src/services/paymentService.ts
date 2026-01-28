import { apiClient } from './apiClient';

export interface PaymentDto {
    id: string;
    invoiceId: string;
    tenantId: string;
    tenantName: string;
    amount: number;
    currency: string;
    status: string; // "Beklemede" | "Basarili" | "Basarisiz" | "IadeEdildi"
    paymentMethod: string;
    transactionId?: string;
    processedAt?: string;
    createdAt: string;
}

export interface PaymentResultDto {
    paymentId: string;
    transactionId: string;
    status: string;
    message: string;
}

export interface RefundResultDto {
    refundId: string;
    amount: number;
    status: string;
}

export interface ProcessPaymentCommand {
    invoiceId: string;
    amount: number;
    paymentMethod: string;
    cardToken?: string;
}

export interface RefundPaymentCommand {
    refundAmount?: number;
    reason: string;
}

export interface CancelPaymentCommand {
    reason: string;
}

class PaymentService {
    private readonly baseUrl = '/api/master/payments';

    async getAll(params?: { status?: string; fromDate?: string; toDate?: string; pageNumber?: number; pageSize?: number }): Promise<PaymentDto[]> {
        const response = await apiClient.get<PaymentDto[]>(this.baseUrl, { params });
        // @ts-ignore
        const data = response.data || response;
        if (Array.isArray(data)) return data;
        // @ts-ignore
        if (data.items && Array.isArray(data.items)) return data.items;
        return [];
    }

    async getById(id: string): Promise<PaymentDto> {
        return await apiClient.get<PaymentDto>(`${this.baseUrl}/${id}`) as any;
    }

    async getByTenant(tenantId: string, status?: string): Promise<PaymentDto[]> {
        return await apiClient.get<PaymentDto[]>(`${this.baseUrl}/tenant/${tenantId}`, { params: { status } }) as any;
    }

    async process(data: ProcessPaymentCommand): Promise<PaymentResultDto> {
        return await apiClient.post<PaymentResultDto>(`${this.baseUrl}/process`, data) as any;
    }

    async refund(id: string, data: RefundPaymentCommand): Promise<RefundResultDto> {
        return await apiClient.post<RefundResultDto>(`${this.baseUrl}/${id}/refund`, data) as any;
    }

    async cancel(id: string, reason: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/cancel`, { reason });
        // @ts-ignore
        return response.success ?? true;
    }

    async getFailed(fromDate?: string): Promise<PaymentDto[]> {
        return await apiClient.get<PaymentDto[]>(`${this.baseUrl}/failed`, { params: { fromDate } }) as any;
    }

    async retry(id: string): Promise<PaymentResultDto> {
        return await apiClient.post<PaymentResultDto>(`${this.baseUrl}/${id}/retry`) as any;
    }
}

export const paymentService = new PaymentService();
