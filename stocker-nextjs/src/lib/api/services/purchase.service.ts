/**
 * Purchase Module API Service
 * Service layer for all Purchase module API calls
 */

import { ApiService } from '../api-service';
import type {
  // Supplier
  SupplierDto,
  SupplierListDto,
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierQueryParams,
  SupplierSummaryDto,
  // Purchase Request
  PurchaseRequestDto,
  PurchaseRequestListDto,
  CreatePurchaseRequestDto,
  UpdatePurchaseRequestDto,
  PurchaseRequestQueryParams,
  PurchaseRequestSummaryDto,
  // Purchase Order
  PurchaseOrderDto,
  PurchaseOrderListDto,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  PurchaseOrderQueryParams,
  PurchaseOrderSummaryDto,
  // Goods Receipt
  GoodsReceiptDto,
  GoodsReceiptListDto,
  CreateGoodsReceiptDto,
  UpdateGoodsReceiptDto,
  GoodsReceiptQueryParams,
  GoodsReceiptSummaryDto,
  // Purchase Invoice
  PurchaseInvoiceDto,
  PurchaseInvoiceListDto,
  CreatePurchaseInvoiceDto,
  UpdatePurchaseInvoiceDto,
  PurchaseInvoiceQueryParams,
  PurchaseInvoiceSummaryDto,
  // Purchase Return
  PurchaseReturnDto,
  PurchaseReturnListDto,
  CreatePurchaseReturnDto,
  UpdatePurchaseReturnDto,
  PurchaseReturnQueryParams,
  PurchaseReturnSummaryDto,
  // Supplier Payment
  SupplierPaymentDto,
  SupplierPaymentListDto,
  CreateSupplierPaymentDto,
  UpdateSupplierPaymentDto,
  SupplierPaymentQueryParams,
  SupplierPaymentSummaryDto,
  // Common
  PagedResult,
} from './purchase.types';

const BASE_URL = '/purchase';

// Helper to build query string
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// =====================================
// SUPPLIER SERVICE
// =====================================

export const SupplierService = {
  // Get all suppliers with pagination and filtering
  getAll: async (params?: SupplierQueryParams): Promise<PagedResult<SupplierListDto>> => {
    const query = params ? buildQueryString(params) : '';
    return ApiService.get<PagedResult<SupplierListDto>>(`${BASE_URL}/suppliers${query}`);
  },

  // Get supplier by ID
  getById: async (id: string): Promise<SupplierDto> => {
    return ApiService.get<SupplierDto>(`${BASE_URL}/suppliers/${id}`);
  },

  // Create new supplier
  create: async (data: CreateSupplierDto): Promise<SupplierDto> => {
    return ApiService.post<SupplierDto>(`${BASE_URL}/suppliers`, data);
  },

  // Update supplier
  update: async (id: string, data: UpdateSupplierDto): Promise<SupplierDto> => {
    return ApiService.put<SupplierDto>(`${BASE_URL}/suppliers/${id}`, data);
  },

  // Delete supplier
  delete: async (id: string): Promise<void> => {
    return ApiService.delete<void>(`${BASE_URL}/suppliers/${id}`);
  },

  // Get supplier summary
  getSummary: async (): Promise<SupplierSummaryDto> => {
    return ApiService.get<SupplierSummaryDto>(`${BASE_URL}/suppliers/summary`);
  },

  // Activate supplier
  activate: async (id: string): Promise<SupplierDto> => {
    return ApiService.post<SupplierDto>(`${BASE_URL}/suppliers/${id}/activate`);
  },

  // Deactivate supplier
  deactivate: async (id: string): Promise<SupplierDto> => {
    return ApiService.post<SupplierDto>(`${BASE_URL}/suppliers/${id}/deactivate`);
  },

  // Block supplier
  block: async (id: string, reason: string): Promise<SupplierDto> => {
    return ApiService.post<SupplierDto>(`${BASE_URL}/suppliers/${id}/block`, { reason });
  },

  // Unblock supplier
  unblock: async (id: string): Promise<SupplierDto> => {
    return ApiService.post<SupplierDto>(`${BASE_URL}/suppliers/${id}/unblock`);
  },

  // Get supplier products
  getProducts: async (id: string): Promise<any[]> => {
    return ApiService.get<any[]>(`${BASE_URL}/suppliers/${id}/products`);
  },

  // Get supplier contacts
  getContacts: async (id: string): Promise<any[]> => {
    return ApiService.get<any[]>(`${BASE_URL}/suppliers/${id}/contacts`);
  },

  // Add supplier contact
  addContact: async (id: string, contact: any): Promise<any> => {
    return ApiService.post<any>(`${BASE_URL}/suppliers/${id}/contacts`, contact);
  },

  // Remove supplier contact
  removeContact: async (supplierId: string, contactId: string): Promise<void> => {
    return ApiService.delete<void>(`${BASE_URL}/suppliers/${supplierId}/contacts/${contactId}`);
  },
};

