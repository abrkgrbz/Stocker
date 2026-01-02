import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { salesService } from '../services/sales.service';
import type {
    OrderListParams,
    InvoiceListParams,
    QuoteListParams,
    CreateOrderRequest,
    UpdateOrderRequest,
    CreateInvoiceRequest,
    UpdateInvoiceRequest,
    CreateQuoteRequest,
    UpdateQuoteRequest,
    CreatePaymentRequest,
    OrderStatus,
    InvoiceStatus,
    QuoteStatus,
} from '../types/sales.types';

// Query Keys
export const salesKeys = {
    all: ['sales'] as const,
    // Orders
    orders: () => [...salesKeys.all, 'orders'] as const,
    orderList: (params?: OrderListParams) => [...salesKeys.orders(), 'list', params] as const,
    orderDetail: (id: string) => [...salesKeys.orders(), 'detail', id] as const,
    recentOrders: () => [...salesKeys.orders(), 'recent'] as const,
    // Invoices
    invoices: () => [...salesKeys.all, 'invoices'] as const,
    invoiceList: (params?: InvoiceListParams) => [...salesKeys.invoices(), 'list', params] as const,
    invoiceDetail: (id: string) => [...salesKeys.invoices(), 'detail', id] as const,
    invoicePayments: (id: string) => [...salesKeys.invoices(), 'payments', id] as const,
    overdueInvoices: () => [...salesKeys.invoices(), 'overdue'] as const,
    // Quotes
    quotes: () => [...salesKeys.all, 'quotes'] as const,
    quoteList: (params?: QuoteListParams) => [...salesKeys.quotes(), 'list', params] as const,
    quoteDetail: (id: string) => [...salesKeys.quotes(), 'detail', id] as const,
    expiringQuotes: () => [...salesKeys.quotes(), 'expiring'] as const,
    // Payments
    payments: () => [...salesKeys.all, 'payments'] as const,
    paymentDetail: (id: string) => [...salesKeys.payments(), 'detail', id] as const,
    recentPayments: () => [...salesKeys.payments(), 'recent'] as const,
    // Dashboard
    stats: () => [...salesKeys.all, 'stats'] as const,
    summary: (params?: any) => [...salesKeys.all, 'summary', params] as const,
    dashboard: () => [...salesKeys.all, 'dashboard'] as const,
    chart: (params?: any) => [...salesKeys.all, 'chart', params] as const,
};

// ============= ORDER HOOKS =============

export function useOrders(params?: OrderListParams) {
    return useQuery({
        queryKey: salesKeys.orderList(params),
        queryFn: () => salesService.getOrders(params),
    });
}

