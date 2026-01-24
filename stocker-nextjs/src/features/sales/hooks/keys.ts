// =====================================
// SALES MODULE - QUERY KEY FACTORY
// TanStack Query v5 - Type-Safe Keys
// =====================================

import type {
  GetSalesOrdersParams,
  GetQuotationsParams,
  GetDiscountsParams,
  GetCommissionPlansParams,
  GetSalesCommissionsParams,
  GetSalesReturnsParams,
  CustomerContractQueryParams,
  SalesTerritoryQueryParams,
  ShipmentQueryParams,
  AdvancePaymentQueryParams,
  CreditNoteQueryParams,
  ServiceOrderQueryParams,
  WarrantyQueryParams,
  CustomerSegmentQueryParams,
  SalesTargetQueryParams,
  PriceListQueryParams,
  DeliveryNoteQueryParams,
  BackOrderQueryParams,
  OpportunityQueryParams,
  SalesPipelineQueryParams,
} from '../types';

/**
 * Centralized Query Key Factory for Sales Module
 *
 * This factory ensures:
 * - Type-safe query keys throughout the application
 * - Consistent cache invalidation patterns
 * - Hierarchical key structure for granular cache control
 *
 * Usage Examples:
 * - Invalidate all sales data: queryClient.invalidateQueries({ queryKey: salesKeys.all })
 * - Invalidate all orders: queryClient.invalidateQueries({ queryKey: salesKeys.orders.all() })
 * - Invalidate specific order: queryClient.invalidateQueries({ queryKey: salesKeys.orders.detail(id) })
 */