// =====================================
// PURCHASE REQUEST SERVICE
// =====================================

export const PurchaseRequestService = {
  // Get all purchase requests
  getAll: async (params?: PurchaseRequestQueryParams): Promise<PagedResult<PurchaseRequestListDto>> => {
    const query = params ? buildQueryString(params) : '';
    return ApiService.get<PagedResult<PurchaseRequestListDto>>(`${BASE_URL}/requests${query}`);
  },

  // Get purchase request by ID
  getById: async (id: string): Promise<PurchaseRequestDto> => {
    return ApiService.get<PurchaseRequestDto>(`${BASE_URL}/requests/${id}`);
  },

  // Create new purchase request
  create: async (data: CreatePurchaseRequestDto): Promise<PurchaseRequestDto> => {
    return ApiService.post<PurchaseRequestDto>(`${BASE_URL}/requests`, data);
  },

  // Update purchase request
  update: async (id: string, data: UpdatePurchaseRequestDto): Promise<PurchaseRequestDto> => {
    return ApiService.put<PurchaseRequestDto>(`${BASE_URL}/requests/${id}`, data);
  },

  // Delete purchase request
  delete: async (id: string): Promise<void> => {
    return ApiService.delete<void>(`${BASE_URL}/requests/${id}`);
  },

  // Submit for approval
  submit: async (id: string): Promise<PurchaseRequestDto> => {
    return ApiService.post<PurchaseRequestDto>(`${BASE_URL}/requests/${id}/submit`);
  },

  // Approve request
  approve: async (id: string, notes?: string): Promise<PurchaseRequestDto> => {
    return ApiService.post<PurchaseRequestDto>(`${BASE_URL}/requests/${id}/approve`, { notes });
  },

  // Reject request
  reject: async (id: string, reason: string): Promise<PurchaseRequestDto> => {
    return ApiService.post<PurchaseRequestDto>(`${BASE_URL}/requests/${id}/reject`, { reason });
  },

  // Cancel request
  cancel: async (id: string, reason: string): Promise<PurchaseRequestDto> => {
    return ApiService.post<PurchaseRequestDto>(`${BASE_URL}/requests/${id}/cancel`, { reason });
  },

  // Convert to purchase order
  convertToOrder: async (id: string, supplierId: string): Promise<PurchaseOrderDto> => {
    return ApiService.post<PurchaseOrderDto>(`${BASE_URL}/requests/${id}/convert-to-order`, { supplierId });
  },

  // Get purchase request summary
  getSummary: async (): Promise<PurchaseRequestSummaryDto> => {
    return ApiService.get<PurchaseRequestSummaryDto>(`${BASE_URL}/requests/summary`);
  },
};

// =====================================
// PURCHASE ORDER SERVICE
// =====================================

