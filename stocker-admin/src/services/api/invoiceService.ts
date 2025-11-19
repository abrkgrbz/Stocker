import { apiClient } from './apiClient';

// Invoice DTOs matching backend
export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  subscriptionId?: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  paymentDate?: string;
  paymentMethod?: string;
  itemCount: number;
}

export interface InvoiceDetailDto extends InvoiceDto {
  tenantEmail: string;
  subscriptionNumber?: string;
  packageName?: string;
  balanceDue: number;
  notes?: string;
  items: InvoiceItemDto[];
  payments: PaymentDto[];
}

export interface InvoiceItemDto {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PaymentDto {
  id: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  status: PaymentStatus;
}

export enum InvoiceStatus {
  Taslak = 0,
  Gonderildi = 1,
  Odendi = 2,
  KismenOdendi = 3,
  Gecikti = 4,
  Iptal = 5
}

export enum PaymentStatus {
  Beklemede = 0,
  Tamamlandi = 1,
  Basarisiz = 2,
  Iade = 3
}

export interface InvoicesListResponse {
  data: InvoiceDto[];
  totalCount: number;
  summary: InvoiceSummary;
}

export interface InvoiceSummary {
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
}

export interface GetInvoicesListQuery {
  tenantId?: string;
  status?: InvoiceStatus;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateInvoiceCommand {
  tenantId: string;
  subscriptionId?: string;
  invoiceDate: string;
  dueDate: string;
  notes?: string;
  items: InvoiceItemDto[];
}

export interface MarkAsPaidCommand {
  paymentDate: string;
  paymentMethod: string;
  transactionId?: string;
  amount: number;
}

export interface UpdateInvoiceStatusCommand {
  newStatus: InvoiceStatus;
}

export interface CancelInvoiceCommand {
  reason: string;
}

class InvoiceService {
  private readonly basePath = '/api/master/invoices';

  /**
   * Get all invoices with filtering
   */
  async getAll(query?: GetInvoicesListQuery): Promise<InvoicesListResponse> {
    try {
      const params = new URLSearchParams();

      if (query) {
        if (query.tenantId) params.append('tenantId', query.tenantId);
        if (query.status !== undefined) params.append('status', query.status.toString());
        if (query.fromDate) params.append('fromDate', query.fromDate);
        if (query.toDate) params.append('toDate', query.toDate);
        if (query.pageNumber) params.append('pageNumber', query.pageNumber.toString());
        if (query.pageSize) params.append('pageSize', query.pageSize.toString());
      }

      const queryString = params.toString();
      const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

      return await apiClient.get<InvoicesListResponse>(url);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      throw error;
    }
  }

  /**
   * Get invoice by ID
   */
  async getById(id: string): Promise<InvoiceDetailDto | null> {
    try {
      return await apiClient.get<InvoiceDetailDto>(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch invoice ${id}:`, error);
      return null;
    }
  }

  /**
   * Get all invoices for a specific tenant
   */
  async getByTenant(tenantId: string, status?: string): Promise<InvoiceDto[]> {
    try {
      const params = status ? `?status=${status}` : '';
      return await apiClient.get<InvoiceDto[]>(`${this.basePath}/tenant/${tenantId}${params}`);
    } catch (error) {
      console.error(`Failed to fetch invoices for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new invoice
   */
  async create(command: CreateInvoiceCommand): Promise<InvoiceDto> {
    try {
      return await apiClient.post<InvoiceDto>(this.basePath, command);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw error;
    }
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(id: string, command: MarkAsPaidCommand): Promise<boolean> {
    try {
      const response = await apiClient.post<boolean>(`${this.basePath}/${id}/mark-paid`, command);
      return response === true;
    } catch (error) {
      console.error(`Failed to mark invoice ${id} as paid:`, error);
      throw error;
    }
  }

  /**
   * Update invoice status
   */
  async updateStatus(id: string, command: UpdateInvoiceStatusCommand): Promise<boolean> {
    try {
      const response = await apiClient.put<boolean>(`${this.basePath}/${id}/status`, command);
      return response === true;
    } catch (error) {
      console.error(`Failed to update invoice ${id} status:`, error);
      throw error;
    }
  }

  /**
   * Cancel an invoice
   */
  async cancel(id: string, command: CancelInvoiceCommand): Promise<boolean> {
    try {
      const response = await apiClient.post<boolean>(`${this.basePath}/${id}/cancel`, command);
      return response === true;
    } catch (error) {
      console.error(`Failed to cancel invoice ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get overdue invoices
   */
  async getOverdue(): Promise<InvoicesListResponse> {
    try {
      return await apiClient.get<InvoicesListResponse>(`${this.basePath}/overdue`);
    } catch (error) {
      console.error('Failed to fetch overdue invoices:', error);
      throw error;
    }
  }

  /**
   * Send payment reminder
   */
  async sendReminder(id: string): Promise<boolean> {
    try {
      const response = await apiClient.post<boolean>(`${this.basePath}/${id}/send-reminder`, {});
      return response === true;
    } catch (error) {
      console.error(`Failed to send reminder for invoice ${id}:`, error);
      throw error;
    }
  }

  /**
   * Helper: Get status color for UI
   */
  getStatusColor(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.Taslak:
        return 'default';
      case InvoiceStatus.Gonderildi:
        return 'processing';
      case InvoiceStatus.Odendi:
        return 'success';
      case InvoiceStatus.KismenOdendi:
        return 'warning';
      case InvoiceStatus.Gecikti:
        return 'error';
      case InvoiceStatus.Iptal:
        return 'default';
      default:
        return 'default';
    }
  }

  /**
   * Helper: Get status display text
   */
  getStatusText(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.Taslak:
        return 'Taslak';
      case InvoiceStatus.Gonderildi:
        return 'Gönderildi';
      case InvoiceStatus.Odendi:
        return 'Ödendi';
      case InvoiceStatus.KismenOdendi:
        return 'Kısmen Ödendi';
      case InvoiceStatus.Gecikti:
        return 'Gecikti';
      case InvoiceStatus.Iptal:
        return 'İptal';
      default:
        return 'Bilinmiyor';
    }
  }

  /**
   * Helper: Get payment status color
   */
  getPaymentStatusColor(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Beklemede:
        return 'processing';
      case PaymentStatus.Tamamlandi:
        return 'success';
      case PaymentStatus.Basarisiz:
        return 'error';
      case PaymentStatus.Iade:
        return 'warning';
      default:
        return 'default';
    }
  }

  /**
   * Helper: Get payment status text
   */
  getPaymentStatusText(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Beklemede:
        return 'Beklemede';
      case PaymentStatus.Tamamlandi:
        return 'Tamamlandı';
      case PaymentStatus.Basarisiz:
        return 'Başarısız';
      case PaymentStatus.Iade:
        return 'İade';
      default:
        return 'Bilinmiyor';
    }
  }
}

// Export singleton instance
export const invoiceService = new InvoiceService();