export function useInfiniteOrders(params?: Omit<OrderListParams, 'page'>) {
    return useInfiniteQuery({
        queryKey: [...salesKeys.orders(), 'infinite', params],
        queryFn: ({ pageParam = 1 }) => salesService.getOrders({ ...params, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
    });
}

export function useOrder(id: string) {
    return useQuery({
        queryKey: salesKeys.orderDetail(id),
        queryFn: () => salesService.getOrder(id),
        enabled: !!id,
    });
}

export function useRecentOrders(limit?: number) {
    return useQuery({
        queryKey: [...salesKeys.recentOrders(), limit],
        queryFn: () => salesService.getRecentOrders(limit),
    });
}

export function useSearchOrders(query: string) {
    return useQuery({
        queryKey: [...salesKeys.orders(), 'search', query],
        queryFn: () => salesService.searchOrders(query),
        enabled: query.length >= 2,
    });
}

export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrderRequest) => salesService.createOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: salesKeys.orders() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

export function useUpdateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateOrderRequest }) =>
            salesService.updateOrder(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: salesKeys.orderDetail(id) });
            queryClient.invalidateQueries({ queryKey: salesKeys.orders() });
        },
    });
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
            salesService.updateOrderStatus(id, status),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: salesKeys.orderDetail(id) });
            queryClient.invalidateQueries({ queryKey: salesKeys.orders() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

export function useConfirmOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => salesService.confirmOrder(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: salesKeys.orderDetail(id) });
            queryClient.invalidateQueries({ queryKey: salesKeys.orders() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

export function useCancelOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            salesService.cancelOrder(id, reason),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: salesKeys.orderDetail(id) });
            queryClient.invalidateQueries({ queryKey: salesKeys.orders() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

export function useDeleteOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => salesService.deleteOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: salesKeys.orders() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

export function useConvertOrderToInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderId: string) => salesService.convertOrderToInvoice(orderId),
        onSuccess: (_, orderId) => {
            queryClient.invalidateQueries({ queryKey: salesKeys.orderDetail(orderId) });
            queryClient.invalidateQueries({ queryKey: salesKeys.orders() });
            queryClient.invalidateQueries({ queryKey: salesKeys.invoices() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

// ============= INVOICE HOOKS =============

export function useInvoices(params?: InvoiceListParams) {
    return useQuery({
        queryKey: salesKeys.invoiceList(params),
        queryFn: () => salesService.getInvoices(params),
    });
}

export function useInfiniteInvoices(params?: Omit<InvoiceListParams, 'page'>) {
    return useInfiniteQuery({
        queryKey: [...salesKeys.invoices(), 'infinite', params],
        queryFn: ({ pageParam = 1 }) => salesService.getInvoices({ ...params, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
    });
}

export function useInvoice(id: string) {
    return useQuery({
        queryKey: salesKeys.invoiceDetail(id),
        queryFn: () => salesService.getInvoice(id),
        enabled: !!id,
    });
}

export function useInvoicePayments(invoiceId: string) {
    return useQuery({
        queryKey: salesKeys.invoicePayments(invoiceId),
        queryFn: () => salesService.getInvoicePayments(invoiceId),
        enabled: !!invoiceId,
    });
}

export function useOverdueInvoices() {
    return useQuery({
        queryKey: salesKeys.overdueInvoices(),
        queryFn: () => salesService.getOverdueInvoices(),
    });
}

export function useSearchInvoices(query: string) {
    return useQuery({
        queryKey: [...salesKeys.invoices(), 'search', query],
        queryFn: () => salesService.searchInvoices(query),
        enabled: query.length >= 2,
    });
}

export function useCreateInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateInvoiceRequest) => salesService.createInvoice(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: salesKeys.invoices() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

export function useUpdateInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceRequest }) =>
            salesService.updateInvoice(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: salesKeys.invoiceDetail(id) });
            queryClient.invalidateQueries({ queryKey: salesKeys.invoices() });
        },
    });
}

export function useSendInvoice() {
    return useMutation({
        mutationFn: ({ id, email }: { id: string; email?: string }) =>
            salesService.sendInvoice(id, email),
    });
}

export function useMarkInvoiceAsPaid() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => salesService.markInvoiceAsPaid(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: salesKeys.invoiceDetail(id) });
            queryClient.invalidateQueries({ queryKey: salesKeys.invoices() });
            queryClient.invalidateQueries({ queryKey: salesKeys.overdueInvoices() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

export function useCancelInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            salesService.cancelInvoice(id, reason),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: salesKeys.invoiceDetail(id) });
            queryClient.invalidateQueries({ queryKey: salesKeys.invoices() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

export function useDeleteInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => salesService.deleteInvoice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: salesKeys.invoices() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

// ============= QUOTE HOOKS =============

export function useQuotes(params?: QuoteListParams) {
    return useQuery({
        queryKey: salesKeys.quoteList(params),
        queryFn: () => salesService.getQuotes(params),
    });
}

export function useInfiniteQuotes(params?: Omit<QuoteListParams, 'page'>) {
    return useInfiniteQuery({
        queryKey: [...salesKeys.quotes(), 'infinite', params],
        queryFn: ({ pageParam = 1 }) => salesService.getQuotes({ ...params, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
    });
}

export function useQuote(id: string) {
    return useQuery({
        queryKey: salesKeys.quoteDetail(id),
        queryFn: () => salesService.getQuote(id),
        enabled: !!id,
    });
}

export function useExpiringQuotes(days?: number) {
    return useQuery({
        queryKey: [...salesKeys.expiringQuotes(), days],
        queryFn: () => salesService.getExpiringQuotes(days),
    });
}

export function useCreateQuote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateQuoteRequest) => salesService.createQuote(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: salesKeys.quotes() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

export function useUpdateQuote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateQuoteRequest }) =>
            salesService.updateQuote(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: salesKeys.quoteDetail(id) });
            queryClient.invalidateQueries({ queryKey: salesKeys.quotes() });
        },
    });
}

