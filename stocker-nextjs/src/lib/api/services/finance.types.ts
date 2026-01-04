// =====================================
// Finance Module - TypeScript Type Definitions
// Aligned with Backend .NET DTOs
// Turkish Context: Cari Hesap, KDV, Tevkifat, Stopaj
// =====================================

export type Guid = string;
export type DateTime = string; // ISO 8601 format

// =====================================
// ENUMS - Turkish Tax System
// =====================================

/**
 * KDV (Katma Değer Vergisi) - VAT Rates in Turkey
 */
export enum KdvRate {
  Zero = 0,
  One = 1,
  Ten = 10,
  Twenty = 20,
}

/**
 * Invoice Type - Fatura Türü
 */
export enum InvoiceType {
  Sales = 'Sales',
  Purchase = 'Purchase',
  Return = 'Return',
  Proforma = 'Proforma',
  Export = 'Export',
  Import = 'Import',
}

/**
 * Invoice Status - Fatura Durumu
 */
export enum InvoiceStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Approved = 'Approved',
  Sent = 'Sent',
  PartiallyPaid = 'PartiallyPaid',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled',
  Void = 'Void',
}

/**
 * Payment Method - Ödeme Yöntemi
 */
export enum PaymentMethod {
  Cash = 'Cash',
  CreditCard = 'CreditCard',
  BankTransfer = 'BankTransfer',
  Cheque = 'Cheque',
  PromissoryNote = 'PromissoryNote',
  DirectDebit = 'DirectDebit',
  Other = 'Other',
}

/**
 * Payment Status - Ödeme Durumu
 */
export enum PaymentStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Completed = 'Completed',
  Failed = 'Failed',
  Refunded = 'Refunded',
  Cancelled = 'Cancelled',
}

/**
 * Expense Category - Gider Kategorisi
 */
export enum ExpenseCategory {
  Rent = 'Rent',
  Utilities = 'Utilities',
  Salaries = 'Salaries',
  Marketing = 'Marketing',
  Travel = 'Travel',
  Office = 'Office',
  Equipment = 'Equipment',
  Insurance = 'Insurance',
  Taxes = 'Taxes',
  Professional = 'Professional',
  Other = 'Other',
}

/**
 * Expense Status - Gider Durumu
 */
export enum ExpenseStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Paid = 'Paid',
  Cancelled = 'Cancelled',
}

/**
 * Bank Account Type - Banka Hesap Türü
 */
export enum BankAccountType {
  Checking = 'Checking',
  Savings = 'Savings',
  Investment = 'Investment',
  ForeignCurrency = 'ForeignCurrency',
}

/**
 * Bank Account Status
 */
export enum BankAccountStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Closed = 'Closed',
  Frozen = 'Frozen',
}

/**
 * Transaction Type - İşlem Türü
 */
export enum TransactionType {
  Deposit = 'Deposit',
  Withdrawal = 'Withdrawal',
  Transfer = 'Transfer',
  Fee = 'Fee',
  Interest = 'Interest',
  Cheque = 'Cheque',
  DirectDebit = 'DirectDebit',
  Standing = 'Standing',
}

/**
 * Cheque Status - Çek Durumu
 */
export enum ChequeStatus {
  Received = 'Received',
  InPortfolio = 'InPortfolio',
  Endorsed = 'Endorsed',
  Deposited = 'Deposited',
  Cleared = 'Cleared',
  Bounced = 'Bounced',
  Cancelled = 'Cancelled',
}

/**
 * Cheque Type - Çek Türü
 */
export enum ChequeType {
  Received = 'Received',
  Given = 'Given',
}

/**
 * Promissory Note Status - Senet Durumu
 */
export enum PromissoryNoteStatus {
  Active = 'Active',
  Endorsed = 'Endorsed',
  Collected = 'Collected',
  Protested = 'Protested',
  Cancelled = 'Cancelled',
}

/**
 * Promissory Note Type - Senet Türü
 */
export enum PromissoryNoteType {
  Receivable = 'Receivable',
  Payable = 'Payable',
}

/**
 * Loan Type - Kredi Türü
 */
export enum LoanType {
  Commercial = 'Commercial',
  Investment = 'Investment',
  WorkingCapital = 'WorkingCapital',
  Equipment = 'Equipment',
  RealEstate = 'RealEstate',
  Vehicle = 'Vehicle',
  Other = 'Other',
}

/**
 * Loan Status - Kredi Durumu
 */
export enum LoanStatus {
  Active = 'Active',
  PaidOff = 'PaidOff',
  Defaulted = 'Defaulted',
  Restructured = 'Restructured',
  Cancelled = 'Cancelled',
}

/**
 * Fixed Asset Status - Duran Varlık Durumu
 */
export enum FixedAssetStatus {
  Active = 'Active',
  Disposed = 'Disposed',
  Sold = 'Sold',
  Scrapped = 'Scrapped',
  UnderMaintenance = 'UnderMaintenance',
}

/**
 * Depreciation Method - Amortisman Yöntemi
 */
export enum DepreciationMethod {
  StraightLine = 'StraightLine',
  DecliningBalance = 'DecliningBalance',
  DoubleDeclining = 'DoubleDeclining',
  SumOfYears = 'SumOfYears',
  Units = 'Units',
}