export const PurchaseOrderService = {
  // Get all purchase orders
  getAll: async (params?: PurchaseOrderQueryParams): Promise<PagedResult<PurchaseOrderListDto>> => {
    const query = params ? buildQueryString(params) : '';
    return ApiService.get<PagedResult<PurchaseOrderListDto>>(`${BASE_URL}/orders${query}`);
  },

  // Get purchase order by ID
  getById: async (id: string): Promise<PurchaseOrderDto> => {
    return ApiService.get<PurchaseOrderDto>(`${BASE_URL}/orders/${id}`);
  },

  // Create new purchase order
  create: async (data: CreatePurchaseOrderDto): Promise<PurchaseOrderDto> => {
    return ApiService.post<PurchaseOrderDto>(`${BASE_URL}/orders`, data);
  },

  // Update purchase order
  update: async (id: string, data: UpdatePurchaseOrderDto): Promise<PurchaseOrderDto> => {
    return ApiService.put<PurchaseOrderDto>(`${BASE_URL}/orders/${id}`, data);
  },

  // Delete purchase order
  delete: async (id: string): Promise<void> => {
    return ApiService.delete<void>(`${BASE_URL}/orders/${id}`);
  },

  // Submit order
  submit: async (id: string): Promise<PurchaseOrderDto> => {
    return ApiService.post<PurchaseOrderDto>(`${BASE_URL}/orders/${id}/submit`);
  },

  // Approve order
  approve: async (id: string, notes?: string): Promise<PurchaseOrderDto> => {
    return ApiService.post<PurchaseOrderDto>(`${BASE_URL}/orders/${id}/approve`, { notes });
  },

  // Reject order
  reject: async (id: string, reason: string): Promise<PurchaseOrderDto> => {
    return ApiService.post<PurchaseOrderDto>(`${BASE_URL}/orders/${id}/reject`, { reason });
  },

  // Send to supplier
  send: async (id: string): Promise<PurchaseOrderDto> => {
    return ApiService.post<PurchaseOrderDto>(`${BASE_URL}/orders/${id}/send`);
  },

  // Confirm order
  confirm: async (id: string): Promise<PurchaseOrderDto> => {
    return ApiService.post<PurchaseOrderDto>(`${BASE_URL}/orders/${id}/confirm`);
  },

  // Cancel order
  cancel: async (id: string, reason: string): Promise<PurchaseOrderDto> => {
    return ApiService.post<PurchaseOrderDto>(`${BASE_URL}/orders/${id}/cancel`, { reason });
  },

  // Complete order
  complete: async (id: string): Promise<PurchaseOrderDto> => {
    return ApiService.post<PurchaseOrderDto>(`${BASE_URL}/orders/${id}/complete`);
  },

  // Close order
  close: async (id: string): Promise<PurchaseOrderDto> => {
    return ApiService.post<PurchaseOrderDto>(`${BASE_URL}/orders/${id}/close`);
  },

  // Add order item
  addItem: async (orderId: string, item: any): Promise<PurchaseOrderDto> => {
    return ApiService.post<PurchaseOrderDto>(`${BASE_URL}/orders/${orderId}/items`, item);
  },

  // Update order item
  updateItem: async (orderId: string, itemId: string, item: any): Promise<PurchaseOrderDto> => {
    return ApiService.put<PurchaseOrderDto>(`${BASE_URL}/orders/${orderId}/items/${itemId}`, item);
  },

  // Remove order item
  removeItem: async (orderId: string, itemId: string): Promise<void> => {
    return ApiService.delete<void>(`${BASE_URL}/orders/${orderId}/items/${itemId}`);
  },

  // Get purchase order summary
  getSummary: async (): Promise<PurchaseOrderSummaryDto> => {
    return ApiService.get<PurchaseOrderSummaryDto>(`${BASE_URL}/orders/summary`);
  },
};

// =====================================
// GOODS RECEIPT SERVICE
// =====================================

