/**
 * React Query Hooks for Sales Module
 * Comprehensive hooks for sales order management with optimistic updates and cache management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SalesService } from '../services/sales.service';
import { showSuccess, showError, showApiError } from '@/lib/utils/notifications';
import type {
  SalesOrder,
  SalesOrderListItem,
  SalesOrderStatistics,
  PagedResult,
  GetSalesOrdersParams,
  CreateSalesOrderCommand,
  UpdateSalesOrderCommand,
  AddSalesOrderItemCommand,
  // Quotations
  Quotation,
  QuotationListItem,
  QuotationStatistics,
  GetQuotationsParams,
  CreateQuotationDto,
  UpdateQuotationDto,
  CreateQuotationItemDto,
  // Discounts
  Discount,
  DiscountListItem,
  GetDiscountsParams,
  CreateDiscountDto,
  UpdateDiscountDto,
  ApplyDiscountDto,
  DiscountValidationResult,
  // Commissions
  CommissionPlan,
  CommissionPlanListItem,
  GetCommissionPlansParams,
  CreateCommissionPlanDto,
  UpdateCommissionPlanDto,
  CreateCommissionTierDto,
  SalesCommission,
  SalesCommissionListItem,
  GetSalesCommissionsParams,
  CommissionSummary,
  SalesPersonCommissionSummary,
  CalculateCommissionDto,
  // Sales Returns
  SalesReturn,
  SalesReturnListItem,
  SalesReturnSummary,
  GetSalesReturnsParams,
  CreateSalesReturnDto,
  UpdateSalesReturnDto,
  CreateSalesReturnItemDto,
  ProcessRefundDto,
  ReturnableItem,
} from '../services/sales.service';

// =====================================
// QUERY KEYS
// =====================================

export const salesKeys = {
  // Orders
  orders: ['sales', 'orders'] as const,
  ordersList: (params?: GetSalesOrdersParams) => ['sales', 'orders', 'list', params] as const,
  order: (id: string) => ['sales', 'orders', id] as const,
  ordersByCustomer: (customerId: string, page?: number, pageSize?: number) =>
    ['sales', 'orders', 'customer', customerId, page, pageSize] as const,
  statistics: (from?: string, to?: string) => ['sales', 'statistics', from, to] as const,

  // Quotations
  quotations: ['sales', 'quotations'] as const,
  quotationsList: (params?: GetQuotationsParams) => ['sales', 'quotations', 'list', params] as const,
  quotation: (id: string) => ['sales', 'quotations', id] as const,
  quotationsByCustomer: (customerId: string) => ['sales', 'quotations', 'customer', customerId] as const,
  quotationsBySalesPerson: (salesPersonId: string) => ['sales', 'quotations', 'salesperson', salesPersonId] as const,
  quotationsExpiring: (days?: number) => ['sales', 'quotations', 'expiring', days] as const,
  quotationRevisions: (id: string) => ['sales', 'quotations', id, 'revisions'] as const,
  quotationStatistics: (from?: string, to?: string) => ['sales', 'quotations', 'statistics', from, to] as const,

  // Discounts
  discounts: ['sales', 'discounts'] as const,
  discountsList: (params?: GetDiscountsParams) => ['sales', 'discounts', 'list', params] as const,
  discount: (id: string) => ['sales', 'discounts', id] as const,
  discountByCode: (code: string) => ['sales', 'discounts', 'code', code] as const,
  discountsActive: ['sales', 'discounts', 'active'] as const,

  // Commission Plans
  commissionPlans: ['sales', 'commissions', 'plans'] as const,
  commissionPlansList: (params?: GetCommissionPlansParams) => ['sales', 'commissions', 'plans', 'list', params] as const,
  commissionPlan: (id: string) => ['sales', 'commissions', 'plans', id] as const,
  commissionPlansActive: ['sales', 'commissions', 'plans', 'active'] as const,

  // Sales Commissions
  salesCommissions: ['sales', 'commissions'] as const,
  salesCommissionsList: (params?: GetSalesCommissionsParams) => ['sales', 'commissions', 'list', params] as const,
  salesCommission: (id: string) => ['sales', 'commissions', id] as const,
  salesCommissionsBySalesPerson: (salesPersonId: string) => ['sales', 'commissions', 'salesperson', salesPersonId] as const,
  salesCommissionsPending: ['sales', 'commissions', 'pending'] as const,
  salesCommissionsApproved: ['sales', 'commissions', 'approved'] as const,
  commissionSummary: (from?: string, to?: string) => ['sales', 'commissions', 'summary', from, to] as const,
  salesPersonCommissionSummary: (salesPersonId: string, from?: string, to?: string) =>
    ['sales', 'commissions', 'summary', 'salesperson', salesPersonId, from, to] as const,

  // Sales Returns
  salesReturns: ['sales', 'returns'] as const,
  salesReturnsList: (params?: GetSalesReturnsParams) => ['sales', 'returns', 'list', params] as const,
  salesReturn: (id: string) => ['sales', 'returns', id] as const,
  salesReturnsByOrder: (orderId: string) => ['sales', 'returns', 'order', orderId] as const,
  salesReturnsByCustomer: (customerId: string) => ['sales', 'returns', 'customer', customerId] as const,
  salesReturnsPending: ['sales', 'returns', 'pending'] as const,
  salesReturnSummary: (from?: string, to?: string) => ['sales', 'returns', 'summary', from, to] as const,
  returnableItems: (orderId: string) => ['sales', 'returns', 'returnable-items', orderId] as const,
};

// =====================================
// ORDER QUERIES
// =====================================

/**
 * Hook to fetch paginated sales orders
 */
