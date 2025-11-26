import { ApiService } from '../api-service';

// =====================================
// TYPES - Based on Backend API
// =====================================

export interface Payment {
  id: string;
  tenantId: string;
  paymentNumber: string;
  paymentDate: string;
  invoiceId: string | null;
  invoiceNumber: string | null;
  customerId: string | null;
  customerName: string;
  status: PaymentStatus;
  method: PaymentMethod;
  currency: string;
  amount: number;
  reference: string | null;
  description: string | null;
  bankAccountId: string | null;
  bankAccountName: string | null;
  transactionId: string | null;
  confirmedBy: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  rejectedReason: string | null;
  rejectedAt: string | null;
  refundedAmount: number;
  refundedAt: string | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentListItem {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  invoiceNumber: string | null;
  customerName: string;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  currency: string;
  reference: string | null;
}

export type PaymentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Rejected'
  | 'Refunded';

export type PaymentMethod =
  | 'Cash'
  | 'BankTransfer'
  | 'CreditCard'
  | 'DebitCard'
  | 'Check'
  | 'DirectDebit'
  | 'Other';

export interface PaymentStatistics {
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  rejectedPayments: number;
  refundedPayments: number;
  totalAmount: number;
  totalRefunded: number;
  averagePaymentValue: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =====================================
// REQUEST TYPES
// =====================================

export interface GetPaymentsParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: string;
  method?: string;
  customerId?: string;
  invoiceId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface CreatePaymentCommand {
  paymentDate: string;
  invoiceId?: string;
  customerId?: string;
  customerName: string;
  method: PaymentMethod;
  currency?: string;
  amount: number;
  reference?: string;
  description?: string;
  bankAccountId?: string;
  bankAccountName?: string;
  transactionId?: string;
}

export interface UpdatePaymentCommand {
  id: string;
  customerId?: string;
  customerName: string;
  paymentDate?: string;
  method?: PaymentMethod;
  reference?: string;
  description?: string;
  bankAccountId?: string;
  bankAccountName?: string;
  transactionId?: string;
}

export interface RefundPaymentCommand {
  id: string;
  amount: number;
  reason: string;
}

export interface RejectPaymentCommand {
  id: string;
  reason: string;
}

// =====================================
// SERVICE CLASS
// =====================================

const BASE_URL = '/api/sales/payments';

export class PaymentService {
  // =====================================
  // PAYMENTS
  // =====================================

  /**
   * Get all payments with pagination and filtering
   */
  static async getPayments(params?: GetPaymentsParams): Promise<PagedResult<PaymentListItem>> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
      if (params.status) queryParams.append('status', params.status);
      if (params.method) queryParams.append('method', params.method);
      if (params.customerId) queryParams.append('customerId', params.customerId);
      if (params.invoiceId) queryParams.append('invoiceId', params.invoiceId);
      if (params.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params.toDate) queryParams.append('toDate', params.toDate);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDescending !== undefined) queryParams.append('sortDescending', params.sortDescending.toString());
    }

    const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
    return ApiService.get<PagedResult<PaymentListItem>>(url);
  }

  /**
   * Get a single payment by ID
   */
  static async getPaymentById(id: string): Promise<Payment> {
    return ApiService.get<Payment>(`${BASE_URL}/${id}`);
  }

  /**
   * Get a single payment by number
   */
  static async getPaymentByNumber(paymentNumber: string): Promise<Payment> {
    return ApiService.get<Payment>(`${BASE_URL}/by-number/${paymentNumber}`);
  }

  /**
   * Get payments by invoice ID
   */
  static async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    return ApiService.get<Payment[]>(`${BASE_URL}/by-invoice/${invoiceId}`);
  }

  /**
   * Get payment statistics
   */
  static async getStatistics(fromDate?: string, toDate?: string): Promise<PaymentStatistics> {
    const queryParams = new URLSearchParams();
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);

    const url = queryParams.toString()
      ? `${BASE_URL}/statistics?${queryParams}`
      : `${BASE_URL}/statistics`;
    return ApiService.get<PaymentStatistics>(url);
  }

  /**
   * Create a new payment
   */
  static async createPayment(data: CreatePaymentCommand): Promise<Payment> {
    return ApiService.post<Payment>(BASE_URL, data);
  }

  /**
   * Update an existing payment
   */
  static async updatePayment(id: string, data: UpdatePaymentCommand): Promise<Payment> {
    return ApiService.put<Payment>(`${BASE_URL}/${id}`, { ...data, id });
  }

  /**
   * Confirm a payment
   */
  static async confirmPayment(id: string): Promise<Payment> {
    return ApiService.post<Payment>(`${BASE_URL}/${id}/confirm`);
  }

  /**
   * Complete a payment
   */
  static async completePayment(id: string): Promise<Payment> {
    return ApiService.post<Payment>(`${BASE_URL}/${id}/complete`);
  }

  /**
   * Reject a payment
   */
  static async rejectPayment(id: string, reason: string): Promise<Payment> {
    return ApiService.post<Payment>(`${BASE_URL}/${id}/reject`, { id, reason });
  }

  /**
   * Refund a payment
   */
  static async refundPayment(id: string, amount: number, reason: string): Promise<Payment> {
    return ApiService.post<Payment>(`${BASE_URL}/${id}/refund`, { id, amount, reason });
  }

  /**
   * Delete a payment
   */
  static async deletePayment(id: string): Promise<void> {
    return ApiService.delete<void>(`${BASE_URL}/${id}`);
  }
}

export default PaymentService;