export const GoodsReceiptService = {
  // Get all goods receipts
  getAll: async (params?: GoodsReceiptQueryParams): Promise<PagedResult<GoodsReceiptListDto>> => {
    const query = params ? buildQueryString(params) : '';
    return ApiService.get<PagedResult<GoodsReceiptListDto>>(`${BASE_URL}/goods-receipts${query}`);
  },

  // Get goods receipt by ID
  getById: async (id: string): Promise<GoodsReceiptDto> => {
    return ApiService.get<GoodsReceiptDto>(`${BASE_URL}/goods-receipts/${id}`);
  },

  // Create new goods receipt
  create: async (data: CreateGoodsReceiptDto): Promise<GoodsReceiptDto> => {
    return ApiService.post<GoodsReceiptDto>(`${BASE_URL}/goods-receipts`, data);
  },

  // Update goods receipt
  update: async (id: string, data: UpdateGoodsReceiptDto): Promise<GoodsReceiptDto> => {
    return ApiService.put<GoodsReceiptDto>(`${BASE_URL}/goods-receipts/${id}`, data);
  },

  // Delete goods receipt
  delete: async (id: string): Promise<void> => {
    return ApiService.delete<void>(`${BASE_URL}/goods-receipts/${id}`);
  },

  // Complete receipt
  complete: async (id: string): Promise<GoodsReceiptDto> => {
    return ApiService.post<GoodsReceiptDto>(`${BASE_URL}/goods-receipts/${id}/complete`);
  },

  // Cancel receipt
  cancel: async (id: string, reason: string): Promise<GoodsReceiptDto> => {
    return ApiService.post<GoodsReceiptDto>(`${BASE_URL}/goods-receipts/${id}/cancel`, { reason });
  },

  // Quality check passed
  passQualityCheck: async (id: string, notes?: string): Promise<GoodsReceiptDto> => {
    return ApiService.post<GoodsReceiptDto>(`${BASE_URL}/goods-receipts/${id}/quality-check/pass`, { notes });
  },

  // Quality check failed
  failQualityCheck: async (id: string, reason: string): Promise<GoodsReceiptDto> => {
    return ApiService.post<GoodsReceiptDto>(`${BASE_URL}/goods-receipts/${id}/quality-check/fail`, { reason });
  },

  // Add receipt item
  addItem: async (receiptId: string, item: any): Promise<GoodsReceiptDto> => {
    return ApiService.post<GoodsReceiptDto>(`${BASE_URL}/goods-receipts/${receiptId}/items`, item);
  },

  // Update receipt item
  updateItem: async (receiptId: string, itemId: string, item: any): Promise<GoodsReceiptDto> => {
    return ApiService.put<GoodsReceiptDto>(`${BASE_URL}/goods-receipts/${receiptId}/items/${itemId}`, item);
  },

  // Remove receipt item
  removeItem: async (receiptId: string, itemId: string): Promise<void> => {
    return ApiService.delete<void>(`${BASE_URL}/goods-receipts/${receiptId}/items/${itemId}`);
  },

  // Get goods receipt summary
  getSummary: async (): Promise<GoodsReceiptSummaryDto> => {
    return ApiService.get<GoodsReceiptSummaryDto>(`${BASE_URL}/goods-receipts/summary`);
  },
};

// =====================================
// PURCHASE INVOICE SERVICE
// =====================================

