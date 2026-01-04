using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Muhasebe Dönemi DTO (Accounting Period DTO)
/// </summary>
public class AccountingPeriodDto
{
    public int Id { get; set; }

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Dönem Kodu (Period Code)
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Dönem Adı (Period Name)
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Mali Yıl (Fiscal Year)
    /// </summary>
    public int FiscalYear { get; set; }

    /// <summary>
    /// Dönem Numarası (Period Number)
    /// </summary>
    public int PeriodNumber { get; set; }

    /// <summary>
    /// Dönem Türü (Period Type)
    /// </summary>
    public AccountingPeriodType PeriodType { get; set; }

    /// <summary>
    /// Dönem Türü Adı (Period Type Name)
    /// </summary>
    public string PeriodTypeName { get; set; } = string.Empty;

    /// <summary>
    /// Başlangıç Tarihi (Start Date)
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Bitiş Tarihi (End Date)
    /// </summary>
    public DateTime EndDate { get; set; }

    #endregion

    #region Durum Bilgileri (Status Information)

    /// <summary>
    /// Dönem Durumu (Period Status)
    /// </summary>
    public AccountingPeriodStatus Status { get; set; }

    /// <summary>
    /// Dönem Durumu Adı (Period Status Name)
    /// </summary>
    public string StatusName { get; set; } = string.Empty;

    /// <summary>
    /// Aktif Dönem mi? (Is Active Period)
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Geçici Kapanış mı? (Is Soft Closed)
    /// </summary>
    public bool IsSoftClosed { get; set; }

    /// <summary>
    /// Kesin Kapanış mı? (Is Hard Closed)
    /// </summary>
    public bool IsHardClosed { get; set; }

    /// <summary>
    /// Kilitli mi? (Is Locked)
    /// </summary>
    public bool IsLocked { get; set; }

    /// <summary>
    /// Kapanış Tarihi (Close Date)
    /// </summary>
    public DateTime? CloseDate { get; set; }

    /// <summary>
    /// Kapatan Kullanıcı ID (Closed By User ID)
    /// </summary>
    public int? ClosedByUserId { get; set; }

    #endregion

    #region Dönem Kısıtlamaları (Period Restrictions)

    /// <summary>
    /// Satış İşlemlerine Açık (Allow Sales)
    /// </summary>
    public bool AllowSales { get; set; }

    /// <summary>
    /// Satın Alma İşlemlerine Açık (Allow Purchases)
    /// </summary>
    public bool AllowPurchases { get; set; }

    /// <summary>
    /// Stok İşlemlerine Açık (Allow Inventory)
    /// </summary>
    public bool AllowInventory { get; set; }

    /// <summary>
    /// Muhasebe İşlemlerine Açık (Allow Journal Entries)
    /// </summary>
    public bool AllowJournalEntries { get; set; }

    /// <summary>
    /// Ödeme/Tahsilat İşlemlerine Açık (Allow Payments)
    /// </summary>
    public bool AllowPayments { get; set; }

    /// <summary>
    /// Banka İşlemlerine Açık (Allow Bank Transactions)
    /// </summary>
    public bool AllowBankTransactions { get; set; }

    /// <summary>
    /// Düzeltme İşlemlerine Açık (Allow Adjustments)
    /// </summary>
    public bool AllowAdjustments { get; set; }

    #endregion

    #region Yıl Sonu İşlemleri (Year End Processing)

    /// <summary>
    /// Yıl Sonu Dönemi mi? (Is Year End Period)
    /// </summary>
    public bool IsYearEndPeriod { get; set; }

    /// <summary>
    /// Kapanış Kayıtları Yapıldı mı? (Closing Entries Done)
    /// </summary>
    public bool ClosingEntriesDone { get; set; }

    /// <summary>
    /// Kapanış Kaydı ID (Closing Entry ID)
    /// </summary>
    public int? ClosingJournalEntryId { get; set; }

    /// <summary>
    /// Açılış Kayıtları Yapıldı mı? (Opening Entries Done)
    /// </summary>
    public bool OpeningEntriesDone { get; set; }

    /// <summary>
    /// Açılış Kaydı ID (Opening Entry ID)
    /// </summary>
    public int? OpeningJournalEntryId { get; set; }

    /// <summary>
    /// Bakiye Devri Yapıldı mı? (Balance Carried Forward)
    /// </summary>
    public bool BalanceCarriedForward { get; set; }

    /// <summary>
    /// Devir Tarihi (Carry Forward Date)
    /// </summary>
    public DateTime? CarryForwardDate { get; set; }

    #endregion

    #region İstatistikler (Statistics)

    /// <summary>
    /// Toplam Muhasebe Fişi Sayısı (Total Journal Entry Count)
    /// </summary>
    public int TotalJournalEntryCount { get; set; }

    /// <summary>
    /// Toplam Fatura Sayısı (Total Invoice Count)
    /// </summary>
    public int TotalInvoiceCount { get; set; }

    /// <summary>
    /// Toplam Borç Tutarı (Total Debit Amount)
    /// </summary>
    public decimal? TotalDebitAmount { get; set; }

    /// <summary>
    /// Toplam Alacak Tutarı (Total Credit Amount)
    /// </summary>
    public decimal? TotalCreditAmount { get; set; }

    /// <summary>
    /// Son İşlem Tarihi (Last Transaction Date)
    /// </summary>
    public DateTime? LastTransactionDate { get; set; }

    #endregion

    #region Vergi Dönemleri (Tax Periods)

    /// <summary>
    /// KDV Dönemi mi? (Is VAT Period)
    /// </summary>
    public bool IsVatPeriod { get; set; }

