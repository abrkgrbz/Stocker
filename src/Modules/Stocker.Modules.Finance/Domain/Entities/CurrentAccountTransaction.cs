using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Cari Hesap Hareketi (Current Account Transaction)
/// Müşteri ve tedarikçi cari hareketlerini takip eder
/// </summary>
public class CurrentAccountTransaction : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Cari Hesap ID (Current Account ID)
    /// </summary>
    public int CurrentAccountId { get; private set; }

    /// <summary>
    /// İşlem Numarası (Transaction Number)
    /// </summary>
    public string TransactionNumber { get; private set; } = string.Empty;

    /// <summary>
    /// İşlem Tarihi (Transaction Date)
    /// </summary>
    public DateTime TransactionDate { get; private set; }

    /// <summary>
    /// Vade Tarihi (Due Date)
    /// </summary>
    public DateTime? DueDate { get; private set; }

    /// <summary>
    /// İşlem Türü (Transaction Type)
    /// </summary>
    public CurrentAccountTransactionType TransactionType { get; private set; }

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string Description { get; private set; } = string.Empty;

    #endregion

    #region Tutar Bilgileri (Amount Information)

    /// <summary>
    /// Borç Tutarı (Debit Amount)
    /// </summary>
    public Money DebitAmount { get; private set; } = null!;

    /// <summary>
    /// Alacak Tutarı (Credit Amount)
    /// </summary>
    public Money CreditAmount { get; private set; } = null!;

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Döviz Kuru (Exchange Rate)
    /// </summary>
    public decimal ExchangeRate { get; private set; } = 1;

    /// <summary>
    /// TL Borç Tutarı (Debit Amount in TRY)
    /// </summary>
    public Money DebitAmountTRY { get; private set; } = null!;

    /// <summary>
    /// TL Alacak Tutarı (Credit Amount in TRY)
    /// </summary>
    public Money CreditAmountTRY { get; private set; } = null!;

    /// <summary>
    /// Kümülatif Bakiye (Running Balance)
    /// </summary>
    public Money RunningBalance { get; private set; } = null!;

    #endregion

    #region Referans Bilgileri (Reference Information)

    /// <summary>
    /// Referans Türü (Reference Type)
    /// </summary>
    public string? ReferenceType { get; private set; }

    /// <summary>
    /// Referans Numarası (Reference Number)
    /// </summary>
    public string? ReferenceNumber { get; private set; }

    /// <summary>
    /// Referans ID
    /// </summary>
    public int? ReferenceId { get; private set; }

    /// <summary>
    /// Fatura ID (Invoice ID)
    /// </summary>
    public int? InvoiceId { get; private set; }

    /// <summary>
    /// Ödeme ID (Payment ID)
    /// </summary>
    public int? PaymentId { get; private set; }

    /// <summary>
    /// Çek ID (Check ID)
    /// </summary>
    public int? CheckId { get; private set; }

    /// <summary>
    /// Senet ID (Promissory Note ID)
    /// </summary>
    public int? PromissoryNoteId { get; private set; }

    /// <summary>
    /// Muhasebe Fişi ID (Journal Entry ID)
    /// </summary>
    public int? JournalEntryId { get; private set; }

    #endregion

    #region Durum Bilgileri (Status Information)

    /// <summary>
    /// Kapatıldı mı? (Is Closed)
    /// </summary>
    public bool IsClosed { get; private set; }

    /// <summary>
    /// Kalan Tutar (Remaining Amount)
    /// </summary>
    public Money RemainingAmount { get; private set; } = null!;

    /// <summary>
    /// Kapanış Tarihi (Close Date)
    /// </summary>
    public DateTime? CloseDate { get; private set; }

    /// <summary>
    /// İptal Edildi mi? (Is Cancelled)
    /// </summary>
    public bool IsCancelled { get; private set; }

    /// <summary>
    /// İptal Tarihi (Cancel Date)
    /// </summary>
    public DateTime? CancelDate { get; private set; }

    /// <summary>
    /// İptal Nedeni (Cancel Reason)
    /// </summary>
    public string? CancelReason { get; private set; }

    #endregion

    #region Diğer Bilgiler (Other Information)

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Masraf Merkezi ID (Cost Center ID)
    /// </summary>
    public int? CostCenterId { get; private set; }

    /// <summary>
    /// Proje ID (Project ID)
    /// </summary>
    public int? ProjectId { get; private set; }

    #endregion

    #region Navigation Properties

    public virtual CurrentAccount CurrentAccount { get; private set; } = null!;
    public virtual Invoice? Invoice { get; private set; }
    public virtual Payment? Payment { get; private set; }
    public virtual Check? Check { get; private set; }
    public virtual PromissoryNote? PromissoryNote { get; private set; }
    public virtual JournalEntry? JournalEntry { get; private set; }
    public virtual CostCenter? CostCenter { get; private set; }

    #endregion

    protected CurrentAccountTransaction() { }

    public CurrentAccountTransaction(
        int currentAccountId,
        string transactionNumber,
        DateTime transactionDate,
        CurrentAccountTransactionType transactionType,
        string description,
        Money debitAmount,
        Money creditAmount,
        string currency = "TRY")
    {
        CurrentAccountId = currentAccountId;
        TransactionNumber = transactionNumber;
        TransactionDate = transactionDate;
        TransactionType = transactionType;
        Description = description;
        Currency = currency;
        ExchangeRate = 1;

        // Set amounts
        DebitAmount = debitAmount;
        CreditAmount = creditAmount;
        DebitAmountTRY = debitAmount;
        CreditAmountTRY = creditAmount;

        // Initialize remaining
        var amount = debitAmount.Amount > 0 ? debitAmount.Amount : creditAmount.Amount;
        RemainingAmount = Money.Create(amount, currency);
        RunningBalance = Money.Zero(currency);

        IsClosed = false;
        IsCancelled = false;
    }

    public void SetExchangeRate(decimal rate)
    {
        ExchangeRate = rate;
        DebitAmountTRY = Money.Create(DebitAmount.Amount * rate, "TRY");
        CreditAmountTRY = Money.Create(CreditAmount.Amount * rate, "TRY");
    }

    public void SetDueDate(DateTime? dueDate)
    {
        DueDate = dueDate;
    }

    public void SetReference(string? referenceType, string? referenceNumber, int? referenceId = null)
    {
        ReferenceType = referenceType;
        ReferenceNumber = referenceNumber;
        ReferenceId = referenceId;
    }

    public void LinkToInvoice(int invoiceId)
    {
        InvoiceId = invoiceId;
        ReferenceType = "Invoice";
        ReferenceId = invoiceId;
    }

    public void LinkToPayment(int paymentId)
    {
        PaymentId = paymentId;
        ReferenceType = "Payment";
        ReferenceId = paymentId;
    }

    public void LinkToCheck(int checkId)
    {
        CheckId = checkId;
        ReferenceType = "Check";
        ReferenceId = checkId;
    }

    public void LinkToPromissoryNote(int noteId)
    {
        PromissoryNoteId = noteId;
        ReferenceType = "PromissoryNote";
        ReferenceId = noteId;
    }

    public void LinkToJournalEntry(int journalEntryId)
    {
        JournalEntryId = journalEntryId;
    }

    public void SetRunningBalance(Money balance)
    {
        RunningBalance = balance;
    }

    public void SetCostCenter(int costCenterId)
    {
        CostCenterId = costCenterId;
    }

    public void SetProject(int projectId)
    {
        ProjectId = projectId;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    /// <summary>
    /// Hareket kapama (Close transaction - partial or full)
    /// </summary>
    public void ApplyPayment(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        var newRemaining = RemainingAmount.Amount - amount.Amount;
        if (newRemaining < 0)
            throw new InvalidOperationException("Payment amount exceeds remaining amount");

        RemainingAmount = Money.Create(newRemaining, Currency);

        if (newRemaining == 0)
        {
            IsClosed = true;
            CloseDate = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Tam kapanış (Full close)
    /// </summary>
    public void Close()
    {
        IsClosed = true;
        CloseDate = DateTime.UtcNow;
        RemainingAmount = Money.Zero(Currency);
    }

    /// <summary>
    /// İptal et (Cancel)
    /// </summary>
    public void Cancel(string reason)
    {
        if (IsCancelled)
            throw new InvalidOperationException("Transaction is already cancelled");

        IsCancelled = true;
        CancelDate = DateTime.UtcNow;
        CancelReason = reason;
    }

    /// <summary>
    /// Satış faturası hareketi oluştur (Create sales invoice transaction)
    /// </summary>
    public static CurrentAccountTransaction CreateFromSalesInvoice(
        int currentAccountId,
        string transactionNumber,
        Invoice invoice)
    {
        return new CurrentAccountTransaction(
            currentAccountId,
            transactionNumber,
            invoice.InvoiceDate,
            CurrentAccountTransactionType.SalesInvoice,
            $"Satış Faturası: {invoice.InvoiceNumber}",
            invoice.GrandTotal, // Debit - Alacak (customer owes us)
            Money.Zero(invoice.Currency),
            invoice.Currency)
        {
            InvoiceId = invoice.Id,
            DueDate = invoice.DueDate,
            ReferenceType = "Invoice",
            ReferenceNumber = invoice.InvoiceNumber,
            ReferenceId = invoice.Id
        };
    }

    /// <summary>
    /// Alış faturası hareketi oluştur (Create purchase invoice transaction)
    /// </summary>
    public static CurrentAccountTransaction CreateFromPurchaseInvoice(
        int currentAccountId,
        string transactionNumber,
        Invoice invoice)
    {
        return new CurrentAccountTransaction(
            currentAccountId,
            transactionNumber,
            invoice.InvoiceDate,
            CurrentAccountTransactionType.PurchaseInvoice,
            $"Alış Faturası: {invoice.InvoiceNumber}",
            Money.Zero(invoice.Currency),
            invoice.GrandTotal, // Credit - Borç (we owe supplier)
            invoice.Currency)
        {
            InvoiceId = invoice.Id,
            DueDate = invoice.DueDate,
            ReferenceType = "Invoice",
            ReferenceNumber = invoice.InvoiceNumber,
            ReferenceId = invoice.Id
        };
    }

    /// <summary>
    /// Tahsilat hareketi oluştur (Create collection transaction)
    /// </summary>
    public static CurrentAccountTransaction CreateCollection(
        int currentAccountId,
        string transactionNumber,
        DateTime date,
        Money amount,
        string description)
    {
        return new CurrentAccountTransaction(
            currentAccountId,
            transactionNumber,
            date,
            CurrentAccountTransactionType.Collection,
            description,
            Money.Zero(amount.Currency),
            amount, // Credit - reduces customer debt
            amount.Currency);
    }

    /// <summary>
    /// Ödeme hareketi oluştur (Create payment transaction)
    /// </summary>
    public static CurrentAccountTransaction CreatePayment(
        int currentAccountId,
        string transactionNumber,
        DateTime date,
        Money amount,
        string description)
    {
        return new CurrentAccountTransaction(
            currentAccountId,
            transactionNumber,
            date,
            CurrentAccountTransactionType.Payment,
            description,
            amount, // Debit - reduces our debt to supplier
            Money.Zero(amount.Currency),
            amount.Currency);
    }
}
