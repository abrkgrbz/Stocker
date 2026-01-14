/**
 * React Query Hooks for Finance Module
 * Comprehensive hooks for all Finance endpoints with optimistic updates and cache management
 * Optimized with centralized query options to prevent 429 errors
 *
 * Turkish Context: Cari Hesap, KDV, Tevkifat, Stopaj, TRY base currency
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FinanceService } from '../services/finance.service';
import { showSuccess, showError, showApiError } from '@/lib/utils/notifications';
import { queryOptions } from '../query-options';
import type {
  // Common
  Guid,
  DateTime,
  PaginatedResponse,
  // Invoices
  InvoiceDto,
  InvoiceSummaryDto,
  InvoiceFilterDto,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  // Current Accounts
  CurrentAccountDto,
  CurrentAccountSummaryDto,
  CurrentAccountFilterDto,
  CurrentAccountTransactionDto,
  CurrentAccountStatementDto,
  CreateCurrentAccountDto,
  UpdateCurrentAccountDto,
  // Expenses
  ExpenseDto,
  ExpenseSummaryDto,
  ExpenseFilterDto,
  CreateExpenseDto,
  UpdateExpenseDto,
  // Payments
  PaymentDto,
  PaymentSummaryDto,
  PaymentFilterDto,
  CreatePaymentDto,
  ReceivePaymentDto,
  MakePaymentDto,
  // Bank Accounts
  BankAccountDto,
  BankAccountSummaryDto,
  BankAccountFilterDto,
  CreateBankAccountDto,
  UpdateBankAccountDto,
  // Bank Transactions
  BankTransactionDto,
  BankTransactionFilterDto,
  CreateBankTransactionDto,
  // Cheques
  ChequeDto,
  ChequeSummaryDto,
  ChequeFilterDto,
  CreateChequeDto,
  UpdateChequeStatusDto,
  // Promissory Notes
  PromissoryNoteDto,
  PromissoryNoteFilterDto,
  CreatePromissoryNoteDto,
  // Loans
  LoanDto,
  LoanInstallmentDto,
  LoanFilterDto,
  CreateLoanDto,
  // Fixed Assets
  FixedAssetDto,
  FixedAssetFilterDto,
  CreateFixedAssetDto,
  // Budgets
  BudgetDto,
  BudgetFilterDto,
  CreateBudgetDto,
  // Cost Centers
  CostCenterDto,
  CostCenterFilterDto,
  CreateCostCenterDto,
  // Accounting Periods
  AccountingPeriodDto,
  AccountingPeriodFilterDto,
  CreateAccountingPeriodDto,
  // Exchange Rates
  ExchangeRateDto,
  ExchangeRateSummaryDto,
  ExchangeRateFilterDto,
  CreateExchangeRateDto,
  CurrencyConversionRequestDto,
  CurrencyConversionResultDto,
  CurrencyDto,
  // Statistics
  FinanceDashboardStatsDto,
  CashFlowReportDto,
  AgingReportDto,
  // Ba-Bs Forms
  BaBsFormDto,
  BaBsFormSummaryDto,
  BaBsFormFilterDto,
  CreateBaBsFormDto,
  UpdateBaBsFormDto,
  ApproveBaBsFormDto,
  FileBaBsFormDto,
  BaBsGibResultDto,
  CreateBaBsCorrectionDto,
  CancelBaBsFormDto,
  BaBsValidationResultDto,
  BaBsFormStatsDto,
  GenerateBaBsFromInvoicesDto,
  BaBsFormStatus,
  // Tax Declarations
  TaxDeclarationDto,
  TaxDeclarationSummaryDto,
  TaxDeclarationFilterDto,
  CreateTaxDeclarationDto,
  ApproveTaxDeclarationDto,
  FileTaxDeclarationDto,
  TaxDeclarationGibResultDto,
  RecordTaxPaymentDto,
  CreateTaxAmendmentDto,
  CancelTaxDeclarationDto,
  TaxDeclarationStatsDto,
  TaxCalendarItemDto,
  TaxDeclarationStatus,
  // VAT & Withholding Reports
  VatReportDto,
  WithholdingReportDto,
  // e-Invoice (GİB)
  EInvoiceDto,
  EInvoiceSummaryDto,
  EInvoiceFilterDto,
  EInvoiceStatsDto,
  EInvoiceGibStatus,
  EInvoiceType,
  EInvoiceDirection,
  SendEInvoiceDto,
  EInvoiceResponseDto,
  GibSettingsDto,
  UpdateGibSettingsDto,
} from '../services/finance.types';

// =====================================
// QUERY KEYS
// =====================================

export const financeKeys = {
  // Invoices
  invoices: ['finance', 'invoices'] as const,
  invoice: (id: number) => ['finance', 'invoices', id] as const,
  invoicesOverdue: ['finance', 'invoices', 'overdue'] as const,
  invoicesByCustomer: (customerId: Guid) => ['finance', 'invoices', 'customer', customerId] as const,

  // Current Accounts (Cari Hesap)
  currentAccounts: ['finance', 'current-accounts'] as const,
  currentAccount: (id: number) => ['finance', 'current-accounts', id] as const,
  currentAccountByCustomer: (customerId: Guid) => ['finance', 'current-accounts', 'customer', customerId] as const,
  currentAccountTransactions: (id: number) => ['finance', 'current-accounts', id, 'transactions'] as const,
  currentAccountStatement: (id: number, start: DateTime, end: DateTime) =>
    ['finance', 'current-accounts', id, 'statement', start, end] as const,

  // Expenses
  expenses: ['finance', 'expenses'] as const,
  expense: (id: number) => ['finance', 'expenses', id] as const,
  expensesByCategory: (start: DateTime, end: DateTime) => ['finance', 'expenses', 'by-category', start, end] as const,

  // Payments
  payments: ['finance', 'payments'] as const,
  payment: (id: number) => ['finance', 'payments', id] as const,
  paymentsByCurrentAccount: (id: number) => ['finance', 'payments', 'current-account', id] as const,

  // Bank Accounts
  bankAccounts: ['finance', 'bank-accounts'] as const,
  bankAccount: (id: number) => ['finance', 'bank-accounts', id] as const,
  bankAccountBalance: (id: number) => ['finance', 'bank-accounts', id, 'balance'] as const,
  bankAccountTransactions: (id: number) => ['finance', 'bank-accounts', id, 'transactions'] as const,
  totalBankBalances: ['finance', 'bank-accounts', 'total-balances'] as const,

  // Bank Transactions
  bankTransactions: ['finance', 'bank-transactions'] as const,

  // Cheques
  cheques: ['finance', 'cheques'] as const,
  cheque: (id: number) => ['finance', 'cheques', id] as const,
  chequesDue: (start: DateTime, end: DateTime) => ['finance', 'cheques', 'due', start, end] as const,

  // Promissory Notes
  promissoryNotes: ['finance', 'promissory-notes'] as const,
  promissoryNote: (id: number) => ['finance', 'promissory-notes', id] as const,

  // Loans
  loans: ['finance', 'loans'] as const,
  loan: (id: number) => ['finance', 'loans', id] as const,
  loanInstallments: (id: number) => ['finance', 'loans', id, 'installments'] as const,
  loanEarlyPayoff: (id: number) => ['finance', 'loans', id, 'early-payoff'] as const,

  // Fixed Assets
  fixedAssets: ['finance', 'fixed-assets'] as const,
  fixedAsset: (id: number) => ['finance', 'fixed-assets', id] as const,
  fixedAssetDepreciation: (id: number) => ['finance', 'fixed-assets', id, 'depreciation'] as const,

  // Budgets
  budgets: ['finance', 'budgets'] as const,
  budget: (id: number) => ['finance', 'budgets', id] as const,
  budgetVsActual: (id: number) => ['finance', 'budgets', id, 'vs-actual'] as const,

  // Cost Centers
  costCenters: ['finance', 'cost-centers'] as const,
  costCenter: (id: number) => ['finance', 'cost-centers', id] as const,
  costCenterHierarchy: ['finance', 'cost-centers', 'hierarchy'] as const,

  // Accounting Periods
  accountingPeriods: ['finance', 'accounting-periods'] as const,
  accountingPeriod: (id: number) => ['finance', 'accounting-periods', id] as const,
  currentAccountingPeriod: ['finance', 'accounting-periods', 'current'] as const,

  // Exchange Rates
  exchangeRates: ['finance', 'exchange-rates'] as const,
  exchangeRate: (id: number) => ['finance', 'exchange-rates', id] as const,
  exchangeRateForDate: (source: string, target: string, date?: DateTime) =>
    ['finance', 'exchange-rates', 'for-date', source, target, date] as const,
  currencies: ['finance', 'currencies'] as const,
  activeCurrencies: ['finance', 'currencies', 'active'] as const,

  // Statistics & Reports
  dashboardStats: (start?: DateTime, end?: DateTime) => ['finance', 'stats', 'dashboard', start, end] as const,
  cashFlowReport: (start: DateTime, end: DateTime) => ['finance', 'reports', 'cash-flow', start, end] as const,
  receivablesAging: ['finance', 'reports', 'aging', 'receivables'] as const,
  payablesAging: ['finance', 'reports', 'aging', 'payables'] as const,
  revenueVsExpenses: (start: DateTime, end: DateTime) => ['finance', 'reports', 'revenue-vs-expenses', start, end] as const,

  // Ba-Bs Forms (GİB)
  babsForms: ['finance', 'babs-forms'] as const,
  babsForm: (id: number) => ['finance', 'babs-forms', id] as const,

  // Tax Declarations (Vergi Beyannameleri)
  taxDeclarations: ['finance', 'tax-declarations'] as const,
  taxDeclaration: (id: number) => ['finance', 'tax-declarations', id] as const,

  // VAT & Withholding Reports
  vatReport: (year: number, month: number) => ['finance', 'reports', 'vat', year, month] as const,
  withholdingReport: (year: number, month: number) => ['finance', 'reports', 'withholding', year, month] as const,

  // e-Invoice (GİB)
  eInvoices: ['finance', 'e-invoices'] as const,
  eInvoice: (id: number) => ['finance', 'e-invoices', id] as const,
  eInvoiceStats: (year: number, month: number) => ['finance', 'e-invoices', 'stats', year, month] as const,
  gibSettings: ['finance', 'gib-settings'] as const,
};

// =====================================
// INVOICES HOOKS - Faturalar
// =====================================

export function useInvoices(filters?: InvoiceFilterDto) {
  return useQuery<PaginatedResponse<InvoiceSummaryDto>>({
    queryKey: [...financeKeys.invoices, filters],
    queryFn: () => FinanceService.getInvoices(filters),
    ...queryOptions.list(),
  });
}

export function useInvoice(id: number) {
  return useQuery<InvoiceDto>({
    queryKey: financeKeys.invoice(id),
    queryFn: () => FinanceService.getInvoice(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useOverdueInvoices() {
  return useQuery<InvoiceSummaryDto[]>({
    queryKey: financeKeys.invoicesOverdue,
    queryFn: () => FinanceService.getOverdueInvoices(),
    ...queryOptions.list(),
  });
}

export function useInvoicesByCustomer(customerId: Guid) {
  return useQuery<InvoiceSummaryDto[]>({
    queryKey: financeKeys.invoicesByCustomer(customerId),
    queryFn: () => FinanceService.getInvoicesByCustomer(customerId),
    ...queryOptions.list({ enabled: !!customerId }),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceDto) => FinanceService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.invoices });
      showSuccess('Fatura oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Fatura oluşturulamadı');
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInvoiceDto }) =>
      FinanceService.updateInvoice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.invoice(variables.id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.invoices });
      showSuccess('Fatura güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Fatura güncellenemedi');
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.invoices });
      showSuccess('Fatura silindi');
    },
    onError: (error) => {
      showApiError(error, 'Fatura silinemedi');
    },
  });
}

export function useApproveInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.approveInvoice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.invoices });
      showSuccess('Fatura onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Fatura onaylanamadı');
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.sendInvoice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.invoices });
      showSuccess('Fatura gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Fatura gönderilemedi');
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      FinanceService.cancelInvoice(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.invoices });
      showSuccess('Fatura iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Fatura iptal edilemedi');
    },
  });
}

export function useMarkInvoiceAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentDate }: { id: number; paymentDate?: DateTime }) =>
      FinanceService.markInvoiceAsPaid(id, paymentDate),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.invoices });
      queryClient.invalidateQueries({ queryKey: financeKeys.invoicesOverdue });
      showSuccess('Fatura ödendi olarak işaretlendi');
    },
    onError: (error) => {
      showApiError(error, 'Fatura durumu güncellenemedi');
    },
  });
}

// =====================================
// CURRENT ACCOUNTS HOOKS - Cari Hesaplar
// =====================================

export function useCurrentAccounts(filters?: CurrentAccountFilterDto) {
  return useQuery<PaginatedResponse<CurrentAccountSummaryDto>>({
    queryKey: [...financeKeys.currentAccounts, filters],
    queryFn: () => FinanceService.getCurrentAccounts(filters),
    ...queryOptions.list(),
  });
}

export function useCurrentAccount(id: number) {
  return useQuery<CurrentAccountDto>({
    queryKey: financeKeys.currentAccount(id),
    queryFn: () => FinanceService.getCurrentAccount(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCurrentAccountByCustomer(customerId: Guid) {
  return useQuery<CurrentAccountDto>({
    queryKey: financeKeys.currentAccountByCustomer(customerId),
    queryFn: () => FinanceService.getCurrentAccountByCustomer(customerId),
    ...queryOptions.detail({ enabled: !!customerId }),
  });
}

export function useCurrentAccountTransactions(id: number, startDate?: DateTime, endDate?: DateTime) {
  return useQuery<CurrentAccountTransactionDto[]>({
    queryKey: [...financeKeys.currentAccountTransactions(id), startDate, endDate],
    queryFn: () => FinanceService.getCurrentAccountTransactions(id, startDate, endDate),
    ...queryOptions.list({ enabled: !!id }),
  });
}

export function useCurrentAccountStatement(id: number, startDate: DateTime, endDate: DateTime) {
  return useQuery<CurrentAccountStatementDto>({
    queryKey: financeKeys.currentAccountStatement(id, startDate, endDate),
    queryFn: () => FinanceService.getCurrentAccountStatement(id, startDate, endDate),
    ...queryOptions.detail({ enabled: !!id && !!startDate && !!endDate }),
  });
}

export function useCreateCurrentAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCurrentAccountDto) => FinanceService.createCurrentAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.currentAccounts });
      showSuccess('Cari hesap oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Cari hesap oluşturulamadı');
    },
  });
}

export function useUpdateCurrentAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCurrentAccountDto }) =>
      FinanceService.updateCurrentAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.currentAccount(variables.id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.currentAccounts });
      showSuccess('Cari hesap güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Cari hesap güncellenemedi');
    },
  });
}

export function useDeleteCurrentAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.deleteCurrentAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.currentAccounts });
      showSuccess('Cari hesap silindi');
    },
    onError: (error) => {
      showApiError(error, 'Cari hesap silinemedi');
    },
  });
}

export function useBlockCurrentAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      FinanceService.blockCurrentAccount(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.currentAccount(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.currentAccounts });
      showSuccess('Cari hesap bloke edildi');
    },
    onError: (error) => {
      showApiError(error, 'Cari hesap bloke edilemedi');
    },
  });
}

export function useUnblockCurrentAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.unblockCurrentAccount(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.currentAccount(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.currentAccounts });
      showSuccess('Cari hesap blokesi kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'Cari hesap blokesi kaldırılamadı');
    },
  });
}

export function useUpdateCreditLimit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, creditLimit }: { id: number; creditLimit: number }) =>
      FinanceService.updateCreditLimit(id, creditLimit),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.currentAccount(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.currentAccounts });
      showSuccess('Kredi limiti güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Kredi limiti güncellenemedi');
    },
  });
}

// =====================================
// EXPENSES HOOKS - Giderler
// =====================================

export function useExpenses(filters?: ExpenseFilterDto) {
  return useQuery<PaginatedResponse<ExpenseSummaryDto>>({
    queryKey: [...financeKeys.expenses, filters],
    queryFn: () => FinanceService.getExpenses(filters),
    ...queryOptions.list(),
  });
}

export function useExpense(id: number) {
  return useQuery<ExpenseDto>({
    queryKey: financeKeys.expense(id),
    queryFn: () => FinanceService.getExpense(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useExpensesByCategory(startDate: DateTime, endDate: DateTime) {
  return useQuery<{ category: string; total: number }[]>({
    queryKey: financeKeys.expensesByCategory(startDate, endDate),
    queryFn: () => FinanceService.getExpensesByCategory(startDate, endDate),
    ...queryOptions.list({ enabled: !!startDate && !!endDate }),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseDto) => FinanceService.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses });
      showSuccess('Gider oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Gider oluşturulamadı');
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExpenseDto }) =>
      FinanceService.updateExpense(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expense(variables.id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses });
      showSuccess('Gider güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Gider güncellenemedi');
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses });
      showSuccess('Gider silindi');
    },
    onError: (error) => {
      showApiError(error, 'Gider silinemedi');
    },
  });
}

export function useApproveExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.approveExpense(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expense(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses });
      showSuccess('Gider onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Gider onaylanamadı');
    },
  });
}

export function useRejectExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      FinanceService.rejectExpense(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expense(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses });
      showSuccess('Gider reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'Gider reddedilemedi');
    },
  });
}

export function useMarkExpenseAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentDate }: { id: number; paymentDate?: DateTime }) =>
      FinanceService.markExpenseAsPaid(id, paymentDate),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expense(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses });
      showSuccess('Gider ödendi olarak işaretlendi');
    },
    onError: (error) => {
      showApiError(error, 'Gider durumu güncellenemedi');
    },
  });
}

// =====================================
// PAYMENTS HOOKS - Ödemeler
// =====================================

export function usePayments(filters?: PaymentFilterDto) {
  return useQuery<PaginatedResponse<PaymentSummaryDto>>({
    queryKey: [...financeKeys.payments, filters],
    queryFn: () => FinanceService.getPayments(filters),
    ...queryOptions.list(),
  });
}

export function usePayment(id: number) {
  return useQuery<PaymentDto>({
    queryKey: financeKeys.payment(id),
    queryFn: () => FinanceService.getPayment(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function usePaymentsByCurrentAccount(currentAccountId: number) {
  return useQuery<PaymentSummaryDto[]>({
    queryKey: financeKeys.paymentsByCurrentAccount(currentAccountId),
    queryFn: () => FinanceService.getPaymentsByCurrentAccount(currentAccountId),
    ...queryOptions.list({ enabled: !!currentAccountId }),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentDto) => FinanceService.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.payments });
      queryClient.invalidateQueries({ queryKey: financeKeys.currentAccounts });
      showSuccess('Ödeme oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Ödeme oluşturulamadı');
    },
  });
}

export function useReceivePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReceivePaymentDto) => FinanceService.receivePayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.payments });
      queryClient.invalidateQueries({ queryKey: financeKeys.currentAccounts });
      queryClient.invalidateQueries({ queryKey: financeKeys.invoices });
      showSuccess('Tahsilat kaydedildi');
    },
    onError: (error) => {
      showApiError(error, 'Tahsilat kaydedilemedi');
    },
  });
}

// Alias for backward compatibility
export const useRecordInvoicePayment = useReceivePayment;

export function useMakePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MakePaymentDto) => FinanceService.makePayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.payments });
      queryClient.invalidateQueries({ queryKey: financeKeys.currentAccounts });
      queryClient.invalidateQueries({ queryKey: financeKeys.invoices });
      showSuccess('Ödeme kaydedildi');
    },
    onError: (error) => {
      showApiError(error, 'Ödeme kaydedilemedi');
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.payments });
      queryClient.invalidateQueries({ queryKey: financeKeys.currentAccounts });
      showSuccess('Ödeme silindi');
    },
    onError: (error) => {
      showApiError(error, 'Ödeme silinemedi');
    },
  });
}

// =====================================
// BANK ACCOUNTS HOOKS - Banka Hesapları
// =====================================

export function useBankAccounts(filters?: BankAccountFilterDto) {
  return useQuery<PaginatedResponse<BankAccountSummaryDto>>({
    queryKey: [...financeKeys.bankAccounts, filters],
    queryFn: () => FinanceService.getBankAccounts(filters),
    ...queryOptions.list(),
  });
}

export function useBankAccount(id: number) {
  return useQuery<BankAccountDto>({
    queryKey: financeKeys.bankAccount(id),
    queryFn: () => FinanceService.getBankAccount(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useBankAccountBalance(id: number) {
  return useQuery<{ currentBalance: number; availableBalance: number }>({
    queryKey: financeKeys.bankAccountBalance(id),
    queryFn: () => FinanceService.getBankAccountBalance(id),
    ...queryOptions.realtime({ enabled: !!id }),
  });
}

export function useTotalBankBalances() {
  return useQuery<{ currency: string; balance: number }[]>({
    queryKey: financeKeys.totalBankBalances,
    queryFn: () => FinanceService.getTotalBankBalances(),
    ...queryOptions.realtime(),
  });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBankAccountDto) => FinanceService.createBankAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.bankAccounts });
      showSuccess('Banka hesabı oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Banka hesabı oluşturulamadı');
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBankAccountDto }) =>
      FinanceService.updateBankAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.bankAccount(variables.id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.bankAccounts });
      showSuccess('Banka hesabı güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Banka hesabı güncellenemedi');
    },
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.deleteBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.bankAccounts });
      showSuccess('Banka hesabı silindi');
    },
    onError: (error) => {
      showApiError(error, 'Banka hesabı silinemedi');
    },
  });
}

export function useSetDefaultBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.setDefaultBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.bankAccounts });
      showSuccess('Varsayılan banka hesabı ayarlandı');
    },
    onError: (error) => {
      showApiError(error, 'Varsayılan banka hesabı ayarlanamadı');
    },
  });
}

// =====================================
// BANK TRANSACTIONS HOOKS
// =====================================

export function useBankTransactions(filters?: BankTransactionFilterDto) {
  return useQuery<PaginatedResponse<BankTransactionDto>>({
    queryKey: [...financeKeys.bankTransactions, filters],
    queryFn: () => FinanceService.getBankTransactions(filters),
    ...queryOptions.list(),
  });
}

export function useBankAccountTransactions(bankAccountId: number, filters?: BankTransactionFilterDto) {
  return useQuery<PaginatedResponse<BankTransactionDto>>({
    queryKey: [...financeKeys.bankAccountTransactions(bankAccountId), filters],
    queryFn: () => FinanceService.getBankAccountTransactions(bankAccountId, filters),
    ...queryOptions.list({ enabled: !!bankAccountId }),
  });
}

export function useCreateBankTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBankTransactionDto) => FinanceService.createBankTransaction(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.bankTransactions });
      queryClient.invalidateQueries({ queryKey: financeKeys.bankAccountTransactions(data.bankAccountId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.bankAccountBalance(data.bankAccountId) });
      showSuccess('Banka hareketi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Banka hareketi oluşturulamadı');
    },
  });
}

export function useReconcileBankTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.reconcileBankTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.bankTransactions });
      showSuccess('Banka hareketi mutabakat edildi');
    },
    onError: (error) => {
      showApiError(error, 'Mutabakat yapılamadı');
    },
  });
}

// =====================================
// CHEQUES HOOKS - Çekler
// =====================================

export function useCheques(filters?: ChequeFilterDto) {
  return useQuery<PaginatedResponse<ChequeSummaryDto>>({
    queryKey: [...financeKeys.cheques, filters],
    queryFn: () => FinanceService.getCheques(filters),
    ...queryOptions.list(),
  });
}

export function useCheque(id: number) {
  return useQuery<ChequeDto>({
    queryKey: financeKeys.cheque(id),
    queryFn: () => FinanceService.getCheque(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useChequesDue(startDate: DateTime, endDate: DateTime) {
  return useQuery<ChequeSummaryDto[]>({
    queryKey: financeKeys.chequesDue(startDate, endDate),
    queryFn: () => FinanceService.getChequesDueInPeriod(startDate, endDate),
    ...queryOptions.list({ enabled: !!startDate && !!endDate }),
  });
}

export function useCreateCheque() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChequeDto) => FinanceService.createCheque(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.cheques });
      showSuccess('Çek oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Çek oluşturulamadı');
    },
  });
}

export function useUpdateChequeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateChequeStatusDto }) =>
      FinanceService.updateChequeStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.cheque(variables.id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.cheques });
      showSuccess('Çek durumu güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Çek durumu güncellenemedi');
    },
  });
}

export function useDeleteCheque() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.deleteCheque(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.cheques });
      showSuccess('Çek silindi');
    },
    onError: (error) => {
      showApiError(error, 'Çek silinemedi');
    },
  });
}

export function useDepositCheque() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, bankAccountId }: { id: number; bankAccountId: number }) =>
      FinanceService.depositCheque(id, bankAccountId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.cheque(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.cheques });
      queryClient.invalidateQueries({ queryKey: financeKeys.bankAccounts });
      showSuccess('Çek bankaya yatırıldı');
    },
    onError: (error) => {
      showApiError(error, 'Çek yatırılamadı');
    },
  });
}

export function useEndorseCheque() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, endorsedTo }: { id: number; endorsedTo: string }) =>
      FinanceService.endorseCheque(id, endorsedTo),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.cheque(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.cheques });
      showSuccess('Çek ciro edildi');
    },
    onError: (error) => {
      showApiError(error, 'Çek ciro edilemedi');
    },
  });
}

// =====================================
// PROMISSORY NOTES HOOKS - Senetler
// =====================================

export function usePromissoryNotes(filters?: PromissoryNoteFilterDto) {
  return useQuery<PaginatedResponse<PromissoryNoteDto>>({
    queryKey: [...financeKeys.promissoryNotes, filters],
    queryFn: () => FinanceService.getPromissoryNotes(filters),
    ...queryOptions.list(),
  });
}

export function usePromissoryNote(id: number) {
  return useQuery<PromissoryNoteDto>({
    queryKey: financeKeys.promissoryNote(id),
    queryFn: () => FinanceService.getPromissoryNote(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreatePromissoryNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromissoryNoteDto) => FinanceService.createPromissoryNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.promissoryNotes });
      showSuccess('Senet oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Senet oluşturulamadı');
    },
  });
}

export function useDeletePromissoryNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.deletePromissoryNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.promissoryNotes });
      showSuccess('Senet silindi');
    },
    onError: (error) => {
      showApiError(error, 'Senet silinemedi');
    },
  });
}

export function useCollectPromissoryNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, collectionDate }: { id: number; collectionDate: DateTime }) =>
      FinanceService.collectPromissoryNote(id, collectionDate),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.promissoryNote(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.promissoryNotes });
      showSuccess('Senet tahsil edildi');
    },
    onError: (error) => {
      showApiError(error, 'Senet tahsil edilemedi');
    },
  });
}

export function useProtestPromissoryNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      FinanceService.protestPromissoryNote(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.promissoryNote(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.promissoryNotes });
      showSuccess('Senet protesto edildi');
    },
    onError: (error) => {
      showApiError(error, 'Senet protesto edilemedi');
    },
  });
}

export function useEndorsePromissoryNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, endorsedTo }: { id: number; endorsedTo: string }) =>
      FinanceService.endorsePromissoryNote(id, endorsedTo),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.promissoryNote(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.promissoryNotes });
      showSuccess('Senet ciro edildi');
    },
    onError: (error) => {
      showApiError(error, 'Senet ciro edilemedi');
    },
  });
}

// =====================================
// LOANS HOOKS - Krediler
// =====================================

export function useLoans(filters?: LoanFilterDto) {
  return useQuery<PaginatedResponse<LoanDto>>({
    queryKey: [...financeKeys.loans, filters],
    queryFn: () => FinanceService.getLoans(filters),
    ...queryOptions.list(),
  });
}

export function useLoan(id: number) {
  return useQuery<LoanDto>({
    queryKey: financeKeys.loan(id),
    queryFn: () => FinanceService.getLoan(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useLoanInstallments(id: number) {
  return useQuery<LoanInstallmentDto[]>({
    queryKey: financeKeys.loanInstallments(id),
    queryFn: () => FinanceService.getLoanInstallments(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useLoanEarlyPayoff(id: number) {
  return useQuery<{ amount: number; penalty: number; total: number }>({
    queryKey: financeKeys.loanEarlyPayoff(id),
    queryFn: () => FinanceService.calculateEarlyPayoff(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLoanDto) => FinanceService.createLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.loans });
      showSuccess('Kredi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Kredi oluşturulamadı');
    },
  });
}

export function useDeleteLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.deleteLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.loans });
      showSuccess('Kredi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Kredi silinemedi');
    },
  });
}

export function usePayLoanInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, installmentId, amount, paymentDate }: {
      loanId: number;
      installmentId: number;
      amount: number;
      paymentDate: DateTime;
    }) => FinanceService.payLoanInstallment(loanId, installmentId, amount, paymentDate),
    onSuccess: (_, { loanId }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.loan(loanId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.loanInstallments(loanId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.loans });
      showSuccess('Taksit ödendi');
    },
    onError: (error) => {
      showApiError(error, 'Taksit ödenemedi');
    },
  });
}

// =====================================
// FIXED ASSETS HOOKS - Sabit Kıymetler
// =====================================

export function useFixedAssets(filters?: FixedAssetFilterDto) {
  return useQuery<PaginatedResponse<FixedAssetDto>>({
    queryKey: [...financeKeys.fixedAssets, filters],
    queryFn: () => FinanceService.getFixedAssets(filters),
    ...queryOptions.list(),
  });
}

export function useFixedAsset(id: number) {
  return useQuery<FixedAssetDto>({
    queryKey: financeKeys.fixedAsset(id),
    queryFn: () => FinanceService.getFixedAsset(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useFixedAssetDepreciation(id: number) {
  return useQuery<{ monthly: number; accumulated: number; bookValue: number }>({
    queryKey: financeKeys.fixedAssetDepreciation(id),
    queryFn: () => FinanceService.calculateDepreciation(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateFixedAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFixedAssetDto) => FinanceService.createFixedAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.fixedAssets });
      showSuccess('Sabit kıymet oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Sabit kıymet oluşturulamadı');
    },
  });
}

export function useDeleteFixedAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.deleteFixedAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.fixedAssets });
      showSuccess('Sabit kıymet silindi');
    },
    onError: (error) => {
      showApiError(error, 'Sabit kıymet silinemedi');
    },
  });
}

export function useDisposeFixedAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, disposalDate, disposalValue, reason }: {
      id: number;
      disposalDate: DateTime;
      disposalValue: number;
      reason: string;
    }) => FinanceService.disposeFixedAsset(id, disposalDate, disposalValue, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.fixedAsset(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.fixedAssets });
      showSuccess('Sabit kıymet elden çıkarıldı');
    },
    onError: (error) => {
      showApiError(error, 'Sabit kıymet elden çıkarılamadı');
    },
  });
}

export function useRunDepreciation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ month, year }: { month: number; year: number }) =>
      FinanceService.runDepreciation(month, year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.fixedAssets });
      showSuccess('Amortisman hesaplandı');
    },
    onError: (error) => {
      showApiError(error, 'Amortisman hesaplanamadı');
    },
  });
}

// =====================================
// BUDGETS HOOKS - Bütçeler
// =====================================

export function useBudgets(filters?: BudgetFilterDto) {
  return useQuery<PaginatedResponse<BudgetDto>>({
    queryKey: [...financeKeys.budgets, filters],
    queryFn: () => FinanceService.getBudgets(filters),
    ...queryOptions.list(),
  });
}

export function useBudget(id: number) {
  return useQuery<BudgetDto>({
    queryKey: financeKeys.budget(id),
    queryFn: () => FinanceService.getBudget(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useBudgetVsActual(id: number) {
  return useQuery<BudgetDto>({
    queryKey: financeKeys.budgetVsActual(id),
    queryFn: () => FinanceService.getBudgetVsActual(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetDto) => FinanceService.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.budgets });
      showSuccess('Bütçe oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Bütçe oluşturulamadı');
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.budgets });
      showSuccess('Bütçe silindi');
    },
    onError: (error) => {
      showApiError(error, 'Bütçe silinemedi');
    },
  });
}

export function useApproveBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.approveBudget(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.budget(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.budgets });
      showSuccess('Bütçe onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Bütçe onaylanamadı');
    },
  });
}

export function useActivateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.activateBudget(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.budget(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.budgets });
      showSuccess('Bütçe aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Bütçe aktifleştirilemedi');
    },
  });
}

export function useCloseBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.closeBudget(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.budget(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.budgets });
      showSuccess('Bütçe kapatıldı');
    },
    onError: (error) => {
      showApiError(error, 'Bütçe kapatılamadı');
    },
  });
}

// =====================================
// COST CENTERS HOOKS - Maliyet Merkezleri
// =====================================

export function useCostCenters(filters?: CostCenterFilterDto) {
  return useQuery<PaginatedResponse<CostCenterDto>>({
    queryKey: [...financeKeys.costCenters, filters],
    queryFn: () => FinanceService.getCostCenters(filters),
    ...queryOptions.list(),
  });
}

export function useCostCenter(id: number) {
  return useQuery<CostCenterDto>({
    queryKey: financeKeys.costCenter(id),
    queryFn: () => FinanceService.getCostCenter(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCostCenterHierarchy() {
  return useQuery<CostCenterDto[]>({
    queryKey: financeKeys.costCenterHierarchy,
    queryFn: () => FinanceService.getCostCenterHierarchy(),
    ...queryOptions.static(),
  });
}

export function useCreateCostCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCostCenterDto) => FinanceService.createCostCenter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.costCenters });
      queryClient.invalidateQueries({ queryKey: financeKeys.costCenterHierarchy });
      showSuccess('Maliyet merkezi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Maliyet merkezi oluşturulamadı');
    },
  });
}

export function useDeleteCostCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.deleteCostCenter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.costCenters });
      queryClient.invalidateQueries({ queryKey: financeKeys.costCenterHierarchy });
      showSuccess('Maliyet merkezi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Maliyet merkezi silinemedi');
    },
  });
}

// =====================================
// ACCOUNTING PERIODS HOOKS - Muhasebe Dönemleri
// =====================================

export function useAccountingPeriods(filters?: AccountingPeriodFilterDto) {
  return useQuery<PaginatedResponse<AccountingPeriodDto>>({
    queryKey: [...financeKeys.accountingPeriods, filters],
    queryFn: () => FinanceService.getAccountingPeriods(filters),
    ...queryOptions.list(),
  });
}

export function useAccountingPeriod(id: number) {
  return useQuery<AccountingPeriodDto>({
    queryKey: financeKeys.accountingPeriod(id),
    queryFn: () => FinanceService.getAccountingPeriod(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCurrentAccountingPeriod() {
  return useQuery<AccountingPeriodDto>({
    queryKey: financeKeys.currentAccountingPeriod,
    queryFn: () => FinanceService.getCurrentAccountingPeriod(),
    ...queryOptions.static(),
  });
}

export function useCreateAccountingPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountingPeriodDto) => FinanceService.createAccountingPeriod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.accountingPeriods });
      showSuccess('Muhasebe dönemi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Muhasebe dönemi oluşturulamadı');
    },
  });
}

export function useSoftCloseAccountingPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.softCloseAccountingPeriod(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.accountingPeriod(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.accountingPeriods });
      showSuccess('Dönem geçici olarak kapatıldı');
    },
    onError: (error) => {
      showApiError(error, 'Dönem kapatılamadı');
    },
  });
}

export function useHardCloseAccountingPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.hardCloseAccountingPeriod(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.accountingPeriod(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.accountingPeriods });
      showSuccess('Dönem kesin olarak kapatıldı');
    },
    onError: (error) => {
      showApiError(error, 'Dönem kapatılamadı');
    },
  });
}

export function useReopenAccountingPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.reopenAccountingPeriod(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.accountingPeriod(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.accountingPeriods });
      showSuccess('Dönem yeniden açıldı');
    },
    onError: (error) => {
      showApiError(error, 'Dönem açılamadı');
    },
  });
}

export function useLockAccountingPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.lockAccountingPeriod(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.accountingPeriod(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.accountingPeriods });
      showSuccess('Dönem kilitlendi');
    },
    onError: (error) => {
      showApiError(error, 'Dönem kilitlenemedi');
    },
  });
}

export function useUnlockAccountingPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.unlockAccountingPeriod(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.accountingPeriod(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.accountingPeriods });
      showSuccess('Dönem kilidi açıldı');
    },
    onError: (error) => {
      showApiError(error, 'Dönem kilidi açılamadı');
    },
  });
}

// =====================================
// EXCHANGE RATES HOOKS - Döviz Kurları
// =====================================

export function useExchangeRates(filters?: ExchangeRateFilterDto) {
  return useQuery<PaginatedResponse<ExchangeRateSummaryDto>>({
    queryKey: [...financeKeys.exchangeRates, filters],
    queryFn: () => FinanceService.getExchangeRates(filters),
    ...queryOptions.list(),
  });
}

export function useExchangeRate(id: number) {
  return useQuery<ExchangeRateDto>({
    queryKey: financeKeys.exchangeRate(id),
    queryFn: () => FinanceService.getExchangeRate(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useExchangeRateForDate(sourceCurrency: string, targetCurrency: string, date?: DateTime) {
  return useQuery<ExchangeRateDto>({
    queryKey: financeKeys.exchangeRateForDate(sourceCurrency, targetCurrency, date),
    queryFn: () => FinanceService.getExchangeRateForDate(sourceCurrency, targetCurrency, date),
    ...queryOptions.detail({ enabled: !!sourceCurrency && !!targetCurrency }),
  });
}

export function useCurrencies() {
  return useQuery<CurrencyDto[]>({
    queryKey: financeKeys.currencies,
    queryFn: () => FinanceService.getCurrencies(),
    ...queryOptions.static(),
  });
}

export function useActiveCurrencies() {
  return useQuery<CurrencyDto[]>({
    queryKey: financeKeys.activeCurrencies,
    queryFn: () => FinanceService.getActiveCurrencies(),
    ...queryOptions.static(),
  });
}

export function useCreateExchangeRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExchangeRateDto) => FinanceService.createExchangeRate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.exchangeRates });
      showSuccess('Döviz kuru oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Döviz kuru oluşturulamadı');
    },
  });
}

export function useDeleteExchangeRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.deleteExchangeRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.exchangeRates });
      showSuccess('Döviz kuru silindi');
    },
    onError: (error) => {
      showApiError(error, 'Döviz kuru silinemedi');
    },
  });
}

export function useFetchTcmbRates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (date?: DateTime) => FinanceService.fetchTcmbRates(date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.exchangeRates });
      showSuccess('TCMB kurları alındı');
    },
    onError: (error) => {
      showApiError(error, 'TCMB kurları alınamadı');
    },
  });
}

export function useConvertCurrency() {
  return useMutation({
    mutationFn: (data: CurrencyConversionRequestDto) => FinanceService.convertCurrency(data),
    onError: (error) => {
      showApiError(error, 'Para birimi dönüştürülemedi');
    },
  });
}

// =====================================
// STATISTICS & REPORTS HOOKS
// =====================================

export function useFinanceDashboardStats(startDate?: DateTime, endDate?: DateTime) {
  return useQuery<FinanceDashboardStatsDto>({
    queryKey: financeKeys.dashboardStats(startDate, endDate),
    queryFn: () => FinanceService.getDashboardStats(startDate, endDate),
    ...queryOptions.realtime(),
  });
}

// Alias for backward compatibility
export const useFinanceDashboard = useFinanceDashboardStats;

export function useCashFlowReport(startDate: DateTime, endDate: DateTime) {
  return useQuery<CashFlowReportDto>({
    queryKey: financeKeys.cashFlowReport(startDate, endDate),
    queryFn: () => FinanceService.getCashFlowReport(startDate, endDate),
    ...queryOptions.detail({ enabled: !!startDate && !!endDate }),
  });
}

export function useReceivablesAgingReport() {
  return useQuery<AgingReportDto>({
    queryKey: financeKeys.receivablesAging,
    queryFn: () => FinanceService.getReceivablesAgingReport(),
    ...queryOptions.list(),
  });
}

export function usePayablesAgingReport() {
  return useQuery<AgingReportDto>({
    queryKey: financeKeys.payablesAging,
    queryFn: () => FinanceService.getPayablesAgingReport(),
    ...queryOptions.list(),
  });
}

export function useRevenueVsExpenses(startDate: DateTime, endDate: DateTime) {
  return useQuery<{ revenue: number; expenses: number; net: number }>({
    queryKey: financeKeys.revenueVsExpenses(startDate, endDate),
    queryFn: () => FinanceService.getRevenueVsExpenses(startDate, endDate),
    ...queryOptions.detail({ enabled: !!startDate && !!endDate }),
  });
}

// =====================================
// BA-BS FORMS HOOKS - Ba-Bs Formu (GİB)
// 5.000 TL üzeri işlem bildirimi
// =====================================

/**
 * Ba-Bs Formları listesi
 */
