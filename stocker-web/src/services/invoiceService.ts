import api from './api';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName?: string;
  invoiceDate: string;
  dueDate: string;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  notes?: string;
  terms?: string;
  paidDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  currency: string;
}

export interface CreateInvoiceDto {
  invoiceNumber: string;
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  notes?: string;
  terms?: string;
  items: CreateInvoiceItemDto[];
}

export interface CreateInvoiceItemDto {
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  taxRate?: number;
}

export interface InvoiceFilters {
  status?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

class InvoiceService {
  private baseUrl = '/tenant/invoices';

  async getInvoices(filters?: InvoiceFilters): Promise<Invoice[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getInvoice(id: string): Promise<Invoice> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async sendInvoice(id: string): Promise<void> {
    await api.post(`${this.baseUrl}/${id}/send`);
  }

  async markAsPaid(id: string, data: {
    paymentDate: string;
    paymentMethod: string;
    paymentReference?: string;
  }): Promise<void> {
    await api.post(`${this.baseUrl}/${id}/mark-paid`, data);
  }

  async cancelInvoice(id: string, reason: string): Promise<void> {
    await api.post(`${this.baseUrl}/${id}/cancel`, { reason });
  }

  async updateInvoice(id: string, data: {
    notes?: string;
    terms?: string;
    dueDate?: string;
  }): Promise<Invoice> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteInvoice(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Helper methods for UI
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      Draft: 'default',
      Sent: 'processing',
      Paid: 'success',
      Overdue: 'error',
      Cancelled: 'warning'
    };
    return colors[status] || 'default';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      Draft: 'edit',
      Sent: 'send',
      Paid: 'check-circle',
      Overdue: 'warning',
      Cancelled: 'close-circle'
    };
    return icons[status] || 'info-circle';
  }

  formatCurrency(amount: number, currency: string = 'TRY'): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  calculateDaysOverdue(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = today.getTime() - due.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

export default new InvoiceService();