export const PurchaseInvoiceService = {
  // Get all purchase invoices
  getAll: async (params?: PurchaseInvoiceQueryParams): Promise<PagedResult<PurchaseInvoiceListDto>> => {
    const query = params ? buildQueryString(params) : '';
    return ApiService.get<PagedResult<PurchaseInvoiceListDto>>(`${BASE_URL}/invoices${query}`);
  },

  // Get purchase invoice by ID
  getById: async (id: string): Promise<PurchaseInvoiceDto> => {
    return ApiService.get<PurchaseInvoiceDto>(`${BASE_URL}/invoices/${id}`);
  },

  // Create new purchase invoice
  create: async (data: CreatePurchaseInvoiceDto): Promise<PurchaseInvoiceDto> => {
    return ApiService.post<PurchaseInvoiceDto>(`${BASE_URL}/invoices`, data);
  },

  // Update purchase invoice
  update: async (id: string, data: UpdatePurchaseInvoiceDto): Promise<PurchaseInvoiceDto> => {
    return ApiService.put<PurchaseInvoiceDto>(`${BASE_URL}/invoices/${id}`, data);
  },

  // Delete purchase invoice
  delete: async (id: string): Promise<void> => {
    return ApiService.delete<void>(`${BASE_URL}/invoices/${id}`);
  },

  // Verify invoice
  verify: async (id: string): Promise<PurchaseInvoiceDto> => {
    return ApiService.post<PurchaseInvoiceDto>(`${BASE_URL}/invoices/${id}/verify`);
  },

  // Approve invoice
  approve: async (id: string, notes?: string): Promise<PurchaseInvoiceDto> => {
    return ApiService.post<PurchaseInvoiceDto>(`${BASE_URL}/invoices/${id}/approve`, { notes });
  },

  // Reject invoice
  reject: async (id: string, reason: string): Promise<PurchaseInvoiceDto> => {
    return ApiService.post<PurchaseInvoiceDto>(`${BASE_URL}/invoices/${id}/reject`, { reason });
  },

  // Mark as paid
  markAsPaid: async (id: string, paymentDetails?: any): Promise<PurchaseInvoiceDto> => {
    return ApiService.post<PurchaseInvoiceDto>(`${BASE_URL}/invoices/${id}/mark-paid`, paymentDetails);
  },

  // Cancel invoice
  cancel: async (id: string, reason: string): Promise<PurchaseInvoiceDto> => {
    return ApiService.post<PurchaseInvoiceDto>(`${BASE_URL}/invoices/${id}/cancel`, { reason });
  },

  // Match with goods receipt
  matchWithReceipt: async (invoiceId: string, receiptId: string): Promise<PurchaseInvoiceDto> => {
    return ApiService.post<PurchaseInvoiceDto>(`${BASE_URL}/invoices/${invoiceId}/match-receipt/${receiptId}`);
  },

  // Add invoice item
  addItem: async (invoiceId: string, item: any): Promise<PurchaseInvoiceDto> => {
    return ApiService.post<PurchaseInvoiceDto>(`${BASE_URL}/invoices/${invoiceId}/items`, item);
  },

  // Update invoice item
  updateItem: async (invoiceId: string, itemId: string, item: any): Promise<PurchaseInvoiceDto> => {
    return ApiService.put<PurchaseInvoiceDto>(`${BASE_URL}/invoices/${invoiceId}/items/${itemId}`, item);
  },

  // Remove invoice item
  removeItem: async (invoiceId: string, itemId: string): Promise<void> => {
    return ApiService.delete<void>(`${BASE_URL}/invoices/${invoiceId}/items/${itemId}`);
  },

  // Get purchase invoice summary
  getSummary: async (): Promise<PurchaseInvoiceSummaryDto> => {
    return ApiService.get<PurchaseInvoiceSummaryDto>(`${BASE_URL}/invoices/summary`);
  },
};

// =====================================
// PURCHASE RETURN SERVICE
// =====================================