export function useBaBsForms(filters?: BaBsFormFilterDto) {
  return useQuery<PaginatedResponse<BaBsFormSummaryDto>>({
    queryKey: [...financeKeys.babsForms, filters],
    queryFn: () => FinanceService.getBaBsForms(filters),
    ...queryOptions.list(),
  });
}

export function useBaBsForm(id: number) {
  return useQuery<BaBsFormDto>({
    queryKey: financeKeys.babsForm(id),
    queryFn: () => FinanceService.getBaBsForm(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useOverdueBaBsForms() {
  return useQuery<BaBsFormSummaryDto[]>({
    queryKey: [...financeKeys.babsForms, 'overdue'],
    queryFn: () => FinanceService.getOverdueBaBsForms(),
    ...queryOptions.list(),
  });
}

export function useBaBsFormStats(year?: number) {
  return useQuery<BaBsFormStatsDto>({
    queryKey: [...financeKeys.babsForms, 'stats', year],
    queryFn: () => FinanceService.getBaBsFormStats(year),
    ...queryOptions.detail(),
  });
}

export function useCreateBaBsForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBaBsFormDto) => FinanceService.createBaBsForm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.babsForms });
      showSuccess('Ba-Bs formu oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Ba-Bs formu oluşturulamadı');
    },
  });
}