/**
 * Budget Status - Bütçe Durumu
 */
export enum BudgetStatus {
  Draft = 'Draft',
  Approved = 'Approved',
  Active = 'Active',
  Closed = 'Closed',
  Cancelled = 'Cancelled',
}

/**
 * Budget Period - Bütçe Dönemi
 */
export enum BudgetPeriod {
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  Annual = 'Annual',
  Custom = 'Custom',
}

/**
 * Accounting Period Status - Muhasebe Dönemi Durumu
 */
export enum AccountingPeriodStatus {
  Open = 'Open',
  SoftClosed = 'SoftClosed',
  HardClosed = 'HardClosed',
  Locked = 'Locked',
}

/**
 * Accounting Period Type - Muhasebe Dönemi Türü
 */
export enum AccountingPeriodType {
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  Annual = 'Annual',
  Custom = 'Custom',
}

/**
 * Exchange Rate Type - Döviz Kuru Türü
 */
export enum ExchangeRateType {
  Daily = 'Daily',
  Monthly = 'Monthly',
  Custom = 'Custom',
}

/**
 * Exchange Rate Source - Döviz Kuru Kaynağı
 */
export enum ExchangeRateSource {
  TCMB = 'TCMB',
  Manual = 'Manual',
  API = 'API',
}

/**
 * Exchange Rate Trend
 */
export enum ExchangeRateTrend {
  Up = 'Up',
  Down = 'Down',
  Stable = 'Stable',
}

/**
 * Current Account Type - Cari Hesap Türü
 */
export enum CurrentAccountType {
  Customer = 'Customer',
  Supplier = 'Supplier',
  Both = 'Both',
}

/**
 * Current Account Transaction Type - Cari Hesap Hareket Türü
 */
export enum CurrentAccountTransactionType {
  Invoice = 'Invoice',
  Payment = 'Payment',
  CreditNote = 'CreditNote',
  DebitNote = 'DebitNote',
  OpeningBalance = 'OpeningBalance',
  Adjustment = 'Adjustment',
}

// =====================================
// INVOICE DTOS - Fatura
// =====================================

/**
 * Invoice DTO - Fatura
 */
export interface InvoiceDto {
  id: number;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  status: InvoiceStatus;

  // Related Entities
  customerId?: Guid;
  customerName?: string;
  supplierId?: Guid;
  supplierName?: string;

  // Dates
  invoiceDate: DateTime;
  dueDate: DateTime;
  paidDate?: DateTime;

  // Amounts (TRY Base)
  subtotal: number;
  discountAmount: number;
  discountRate?: number;

  // Turkish Tax Calculations
  kdvRate: KdvRate;
  kdvAmount: number;
  tevkifatRate?: number;      // Withholding tax rate (Tevkifat)
  tevkifatAmount?: number;
  stopajRate?: number;        // Stopaj rate
  stopajAmount?: number;

  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;

  // Currency
  currency: string;           // Default: TRY
  exchangeRate?: number;
  originalAmount?: number;    // Amount in original currency

  // E-Invoice (e-Fatura) Information
  isEInvoice: boolean;
  eInvoiceStatus?: string;
  eInvoiceId?: string;

  // Additional Info
  description?: string;
  notes?: string;
  referenceNumber?: string;
  poNumber?: string;

  // Items
  items?: InvoiceItemDto[];

  // Audit
  createdAt: DateTime;
  updatedAt?: DateTime;
  createdBy?: string;
}

/**
 * Invoice Item DTO - Fatura Kalemi
 */
export interface InvoiceItemDto {
  id: number;
  invoiceId: number;
  productId?: number;
  productName?: string;
  productCode?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  discountAmount: number;
  kdvRate: KdvRate;
  kdvAmount: number;
  totalAmount: number;
  sortOrder: number;
}

/**
 * Invoice Summary DTO
 */
export interface InvoiceSummaryDto {
  id: number;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  status: InvoiceStatus;
  customerName?: string;
  supplierName?: string;
  invoiceDate: DateTime;
  dueDate: DateTime;
  totalAmount: number;
  remainingAmount: number;
  currency: string;
  isOverdue: boolean;
}

/**
 * Invoice Filter DTO
 */
export interface InvoiceFilterDto {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  invoiceType?: InvoiceType;
  status?: InvoiceStatus;
  customerId?: Guid;
  supplierId?: Guid;
  startDate?: DateTime;
  endDate?: DateTime;
  minAmount?: number;
  maxAmount?: number;
  isOverdue?: boolean;
  currency?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

/**
 * Create Invoice DTO
 */
export interface CreateInvoiceDto {
  invoiceType: InvoiceType;
  customerId?: Guid;
  supplierId?: Guid;
  invoiceDate: DateTime;
  dueDate: DateTime;
  kdvRate: KdvRate;
  currency?: string;
  exchangeRate?: number;
  discountRate?: number;
  tevkifatRate?: number;
  stopajRate?: number;
  description?: string;
  notes?: string;
  referenceNumber?: string;
  poNumber?: string;
  items: CreateInvoiceItemDto[];
}

/**
 * Create Invoice Item DTO
 */
export interface CreateInvoiceItemDto {
  productId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  kdvRate: KdvRate;
}

/**
 * Update Invoice DTO
 */
export interface UpdateInvoiceDto {
  dueDate?: DateTime;
  discountRate?: number;
  tevkifatRate?: number;
  stopajRate?: number;
  description?: string;
  notes?: string;
  referenceNumber?: string;
  poNumber?: string;
}

// =====================================
// CURRENT ACCOUNT DTOS - Cari Hesap
// =====================================

/**
 * Current Account DTO - Cari Hesap
 * Links CRM Customer to Finance
 */
export interface CurrentAccountDto {
  id: number;
  accountCode: string;
  accountName: string;
  accountType: CurrentAccountType;

