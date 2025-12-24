/**
 * React Query Hooks for Purchase Module
 * Comprehensive hooks for all Purchase module endpoints with optimistic updates and cache management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  SupplierService,
  PurchaseRequestService,
  PurchaseOrderService,
  GoodsReceiptService,
  PurchaseInvoiceService,
  PurchaseReturnService,
  SupplierPaymentService,
  QuotationService,
  PriceListService,
  PurchaseBudgetService,
  SupplierEvaluationService,
  ApprovalWorkflowService,
} from '../services/purchase.service';
import { showSuccess, showError, showInfo, showApiError } from '@/lib/utils/notifications';
import { queryOptions } from '../query-options';
import type {
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierQueryParams,
  CreatePurchaseRequestDto,
  UpdatePurchaseRequestDto,
  PurchaseRequestQueryParams,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  PurchaseOrderQueryParams,
  CreateGoodsReceiptDto,
  UpdateGoodsReceiptDto,
  GoodsReceiptQueryParams,
  CreatePurchaseInvoiceDto,
  UpdatePurchaseInvoiceDto,
  PurchaseInvoiceQueryParams,
  CreatePurchaseReturnDto,
  UpdatePurchaseReturnDto,
  PurchaseReturnQueryParams,
  CreateSupplierPaymentDto,
  UpdateSupplierPaymentDto,
  SupplierPaymentQueryParams,
  CreateQuotationDto,
  UpdateQuotationDto,
  QuotationQueryParams,
  CreatePriceListDto,
  UpdatePriceListDto,
  PriceListQueryParams,
  CreatePurchaseBudgetDto,
  UpdatePurchaseBudgetDto,
  PurchaseBudgetQueryParams,
  CreateSupplierEvaluationDto,
  UpdateSupplierEvaluationDto,
  SupplierEvaluationQueryParams,
  CreateApprovalWorkflowDto,
  UpdateApprovalWorkflowDto,
  ApprovalWorkflowQueryParams,
} from '../services/purchase.types';

// =====================================
// QUERY KEYS
// =====================================

export const purchaseKeys = {
  // Suppliers
  suppliers: ['purchase', 'suppliers'] as const,
  supplier: (id: string) => ['purchase', 'suppliers', id] as const,
  supplierProducts: (id: string) => ['purchase', 'suppliers', id, 'products'] as const,
  supplierContacts: (id: string) => ['purchase', 'suppliers', id, 'contacts'] as const,

  // Purchase Requests
  requests: ['purchase', 'requests'] as const,
  request: (id: string) => ['purchase', 'requests', id] as const,

  // Purchase Orders
  orders: ['purchase', 'orders'] as const,
  order: (id: string) => ['purchase', 'orders', id] as const,
  orderItems: (id: string) => ['purchase', 'orders', id, 'items'] as const,

  // Goods Receipts
  goodsReceipts: ['purchase', 'goods-receipts'] as const,
  goodsReceipt: (id: string) => ['purchase', 'goods-receipts', id] as const,
  receiptItems: (id: string) => ['purchase', 'goods-receipts', id, 'items'] as const,

  // Purchase Invoices
  invoices: ['purchase', 'invoices'] as const,
  invoice: (id: string) => ['purchase', 'invoices', id] as const,
  invoiceItems: (id: string) => ['purchase', 'invoices', id, 'items'] as const,

  // Purchase Returns
  returns: ['purchase', 'returns'] as const,
  return: (id: string) => ['purchase', 'returns', id] as const,
  returnItems: (id: string) => ['purchase', 'returns', id, 'items'] as const,

  // Supplier Payments
  payments: ['purchase', 'payments'] as const,
  payment: (id: string) => ['purchase', 'payments', id] as const,
  supplierPayments: (supplierId: string) => ['purchase', 'payments', 'supplier', supplierId] as const,
  supplierBalance: (supplierId: string) => ['purchase', 'payments', 'supplier', supplierId, 'balance'] as const,

  // Quotations
  quotations: ['purchase', 'quotations'] as const,
  quotation: (id: string) => ['purchase', 'quotations', id] as const,

  // Price Lists
  priceLists: ['purchase', 'price-lists'] as const,
  priceList: (id: string) => ['purchase', 'price-lists', id] as const,

  // Purchase Budgets
  budgets: ['purchase', 'budgets'] as const,
  budget: (id: string) => ['purchase', 'budgets', id] as const,

  // Supplier Evaluations
  evaluations: ['purchase', 'evaluations'] as const,
  evaluation: (id: string) => ['purchase', 'evaluations', id] as const,
  supplierEvaluationHistory: (supplierId: string) => ['purchase', 'evaluations', 'supplier', supplierId] as const,

  // Approval Workflows
  workflows: ['purchase', 'workflows'] as const,
  workflow: (id: string) => ['purchase', 'workflows', id] as const,
};

// =====================================
// SUPPLIER HOOKS
// =====================================

export function useSuppliers(params?: SupplierQueryParams) {
  return useQuery({
    queryKey: [...purchaseKeys.suppliers, params],
    queryFn: () => SupplierService.getAll(params),
    ...queryOptions.list(),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: purchaseKeys.supplier(id),
    queryFn: () => SupplierService.getById(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useSupplierProducts(id: string) {
  return useQuery({
    queryKey: purchaseKeys.supplierProducts(id),
    queryFn: () => SupplierService.getProducts(id),
    ...queryOptions.list({ enabled: !!id }),
  });
}

export function useSupplierContacts(id: string) {
  return useQuery({
    queryKey: purchaseKeys.supplierContacts(id),
    queryFn: () => SupplierService.getContacts(id),
    ...queryOptions.list({ enabled: !!id }),
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierDto) => SupplierService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.suppliers });
      showSuccess('Tedarikçi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Tedarikçi oluşturulamadı');
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierDto }) =>
      SupplierService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.supplier(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.suppliers });
      showSuccess('Tedarikçi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Tedarikçi güncellenemedi');
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SupplierService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.suppliers });
      showSuccess('Tedarikçi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Tedarikçi silinemedi');
    },
  });
}

export function useActivateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SupplierService.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.supplier(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.suppliers });
      showSuccess('Tedarikçi aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Tedarikçi aktifleştirilemedi');
    },
  });
}

export function useDeactivateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SupplierService.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.supplier(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.suppliers });
      showInfo('Tedarikçi devre dışı bırakıldı');
    },
    onError: (error) => {
      showApiError(error, 'Tedarikçi devre dışı bırakılamadı');
    },
  });
}

export function useBlockSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      SupplierService.block(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.supplier(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.suppliers });
      showInfo('Tedarikçi bloklandı');
    },
    onError: (error) => {
      showApiError(error, 'Tedarikçi bloklanamadı');
    },
  });
}

export function useUnblockSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SupplierService.unblock(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.supplier(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.suppliers });
      showSuccess('Tedarikçi bloğu kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'Tedarikçi bloğu kaldırılamadı');
    },
  });
}

export function useAddSupplierContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, contact }: { id: string; contact: any }) =>
      SupplierService.addContact(id, contact),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.supplierContacts(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.supplier(variables.id) });
      showSuccess('İletişim kişisi eklendi');
    },
    onError: (error) => {
      showApiError(error, 'İletişim kişisi eklenemedi');
    },
  });
}

export function useRemoveSupplierContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ supplierId, contactId }: { supplierId: string; contactId: string }) =>
      SupplierService.removeContact(supplierId, contactId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.supplierContacts(variables.supplierId) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.supplier(variables.supplierId) });
      showSuccess('İletişim kişisi kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'İletişim kişisi kaldırılamadı');
    },
  });
}

// =====================================
// PURCHASE REQUEST HOOKS
// =====================================

export function usePurchaseRequests(params?: PurchaseRequestQueryParams) {
  return useQuery({
    queryKey: [...purchaseKeys.requests, params],
    queryFn: () => PurchaseRequestService.getAll(params),
    ...queryOptions.list(),
  });
}

export function usePurchaseRequest(id: string) {
  return useQuery({
    queryKey: purchaseKeys.request(id),
    queryFn: () => PurchaseRequestService.getById(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreatePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseRequestDto) => PurchaseRequestService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.requests });
      showSuccess('Satın alma talebi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Satın alma talebi oluşturulamadı');
    },
  });
}

export function useUpdatePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePurchaseRequestDto }) =>
      PurchaseRequestService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.request(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.requests });
      showSuccess('Satın alma talebi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Satın alma talebi güncellenemedi');
    },
  });
}

export function useDeletePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseRequestService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.requests });
      showSuccess('Satın alma talebi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Satın alma talebi silinemedi');
    },
  });
}

export function useSubmitPurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseRequestService.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.request(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.requests });
      showSuccess('Satın alma talebi onaya gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Talep gönderilemedi');
    },
  });
}

export function useApprovePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      PurchaseRequestService.approve(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.request(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.requests });
      showSuccess('Satın alma talebi onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Talep onaylanamadı');
    },
  });
}

export function useRejectPurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      PurchaseRequestService.reject(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.request(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.requests });
      showInfo('Satın alma talebi reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'Talep reddedilemedi');
    },
  });
}

export function useCancelPurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      PurchaseRequestService.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.request(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.requests });
      showInfo('Satın alma talebi iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Talep iptal edilemedi');
    },
  });
}

export function useConvertRequestToOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, supplierId }: { id: string; supplierId: string }) =>
      PurchaseRequestService.convertToOrder(id, supplierId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.request(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.requests });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.orders });
      showSuccess('Satın alma siparişi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Sipariş oluşturulamadı');
    },
  });
}

// Get purchase request summary
export function usePurchaseRequestSummary() {
  return useQuery({
    queryKey: [...purchaseKeys.requests, 'summary'],
    queryFn: () => PurchaseRequestService.getSummary(),
    ...queryOptions.realtime(),
  });
}

// =====================================
// PURCHASE ORDER HOOKS
// =====================================

export function usePurchaseOrders(params?: PurchaseOrderQueryParams) {
  return useQuery({
    queryKey: [...purchaseKeys.orders, params],
    queryFn: () => PurchaseOrderService.getAll(params),
    ...queryOptions.list(),
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: purchaseKeys.order(id),
    queryFn: () => PurchaseOrderService.getById(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderDto) => PurchaseOrderService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.orders });
      showSuccess('Satın alma siparişi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Satın alma siparişi oluşturulamadı');
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePurchaseOrderDto }) =>
      PurchaseOrderService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.order(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.orders });
      showSuccess('Satın alma siparişi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Satın alma siparişi güncellenemedi');
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseOrderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.orders });
      showSuccess('Satın alma siparişi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Satın alma siparişi silinemedi');
    },
  });
}

export function useSubmitPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseOrderService.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.order(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.orders });
      showSuccess('Sipariş onaya gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Sipariş gönderilemedi');
    },
  });
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      PurchaseOrderService.approve(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.order(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.orders });
      showSuccess('Sipariş onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Sipariş onaylanamadı');
    },
  });
}

export function useRejectPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      PurchaseOrderService.reject(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.order(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.orders });
      showInfo('Sipariş reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'Sipariş reddedilemedi');
    },
  });
}

export function useSendPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseOrderService.send(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.order(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.orders });
      showSuccess('Sipariş tedarikçiye gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Sipariş gönderilemedi');
    },
  });
}

export function useConfirmPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseOrderService.confirm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.order(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.orders });
      showSuccess('Sipariş onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Sipariş onaylanamadı');
    },
  });
}

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      PurchaseOrderService.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.order(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.orders });
      showInfo('Sipariş iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Sipariş iptal edilemedi');
    },
  });
}

export function useCompletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseOrderService.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.order(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.orders });
      showSuccess('Sipariş tamamlandı');
    },
    onError: (error) => {
      showApiError(error, 'Sipariş tamamlanamadı');
    },
  });
}

export function useClosePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseOrderService.close(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.order(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.orders });
      showSuccess('Sipariş kapatıldı');
    },
    onError: (error) => {
      showApiError(error, 'Sipariş kapatılamadı');
    },
  });
}

export function useAddPurchaseOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, item }: { orderId: string; item: any }) =>
      PurchaseOrderService.addItem(orderId, item),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.order(variables.orderId) });
      showSuccess('Kalem eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Kalem eklenemedi');
    },
  });
}

export function useUpdatePurchaseOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, itemId, item }: { orderId: string; itemId: string; item: any }) =>
      PurchaseOrderService.updateItem(orderId, itemId, item),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.order(variables.orderId) });
      showSuccess('Kalem güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Kalem güncellenemedi');
    },
  });
}

export function useRemovePurchaseOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string }) =>
      PurchaseOrderService.removeItem(orderId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.order(variables.orderId) });
      showSuccess('Kalem kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'Kalem kaldırılamadı');
    },
  });
}

// =====================================
// GOODS RECEIPT HOOKS
// =====================================

export function useGoodsReceipts(params?: GoodsReceiptQueryParams) {
  return useQuery({
    queryKey: [...purchaseKeys.goodsReceipts, params],
    queryFn: () => GoodsReceiptService.getAll(params),
    ...queryOptions.list(),
  });
}

export function useGoodsReceipt(id: string) {
  return useQuery({
    queryKey: purchaseKeys.goodsReceipt(id),
    queryFn: () => GoodsReceiptService.getById(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateGoodsReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoodsReceiptDto) => GoodsReceiptService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.goodsReceipts });
      showSuccess('Mal alım belgesi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Mal alım belgesi oluşturulamadı');
    },
  });
}

export function useUpdateGoodsReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoodsReceiptDto }) =>
      GoodsReceiptService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.goodsReceipt(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.goodsReceipts });
      showSuccess('Mal alım belgesi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Mal alım belgesi güncellenemedi');
    },
  });
}

export function useDeleteGoodsReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => GoodsReceiptService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.goodsReceipts });
      showSuccess('Mal alım belgesi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Mal alım belgesi silinemedi');
    },
  });
}

export function useCompleteGoodsReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => GoodsReceiptService.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.goodsReceipt(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.goodsReceipts });
      showSuccess('Mal alım belgesi tamamlandı');
    },
    onError: (error) => {
      showApiError(error, 'Mal alım belgesi tamamlanamadı');
    },
  });
}

export function useCancelGoodsReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      GoodsReceiptService.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.goodsReceipt(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.goodsReceipts });
      showInfo('Mal alım belgesi iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Mal alım belgesi iptal edilemedi');
    },
  });
}

export function usePassQualityCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      GoodsReceiptService.passQualityCheck(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.goodsReceipt(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.goodsReceipts });
      showSuccess('Kalite kontrolü başarılı');
    },
    onError: (error) => {
      showApiError(error, 'Kalite kontrolü güncellenemedi');
    },
  });
}

export function useFailQualityCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      GoodsReceiptService.failQualityCheck(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.goodsReceipt(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.goodsReceipts });
      showInfo('Kalite kontrolü başarısız');
    },
    onError: (error) => {
      showApiError(error, 'Kalite kontrolü güncellenemedi');
    },
  });
}

export function useAddGoodsReceiptItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ receiptId, item }: { receiptId: string; item: any }) =>
      GoodsReceiptService.addItem(receiptId, item),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.goodsReceipt(variables.receiptId) });
      showSuccess('Kalem eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Kalem eklenemedi');
    },
  });
}

export function useUpdateGoodsReceiptItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ receiptId, itemId, item }: { receiptId: string; itemId: string; item: any }) =>
      GoodsReceiptService.updateItem(receiptId, itemId, item),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.goodsReceipt(variables.receiptId) });
      showSuccess('Kalem güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Kalem güncellenemedi');
    },
  });
}

export function useRemoveGoodsReceiptItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ receiptId, itemId }: { receiptId: string; itemId: string }) =>
      GoodsReceiptService.removeItem(receiptId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.goodsReceipt(variables.receiptId) });
      showSuccess('Kalem kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'Kalem kaldırılamadı');
    },
  });
}

// =====================================
// PURCHASE INVOICE HOOKS
// =====================================

export function usePurchaseInvoices(params?: PurchaseInvoiceQueryParams) {
  return useQuery({
    queryKey: [...purchaseKeys.invoices, params],
    queryFn: () => PurchaseInvoiceService.getAll(params),
    ...queryOptions.list(),
  });
}

export function usePurchaseInvoice(id: string) {
  return useQuery({
    queryKey: purchaseKeys.invoice(id),
    queryFn: () => PurchaseInvoiceService.getById(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreatePurchaseInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseInvoiceDto) => PurchaseInvoiceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoices });
      showSuccess('Satın alma faturası oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Satın alma faturası oluşturulamadı');
    },
  });
}

export function useUpdatePurchaseInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePurchaseInvoiceDto }) =>
      PurchaseInvoiceService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoice(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoices });
      showSuccess('Satın alma faturası güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Satın alma faturası güncellenemedi');
    },
  });
}

export function useDeletePurchaseInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseInvoiceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoices });
      showSuccess('Satın alma faturası silindi');
    },
    onError: (error) => {
      showApiError(error, 'Satın alma faturası silinemedi');
    },
  });
}

export function useVerifyPurchaseInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseInvoiceService.verify(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoices });
      showSuccess('Fatura doğrulandı');
    },
    onError: (error) => {
      showApiError(error, 'Fatura doğrulanamadı');
    },
  });
}

export function useApprovePurchaseInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      PurchaseInvoiceService.approve(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoice(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoices });
      showSuccess('Fatura onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Fatura onaylanamadı');
    },
  });
}

export function useRejectPurchaseInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      PurchaseInvoiceService.reject(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoice(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoices });
      showInfo('Fatura reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'Fatura reddedilemedi');
    },
  });
}

export function useMarkInvoiceAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentDetails }: { id: string; paymentDetails?: any }) =>
      PurchaseInvoiceService.markAsPaid(id, paymentDetails),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoice(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoices });
      showSuccess('Fatura ödendi olarak işaretlendi');
    },
    onError: (error) => {
      showApiError(error, 'Fatura güncellenemedi');
    },
  });
}

export function useCancelPurchaseInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      PurchaseInvoiceService.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoice(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoices });
      showInfo('Fatura iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Fatura iptal edilemedi');
    },
  });
}

export function useMatchInvoiceWithReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, receiptId }: { invoiceId: string; receiptId: string }) =>
      PurchaseInvoiceService.matchWithReceipt(invoiceId, receiptId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoice(variables.invoiceId) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.goodsReceipt(variables.receiptId) });
      showSuccess('Fatura mal alım belgesi ile eşleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Eşleştirme başarısız');
    },
  });
}

export function useAddPurchaseInvoiceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, item }: { invoiceId: string; item: any }) =>
      PurchaseInvoiceService.addItem(invoiceId, item),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoice(variables.invoiceId) });
      showSuccess('Kalem eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Kalem eklenemedi');
    },
  });
}

export function useUpdatePurchaseInvoiceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, itemId, item }: { invoiceId: string; itemId: string; item: any }) =>
      PurchaseInvoiceService.updateItem(invoiceId, itemId, item),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoice(variables.invoiceId) });
      showSuccess('Kalem güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Kalem güncellenemedi');
    },
  });
}

export function useRemovePurchaseInvoiceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, itemId }: { invoiceId: string; itemId: string }) =>
      PurchaseInvoiceService.removeItem(invoiceId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoice(variables.invoiceId) });
      showSuccess('Kalem kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'Kalem kaldırılamadı');
    },
  });
}

// =====================================
// PURCHASE RETURN HOOKS
// =====================================

export function usePurchaseReturns(params?: PurchaseReturnQueryParams) {
  return useQuery({
    queryKey: [...purchaseKeys.returns, params],
    queryFn: () => PurchaseReturnService.getAll(params),
    ...queryOptions.list(),
  });
}

export function usePurchaseReturn(id: string) {
  return useQuery({
    queryKey: purchaseKeys.return(id),
    queryFn: () => PurchaseReturnService.getById(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreatePurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseReturnDto) => PurchaseReturnService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.returns });
      showSuccess('İade talebi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'İade talebi oluşturulamadı');
    },
  });
}

export function useUpdatePurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePurchaseReturnDto }) =>
      PurchaseReturnService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.return(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.returns });
      showSuccess('İade talebi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'İade talebi güncellenemedi');
    },
  });
}

export function useDeletePurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseReturnService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.returns });
      showSuccess('İade talebi silindi');
    },
    onError: (error) => {
      showApiError(error, 'İade talebi silinemedi');
    },
  });
}

export function useSubmitPurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseReturnService.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.return(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.returns });
      showSuccess('İade talebi gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'İade talebi gönderilemedi');
    },
  });
}

export function useApprovePurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      PurchaseReturnService.approve(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.return(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.returns });
      showSuccess('İade talebi onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'İade talebi onaylanamadı');
    },
  });
}

export function useRejectPurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      PurchaseReturnService.reject(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.return(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.returns });
      showInfo('İade talebi reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'İade talebi reddedilemedi');
    },
  });
}

export function useShipPurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, trackingNumber }: { id: string; trackingNumber?: string }) =>
      PurchaseReturnService.ship(id, trackingNumber),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.return(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.returns });
      showSuccess('İade kargoya verildi');
    },
    onError: (error) => {
      showApiError(error, 'İade kargoya verilemedi');
    },
  });
}

export function useReceivePurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseReturnService.receiveBySupplier(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.return(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.returns });
      showSuccess('İade tedarikçi tarafından alındı');
    },
    onError: (error) => {
      showApiError(error, 'İade alınamadı');
    },
  });
}

export function useCompletePurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, refundDetails }: { id: string; refundDetails?: any }) =>
      PurchaseReturnService.complete(id, refundDetails),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.return(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.returns });
      showSuccess('İade tamamlandı');
    },
    onError: (error) => {
      showApiError(error, 'İade tamamlanamadı');
    },
  });
}

export function useCancelPurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      PurchaseReturnService.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.return(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.returns });
      showInfo('İade iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'İade iptal edilemedi');
    },
  });
}

export function useAddPurchaseReturnItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ returnId, item }: { returnId: string; item: any }) =>
      PurchaseReturnService.addItem(returnId, item),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.return(variables.returnId) });
      showSuccess('Kalem eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Kalem eklenemedi');
    },
  });
}

export function useUpdatePurchaseReturnItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ returnId, itemId, item }: { returnId: string; itemId: string; item: any }) =>
      PurchaseReturnService.updateItem(returnId, itemId, item),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.return(variables.returnId) });
      showSuccess('Kalem güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Kalem güncellenemedi');
    },
  });
}

export function useRemovePurchaseReturnItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ returnId, itemId }: { returnId: string; itemId: string }) =>
      PurchaseReturnService.removeItem(returnId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.return(variables.returnId) });
      showSuccess('Kalem kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'Kalem kaldırılamadı');
    },
  });
}

// =====================================
// SUPPLIER PAYMENT HOOKS
// =====================================

export function useSupplierPayments(params?: SupplierPaymentQueryParams) {
  return useQuery({
    queryKey: [...purchaseKeys.payments, params],
    queryFn: () => SupplierPaymentService.getAll(params),
    ...queryOptions.list(),
  });
}

export function useSupplierPayment(id: string) {
  return useQuery({
    queryKey: purchaseKeys.payment(id),
    queryFn: () => SupplierPaymentService.getById(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useSupplierBalance(supplierId: string) {
  return useQuery({
    queryKey: purchaseKeys.supplierBalance(supplierId),
    queryFn: () => SupplierPaymentService.getSupplierBalance(supplierId),
    ...queryOptions.detail({ enabled: !!supplierId }),
  });
}

export function useSupplierPaymentHistory(supplierId: string, params?: SupplierPaymentQueryParams) {
  return useQuery({
    queryKey: [...purchaseKeys.supplierPayments(supplierId), params],
    queryFn: () => SupplierPaymentService.getSupplierPayments(supplierId, params),
    ...queryOptions.list({ enabled: !!supplierId }),
  });
}

export function useCreateSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierPaymentDto) => SupplierPaymentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payments });
      showSuccess('Ödeme oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Ödeme oluşturulamadı');
    },
  });
}

export function useUpdateSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierPaymentDto }) =>
      SupplierPaymentService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payment(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payments });
      showSuccess('Ödeme güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Ödeme güncellenemedi');
    },
  });
}

export function useDeleteSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SupplierPaymentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payments });
      showSuccess('Ödeme silindi');
    },
    onError: (error) => {
      showApiError(error, 'Ödeme silinemedi');
    },
  });
}

export function useSubmitSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SupplierPaymentService.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payment(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payments });
      showSuccess('Ödeme onaya gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Ödeme gönderilemedi');
    },
  });
}

export function useApproveSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      SupplierPaymentService.approve(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payment(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payments });
      showSuccess('Ödeme onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Ödeme onaylanamadı');
    },
  });
}

export function useRejectSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      SupplierPaymentService.reject(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payment(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payments });
      showInfo('Ödeme reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'Ödeme reddedilemedi');
    },
  });
}

export function useProcessSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SupplierPaymentService.process(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payment(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payments });
      showSuccess('Ödeme işleniyor');
    },
    onError: (error) => {
      showApiError(error, 'Ödeme işlenemedi');
    },
  });
}

export function useCompleteSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, transactionReference }: { id: string; transactionReference?: string }) =>
      SupplierPaymentService.complete(id, transactionReference),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payment(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payments });
      showSuccess('Ödeme tamamlandı');
    },
    onError: (error) => {
      showApiError(error, 'Ödeme tamamlanamadı');
    },
  });
}

export function useFailSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      SupplierPaymentService.fail(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payment(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payments });
      showError('Ödeme başarısız olarak işaretlendi');
    },
    onError: (error) => {
      showApiError(error, 'Ödeme güncellenemedi');
    },
  });
}

export function useCancelSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      SupplierPaymentService.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payment(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payments });
      showInfo('Ödeme iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Ödeme iptal edilemedi');
    },
  });
}

export function useVoidSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      SupplierPaymentService.void(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payment(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payments });
      showInfo('Ödeme geçersiz kılındı');
    },
    onError: (error) => {
      showApiError(error, 'Ödeme geçersiz kılınamadı');
    },
  });
}

export function useReconcileSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, bankTransactionId }: { id: string; bankTransactionId: string }) =>
      SupplierPaymentService.reconcile(id, bankTransactionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payment(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payments });
      showSuccess('Ödeme mutabık kılındı');
    },
    onError: (error) => {
      showApiError(error, 'Mutabakat başarısız');
    },
  });
}

export function useAllocateSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, allocations }: { id: string; allocations: { invoiceId: string; amount: number }[] }) =>
      SupplierPaymentService.allocate(id, allocations),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payment(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payments });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoices });
      showSuccess('Ödeme dağıtıldı');
    },
    onError: (error) => {
      showApiError(error, 'Ödeme dağıtılamadı');
    },
  });
}

// =====================================
// SUMMARY HOOKS
// =====================================

export function useSupplierSummary() {
  return useQuery({
    queryKey: [...purchaseKeys.suppliers, 'summary'],
    queryFn: () => SupplierService.getSummary(),
    staleTime: 60000,
  });
}

export function usePurchaseOrderSummary() {
  return useQuery({
    queryKey: [...purchaseKeys.orders, 'summary'],
    queryFn: () => PurchaseOrderService.getSummary(),
    staleTime: 60000,
  });
}

export function useGoodsReceiptSummary() {
  return useQuery({
    queryKey: [...purchaseKeys.goodsReceipts, 'summary'],
    queryFn: () => GoodsReceiptService.getSummary(),
    staleTime: 60000,
  });
}

export function usePurchaseInvoiceSummary() {
  return useQuery({
    queryKey: [...purchaseKeys.invoices, 'summary'],
    queryFn: () => PurchaseInvoiceService.getSummary(),
    staleTime: 60000,
  });
}

export function usePurchaseReturnSummary() {
  return useQuery({
    queryKey: [...purchaseKeys.returns, 'summary'],
    queryFn: () => PurchaseReturnService.getSummary(),
    staleTime: 60000,
  });
}

export function useSupplierPaymentSummary() {
  return useQuery({
    queryKey: [...purchaseKeys.payments, 'summary'],
    queryFn: () => SupplierPaymentService.getSummary(),
    staleTime: 60000,
  });
}

// =====================================
// ADDITIONAL WORKFLOW HOOKS
// =====================================

// Submit invoice for approval (alias for verify)
export function useSubmitInvoiceForApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseInvoiceService.verify(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.invoices });
      showSuccess('Fatura onaya gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Fatura gönderilemedi');
    },
  });
}

// Submit payment for approval
export function useSubmitPaymentForApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SupplierPaymentService.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payment(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.payments });
      showSuccess('Ödeme onaya gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Ödeme gönderilemedi');
    },
  });
}

// Submit return for approval
export function useSubmitReturnForApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseReturnService.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.return(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.returns });
      showSuccess('İade onaya gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'İade gönderilemedi');
    },
  });
}

// Process purchase refund (complete return with refund)
export function useProcessPurchaseRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, refundDetails }: { id: string; refundDetails?: any }) =>
      PurchaseReturnService.complete(id, refundDetails),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.return(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.returns });
      showSuccess('İade işlendi');
    },
    onError: (error) => {
      showApiError(error, 'İade işlenemedi');
    },
  });
}

// =====================================
// QUOTATION HOOKS
// =====================================

export function useQuotations(params?: QuotationQueryParams) {
  return useQuery({
    queryKey: [...purchaseKeys.quotations, params],
    queryFn: () => QuotationService.getAll(params),
    staleTime: 30000,
  });
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: purchaseKeys.quotation(id),
    queryFn: () => QuotationService.getById(id),
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuotationDto) => QuotationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.quotations });
      showSuccess('Teklif talebi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Teklif talebi oluşturulamadı');
    },
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuotationDto }) =>
      QuotationService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.quotation(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.quotations });
      showSuccess('Teklif talebi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Teklif talebi güncellenemedi');
    },
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => QuotationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.quotations });
      showSuccess('Teklif talebi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Teklif talebi silinemedi');
    },
  });
}

export function useSubmitQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => QuotationService.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.quotation(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.quotations });
      showSuccess('Teklif talebi gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Teklif talebi gönderilemedi');
    },
  });
}

export function useSendQuotationToSuppliers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, supplierIds }: { id: string; supplierIds: string[] }) =>
      QuotationService.sendToSuppliers(id, supplierIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.quotation(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.quotations });
      showSuccess('Teklif talebi tedarikçilere gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Teklif talebi gönderilemedi');
    },
  });
}

export function useSelectQuotationSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, supplierId }: { id: string; supplierId: string }) =>
      QuotationService.selectSupplier(id, supplierId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.quotation(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.quotations });
      showSuccess('Tedarikçi seçildi');
    },
    onError: (error) => {
      showApiError(error, 'Tedarikçi seçilemedi');
    },
  });
}

export function useConvertQuotationToOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => QuotationService.convertToOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.quotation(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.quotations });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.orders });
      showSuccess('Satın alma siparişi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Sipariş oluşturulamadı');
    },
  });
}

export function useCancelQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      QuotationService.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.quotation(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.quotations });
      showInfo('Teklif talebi iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Teklif talebi iptal edilemedi');
    },
  });
}

// =====================================
// PRICE LIST HOOKS
// =====================================

export function usePriceLists(params?: PriceListQueryParams) {
  return useQuery({
    queryKey: [...purchaseKeys.priceLists, params],
    queryFn: () => PriceListService.getAll(params),
    staleTime: 30000,
  });
}

export function usePriceList(id: string) {
  return useQuery({
    queryKey: purchaseKeys.priceList(id),
    queryFn: () => PriceListService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePriceListDto) => PriceListService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.priceLists });
      showSuccess('Fiyat listesi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi oluşturulamadı');
    },
  });
}

export function useUpdatePriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePriceListDto }) =>
      PriceListService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.priceList(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.priceLists });
      showSuccess('Fiyat listesi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi güncellenemedi');
    },
  });
}

export function useDeletePriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PriceListService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.priceLists });
      showSuccess('Fiyat listesi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi silinemedi');
    },
  });
}

export function useActivatePriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PriceListService.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.priceList(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.priceLists });
      showSuccess('Fiyat listesi aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi aktifleştirilemedi');
    },
  });
}

export function useDeactivatePriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PriceListService.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.priceList(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.priceLists });
      showInfo('Fiyat listesi devre dışı bırakıldı');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi devre dışı bırakılamadı');
    },
  });
}

// =====================================
// PURCHASE BUDGET HOOKS
// =====================================

export function usePurchaseBudgets(params?: PurchaseBudgetQueryParams) {
  return useQuery({
    queryKey: [...purchaseKeys.budgets, params],
    queryFn: () => PurchaseBudgetService.getAll(params),
    staleTime: 30000,
  });
}

export function usePurchaseBudget(id: string) {
  return useQuery({
    queryKey: purchaseKeys.budget(id),
    queryFn: () => PurchaseBudgetService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePurchaseBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseBudgetDto) => PurchaseBudgetService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.budgets });
      showSuccess('Bütçe oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Bütçe oluşturulamadı');
    },
  });
}

export function useUpdatePurchaseBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePurchaseBudgetDto }) =>
      PurchaseBudgetService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.budget(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.budgets });
      showSuccess('Bütçe güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Bütçe güncellenemedi');
    },
  });
}

export function useDeletePurchaseBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseBudgetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.budgets });
      showSuccess('Bütçe silindi');
    },
    onError: (error) => {
      showApiError(error, 'Bütçe silinemedi');
    },
  });
}

export function useSubmitPurchaseBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseBudgetService.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.budget(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.budgets });
      showSuccess('Bütçe onaya gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Bütçe gönderilemedi');
    },
  });
}

export function useApprovePurchaseBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      PurchaseBudgetService.approve(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.budget(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.budgets });
      showSuccess('Bütçe onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Bütçe onaylanamadı');
    },
  });
}

export function useRejectPurchaseBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      PurchaseBudgetService.reject(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.budget(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.budgets });
      showInfo('Bütçe reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'Bütçe reddedilemedi');
    },
  });
}

export function useActivatePurchaseBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseBudgetService.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.budget(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.budgets });
      showSuccess('Bütçe aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Bütçe aktifleştirilemedi');
    },
  });
}

export function useFreezePurchaseBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      PurchaseBudgetService.freeze(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.budget(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.budgets });
      showInfo('Bütçe donduruldu');
    },
    onError: (error) => {
      showApiError(error, 'Bütçe dondurulamadı');
    },
  });
}

export function useClosePurchaseBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PurchaseBudgetService.close(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.budget(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.budgets });
      showInfo('Bütçe kapatıldı');
    },
    onError: (error) => {
      showApiError(error, 'Bütçe kapatılamadı');
    },
  });
}

// =====================================
// SUPPLIER EVALUATION HOOKS
// =====================================

export function useSupplierEvaluations(params?: SupplierEvaluationQueryParams) {
  return useQuery({
    queryKey: [...purchaseKeys.evaluations, params],
    queryFn: () => SupplierEvaluationService.getAll(params),
    staleTime: 30000,
  });
}

export function useSupplierEvaluation(id: string) {
  return useQuery({
    queryKey: purchaseKeys.evaluation(id),
    queryFn: () => SupplierEvaluationService.getById(id),
    enabled: !!id,
  });
}

export function useSupplierEvaluationHistory(supplierId: string) {
  return useQuery({
    queryKey: purchaseKeys.supplierEvaluationHistory(supplierId),
    queryFn: () => SupplierEvaluationService.getSupplierHistory(supplierId),
    enabled: !!supplierId,
  });
}

export function useSupplierRankings(params?: { categoryId?: string; period?: string }) {
  return useQuery({
    queryKey: [...purchaseKeys.evaluations, 'rankings', params],
    queryFn: () => SupplierEvaluationService.getSupplierRankings(params),
    staleTime: 60000,
  });
}

export function useCreateSupplierEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierEvaluationDto) => SupplierEvaluationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.evaluations });
      showSuccess('Değerlendirme oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Değerlendirme oluşturulamadı');
    },
  });
}

export function useUpdateSupplierEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierEvaluationDto }) =>
      SupplierEvaluationService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.evaluation(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.evaluations });
      showSuccess('Değerlendirme güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Değerlendirme güncellenemedi');
    },
  });
}

export function useDeleteSupplierEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SupplierEvaluationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.evaluations });
      showSuccess('Değerlendirme silindi');
    },
    onError: (error) => {
      showApiError(error, 'Değerlendirme silinemedi');
    },
  });
}

export function useSubmitSupplierEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SupplierEvaluationService.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.evaluation(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.evaluations });
      showSuccess('Değerlendirme onaya gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Değerlendirme gönderilemedi');
    },
  });
}

export function useApproveSupplierEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      SupplierEvaluationService.approve(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.evaluation(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.evaluations });
      showSuccess('Değerlendirme onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Değerlendirme onaylanamadı');
    },
  });
}

export function useRejectSupplierEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      SupplierEvaluationService.reject(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.evaluation(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.evaluations });
      showInfo('Değerlendirme reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'Değerlendirme reddedilemedi');
    },
  });
}

// =====================================
// APPROVAL WORKFLOW HOOKS
// =====================================

export function useApprovalWorkflows(params?: ApprovalWorkflowQueryParams) {
  return useQuery({
    queryKey: [...purchaseKeys.workflows, params],
    queryFn: () => ApprovalWorkflowService.getAll(params),
    staleTime: 30000,
  });
}

export function useApprovalWorkflow(id: string) {
  return useQuery({
    queryKey: purchaseKeys.workflow(id),
    queryFn: () => ApprovalWorkflowService.getById(id),
    enabled: !!id,
  });
}

export function useApplicableWorkflow(documentType: string, amount: number) {
  return useQuery({
    queryKey: [...purchaseKeys.workflows, 'applicable', documentType, amount],
    queryFn: () => ApprovalWorkflowService.getApplicableWorkflow(documentType, amount),
    enabled: !!documentType && amount > 0,
  });
}

export function useCreateApprovalWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApprovalWorkflowDto) => ApprovalWorkflowService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.workflows });
      showSuccess('Onay akışı oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Onay akışı oluşturulamadı');
    },
  });
}

export function useUpdateApprovalWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApprovalWorkflowDto }) =>
      ApprovalWorkflowService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.workflow(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.workflows });
      showSuccess('Onay akışı güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Onay akışı güncellenemedi');
    },
  });
}

export function useDeleteApprovalWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ApprovalWorkflowService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.workflows });
      showSuccess('Onay akışı silindi');
    },
    onError: (error) => {
      showApiError(error, 'Onay akışı silinemedi');
    },
  });
}

export function useActivateApprovalWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ApprovalWorkflowService.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.workflow(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.workflows });
      showSuccess('Onay akışı aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Onay akışı aktifleştirilemedi');
    },
  });
}

export function useDeactivateApprovalWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ApprovalWorkflowService.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.workflow(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.workflows });
      showInfo('Onay akışı devre dışı bırakıldı');
    },
    onError: (error) => {
      showApiError(error, 'Onay akışı devre dışı bırakılamadı');
    },
  });
}