export function useUpdateBaBsForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBaBsFormDto }) =>
      FinanceService.updateBaBsForm(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.babsForm(variables.id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.babsForms });
      showSuccess('Ba-Bs formu güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Ba-Bs formu güncellenemedi');
    },
  });
}

export function useDeleteBaBsForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.deleteBaBsForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.babsForms });
      showSuccess('Ba-Bs formu silindi');
    },
    onError: (error) => {
      showApiError(error, 'Ba-Bs formu silinemedi');
    },
  });
}

export function useApproveBaBsForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: ApproveBaBsFormDto }) =>
      FinanceService.approveBaBsForm(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.babsForm(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.babsForms });
      showSuccess('Ba-Bs formu onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Ba-Bs formu onaylanamadı');
    },
  });
}

export function useFileBaBsForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: FileBaBsFormDto }) =>
      FinanceService.fileBaBsForm(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.babsForm(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.babsForms });
      showSuccess('Ba-Bs formu GİB\'e gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Ba-Bs formu gönderilemedi');
    },
  });
}

export function useCancelBaBsForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CancelBaBsFormDto }) =>
      FinanceService.cancelBaBsForm(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.babsForm(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.babsForms });
      showSuccess('Ba-Bs formu iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Ba-Bs formu iptal edilemedi');
    },
  });
}

