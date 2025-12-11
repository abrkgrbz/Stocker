using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Ödeme/Tahsilat (Payment/Collection)
/// Müşteri tahsilatları ve tedarikçi ödemelerini yönetir
/// </summary>
public class Payment : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Ödeme Numarası (Payment Number)
    /// </summary>
    public string PaymentNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Ödeme Tarihi (Payment Date)
    /// </summary>
    public DateTime PaymentDate { get; private set; }

    /// <summary>
    /// Valör Tarihi (Value Date)
    /// </summary>
    public DateTime? ValueDate { get; private set; }

    /// <summary>
    /// Ödeme Türü (Payment Type)
    /// </summary>
    public PaymentType PaymentType { get; private set; }

    /// <summary>
    /// Hareket Yönü (Direction)
    /// Inbound = Tahsilat, Outbound = Ödeme
    /// </summary>
    public MovementDirection Direction { get; private set; }

    /// <summary>
    /// Ödeme Durumu (Payment Status)
    /// </summary>
    public PaymentStatus Status { get; private set; }

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; private set; }

    #endregion

    #region Cari Bilgileri (Current Account Information)

    /// <summary>
    /// Cari Hesap ID (Current Account ID)
    /// </summary>
    public int CurrentAccountId { get; private set; }

    /// <summary>
    /// Cari Hesap Adı (Current Account Name - Denormalized)
    /// </summary>
    public string CurrentAccountName { get; private set; } = string.Empty;

    #endregion

    #region Tutar Bilgileri (Amount Information)

    /// <summary>
    /// Ödeme Tutarı (Payment Amount)
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
    /// Tahsil Edilen/Ödenen Net Tutar (Net Amount)
    /// </summary>
    public Money NetAmount { get; private set; } = null!;

    /// <summary>
    /// Tahsis Edilen Tutar (Allocated Amount)
    /// </summary>
    public Money AllocatedAmount { get; private set; } = null!;

    /// <summary>
    /// Tahsis Edilmemiş Tutar (Unallocated Amount)
    /// </summary>
    public Money UnallocatedAmount { get; private set; } = null!;

    #endregion

    #region Banka/Kasa Bilgileri (Bank/Cash Information)

    /// <summary>
    /// Banka Hesabı ID (Bank Account ID)
    /// </summary>
    public int? BankAccountId { get; private set; }

    /// <summary>
    /// Kasa ID (Cash Account ID)
    /// </summary>
    public int? CashAccountId { get; private set; }

    /// <summary>
    /// Banka İşlem ID (Bank Transaction ID)
    /// </summary>
    public int? BankTransactionId { get; private set; }

    /// <summary>
    /// Kasa İşlem ID (Cash Transaction ID)
    /// </summary>
    public int? CashTransactionId { get; private set; }

    #endregion

    #region Çek/Senet Bilgileri (Check/Note Information)

    /// <summary>
    /// Çek ID (Check ID)
    /// </summary>
    public int? CheckId { get; private set; }

    /// <summary>
    /// Senet ID (Promissory Note ID)
    /// </summary>
    public int? PromissoryNoteId { get; private set; }

    #endregion

    #region POS/Kredi Kartı Bilgileri (POS/Credit Card Information)

    /// <summary>
    /// POS İşlem mi? (Is POS Transaction)
    /// </summary>
    public bool IsPosTransaction { get; private set; }

    /// <summary>
    /// Kart Numarası (Masked Card Number)
    /// </summary>
    public string? CardNumberMasked { get; private set; }

    /// <summary>
    /// Kart Sahibi (Cardholder Name)
    /// </summary>
    public string? CardholderName { get; private set; }

    /// <summary>
    /// Onay Kodu (Authorization Code)
    /// </summary>
    public string? AuthorizationCode { get; private set; }

    /// <summary>
    /// Taksit Sayısı (Installment Count)
    /// </summary>
    public int? InstallmentCount { get; private set; }

    /// <summary>
    /// POS Referans No (POS Reference Number)
    /// </summary>
    public string? PosReferenceNumber { get; private set; }

    #endregion

    #region Referans Bilgileri (Reference Information)

    /// <summary>
    /// Referans Numarası (Reference Number)
    /// </summary>
    public string? ReferenceNumber { get; private set; }

    /// <summary>
    /// Dekont No (Receipt Number)
    /// </summary>
    public string? ReceiptNumber { get; private set; }

    /// <summary>
    /// Muhasebe Fişi ID (Journal Entry ID)
    /// </summary>
    public int? JournalEntryId { get; private set; }

    #endregion

    #region Onay Bilgileri (Approval Information)

    /// <summary>
    /// Onaylayan Kullanıcı ID (Approved By User ID)
    /// </summary>
    public int? ApprovedByUserId { get; private set; }

    /// <summary>
    /// Onay Tarihi (Approval Date)
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    /// <summary>
    /// Onay Notu (Approval Note)
    /// </summary>
    public string? ApprovalNote { get; private set; }

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
    public virtual BankAccount? BankAccount { get; private set; }
    public virtual CashAccount? CashAccount { get; private set; }
    public virtual BankTransaction? BankTransaction { get; private set; }
    public virtual CashTransaction? CashTransaction { get; private set; }
    public virtual Check? Check { get; private set; }
    public virtual PromissoryNote? PromissoryNote { get; private set; }
    public virtual JournalEntry? JournalEntry { get; private set; }
    public virtual CostCenter? CostCenter { get; private set; }
    public virtual ICollection<PaymentAllocation> Allocations { get; private set; } = new List<PaymentAllocation>();

    #endregion

    protected Payment() { }

    public Payment(
        string paymentNumber,
        DateTime paymentDate,
        PaymentType paymentType,
        MovementDirection direction,
        int currentAccountId,
        string currentAccountName,
        Money amount,
        string currency = "TRY")
    {
        PaymentNumber = paymentNumber;
        PaymentDate = paymentDate;
        PaymentType = paymentType;
        Direction = direction;
        CurrentAccountId = currentAccountId;
        CurrentAccountName = currentAccountName;
        Amount = amount;
        Currency = currency;
        ExchangeRate = 1;
        AmountTRY = amount;
        Commission = Money.Zero(currency);
        NetAmount = amount;
        AllocatedAmount = Money.Zero(currency);
        UnallocatedAmount = amount;
        Status = PaymentStatus.Pending;
        IsPosTransaction = false;
    }

    public void SetValueDate(DateTime valueDate)
    {
        ValueDate = valueDate;
    }

    public void SetDescription(string? description)
    {
        Description = description;
    }

    public void SetExchangeRate(decimal rate)
    {
        ExchangeRate = rate;
        AmountTRY = Money.Create(Amount.Amount * rate, "TRY");
    }

    public void SetCommission(Money commission)
    {
        if (commission.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        Commission = commission;
        RecalculateNetAmount();
    }

    private void RecalculateNetAmount()
    {
        NetAmount = Money.Create(Amount.Amount - Commission.Amount, Currency);
    }

    public void LinkToBankAccount(int bankAccountId, int? bankTransactionId = null)
    {
        BankAccountId = bankAccountId;
        BankTransactionId = bankTransactionId;
        CashAccountId = null;
        CashTransactionId = null;
    }

    public void LinkToCashAccount(int cashAccountId, int? cashTransactionId = null)
    {
        CashAccountId = cashAccountId;
        CashTransactionId = cashTransactionId;
        BankAccountId = null;
        BankTransactionId = null;
    }

    public void LinkToCheck(int checkId)
    {
        CheckId = checkId;
    }

    public void LinkToPromissoryNote(int noteId)
    {
        PromissoryNoteId = noteId;
    }

    public void SetPosInfo(
        string? cardNumberMasked,
        string? cardholderName,
        string? authorizationCode,
        int? installmentCount,
        string? posReferenceNumber)
    {
        IsPosTransaction = true;
        CardNumberMasked = cardNumberMasked;
        CardholderName = cardholderName;
        AuthorizationCode = authorizationCode;
        InstallmentCount = installmentCount;
        PosReferenceNumber = posReferenceNumber;
    }

    public void SetReferenceNumbers(string? referenceNumber, string? receiptNumber)
    {
        ReferenceNumber = referenceNumber;
        ReceiptNumber = receiptNumber;
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

    #region Status Management

    public void Approve(int approvedByUserId, string? note = null)
    {
        if (Status != PaymentStatus.Pending)
            throw new InvalidOperationException("Only pending payments can be approved");

        Status = PaymentStatus.Approved;
        ApprovedByUserId = approvedByUserId;
        ApprovalDate = DateTime.UtcNow;
        ApprovalNote = note;
    }

    public void Process()
    {
        if (Status != PaymentStatus.Approved)
            throw new InvalidOperationException("Only approved payments can be processed");

        Status = PaymentStatus.Processing;
    }

    public void Complete()
    {
        if (Status != PaymentStatus.Processing && Status != PaymentStatus.Approved)
            throw new InvalidOperationException("Only processing or approved payments can be completed");

        Status = PaymentStatus.Completed;
    }

    public void Fail(string reason)
    {
        Status = PaymentStatus.Failed;
        Notes = string.IsNullOrEmpty(Notes) ? $"Failed: {reason}" : $"{Notes}\nFailed: {reason}";
    }

    public void Cancel(string reason)
    {
        if (Status == PaymentStatus.Cancelled)
            throw new InvalidOperationException("Payment is already cancelled");

        if (AllocatedAmount.Amount > 0)
            throw new InvalidOperationException("Cannot cancel payment with allocations. Remove allocations first.");

        Status = PaymentStatus.Cancelled;
        Notes = string.IsNullOrEmpty(Notes) ? $"Cancelled: {reason}" : $"{Notes}\nCancelled: {reason}";
    }

    public void Refund()
    {
        if (Status != PaymentStatus.Completed)
            throw new InvalidOperationException("Only completed payments can be refunded");

        Status = PaymentStatus.Refunded;
    }

    public void MarkAsBounced(string reason)
    {
        if (PaymentType != PaymentType.Check)
            throw new InvalidOperationException("Only check payments can be marked as bounced");

        Status = PaymentStatus.Bounced;
        Notes = string.IsNullOrEmpty(Notes) ? $"Bounced: {reason}" : $"{Notes}\nBounced: {reason}";
    }

    #endregion

    #region Allocation Management

    public void AddAllocation(PaymentAllocation allocation)
    {
        if (allocation.Amount.Amount > UnallocatedAmount.Amount)
            throw new InvalidOperationException("Allocation amount exceeds unallocated amount");

        Allocations.Add(allocation);
        RecalculateAllocations();
    }

    public void RemoveAllocation(PaymentAllocation allocation)
    {
        Allocations.Remove(allocation);
        RecalculateAllocations();
    }

    public void RecalculateAllocations()
    {
        var totalAllocated = Allocations.Sum(a => a.Amount.Amount);
        AllocatedAmount = Money.Create(totalAllocated, Currency);
        UnallocatedAmount = Money.Create(Amount.Amount - totalAllocated, Currency);
    }

    #endregion

    #region Factory Methods

    /// <summary>
    /// Nakit tahsilat oluştur (Create cash collection)
    /// </summary>
    public static Payment CreateCashCollection(
        string paymentNumber,
        DateTime date,
        int currentAccountId,
        string currentAccountName,
        Money amount,
        int cashAccountId)
    {
        var payment = new Payment(
            paymentNumber,
            date,
            PaymentType.Cash,
            MovementDirection.Inbound,
            currentAccountId,
            currentAccountName,
            amount,
            amount.Currency);

        payment.LinkToCashAccount(cashAccountId);
        return payment;
    }

    /// <summary>
    /// Nakit ödeme oluştur (Create cash payment)
    /// </summary>
    public static Payment CreateCashPayment(
        string paymentNumber,
        DateTime date,
        int currentAccountId,
        string currentAccountName,
        Money amount,
        int cashAccountId)
    {
        var payment = new Payment(
            paymentNumber,
            date,
            PaymentType.Cash,
            MovementDirection.Outbound,
            currentAccountId,
            currentAccountName,
            amount,
            amount.Currency);

        payment.LinkToCashAccount(cashAccountId);
        return payment;
    }

    /// <summary>
    /// Banka havalesi tahsilat oluştur (Create bank transfer collection)
    /// </summary>
    public static Payment CreateBankTransferCollection(
        string paymentNumber,
        DateTime date,
        int currentAccountId,
        string currentAccountName,
        Money amount,
        int bankAccountId)
    {
        var payment = new Payment(
            paymentNumber,
            date,
            PaymentType.BankTransfer,
            MovementDirection.Inbound,
            currentAccountId,
            currentAccountName,
            amount,
            amount.Currency);

        payment.LinkToBankAccount(bankAccountId);
        return payment;
    }

    /// <summary>
    /// Banka havalesi ödeme oluştur (Create bank transfer payment)
    /// </summary>
    public static Payment CreateBankTransferPayment(
        string paymentNumber,
        DateTime date,
        int currentAccountId,
        string currentAccountName,
        Money amount,
        int bankAccountId)
    {
        var payment = new Payment(
            paymentNumber,
            date,
            PaymentType.BankTransfer,
            MovementDirection.Outbound,
            currentAccountId,
            currentAccountName,
            amount,
            amount.Currency);

        payment.LinkToBankAccount(bankAccountId);
        return payment;
    }

    /// <summary>
    /// Kredi kartı tahsilat oluştur (Create credit card collection)
    /// </summary>
    public static Payment CreateCreditCardCollection(
        string paymentNumber,
        DateTime date,
        int currentAccountId,
        string currentAccountName,
        Money amount,
        int bankAccountId,
        string? cardNumberMasked,
        string? authorizationCode,
        int? installmentCount = null)
    {
        var payment = new Payment(
            paymentNumber,
            date,
            PaymentType.CreditCard,
            MovementDirection.Inbound,
            currentAccountId,
            currentAccountName,
            amount,
            amount.Currency);

        payment.LinkToBankAccount(bankAccountId);
        payment.SetPosInfo(cardNumberMasked, null, authorizationCode, installmentCount, null);
        return payment;
    }

    #endregion
}