export function useSalesOrders(params?: GetSalesOrdersParams) {
  return useQuery<PagedResult<SalesOrderListItem>>({
    queryKey: salesKeys.ordersList(params),
    queryFn: () => SalesService.getOrders(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single sales order by ID
 */
export function useSalesOrder(id: string) {
  return useQuery<SalesOrder>({
    queryKey: salesKeys.order(id),
    queryFn: () => SalesService.getOrderById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch sales order statistics
 */
export function useSalesStatistics(fromDate?: string, toDate?: string) {
  return useQuery<SalesOrderStatistics>({
    queryKey: salesKeys.statistics(fromDate, toDate),
    queryFn: () => SalesService.getStatistics(fromDate, toDate),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch sales orders by customer ID
 * Optimized for CRM Customer detail page Orders tab
 */
export function useSalesOrdersByCustomer(
  customerId: string,
  page: number = 1,
  pageSize: number = 10
) {
  return useQuery<PagedResult<SalesOrderListItem>>({
    queryKey: salesKeys.ordersByCustomer(customerId, page, pageSize),
    queryFn: () =>
      SalesService.getOrders({
        customerId,
        page,
        pageSize,
        sortBy: 'OrderDate',
        sortDescending: true,
      }),
    enabled: !!customerId,
    staleTime: 30 * 1000,
  });
}

// =====================================
// ORDER MUTATIONS
// =====================================

/**
 * Hook to create a new sales order
 */
export function useCreateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesOrderCommand) => SalesService.createOrder(data),
    onSuccess: () => {
      // Invalidate orders list to refetch
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
      queryClient.invalidateQueries({ queryKey: ['sales', 'statistics'] });
    },
  });
}

/**
 * Hook to update a sales order
 */
export function useUpdateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<UpdateSalesOrderCommand, 'id'> }) =>
      SalesService.updateOrder(id, { ...data, id }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.order(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
    },
  });
}

/**
 * Hook to add an item to a sales order
 */
export function useAddSalesOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: Omit<AddSalesOrderItemCommand, 'salesOrderId'> }) =>
      SalesService.addItem(orderId, data),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.order(orderId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
    },
  });
}

/**
 * Hook to remove an item from a sales order
 */
export function useRemoveSalesOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string }) =>
      SalesService.removeItem(orderId, itemId),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.order(orderId) });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
    },
  });
}

/**
 * Hook to approve a sales order
 */