  // Link to CRM
  customerId?: Guid;
  customerName?: string;

  // Contact Info
  email?: string;
  phone?: string;
  address?: string;

  // Tax Info (Turkey)
  taxId?: string;              // Vergi No
  taxOffice?: string;          // Vergi Dairesi

  // Balance Information
  debitTotal: number;          // Borç toplamı
  creditTotal: number;         // Alacak toplamı
  balance: number;             // Bakiye (+ = Alacak, - = Borç)
  currency: string;

  // Credit Info
  creditLimit: number;
  availableCredit: number;
  riskAmount: number;

  // Status
  isActive: boolean;
  isBlocked: boolean;
  blockReason?: string;

  // Payment Terms
  defaultPaymentTermDays: number;
  defaultPaymentMethod?: PaymentMethod;

  // Statistics
  totalInvoices: number;
  unpaidInvoices: number;
  averagePaymentDays?: number;
  lastTransactionDate?: DateTime;

  // Audit
  createdAt: DateTime;
  updatedAt?: DateTime;
}

/**
 * Current Account Summary DTO
 */
export interface CurrentAccountSummaryDto {
  id: number;
  accountCode: string;
  accountName: string;
  accountType: CurrentAccountType;
  balance: number;
  currency: string;
  creditLimit: number;
  isBlocked: boolean;
  unpaidInvoices: number;
}

/**
 * Current Account Filter DTO
 */
export interface CurrentAccountFilterDto {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  accountType?: CurrentAccountType;
  isActive?: boolean;
  isBlocked?: boolean;
  hasBalance?: boolean;
  minBalance?: number;
  maxBalance?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

/**
 * Current Account Transaction DTO - Cari Hareket
 */
export interface CurrentAccountTransactionDto {
  id: number;
  currentAccountId: number;
  transactionType: CurrentAccountTransactionType;
  transactionDate: DateTime;
  documentNumber?: string;
  documentId?: number;
  description?: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  currency: string;
  exchangeRate?: number;
  notes?: string;
  createdAt: DateTime;
}

/**
 * Current Account Statement DTO - Cari Hesap Ekstresi
 */
export interface CurrentAccountStatementDto {
  accountId: number;
  accountCode: string;
  accountName: string;
  startDate: DateTime;
  endDate: DateTime;
  openingBalance: number;
  closingBalance: number;
  totalDebit: number;
  totalCredit: number;
  transactions: CurrentAccountTransactionDto[];
}

/**
 * Create Current Account DTO
 */
export interface CreateCurrentAccountDto {
  accountCode?: string;
  accountName: string;
  accountType: CurrentAccountType;
  customerId?: Guid;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  taxOffice?: string;
  creditLimit?: number;
  defaultPaymentTermDays?: number;
  defaultPaymentMethod?: PaymentMethod;
}

/**
 * Update Current Account DTO
 */
export interface UpdateCurrentAccountDto {
  accountName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  taxOffice?: string;
  creditLimit?: number;
  defaultPaymentTermDays?: number;
  defaultPaymentMethod?: PaymentMethod;
  isActive?: boolean;
}

// =====================================
// EXPENSE DTOS - Gider
// =====================================

/**
 * Expense DTO - Gider
 */
export interface ExpenseDto {
  id: number;
  expenseNumber: string;
  category: ExpenseCategory;
  status: ExpenseStatus;

  // Details
  description: string;
  amount: number;
  currency: string;
  exchangeRate?: number;
  amountInTry: number;

  // Tax
  kdvRate: KdvRate;
  kdvAmount: number;
  netAmount: number;

  // Dates
  expenseDate: DateTime;
  paymentDate?: DateTime;

  // Payment
  paymentMethod?: PaymentMethod;
  isPaid: boolean;

  // References
  supplierId?: Guid;
  supplierName?: string;
  invoiceNumber?: string;
  receiptNumber?: string;

  // Cost Center & Budget
  costCenterId?: number;
  costCenterName?: string;
  budgetId?: number;
  budgetName?: string;

  // Approval
  approvedBy?: string;
  approvedAt?: DateTime;
  rejectionReason?: string;

  // Attachments
  hasAttachments: boolean;
  attachmentCount: number;

  // Notes
  notes?: string;
  tags?: string;

