using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Çek DTO (Check DTO)
/// </summary>
public class CheckDto
{
    public int Id { get; set; }

    // Temel Bilgiler (Basic Information)
    public string CheckNumber { get; set; } = string.Empty;
    public string PortfolioNumber { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public CheckType CheckType { get; set; }
    public string CheckTypeName { get; set; } = string.Empty;
    public MovementDirection Direction { get; set; }
    public string DirectionName { get; set; } = string.Empty;
    public NegotiableInstrumentStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;

    // Tarih Bilgileri (Date Information)
    public DateTime RegistrationDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime IssueDate { get; set; }
    public DateTime? CollectionDate { get; set; }

    // Tutar Bilgileri (Amount Information)
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal ExchangeRate { get; set; } = 1;
    public decimal AmountTRY { get; set; }

    // Banka Bilgileri (Bank Information)
    public string BankName { get; set; } = string.Empty;
    public string? BranchName { get; set; }
    public string? BranchCode { get; set; }
    public string? AccountNumber { get; set; }
    public string? Iban { get; set; }

    // Keşideci Bilgileri (Drawer Information)
    public string DrawerName { get; set; } = string.Empty;
    public string? DrawerTaxId { get; set; }
    public string? DrawerAddress { get; set; }
    public string? DrawerPhone { get; set; }

    // Lehdar Bilgileri (Beneficiary Information)
    public string? BeneficiaryName { get; set; }
    public string? BeneficiaryTaxId { get; set; }

    // Cari Hesap Bilgileri (Current Account Information)
    public int? CurrentAccountId { get; set; }
    public string? CurrentAccountName { get; set; }

    // Hareket Bilgileri (Movement Information)
    public bool IsGivenToBank { get; set; }
    public int? CollectionBankAccountId { get; set; }
    public string? CollectionBankAccountName { get; set; }
    public DateTime? GivenToBankDate { get; set; }

    public bool IsEndorsed { get; set; }
    public int? EndorsedToCurrentAccountId { get; set; }
    public string? EndorsedToCurrentAccountName { get; set; }
    public DateTime? EndorsementDate { get; set; }

    public bool IsGivenAsCollateral { get; set; }
    public string? CollateralGivenTo { get; set; }
    public DateTime? CollateralDate { get; set; }

    // Karşılıksız/Protesto Bilgileri (Bounced/Protest Information)
    public bool IsBounced { get; set; }
    public DateTime? BouncedDate { get; set; }
    public string? BouncedReason { get; set; }
    public bool IsProtested { get; set; }
    public DateTime? ProtestDate { get; set; }

    // Referans Bilgileri (Reference Information)
    public int? PaymentId { get; set; }
    public int? JournalEntryId { get; set; }
    public string? Notes { get; set; }

    // Hareketler (Movements)
    public List<CheckMovementDto> Movements { get; set; } = new();

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Çek Hareket DTO (Check Movement DTO)
/// </summary>
public class CheckMovementDto
{
    public int Id { get; set; }
    public int CheckId { get; set; }
    public CheckMovementType MovementType { get; set; }
    public string MovementTypeName { get; set; } = string.Empty;
    public DateTime MovementDate { get; set; }
    public string Description { get; set; } = string.Empty;
}

/// <summary>
/// Çek Özet DTO (Check Summary DTO)
/// </summary>
public class CheckSummaryDto
{
    public int Id { get; set; }
    public string CheckNumber { get; set; } = string.Empty;
    public string PortfolioNumber { get; set; } = string.Empty;
    public CheckType CheckType { get; set; }
    public MovementDirection Direction { get; set; }
    public string DirectionName { get; set; } = string.Empty;
    public NegotiableInstrumentStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public string BankName { get; set; } = string.Empty;
    public string DrawerName { get; set; } = string.Empty;
    public string? CurrentAccountName { get; set; }
}

/// <summary>
/// Alınan Çek Oluşturma DTO (Create Received Check DTO)
/// </summary>
public class CreateReceivedCheckDto
{
    // Temel Bilgiler
    public string CheckNumber { get; set; } = string.Empty;
    public string PortfolioNumber { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }

    // Tarih Bilgileri
    public DateTime RegistrationDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime IssueDate { get; set; }

    // Tutar Bilgileri
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal? ExchangeRate { get; set; }

    // Banka Bilgileri
    public string BankName { get; set; } = string.Empty;
    public string? BranchName { get; set; }
    public string? BranchCode { get; set; }
    public string? AccountNumber { get; set; }
    public string? Iban { get; set; }

    // Keşideci Bilgileri
    public string DrawerName { get; set; } = string.Empty;
    public string? DrawerTaxId { get; set; }
    public string? DrawerAddress { get; set; }
    public string? DrawerPhone { get; set; }

    // Lehdar Bilgileri
    public string? BeneficiaryName { get; set; }
    public string? BeneficiaryTaxId { get; set; }

    // Cari Hesap
    public int? CurrentAccountId { get; set; }

    // Notlar
    public string? Notes { get; set; }
}

/// <summary>
/// Verilen Çek Oluşturma DTO (Create Given Check DTO)
/// </summary>
public class CreateGivenCheckDto
{
    // Temel Bilgiler
    public string CheckNumber { get; set; } = string.Empty;
    public string PortfolioNumber { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }

    // Tarih Bilgileri
    public DateTime RegistrationDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime IssueDate { get; set; }

    // Tutar Bilgileri
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal? ExchangeRate { get; set; }

    // Banka Bilgileri
    public string BankName { get; set; } = string.Empty;
    public string? BranchName { get; set; }
    public string? BranchCode { get; set; }
    public string? AccountNumber { get; set; }
    public string? Iban { get; set; }

    // Keşideci (Firma) Bilgileri
    public string DrawerName { get; set; } = string.Empty;
    public string? DrawerTaxId { get; set; }
    public string? DrawerAddress { get; set; }
    public string? DrawerPhone { get; set; }

    // Lehdar Bilgileri
    public string? BeneficiaryName { get; set; }
    public string? BeneficiaryTaxId { get; set; }

    // Cari Hesap
    public int? CurrentAccountId { get; set; }

    // Notlar
    public string? Notes { get; set; }
}

/// <summary>
/// Çek Güncelleme DTO (Update Check DTO)
/// </summary>
public class UpdateCheckDto
{
    // Temel Bilgiler
    public string? SerialNumber { get; set; }

    // Tarih Bilgileri
    public DateTime? DueDate { get; set; }

    // Banka Bilgileri
    public string? BankName { get; set; }
    public string? BranchName { get; set; }
    public string? BranchCode { get; set; }
    public string? AccountNumber { get; set; }
    public string? Iban { get; set; }

    // Keşideci Bilgileri
    public string? DrawerName { get; set; }
    public string? DrawerTaxId { get; set; }
    public string? DrawerAddress { get; set; }
    public string? DrawerPhone { get; set; }

    // Lehdar Bilgileri
    public string? BeneficiaryName { get; set; }
    public string? BeneficiaryTaxId { get; set; }

    // Cari Hesap
    public int? CurrentAccountId { get; set; }

    // Notlar
    public string? Notes { get; set; }
}

/// <summary>
/// Çek Filtre DTO (Check Filter DTO)
/// </summary>
public class CheckFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public CheckType? CheckType { get; set; }
    public MovementDirection? Direction { get; set; }
    public NegotiableInstrumentStatus? Status { get; set; }
    public int? CurrentAccountId { get; set; }
    public DateTime? DueDateStart { get; set; }
    public DateTime? DueDateEnd { get; set; }
    public DateTime? DueDateFrom { get; set; }
    public DateTime? DueDateTo { get; set; }
    public DateTime? RegistrationDateStart { get; set; }
    public DateTime? RegistrationDateEnd { get; set; }
    public bool? IsGivenToBank { get; set; }
    public bool? IsEndorsed { get; set; }
    public bool? IsBounced { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}

/// <summary>
/// Bankaya Tahsile Verme DTO (Give to Bank DTO)
/// </summary>
public class GiveToBankDto
{
    public int BankAccountId { get; set; }
    public DateTime Date { get; set; }
}

/// <summary>
/// Bankadan Geri Alma DTO (Return from Bank DTO)
/// </summary>
public class ReturnFromBankDto
{
    public DateTime Date { get; set; }
}

/// <summary>
/// Ciro Etme DTO (Endorse DTO)
/// </summary>
public class EndorseCheckDto
{
    public int EndorsedToCurrentAccountId { get; set; }
    public DateTime Date { get; set; }
}

/// <summary>
/// Tahsil Etme DTO (Collect DTO)
/// </summary>
public class CollectCheckDto
{
    public DateTime Date { get; set; }
}

/// <summary>
/// Karşılıksız İşaretleme DTO (Mark as Bounced DTO)
/// </summary>
public class MarkAsBouncedDto
{
    public DateTime Date { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Çek Oluşturma DTO (Create Check DTO)
/// Generic DTO for creating checks (handles both received and given)
/// </summary>
public class CreateCheckDto
{
    // Temel Bilgiler
    public string CheckNumber { get; set; } = string.Empty;
    public string PortfolioNumber { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public CheckType CheckType { get; set; }

    /// <summary>
    /// Hareket yönü - Inbound: Alınan Çek, Outbound: Verilen Çek
    /// </summary>
    public MovementDirection Direction { get; set; } = MovementDirection.Inbound;

    // Tarih Bilgileri
    public DateTime RegistrationDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime IssueDate { get; set; }

    // Tutar Bilgileri
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal? ExchangeRate { get; set; }

    // Banka Bilgileri
    public string BankName { get; set; } = string.Empty;
    public string? BranchName { get; set; }
    public string? BranchCode { get; set; }
    public string? AccountNumber { get; set; }
    public string? Iban { get; set; }

    // Keşideci Bilgileri
    public string DrawerName { get; set; } = string.Empty;
    public string? DrawerTaxId { get; set; }
    public string? DrawerAddress { get; set; }
    public string? DrawerPhone { get; set; }

    // Lehdar Bilgileri
    public string? BeneficiaryName { get; set; }
    public string? BeneficiaryTaxId { get; set; }

    // Cari Hesap
    public int? CurrentAccountId { get; set; }

    // Notlar
    public string? Notes { get; set; }
}

/// <summary>
/// Çek Karşılıksız DTO (Bounce Check DTO)
/// </summary>
public class BounceCheckDto
{
    /// <summary>
    /// Karşılıksız Tarihi (Bounce Date)
    /// </summary>
    public DateTime BounceDate { get; set; }

    /// <summary>
    /// Karşılıksız Nedeni (Bounce Reason)
    /// </summary>
    public string Reason { get; set; } = string.Empty;

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Çek Bankaya Verme DTO (Check Give to Bank DTO)
/// </summary>
public class CheckGiveToBankDto
{
    /// <summary>
    /// Banka Hesabı ID (Bank Account ID)
    /// </summary>
    public int BankAccountId { get; set; }

    /// <summary>
    /// Bankaya Verme Tarihi (Date Given to Bank)
    /// </summary>
    public DateTime Date { get; set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Çek İptal DTO (Cancel Check DTO)
/// </summary>
public class CancelCheckDto
{
    /// <summary>
    /// İptal Tarihi (Cancellation Date)
    /// </summary>
    public DateTime CancellationDate { get; set; }

    /// <summary>
    /// İptal Nedeni (Cancellation Reason)
    /// </summary>
    public string Reason { get; set; } = string.Empty;

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Çek Portföy Özet DTO (Check Portfolio Summary DTO)
/// </summary>
public class CheckPortfolioSummaryDto
{
    /// <summary>
    /// Toplam Çek Adedi (Total Check Count)
    /// </summary>
    public int TotalCheckCount { get; set; }

    /// <summary>
    /// Alınan Çek Adedi (Received Check Count)
    /// </summary>
    public int ReceivedCheckCount { get; set; }

    /// <summary>
    /// Verilen Çek Adedi (Given Check Count)
    /// </summary>
    public int GivenCheckCount { get; set; }

    /// <summary>
    /// Portföydeki Çek Adedi (Checks in Portfolio Count)
    /// </summary>
    public int InPortfolioCount { get; set; }

    /// <summary>
    /// Bankadaki Çek Adedi (Checks in Bank Count)
    /// </summary>
    public int InBankCount { get; set; }

    /// <summary>
    /// Ciro Edilen Çek Adedi (Endorsed Check Count)
    /// </summary>
    public int EndorsedCount { get; set; }

    /// <summary>
    /// Tahsil Edilen Çek Adedi (Collected Check Count)
    /// </summary>
    public int CollectedCount { get; set; }

    /// <summary>
    /// Karşılıksız Çek Adedi (Bounced Check Count)
    /// </summary>
    public int BouncedCount { get; set; }

    /// <summary>
    /// Toplam Alınan Çek Tutarı (Total Received Check Amount)
    /// </summary>
    public decimal TotalReceivedAmount { get; set; }

    /// <summary>
    /// Toplam Verilen Çek Tutarı (Total Given Check Amount)
    /// </summary>
    public decimal TotalGivenAmount { get; set; }

    /// <summary>
    /// Portföydeki Toplam Tutar (Total Amount in Portfolio)
    /// </summary>
    public decimal TotalInPortfolioAmount { get; set; }

    /// <summary>
    /// Bankadaki Toplam Tutar (Total Amount in Bank)
    /// </summary>
    public decimal TotalInBankAmount { get; set; }

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; set; } = "TRY";

    /// <summary>
    /// Vadesi Gelen Çekler (Checks Due Today)
    /// </summary>
    public int ChecksDueTodayCount { get; set; }

    /// <summary>
    /// Bu Hafta Vadesi Gelen Çekler (Checks Due This Week)
    /// </summary>
    public int ChecksDueThisWeekCount { get; set; }

    /// <summary>
    /// Bu Ay Vadesi Gelen Çekler (Checks Due This Month)
    /// </summary>
    public int ChecksDueThisMonthCount { get; set; }

    /// <summary>
    /// Vadesi Geçmiş Çek Sayısı (Overdue Checks Count)
    /// </summary>
    public int OverdueChecksCount { get; set; }

    /// <summary>
    /// Vadesi Geçmiş Çek Tutarı (Overdue Checks Amount)
    /// </summary>
    public decimal OverdueChecksAmount { get; set; }
}