export function useCreateBaBsCorrection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateBaBsCorrectionDto }) =>
      FinanceService.createBaBsCorrection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.babsForms });
      showSuccess('Ba-Bs düzeltme formu oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Ba-Bs düzeltme formu oluşturulamadı');
    },
  });
}

export function useValidateBaBsForm() {
  return useMutation({
    mutationFn: (id: number) => FinanceService.validateBaBsForm(id),
    onError: (error) => {
      showApiError(error, 'Ba-Bs formu doğrulanamadı');
    },
  });
}

export function useGenerateBaBsFromInvoices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateBaBsFromInvoicesDto) =>
      FinanceService.generateBaBsFromInvoices(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.babsForms });
      showSuccess('Ba-Bs formu faturalardan oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Ba-Bs formu oluşturulamadı');
    },
  });
}

// =====================================
// TAX DECLARATIONS HOOKS - Vergi Beyannameleri
// KDV, Muhtasar, Geçici Vergi vb.
// =====================================

/**
 * Vergi Beyannameleri listesi
 */
export function useTaxDeclarations(filters?: TaxDeclarationFilterDto) {
  return useQuery<PaginatedResponse<TaxDeclarationSummaryDto>>({
    queryKey: [...financeKeys.taxDeclarations, filters],
    queryFn: () => FinanceService.getTaxDeclarations(filters),
    ...queryOptions.list(),
  });
}