export const salesKeys = {
  // Root key for entire Sales module
  all: ['sales'] as const,

  // =====================================
  // SALES ORDERS
  // =====================================
  orders: {
    all: () => [...salesKeys.all, 'orders'] as const,
    lists: () => [...salesKeys.orders.all(), 'list'] as const,
    list: (params?: GetSalesOrdersParams) => [...salesKeys.orders.lists(), { ...params }] as const,
    details: () => [...salesKeys.orders.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.orders.details(), id] as const,
    statistics: (fromDate?: string, toDate?: string) =>
      [...salesKeys.orders.all(), 'statistics', { fromDate, toDate }] as const,
  },

  // =====================================
  // QUOTATIONS
  // =====================================
  quotations: {
    all: () => [...salesKeys.all, 'quotations'] as const,
    lists: () => [...salesKeys.quotations.all(), 'list'] as const,
    list: (params?: GetQuotationsParams) => [...salesKeys.quotations.lists(), { ...params }] as const,
    details: () => [...salesKeys.quotations.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.quotations.details(), id] as const,
    byCustomer: (customerId: string, page?: number, pageSize?: number) =>
      [...salesKeys.quotations.all(), 'customer', customerId, { page, pageSize }] as const,
    bySalesPerson: (salesPersonId: string, page?: number, pageSize?: number) =>
      [...salesKeys.quotations.all(), 'salesperson', salesPersonId, { page, pageSize }] as const,
    expiring: (daysUntilExpiry?: number) =>
      [...salesKeys.quotations.all(), 'expiring', { daysUntilExpiry }] as const,
    revisions: (id: string) => [...salesKeys.quotations.detail(id), 'revisions'] as const,
    statistics: (fromDate?: string, toDate?: string) =>
      [...salesKeys.quotations.all(), 'statistics', { fromDate, toDate }] as const,
  },

  // =====================================
  // DISCOUNTS
  // =====================================
  discounts: {
    all: () => [...salesKeys.all, 'discounts'] as const,
    lists: () => [...salesKeys.discounts.all(), 'list'] as const,
    list: (params?: GetDiscountsParams) => [...salesKeys.discounts.lists(), { ...params }] as const,
    details: () => [...salesKeys.discounts.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.discounts.details(), id] as const,
    byCode: (code: string) => [...salesKeys.discounts.all(), 'code', code] as const,
    active: () => [...salesKeys.discounts.all(), 'active'] as const,
  },

  // =====================================
  // COMMISSION PLANS
  // =====================================
  commissionPlans: {
    all: () => [...salesKeys.all, 'commission-plans'] as const,
    lists: () => [...salesKeys.commissionPlans.all(), 'list'] as const,
    list: (params?: GetCommissionPlansParams) => [...salesKeys.commissionPlans.lists(), { ...params }] as const,
    details: () => [...salesKeys.commissionPlans.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.commissionPlans.details(), id] as const,
    active: () => [...salesKeys.commissionPlans.all(), 'active'] as const,
  },

  // =====================================
  // SALES COMMISSIONS
  // =====================================
  commissions: {
    all: () => [...salesKeys.all, 'commissions'] as const,
    lists: () => [...salesKeys.commissions.all(), 'list'] as const,
    list: (params?: GetSalesCommissionsParams) => [...salesKeys.commissions.lists(), { ...params }] as const,
    details: () => [...salesKeys.commissions.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.commissions.details(), id] as const,
    bySalesPerson: (salesPersonId: string, fromDate?: string, toDate?: string) =>
      [...salesKeys.commissions.all(), 'salesperson', salesPersonId, { fromDate, toDate }] as const,
    pending: () => [...salesKeys.commissions.all(), 'pending'] as const,
    approved: () => [...salesKeys.commissions.all(), 'approved'] as const,
    summary: (fromDate?: string, toDate?: string) =>
      [...salesKeys.commissions.all(), 'summary', { fromDate, toDate }] as const,
    salesPersonSummary: (salesPersonId: string, fromDate?: string, toDate?: string) =>
      [...salesKeys.commissions.all(), 'summary', 'salesperson', salesPersonId, { fromDate, toDate }] as const,
  },

  // =====================================
  // SALES RETURNS
  // =====================================
  returns: {
    all: () => [...salesKeys.all, 'returns'] as const,
    lists: () => [...salesKeys.returns.all(), 'list'] as const,
    list: (params?: GetSalesReturnsParams) => [...salesKeys.returns.lists(), { ...params }] as const,
    details: () => [...salesKeys.returns.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.returns.details(), id] as const,
    byOrder: (orderId: string) => [...salesKeys.returns.all(), 'order', orderId] as const,
    byCustomer: (customerId: string, page?: number, pageSize?: number) =>
      [...salesKeys.returns.all(), 'customer', customerId, { page, pageSize }] as const,
    pending: () => [...salesKeys.returns.all(), 'pending'] as const,
    summary: (fromDate?: string, toDate?: string) =>
      [...salesKeys.returns.all(), 'summary', { fromDate, toDate }] as const,
    returnableItems: (orderId: string) =>
      [...salesKeys.returns.all(), 'returnable-items', orderId] as const,
  },

  // =====================================
  // CUSTOMER CONTRACTS
  // =====================================
  contracts: {
    all: () => [...salesKeys.all, 'contracts'] as const,
    lists: () => [...salesKeys.contracts.all(), 'list'] as const,
    list: (params?: CustomerContractQueryParams) => [...salesKeys.contracts.lists(), { ...params }] as const,
    details: () => [...salesKeys.contracts.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.contracts.details(), id] as const,
    byNumber: (contractNumber: string) => [...salesKeys.contracts.all(), 'number', contractNumber] as const,
    byCustomer: (customerId: string) => [...salesKeys.contracts.all(), 'customer', customerId] as const,
    activeByCustomer: (customerId: string) =>
      [...salesKeys.contracts.all(), 'customer', customerId, 'active'] as const,
  },

  // =====================================
  // SALES TERRITORIES
  // =====================================
  territories: {
    all: () => [...salesKeys.all, 'territories'] as const,
    lists: () => [...salesKeys.territories.all(), 'list'] as const,
    list: (params?: SalesTerritoryQueryParams) => [...salesKeys.territories.lists(), { ...params }] as const,
    details: () => [...salesKeys.territories.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.territories.details(), id] as const,
    byCode: (code: string) => [...salesKeys.territories.all(), 'code', code] as const,
    children: (parentId: string) => [...salesKeys.territories.all(), 'children', parentId] as const,
    roots: () => [...salesKeys.territories.all(), 'roots'] as const,
  },

  // =====================================
  // SHIPMENTS
  // =====================================
  shipments: {
    all: () => [...salesKeys.all, 'shipments'] as const,
    lists: () => [...salesKeys.shipments.all(), 'list'] as const,
    list: (params?: ShipmentQueryParams) => [...salesKeys.shipments.lists(), { ...params }] as const,
    details: () => [...salesKeys.shipments.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.shipments.details(), id] as const,
    byNumber: (shipmentNumber: string) => [...salesKeys.shipments.all(), 'number', shipmentNumber] as const,
    byOrder: (orderId: string) => [...salesKeys.shipments.all(), 'order', orderId] as const,
    byCustomer: (customerId: string) => [...salesKeys.shipments.all(), 'customer', customerId] as const,
    pending: () => [...salesKeys.shipments.all(), 'pending'] as const,
    inTransit: () => [...salesKeys.shipments.all(), 'in-transit'] as const,
    overdue: () => [...salesKeys.shipments.all(), 'overdue'] as const,
  },

  // =====================================
  // ADVANCE PAYMENTS
  // =====================================
  advancePayments: {
    all: () => [...salesKeys.all, 'advance-payments'] as const,
    lists: () => [...salesKeys.advancePayments.all(), 'list'] as const,
    list: (params?: AdvancePaymentQueryParams) => [...salesKeys.advancePayments.lists(), { ...params }] as const,
    details: () => [...salesKeys.advancePayments.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.advancePayments.details(), id] as const,
    byCustomer: (customerId: string) => [...salesKeys.advancePayments.all(), 'customer', customerId] as const,
    statistics: () => [...salesKeys.advancePayments.all(), 'statistics'] as const,
  },

  // =====================================
  // CREDIT NOTES
  // =====================================
  creditNotes: {
    all: () => [...salesKeys.all, 'credit-notes'] as const,
    lists: () => [...salesKeys.creditNotes.all(), 'list'] as const,
    list: (params?: CreditNoteQueryParams) => [...salesKeys.creditNotes.lists(), { ...params }] as const,
    details: () => [...salesKeys.creditNotes.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.creditNotes.details(), id] as const,
    byCustomer: (customerId: string) => [...salesKeys.creditNotes.all(), 'customer', customerId] as const,
    statistics: () => [...salesKeys.creditNotes.all(), 'statistics'] as const,
  },

  // =====================================
  // SERVICE ORDERS
  // =====================================
  serviceOrders: {
    all: () => [...salesKeys.all, 'service-orders'] as const,
    lists: () => [...salesKeys.serviceOrders.all(), 'list'] as const,
    list: (params?: ServiceOrderQueryParams) => [...salesKeys.serviceOrders.lists(), { ...params }] as const,
    details: () => [...salesKeys.serviceOrders.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.serviceOrders.details(), id] as const,
    byCustomer: (customerId: string) => [...salesKeys.serviceOrders.all(), 'customer', customerId] as const,
    statistics: () => [...salesKeys.serviceOrders.all(), 'statistics'] as const,
  },

  // =====================================
  // WARRANTIES
  // =====================================
  warranties: {
    all: () => [...salesKeys.all, 'warranties'] as const,
    lists: () => [...salesKeys.warranties.all(), 'list'] as const,
    list: (params?: WarrantyQueryParams) => [...salesKeys.warranties.lists(), { ...params }] as const,
    details: () => [...salesKeys.warranties.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.warranties.details(), id] as const,
    byNumber: (warrantyNumber: string) => [...salesKeys.warranties.all(), 'number', warrantyNumber] as const,
    byCustomer: (customerId: string) => [...salesKeys.warranties.all(), 'customer', customerId] as const,
    byProduct: (productId: string) => [...salesKeys.warranties.all(), 'product', productId] as const,
    bySerial: (serialNumber: string) => [...salesKeys.warranties.all(), 'serial', serialNumber] as const,
    statistics: () => [...salesKeys.warranties.all(), 'statistics'] as const,
    lookup: (serialNumber: string) => [...salesKeys.warranties.all(), 'lookup', serialNumber] as const,
  },

  // =====================================
  // CUSTOMER SEGMENTS
  // =====================================
  segments: {
    all: () => [...salesKeys.all, 'segments'] as const,
    lists: () => [...salesKeys.segments.all(), 'list'] as const,
    list: (params?: CustomerSegmentQueryParams) => [...salesKeys.segments.lists(), { ...params }] as const,
    details: () => [...salesKeys.segments.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.segments.details(), id] as const,
    byCode: (code: string) => [...salesKeys.segments.all(), 'code', code] as const,
    active: () => [...salesKeys.segments.all(), 'active'] as const,
    statistics: () => [...salesKeys.segments.all(), 'statistics'] as const,
    customers: (id: string) => [...salesKeys.segments.detail(id), 'customers'] as const,
  },

  // =====================================
  // SALES TARGETS
  // =====================================
  targets: {
    all: () => [...salesKeys.all, 'targets'] as const,
    lists: () => [...salesKeys.targets.all(), 'list'] as const,
    list: (params?: SalesTargetQueryParams) => [...salesKeys.targets.lists(), { ...params }] as const,
    details: () => [...salesKeys.targets.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.targets.details(), id] as const,
    bySalesRep: (salesRepId: string) => [...salesKeys.targets.all(), 'sales-rep', salesRepId] as const,
    byTeam: (teamId: string) => [...salesKeys.targets.all(), 'team', teamId] as const,
    current: () => [...salesKeys.targets.all(), 'current'] as const,
    my: () => [...salesKeys.targets.all(), 'my'] as const,
    statistics: () => [...salesKeys.targets.all(), 'statistics'] as const,
    leaderboard: (period?: string, limit?: number) =>
      [...salesKeys.targets.all(), 'leaderboard', { period, limit }] as const,
  },

  // =====================================
  // PRICE LISTS
  // =====================================
  priceLists: {
    all: () => [...salesKeys.all, 'price-lists'] as const,
    lists: () => [...salesKeys.priceLists.all(), 'list'] as const,
    list: (params?: PriceListQueryParams) => [...salesKeys.priceLists.lists(), { ...params }] as const,
    details: () => [...salesKeys.priceLists.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.priceLists.details(), id] as const,
    byCode: (code: string) => [...salesKeys.priceLists.all(), 'code', code] as const,
    active: () => [...salesKeys.priceLists.all(), 'active'] as const,
  },

  // =====================================
  // DELIVERY NOTES
  // =====================================
  deliveryNotes: {
    all: () => [...salesKeys.all, 'delivery-notes'] as const,
    lists: () => [...salesKeys.deliveryNotes.all(), 'list'] as const,
    list: (params?: DeliveryNoteQueryParams) => [...salesKeys.deliveryNotes.lists(), { ...params }] as const,
    details: () => [...salesKeys.deliveryNotes.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.deliveryNotes.details(), id] as const,
    byNumber: (number: string) => [...salesKeys.deliveryNotes.all(), 'number', number] as const,
    byOrder: (orderId: string) => [...salesKeys.deliveryNotes.all(), 'order', orderId] as const,
  },

  // =====================================
  // BACK ORDERS
  // =====================================
  backOrders: {
    all: () => [...salesKeys.all, 'back-orders'] as const,
    lists: () => [...salesKeys.backOrders.all(), 'list'] as const,
    list: (params?: BackOrderQueryParams) => [...salesKeys.backOrders.lists(), { ...params }] as const,
    details: () => [...salesKeys.backOrders.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.backOrders.details(), id] as const,
    byOrder: (orderId: string) => [...salesKeys.backOrders.all(), 'order', orderId] as const,
    byCustomer: (customerId: string) => [...salesKeys.backOrders.all(), 'customer', customerId] as const,
    critical: () => [...salesKeys.backOrders.all(), 'critical'] as const,
  },

  // =====================================
  // OPPORTUNITIES
  // =====================================
  opportunities: {
    all: () => [...salesKeys.all, 'opportunities'] as const,
    lists: () => [...salesKeys.opportunities.all(), 'list'] as const,
    list: (params?: OpportunityQueryParams) => [...salesKeys.opportunities.lists(), { ...params }] as const,
    details: () => [...salesKeys.opportunities.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.opportunities.details(), id] as const,
    byPipeline: (pipelineId: string) => [...salesKeys.opportunities.all(), 'pipeline', pipelineId] as const,
    byCustomer: (customerId: string) => [...salesKeys.opportunities.all(), 'customer', customerId] as const,
    won: () => [...salesKeys.opportunities.all(), 'won'] as const,
  },

  // =====================================
  // SALES PIPELINES
  // =====================================
  pipelines: {
    all: () => [...salesKeys.all, 'pipelines'] as const,
    lists: () => [...salesKeys.pipelines.all(), 'list'] as const,
    list: (params?: SalesPipelineQueryParams) => [...salesKeys.pipelines.lists(), { ...params }] as const,
    details: () => [...salesKeys.pipelines.all(), 'detail'] as const,
    detail: (id: string) => [...salesKeys.pipelines.details(), id] as const,
    active: () => [...salesKeys.pipelines.all(), 'active'] as const,
  },
} as const;

// Type exports for use in components and tests
export type SalesQueryKeys = typeof salesKeys;