  // Audit
  createdAt: DateTime;
  updatedAt?: DateTime;
  createdBy?: string;
}

/**
 * Expense Summary DTO
 */
export interface ExpenseSummaryDto {
  id: number;
  expenseNumber: string;
  category: ExpenseCategory;
  status: ExpenseStatus;
  description: string;
  amount: number;
  currency: string;
  expenseDate: DateTime;
  supplierName?: string;
  isPaid: boolean;
}

/**
 * Expense Filter DTO
 */
export interface ExpenseFilterDto {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  supplierId?: Guid;
  costCenterId?: number;
  budgetId?: number;
  startDate?: DateTime;
  endDate?: DateTime;
  minAmount?: number;
  maxAmount?: number;
  isPaid?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
}

/**
 * Create Expense DTO
 */
export interface CreateExpenseDto {
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency?: string;
  exchangeRate?: number;
  kdvRate?: KdvRate;
  expenseDate: DateTime;
  paymentMethod?: PaymentMethod;
  supplierId?: Guid;
  invoiceNumber?: string;
  receiptNumber?: string;
  costCenterId?: number;
  budgetId?: number;
  notes?: string;
  tags?: string;
}

/**
 * Update Expense DTO
 */
export interface UpdateExpenseDto {
  category?: ExpenseCategory;
  description?: string;
  amount?: number;
  kdvRate?: KdvRate;
  expenseDate?: DateTime;
  paymentMethod?: PaymentMethod;
  invoiceNumber?: string;
  receiptNumber?: string;
  costCenterId?: number;
  budgetId?: number;
  notes?: string;
  tags?: string;
}

// =====================================
// PAYMENT DTOS - Ödeme
// =====================================

/**
 * Payment DTO - Ödeme
 */
export interface PaymentDto {
  id: number;
  paymentNumber: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;

  // Related Entities
  currentAccountId?: number;
  currentAccountName?: string;
  invoiceId?: number;
  invoiceNumber?: string;

  // Amount
  amount: number;
  currency: string;
  exchangeRate?: number;
  amountInTry: number;

  // Dates
  paymentDate: DateTime;
  valueDate?: DateTime;

  // Bank Info
  bankAccountId?: number;
  bankAccountName?: string;
  transactionReference?: string;

  // Cheque/Note Info
  chequeId?: number;
  promissoryNoteId?: number;

  // Description
  description?: string;
  notes?: string;

  // Audit
  createdAt: DateTime;
  updatedAt?: DateTime;
  createdBy?: string;
}

/**
 * Payment Summary DTO
 */
export interface PaymentSummaryDto {
  id: number;
  paymentNumber: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  currentAccountName?: string;
  amount: number;
  currency: string;
  paymentDate: DateTime;
}

/**
 * Payment Filter DTO
 */
export interface PaymentFilterDto {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  currentAccountId?: number;
  bankAccountId?: number;
  startDate?: DateTime;
  endDate?: DateTime;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

/**
 * Create Payment DTO
 */
export interface CreatePaymentDto {
  paymentMethod: PaymentMethod;
  currentAccountId?: number;
  invoiceId?: number;
  amount: number;
  currency?: string;
  exchangeRate?: number;
  paymentDate: DateTime;
  valueDate?: DateTime;
  bankAccountId?: number;
  transactionReference?: string;
  description?: string;
  notes?: string;
}

/**
 * Receive Payment DTO - Tahsilat
 */
export interface ReceivePaymentDto {
  currentAccountId: number;
  invoiceIds?: number[];
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  paymentDate: DateTime;
  bankAccountId?: number;
  description?: string;
}

/**
 * Make Payment DTO - Ödeme Yapma
 */
export interface MakePaymentDto {
  currentAccountId: number;
  invoiceIds?: number[];
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  paymentDate: DateTime;
  bankAccountId?: number;
  description?: string;
}

// =====================================
// BANK ACCOUNT DTOS - Banka Hesabı
// =====================================

/**
 * Bank Account DTO - Banka Hesabı
 */
export interface BankAccountDto {
  id: number;
  accountName: string;
  accountNumber: string;
  iban?: string;
  bankName: string;
  bankCode?: string;
  branchName?: string;
  branchCode?: string;
  accountType: BankAccountType;
  status: BankAccountStatus;
  currency: string;

  // Balance
  currentBalance: number;
  availableBalance: number;

  // Opening Info
  openingBalance: number;
  openingDate: DateTime;

  // Interest & Fees
  interestRate?: number;
  overdraftLimit?: number;

  // Contact
  contactPerson?: string;
  contactPhone?: string;

  // Status
  isDefault: boolean;
  isActive: boolean;

  // Audit
  createdAt: DateTime;
  updatedAt?: DateTime;
  lastReconciliationDate?: DateTime;
}

/**
 * Bank Account Summary DTO
 */
export interface BankAccountSummaryDto {
  id: number;
  accountName: string;
  bankName: string;
  accountType: BankAccountType;
  currency: string;
  currentBalance: number;
  isDefault: boolean;
  isActive: boolean;
}

/**
 * Bank Account Filter DTO
 */
export interface BankAccountFilterDto {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  accountType?: BankAccountType;
  status?: BankAccountStatus;
  currency?: string;
  bankName?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
}

/**
 * Create Bank Account DTO
 */
export interface CreateBankAccountDto {
  accountName: string;
  accountNumber: string;
  iban?: string;
  bankName: string;
  bankCode?: string;
  branchName?: string;
  branchCode?: string;
  accountType: BankAccountType;
  currency: string;
  openingBalance?: number;
  openingDate?: DateTime;
  interestRate?: number;
  overdraftLimit?: number;
  contactPerson?: string;
  contactPhone?: string;
  isDefault?: boolean;
}

/**
 * Update Bank Account DTO
 */
export interface UpdateBankAccountDto {
  accountName?: string;
  branchName?: string;
  branchCode?: string;
  interestRate?: number;
  overdraftLimit?: number;
  contactPerson?: string;
  contactPhone?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

// =====================================
// BANK TRANSACTION DTOS - Banka İşlemleri
// =====================================

/**
 * Bank Transaction DTO - Banka Hareketi
 */
export interface BankTransactionDto {
  id: number;
  bankAccountId: number;
  bankAccountName?: string;
  transactionType: TransactionType;
  transactionDate: DateTime;
  valueDate?: DateTime;

