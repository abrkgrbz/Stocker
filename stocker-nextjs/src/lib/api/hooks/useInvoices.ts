/**
 * React Query Hooks for Invoice Module
 * Comprehensive hooks for invoice management with optimistic updates and cache management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { InvoiceService } from '../services/invoice.service';
import type {
  Invoice,
  InvoiceListItem,
  InvoiceStatistics,
  PagedResult,
  GetInvoicesParams,
  CreateInvoiceCommand,
  CreateInvoiceFromOrderCommand,
  UpdateInvoiceCommand,
  AddInvoiceItemCommand,
  RecordPaymentCommand,
  SetEInvoiceCommand,
} from '../services/invoice.service';
import { queryOptions } from '../query-options';

// =====================================
// QUERY KEYS
// =====================================

export const invoiceKeys = {
  invoices: ['sales', 'invoices'] as const,
  invoicesList: (params?: GetInvoicesParams) => ['sales', 'invoices', 'list', params] as const,
  invoice: (id: string) => ['sales', 'invoices', id] as const,
  invoiceByNumber: (number: string) => ['sales', 'invoices', 'by-number', number] as const,
  statistics: (from?: string, to?: string) => ['sales', 'invoices', 'statistics', from, to] as const,
};

// =====================================
// INVOICE QUERIES
// =====================================

/**
 * Hook to fetch paginated invoices
 */
export function useInvoices(params?: GetInvoicesParams) {
  return useQuery<PagedResult<InvoiceListItem>>({
    queryKey: invoiceKeys.invoicesList(params),
    queryFn: () => InvoiceService.getInvoices(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single invoice by ID
 */
export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: invoiceKeys.invoice(id),
    queryFn: () => InvoiceService.getInvoiceById(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch a single invoice by number
 */
export function useInvoiceByNumber(invoiceNumber: string) {
  return useQuery<Invoice>({
    queryKey: invoiceKeys.invoiceByNumber(invoiceNumber),
    queryFn: () => InvoiceService.getInvoiceByNumber(invoiceNumber),
    ...queryOptions.detail({ enabled: !!invoiceNumber }),
  });
}

/**
 * Hook to fetch invoice statistics
 */
export function useInvoiceStatistics(fromDate?: string, toDate?: string) {
  return useQuery<InvoiceStatistics>({
    queryKey: invoiceKeys.statistics(fromDate, toDate),
    queryFn: () => InvoiceService.getStatistics(fromDate, toDate),
    ...queryOptions.realtime(),
  });
}

// =====================================
// INVOICE MUTATIONS
// =====================================

/**
 * Hook to create a new invoice
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceCommand) => InvoiceService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoices });
      queryClient.invalidateQueries({ queryKey: ['sales', 'invoices', 'statistics'] });
    },
  });
}

/**
 * Hook to create an invoice from a sales order
 */
export function useCreateInvoiceFromOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceFromOrderCommand) => InvoiceService.createInvoiceFromOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoices });
      queryClient.invalidateQueries({ queryKey: ['sales', 'invoices', 'statistics'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'orders'] });
    },
  });
}

/**
 * Hook to update an invoice
 */
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<UpdateInvoiceCommand, 'id'> }) =>
      InvoiceService.updateInvoice(id, { ...data, id }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoices });
    },
  });
}

/**
 * Hook to add an item to an invoice
 */
export function useAddInvoiceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: Omit<AddInvoiceItemCommand, 'invoiceId'> }) =>
      InvoiceService.addItem(invoiceId, data),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoice(invoiceId) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoices });
    },
  });
}

/**
 * Hook to remove an item from an invoice
 */
export function useRemoveInvoiceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, itemId }: { invoiceId: string; itemId: string }) =>
      InvoiceService.removeItem(invoiceId, itemId),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoice(invoiceId) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoices });
    },
  });
}

/**
 * Hook to issue an invoice
 */
export function useIssueInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InvoiceService.issueInvoice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoices });
      queryClient.invalidateQueries({ queryKey: ['sales', 'invoices', 'statistics'] });
    },
  });
}

/**
 * Hook to send an invoice
 */
export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InvoiceService.sendInvoice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoices });
    },
  });
}

/**
 * Hook to record a payment for an invoice
 */
export function useRecordInvoicePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<RecordPaymentCommand, 'id'> }) =>
      InvoiceService.recordPayment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoices });
      queryClient.invalidateQueries({ queryKey: ['sales', 'invoices', 'statistics'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'payments'] });
    },
  });
}

/**
 * Hook to set e-invoice information
 */
export function useSetEInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<SetEInvoiceCommand, 'id'> }) =>
      InvoiceService.setEInvoice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoices });
    },
  });
}

/**
 * Hook to cancel an invoice
 */
export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InvoiceService.cancelInvoice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoices });
      queryClient.invalidateQueries({ queryKey: ['sales', 'invoices', 'statistics'] });
    },
  });
}

/**
 * Hook to delete an invoice
 */
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InvoiceService.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.invoices });
      queryClient.invalidateQueries({ queryKey: ['sales', 'invoices', 'statistics'] });
    },
  });
}