export function useApproveSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.approveOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.order(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
      queryClient.invalidateQueries({ queryKey: ['sales', 'statistics'] });
    },
  });
}

/**
 * Hook to cancel a sales order
 */
export function useCancelSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      SalesService.cancelOrder(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.order(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
      queryClient.invalidateQueries({ queryKey: ['sales', 'statistics'] });
    },
  });
}

/**
 * Hook to delete a sales order
 */
export function useDeleteSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
      queryClient.invalidateQueries({ queryKey: ['sales', 'statistics'] });
    },
  });
}

/**
 * Hook to confirm a sales order
 */
export function useConfirmSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.confirmOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.order(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
      queryClient.invalidateQueries({ queryKey: ['sales', 'statistics'] });
    },
  });
}

/**
 * Hook to ship a sales order
 */
export function useShipSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.shipOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.order(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
      queryClient.invalidateQueries({ queryKey: ['sales', 'statistics'] });
    },
  });
}

/**
 * Hook to deliver a sales order
 */
export function useDeliverSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.deliverOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.order(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
      queryClient.invalidateQueries({ queryKey: ['sales', 'statistics'] });
    },
  });
}

/**
 * Hook to complete a sales order
 */
export function useCompleteSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.completeOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.order(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
      queryClient.invalidateQueries({ queryKey: ['sales', 'statistics'] });
    },
  });
}

// =====================================
// QUOTATION QUERIES
// =====================================

/**
 * Hook to fetch paginated quotations
 */
export function useQuotations(params?: GetQuotationsParams) {
  return useQuery<PagedResult<QuotationListItem>>({
    queryKey: salesKeys.quotationsList(params),
    queryFn: () => SalesService.getQuotations(params),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch a single quotation by ID
 */
export function useQuotation(id: string) {
  return useQuery<Quotation>({
    queryKey: salesKeys.quotation(id),
    queryFn: () => SalesService.getQuotationById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch quotations by customer
 */
export function useQuotationsByCustomer(customerId: string, page: number = 1, pageSize: number = 20) {
  return useQuery<PagedResult<QuotationListItem>>({
    queryKey: [...salesKeys.quotationsByCustomer(customerId), page, pageSize],
    queryFn: () => SalesService.getQuotationsByCustomer(customerId, page, pageSize),
    enabled: !!customerId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch quotations by sales person
 */
export function useQuotationsBySalesPerson(salesPersonId: string, page: number = 1, pageSize: number = 20) {
  return useQuery<PagedResult<QuotationListItem>>({
    queryKey: [...salesKeys.quotationsBySalesPerson(salesPersonId), page, pageSize],
    queryFn: () => SalesService.getQuotationsBySalesPerson(salesPersonId, page, pageSize),
    enabled: !!salesPersonId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch expiring quotations
 */
export function useExpiringQuotations(daysUntilExpiry: number = 7) {
  return useQuery<QuotationListItem[]>({
    queryKey: salesKeys.quotationsExpiring(daysUntilExpiry),
    queryFn: () => SalesService.getExpiringQuotations(daysUntilExpiry),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to fetch quotation revisions
 */
export function useQuotationRevisions(id: string) {
  return useQuery<QuotationListItem[]>({
    queryKey: salesKeys.quotationRevisions(id),
    queryFn: () => SalesService.getQuotationRevisions(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch quotation statistics
 */
export function useQuotationStatistics(fromDate?: string, toDate?: string) {
  return useQuery<QuotationStatistics>({
    queryKey: salesKeys.quotationStatistics(fromDate, toDate),
    queryFn: () => SalesService.getQuotationStatistics(fromDate, toDate),
    staleTime: 60 * 1000,
  });
}

// =====================================
// QUOTATION MUTATIONS
// =====================================

/**
 * Hook to create a new quotation
 */
export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuotationDto) => SalesService.createQuotation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations });
      queryClient.invalidateQueries({ queryKey: ['sales', 'quotations', 'statistics'] });
      showSuccess('Teklif oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Teklif oluşturulamadı');
    },
  });
}

/**
 * Hook to update a quotation
 */
export function useUpdateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuotationDto }) =>
      SalesService.updateQuotation(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.quotation(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations });
      showSuccess('Teklif güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Teklif güncellenemedi');
    },
  });
}

/**
 * Hook to add item to quotation
 */
export function useAddQuotationItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quotationId, item }: { quotationId: string; item: CreateQuotationItemDto }) =>
      SalesService.addQuotationItem(quotationId, item),
    onSuccess: (_, { quotationId }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.quotation(quotationId) });
      showSuccess('Kalem eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Kalem eklenemedi');
    },
  });
}

