using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Banka Mutabakatı (Bank Reconciliation)
/// Banka ekstresi ile sistem kayıtlarını eşleştirme
/// </summary>
public class BankReconciliation : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Mutabakat Numarası (Reconciliation Number)
    /// </summary>
    public string ReconciliationNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Banka Hesabı ID (Bank Account ID)
    /// </summary>
    public int BankAccountId { get; private set; }

    /// <summary>
    /// Mutabakat Dönemi Başlangıç (Period Start)
    /// </summary>
    public DateTime PeriodStart { get; private set; }

    /// <summary>
    /// Mutabakat Dönemi Bitiş (Period End)
    /// </summary>
    public DateTime PeriodEnd { get; private set; }

    /// <summary>
    /// Mutabakat Tarihi (Reconciliation Date)
    /// </summary>
    public DateTime ReconciliationDate { get; private set; }

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; private set; }

    #endregion

    #region Banka Bakiye Bilgileri (Bank Balance Information)

    /// <summary>
    /// Banka Açılış Bakiyesi (Bank Opening Balance)
    /// </summary>
    public Money BankOpeningBalance { get; private set; } = null!;

    /// <summary>
    /// Banka Kapanış Bakiyesi (Bank Closing Balance)
    /// </summary>
    public Money BankClosingBalance { get; private set; } = null!;

    /// <summary>
    /// Banka Toplam Giriş (Bank Total Credits)
    /// </summary>
    public Money BankTotalCredits { get; private set; } = null!;

    /// <summary>
    /// Banka Toplam Çıkış (Bank Total Debits)
    /// </summary>
    public Money BankTotalDebits { get; private set; } = null!;

    /// <summary>
    /// Ekstre Numarası (Statement Number)
    /// </summary>
    public string? StatementNumber { get; private set; }

    /// <summary>
    /// Ekstre Tarihi (Statement Date)
    /// </summary>
    public DateTime? StatementDate { get; private set; }

    #endregion

    #region Sistem Bakiye Bilgileri (System Balance Information)

    /// <summary>
    /// Sistem Açılış Bakiyesi (System Opening Balance)
    /// </summary>
    public Money SystemOpeningBalance { get; private set; } = null!;

    /// <summary>
    /// Sistem Kapanış Bakiyesi (System Closing Balance)
    /// </summary>
    public Money SystemClosingBalance { get; private set; } = null!;

    /// <summary>
    /// Sistem Toplam Giriş (System Total Credits)
    /// </summary>
    public Money SystemTotalCredits { get; private set; } = null!;

    /// <summary>
    /// Sistem Toplam Çıkış (System Total Debits)
    /// </summary>
    public Money SystemTotalDebits { get; private set; } = null!;

    #endregion

    #region Mutabakat Sonuçları (Reconciliation Results)

    /// <summary>
    /// Bakiye Farkı (Balance Difference)
    /// </summary>
    public Money BalanceDifference { get; private set; } = null!;

    /// <summary>
    /// Mutabık mı? (Is Reconciled)
    /// </summary>
    public bool IsReconciled { get; private set; }

    /// <summary>
    /// Eşleşen Kayıt Sayısı (Matched Transaction Count)
    /// </summary>
    public int MatchedTransactionCount { get; private set; }

    /// <summary>
    /// Eşleşmeyen Banka Kaydı Sayısı (Unmatched Bank Items Count)
    /// </summary>
    public int UnmatchedBankItemsCount { get; private set; }

    /// <summary>
    /// Eşleşmeyen Sistem Kaydı Sayısı (Unmatched System Items Count)
    /// </summary>
    public int UnmatchedSystemItemsCount { get; private set; }

    /// <summary>
    /// Eşleşen Toplam Tutar (Matched Total Amount)
    /// </summary>
    public Money MatchedTotalAmount { get; private set; } = null!;

    /// <summary>
    /// Eşleşmeyen Banka Tutarı (Unmatched Bank Amount)
    /// </summary>
    public Money UnmatchedBankAmount { get; private set; } = null!;

    /// <summary>
    /// Eşleşmeyen Sistem Tutarı (Unmatched System Amount)
    /// </summary>
    public Money UnmatchedSystemAmount { get; private set; } = null!;

    #endregion

    #region Düzeltme Kayıtları (Adjustment Information)

    /// <summary>
    /// Düzeltme Kaydı Gerekli mi? (Needs Adjustment Entry)
    /// </summary>
    public bool NeedsAdjustmentEntry { get; private set; }

    /// <summary>
    /// Düzeltme Kaydı Oluşturuldu mu? (Adjustment Entry Created)
    /// </summary>
    public bool AdjustmentEntryCreated { get; private set; }

    /// <summary>
    /// Düzeltme Muhasebe Kaydı ID (Adjustment Journal Entry ID)
    /// </summary>
    public int? AdjustmentJournalEntryId { get; private set; }

    /// <summary>
    /// Toplam Düzeltme Tutarı (Total Adjustment Amount)
    /// </summary>
    public Money? TotalAdjustmentAmount { get; private set; }

    #endregion

    #region Durum Bilgileri (Status Information)

    /// <summary>
    /// Durum (Status)
    /// </summary>
    public BankReconciliationStatus Status { get; private set; }

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Hazırlayan Kullanıcı ID (Prepared By User ID)
    /// </summary>
    public int? PreparedByUserId { get; private set; }

    /// <summary>
    /// Onaylayan Kullanıcı ID (Approved By User ID)
    /// </summary>
    public int? ApprovedByUserId { get; private set; }

    /// <summary>
    /// Onay Tarihi (Approval Date)
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; private set; }

    #endregion

    #region Navigation Properties

    public virtual BankAccount BankAccount { get; private set; } = null!;
    public virtual JournalEntry? AdjustmentJournalEntry { get; private set; }
    public virtual ICollection<BankReconciliationItem> Items { get; private set; } = new List<BankReconciliationItem>();

    #endregion

    protected BankReconciliation() { }

    public BankReconciliation(
        string reconciliationNumber,
        int bankAccountId,
        DateTime periodStart,
        DateTime periodEnd,
        Money bankOpeningBalance,
        Money bankClosingBalance,
        Money systemOpeningBalance,
        string currency = "TRY")
    {
        ReconciliationNumber = reconciliationNumber;
        BankAccountId = bankAccountId;
        PeriodStart = periodStart;
        PeriodEnd = periodEnd;
        ReconciliationDate = DateTime.UtcNow;
        Currency = currency;

        BankOpeningBalance = bankOpeningBalance;
        BankClosingBalance = bankClosingBalance;
        SystemOpeningBalance = systemOpeningBalance;
        SystemClosingBalance = Money.Zero(currency);

        BankTotalCredits = Money.Zero(currency);
        BankTotalDebits = Money.Zero(currency);
        SystemTotalCredits = Money.Zero(currency);
        SystemTotalDebits = Money.Zero(currency);

        BalanceDifference = Money.Zero(currency);
        MatchedTotalAmount = Money.Zero(currency);
        UnmatchedBankAmount = Money.Zero(currency);
        UnmatchedSystemAmount = Money.Zero(currency);

        IsReconciled = false;
        NeedsAdjustmentEntry = false;
        AdjustmentEntryCreated = false;
        Status = BankReconciliationStatus.Draft;
    }

    public void SetDescription(string? description)
    {
        Description = description;
    }

    public void SetStatementInfo(string? statementNumber, DateTime? statementDate)
    {
        StatementNumber = statementNumber;
        StatementDate = statementDate;
    }

    public void SetBankTotals(Money totalCredits, Money totalDebits)
    {
        BankTotalCredits = totalCredits;
        BankTotalDebits = totalDebits;
    }

    public void SetSystemTotals(Money totalCredits, Money totalDebits, Money closingBalance)
    {
        SystemTotalCredits = totalCredits;
        SystemTotalDebits = totalDebits;
        SystemClosingBalance = closingBalance;
    }

    public void SetPreparedBy(int userId)
    {
        PreparedByUserId = userId;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void AddItem(BankReconciliationItem item)
    {
        Items.Add(item);
        RecalculateTotals();
    }

    public void RemoveItem(BankReconciliationItem item)
    {
        Items.Remove(item);
        RecalculateTotals();
    }

    public void RecalculateTotals()
    {
        var matchedItems = Items.Where(i => i.IsMatched).ToList();
        var unmatchedBankItems = Items.Where(i => !i.IsMatched && i.ItemType == ReconciliationItemType.BankStatement).ToList();
        var unmatchedSystemItems = Items.Where(i => !i.IsMatched && i.ItemType == ReconciliationItemType.SystemTransaction).ToList();

        MatchedTransactionCount = matchedItems.Count;
        UnmatchedBankItemsCount = unmatchedBankItems.Count;
        UnmatchedSystemItemsCount = unmatchedSystemItems.Count;

        MatchedTotalAmount = Money.Create(matchedItems.Sum(i => i.Amount.Amount), Currency);
        UnmatchedBankAmount = Money.Create(unmatchedBankItems.Sum(i => i.Amount.Amount), Currency);
        UnmatchedSystemAmount = Money.Create(unmatchedSystemItems.Sum(i => i.Amount.Amount), Currency);

        BalanceDifference = Money.Create(BankClosingBalance.Amount - SystemClosingBalance.Amount, Currency);

        IsReconciled = BalanceDifference.Amount == 0 && UnmatchedBankItemsCount == 0 && UnmatchedSystemItemsCount == 0;
        NeedsAdjustmentEntry = BalanceDifference.Amount != 0;
    }

    public void MatchItems(int bankItemId, int systemItemId)
    {
        var bankItem = Items.FirstOrDefault(i => i.Id == bankItemId && i.ItemType == ReconciliationItemType.BankStatement);
        var systemItem = Items.FirstOrDefault(i => i.Id == systemItemId && i.ItemType == ReconciliationItemType.SystemTransaction);

        if (bankItem != null && systemItem != null)
        {
            bankItem.Match(systemItemId);
            systemItem.Match(bankItemId);
            RecalculateTotals();
        }
    }

    public void UnmatchItems(int bankItemId, int systemItemId)
    {
        var bankItem = Items.FirstOrDefault(i => i.Id == bankItemId);
        var systemItem = Items.FirstOrDefault(i => i.Id == systemItemId);

        if (bankItem != null && systemItem != null)
        {
            bankItem.Unmatch();
            systemItem.Unmatch();
            RecalculateTotals();
        }
    }

    #region Status Management

    public void StartReconciliation()
    {
        if (Status != BankReconciliationStatus.Draft)
            throw new InvalidOperationException("Only draft reconciliations can be started");

        Status = BankReconciliationStatus.InProgress;
    }

    public void Complete()
    {
        if (Status != BankReconciliationStatus.InProgress)
            throw new InvalidOperationException("Only in-progress reconciliations can be completed");

        RecalculateTotals();
        Status = BankReconciliationStatus.Completed;
    }

    public void Approve(int approvedByUserId)
    {
        if (Status != BankReconciliationStatus.Completed)
            throw new InvalidOperationException("Only completed reconciliations can be approved");

        ApprovedByUserId = approvedByUserId;
        ApprovalDate = DateTime.UtcNow;
        Status = BankReconciliationStatus.Approved;
    }

    public void Reject(string reason)
    {
        if (Status != BankReconciliationStatus.Completed)
            throw new InvalidOperationException("Only completed reconciliations can be rejected");

        Status = BankReconciliationStatus.Rejected;
        Notes = string.IsNullOrEmpty(Notes) ? $"Rejected: {reason}" : $"{Notes}\nRejected: {reason}";
    }

    public void CreateAdjustmentEntry(int journalEntryId, Money adjustmentAmount)
    {
        AdjustmentJournalEntryId = journalEntryId;
        TotalAdjustmentAmount = adjustmentAmount;
        AdjustmentEntryCreated = true;
    }

    public void Cancel(string reason)
    {
        Status = BankReconciliationStatus.Cancelled;
        Notes = string.IsNullOrEmpty(Notes) ? $"Cancelled: {reason}" : $"{Notes}\nCancelled: {reason}";
    }

    #endregion

    #region Factory Methods

    /// <summary>
    /// Aylık mutabakat oluştur (Create monthly reconciliation)
    /// </summary>
    public static BankReconciliation CreateMonthlyReconciliation(
        string reconciliationNumber,
        int bankAccountId,
        int year,
        int month,
        Money bankOpeningBalance,
        Money bankClosingBalance,
        Money systemOpeningBalance,
        string currency = "TRY")
    {
        var periodStart = new DateTime(year, month, 1);
        var periodEnd = periodStart.AddMonths(1).AddDays(-1);

        return new BankReconciliation(
            reconciliationNumber,
            bankAccountId,
            periodStart,
            periodEnd,
            bankOpeningBalance,
            bankClosingBalance,
            systemOpeningBalance,
            currency);
    }

    #endregion
}

