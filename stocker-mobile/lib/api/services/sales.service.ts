import api from '@/lib/axios';
import type {
    Order,
    OrderListParams,
    OrderListResponse,
    Invoice,
    InvoiceListParams,
    InvoiceListResponse,
    Quote,
    QuoteListParams,
    QuoteListResponse,
    Payment,
    SalesStats,
    SalesSummary,
    CreateOrderRequest,
    UpdateOrderRequest,
    CreateInvoiceRequest,
    UpdateInvoiceRequest,
    CreateQuoteRequest,
    UpdateQuoteRequest,
    CreatePaymentRequest,
} from '../types/sales.types';

class SalesService {
    private readonly baseUrl = '/sales';

    // ============= ORDERS =============

    async getOrders(params?: OrderListParams): Promise<OrderListResponse> {
        const response = await api.get<OrderListResponse>(`${this.baseUrl}/orders`, { params });
        return response.data;
    }

    async getOrder(id: string): Promise<Order> {
        const response = await api.get<Order>(`${this.baseUrl}/orders/${id}`);
        return response.data;
    }

    async createOrder(data: CreateOrderRequest): Promise<Order> {
        const response = await api.post<Order>(`${this.baseUrl}/orders`, data);
        return response.data;
    }

    async updateOrder(id: string, data: UpdateOrderRequest): Promise<Order> {
        const response = await api.put<Order>(`${this.baseUrl}/orders/${id}`, data);
        return response.data;
    }

    async updateOrderStatus(id: string, status: string): Promise<Order> {
        const response = await api.patch<Order>(`${this.baseUrl}/orders/${id}/status`, { status });
        return response.data;
    }