/**
 * Hook to remove item from quotation
 */
export function useRemoveQuotationItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quotationId, itemId }: { quotationId: string; itemId: string }) =>
      SalesService.removeQuotationItem(quotationId, itemId),
    onSuccess: (_, { quotationId }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.quotation(quotationId) });
      showSuccess('Kalem silindi');
    },
    onError: (error) => {
      showApiError(error, 'Kalem silinemedi');
    },
  });
}

/**
 * Hook to submit quotation for approval
 */
export function useSubmitQuotationForApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.submitQuotationForApproval(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.quotation(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations });
      showSuccess('Teklif onaya gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Teklif onaya gönderilemedi');
    },
  });
}

/**
 * Hook to approve a quotation
 */
export function useApproveQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.approveQuotation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.quotation(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations });
      showSuccess('Teklif onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Teklif onaylanamadı');
    },
  });
}

/**
 * Hook to send a quotation
 */
export function useSendQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.sendQuotation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.quotation(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations });
      showSuccess('Teklif gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Teklif gönderilemedi');
    },
  });
}

/**
 * Hook to accept a quotation
 */
export function useAcceptQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.acceptQuotation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.quotation(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations });
      showSuccess('Teklif kabul edildi');
    },
    onError: (error) => {
      showApiError(error, 'Teklif kabul edilemedi');
    },
  });
}

/**
 * Hook to reject a quotation
 */
export function useRejectQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      SalesService.rejectQuotation(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.quotation(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations });
      showSuccess('Teklif reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'Teklif reddedilemedi');
    },
  });
}

/**
 * Hook to cancel a quotation
 */
export function useCancelQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      SalesService.cancelQuotation(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.quotation(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations });
      showSuccess('Teklif iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Teklif iptal edilemedi');
    },
  });
}

/**
 * Hook to convert quotation to order
 */
export function useConvertQuotationToOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.convertQuotationToOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.quotation(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations });
      queryClient.invalidateQueries({ queryKey: salesKeys.orders });
      showSuccess('Teklif siparişe dönüştürüldü');
    },
    onError: (error) => {
      showApiError(error, 'Teklif siparişe dönüştürülemedi');
    },
  });
}

/**
 * Hook to create quotation revision
 */
export function useCreateQuotationRevision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.createQuotationRevision(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.quotation(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotationRevisions(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations });
      showSuccess('Teklif revizyonu oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Teklif revizyonu oluşturulamadı');
    },
  });
}

/**
 * Hook to delete a quotation
 */
export function useDeleteQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.quotations });
      showSuccess('Teklif silindi');
    },
    onError: (error) => {
      showApiError(error, 'Teklif silinemedi');
    },
  });
}

// =====================================
// DISCOUNT QUERIES
// =====================================

/**
 * Hook to fetch paginated discounts
 */
