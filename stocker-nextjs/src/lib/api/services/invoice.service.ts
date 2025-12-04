import { ApiService } from '../api-service';

// =====================================
// TYPES - Based on Backend API
// =====================================

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  lineNumber: number;
  salesOrderItemId: string | null;
  productId: string | null;
  productCode: string;
  productName: string;
  description: string | null;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  lineTotalWithVat: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  salesOrderId: string | null;
  customerId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerTaxNumber: string | null;
  customerAddress: string | null;
  status: InvoiceStatus;
  type: InvoiceType;
  currency: string;
  subTotal: number;
  discountAmount: number;
  discountRate: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  notes: string | null;
  paymentTerms: string | null;
  isEInvoice: boolean;
  eInvoiceId: string | null;
  eInvoiceStatus: string | null;
  eInvoiceSentAt: string | null;
  sentAt: string | null;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerId: string | null;
  customerName: string;
  status: InvoiceStatus;
  type: InvoiceType;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  currency: string;
  itemCount: number;
  isEInvoice: boolean;
}

export type InvoiceStatus =
  | 'Draft'
  | 'Issued'
  | 'Sent'
  | 'PartiallyPaid'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled';

export type InvoiceType =
  | 'Sales'
  | 'Return'
  | 'Credit'
  | 'Debit';

export interface InvoiceStatistics {
  totalInvoices: number;
  draftInvoices: number;
  issuedInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  totalOutstanding: number;
  averageInvoiceValue: number;
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

export interface GetInvoicesParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: string;
  type?: string;
  customerId?: string;
  salesOrderId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface CreateInvoiceCommand {
  invoiceDate: string;
  dueDate: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerTaxNumber?: string;
  customerAddress?: string;
  type?: InvoiceType;
  currency?: string;
  notes?: string;
  paymentTerms?: string;
  discountRate?: number;
  discountAmount?: number;
  isEInvoice?: boolean;
  items: CreateInvoiceItemCommand[];
}

export interface CreateInvoiceFromOrderCommand {
  salesOrderId: string;
  invoiceDate?: string;
  dueDate?: string;
  notes?: string;
  paymentTerms?: string;
}

export interface CreateInvoiceItemCommand {
  salesOrderItemId?: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  description?: string;
  discountRate?: number;
}

export interface UpdateInvoiceCommand {
  id: string;
  invoiceDate?: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerTaxNumber?: string;
  customerAddress?: string;
  dueDate?: string;
  type?: InvoiceType;
  currency?: string;
  notes?: string;
  paymentTerms?: string;
  discountAmount?: number;
  discountRate?: number;
  isEInvoice?: boolean;
  items?: CreateInvoiceItemCommand[];
}

export interface AddInvoiceItemCommand {
  invoiceId: string;
  salesOrderItemId?: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  description?: string;
  discountRate?: number;
}

export interface RecordPaymentCommand {
  id: string;
  amount: number;
  paymentDate?: string;
  paymentMethod?: string;
  reference?: string;
}

export interface SetEInvoiceCommand {
  id: string;
  eInvoiceId: string;
  eInvoiceStatus?: string;
}

// =====================================
// SERVICE CLASS
// =====================================

const BASE_URL = '/api/sales/invoices';

export class InvoiceService {
  // =====================================
  // INVOICES
  // =====================================

  /**
   * Get all invoices with pagination and filtering
   */
  static async getInvoices(params?: GetInvoicesParams): Promise<PagedResult<InvoiceListItem>> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
      if (params.status) queryParams.append('status', params.status);
      if (params.type) queryParams.append('type', params.type);
      if (params.customerId) queryParams.append('customerId', params.customerId);
      if (params.salesOrderId) queryParams.append('salesOrderId', params.salesOrderId);
      if (params.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params.toDate) queryParams.append('toDate', params.toDate);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDescending !== undefined) queryParams.append('sortDescending', params.sortDescending.toString());
    }

    const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
    return ApiService.get<PagedResult<InvoiceListItem>>(url);
  }

  /**
   * Get a single invoice by ID
   */
  static async getInvoiceById(id: string): Promise<Invoice> {
    return ApiService.get<Invoice>(`${BASE_URL}/${id}`);
  }

  /**
   * Get a single invoice by number
   */
  static async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice> {
    return ApiService.get<Invoice>(`${BASE_URL}/by-number/${invoiceNumber}`);
  }

  /**
   * Get invoice statistics
   */
  static async getStatistics(fromDate?: string, toDate?: string): Promise<InvoiceStatistics> {
    const queryParams = new URLSearchParams();
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);

    const url = queryParams.toString()
      ? `${BASE_URL}/statistics?${queryParams}`
      : `${BASE_URL}/statistics`;
    return ApiService.get<InvoiceStatistics>(url);
  }

  /**
   * Create a new invoice
   */
  static async createInvoice(data: CreateInvoiceCommand): Promise<Invoice> {
    return ApiService.post<Invoice>(BASE_URL, data);
  }

  /**
   * Create an invoice from a sales order
   */
  static async createInvoiceFromOrder(data: CreateInvoiceFromOrderCommand): Promise<Invoice> {
    return ApiService.post<Invoice>(`${BASE_URL}/from-order`, data);
  }

  /**
   * Update an existing invoice
   */
  static async updateInvoice(id: string, data: UpdateInvoiceCommand): Promise<Invoice> {
    return ApiService.put<Invoice>(`${BASE_URL}/${id}`, { ...data, id });
  }

  /**
   * Add an item to an invoice
   */
  static async addItem(invoiceId: string, data: Omit<AddInvoiceItemCommand, 'invoiceId'>): Promise<Invoice> {
    return ApiService.post<Invoice>(`${BASE_URL}/${invoiceId}/items`, { ...data, invoiceId });
  }

  /**
   * Remove an item from an invoice
   */
  static async removeItem(invoiceId: string, itemId: string): Promise<Invoice> {
    return ApiService.delete<Invoice>(`${BASE_URL}/${invoiceId}/items/${itemId}`);
  }

  /**
   * Issue an invoice
   */
  static async issueInvoice(id: string): Promise<Invoice> {
    return ApiService.post<Invoice>(`${BASE_URL}/${id}/issue`);
  }

  /**
   * Send an invoice
   */
  static async sendInvoice(id: string): Promise<Invoice> {
    return ApiService.post<Invoice>(`${BASE_URL}/${id}/send`);
  }

  /**
   * Record a payment for an invoice
   */
  static async recordPayment(id: string, data: Omit<RecordPaymentCommand, 'id'>): Promise<Invoice> {
    return ApiService.post<Invoice>(`${BASE_URL}/${id}/payment`, { ...data, id });
  }

  /**
   * Set e-invoice information
   */
  static async setEInvoice(id: string, data: Omit<SetEInvoiceCommand, 'id'>): Promise<Invoice> {
    return ApiService.post<Invoice>(`${BASE_URL}/${id}/e-invoice`, { ...data, id });
  }

  /**
   * Cancel an invoice
   */
  static async cancelInvoice(id: string): Promise<Invoice> {
    return ApiService.post<Invoice>(`${BASE_URL}/${id}/cancel`);
  }

  /**
   * Delete an invoice
   */
  static async deleteInvoice(id: string): Promise<void> {
    return ApiService.delete<void>(`${BASE_URL}/${id}`);
  }
}

export default InvoiceService;