/// <summary>
/// Banka Mutabakat Kalemi (Bank Reconciliation Item)
/// </summary>
public class BankReconciliationItem : BaseEntity
{
    /// <summary>
    /// Mutabakat ID (Reconciliation ID)
    /// </summary>
    public int ReconciliationId { get; private set; }

    /// <summary>
    /// Kalem Türü (Item Type)
    /// </summary>
    public ReconciliationItemType ItemType { get; private set; }

    /// <summary>
    /// İşlem Tarihi (Transaction Date)
    /// </summary>
    public DateTime TransactionDate { get; private set; }

    /// <summary>
    /// Valör Tarihi (Value Date)
    /// </summary>
    public DateTime? ValueDate { get; private set; }

    /// <summary>
    /// Tutar (Amount)
    /// </summary>
    public Money Amount { get; private set; } = null!;

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string Description { get; private set; } = string.Empty;

    /// <summary>
    /// Referans Numarası (Reference Number)
    /// </summary>
    public string? ReferenceNumber { get; private set; }

    /// <summary>
    /// Banka İşlem ID (Bank Transaction ID)
    /// </summary>
    public int? BankTransactionId { get; private set; }

    /// <summary>
    /// Karşı Taraf (Counterparty)
    /// </summary>
    public string? Counterparty { get; private set; }