export function useTaxDeclaration(id: number) {
  return useQuery<TaxDeclarationDto>({
    queryKey: financeKeys.taxDeclaration(id),
    queryFn: () => FinanceService.getTaxDeclaration(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useOverdueTaxDeclarations() {
  return useQuery<TaxDeclarationSummaryDto[]>({
    queryKey: [...financeKeys.taxDeclarations, 'overdue'],
    queryFn: () => FinanceService.getOverdueTaxDeclarations(),
    ...queryOptions.list(),
  });
}

export function useTaxDeclarationStats(year?: number) {
  return useQuery<TaxDeclarationStatsDto>({
    queryKey: [...financeKeys.taxDeclarations, 'stats', year],
    queryFn: () => FinanceService.getTaxDeclarationStats(year),
    ...queryOptions.detail(),
  });
}

export function useTaxCalendar(year: number, month?: number) {
  return useQuery<TaxCalendarItemDto[]>({
    queryKey: [...financeKeys.taxDeclarations, 'calendar', year, month],
    queryFn: () => FinanceService.getTaxCalendar(year, month),
    ...queryOptions.list({ enabled: !!year }),
  });
}

export function useCreateTaxDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaxDeclarationDto) => FinanceService.createTaxDeclaration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.taxDeclarations });
      showSuccess('Vergi beyannamesi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Vergi beyannamesi oluşturulamadı');
    },
  });
}

