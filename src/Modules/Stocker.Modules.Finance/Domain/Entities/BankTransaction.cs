using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Banka Hareketi (Bank Transaction)
/// Banka hesabı hareketlerini yönetir
/// </summary>
public class BankTransaction : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Banka Hesap ID (Bank Account ID)
    /// </summary>
    public int BankAccountId { get; private set; }

    /// <summary>
    /// İşlem Numarası (Transaction Number)
    /// </summary>
    public string TransactionNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Banka Dekont No (Bank Receipt Number)
    /// </summary>
    public string? BankReceiptNumber { get; private set; }

    /// <summary>
    /// İşlem Tarihi (Transaction Date)
    /// </summary>
    public DateTime TransactionDate { get; private set; }

    /// <summary>
    /// Valör Tarihi (Value Date)
    /// </summary>
    public DateTime ValueDate { get; private set; }

    /// <summary>
    /// İşlem Türü (Transaction Type)
    /// </summary>
    public BankTransactionType TransactionType { get; private set; }

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
    /// Komisyon/Masraf (Commission/Fee)
    /// </summary>
    public Money Commission { get; private set; } = null!;

    /// <summary>
    /// BSMV (Banking Transaction Tax)
    /// </summary>
    public Money Bsmv { get; private set; } = null!;

    /// <summary>
    /// Net Tutar (Net Amount)
    /// </summary>
    public Money NetAmount { get; private set; } = null!;

    /// <summary>
    /// İşlem Sonrası Bakiye (Balance After Transaction)
    /// </summary>
    public Money BalanceAfter { get; private set; } = null!;

    #endregion

    #region Karşı Taraf Bilgileri (Counterparty Information)

    /// <summary>
    /// Karşı Taraf Adı (Counterparty Name)
    /// </summary>
    public string? CounterpartyName { get; private set; }

    /// <summary>
    /// Karşı Taraf IBAN (Counterparty IBAN)
    /// </summary>
    public string? CounterpartyIban { get; private set; }

    /// <summary>
    /// Karşı Taraf Banka (Counterparty Bank)
    /// </summary>
    public string? CounterpartyBank { get; private set; }

    /// <summary>
    /// Karşı Taraf VKN/TCKN (Counterparty Tax/ID Number)
    /// </summary>
    public string? CounterpartyTaxId { get; private set; }

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
    /// Çek ID (Check ID)
    /// </summary>
    public int? CheckId { get; private set; }

    /// <summary>
    /// Kasa ID (Cash Account ID - for transfers)
    /// </summary>
    public int? CashAccountId { get; private set; }

    /// <summary>
    /// Karşı Banka Hesabı ID (Counter Bank Account ID - for internal transfers)
    /// </summary>
    public int? CounterBankAccountId { get; private set; }

    /// <summary>
    /// Muhasebe Fişi ID (Journal Entry ID)
    /// </summary>
    public int? JournalEntryId { get; private set; }

    #endregion

    #region Eşleştirme Bilgileri (Matching Information)

    /// <summary>
    /// Eşleştirildi mi? (Is Matched)
    /// </summary>
    public bool IsMatched { get; private set; }

    /// <summary>
    /// Eşleştirme Tarihi (Matching Date)
    /// </summary>
    public DateTime? MatchingDate { get; private set; }

    /// <summary>
    /// Eşleştirme Notu (Matching Note)
    /// </summary>
    public string? MatchingNote { get; private set; }

    /// <summary>
    /// Otomatik Eşleştirildi mi? (Is Auto Matched)
    /// </summary>
    public bool IsAutoMatched { get; private set; }

    #endregion

    #region Mutabakat Bilgileri (Reconciliation Information)

    /// <summary>
    /// Mutabakat Yapıldı mı? (Is Reconciled)
    /// </summary>
    public bool IsReconciled { get; private set; }

    /// <summary>
    /// Mutabakat Tarihi (Reconciliation Date)
    /// </summary>
    public DateTime? ReconciliationDate { get; private set; }

    #endregion

    #region Durum Bilgileri (Status Information)

    /// <summary>
    /// Durum (Status)
    /// </summary>
    public BankTransactionStatus Status { get; private set; }

    /// <summary>
    /// Banka'dan mı geldi? (Is From Bank Feed)
    /// </summary>
    public bool IsFromBankFeed { get; private set; }

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

    public virtual BankAccount BankAccount { get; private set; } = null!;
    public virtual CurrentAccount? CurrentAccount { get; private set; }
    public virtual Invoice? Invoice { get; private set; }
    public virtual Payment? Payment { get; private set; }
    public virtual Check? Check { get; private set; }
    public virtual CashAccount? CashAccount { get; private set; }
    public virtual BankAccount? CounterBankAccount { get; private set; }
    public virtual JournalEntry? JournalEntry { get; private set; }
    public virtual CostCenter? CostCenter { get; private set; }

    #endregion

    protected BankTransaction() { }

    public BankTransaction(
        int bankAccountId,
        string transactionNumber,
        DateTime transactionDate,
        BankTransactionType transactionType,
        MovementDirection direction,
        Money amount,
        string description,
        string currency = "TRY")
    {
        BankAccountId = bankAccountId;
        TransactionNumber = transactionNumber;
        TransactionDate = transactionDate;
        ValueDate = transactionDate;
        TransactionType = transactionType;
        Direction = direction;
        Amount = amount;
        Currency = currency;
        Description = description;
        ExchangeRate = 1;
        AmountTRY = amount;
        Commission = Money.Zero(currency);
        Bsmv = Money.Zero(currency);
        NetAmount = amount;
        BalanceAfter = Money.Zero(currency);
        Status = BankTransactionStatus.Pending;
        IsMatched = false;
        IsReconciled = false;
        IsFromBankFeed = false;
        IsAutoMatched = false;
    }

    public void SetValueDate(DateTime valueDate)
    {
        ValueDate = valueDate;
    }

    public void SetBankReceiptNumber(string? receiptNumber)
    {
        BankReceiptNumber = receiptNumber;
    }

    public void SetExchangeRate(decimal rate)
    {
        ExchangeRate = rate;
        AmountTRY = Money.Create(Amount.Amount * rate, "TRY");
    }

    public void SetCommission(Money commission, Money bsmv)
    {
        if (commission.Currency != Currency || bsmv.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        Commission = commission;
        Bsmv = bsmv;
        RecalculateNetAmount();
    }

    private void RecalculateNetAmount()
    {
        var netAmount = Direction == MovementDirection.Inbound
            ? Amount.Amount - Commission.Amount - Bsmv.Amount
            : Amount.Amount + Commission.Amount + Bsmv.Amount;

        NetAmount = Money.Create(netAmount, Currency);
    }

    public void SetBalanceAfter(Money balance)
    {
        BalanceAfter = balance;
    }

    public void SetCounterparty(string? name, string? iban, string? bank, string? taxId)
    {
        CounterpartyName = name;
        CounterpartyIban = iban;
        CounterpartyBank = bank;
        CounterpartyTaxId = taxId;
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

    public void LinkToCheck(int checkId)
    {
        CheckId = checkId;
        ReferenceType = "Check";
        ReferenceId = checkId;
    }

    public void LinkToCashAccount(int cashAccountId)
    {
        CashAccountId = cashAccountId;
    }

    public void LinkToCounterBankAccount(int bankAccountId)
    {
        CounterBankAccountId = bankAccountId;
    }

    public void LinkToJournalEntry(int journalEntryId)
    {
        JournalEntryId = journalEntryId;
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

    public void MarkAsFromBankFeed()
    {
        IsFromBankFeed = true;
    }

    public void Match(string? note = null, bool isAutoMatched = false)
    {
        IsMatched = true;
        MatchingDate = DateTime.UtcNow;
        MatchingNote = note;
        IsAutoMatched = isAutoMatched;
    }

    public void Unmatch()
    {
        IsMatched = false;
        MatchingDate = null;
        MatchingNote = null;
        IsAutoMatched = false;
    }

    public void Reconcile()
    {
        IsReconciled = true;
        ReconciliationDate = DateTime.UtcNow;
    }

    public void Unreconcile()
    {
        IsReconciled = false;
        ReconciliationDate = null;
    }

    public void Confirm()
    {
        if (Status != BankTransactionStatus.Pending)
            throw new InvalidOperationException("Only pending transactions can be confirmed");

        Status = BankTransactionStatus.Confirmed;
    }

    public void Complete()
    {
        Status = BankTransactionStatus.Completed;
    }

    public void Cancel(string reason)
    {
        if (Status == BankTransactionStatus.Cancelled)
            throw new InvalidOperationException("Transaction is already cancelled");

        Status = BankTransactionStatus.Cancelled;
        Notes = string.IsNullOrEmpty(Notes) ? $"Cancelled: {reason}" : $"{Notes}\nCancelled: {reason}";
    }

    public void Fail(string reason)
    {
        Status = BankTransactionStatus.Failed;
        Notes = string.IsNullOrEmpty(Notes) ? $"Failed: {reason}" : $"{Notes}\nFailed: {reason}";
    }
}

/// <summary>
/// Banka İşlem Durumları (Bank Transaction Statuses)
/// </summary>
public enum BankTransactionStatus
{
    /// <summary>
    /// Beklemede (Pending)
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Onaylandı (Confirmed)
    /// </summary>
    Confirmed = 2,

    /// <summary>
    /// Tamamlandı (Completed)
    /// </summary>
    Completed = 3,

    /// <summary>
    /// Başarısız (Failed)
    /// </summary>
    Failed = 4,

    /// <summary>
    /// İptal Edildi (Cancelled)
    /// </summary>
    Cancelled = 5
}