export function useDiscounts(params?: GetDiscountsParams) {
  return useQuery<PagedResult<DiscountListItem>>({
    queryKey: salesKeys.discountsList(params),
    queryFn: () => SalesService.getDiscounts(params),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch a single discount by ID
 */
export function useDiscount(id: string) {
  return useQuery<Discount>({
    queryKey: salesKeys.discount(id),
    queryFn: () => SalesService.getDiscountById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch discount by code
 */
export function useDiscountByCode(code: string) {
  return useQuery<Discount>({
    queryKey: salesKeys.discountByCode(code),
    queryFn: () => SalesService.getDiscountByCode(code),
    enabled: !!code,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch active discounts
 */
export function useActiveDiscounts() {
  return useQuery<DiscountListItem[]>({
    queryKey: salesKeys.discountsActive,
    queryFn: () => SalesService.getActiveDiscounts(),
    staleTime: 60 * 1000,
  });
}

// =====================================
// DISCOUNT MUTATIONS
// =====================================

/**
 * Hook to validate discount code
 */
export function useValidateDiscountCode() {
  return useMutation({
    mutationFn: (data: ApplyDiscountDto) => SalesService.validateDiscountCode(data),
  });
}

/**
 * Hook to create a new discount
 */
export function useCreateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiscountDto) => SalesService.createDiscount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.discounts });
      showSuccess('İndirim oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'İndirim oluşturulamadı');
    },
  });
}

/**
 * Hook to update a discount
 */
export function useUpdateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDiscountDto }) =>
      SalesService.updateDiscount(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.discount(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.discounts });
      showSuccess('İndirim güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'İndirim güncellenemedi');
    },
  });
}

/**
 * Hook to activate a discount
 */
export function useActivateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.activateDiscount(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.discount(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.discounts });
      queryClient.invalidateQueries({ queryKey: salesKeys.discountsActive });
      showSuccess('İndirim aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'İndirim aktifleştirilemedi');
    },
  });
}

/**
 * Hook to deactivate a discount
 */
export function useDeactivateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.deactivateDiscount(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.discount(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.discounts });
      queryClient.invalidateQueries({ queryKey: salesKeys.discountsActive });
      showSuccess('İndirim pasifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'İndirim pasifleştirilemedi');
    },
  });
}

/**
 * Hook to delete a discount
 */
export function useDeleteDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.deleteDiscount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.discounts });
      showSuccess('İndirim silindi');
    },
    onError: (error) => {
      showApiError(error, 'İndirim silinemedi');
    },
  });
}

// =====================================
// COMMISSION PLAN QUERIES
// =====================================

/**
 * Hook to fetch paginated commission plans
 */
export function useCommissionPlans(params?: GetCommissionPlansParams) {
  return useQuery<PagedResult<CommissionPlanListItem>>({
    queryKey: salesKeys.commissionPlansList(params),
    queryFn: () => SalesService.getCommissionPlans(params),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch a single commission plan by ID
 */
export function useCommissionPlan(id: string) {
  return useQuery<CommissionPlan>({
    queryKey: salesKeys.commissionPlan(id),
    queryFn: () => SalesService.getCommissionPlanById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch active commission plans
 */
export function useActiveCommissionPlans() {
  return useQuery<CommissionPlanListItem[]>({
    queryKey: salesKeys.commissionPlansActive,
    queryFn: () => SalesService.getActiveCommissionPlans(),
    staleTime: 60 * 1000,
  });
}

// =====================================
// COMMISSION PLAN MUTATIONS
// =====================================

/**
 * Hook to create a new commission plan
 */
export function useCreateCommissionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommissionPlanDto) => SalesService.createCommissionPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlans });
      showSuccess('Komisyon planı oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Komisyon planı oluşturulamadı');
    },
  });
}

/**
 * Hook to update a commission plan
 */
export function useUpdateCommissionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommissionPlanDto }) =>
      SalesService.updateCommissionPlan(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlan(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlans });
      showSuccess('Komisyon planı güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Komisyon planı güncellenemedi');
    },
  });
}

/**
 * Hook to add tier to commission plan
 */
export function useAddCommissionTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, tier }: { planId: string; tier: CreateCommissionTierDto }) =>
      SalesService.addCommissionTier(planId, tier),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlan(planId) });
      showSuccess('Komisyon kademesi eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Komisyon kademesi eklenemedi');
    },
  });
}

/**
 * Hook to remove tier from commission plan
 */