    /// <summary>
    /// Eşleşti mi? (Is Matched)
    /// </summary>
    public bool IsMatched { get; private set; }

    /// <summary>
    /// Eşleşen Kalem ID (Matched Item ID)
    /// </summary>
    public int? MatchedItemId { get; private set; }

    /// <summary>
    /// Eşleşme Tarihi (Match Date)
    /// </summary>
    public DateTime? MatchDate { get; private set; }

    /// <summary>
    /// Eşleşme Türü (Match Type)
    /// </summary>
    public ReconciliationMatchType? MatchType { get; private set; }

    /// <summary>
    /// Fark Tutarı (Difference Amount)
    /// </summary>
    public Money? DifferenceAmount { get; private set; }

    /// <summary>
    /// Düzeltme Gerekli mi? (Needs Correction)
    /// </summary>
    public bool NeedsCorrection { get; private set; }

    /// <summary>
    /// Düzeltme Notu (Correction Note)
    /// </summary>
    public string? CorrectionNote { get; private set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; private set; }

    public virtual BankReconciliation Reconciliation { get; private set; } = null!;
    public virtual BankTransaction? BankTransaction { get; private set; }

    protected BankReconciliationItem() { }

    public BankReconciliationItem(
        int reconciliationId,
        ReconciliationItemType itemType,
        DateTime transactionDate,
        Money amount,
        string description)
    {
        ReconciliationId = reconciliationId;
        ItemType = itemType;
        TransactionDate = transactionDate;
        Amount = amount;
        Description = description;
        IsMatched = false;
        NeedsCorrection = false;
    }

