/**
 * React Query Hooks for Payment Module
 * Comprehensive hooks for payment management with optimistic updates and cache management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PaymentService } from '../services/payment.service';
import type {
  Payment,
  PaymentListItem,
  PaymentStatistics,
  PagedResult,
  GetPaymentsParams,
  CreatePaymentCommand,
  UpdatePaymentCommand,
} from '../services/payment.service';

// =====================================
// QUERY KEYS
// =====================================

export const paymentKeys = {
  payments: ['sales', 'payments'] as const,
  paymentsList: (params?: GetPaymentsParams) => ['sales', 'payments', 'list', params] as const,
  payment: (id: string) => ['sales', 'payments', id] as const,
  paymentByNumber: (number: string) => ['sales', 'payments', 'by-number', number] as const,
  paymentsByInvoice: (invoiceId: string) => ['sales', 'payments', 'by-invoice', invoiceId] as const,
  statistics: (from?: string, to?: string) => ['sales', 'payments', 'statistics', from, to] as const,
};

// =====================================
// PAYMENT QUERIES
// =====================================

/**
 * Hook to fetch paginated payments
 */
export function usePayments(params?: GetPaymentsParams) {
  return useQuery<PagedResult<PaymentListItem>>({
    queryKey: paymentKeys.paymentsList(params),
    queryFn: () => PaymentService.getPayments(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single payment by ID
 */
export function usePayment(id: string) {
  return useQuery<Payment>({
    queryKey: paymentKeys.payment(id),
    queryFn: () => PaymentService.getPaymentById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch a single payment by number
 */
export function usePaymentByNumber(paymentNumber: string) {
  return useQuery<Payment>({
    queryKey: paymentKeys.paymentByNumber(paymentNumber),
    queryFn: () => PaymentService.getPaymentByNumber(paymentNumber),
    enabled: !!paymentNumber,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch payments by invoice ID
 */
export function usePaymentsByInvoice(invoiceId: string) {
  return useQuery<Payment[]>({
    queryKey: paymentKeys.paymentsByInvoice(invoiceId),
    queryFn: () => PaymentService.getPaymentsByInvoice(invoiceId),
    enabled: !!invoiceId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch payment statistics
 */
export function usePaymentStatistics(fromDate?: string, toDate?: string) {
  return useQuery<PaymentStatistics>({
    queryKey: paymentKeys.statistics(fromDate, toDate),
    queryFn: () => PaymentService.getStatistics(fromDate, toDate),
    staleTime: 60 * 1000, // 1 minute
  });
}

// =====================================
// PAYMENT MUTATIONS
// =====================================

/**
 * Hook to create a new payment
 */
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentCommand) => PaymentService.createPayment(data),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.payments });
      queryClient.invalidateQueries({ queryKey: ['sales', 'payments', 'statistics'] });
      if (payment.invoiceId) {
        queryClient.invalidateQueries({ queryKey: ['sales', 'invoices', payment.invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['sales', 'invoices'] });
      }
    },
  });
}

/**
 * Hook to update a payment
 */
export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<UpdatePaymentCommand, 'id'> }) =>
      PaymentService.updatePayment(id, { ...data, id }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.payment(id) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.payments });
    },
  });
}

/**
 * Hook to confirm a payment
 */
export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PaymentService.confirmPayment(id),
    onSuccess: (payment, id) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.payment(id) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.payments });
      queryClient.invalidateQueries({ queryKey: ['sales', 'payments', 'statistics'] });
      if (payment.invoiceId) {
        queryClient.invalidateQueries({ queryKey: ['sales', 'invoices', payment.invoiceId] });
      }
    },
  });
}

/**
 * Hook to complete a payment
 */
export function useCompletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PaymentService.completePayment(id),
    onSuccess: (payment, id) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.payment(id) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.payments });
      queryClient.invalidateQueries({ queryKey: ['sales', 'payments', 'statistics'] });
      if (payment.invoiceId) {
        queryClient.invalidateQueries({ queryKey: ['sales', 'invoices', payment.invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['sales', 'invoices'] });
      }
    },
  });
}

/**
 * Hook to reject a payment
 */
export function useRejectPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      PaymentService.rejectPayment(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.payment(id) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.payments });
      queryClient.invalidateQueries({ queryKey: ['sales', 'payments', 'statistics'] });
    },
  });
}

/**
 * Hook to refund a payment
 */
export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason: string }) =>
      PaymentService.refundPayment(id, amount, reason),
    onSuccess: (payment, { id }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.payment(id) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.payments });
      queryClient.invalidateQueries({ queryKey: ['sales', 'payments', 'statistics'] });
      if (payment.invoiceId) {
        queryClient.invalidateQueries({ queryKey: ['sales', 'invoices', payment.invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['sales', 'invoices'] });
      }
    },
  });
}

/**
 * Hook to delete a payment
 */
export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PaymentService.deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.payments });
      queryClient.invalidateQueries({ queryKey: ['sales', 'payments', 'statistics'] });
    },
  });
}