export function useRemoveCommissionTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, tierId }: { planId: string; tierId: string }) =>
      SalesService.removeCommissionTier(planId, tierId),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlan(planId) });
      showSuccess('Komisyon kademesi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Komisyon kademesi silinemedi');
    },
  });
}

/**
 * Hook to activate a commission plan
 */
export function useActivateCommissionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.activateCommissionPlan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlan(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlans });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlansActive });
      showSuccess('Komisyon planı aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Komisyon planı aktifleştirilemedi');
    },
  });
}

/**
 * Hook to deactivate a commission plan
 */
export function useDeactivateCommissionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.deactivateCommissionPlan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlan(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlans });
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlansActive });
      showSuccess('Komisyon planı pasifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Komisyon planı pasifleştirilemedi');
    },
  });
}

/**
 * Hook to delete a commission plan
 */
export function useDeleteCommissionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.deleteCommissionPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.commissionPlans });
      showSuccess('Komisyon planı silindi');
    },
    onError: (error) => {
      showApiError(error, 'Komisyon planı silinemedi');
    },
  });
}

// =====================================
// SALES COMMISSION QUERIES
// =====================================

/**
 * Hook to fetch paginated sales commissions
 */
export function useSalesCommissions(params?: GetSalesCommissionsParams) {
  return useQuery<PagedResult<SalesCommissionListItem>>({
    queryKey: salesKeys.salesCommissionsList(params),
    queryFn: () => SalesService.getSalesCommissions(params),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch a single sales commission by ID
 */
export function useSalesCommission(id: string) {
  return useQuery<SalesCommission>({
    queryKey: salesKeys.salesCommission(id),
    queryFn: () => SalesService.getSalesCommissionById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch commissions by sales person
 */
export function useCommissionsBySalesPerson(salesPersonId: string, fromDate?: string, toDate?: string) {
  return useQuery<SalesCommissionListItem[]>({
    queryKey: [...salesKeys.salesCommissionsBySalesPerson(salesPersonId), fromDate, toDate],
    queryFn: () => SalesService.getCommissionsBySalesPerson(salesPersonId, fromDate, toDate),
    enabled: !!salesPersonId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch pending commissions
 */
export function usePendingCommissions() {
  return useQuery<SalesCommissionListItem[]>({
    queryKey: salesKeys.salesCommissionsPending,
    queryFn: () => SalesService.getPendingCommissions(),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch approved commissions
 */
export function useApprovedCommissions() {
  return useQuery<SalesCommissionListItem[]>({
    queryKey: salesKeys.salesCommissionsApproved,
    queryFn: () => SalesService.getApprovedCommissions(),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch commission summary
 */
export function useCommissionSummary(fromDate?: string, toDate?: string) {
  return useQuery<CommissionSummary>({
    queryKey: salesKeys.commissionSummary(fromDate, toDate),
    queryFn: () => SalesService.getCommissionSummary(fromDate, toDate),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to fetch sales person commission summary
 */
export function useSalesPersonCommissionSummary(salesPersonId: string, fromDate?: string, toDate?: string) {
  return useQuery<SalesPersonCommissionSummary>({
    queryKey: salesKeys.salesPersonCommissionSummary(salesPersonId, fromDate, toDate),
    queryFn: () => SalesService.getSalesPersonCommissionSummary(salesPersonId, fromDate, toDate),
    enabled: !!salesPersonId,
    staleTime: 60 * 1000,
  });
}

// =====================================
// SALES COMMISSION MUTATIONS
// =====================================

/**
 * Hook to calculate commission
 */
export function useCalculateCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CalculateCommissionDto) => SalesService.calculateCommission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommissions });
      showSuccess('Komisyon hesaplandı');
    },
    onError: (error) => {
      showApiError(error, 'Komisyon hesaplanamadı');
    },
  });
}

/**
 * Hook to approve a commission
 */
export function useApproveCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.approveCommission(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommission(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommissions });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommissionsPending });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommissionsApproved });
      showSuccess('Komisyon onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Komisyon onaylanamadı');
    },
  });
}

/**
 * Hook to reject a commission
 */
export function useRejectCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      SalesService.rejectCommission(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommission(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommissions });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommissionsPending });
      showSuccess('Komisyon reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'Komisyon reddedilemedi');
    },
  });
}

