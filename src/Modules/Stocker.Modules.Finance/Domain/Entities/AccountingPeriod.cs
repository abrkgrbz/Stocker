using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Muhasebe Dönemi (Accounting Period)
/// Mali dönem ve yıl sonu işlemlerini yönetir
/// </summary>
public class AccountingPeriod : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Dönem Kodu (Period Code)
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// Dönem Adı (Period Name)
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Mali Yıl (Fiscal Year)
    /// </summary>
    public int FiscalYear { get; private set; }

    /// <summary>
    /// Dönem Numarası (Period Number)
    /// </summary>
    public int PeriodNumber { get; private set; }

    /// <summary>
    /// Dönem Türü (Period Type)
    /// </summary>
    public AccountingPeriodType PeriodType { get; private set; }

    /// <summary>
    /// Başlangıç Tarihi (Start Date)
    /// </summary>
    public DateTime StartDate { get; private set; }

    /// <summary>
    /// Bitiş Tarihi (End Date)
    /// </summary>
    public DateTime EndDate { get; private set; }

    #endregion

    #region Durum Bilgileri (Status Information)

    /// <summary>
    /// Dönem Durumu (Period Status)
    /// </summary>
    public AccountingPeriodStatus Status { get; private set; }

    /// <summary>
    /// Aktif Dönem mi? (Is Active Period)
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Geçici Kapanış mı? (Is Soft Closed)
    /// </summary>
    public bool IsSoftClosed { get; private set; }

    /// <summary>
    /// Kesin Kapanış mı? (Is Hard Closed)
    /// </summary>
    public bool IsHardClosed { get; private set; }

    /// <summary>
    /// Kilitli mi? (Is Locked)
    /// </summary>
    public bool IsLocked { get; private set; }

    /// <summary>
    /// Kapanış Tarihi (Close Date)
    /// </summary>
    public DateTime? CloseDate { get; private set; }

    /// <summary>
    /// Kapatan Kullanıcı ID (Closed By User ID)
    /// </summary>
    public int? ClosedByUserId { get; private set; }

    #endregion

    #region Dönem Kısıtlamaları (Period Restrictions)

    /// <summary>
    /// Satış İşlemlerine Açık (Allow Sales)
    /// </summary>
    public bool AllowSales { get; private set; }

    /// <summary>
    /// Satın Alma İşlemlerine Açık (Allow Purchases)
    /// </summary>
    public bool AllowPurchases { get; private set; }

    /// <summary>
    /// Stok İşlemlerine Açık (Allow Inventory)
    /// </summary>
    public bool AllowInventory { get; private set; }

    /// <summary>
    /// Muhasebe İşlemlerine Açık (Allow Journal Entries)
    /// </summary>
    public bool AllowJournalEntries { get; private set; }

    /// <summary>
    /// Ödeme/Tahsilat İşlemlerine Açık (Allow Payments)
    /// </summary>
    public bool AllowPayments { get; private set; }

    /// <summary>
    /// Banka İşlemlerine Açık (Allow Bank Transactions)
    /// </summary>
    public bool AllowBankTransactions { get; private set; }

    /// <summary>
    /// Düzeltme İşlemlerine Açık (Allow Adjustments)
    /// </summary>
    public bool AllowAdjustments { get; private set; }

    #endregion

    #region Yıl Sonu İşlemleri (Year End Processing)

    /// <summary>
    /// Yıl Sonu Dönemi mi? (Is Year End Period)
    /// </summary>
    public bool IsYearEndPeriod { get; private set; }

    /// <summary>
    /// Kapanış Kayıtları Yapıldı mı? (Closing Entries Done)
    /// </summary>
    public bool ClosingEntriesDone { get; private set; }

    /// <summary>
    /// Kapanış Kaydı ID (Closing Entry ID)
    /// </summary>
    public int? ClosingJournalEntryId { get; private set; }

    /// <summary>
    /// Açılış Kayıtları Yapıldı mı? (Opening Entries Done)
    /// </summary>
    public bool OpeningEntriesDone { get; private set; }

    /// <summary>
    /// Açılış Kaydı ID (Opening Entry ID)
    /// </summary>
    public int? OpeningJournalEntryId { get; private set; }

    /// <summary>
    /// Bakiye Devri Yapıldı mı? (Balance Carried Forward)
    /// </summary>
    public bool BalanceCarriedForward { get; private set; }

    /// <summary>
    /// Devir Tarihi (Carry Forward Date)
    /// </summary>
    public DateTime? CarryForwardDate { get; private set; }

    #endregion

    #region İstatistikler (Statistics)

    /// <summary>
    /// Toplam Muhasebe Fişi Sayısı (Total Journal Entry Count)
    /// </summary>
    public int TotalJournalEntryCount { get; private set; }

    /// <summary>
    /// Toplam Fatura Sayısı (Total Invoice Count)
    /// </summary>
    public int TotalInvoiceCount { get; private set; }

    /// <summary>
    /// Toplam Borç Tutarı (Total Debit Amount)
    /// </summary>
    public Money? TotalDebitAmount { get; private set; }

    /// <summary>
    /// Toplam Alacak Tutarı (Total Credit Amount)
    /// </summary>
    public Money? TotalCreditAmount { get; private set; }

    /// <summary>
    /// Son İşlem Tarihi (Last Transaction Date)
    /// </summary>
    public DateTime? LastTransactionDate { get; private set; }

    #endregion

    #region Vergi Dönemleri (Tax Periods)

    /// <summary>
    /// KDV Dönemi mi? (Is VAT Period)
    /// </summary>
    public bool IsVatPeriod { get; private set; }

    /// <summary>
    /// KDV Beyannamesi Verildi mi? (VAT Return Filed)
    /// </summary>
    public bool VatReturnFiled { get; private set; }

    /// <summary>
    /// KDV Beyanname Tarihi (VAT Return Date)
    /// </summary>
    public DateTime? VatReturnDate { get; private set; }

    /// <summary>
    /// Geçici Vergi Dönemi mi? (Is Provisional Tax Period)
    /// </summary>
    public bool IsProvisionalTaxPeriod { get; private set; }

    /// <summary>
    /// Geçici Vergi Beyannamesi Verildi mi? (Provisional Tax Return Filed)
    /// </summary>
    public bool ProvisionalTaxFiled { get; private set; }

    /// <summary>
    /// Geçici Vergi Beyanname Tarihi (Provisional Tax Return Date)
    /// </summary>
    public DateTime? ProvisionalTaxDate { get; private set; }

    #endregion

    #region Diğer Bilgiler (Other Information)

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Önceki Dönem ID (Previous Period ID)
    /// </summary>
    public int? PreviousPeriodId { get; private set; }

    /// <summary>
    /// Sonraki Dönem ID (Next Period ID)
    /// </summary>
    public int? NextPeriodId { get; private set; }

    #endregion

    #region Navigation Properties

    public virtual AccountingPeriod? PreviousPeriod { get; private set; }
    public virtual AccountingPeriod? NextPeriod { get; private set; }
    public virtual JournalEntry? ClosingJournalEntry { get; private set; }
    public virtual JournalEntry? OpeningJournalEntry { get; private set; }
    public virtual ICollection<JournalEntry> JournalEntries { get; private set; } = new List<JournalEntry>();

    #endregion

    protected AccountingPeriod() { }

    public AccountingPeriod(
        string code,
        string name,
        int fiscalYear,
        int periodNumber,
        AccountingPeriodType periodType,
        DateTime startDate,
        DateTime endDate)
    {
        Code = code;
        Name = name;
        FiscalYear = fiscalYear;
        PeriodNumber = periodNumber;
        PeriodType = periodType;
        StartDate = startDate;
        EndDate = endDate;

        Status = AccountingPeriodStatus.Open;
        IsActive = false;
        IsSoftClosed = false;
        IsHardClosed = false;
        IsLocked = false;

        // Default all operations allowed
        AllowSales = true;
        AllowPurchases = true;
        AllowInventory = true;
        AllowJournalEntries = true;
        AllowPayments = true;
        AllowBankTransactions = true;
        AllowAdjustments = true;

        IsYearEndPeriod = periodNumber == 12 || periodType == AccountingPeriodType.Annual;
        ClosingEntriesDone = false;
        OpeningEntriesDone = false;
        BalanceCarriedForward = false;

        // Tax period defaults
        IsVatPeriod = periodType == AccountingPeriodType.Monthly;
        VatReturnFiled = false;
        IsProvisionalTaxPeriod = periodType == AccountingPeriodType.Quarterly && (periodNumber == 3 || periodNumber == 6 || periodNumber == 9);
        ProvisionalTaxFiled = false;

        TotalJournalEntryCount = 0;
        TotalInvoiceCount = 0;
    }

    public void SetDescription(string? description)
    {
        Description = description;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void LinkPeriods(int? previousPeriodId, int? nextPeriodId)
    {
        PreviousPeriodId = previousPeriodId;
        NextPeriodId = nextPeriodId;
    }

    public void Activate()
    {
        if (IsHardClosed)
            throw new InvalidOperationException("Cannot activate a hard closed period");

        IsActive = true;
        Status = AccountingPeriodStatus.Open;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public bool IsDateInPeriod(DateTime date)
    {
        return date.Date >= StartDate.Date && date.Date <= EndDate.Date;
    }

    public bool CanPostTransaction(DateTime transactionDate, string transactionType)
    {
        if (!IsActive)
            return false;

        if (IsHardClosed)
            return false;

        if (!IsDateInPeriod(transactionDate))
            return false;

        if (IsSoftClosed && !AllowAdjustments)
            return false;

        return transactionType switch
        {
            "Sales" => AllowSales,
            "Purchase" => AllowPurchases,
            "Inventory" => AllowInventory,
            "JournalEntry" => AllowJournalEntries,
            "Payment" => AllowPayments,
            "BankTransaction" => AllowBankTransactions,
            "Adjustment" => AllowAdjustments,
            _ => true
        };
    }

    public void SetRestrictions(
        bool allowSales = true,
        bool allowPurchases = true,
        bool allowInventory = true,
        bool allowJournalEntries = true,
        bool allowPayments = true,
        bool allowBankTransactions = true,
        bool allowAdjustments = true)
    {
        AllowSales = allowSales;
        AllowPurchases = allowPurchases;
        AllowInventory = allowInventory;
        AllowJournalEntries = allowJournalEntries;
        AllowPayments = allowPayments;
        AllowBankTransactions = allowBankTransactions;
        AllowAdjustments = allowAdjustments;
    }

    public void UpdateStatistics(int journalEntryCount, int invoiceCount, Money? totalDebit, Money? totalCredit)
    {
        TotalJournalEntryCount = journalEntryCount;
        TotalInvoiceCount = invoiceCount;
        TotalDebitAmount = totalDebit;
        TotalCreditAmount = totalCredit;
        LastTransactionDate = DateTime.UtcNow;
    }

    public void IncrementJournalEntryCount()
    {
        TotalJournalEntryCount++;
        LastTransactionDate = DateTime.UtcNow;
    }

    public void IncrementInvoiceCount()
    {
        TotalInvoiceCount++;
        LastTransactionDate = DateTime.UtcNow;
    }

    #region Period Closing

    /// <summary>
    /// Geçici Kapanış (Soft Close)
    /// </summary>
    public void SoftClose()
    {
        if (IsHardClosed)
            throw new InvalidOperationException("Period is already hard closed");

        IsSoftClosed = true;
        Status = AccountingPeriodStatus.SoftClosed;

        // Restrict most operations, allow only adjustments
        AllowSales = false;
        AllowPurchases = false;
        AllowInventory = false;
        AllowPayments = false;
        AllowBankTransactions = false;
        AllowJournalEntries = true; // Only adjustment entries allowed
        AllowAdjustments = true;
    }

    /// <summary>
    /// Geçici Kapanışı Aç (Reopen from Soft Close)
    /// </summary>
    public void ReopenFromSoftClose()
    {
        if (!IsSoftClosed)
            throw new InvalidOperationException("Period is not soft closed");

        if (IsHardClosed)
            throw new InvalidOperationException("Cannot reopen a hard closed period");

        IsSoftClosed = false;
        Status = AccountingPeriodStatus.Open;

        // Restore all operations
        AllowSales = true;
        AllowPurchases = true;
        AllowInventory = true;
        AllowPayments = true;
        AllowBankTransactions = true;
        AllowJournalEntries = true;
        AllowAdjustments = true;
    }

    /// <summary>
    /// Kesin Kapanış (Hard Close)
    /// </summary>
    public void HardClose(int closedByUserId)
    {
        if (IsHardClosed)
            throw new InvalidOperationException("Period is already hard closed");

        IsHardClosed = true;
        IsSoftClosed = true;
        IsActive = false;
        IsLocked = true;
        Status = AccountingPeriodStatus.HardClosed;
        CloseDate = DateTime.UtcNow;
        ClosedByUserId = closedByUserId;

        // Restrict all operations
        AllowSales = false;
        AllowPurchases = false;
        AllowInventory = false;
        AllowPayments = false;
        AllowBankTransactions = false;
        AllowJournalEntries = false;
        AllowAdjustments = false;
    }

    /// <summary>
    /// Kilitle (Lock Period)
    /// </summary>
    public void Lock()
    {
        IsLocked = true;
        AllowAdjustments = false;
    }

    /// <summary>
    /// Kilidi Aç (Unlock Period)
    /// </summary>
    public void Unlock()
    {
        if (IsHardClosed)
            throw new InvalidOperationException("Cannot unlock a hard closed period");

        IsLocked = false;
        if (!IsSoftClosed)
            AllowAdjustments = true;
    }

    #endregion

    #region Year End Processing

    /// <summary>
    /// Kapanış Kayıtlarını İşle (Process Closing Entries)
    /// </summary>
    public void ProcessClosingEntries(int closingJournalEntryId)
    {
        if (!IsYearEndPeriod)
            throw new InvalidOperationException("Not a year end period");

        ClosingEntriesDone = true;
        ClosingJournalEntryId = closingJournalEntryId;
    }

    /// <summary>
    /// Açılış Kayıtlarını İşle (Process Opening Entries)
    /// </summary>
    public void ProcessOpeningEntries(int openingJournalEntryId)
    {
        OpeningEntriesDone = true;
        OpeningJournalEntryId = openingJournalEntryId;
    }

    /// <summary>
    /// Bakiye Devrini İşle (Process Balance Carry Forward)
    /// </summary>
    public void ProcessBalanceCarryForward()
    {
        if (!ClosingEntriesDone)
            throw new InvalidOperationException("Closing entries must be processed first");

        BalanceCarriedForward = true;
        CarryForwardDate = DateTime.UtcNow;
    }

    #endregion

    #region Tax Returns

    /// <summary>
    /// KDV Beyannamesi Verildi İşaretle (Mark VAT Return Filed)
    /// </summary>
    public void MarkVatReturnFiled(DateTime filingDate)
    {
        if (!IsVatPeriod)
            throw new InvalidOperationException("Not a VAT period");

        VatReturnFiled = true;
        VatReturnDate = filingDate;
    }

    /// <summary>
    /// Geçici Vergi Beyannamesi Verildi İşaretle (Mark Provisional Tax Filed)
    /// </summary>
    public void MarkProvisionalTaxFiled(DateTime filingDate)
    {
        if (!IsProvisionalTaxPeriod)
            throw new InvalidOperationException("Not a provisional tax period");

        ProvisionalTaxFiled = true;
        ProvisionalTaxDate = filingDate;
    }

    #endregion

    #region Factory Methods

    /// <summary>
    /// Aylık dönem oluştur (Create monthly period)
    /// </summary>
    public static AccountingPeriod CreateMonthlyPeriod(int fiscalYear, int month)
    {
        var startDate = new DateTime(fiscalYear, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);
        var code = $"{fiscalYear}-{month:D2}";
        var name = $"{fiscalYear} - {startDate:MMMM}";

        return new AccountingPeriod(
            code,
            name,
            fiscalYear,
            month,
            AccountingPeriodType.Monthly,
            startDate,
            endDate);
    }

    /// <summary>
    /// Üç aylık dönem oluştur (Create quarterly period)
    /// </summary>
    public static AccountingPeriod CreateQuarterlyPeriod(int fiscalYear, int quarter)
    {
        if (quarter < 1 || quarter > 4)
            throw new ArgumentOutOfRangeException(nameof(quarter), "Quarter must be between 1 and 4");

        var startMonth = (quarter - 1) * 3 + 1;
        var startDate = new DateTime(fiscalYear, startMonth, 1);
        var endDate = startDate.AddMonths(3).AddDays(-1);
        var code = $"{fiscalYear}-Q{quarter}";
        var name = $"{fiscalYear} - Q{quarter}";

        var period = new AccountingPeriod(
            code,
            name,
            fiscalYear,
            quarter,
            AccountingPeriodType.Quarterly,
            startDate,
            endDate);

        period.IsProvisionalTaxPeriod = true;
        return period;
    }

    /// <summary>
    /// Yıllık dönem oluştur (Create annual period)
    /// </summary>
    public static AccountingPeriod CreateAnnualPeriod(int fiscalYear)
    {
        var startDate = new DateTime(fiscalYear, 1, 1);
        var endDate = new DateTime(fiscalYear, 12, 31);
        var code = $"{fiscalYear}";
        var name = $"Mali Yıl {fiscalYear}";

        return new AccountingPeriod(
            code,
            name,
            fiscalYear,
            1,
            AccountingPeriodType.Annual,
            startDate,
            endDate);
    }

    /// <summary>
    /// Özel tarihli dönem oluştur (Create custom date period)
    /// </summary>
    public static AccountingPeriod CreateCustomPeriod(
        string code,
        string name,
        int fiscalYear,
        int periodNumber,
        DateTime startDate,
        DateTime endDate)
    {
        return new AccountingPeriod(
            code,
            name,
            fiscalYear,
            periodNumber,
            AccountingPeriodType.Custom,
            startDate,
            endDate);
    }

    #endregion
}

/// <summary>
/// Muhasebe Dönemi Türleri (Accounting Period Types)
/// </summary>
public enum AccountingPeriodType
{
    /// <summary>
    /// Aylık (Monthly)
    /// </summary>
    Monthly = 1,

    /// <summary>
    /// Üç Aylık (Quarterly)
    /// </summary>
    Quarterly = 2,

    /// <summary>
    /// Altı Aylık (Semi-Annual)
    /// </summary>
    SemiAnnual = 3,

    /// <summary>
    /// Yıllık (Annual)
    /// </summary>
    Annual = 4,

    /// <summary>
    /// Özel (Custom)
    /// </summary>
    Custom = 99
}

/// <summary>
/// Muhasebe Dönemi Durumları (Accounting Period Statuses)
/// </summary>
public enum AccountingPeriodStatus
{
    /// <summary>
    /// Açık (Open)
    /// </summary>
    Open = 1,

    /// <summary>
    /// Geçici Kapanış (Soft Closed)
    /// </summary>
    SoftClosed = 2,

    /// <summary>
    /// Kesin Kapanış (Hard Closed)
    /// </summary>
    HardClosed = 3,

    /// <summary>
    /// Arşivlenmiş (Archived)
    /// </summary>
    Archived = 4
}
