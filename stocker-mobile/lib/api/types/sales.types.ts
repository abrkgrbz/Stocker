// Sales Module Types

export interface Order {
    id: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    status: OrderStatus;
    orderDate: string;
    deliveryDate?: string;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
    notes?: string;
    items: OrderItem[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxPercent: number;
    totalPrice: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    orderId?: string;
    customerId: string;
    customerName: string;
    status: InvoiceStatus;
    invoiceDate: string;
    dueDate: string;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    paidAmount: number;
    currency: string;
    notes?: string;
    items: InvoiceItem[];
    createdBy: string;
    createdAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';

export interface InvoiceItem {
    id: string;
    productId: string;
    productName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxPercent: number;
    totalPrice: number;
}

export interface Quote {
    id: string;
    quoteNumber: string;
    customerId: string;
    customerName: string;
    status: QuoteStatus;
    quoteDate: string;
    validUntil: string;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
    notes?: string;
    items: QuoteItem[];
    createdBy: string;
    createdAt: string;
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface QuoteItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxPercent: number;
    totalPrice: number;
}

// List params
export interface OrderListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: OrderStatus;
    customerId?: string;
    startDate?: string;
    endDate?: string;
}

export interface InvoiceListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: InvoiceStatus;
    customerId?: string;
    startDate?: string;
    endDate?: string;
}

// Sales Dashboard Stats
export interface SalesStats {
    todaySales: number;
    weeklySales: number;
    monthlySales: number;
    pendingOrders: number;
    overdueInvoices: number;
    openQuotes: number;
}

// List Responses
export interface OrderListResponse {
    items: Order[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface InvoiceListResponse {
    items: Invoice[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface QuoteListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: QuoteStatus;
    customerId?: string;
    startDate?: string;
    endDate?: string;
}

export interface QuoteListResponse {
    items: Quote[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Create/Update Requests
export interface CreateOrderRequest {
    customerId: string;
    deliveryDate?: string;
    notes?: string;
    items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
    productId: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxPercent?: number;
}

export interface UpdateOrderRequest {
    status?: OrderStatus;
    deliveryDate?: string;
    notes?: string;
    items?: CreateOrderItemRequest[];
}

export interface CreateInvoiceRequest {
    customerId: string;
    orderId?: string;
    dueDate: string;
    notes?: string;
    items: CreateInvoiceItemRequest[];
}

export interface CreateInvoiceItemRequest {
    productId: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxPercent?: number;
}

export interface UpdateInvoiceRequest {
    status?: InvoiceStatus;
    dueDate?: string;
    notes?: string;
}

export interface CreateQuoteRequest {
    customerId: string;
    validUntil: string;
    notes?: string;
    items: CreateQuoteItemRequest[];
}

export interface CreateQuoteItemRequest {
    productId: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxPercent?: number;
}

export interface UpdateQuoteRequest {
    status?: QuoteStatus;
    validUntil?: string;
    notes?: string;
    items?: CreateQuoteItemRequest[];
}

// Payment
export interface Payment {
    id: string;
    paymentNumber: string;
    invoiceId: string;
    invoiceNumber?: string;
    amount: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
    createdBy: string;
    createdAt: string;
}

export type PaymentMethod = 'cash' | 'credit_card' | 'bank_transfer' | 'check' | 'other';

export interface CreatePaymentRequest {
    invoiceId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
}

// Sales Summary
export interface SalesSummary {
    period: string;
    totalSales: number;
    totalOrders: number;
    totalInvoices: number;
    averageOrderValue: number;
    topProducts: { productId: string; productName: string; quantity: number; revenue: number }[];
    topCustomers: { customerId: string; customerName: string; orderCount: number; totalSpent: number }[];
}