export const PurchaseReturnService = {
  // Get all purchase returns
  getAll: async (params?: PurchaseReturnQueryParams): Promise<PagedResult<PurchaseReturnListDto>> => {
    const query = params ? buildQueryString(params) : '';
    return ApiService.get<PagedResult<PurchaseReturnListDto>>(`${BASE_URL}/returns${query}`);
  },

  // Get purchase return by ID
  getById: async (id: string): Promise<PurchaseReturnDto> => {
    return ApiService.get<PurchaseReturnDto>(`${BASE_URL}/returns/${id}`);
  },

  // Create new purchase return
  create: async (data: CreatePurchaseReturnDto): Promise<PurchaseReturnDto> => {
    return ApiService.post<PurchaseReturnDto>(`${BASE_URL}/returns`, data);
  },

  // Update purchase return
  update: async (id: string, data: UpdatePurchaseReturnDto): Promise<PurchaseReturnDto> => {
    return ApiService.put<PurchaseReturnDto>(`${BASE_URL}/returns/${id}`, data);
  },

  // Delete purchase return
  delete: async (id: string): Promise<void> => {
    return ApiService.delete<void>(`${BASE_URL}/returns/${id}`);
  },

  // Submit return
  submit: async (id: string): Promise<PurchaseReturnDto> => {
    return ApiService.post<PurchaseReturnDto>(`${BASE_URL}/returns/${id}/submit`);
  },

  // Approve return
  approve: async (id: string, notes?: string): Promise<PurchaseReturnDto> => {
    return ApiService.post<PurchaseReturnDto>(`${BASE_URL}/returns/${id}/approve`, { notes });
  },

  // Reject return
  reject: async (id: string, reason: string): Promise<PurchaseReturnDto> => {
    return ApiService.post<PurchaseReturnDto>(`${BASE_URL}/returns/${id}/reject`, { reason });
  },

  // Ship return
  ship: async (id: string, trackingNumber?: string): Promise<PurchaseReturnDto> => {
    return ApiService.post<PurchaseReturnDto>(`${BASE_URL}/returns/${id}/ship`, { trackingNumber });
  },

  // Receive return (supplier received)
  receiveBySupplier: async (id: string): Promise<PurchaseReturnDto> => {
    return ApiService.post<PurchaseReturnDto>(`${BASE_URL}/returns/${id}/receive`);
  },

  // Complete return (refund processed)
  complete: async (id: string, refundDetails?: any): Promise<PurchaseReturnDto> => {
    return ApiService.post<PurchaseReturnDto>(`${BASE_URL}/returns/${id}/complete`, refundDetails);
  },

  // Cancel return
  cancel: async (id: string, reason: string): Promise<PurchaseReturnDto> => {
    return ApiService.post<PurchaseReturnDto>(`${BASE_URL}/returns/${id}/cancel`, { reason });
  },

  // Add return item
  addItem: async (returnId: string, item: any): Promise<PurchaseReturnDto> => {
    return ApiService.post<PurchaseReturnDto>(`${BASE_URL}/returns/${returnId}/items`, item);
  },

  // Update return item
  updateItem: async (returnId: string, itemId: string, item: any): Promise<PurchaseReturnDto> => {
    return ApiService.put<PurchaseReturnDto>(`${BASE_URL}/returns/${returnId}/items/${itemId}`, item);
  },

  // Remove return item
  removeItem: async (returnId: string, itemId: string): Promise<void> => {
    return ApiService.delete<void>(`${BASE_URL}/returns/${returnId}/items/${itemId}`);
  },

  // Get purchase return summary
  getSummary: async (): Promise<PurchaseReturnSummaryDto> => {
    return ApiService.get<PurchaseReturnSummaryDto>(`${BASE_URL}/returns/summary`);
  },
};

// =====================================
// SUPPLIER PAYMENT SERVICE
// =====================================