  // Amount
  amount: number;
  currency: string;
  balanceAfter: number;

  // Reference
  referenceNumber?: string;
  description?: string;

  // Related Entities
  paymentId?: number;
  currentAccountId?: number;
  currentAccountName?: string;

  // Bank Info
  counterpartyName?: string;
  counterpartyIban?: string;

  // Reconciliation
  isReconciled: boolean;
  reconciledAt?: DateTime;
  reconciledBy?: string;

  // Audit
  createdAt: DateTime;
}

/**
 * Bank Transaction Filter DTO
 */
export interface BankTransactionFilterDto {
  pageNumber?: number;
  pageSize?: number;
  bankAccountId?: number;
  transactionType?: TransactionType;
  startDate?: DateTime;
  endDate?: DateTime;
  minAmount?: number;
  maxAmount?: number;
  isReconciled?: boolean;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

/**
 * Create Bank Transaction DTO
 */
export interface CreateBankTransactionDto {
  bankAccountId: number;
  transactionType: TransactionType;
  transactionDate: DateTime;
  valueDate?: DateTime;
  amount: number;
  referenceNumber?: string;
  description?: string;
  currentAccountId?: number;
  counterpartyName?: string;
  counterpartyIban?: string;
}

// =====================================
// CHEQUE DTOS - Çek
// =====================================

/**
 * Cheque DTO - Çek
 */
export interface ChequeDto {
  id: number;
  chequeNumber: string;
  chequeType: ChequeType;
  status: ChequeStatus;

  // Bank Info
  bankName: string;
  branchName?: string;
  accountNumber?: string;

  // Amount
  amount: number;
  currency: string;

  // Dates
  issueDate: DateTime;
  dueDate: DateTime;
  clearingDate?: DateTime;

  // Parties
  drawerName?: string;        // Keşideci
  payeeName?: string;         // Lehtar
  endorsedTo?: string;        // Ciro edilen

  // Related Entities
  currentAccountId?: number;
  currentAccountName?: string;
  bankAccountId?: number;

  // Status Info
  bouncedReason?: string;
  endorsementCount: number;

  // Notes
  description?: string;
  notes?: string;

  // Audit
  createdAt: DateTime;
  updatedAt?: DateTime;
}

/**
 * Cheque Summary DTO
 */
export interface ChequeSummaryDto {
  id: number;
  chequeNumber: string;
  chequeType: ChequeType;
  status: ChequeStatus;
  bankName: string;
  amount: number;
  currency: string;
  dueDate: DateTime;
  currentAccountName?: string;
}

/**
 * Cheque Filter DTO
 */
export interface ChequeFilterDto {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  chequeType?: ChequeType;
  status?: ChequeStatus;
  currentAccountId?: number;
  bankAccountId?: number;
  startDate?: DateTime;
  endDate?: DateTime;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

/**
 * Create Cheque DTO
 */
export interface CreateChequeDto {
  chequeNumber: string;
  chequeType: ChequeType;
  bankName: string;
  branchName?: string;
  accountNumber?: string;
  amount: number;
  currency?: string;
  issueDate: DateTime;
  dueDate: DateTime;
  drawerName?: string;
  payeeName?: string;
  currentAccountId?: number;
  description?: string;
  notes?: string;
}

/**
 * Update Cheque Status DTO
 */
export interface UpdateChequeStatusDto {
  status: ChequeStatus;
  clearingDate?: DateTime;
  bouncedReason?: string;
  bankAccountId?: number;
  notes?: string;
}

// =====================================
// PROMISSORY NOTE DTOS - Senet
// =====================================

/**
 * Promissory Note DTO - Senet
 */
export interface PromissoryNoteDto {
  id: number;
  noteNumber: string;
  noteType: PromissoryNoteType;
  status: PromissoryNoteStatus;

  // Amount
  amount: number;
  currency: string;

  // Dates
  issueDate: DateTime;
  dueDate: DateTime;
  collectionDate?: DateTime;

  // Parties
  drawerName?: string;        // Keşideci
  payeeName?: string;         // Lehtar
  endorsedTo?: string;        // Ciro edilen

  // Location
  issuePlace?: string;
  paymentPlace?: string;

  // Related Entities
  currentAccountId?: number;
  currentAccountName?: string;

  // Status Info
  protestReason?: string;
  endorsementCount: number;

  // Notes
  description?: string;
  notes?: string;