/**
 * Hook to mark commission as paid
 */
export function useMarkCommissionAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentReference }: { id: string; paymentReference: string }) =>
      SalesService.markCommissionAsPaid(id, paymentReference),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommission(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommissions });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommissionsApproved });
      showSuccess('Komisyon ödendi olarak işaretlendi');
    },
    onError: (error) => {
      showApiError(error, 'Komisyon ödendi olarak işaretlenemedi');
    },
  });
}

/**
 * Hook to cancel a commission
 */
export function useCancelCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      SalesService.cancelCommission(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommission(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommissions });
      showSuccess('Komisyon iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Komisyon iptal edilemedi');
    },
  });
}

/**
 * Hook to bulk approve commissions
 */
export function useBulkApproveCommissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => SalesService.bulkApproveCommissions(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommissions });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommissionsPending });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommissionsApproved });
      showSuccess(`${result.approvedCount} komisyon onaylandı`);
    },
    onError: (error) => {
      showApiError(error, 'Komisyonlar toplu onaylanamadı');
    },
  });
}

/**
 * Hook to bulk mark commissions as paid
 */
export function useBulkMarkCommissionsAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, paymentReference }: { ids: string[]; paymentReference: string }) =>
      SalesService.bulkMarkCommissionsAsPaid(ids, paymentReference),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommissions });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesCommissionsApproved });
      showSuccess(`${result.paidCount} komisyon ödendi olarak işaretlendi`);
    },
    onError: (error) => {
      showApiError(error, 'Komisyonlar toplu ödendi işaretlenemedi');
    },
  });
}

// =====================================
// SALES RETURN QUERIES
// =====================================

/**
 * Hook to fetch paginated sales returns
 */
export function useSalesReturns(params?: GetSalesReturnsParams) {
  return useQuery<PagedResult<SalesReturnListItem>>({
    queryKey: salesKeys.salesReturnsList(params),
    queryFn: () => SalesService.getSalesReturns(params),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch a single sales return by ID
 */
export function useSalesReturn(id: string) {
  return useQuery<SalesReturn>({
    queryKey: salesKeys.salesReturn(id),
    queryFn: () => SalesService.getSalesReturnById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch sales returns by order
 */
export function useSalesReturnsByOrder(orderId: string) {
  return useQuery<SalesReturnListItem[]>({
    queryKey: salesKeys.salesReturnsByOrder(orderId),
    queryFn: () => SalesService.getSalesReturnsByOrder(orderId),
    enabled: !!orderId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch sales returns by customer
 */
export function useSalesReturnsByCustomer(customerId: string, page: number = 1, pageSize: number = 20) {
  return useQuery<PagedResult<SalesReturnListItem>>({
    queryKey: [...salesKeys.salesReturnsByCustomer(customerId), page, pageSize],
    queryFn: () => SalesService.getSalesReturnsByCustomer(customerId, page, pageSize),
    enabled: !!customerId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch pending returns
 */
export function usePendingReturns() {
  return useQuery<SalesReturnListItem[]>({
    queryKey: salesKeys.salesReturnsPending,
    queryFn: () => SalesService.getPendingReturns(),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch return summary
 */
export function useReturnSummary(fromDate?: string, toDate?: string) {
  return useQuery<SalesReturnSummary>({
    queryKey: salesKeys.salesReturnSummary(fromDate, toDate),
    queryFn: () => SalesService.getReturnSummary(fromDate, toDate),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to fetch returnable items for an order
 */
export function useReturnableItems(orderId: string) {
  return useQuery<ReturnableItem[]>({
    queryKey: salesKeys.returnableItems(orderId),
    queryFn: () => SalesService.getReturnableItems(orderId),
    enabled: !!orderId,
    staleTime: 30 * 1000,
  });
}

// =====================================
// SALES RETURN MUTATIONS
// =====================================

/**
 * Hook to create a new sales return
 */
export function useCreateSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesReturnDto) => SalesService.createSalesReturn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturns });
      showSuccess('İade talebi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'İade talebi oluşturulamadı');
    },
  });
}

/**
 * Hook to update a sales return
 */
export function useUpdateSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalesReturnDto }) =>
      SalesService.updateSalesReturn(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturn(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturns });
      showSuccess('İade talebi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'İade talebi güncellenemedi');
    },
  });
}

/**
 * Hook to add item to sales return
 */
export function useAddSalesReturnItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ returnId, item }: { returnId: string; item: CreateSalesReturnItemDto }) =>
      SalesService.addSalesReturnItem(returnId, item),
    onSuccess: (_, { returnId }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturn(returnId) });
      showSuccess('Ürün eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Ürün eklenemedi');
    },
  });
}

