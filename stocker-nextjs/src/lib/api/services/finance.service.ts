import { ApiService } from '../api-service';
import logger from '../../utils/logger';
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
  // VAT & Withholding Reports
  VatReportDto,
  WithholdingReportDto,
  // Enums
  InvoiceStatus,
  ExpenseStatus,
  ChequeStatus,
  PromissoryNoteStatus,
  AccountingPeriodStatus,
} from './finance.types';

// =====================================
// FINANCE API SERVICE
// =====================================

export class FinanceService {
  /**
   * Build Finance module API path
   * @param resource - Resource path (e.g., 'invoices', 'current-accounts')
   * @returns Finance API path (without /api prefix as it's in baseURL)
   *
   * Finance module uses: /api/finance/{resource}
   * Tenant context is handled by backend middleware via X-Tenant-Code header (not in URL)
   */
  private static getPath(resource: string): string {
    // Finance module route pattern
    return `/finance/${resource}`;
  }

  // =====================================
  // INVOICES - Faturalar
  // =====================================

  /**
   * Get all invoices with pagination and filters
   */
  static async getInvoices(
    filters?: InvoiceFilterDto
  ): Promise<PaginatedResponse<InvoiceSummaryDto>> {
    const params = {
      pageNumber: filters?.pageNumber || 1,
      pageSize: filters?.pageSize || 10,
      searchTerm: filters?.searchTerm,
      invoiceType: filters?.invoiceType,
      status: filters?.status,
      customerId: filters?.customerId,
      supplierId: filters?.supplierId,
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      minAmount: filters?.minAmount,
      maxAmount: filters?.maxAmount,
      isOverdue: filters?.isOverdue,
      currency: filters?.currency,
      sortBy: filters?.sortBy,
      sortDescending: filters?.sortDescending,
    };

    return ApiService.get<PaginatedResponse<InvoiceSummaryDto>>(
      this.getPath('invoices'),
      { params }
    );
  }

  /**
   * Get single invoice by ID
   */
  static async getInvoice(id: number): Promise<InvoiceDto> {
    return ApiService.get<InvoiceDto>(this.getPath(`invoices/${id}`));
  }

  /**
   * Create new invoice
   */
  static async createInvoice(data: CreateInvoiceDto): Promise<InvoiceDto> {
    logger.info('📤 Creating invoice', { metadata: { data } });
    return ApiService.post<InvoiceDto>(this.getPath('invoices'), data);
  }

  /**
   * Update existing invoice
   */
  static async updateInvoice(id: number, data: UpdateInvoiceDto): Promise<InvoiceDto> {
    return ApiService.put<InvoiceDto>(this.getPath(`invoices/${id}`), data);
  }