  // Audit
  createdAt: DateTime;
  updatedAt?: DateTime;
}

/**
 * Promissory Note Filter DTO
 */
export interface PromissoryNoteFilterDto {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  noteType?: PromissoryNoteType;
  status?: PromissoryNoteStatus;
  currentAccountId?: number;
  startDate?: DateTime;
  endDate?: DateTime;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

/**
 * Create Promissory Note DTO
 */
export interface CreatePromissoryNoteDto {
  noteNumber: string;
  noteType: PromissoryNoteType;
  amount: number;
  currency?: string;
  issueDate: DateTime;
  dueDate: DateTime;
  drawerName?: string;
  payeeName?: string;
  issuePlace?: string;
  paymentPlace?: string;
  currentAccountId?: number;
  description?: string;
  notes?: string;
}

// =====================================
// LOAN DTOS - Kredi
// =====================================

/**
 * Loan DTO - Kredi
 */
export interface LoanDto {
  id: number;
  loanNumber: string;
  loanType: LoanType;
  status: LoanStatus;

  // Bank Info
  bankName: string;
  bankAccountId?: number;

  // Amount
  principalAmount: number;
  currency: string;
  interestRate: number;

  // Dates
  startDate: DateTime;
  endDate: DateTime;

  // Payment Schedule
  totalInstallments: number;
  paidInstallments: number;
  remainingInstallments: number;
  installmentAmount: number;

  // Current Status
  outstandingPrincipal: number;
  outstandingInterest: number;
  totalOutstanding: number;
  totalPaid: number;
  totalInterestPaid: number;

  // Next Payment
  nextPaymentDate?: DateTime;
  nextPaymentAmount?: number;

  // Early Payment
  earlyPaymentPenaltyRate?: number;

  // Notes
  purpose?: string;
  collateral?: string;
  notes?: string;

  // Audit
  createdAt: DateTime;
  updatedAt?: DateTime;
}

/**
 * Loan Installment DTO - Kredi Taksiti
 */
export interface LoanInstallmentDto {
  id: number;
  loanId: number;
  installmentNumber: number;
  dueDate: DateTime;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  isPaid: boolean;
  paidDate?: DateTime;
  paidAmount?: number;
  lateFee?: number;
}

/**
 * Loan Filter DTO
 */
export interface LoanFilterDto {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  loanType?: LoanType;
  status?: LoanStatus;
  bankName?: string;
  startDate?: DateTime;
  endDate?: DateTime;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

/**
 * Create Loan DTO
 */
export interface CreateLoanDto {
  loanType: LoanType;
  bankName: string;
  bankAccountId?: number;
  principalAmount: number;
  currency?: string;
  interestRate: number;
  startDate: DateTime;
  endDate: DateTime;
  totalInstallments: number;
  installmentAmount: number;
  earlyPaymentPenaltyRate?: number;
  purpose?: string;
  collateral?: string;
  notes?: string;
}

// =====================================
// FIXED ASSET DTOS - Sabit Kıymet
// =====================================

/**
 * Fixed Asset DTO - Sabit Kıymet (Duran Varlık)
 */
export interface FixedAssetDto {
  id: number;
  assetCode: string;
  assetName: string;
  status: FixedAssetStatus;

  // Category
  categoryId?: number;
  categoryName?: string;

  // Value
  acquisitionCost: number;
  acquisitionDate: DateTime;
  currentValue: number;
  salvageValue: number;
  currency: string;

  // Depreciation
  depreciationMethod: DepreciationMethod;
  usefulLifeYears: number;
  depreciationRate: number;
  accumulatedDepreciation: number;
  monthlyDepreciation: number;

  // Location
  location?: string;
  department?: string;
  responsiblePerson?: string;

  // Vendor Info
  supplierId?: Guid;
  supplierName?: string;
  invoiceNumber?: string;
  warrantyEndDate?: DateTime;

  // Identification
  serialNumber?: string;
  barcode?: string;

  // Disposal
  disposalDate?: DateTime;
  disposalValue?: number;
  disposalReason?: string;

  // Notes
  description?: string;
  notes?: string;

  // Audit
  createdAt: DateTime;
  updatedAt?: DateTime;
}

/**
 * Fixed Asset Filter DTO
 */
export interface FixedAssetFilterDto {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: FixedAssetStatus;
  categoryId?: number;
  location?: string;
  department?: string;
  startDate?: DateTime;
  endDate?: DateTime;
  sortBy?: string;
  sortDescending?: boolean;
}

/**
 * Create Fixed Asset DTO
 */
export interface CreateFixedAssetDto {
  assetCode?: string;
  assetName: string;
  categoryId?: number;
  acquisitionCost: number;
  acquisitionDate: DateTime;
  salvageValue?: number;
  currency?: string;
  depreciationMethod: DepreciationMethod;
  usefulLifeYears: number;
  location?: string;
  department?: string;
  responsiblePerson?: string;
  supplierId?: Guid;
  invoiceNumber?: string;
  warrantyEndDate?: DateTime;
  serialNumber?: string;
  barcode?: string;
  description?: string;
  notes?: string;
}

// =====================================
// BUDGET DTOS - Bütçe
// =====================================

/**
 * Budget DTO - Bütçe
 */
export interface BudgetDto {
  id: number;
  budgetCode: string;
  budgetName: string;
  status: BudgetStatus;
  period: BudgetPeriod;