    async deleteOrder(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/orders/${id}`);
    }

    async confirmOrder(id: string): Promise<Order> {
        const response = await api.post<Order>(`${this.baseUrl}/orders/${id}/confirm`);
        return response.data;
    }

    async cancelOrder(id: string, reason?: string): Promise<Order> {
        const response = await api.post<Order>(`${this.baseUrl}/orders/${id}/cancel`, { reason });
        return response.data;
    }

    async convertOrderToInvoice(orderId: string): Promise<Invoice> {
        const response = await api.post<Invoice>(`${this.baseUrl}/orders/${orderId}/convert-to-invoice`);
        return response.data;
    }

    async searchOrders(query: string): Promise<Order[]> {
        const response = await api.get<Order[]>(`${this.baseUrl}/orders/search`, {
            params: { q: query }
        });
        return response.data;
    }

    async getRecentOrders(limit?: number): Promise<Order[]> {
        const response = await api.get<Order[]>(`${this.baseUrl}/orders/recent`, {
            params: { limit: limit || 10 }
        });
        return response.data;
    }

    // ============= INVOICES =============

    async getInvoices(params?: InvoiceListParams): Promise<InvoiceListResponse> {
        const response = await api.get<InvoiceListResponse>(`${this.baseUrl}/invoices`, { params });
        return response.data;
    }

    async getInvoice(id: string): Promise<Invoice> {
        const response = await api.get<Invoice>(`${this.baseUrl}/invoices/${id}`);
        return response.data;
    }

    async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
        const response = await api.post<Invoice>(`${this.baseUrl}/invoices`, data);
        return response.data;
    }

    async updateInvoice(id: string, data: UpdateInvoiceRequest): Promise<Invoice> {
        const response = await api.put<Invoice>(`${this.baseUrl}/invoices/${id}`, data);
        return response.data;
    }

    async deleteInvoice(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/invoices/${id}`);
    }

    async sendInvoice(id: string, email?: string): Promise<void> {
        await api.post(`${this.baseUrl}/invoices/${id}/send`, { email });
    }

    async markInvoiceAsPaid(id: string): Promise<Invoice> {
        const response = await api.post<Invoice>(`${this.baseUrl}/invoices/${id}/mark-paid`);
        return response.data;
    }

    async cancelInvoice(id: string, reason?: string): Promise<Invoice> {
        const response = await api.post<Invoice>(`${this.baseUrl}/invoices/${id}/cancel`, { reason });
        return response.data;
    }

    async getInvoicePayments(invoiceId: string): Promise<Payment[]> {
        const response = await api.get<Payment[]>(`${this.baseUrl}/invoices/${invoiceId}/payments`);
        return response.data;
    }

    async getOverdueInvoices(): Promise<Invoice[]> {
        const response = await api.get<Invoice[]>(`${this.baseUrl}/invoices/overdue`);
        return response.data;
    }

    async searchInvoices(query: string): Promise<Invoice[]> {
        const response = await api.get<Invoice[]>(`${this.baseUrl}/invoices/search`, {
            params: { q: query }
        });
        return response.data;
    }

    // ============= QUOTES =============

    async getQuotes(params?: QuoteListParams): Promise<QuoteListResponse> {
        const response = await api.get<QuoteListResponse>(`${this.baseUrl}/quotes`, { params });
        return response.data;
    }

    async getQuote(id: string): Promise<Quote> {
        const response = await api.get<Quote>(`${this.baseUrl}/quotes/${id}`);
        return response.data;
    }

    async createQuote(data: CreateQuoteRequest): Promise<Quote> {
        const response = await api.post<Quote>(`${this.baseUrl}/quotes`, data);
        return response.data;
    }

    async updateQuote(id: string, data: UpdateQuoteRequest): Promise<Quote> {
        const response = await api.put<Quote>(`${this.baseUrl}/quotes/${id}`, data);
        return response.data;
    }

    async deleteQuote(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/quotes/${id}`);
    }

    async sendQuote(id: string, email?: string): Promise<void> {
        await api.post(`${this.baseUrl}/quotes/${id}/send`, { email });
    }

    async acceptQuote(id: string): Promise<Quote> {
        const response = await api.post<Quote>(`${this.baseUrl}/quotes/${id}/accept`);
        return response.data;
    }

    async rejectQuote(id: string, reason?: string): Promise<Quote> {
        const response = await api.post<Quote>(`${this.baseUrl}/quotes/${id}/reject`, { reason });
        return response.data;
    }

    async convertQuoteToOrder(quoteId: string): Promise<Order> {
        const response = await api.post<Order>(`${this.baseUrl}/quotes/${quoteId}/convert-to-order`);
        return response.data;
    }

    async searchQuotes(query: string): Promise<Quote[]> {
        const response = await api.get<Quote[]>(`${this.baseUrl}/quotes/search`, {
            params: { q: query }
        });
        return response.data;
    }

    async getExpiringQuotes(days?: number): Promise<Quote[]> {
        const response = await api.get<Quote[]>(`${this.baseUrl}/quotes/expiring`, {
            params: { days: days || 7 }
        });
        return response.data;
    }

    // ============= PAYMENTS =============

    async createPayment(data: CreatePaymentRequest): Promise<Payment> {
        const response = await api.post<Payment>(`${this.baseUrl}/payments`, data);
        return response.data;
    }

    async getPayment(id: string): Promise<Payment> {
        const response = await api.get<Payment>(`${this.baseUrl}/payments/${id}`);
        return response.data;
    }

    async deletePayment(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/payments/${id}`);
    }

    async getRecentPayments(limit?: number): Promise<Payment[]> {
        const response = await api.get<Payment[]>(`${this.baseUrl}/payments/recent`, {
            params: { limit: limit || 10 }
        });
        return response.data;
    }

    // ============= DASHBOARD / STATS =============

    async getSalesStats(): Promise<SalesStats> {
        const response = await api.get<SalesStats>(`${this.baseUrl}/stats`);
        return response.data;
    }

    async getSalesSummary(params?: {
        period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
        startDate?: string;
        endDate?: string;
    }): Promise<SalesSummary> {
        const response = await api.get<SalesSummary>(`${this.baseUrl}/summary`, { params });
        return response.data;
    }

    async getDashboardData(): Promise<{
        stats: SalesStats;
        recentOrders: Order[];
        overdueInvoices: Invoice[];
        expiringQuotes: Quote[];
    }> {
        const response = await api.get(`${this.baseUrl}/dashboard`);
        return response.data;
    }

    async getSalesChart(params?: {
        period?: 'daily' | 'weekly' | 'monthly';
        startDate?: string;
        endDate?: string;
    }): Promise<{ date: string; amount: number; count: number }[]> {
        const response = await api.get(`${this.baseUrl}/chart`, { params });
        return response.data;
    }
}

export const salesService = new SalesService();
export default salesService;