export const SupplierPaymentService = {
  // Get all supplier payments
  getAll: async (params?: SupplierPaymentQueryParams): Promise<PagedResult<SupplierPaymentListDto>> => {
    const query = params ? buildQueryString(params) : '';
    return ApiService.get<PagedResult<SupplierPaymentListDto>>(`${BASE_URL}/payments${query}`);
  },

  // Get supplier payment by ID
  getById: async (id: string): Promise<SupplierPaymentDto> => {
    return ApiService.get<SupplierPaymentDto>(`${BASE_URL}/payments/${id}`);
  },

  // Create new supplier payment
  create: async (data: CreateSupplierPaymentDto): Promise<SupplierPaymentDto> => {
    return ApiService.post<SupplierPaymentDto>(`${BASE_URL}/payments`, data);
  },

  // Update supplier payment
  update: async (id: string, data: UpdateSupplierPaymentDto): Promise<SupplierPaymentDto> => {
    return ApiService.put<SupplierPaymentDto>(`${BASE_URL}/payments/${id}`, data);
  },

  // Delete supplier payment
  delete: async (id: string): Promise<void> => {
    return ApiService.delete<void>(`${BASE_URL}/payments/${id}`);
  },

  // Submit payment
  submit: async (id: string): Promise<SupplierPaymentDto> => {
    return ApiService.post<SupplierPaymentDto>(`${BASE_URL}/payments/${id}/submit`);
  },

  // Approve payment
  approve: async (id: string, notes?: string): Promise<SupplierPaymentDto> => {
    return ApiService.post<SupplierPaymentDto>(`${BASE_URL}/payments/${id}/approve`, { notes });
  },

  // Reject payment
  reject: async (id: string, reason: string): Promise<SupplierPaymentDto> => {
    return ApiService.post<SupplierPaymentDto>(`${BASE_URL}/payments/${id}/reject`, { reason });
  },

  // Process payment
  process: async (id: string): Promise<SupplierPaymentDto> => {
    return ApiService.post<SupplierPaymentDto>(`${BASE_URL}/payments/${id}/process`);
  },

  // Complete payment
  complete: async (id: string, transactionReference?: string): Promise<SupplierPaymentDto> => {
    return ApiService.post<SupplierPaymentDto>(`${BASE_URL}/payments/${id}/complete`, { transactionReference });
  },

  // Fail payment
  fail: async (id: string, reason: string): Promise<SupplierPaymentDto> => {
    return ApiService.post<SupplierPaymentDto>(`${BASE_URL}/payments/${id}/fail`, { reason });
  },

  // Cancel payment
  cancel: async (id: string, reason: string): Promise<SupplierPaymentDto> => {
    return ApiService.post<SupplierPaymentDto>(`${BASE_URL}/payments/${id}/cancel`, { reason });
  },

  // Void payment
  void: async (id: string, reason: string): Promise<SupplierPaymentDto> => {
    return ApiService.post<SupplierPaymentDto>(`${BASE_URL}/payments/${id}/void`, { reason });
  },

  // Reconcile payment
  reconcile: async (id: string, bankTransactionId: string): Promise<SupplierPaymentDto> => {
    return ApiService.post<SupplierPaymentDto>(`${BASE_URL}/payments/${id}/reconcile`, { bankTransactionId });
  },

  // Allocate payment to invoices
  allocate: async (id: string, allocations: { invoiceId: string; amount: number }[]): Promise<SupplierPaymentDto> => {
    return ApiService.post<SupplierPaymentDto>(`${BASE_URL}/payments/${id}/allocate`, { allocations });
  },

  // Get supplier outstanding balance
  getSupplierBalance: async (supplierId: string): Promise<{ balance: number; overdueAmount: number }> => {
    return ApiService.get<{ balance: number; overdueAmount: number }>(`${BASE_URL}/payments/supplier/${supplierId}/balance`);
  },

  // Get supplier payment history
  getSupplierPayments: async (supplierId: string, params?: SupplierPaymentQueryParams): Promise<PagedResult<SupplierPaymentListDto>> => {
    const query = params ? buildQueryString(params) : '';
    return ApiService.get<PagedResult<SupplierPaymentListDto>>(`${BASE_URL}/payments/supplier/${supplierId}${query}`);
  },

  // Get supplier payment summary
  getSummary: async (): Promise<SupplierPaymentSummaryDto> => {
    return ApiService.get<SupplierPaymentSummaryDto>(`${BASE_URL}/payments/summary`);
  },
};

// =====================================
// UNIFIED PURCHASE SERVICE
// =====================================

export const PurchaseService = {
  suppliers: SupplierService,
  requests: PurchaseRequestService,
  orders: PurchaseOrderService,
  goodsReceipts: GoodsReceiptService,
  invoices: PurchaseInvoiceService,
  returns: PurchaseReturnService,
  payments: SupplierPaymentService,
};

export default PurchaseService;