export function useDeleteTaxDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FinanceService.deleteTaxDeclaration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.taxDeclarations });
      showSuccess('Vergi beyannamesi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Vergi beyannamesi silinemedi');
    },
  });
}

export function useApproveTaxDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: ApproveTaxDeclarationDto }) =>
      FinanceService.approveTaxDeclaration(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.taxDeclaration(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.taxDeclarations });
      showSuccess('Vergi beyannamesi onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Vergi beyannamesi onaylanamadı');
    },
  });
}

export function useFileTaxDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: FileTaxDeclarationDto }) =>
      FinanceService.fileTaxDeclaration(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.taxDeclaration(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.taxDeclarations });
      showSuccess('Vergi beyannamesi GİB\'e gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Vergi beyannamesi gönderilemedi');
    },
  });
}

export function useRecordTaxPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RecordTaxPaymentDto }) =>
      FinanceService.recordTaxPayment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.taxDeclaration(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.taxDeclarations });
      showSuccess('Vergi ödemesi kaydedildi');
    },
    onError: (error) => {
      showApiError(error, 'Vergi ödemesi kaydedilemedi');
    },
  });
}

export function useCreateTaxAmendment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateTaxAmendmentDto }) =>
      FinanceService.createTaxAmendment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.taxDeclarations });
      showSuccess('Düzeltme beyannamesi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Düzeltme beyannamesi oluşturulamadı');
    },
  });
}

