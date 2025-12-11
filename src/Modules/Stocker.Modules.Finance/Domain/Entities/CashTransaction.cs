using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Kasa Hareketi (Cash Transaction)
/// Kasa tahsilat ve tediye işlemlerini yönetir
/// </summary>
public class CashTransaction : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Kasa ID (Cash Account ID)
    /// </summary>
    public int CashAccountId { get; private set; }

    /// <summary>
    /// İşlem Numarası (Transaction Number)
    /// </summary>
    public string TransactionNumber { get; private set; } = string.Empty;

    /// <summary>
    /// İşlem Tarihi (Transaction Date)
    /// </summary>
    public DateTime TransactionDate { get; private set; }

    /// <summary>
    /// İşlem Türü (Transaction Type)
    /// </summary>
    public CashTransactionType TransactionType { get; private set; }

    /// <summary>
    /// Hareket Yönü (Movement Direction)
    /// </summary>
    public MovementDirection Direction { get; private set; }

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string Description { get; private set; } = string.Empty;

    #endregion

    #region Tutar Bilgileri (Amount Information)

    /// <summary>
    /// İşlem Tutarı (Transaction Amount)
    /// </summary>
    public Money Amount { get; private set; } = null!;

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Döviz Kuru (Exchange Rate)
    /// </summary>
    public decimal ExchangeRate { get; private set; } = 1;

    /// <summary>
    /// TL Tutarı (Amount in TRY)
    /// </summary>
    public Money AmountTRY { get; private set; } = null!;

    /// <summary>
    /// İşlem Sonrası Bakiye (Balance After Transaction)
    /// </summary>
    public Money BalanceAfter { get; private set; } = null!;

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
    /// Cari Hesap ID (Current Account ID)
    /// </summary>
    public int? CurrentAccountId { get; private set; }

    /// <summary>
    /// Fatura ID (Invoice ID)
    /// </summary>
    public int? InvoiceId { get; private set; }

    /// <summary>
    /// Ödeme ID (Payment ID)
    /// </summary>
    public int? PaymentId { get; private set; }

    /// <summary>
    /// Gider ID (Expense ID)
    /// </summary>
    public int? ExpenseId { get; private set; }

    /// <summary>
    /// Banka Hesabı ID (Bank Account ID - for transfers)
    /// </summary>
    public int? BankAccountId { get; private set; }

    /// <summary>
    /// Karşı Kasa ID (Counter Cash Account ID - for internal transfers)
    /// </summary>
    public int? CounterCashAccountId { get; private set; }

    /// <summary>
    /// Muhasebe Fişi ID (Journal Entry ID)
    /// </summary>
    public int? JournalEntryId { get; private set; }

    #endregion

    #region İşlem Yapan Bilgileri (Operator Information)

    /// <summary>
    /// İşlemi Yapan (Operator Name)
    /// </summary>
    public string? OperatorName { get; private set; }

    /// <summary>
    /// İşlemi Yapan TC/VKN (Operator Tax/ID Number)
    /// </summary>
    public string? OperatorTaxId { get; private set; }

    /// <summary>
    /// İşlemi Yapan Telefon (Operator Phone)
    /// </summary>
    public string? OperatorPhone { get; private set; }

    #endregion

    #region Fiş Bilgileri (Receipt Information)

    /// <summary>
    /// Fiş Numarası (Receipt Number)
    /// </summary>
    public string? ReceiptNumber { get; private set; }

    /// <summary>
    /// Fiş Yazıldı mı? (Is Receipt Printed)
    /// </summary>
    public bool IsReceiptPrinted { get; private set; }

    /// <summary>
    /// Fiş Yazdırma Tarihi (Receipt Print Date)
    /// </summary>
    public DateTime? ReceiptPrintDate { get; private set; }

    #endregion

    #region Durum Bilgileri (Status Information)

    /// <summary>
    /// Durum (Status)
    /// </summary>
    public CashTransactionStatus Status { get; private set; }

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

    public virtual CashAccount CashAccount { get; private set; } = null!;
    public virtual CurrentAccount? CurrentAccount { get; private set; }
    public virtual Invoice? Invoice { get; private set; }
    public virtual Payment? Payment { get; private set; }
    public virtual Expense? Expense { get; private set; }
    public virtual BankAccount? BankAccount { get; private set; }
    public virtual CashAccount? CounterCashAccount { get; private set; }
    public virtual JournalEntry? JournalEntry { get; private set; }
    public virtual CostCenter? CostCenter { get; private set; }

    #endregion

    protected CashTransaction() { }

    public CashTransaction(
        int cashAccountId,
        string transactionNumber,
        DateTime transactionDate,
        CashTransactionType transactionType,
        MovementDirection direction,
        Money amount,
        string description,
        string currency = "TRY")
    {
        CashAccountId = cashAccountId;
        TransactionNumber = transactionNumber;
        TransactionDate = transactionDate;
        TransactionType = transactionType;
        Direction = direction;
        Amount = amount;
        Currency = currency;
        Description = description;
        ExchangeRate = 1;
        AmountTRY = amount;
        BalanceAfter = Money.Zero(currency);
        Status = CashTransactionStatus.Completed;
        IsCancelled = false;
        IsReceiptPrinted = false;
    }

    public void SetExchangeRate(decimal rate)
    {
        ExchangeRate = rate;
        AmountTRY = Money.Create(Amount.Amount * rate, "TRY");
    }

    public void SetBalanceAfter(Money balance)
    {
        BalanceAfter = balance;
    }

    public void SetReference(string? referenceType, string? referenceNumber, int? referenceId = null)
    {
        ReferenceType = referenceType;
        ReferenceNumber = referenceNumber;
        ReferenceId = referenceId;
    }

    public void LinkToCurrentAccount(int currentAccountId)
    {
        CurrentAccountId = currentAccountId;
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

    public void LinkToExpense(int expenseId)
    {
        ExpenseId = expenseId;
        ReferenceType = "Expense";
        ReferenceId = expenseId;
    }

    public void LinkToBankAccount(int bankAccountId)
    {
        BankAccountId = bankAccountId;
    }

    public void LinkToCounterCashAccount(int cashAccountId)
    {
        CounterCashAccountId = cashAccountId;
    }

    public void LinkToJournalEntry(int journalEntryId)
    {
        JournalEntryId = journalEntryId;
    }

    public void SetOperator(string? name, string? taxId, string? phone)
    {
        OperatorName = name;
        OperatorTaxId = taxId;
        OperatorPhone = phone;
    }

    public void SetReceipt(string receiptNumber)
    {
        ReceiptNumber = receiptNumber;
        IsReceiptPrinted = true;
        ReceiptPrintDate = DateTime.UtcNow;
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

    public void Cancel(string reason)
    {
        if (IsCancelled)
            throw new InvalidOperationException("Transaction is already cancelled");

        IsCancelled = true;
        CancelDate = DateTime.UtcNow;
        CancelReason = reason;
        Status = CashTransactionStatus.Cancelled;
    }

    /// <summary>
    /// Tahsilat işlemi oluştur (Create collection transaction)
    /// </summary>
    public static CashTransaction CreateCollection(
        int cashAccountId,
        string transactionNumber,
        DateTime date,
        Money amount,
        string description,
        int? currentAccountId = null)
    {
        var transaction = new CashTransaction(
            cashAccountId,
            transactionNumber,
            date,
            CashTransactionType.Collection,
            MovementDirection.Inbound,
            amount,
            description,
            amount.Currency);

        if (currentAccountId.HasValue)
            transaction.LinkToCurrentAccount(currentAccountId.Value);

        return transaction;
    }

    /// <summary>
    /// Tediye işlemi oluştur (Create payment transaction)
    /// </summary>
    public static CashTransaction CreatePayment(
        int cashAccountId,
        string transactionNumber,
        DateTime date,
        Money amount,
        string description,
        int? currentAccountId = null)
    {
        var transaction = new CashTransaction(
            cashAccountId,
            transactionNumber,
            date,
            CashTransactionType.Payment,
            MovementDirection.Outbound,
            amount,
            description,
            amount.Currency);

        if (currentAccountId.HasValue)
            transaction.LinkToCurrentAccount(currentAccountId.Value);

        return transaction;
    }

    /// <summary>
    /// Bankaya yatırma işlemi oluştur (Create deposit to bank transaction)
    /// </summary>
    public static CashTransaction CreateDepositToBank(
        int cashAccountId,
        string transactionNumber,
        DateTime date,
        Money amount,
        int bankAccountId,
        string description)
    {
        var transaction = new CashTransaction(
            cashAccountId,
            transactionNumber,
            date,
            CashTransactionType.DepositToBank,
            MovementDirection.Outbound,
            amount,
            description,
            amount.Currency);

        transaction.LinkToBankAccount(bankAccountId);

        return transaction;
    }

    /// <summary>
    /// Bankadan çekme işlemi oluştur (Create withdrawal from bank transaction)
    /// </summary>
    public static CashTransaction CreateWithdrawalFromBank(
        int cashAccountId,
        string transactionNumber,
        DateTime date,
        Money amount,
        int bankAccountId,
        string description)
    {
        var transaction = new CashTransaction(
            cashAccountId,
            transactionNumber,
            date,
            CashTransactionType.WithdrawalFromBank,
            MovementDirection.Inbound,
            amount,
            description,
            amount.Currency);

        transaction.LinkToBankAccount(bankAccountId);

        return transaction;
    }

    /// <summary>
    /// Gider ödemesi işlemi oluştur (Create expense payment transaction)
    /// </summary>
    public static CashTransaction CreateExpensePayment(
        int cashAccountId,
        string transactionNumber,
        DateTime date,
        Money amount,
        int expenseId,
        string description)
    {
        var transaction = new CashTransaction(
            cashAccountId,
            transactionNumber,
            date,
            CashTransactionType.ExpensePayment,
            MovementDirection.Outbound,
            amount,
            description,
            amount.Currency);

        transaction.LinkToExpense(expenseId);

        return transaction;
    }
}

/// <summary>
/// Kasa İşlem Durumları (Cash Transaction Statuses)
/// </summary>
public enum CashTransactionStatus
{
    /// <summary>
    /// Beklemede (Pending)
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Tamamlandı (Completed)
    /// </summary>
    Completed = 2,

    /// <summary>
    /// İptal Edildi (Cancelled)
    /// </summary>
    Cancelled = 3
}