  /**
   * Delete invoice
   */
  static async deleteInvoice(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`invoices/${id}`));
  }

  /**
   * Approve invoice
   */
  static async approveInvoice(id: number): Promise<InvoiceDto> {
    return ApiService.post<InvoiceDto>(this.getPath(`invoices/${id}/approve`), {});
  }

  /**
   * Send invoice
   */
  static async sendInvoice(id: number): Promise<InvoiceDto> {
    return ApiService.post<InvoiceDto>(this.getPath(`invoices/${id}/send`), {});
  }

  /**
   * Cancel invoice
   */
  static async cancelInvoice(id: number, reason?: string): Promise<InvoiceDto> {
    return ApiService.post<InvoiceDto>(this.getPath(`invoices/${id}/cancel`), { reason });
  }

  /**
   * Mark invoice as paid
   */
  static async markInvoiceAsPaid(id: number, paymentDate?: DateTime): Promise<InvoiceDto> {
    return ApiService.post<InvoiceDto>(this.getPath(`invoices/${id}/mark-paid`), { paymentDate });
  }

  /**
   * Get overdue invoices
   */
  static async getOverdueInvoices(): Promise<InvoiceSummaryDto[]> {
    return ApiService.get<InvoiceSummaryDto[]>(this.getPath('invoices/overdue'));
  }

  /**
   * Get invoices by customer
   */
  static async getInvoicesByCustomer(customerId: Guid): Promise<InvoiceSummaryDto[]> {
    return ApiService.get<InvoiceSummaryDto[]>(this.getPath(`invoices/customer/${customerId}`));
  }

  // =====================================
  // CURRENT ACCOUNTS - Cari Hesaplar
  // =====================================

  /**
   * Get all current accounts with pagination
   */
  static async getCurrentAccounts(
    filters?: CurrentAccountFilterDto
  ): Promise<PaginatedResponse<CurrentAccountSummaryDto>> {
    const params = {
      pageNumber: filters?.pageNumber || 1,
      pageSize: filters?.pageSize || 10,
      searchTerm: filters?.searchTerm,
      accountType: filters?.accountType,
      isActive: filters?.isActive,
      isBlocked: filters?.isBlocked,
      hasBalance: filters?.hasBalance,
      minBalance: filters?.minBalance,
      maxBalance: filters?.maxBalance,
      sortBy: filters?.sortBy,
      sortDescending: filters?.sortDescending,
    };

    return ApiService.get<PaginatedResponse<CurrentAccountSummaryDto>>(
      this.getPath('current-accounts'),
      { params }
    );
  }

  /**
   * Get single current account by ID
   */
  static async getCurrentAccount(id: number): Promise<CurrentAccountDto> {
    return ApiService.get<CurrentAccountDto>(this.getPath(`current-accounts/${id}`));
  }

  /**
   * Get current account by customer ID
   */
  static async getCurrentAccountByCustomer(customerId: Guid): Promise<CurrentAccountDto> {
    return ApiService.get<CurrentAccountDto>(this.getPath(`current-accounts/customer/${customerId}`));
  }

  /**
   * Create new current account
   */
  static async createCurrentAccount(data: CreateCurrentAccountDto): Promise<CurrentAccountDto> {
    logger.info('📤 Creating current account', { metadata: { data } });
    return ApiService.post<CurrentAccountDto>(this.getPath('current-accounts'), data);
  }

  /**
   * Update existing current account
   */
  static async updateCurrentAccount(id: number, data: UpdateCurrentAccountDto): Promise<CurrentAccountDto> {
    return ApiService.put<CurrentAccountDto>(this.getPath(`current-accounts/${id}`), data);
  }

  /**
   * Delete current account
   */
  static async deleteCurrentAccount(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`current-accounts/${id}`));
  }

  /**
   * Get current account transactions
   */
  static async getCurrentAccountTransactions(
    id: number,
    startDate?: DateTime,
    endDate?: DateTime
  ): Promise<CurrentAccountTransactionDto[]> {
    return ApiService.get<CurrentAccountTransactionDto[]>(
      this.getPath(`current-accounts/${id}/transactions`),
      { params: { startDate, endDate } }
    );
  }

  /**
   * Get current account statement (Hesap Ekstresi)
   */
  static async getCurrentAccountStatement(
    id: number,
    startDate: DateTime,
    endDate: DateTime
  ): Promise<CurrentAccountStatementDto> {
    return ApiService.get<CurrentAccountStatementDto>(
      this.getPath(`current-accounts/${id}/statement`),
      { params: { startDate, endDate } }
    );
  }

  /**
   * Block current account
   */
  static async blockCurrentAccount(id: number, reason: string): Promise<CurrentAccountDto> {
    return ApiService.post<CurrentAccountDto>(this.getPath(`current-accounts/${id}/block`), { reason });
  }

  /**
   * Unblock current account
   */
  static async unblockCurrentAccount(id: number): Promise<CurrentAccountDto> {
    return ApiService.post<CurrentAccountDto>(this.getPath(`current-accounts/${id}/unblock`), {});
  }

  /**
   * Update credit limit
   */
  static async updateCreditLimit(id: number, creditLimit: number): Promise<CurrentAccountDto> {
    return ApiService.patch<CurrentAccountDto>(
      this.getPath(`current-accounts/${id}/credit-limit`),
      { creditLimit }
    );
  }

  // =====================================
  // EXPENSES - Giderler
  // =====================================

  /**
   * Get all expenses with pagination
   */
  static async getExpenses(
    filters?: ExpenseFilterDto
  ): Promise<PaginatedResponse<ExpenseSummaryDto>> {
    const params = {
      pageNumber: filters?.pageNumber || 1,
      pageSize: filters?.pageSize || 10,
      searchTerm: filters?.searchTerm,
      category: filters?.category,
      status: filters?.status,
      supplierId: filters?.supplierId,
      costCenterId: filters?.costCenterId,
      budgetId: filters?.budgetId,
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      minAmount: filters?.minAmount,
      maxAmount: filters?.maxAmount,
      isPaid: filters?.isPaid,
      sortBy: filters?.sortBy,
      sortDescending: filters?.sortDescending,
    };

    return ApiService.get<PaginatedResponse<ExpenseSummaryDto>>(
      this.getPath('expenses'),
      { params }
    );
  }

  /**
   * Get single expense by ID
   */
  static async getExpense(id: number): Promise<ExpenseDto> {
    return ApiService.get<ExpenseDto>(this.getPath(`expenses/${id}`));
  }

  /**
   * Create new expense
   */
  static async createExpense(data: CreateExpenseDto): Promise<ExpenseDto> {
    logger.info('📤 Creating expense', { metadata: { data } });
    return ApiService.post<ExpenseDto>(this.getPath('expenses'), data);
  }

  /**
   * Update existing expense
   */
  static async updateExpense(id: number, data: UpdateExpenseDto): Promise<ExpenseDto> {
    return ApiService.put<ExpenseDto>(this.getPath(`expenses/${id}`), data);
  }

  /**
   * Delete expense
   */
  static async deleteExpense(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`expenses/${id}`));
  }

  /**
   * Approve expense
   */
  static async approveExpense(id: number): Promise<ExpenseDto> {
    return ApiService.post<ExpenseDto>(this.getPath(`expenses/${id}/approve`), {});
  }

  /**
   * Reject expense
   */
  static async rejectExpense(id: number, reason: string): Promise<ExpenseDto> {
    return ApiService.post<ExpenseDto>(this.getPath(`expenses/${id}/reject`), { reason });
  }

  /**
   * Mark expense as paid
   */
  static async markExpenseAsPaid(id: number, paymentDate?: DateTime): Promise<ExpenseDto> {
    return ApiService.post<ExpenseDto>(this.getPath(`expenses/${id}/mark-paid`), { paymentDate });
  }

  /**
   * Get expenses by category
   */
  static async getExpensesByCategory(
    startDate: DateTime,
    endDate: DateTime
  ): Promise<{ category: string; total: number }[]> {
    return ApiService.get<{ category: string; total: number }[]>(
      this.getPath('expenses/by-category'),
      { params: { startDate, endDate } }
    );
  }

  // =====================================
  // PAYMENTS - Ödemeler
  // =====================================

  /**
   * Get all payments with pagination
   */
  static async getPayments(
    filters?: PaymentFilterDto
  ): Promise<PaginatedResponse<PaymentSummaryDto>> {
    const params = {
      pageNumber: filters?.pageNumber || 1,
      pageSize: filters?.pageSize || 10,
      searchTerm: filters?.searchTerm,
      status: filters?.status,
      paymentMethod: filters?.paymentMethod,
      currentAccountId: filters?.currentAccountId,
      bankAccountId: filters?.bankAccountId,
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      minAmount: filters?.minAmount,
      maxAmount: filters?.maxAmount,
      sortBy: filters?.sortBy,
      sortDescending: filters?.sortDescending,
    };

    return ApiService.get<PaginatedResponse<PaymentSummaryDto>>(
      this.getPath('payments'),
      { params }
    );
  }

  /**
   * Get single payment by ID
   */
  static async getPayment(id: number): Promise<PaymentDto> {
    return ApiService.get<PaymentDto>(this.getPath(`payments/${id}`));
  }

  /**
   * Create new payment
   */
  static async createPayment(data: CreatePaymentDto): Promise<PaymentDto> {
    logger.info('📤 Creating payment', { metadata: { data } });
    return ApiService.post<PaymentDto>(this.getPath('payments'), data);
  }

  /**
   * Delete payment
   */
  static async deletePayment(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`payments/${id}`));
  }

  /**
   * Receive payment (Tahsilat)
   */
  static async receivePayment(data: ReceivePaymentDto): Promise<PaymentDto> {
    logger.info('📤 Receiving payment', { metadata: { data } });
    return ApiService.post<PaymentDto>(this.getPath('payments/receive'), data);
  }

  /**
   * Make payment (Ödeme Yapma)
   */
  static async makePayment(data: MakePaymentDto): Promise<PaymentDto> {
    logger.info('📤 Making payment', { metadata: { data } });
    return ApiService.post<PaymentDto>(this.getPath('payments/make'), data);
  }

  /**
   * Get payments by current account
   */
  static async getPaymentsByCurrentAccount(currentAccountId: number): Promise<PaymentSummaryDto[]> {
    return ApiService.get<PaymentSummaryDto[]>(
      this.getPath(`payments/current-account/${currentAccountId}`)
    );
  }

  // =====================================
  // BANK ACCOUNTS - Banka Hesapları
  // =====================================

  /**
   * Get all bank accounts
   */
  static async getBankAccounts(
    filters?: BankAccountFilterDto
  ): Promise<PaginatedResponse<BankAccountSummaryDto>> {
    const params = {
      pageNumber: filters?.pageNumber || 1,
      pageSize: filters?.pageSize || 10,
      searchTerm: filters?.searchTerm,
      accountType: filters?.accountType,
      status: filters?.status,
      currency: filters?.currency,
      bankName: filters?.bankName,
      isActive: filters?.isActive,
      sortBy: filters?.sortBy,
      sortDescending: filters?.sortDescending,
    };

    return ApiService.get<PaginatedResponse<BankAccountSummaryDto>>(
      this.getPath('bank-accounts'),
      { params }
    );
  }

  /**
   * Get single bank account by ID
   */
  static async getBankAccount(id: number): Promise<BankAccountDto> {
    return ApiService.get<BankAccountDto>(this.getPath(`bank-accounts/${id}`));
  }

  /**
   * Create new bank account
   */
  static async createBankAccount(data: CreateBankAccountDto): Promise<BankAccountDto> {
    logger.info('📤 Creating bank account', { metadata: { data } });
    return ApiService.post<BankAccountDto>(this.getPath('bank-accounts'), data);
  }

  /**
   * Update existing bank account
   */
  static async updateBankAccount(id: number, data: UpdateBankAccountDto): Promise<BankAccountDto> {
    return ApiService.put<BankAccountDto>(this.getPath(`bank-accounts/${id}`), data);
  }

  /**
   * Delete bank account
   */
  static async deleteBankAccount(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`bank-accounts/${id}`));
  }

  /**
   * Set default bank account
   */
  static async setDefaultBankAccount(id: number): Promise<BankAccountDto> {
    return ApiService.post<BankAccountDto>(this.getPath(`bank-accounts/${id}/set-default`), {});
  }

  /**
   * Get bank account balance
   */
  static async getBankAccountBalance(id: number): Promise<{ currentBalance: number; availableBalance: number }> {
    return ApiService.get<{ currentBalance: number; availableBalance: number }>(
      this.getPath(`bank-accounts/${id}/balance`)
    );
  }

  /**
   * Get total bank balances by currency
   */
  static async getTotalBankBalances(): Promise<{ currency: string; balance: number }[]> {
    return ApiService.get<{ currency: string; balance: number }[]>(
      this.getPath('bank-accounts/total-balances')
    );
  }

  // =====================================
  // BANK TRANSACTIONS - Banka İşlemleri
  // =====================================

  /**
   * Get bank transactions
   */
  static async getBankTransactions(
    filters?: BankTransactionFilterDto
  ): Promise<PaginatedResponse<BankTransactionDto>> {
    return ApiService.get<PaginatedResponse<BankTransactionDto>>(
      this.getPath('bank-transactions'),
      { params: filters }
    );
  }

  /**
   * Get transactions by bank account
   */
  static async getBankAccountTransactions(
    bankAccountId: number,
    filters?: BankTransactionFilterDto
  ): Promise<PaginatedResponse<BankTransactionDto>> {
    return ApiService.get<PaginatedResponse<BankTransactionDto>>(
      this.getPath(`bank-accounts/${bankAccountId}/transactions`),
      { params: filters }
    );
  }

  /**
   * Create bank transaction
   */
  static async createBankTransaction(data: CreateBankTransactionDto): Promise<BankTransactionDto> {
    return ApiService.post<BankTransactionDto>(this.getPath('bank-transactions'), data);
  }

  /**
   * Reconcile bank transaction
   */
  static async reconcileBankTransaction(id: number): Promise<BankTransactionDto> {
    return ApiService.post<BankTransactionDto>(this.getPath(`bank-transactions/${id}/reconcile`), {});
  }

  // =====================================
  // CHEQUES - Çekler
  // =====================================

  /**
   * Get all cheques with pagination
   */
  static async getCheques(
    filters?: ChequeFilterDto
  ): Promise<PaginatedResponse<ChequeSummaryDto>> {
    return ApiService.get<PaginatedResponse<ChequeSummaryDto>>(
      this.getPath('cheques'),
      { params: filters }
    );
  }

  /**
   * Get single cheque by ID
   */
  static async getCheque(id: number): Promise<ChequeDto> {
    return ApiService.get<ChequeDto>(this.getPath(`cheques/${id}`));
  }

  /**
   * Create new cheque
   */
  static async createCheque(data: CreateChequeDto): Promise<ChequeDto> {
    logger.info('📤 Creating cheque', { metadata: { data } });
    return ApiService.post<ChequeDto>(this.getPath('cheques'), data);
  }

  /**
   * Update cheque status
   */
  static async updateChequeStatus(id: number, data: UpdateChequeStatusDto): Promise<ChequeDto> {
    return ApiService.patch<ChequeDto>(this.getPath(`cheques/${id}/status`), data);
  }

  /**
   * Delete cheque
   */
  static async deleteCheque(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`cheques/${id}`));
  }

  /**
   * Deposit cheque
   */
  static async depositCheque(id: number, bankAccountId: number): Promise<ChequeDto> {
    return ApiService.post<ChequeDto>(this.getPath(`cheques/${id}/deposit`), { bankAccountId });
  }

  /**
   * Endorse cheque (Ciro)
   */
  static async endorseCheque(id: number, endorsedTo: string): Promise<ChequeDto> {
    return ApiService.post<ChequeDto>(this.getPath(`cheques/${id}/endorse`), { endorsedTo });
  }

  /**
   * Get cheques due in period
   */
  static async getChequesDueInPeriod(
    startDate: DateTime,
    endDate: DateTime
  ): Promise<ChequeSummaryDto[]> {
    return ApiService.get<ChequeSummaryDto[]>(
      this.getPath('cheques/due'),
      { params: { startDate, endDate } }
    );
  }

  // =====================================
  // PROMISSORY NOTES - Senetler
  // =====================================

  /**
   * Get all promissory notes with pagination
   */
  static async getPromissoryNotes(
    filters?: PromissoryNoteFilterDto
  ): Promise<PaginatedResponse<PromissoryNoteDto>> {
    return ApiService.get<PaginatedResponse<PromissoryNoteDto>>(
      this.getPath('promissory-notes'),
      { params: filters }
    );
  }

  /**
   * Get single promissory note by ID
   */
  static async getPromissoryNote(id: number): Promise<PromissoryNoteDto> {
    return ApiService.get<PromissoryNoteDto>(this.getPath(`promissory-notes/${id}`));
  }

  /**
   * Create new promissory note
   */
  static async createPromissoryNote(data: CreatePromissoryNoteDto): Promise<PromissoryNoteDto> {
    logger.info('📤 Creating promissory note', { metadata: { data } });
    return ApiService.post<PromissoryNoteDto>(this.getPath('promissory-notes'), data);
  }

  /**
   * Delete promissory note
   */
  static async deletePromissoryNote(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`promissory-notes/${id}`));
  }

  /**
   * Collect promissory note
   */
  static async collectPromissoryNote(id: number, collectionDate: DateTime): Promise<PromissoryNoteDto> {
    return ApiService.post<PromissoryNoteDto>(
      this.getPath(`promissory-notes/${id}/collect`),
      { collectionDate }
    );
  }

  /**
   * Protest promissory note
   */
  static async protestPromissoryNote(id: number, reason: string): Promise<PromissoryNoteDto> {
    return ApiService.post<PromissoryNoteDto>(
      this.getPath(`promissory-notes/${id}/protest`),
      { reason }
    );
  }

  /**
   * Endorse promissory note (Ciro)
   */
  static async endorsePromissoryNote(id: number, endorsedTo: string): Promise<PromissoryNoteDto> {
    return ApiService.post<PromissoryNoteDto>(
      this.getPath(`promissory-notes/${id}/endorse`),
      { endorsedTo }
    );
  }

  // =====================================
  // LOANS - Krediler
  // =====================================

  /**
   * Get all loans with pagination
   */
  static async getLoans(
    filters?: LoanFilterDto
  ): Promise<PaginatedResponse<LoanDto>> {
    return ApiService.get<PaginatedResponse<LoanDto>>(
      this.getPath('loans'),
      { params: filters }
    );
  }

  /**
   * Get single loan by ID
   */
  static async getLoan(id: number): Promise<LoanDto> {
    return ApiService.get<LoanDto>(this.getPath(`loans/${id}`));
  }

  /**
   * Create new loan
   */
  static async createLoan(data: CreateLoanDto): Promise<LoanDto> {
    logger.info('📤 Creating loan', { metadata: { data } });
    return ApiService.post<LoanDto>(this.getPath('loans'), data);
  }

  /**
   * Delete loan
   */
  static async deleteLoan(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`loans/${id}`));
  }

  /**
   * Get loan installments
   */
  static async getLoanInstallments(id: number): Promise<LoanInstallmentDto[]> {
    return ApiService.get<LoanInstallmentDto[]>(this.getPath(`loans/${id}/installments`));
  }

  /**
   * Pay loan installment
   */
  static async payLoanInstallment(
    loanId: number,
    installmentId: number,
    amount: number,
    paymentDate: DateTime
  ): Promise<LoanInstallmentDto> {
    return ApiService.post<LoanInstallmentDto>(
      this.getPath(`loans/${loanId}/installments/${installmentId}/pay`),
      { amount, paymentDate }
    );
  }

  /**
   * Calculate early payoff
   */
  static async calculateEarlyPayoff(id: number): Promise<{ amount: number; penalty: number; total: number }> {
    return ApiService.get<{ amount: number; penalty: number; total: number }>(
      this.getPath(`loans/${id}/early-payoff`)
    );
  }

  // =====================================
  // FIXED ASSETS - Sabit Kıymetler
  // =====================================

  /**
   * Get all fixed assets with pagination
   */
  static async getFixedAssets(
    filters?: FixedAssetFilterDto
  ): Promise<PaginatedResponse<FixedAssetDto>> {
    return ApiService.get<PaginatedResponse<FixedAssetDto>>(
      this.getPath('fixed-assets'),
      { params: filters }
    );
  }

  /**
   * Get single fixed asset by ID
   */
  static async getFixedAsset(id: number): Promise<FixedAssetDto> {
    return ApiService.get<FixedAssetDto>(this.getPath(`fixed-assets/${id}`));
  }

  /**
   * Create new fixed asset
   */
  static async createFixedAsset(data: CreateFixedAssetDto): Promise<FixedAssetDto> {
    logger.info('📤 Creating fixed asset', { metadata: { data } });
    return ApiService.post<FixedAssetDto>(this.getPath('fixed-assets'), data);
  }

  /**
   * Delete fixed asset
   */
  static async deleteFixedAsset(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`fixed-assets/${id}`));
  }

  /**
   * Dispose fixed asset
   */
  static async disposeFixedAsset(
    id: number,
    disposalDate: DateTime,
    disposalValue: number,
    reason: string
  ): Promise<FixedAssetDto> {
    return ApiService.post<FixedAssetDto>(
      this.getPath(`fixed-assets/${id}/dispose`),
      { disposalDate, disposalValue, reason }
    );
  }

  /**
   * Calculate depreciation
   */
  static async calculateDepreciation(id: number): Promise<{ monthly: number; accumulated: number; bookValue: number }> {
    return ApiService.get<{ monthly: number; accumulated: number; bookValue: number }>(
      this.getPath(`fixed-assets/${id}/depreciation`)
    );
  }

  /**
   * Run depreciation for period
   */
  static async runDepreciation(month: number, year: number): Promise<{ processed: number; totalAmount: number }> {
    return ApiService.post<{ processed: number; totalAmount: number }>(
      this.getPath('fixed-assets/run-depreciation'),
      { month, year }
    );
  }

  // =====================================
  // BUDGETS - Bütçeler
  // =====================================

  /**
   * Get all budgets with pagination
   */
  static async getBudgets(
    filters?: BudgetFilterDto
  ): Promise<PaginatedResponse<BudgetDto>> {
    return ApiService.get<PaginatedResponse<BudgetDto>>(
      this.getPath('budgets'),
      { params: filters }
    );
  }

  /**
   * Get single budget by ID
   */
  static async getBudget(id: number): Promise<BudgetDto> {
    return ApiService.get<BudgetDto>(this.getPath(`budgets/${id}`));
  }

  /**
   * Create new budget
   */
  static async createBudget(data: CreateBudgetDto): Promise<BudgetDto> {
    logger.info('📤 Creating budget', { metadata: { data } });
    return ApiService.post<BudgetDto>(this.getPath('budgets'), data);
  }

  /**
   * Delete budget
   */
  static async deleteBudget(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`budgets/${id}`));
  }

  /**
   * Approve budget
   */
  static async approveBudget(id: number): Promise<BudgetDto> {
    return ApiService.post<BudgetDto>(this.getPath(`budgets/${id}/approve`), {});
  }

  /**
   * Activate budget
   */
  static async activateBudget(id: number): Promise<BudgetDto> {
    return ApiService.post<BudgetDto>(this.getPath(`budgets/${id}/activate`), {});
  }

  /**
   * Close budget
   */
  static async closeBudget(id: number): Promise<BudgetDto> {
    return ApiService.post<BudgetDto>(this.getPath(`budgets/${id}/close`), {});
  }

  /**
   * Get budget vs actual report
   */
  static async getBudgetVsActual(id: number): Promise<BudgetDto> {
    return ApiService.get<BudgetDto>(this.getPath(`budgets/${id}/vs-actual`));
  }

  // =====================================
  // COST CENTERS - Maliyet Merkezleri
  // =====================================

  /**
   * Get all cost centers
   */
  static async getCostCenters(
    filters?: CostCenterFilterDto
  ): Promise<PaginatedResponse<CostCenterDto>> {
    return ApiService.get<PaginatedResponse<CostCenterDto>>(
      this.getPath('cost-centers'),
      { params: filters }
    );
  }

  /**
   * Get single cost center by ID
   */
  static async getCostCenter(id: number): Promise<CostCenterDto> {
    return ApiService.get<CostCenterDto>(this.getPath(`cost-centers/${id}`));
  }

  /**
   * Create new cost center
   */
  static async createCostCenter(data: CreateCostCenterDto): Promise<CostCenterDto> {
    logger.info('📤 Creating cost center', { metadata: { data } });
    return ApiService.post<CostCenterDto>(this.getPath('cost-centers'), data);
  }

  /**
   * Delete cost center
   */
  static async deleteCostCenter(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`cost-centers/${id}`));
  }

  /**
   * Get cost center hierarchy
   */
  static async getCostCenterHierarchy(): Promise<CostCenterDto[]> {
    return ApiService.get<CostCenterDto[]>(this.getPath('cost-centers/hierarchy'));
  }

  // =====================================
  // ACCOUNTING PERIODS - Muhasebe Dönemleri
  // =====================================

  /**
   * Get all accounting periods
   */
  static async getAccountingPeriods(
    filters?: AccountingPeriodFilterDto
  ): Promise<PaginatedResponse<AccountingPeriodDto>> {
    return ApiService.get<PaginatedResponse<AccountingPeriodDto>>(
      this.getPath('accounting-periods'),
      { params: filters }
    );
  }

  /**
   * Get single accounting period by ID
   */
  static async getAccountingPeriod(id: number): Promise<AccountingPeriodDto> {
    return ApiService.get<AccountingPeriodDto>(this.getPath(`accounting-periods/${id}`));
  }

  /**
   * Get current accounting period
   */
  static async getCurrentAccountingPeriod(): Promise<AccountingPeriodDto> {
    return ApiService.get<AccountingPeriodDto>(this.getPath('accounting-periods/current'));
  }

  /**
   * Create new accounting period
   */
  static async createAccountingPeriod(data: CreateAccountingPeriodDto): Promise<AccountingPeriodDto> {
    logger.info('📤 Creating accounting period', { metadata: { data } });
    return ApiService.post<AccountingPeriodDto>(this.getPath('accounting-periods'), data);
  }

  /**
   * Soft close accounting period
   */
  static async softCloseAccountingPeriod(id: number): Promise<AccountingPeriodDto> {
    return ApiService.post<AccountingPeriodDto>(this.getPath(`accounting-periods/${id}/soft-close`), {});
  }

  /**
   * Hard close accounting period
   */
  static async hardCloseAccountingPeriod(id: number): Promise<AccountingPeriodDto> {
    return ApiService.post<AccountingPeriodDto>(this.getPath(`accounting-periods/${id}/hard-close`), {});
  }

  /**
   * Reopen accounting period
   */
  static async reopenAccountingPeriod(id: number): Promise<AccountingPeriodDto> {
    return ApiService.post<AccountingPeriodDto>(this.getPath(`accounting-periods/${id}/reopen`), {});
  }

  /**
   * Lock accounting period
   */
  static async lockAccountingPeriod(id: number): Promise<AccountingPeriodDto> {
    return ApiService.post<AccountingPeriodDto>(this.getPath(`accounting-periods/${id}/lock`), {});
  }

  /**
   * Unlock accounting period
   */
  static async unlockAccountingPeriod(id: number): Promise<AccountingPeriodDto> {
    return ApiService.post<AccountingPeriodDto>(this.getPath(`accounting-periods/${id}/unlock`), {});
  }

  // =====================================
  // EXCHANGE RATES - Döviz Kurları
  // =====================================

  /**
   * Get all exchange rates with pagination
   */
  static async getExchangeRates(
    filters?: ExchangeRateFilterDto
  ): Promise<PaginatedResponse<ExchangeRateSummaryDto>> {
    return ApiService.get<PaginatedResponse<ExchangeRateSummaryDto>>(
      this.getPath('exchange-rates'),
      { params: filters }
    );
  }

  /**
   * Get single exchange rate by ID
   */
  static async getExchangeRate(id: number): Promise<ExchangeRateDto> {
    return ApiService.get<ExchangeRateDto>(this.getPath(`exchange-rates/${id}`));
  }

  /**
   * Get exchange rate for currency and date
   */
  static async getExchangeRateForDate(
    sourceCurrency: string,
    targetCurrency: string,
    date?: DateTime
  ): Promise<ExchangeRateDto> {
    return ApiService.get<ExchangeRateDto>(
      this.getPath('exchange-rates/for-date'),
      { params: { sourceCurrency, targetCurrency, date } }
    );
  }

  /**
   * Create new exchange rate
   */
  static async createExchangeRate(data: CreateExchangeRateDto): Promise<ExchangeRateDto> {
    logger.info('📤 Creating exchange rate', { metadata: { data } });
    return ApiService.post<ExchangeRateDto>(this.getPath('exchange-rates'), data);
  }

  /**
   * Delete exchange rate
   */
  static async deleteExchangeRate(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`exchange-rates/${id}`));
  }

  /**
   * Fetch TCMB rates
   */
  static async fetchTcmbRates(date?: DateTime): Promise<ExchangeRateDto[]> {
    return ApiService.post<ExchangeRateDto[]>(
      this.getPath('exchange-rates/fetch-tcmb'),
      { date }
    );
  }

  /**
   * Convert currency
   */
  static async convertCurrency(data: CurrencyConversionRequestDto): Promise<CurrencyConversionResultDto> {
    return ApiService.post<CurrencyConversionResultDto>(
      this.getPath('exchange-rates/convert'),
      data
    );
  }

  /**
   * Get all currencies
   */
  static async getCurrencies(): Promise<CurrencyDto[]> {
    return ApiService.get<CurrencyDto[]>(this.getPath('exchange-rates/currencies'));
  }

  /**
   * Get active currencies
   */
  static async getActiveCurrencies(): Promise<CurrencyDto[]> {
    return ApiService.get<CurrencyDto[]>(this.getPath('exchange-rates/currencies/active'));
  }

  // =====================================
  // STATISTICS & REPORTS
  // =====================================

  /**
   * Get finance dashboard statistics
   */
  static async getDashboardStats(
    startDate?: DateTime,
    endDate?: DateTime
  ): Promise<FinanceDashboardStatsDto> {
    return ApiService.get<FinanceDashboardStatsDto>(
      this.getPath('statistics/dashboard'),
      { params: { startDate, endDate } }
    );
  }

  /**
   * Get cash flow report
   */
  static async getCashFlowReport(
    startDate: DateTime,
    endDate: DateTime
  ): Promise<CashFlowReportDto> {
    return ApiService.get<CashFlowReportDto>(
      this.getPath('reports/cash-flow'),
      { params: { startDate, endDate } }
    );
  }

  /**
   * Get receivables aging report
   */
  static async getReceivablesAgingReport(): Promise<AgingReportDto> {
    return ApiService.get<AgingReportDto>(this.getPath('reports/aging/receivables'));
  }

  /**
   * Get payables aging report
   */
  static async getPayablesAgingReport(): Promise<AgingReportDto> {
    return ApiService.get<AgingReportDto>(this.getPath('reports/aging/payables'));
  }

  /**
   * Get revenue vs expenses summary
   */
  static async getRevenueVsExpenses(
    startDate: DateTime,
    endDate: DateTime
  ): Promise<{ revenue: number; expenses: number; net: number }> {
    return ApiService.get<{ revenue: number; expenses: number; net: number }>(
      this.getPath('reports/revenue-vs-expenses'),
      { params: { startDate, endDate } }
    );
  }

  // =====================================
  // BA-BS FORMS - Ba-Bs Formu (GİB)
  // 5.000 TL üzeri işlem bildirimi
  // =====================================

  /**
   * Get all Ba-Bs forms with pagination
   */
  static async getBaBsForms(
    filters?: BaBsFormFilterDto
  ): Promise<PaginatedResponse<BaBsFormSummaryDto>> {
    const params = {
      pageNumber: filters?.pageNumber || 1,
      pageSize: filters?.pageSize || 10,
      searchTerm: filters?.searchTerm,
      formType: filters?.formType,
      status: filters?.status,
      periodYear: filters?.periodYear,
      periodMonth: filters?.periodMonth,
      isCorrection: filters?.isCorrection,
      isOverdue: filters?.isOverdue,
      sortBy: filters?.sortBy,
      sortDescending: filters?.sortDescending,
    };

    return ApiService.get<PaginatedResponse<BaBsFormSummaryDto>>(
      this.getPath('babs-forms'),
      { params }
    );
  }

  /**
   * Get single Ba-Bs form by ID
   */
  static async getBaBsForm(id: number): Promise<BaBsFormDto> {
    return ApiService.get<BaBsFormDto>(this.getPath(`babs-forms/${id}`));
  }

  /**
   * Create new Ba-Bs form
   */
  static async createBaBsForm(data: CreateBaBsFormDto): Promise<BaBsFormDto> {
    logger.info('📤 Creating Ba-Bs form', { metadata: { data } });
    return ApiService.post<BaBsFormDto>(this.getPath('babs-forms'), data);
  }

  /**
   * Update existing Ba-Bs form
   */
  static async updateBaBsForm(id: number, data: UpdateBaBsFormDto): Promise<BaBsFormDto> {
    return ApiService.put<BaBsFormDto>(this.getPath(`babs-forms/${id}`), data);
  }

  /**
   * Delete Ba-Bs form
   */
  static async deleteBaBsForm(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`babs-forms/${id}`));
  }

  /**
   * Approve Ba-Bs form
   */
  static async approveBaBsForm(id: number, data?: ApproveBaBsFormDto): Promise<BaBsFormDto> {
    return ApiService.post<BaBsFormDto>(this.getPath(`babs-forms/${id}/approve`), data || {});
  }

  /**
   * File Ba-Bs form to GİB
   */
  static async fileBaBsForm(id: number, data?: FileBaBsFormDto): Promise<BaBsGibResultDto> {
    return ApiService.post<BaBsGibResultDto>(this.getPath(`babs-forms/${id}/file`), data || {});
  }

  /**
   * Record GİB response for Ba-Bs form
   */
  static async recordBaBsGibResult(id: number, data: BaBsGibResultDto): Promise<BaBsFormDto> {
    return ApiService.post<BaBsFormDto>(this.getPath(`babs-forms/${id}/gib-result`), data);
  }

  /**
   * Cancel Ba-Bs form
   */
  static async cancelBaBsForm(id: number, data: CancelBaBsFormDto): Promise<BaBsFormDto> {
    return ApiService.post<BaBsFormDto>(this.getPath(`babs-forms/${id}/cancel`), data);
  }

  /**
   * Create Ba-Bs correction form
   */
  static async createBaBsCorrection(id: number, data: CreateBaBsCorrectionDto): Promise<BaBsFormDto> {
    logger.info('📤 Creating Ba-Bs correction', { metadata: { originalId: id, data } });
    return ApiService.post<BaBsFormDto>(this.getPath(`babs-forms/${id}/correction`), data);
  }

  /**
   * Validate Ba-Bs form
   */
  static async validateBaBsForm(id: number): Promise<BaBsValidationResultDto> {
    return ApiService.get<BaBsValidationResultDto>(this.getPath(`babs-forms/${id}/validate`));
  }

  /**
   * Get Ba-Bs form statistics
   */
  static async getBaBsFormStats(year?: number): Promise<BaBsFormStatsDto> {
    return ApiService.get<BaBsFormStatsDto>(
      this.getPath('babs-forms/stats'),
      { params: { year } }
    );
  }

  /**
   * Get overdue Ba-Bs forms
   */
  static async getOverdueBaBsForms(): Promise<BaBsFormSummaryDto[]> {
    return ApiService.get<BaBsFormSummaryDto[]>(this.getPath('babs-forms/overdue'));
  }

  /**
   * Generate Ba-Bs form from invoices
   */
  static async generateBaBsFromInvoices(data: GenerateBaBsFromInvoicesDto): Promise<BaBsFormDto> {
    logger.info('📤 Generating Ba-Bs from invoices', { metadata: { data } });
    return ApiService.post<BaBsFormDto>(this.getPath('babs-forms/generate-from-invoices'), data);
  }

  // =====================================
  // TAX DECLARATIONS - Vergi Beyannameleri
  // KDV, Muhtasar, Geçici Vergi vb.
  // =====================================

  /**
   * Get all tax declarations with pagination
   */
  static async getTaxDeclarations(
    filters?: TaxDeclarationFilterDto
  ): Promise<PaginatedResponse<TaxDeclarationSummaryDto>> {
    const params = {
      pageNumber: filters?.pageNumber || 1,
      pageSize: filters?.pageSize || 10,
      searchTerm: filters?.searchTerm,
      declarationType: filters?.declarationType,
      status: filters?.status,
      taxYear: filters?.taxYear,
      taxMonth: filters?.taxMonth,
      taxQuarter: filters?.taxQuarter,
      isAmendment: filters?.isAmendment,
      isOverdue: filters?.isOverdue,
      hasUnpaidBalance: filters?.hasUnpaidBalance,
      sortBy: filters?.sortBy,
      sortDescending: filters?.sortDescending,
    };

    return ApiService.get<PaginatedResponse<TaxDeclarationSummaryDto>>(
      this.getPath('tax-declarations'),
      { params }
    );
  }

  /**
   * Get single tax declaration by ID
   */
  static async getTaxDeclaration(id: number): Promise<TaxDeclarationDto> {
    return ApiService.get<TaxDeclarationDto>(this.getPath(`tax-declarations/${id}`));
  }

  /**
   * Create new tax declaration
   */
  static async createTaxDeclaration(data: CreateTaxDeclarationDto): Promise<TaxDeclarationDto> {
    logger.info('📤 Creating tax declaration', { metadata: { data } });
    return ApiService.post<TaxDeclarationDto>(this.getPath('tax-declarations'), data);
  }

  /**
   * Delete tax declaration
   */
  static async deleteTaxDeclaration(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`tax-declarations/${id}`));
  }

  /**
   * Approve tax declaration
   */
  static async approveTaxDeclaration(id: number, data?: ApproveTaxDeclarationDto): Promise<TaxDeclarationDto> {
    return ApiService.post<TaxDeclarationDto>(this.getPath(`tax-declarations/${id}/approve`), data || {});
  }

  /**
   * File tax declaration to GİB
   */
  static async fileTaxDeclaration(id: number, data?: FileTaxDeclarationDto): Promise<TaxDeclarationGibResultDto> {
    return ApiService.post<TaxDeclarationGibResultDto>(this.getPath(`tax-declarations/${id}/file`), data || {});
  }

  /**
   * Record GİB response for tax declaration
   */
  static async recordTaxDeclarationGibResult(id: number, data: TaxDeclarationGibResultDto): Promise<TaxDeclarationDto> {
    return ApiService.post<TaxDeclarationDto>(this.getPath(`tax-declarations/${id}/gib-result`), data);
  }

  /**
   * Record tax payment
   */
  static async recordTaxPayment(id: number, data: RecordTaxPaymentDto): Promise<TaxDeclarationDto> {
    logger.info('📤 Recording tax payment', { metadata: { declarationId: id, data } });
    return ApiService.post<TaxDeclarationDto>(this.getPath(`tax-declarations/${id}/payments`), data);
  }

  /**
   * Create tax declaration amendment
   */
  static async createTaxAmendment(id: number, data: CreateTaxAmendmentDto): Promise<TaxDeclarationDto> {
    logger.info('📤 Creating tax declaration amendment', { metadata: { originalId: id, data } });
    return ApiService.post<TaxDeclarationDto>(this.getPath(`tax-declarations/${id}/amendment`), data);
  }

  /**
   * Cancel tax declaration
   */
  static async cancelTaxDeclaration(id: number, data: CancelTaxDeclarationDto): Promise<TaxDeclarationDto> {
    return ApiService.post<TaxDeclarationDto>(this.getPath(`tax-declarations/${id}/cancel`), data);
  }

  /**
   * Get tax declaration statistics
   */
  static async getTaxDeclarationStats(year?: number): Promise<TaxDeclarationStatsDto> {
    return ApiService.get<TaxDeclarationStatsDto>(
      this.getPath('tax-declarations/stats'),
      { params: { year } }
    );
  }

  /**
   * Get overdue tax declarations
   */
  static async getOverdueTaxDeclarations(): Promise<TaxDeclarationSummaryDto[]> {
    return ApiService.get<TaxDeclarationSummaryDto[]>(this.getPath('tax-declarations/overdue'));
  }

  /**
   * Get tax calendar items
   */
  static async getTaxCalendar(year: number, month?: number): Promise<TaxCalendarItemDto[]> {
    return ApiService.get<TaxCalendarItemDto[]>(
      this.getPath('tax-declarations/calendar'),
      { params: { year, month } }
    );
  }

  // =====================================
  // VAT & WITHHOLDING REPORTS
  // KDV ve Stopaj Raporları
  // =====================================

  /**
   * Get VAT report for period
   */
  static async getVatReport(year: number, month: number): Promise<VatReportDto> {
    return ApiService.get<VatReportDto>(
      this.getPath('reports/vat'),
      { params: { year, month } }
    );
  }

  /**
   * Get withholding report for period
   */
  static async getWithholdingReport(year: number, month: number): Promise<WithholdingReportDto> {
    return ApiService.get<WithholdingReportDto>(
      this.getPath('reports/withholding'),
      { params: { year, month } }
    );
  }
}

export default FinanceService;