/**
 * Hook to remove item from sales return
 */
export function useRemoveSalesReturnItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ returnId, itemId }: { returnId: string; itemId: string }) =>
      SalesService.removeSalesReturnItem(returnId, itemId),
    onSuccess: (_, { returnId }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturn(returnId) });
      showSuccess('Ürün silindi');
    },
    onError: (error) => {
      showApiError(error, 'Ürün silinemedi');
    },
  });
}

/**
 * Hook to submit a sales return
 */
export function useSubmitSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.submitSalesReturn(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturn(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturns });
      showSuccess('İade talebi gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'İade talebi gönderilemedi');
    },
  });
}

/**
 * Hook to approve a sales return
 */
export function useApproveSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.approveSalesReturn(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturn(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturns });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturnsPending });
      showSuccess('İade talebi onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'İade talebi onaylanamadı');
    },
  });
}

/**
 * Hook to reject a sales return
 */
export function useRejectSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      SalesService.rejectSalesReturn(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturn(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturns });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturnsPending });
      showSuccess('İade talebi reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'İade talebi reddedilemedi');
    },
  });
}

/**
 * Hook to receive a sales return
 */
export function useReceiveSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.receiveSalesReturn(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturn(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturns });
      showSuccess('İade teslim alındı');
    },
    onError: (error) => {
      showApiError(error, 'İade teslim alınamadı');
    },
  });
}

/**
 * Hook to process refund
 */
export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProcessRefundDto }) =>
      SalesService.processRefund(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturn(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturns });
      showSuccess('İade işlendi');
    },
    onError: (error) => {
      showApiError(error, 'İade işlenemedi');
    },
  });
}

/**
 * Hook to complete a sales return
 */
export function useCompleteSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.completeSalesReturn(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturn(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturns });
      showSuccess('İade tamamlandı');
    },
    onError: (error) => {
      showApiError(error, 'İade tamamlanamadı');
    },
  });
}

/**
 * Hook to cancel a sales return
 */
export function useCancelSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      SalesService.cancelSalesReturn(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturn(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturns });
      showSuccess('İade iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'İade iptal edilemedi');
    },
  });
}

/**
 * Hook to mark item as restocked
 */
export function useMarkItemAsRestocked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ returnId, itemId }: { returnId: string; itemId: string }) =>
      SalesService.markItemAsRestocked(returnId, itemId),
    onSuccess: (_, { returnId }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturn(returnId) });
      showSuccess('Ürün stoğa eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Ürün stoğa eklenemedi');
    },
  });
}

/**
 * Hook to mark return as restocked
 */
export function useMarkReturnAsRestocked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.markReturnAsRestocked(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturn(id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturns });
      showSuccess('İade stoğa eklendi');
    },
    onError: (error) => {
      showApiError(error, 'İade stoğa eklenemedi');
    },
  });
}

/**
 * Hook to delete a sales return
 */
export function useDeleteSalesReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SalesService.deleteSalesReturn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.salesReturns });
      showSuccess('İade silindi');
    },
    onError: (error) => {
      showApiError(error, 'İade silinemedi');
    },
  });
}