  // Dates
  startDate: DateTime;
  endDate: DateTime;
  fiscalYear: number;

  // Amounts
  totalAmount: number;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  currency: string;

  // Utilization
  utilizationRate: number;

  // Cost Center
  costCenterId?: number;
  costCenterName?: string;

  // Department
  departmentId?: number;
  departmentName?: string;

  // Approval
  approvedBy?: string;
  approvedAt?: DateTime;

  // Notes
  description?: string;
  notes?: string;

  // Items
  items?: BudgetItemDto[];

  // Audit
  createdAt: DateTime;
  updatedAt?: DateTime;
}

/**
 * Budget Item DTO - Bütçe Kalemi
 */
export interface BudgetItemDto {
  id: number;
  budgetId: number;
  categoryId?: number;
  categoryName?: string;
  description: string;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
}

/**
 * Budget Filter DTO
 */
export interface BudgetFilterDto {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: BudgetStatus;
  period?: BudgetPeriod;
  fiscalYear?: number;
  costCenterId?: number;
  departmentId?: number;
  startDate?: DateTime;
  endDate?: DateTime;
  sortBy?: string;
  sortDescending?: boolean;
}

/**
 * Create Budget DTO
 */
export interface CreateBudgetDto {
  budgetCode?: string;
  budgetName: string;
  period: BudgetPeriod;
  startDate: DateTime;
  endDate: DateTime;
  fiscalYear: number;
  totalAmount: number;
  currency?: string;
  costCenterId?: number;
  departmentId?: number;
  description?: string;
  notes?: string;
  items?: CreateBudgetItemDto[];
}

/**
 * Create Budget Item DTO
 */
export interface CreateBudgetItemDto {
  categoryId?: number;
  description: string;
  plannedAmount: number;
}

// =====================================
// COST CENTER DTOS - Maliyet Merkezi
// =====================================

/**
 * Cost Center DTO - Maliyet Merkezi
 */
export interface CostCenterDto {
  id: number;
  code: string;
  name: string;
  description?: string;

  // Hierarchy
  parentId?: number;
  parentName?: string;
  level: number;
  path?: string;

  // Manager
  managerId?: number;
  managerName?: string;

  // Budget
  budgetAmount?: number;
  spentAmount?: number;
  remainingAmount?: number;
  currency: string;

  // Status
  isActive: boolean;

  // Audit
  createdAt: DateTime;
  updatedAt?: DateTime;
}

/**
 * Cost Center Filter DTO
 */
export interface CostCenterFilterDto {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  parentId?: number;
  isActive?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
}

/**
 * Create Cost Center DTO
 */
export interface CreateCostCenterDto {
  code: string;
  name: string;
  description?: string;
  parentId?: number;
  managerId?: number;
  budgetAmount?: number;
  currency?: string;
}

// =====================================
// ACCOUNTING PERIOD DTOS - Muhasebe Dönemi
// =====================================

/**
 * Accounting Period DTO - Muhasebe Dönemi
 */
export interface AccountingPeriodDto {
  id: number;
  periodName: string;
  periodType: AccountingPeriodType;
  status: AccountingPeriodStatus;

  // Dates
  startDate: DateTime;
  endDate: DateTime;
  fiscalYear: number;
  quarter?: number;
  month?: number;

  // Closing Info
  closedAt?: DateTime;
  closedBy?: string;
  reopenedAt?: DateTime;
  reopenedBy?: string;

  // Lock Info
  isLocked: boolean;
  lockedAt?: DateTime;
  lockedBy?: string;

  // Restrictions
  allowPostings: boolean;
  allowAdjustments: boolean;

  // Tax Filing
  vatFiledAt?: DateTime;
  taxFiledAt?: DateTime;

  // Notes
  notes?: string;

  // Audit
  createdAt: DateTime;
  updatedAt?: DateTime;
}

/**
 * Accounting Period Filter DTO
 */
export interface AccountingPeriodFilterDto {
  pageNumber?: number;
  pageSize?: number;
  periodType?: AccountingPeriodType;
  status?: AccountingPeriodStatus;
  fiscalYear?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

/**
 * Create Accounting Period DTO
 */
export interface CreateAccountingPeriodDto {
  periodName: string;
  periodType: AccountingPeriodType;
  startDate: DateTime;
  endDate: DateTime;
  fiscalYear: number;
  quarter?: number;
  month?: number;
  notes?: string;
}

// =====================================
// EXCHANGE RATE DTOS - Döviz Kuru
// =====================================

/**
 * Exchange Rate DTO - Döviz Kuru
 */
export interface ExchangeRateDto {
  id: number;

  // Basic Info
  sourceCurrency: string;
  targetCurrency: string;
  currencyIsoCode: string;
  rateDate: DateTime;
  rateType: ExchangeRateType;
  rateTypeName: string;

  // Rate Values
  forexBuying?: number;
  forexSelling?: number;
  banknoteBuying?: number;
  banknoteSelling?: number;
  averageRate: number;
  crossRate?: number;
  unit: number;