export function useCancelTaxDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CancelTaxDeclarationDto }) =>
      FinanceService.cancelTaxDeclaration(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.taxDeclaration(id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.taxDeclarations });
      showSuccess('Vergi beyannamesi iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Vergi beyannamesi iptal edilemedi');
    },
  });
}

// =====================================
// VAT & WITHHOLDING REPORTS HOOKS
// KDV ve Stopaj Raporları
// =====================================

/**
 * KDV Raporu
 */
export function useVatReport(year: number, month: number) {
  return useQuery<VatReportDto>({
    queryKey: financeKeys.vatReport(year, month),
    queryFn: () => FinanceService.getVatReport(year, month),
    ...queryOptions.detail({ enabled: !!year && !!month }),
  });
}

/**
 * Stopaj Raporu
 */
export function useWithholdingReport(year: number, month: number) {
  return useQuery<WithholdingReportDto>({
    queryKey: financeKeys.withholdingReport(year, month),
    queryFn: () => FinanceService.getWithholdingReport(year, month),
    ...queryOptions.detail({ enabled: !!year && !!month }),
  });
}

// =====================================
// E-INVOICE HOOKS - e-Fatura (GİB)
// =====================================

/**
 * e-Fatura listesi
 */
export function useEInvoices(filters?: EInvoiceFilterDto) {
  return useQuery<PaginatedResponse<EInvoiceSummaryDto>>({
    queryKey: [...financeKeys.eInvoices, filters],
    queryFn: async () => {
      // TODO: Backend API hazır olduğunda aktif edilecek
      // return FinanceService.getEInvoices(filters);

      // Mock data for development
      return {
        items: [],
        pageNumber: filters?.pageNumber || 1,
        pageSize: filters?.pageSize || 10,
        totalCount: 0,
        totalPages: 0,
      };
    },
    ...queryOptions.list(),
  });
}