    /// <summary>
    /// KDV Beyannamesi Verildi mi? (VAT Return Filed)
    /// </summary>
    public bool VatReturnFiled { get; set; }

    /// <summary>
    /// KDV Beyanname Tarihi (VAT Return Date)
    /// </summary>
    public DateTime? VatReturnDate { get; set; }

    /// <summary>
    /// Geçici Vergi Dönemi mi? (Is Provisional Tax Period)
    /// </summary>
    public bool IsProvisionalTaxPeriod { get; set; }

    /// <summary>
    /// Geçici Vergi Beyannamesi Verildi mi? (Provisional Tax Return Filed)
    /// </summary>
    public bool ProvisionalTaxFiled { get; set; }

    /// <summary>
    /// Geçici Vergi Beyanname Tarihi (Provisional Tax Return Date)
    /// </summary>
    public DateTime? ProvisionalTaxDate { get; set; }

    #endregion

    #region Diğer Bilgiler (Other Information)

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Önceki Dönem ID (Previous Period ID)
    /// </summary>
    public int? PreviousPeriodId { get; set; }

    /// <summary>
    /// Sonraki Dönem ID (Next Period ID)
    /// </summary>
    public int? NextPeriodId { get; set; }

    #endregion

    #region Audit

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    #endregion
}

/// <summary>
/// Muhasebe Dönemi Özet DTO (Accounting Period Summary DTO)
/// </summary>
public class AccountingPeriodSummaryDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int FiscalYear { get; set; }
    public int PeriodNumber { get; set; }
    public AccountingPeriodType PeriodType { get; set; }
    public string PeriodTypeName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public AccountingPeriodStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsLocked { get; set; }
    public int TotalJournalEntryCount { get; set; }
    public int TotalInvoiceCount { get; set; }
}

/// <summary>
/// Muhasebe Dönemi Filtre DTO (Accounting Period Filter DTO)
/// </summary>
public class AccountingPeriodFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public int? FiscalYear { get; set; }
    public AccountingPeriodType? PeriodType { get; set; }
    public AccountingPeriodStatus? Status { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsLocked { get; set; }
    public bool? IsOpen { get; set; }
    public DateTime? StartDateFrom { get; set; }
    public DateTime? StartDateTo { get; set; }
    public DateTime? EndDateFrom { get; set; }
    public DateTime? EndDateTo { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}

/// <summary>
/// Aylık Dönem Oluşturma DTO (Create Monthly Period DTO)
/// </summary>
public class CreateMonthlyPeriodDto
{
    /// <summary>
    /// Mali Yıl (Fiscal Year)
    /// </summary>
    public int FiscalYear { get; set; }

    /// <summary>
    /// Ay (Month 1-12)
    /// </summary>
    public int Month { get; set; }

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Üç Aylık Dönem Oluşturma DTO (Create Quarterly Period DTO)
/// </summary>
public class CreateQuarterlyPeriodDto
{
    /// <summary>
    /// Mali Yıl (Fiscal Year)
    /// </summary>
    public int FiscalYear { get; set; }

    /// <summary>
    /// Çeyrek (Quarter 1-4)
    /// </summary>
    public int Quarter { get; set; }

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Yıllık Dönem Oluşturma DTO (Create Annual Period DTO)
/// </summary>
public class CreateAnnualPeriodDto
{
    /// <summary>
    /// Mali Yıl (Fiscal Year)
    /// </summary>
    public int FiscalYear { get; set; }

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Özel Dönem Oluşturma DTO (Create Custom Period DTO)
/// </summary>
public class CreateCustomPeriodDto
{
    /// <summary>
    /// Dönem Kodu (Period Code)
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Dönem Adı (Period Name)
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Mali Yıl (Fiscal Year)
    /// </summary>
    public int FiscalYear { get; set; }

    /// <summary>
    /// Dönem Numarası (Period Number)
    /// </summary>
    public int PeriodNumber { get; set; }

    /// <summary>
    /// Başlangıç Tarihi (Start Date)
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Bitiş Tarihi (End Date)
    /// </summary>
    public DateTime EndDate { get; set; }

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Muhasebe Dönemi Güncelleme DTO (Update Accounting Period DTO)
/// </summary>
public class UpdateAccountingPeriodDto
{
    /// <summary>
    /// Dönem Adı (Period Name)
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Dönem Kısıtlamaları DTO (Period Restrictions DTO)
/// </summary>
public class SetPeriodRestrictionsDto
{
    /// <summary>
    /// Satış İşlemlerine Açık (Allow Sales)
    /// </summary>
    public bool AllowSales { get; set; } = true;

    /// <summary>
    /// Satın Alma İşlemlerine Açık (Allow Purchases)
    /// </summary>
    public bool AllowPurchases { get; set; } = true;

    /// <summary>
    /// Stok İşlemlerine Açık (Allow Inventory)
    /// </summary>
    public bool AllowInventory { get; set; } = true;

    /// <summary>
    /// Muhasebe İşlemlerine Açık (Allow Journal Entries)
    /// </summary>
    public bool AllowJournalEntries { get; set; } = true;

    /// <summary>
    /// Ödeme/Tahsilat İşlemlerine Açık (Allow Payments)
    /// </summary>
    public bool AllowPayments { get; set; } = true;

    /// <summary>
    /// Banka İşlemlerine Açık (Allow Bank Transactions)
    /// </summary>
    public bool AllowBankTransactions { get; set; } = true;

    /// <summary>
    /// Düzeltme İşlemlerine Açık (Allow Adjustments)
    /// </summary>
    public bool AllowAdjustments { get; set; } = true;
}