  // TCMB Info
  isTcmbRate: boolean;
  tcmbBulletinNumber?: string;
  currencyName?: string;
  currencyNameTurkish?: string;

  // Change Info
  previousRate?: number;
  changeAmount?: number;
  changePercentage?: number;
  trend: ExchangeRateTrend;
  trendName: string;

  // Source Info
  source: ExchangeRateSource;
  sourceName: string;
  isManualEntry: boolean;
  integrationDate?: DateTime;
  enteredByUserId?: number;

  // Status
  isActive: boolean;
  isValid: boolean;
  isDefaultForDate: boolean;
  notes?: string;

  // Audit
  createdAt: DateTime;
  updatedAt?: DateTime;
}

/**
 * Exchange Rate Summary DTO
 */
export interface ExchangeRateSummaryDto {
  id: number;
  sourceCurrency: string;
  targetCurrency: string;
  rateDate: DateTime;
  rateType: ExchangeRateType;
  rateTypeName: string;
  forexBuying?: number;
  forexSelling?: number;
  averageRate: number;
  unit: number;
  source: ExchangeRateSource;
  sourceName: string;
  trend: ExchangeRateTrend;
  changePercentage?: number;
  isActive: boolean;
  isDefaultForDate: boolean;
}

/**
 * Exchange Rate Filter DTO
 */
export interface ExchangeRateFilterDto {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sourceCurrency?: string;
  targetCurrency?: string;
  rateType?: ExchangeRateType;
  source?: ExchangeRateSource;
  startDate?: DateTime;
  endDate?: DateTime;
  isActive?: boolean;
  isTcmbRate?: boolean;
  isManualEntry?: boolean;
  isDefaultForDate?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
}

/**
 * Create Exchange Rate DTO
 */
export interface CreateExchangeRateDto {
  sourceCurrency: string;
  targetCurrency: string;
  rateDate: DateTime;
  averageRate: number;
  rateType?: ExchangeRateType;
  source?: ExchangeRateSource;
  unit?: number;
  forexBuying?: number;
  forexSelling?: number;
  banknoteBuying?: number;
  banknoteSelling?: number;
  notes?: string;
}

/**
 * Currency Conversion Request DTO
 */
export interface CurrencyConversionRequestDto {
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
  rateDate?: DateTime;
  useBuyingRate: boolean;
}

/**
 * Currency Conversion Result DTO
 */
export interface CurrencyConversionResultDto {
  sourceAmount: number;
  sourceCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  rateDate: DateTime;
  rateSource: ExchangeRateSource;
}

/**
 * Currency DTO - Para Birimi
 */
export interface CurrencyDto {
  id: number;
  isoCode: string;
  numericCode: string;
  name: string;
  nameTurkish?: string;
  symbol: string;
  decimalPlaces: number;
  country?: string;
  isActive: boolean;
  isBaseCurrency: boolean;
  sortOrder: number;
}

// =====================================
// STATISTICS & REPORTS
// =====================================

/**
 * Finance Dashboard Stats DTO
 */
export interface FinanceDashboardStatsDto {
  // Revenue & Expenses
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;

  // Receivables & Payables
  totalReceivables: number;
  totalPayables: number;
  overdueReceivables: number;
  overduePayables: number;

  // Cash Flow
  cashInflow: number;
  cashOutflow: number;
  netCashFlow: number;

  // Bank Balances
  totalBankBalance: number;
  bankBalancesByCurrency: { currency: string; balance: number }[];

  // Invoices
  pendingInvoices: number;
  overdueInvoices: number;

  // Budget
  budgetUtilization: number;

  // Period
  periodStart: DateTime;
  periodEnd: DateTime;
}

/**
 * Cash Flow Report DTO
 */
export interface CashFlowReportDto {
  periodStart: DateTime;
  periodEnd: DateTime;
  openingBalance: number;
  closingBalance: number;

  // Operating Activities
  operatingInflows: number;
  operatingOutflows: number;
  netOperating: number;

  // Investing Activities
  investingInflows: number;
  investingOutflows: number;
  netInvesting: number;

  // Financing Activities
  financingInflows: number;
  financingOutflows: number;
  netFinancing: number;

  // Net Change
  netCashChange: number;

  // Details
  transactions: CashFlowTransactionDto[];
}

/**
 * Cash Flow Transaction DTO
 */
export interface CashFlowTransactionDto {
  date: DateTime;
  description: string;
  category: string;
  type: 'Inflow' | 'Outflow';
  amount: number;
  balance: number;
}

/**
 * Aging Report DTO
 */
export interface AgingReportDto {
  reportDate: DateTime;
  reportType: 'Receivables' | 'Payables';
  totalAmount: number;
  current: number;           // 0-30 days
  days30: number;            // 31-60 days
  days60: number;            // 61-90 days
  days90: number;            // 91-120 days
  days120Plus: number;       // 120+ days
  items: AgingReportItemDto[];
}

/**
 * Aging Report Item DTO
 */
export interface AgingReportItemDto {
  currentAccountId: number;
  currentAccountName: string;
  totalAmount: number;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  days120Plus: number;
}

// =====================================
// COMMON TYPES
// =====================================

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/**
 * Finance API Error
 */
export interface FinanceApiError {
  code: string;
  message: string;
  details?: string[];
}