/**
 * Tekil e-Fatura detayı
 */
export function useEInvoice(id: number) {
  return useQuery<EInvoiceDto>({
    queryKey: financeKeys.eInvoice(id),
    queryFn: async () => {
      // TODO: Backend API hazır olduğunda aktif edilecek
      // return FinanceService.getEInvoice(id);
      throw new Error('e-Fatura bulunamadı');
    },
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * e-Fatura istatistikleri
 */
export function useEInvoiceStats(year: number, month: number) {
  return useQuery<EInvoiceStatsDto>({
    queryKey: financeKeys.eInvoiceStats(year, month),
    queryFn: async () => {
      // TODO: Backend API hazır olduğunda aktif edilecek

      // Mock data for development
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      return {
        totalCount: 0,
        draftCount: 0,
        sentCount: 0,
        deliveredCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        errorCount: 0,
        outgoingCount: 0,
        incomingCount: 0,
        eFaturaCount: 0,
        eArsivCount: 0,
        eIrsaliyeCount: 0,
        outgoingTotal: 0,
        incomingTotal: 0,
        periodStart: startDate.toISOString(),
        periodEnd: endDate.toISOString(),
      };
    },
    ...queryOptions.detail({ enabled: !!year && !!month }),
  });
}

/**
 * e-Fatura gönder (GİB'e)
 */
export function useSendEInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendEInvoiceDto) => {
      // TODO: Backend API hazır olduğunda aktif edilecek
      throw new Error('GİB entegrasyonu henüz aktif değil');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.eInvoices });
      showSuccess('e-Fatura GİB\'e başarıyla gönderildi');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * e-Fatura yanıtla (gelen faturalar için)
 */
export function useRespondEInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EInvoiceResponseDto) => {
      // TODO: Backend API hazır olduğunda aktif edilecek
      throw new Error('GİB entegrasyonu henüz aktif değil');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.eInvoices });
      queryClient.invalidateQueries({ queryKey: financeKeys.eInvoice(variables.eInvoiceId) });
      showSuccess(variables.accepted ? 'e-Fatura kabul edildi' : 'e-Fatura reddedildi');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * GİB durumu sorgula
 */
export function useCheckGibStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eInvoiceId: number) => {
      // TODO: Backend API hazır olduğunda aktif edilecek
      throw new Error('GİB entegrasyonu henüz aktif değil');
    },
    onSuccess: (_, eInvoiceId) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.eInvoice(eInvoiceId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.eInvoices });
      showSuccess('GİB durumu güncellendi');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * GİB entegrasyon ayarları
 */
export function useGibSettings() {
  return useQuery<GibSettingsDto>({
    queryKey: financeKeys.gibSettings,
    queryFn: async () => {
      // TODO: Backend API hazır olduğunda aktif edilecek

      // Mock data for development
      return {
        id: 1,
        integrationEnabled: false,
        companyVkn: '',
        companyTitle: '',
        gbEtiketi: undefined,
        pkEtiketi: undefined,
        provider: 'Foriba',
        providerUsername: undefined,
        isTestMode: true,
        autoSendEnabled: false,
        autoArchiveEnabled: true,
        defaultScenario: 'TEMEL',
        defaultProfileId: 'TEMELFATURA',
        emailNotificationsEnabled: false,
        notificationEmail: undefined,
        lastSyncDate: undefined,
        connectionStatus: 'Bağlantı yok',
      };
    },
    ...queryOptions.detail(),
  });
}

/**
 * GİB ayarlarını güncelle
 */
export function useUpdateGibSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateGibSettingsDto) => {
      // TODO: Backend API hazır olduğunda aktif edilecek
      throw new Error('GİB ayarları güncellenemedi');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.gibSettings });
      showSuccess('GİB ayarları başarıyla güncellendi');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * GİB bağlantısını test et
 */
export function useTestGibConnection() {
  return useMutation({
    mutationFn: async () => {
      // TODO: Backend API hazır olduğunda aktif edilecek
      throw new Error('GİB bağlantı testi başarısız');
    },
    onSuccess: () => {
      showSuccess('GİB bağlantısı başarılı');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}