export function useSendQuote() {
    return useMutation({
        mutationFn: ({ id, email }: { id: string; email?: string }) =>
            salesService.sendQuote(id, email),
    });
}

export function useAcceptQuote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => salesService.acceptQuote(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: salesKeys.quoteDetail(id) });
            queryClient.invalidateQueries({ queryKey: salesKeys.quotes() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

export function useRejectQuote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            salesService.rejectQuote(id, reason),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: salesKeys.quoteDetail(id) });
            queryClient.invalidateQueries({ queryKey: salesKeys.quotes() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

export function useConvertQuoteToOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (quoteId: string) => salesService.convertQuoteToOrder(quoteId),
        onSuccess: (_, quoteId) => {
            queryClient.invalidateQueries({ queryKey: salesKeys.quoteDetail(quoteId) });
            queryClient.invalidateQueries({ queryKey: salesKeys.quotes() });
            queryClient.invalidateQueries({ queryKey: salesKeys.orders() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

export function useDeleteQuote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => salesService.deleteQuote(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: salesKeys.quotes() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

// ============= PAYMENT HOOKS =============

export function useCreatePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePaymentRequest) => salesService.createPayment(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: salesKeys.payments() });
            queryClient.invalidateQueries({ queryKey: salesKeys.invoiceDetail(variables.invoiceId) });
            queryClient.invalidateQueries({ queryKey: salesKeys.invoicePayments(variables.invoiceId) });
            queryClient.invalidateQueries({ queryKey: salesKeys.invoices() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

export function usePayment(id: string) {
    return useQuery({
        queryKey: salesKeys.paymentDetail(id),
        queryFn: () => salesService.getPayment(id),
        enabled: !!id,
    });
}

export function useRecentPayments(limit?: number) {
    return useQuery({
        queryKey: [...salesKeys.recentPayments(), limit],
        queryFn: () => salesService.getRecentPayments(limit),
    });
}

export function useDeletePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => salesService.deletePayment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: salesKeys.payments() });
            queryClient.invalidateQueries({ queryKey: salesKeys.invoices() });
            queryClient.invalidateQueries({ queryKey: salesKeys.stats() });
        },
    });
}

// ============= DASHBOARD / STATS HOOKS =============

export function useSalesStats() {
    return useQuery({
        queryKey: salesKeys.stats(),
        queryFn: () => salesService.getSalesStats(),
    });
}

export function useSalesSummary(params?: {
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate?: string;
    endDate?: string;
}) {
    return useQuery({
        queryKey: salesKeys.summary(params),
        queryFn: () => salesService.getSalesSummary(params),
    });
}

export function useSalesDashboard() {
    return useQuery({
        queryKey: salesKeys.dashboard(),
        queryFn: () => salesService.getDashboardData(),
    });
}

export function useSalesChart(params?: {
    period?: 'daily' | 'weekly' | 'monthly';
    startDate?: string;
    endDate?: string;
}) {
    return useQuery({
        queryKey: salesKeys.chart(params),
        queryFn: () => salesService.getSalesChart(params),
    });
}