    public void SetValueDate(DateTime? valueDate)
    {
        ValueDate = valueDate;
    }

    public void SetReferenceNumber(string? referenceNumber)
    {
        ReferenceNumber = referenceNumber;
    }

    public void SetBankTransactionId(int? transactionId)
    {
        BankTransactionId = transactionId;
    }

    public void SetCounterparty(string? counterparty)
    {
        Counterparty = counterparty;
    }

    public void Match(int matchedItemId, ReconciliationMatchType matchType = ReconciliationMatchType.Exact)
    {
        IsMatched = true;
        MatchedItemId = matchedItemId;
        MatchDate = DateTime.UtcNow;
        MatchType = matchType;
    }

    public void MatchWithDifference(int matchedItemId, Money differenceAmount)
    {
        Match(matchedItemId, ReconciliationMatchType.WithDifference);
        DifferenceAmount = differenceAmount;
        NeedsCorrection = differenceAmount.Amount != 0;
    }

    public void Unmatch()
    {
        IsMatched = false;
        MatchedItemId = null;
        MatchDate = null;
        MatchType = null;
        DifferenceAmount = null;
        NeedsCorrection = false;
    }

    public void SetCorrectionNote(string note)
    {
        CorrectionNote = note;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void MarkCorrected()
    {
        NeedsCorrection = false;
    }
}

#region Enums

/// <summary>
/// Banka Mutabakat Durumları (Bank Reconciliation Statuses)
/// </summary>
public enum BankReconciliationStatus
{
    /// <summary>
    /// Taslak (Draft)
    /// </summary>
    Draft = 1,

    /// <summary>
    /// Devam Ediyor (In Progress)
    /// </summary>
    InProgress = 2,

    /// <summary>
    /// Tamamlandı (Completed)
    /// </summary>
    Completed = 3,

    /// <summary>
    /// Onaylandı (Approved)
    /// </summary>
    Approved = 4,

    /// <summary>
    /// Reddedildi (Rejected)
    /// </summary>
    Rejected = 5,

    /// <summary>
    /// İptal Edildi (Cancelled)
    /// </summary>
    Cancelled = 6
}

/// <summary>
/// Mutabakat Kalemi Türleri (Reconciliation Item Types)
/// </summary>
public enum ReconciliationItemType
{
    /// <summary>
    /// Banka Ekstresi (Bank Statement)
    /// </summary>
    BankStatement = 1,

    /// <summary>
    /// Sistem İşlemi (System Transaction)
    /// </summary>
    SystemTransaction = 2
}

/// <summary>
/// Mutabakat Eşleşme Türleri (Reconciliation Match Types)
/// </summary>
public enum ReconciliationMatchType
{
    /// <summary>
    /// Tam Eşleşme (Exact Match)
    /// </summary>
    Exact = 1,

    /// <summary>
    /// Farklı Eşleşme (Match with Difference)
    /// </summary>
    WithDifference = 2,

    /// <summary>
    /// Manuel Eşleşme (Manual Match)
    /// </summary>
    Manual = 3,

    /// <summary>
    /// Otomatik Eşleşme (Auto Match)
    /// </summary>
    Auto = 4,

    /// <summary>
    /// Çoklu Eşleşme (Multiple Match)
    /// </summary>
    Multiple = 5
}

#endregion
