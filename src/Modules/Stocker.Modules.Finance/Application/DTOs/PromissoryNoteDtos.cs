using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Senet Detay DTO (Promissory Note Full DTO)
/// </summary>
public class PromissoryNoteDto
{
    public int Id { get; set; }

    #region Temel Bilgiler (Basic Information)

    public string NoteNumber { get; set; } = string.Empty;
    public string PortfolioNumber { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public PromissoryNoteType NoteType { get; set; }
    public string NoteTypeName { get; set; } = string.Empty;
    public MovementDirection Direction { get; set; }
    public string DirectionName { get; set; } = string.Empty;
    public NegotiableInstrumentStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;

    #endregion

    #region Tarih Bilgileri (Date Information)

    public DateTime RegistrationDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime IssueDate { get; set; }
    public string? IssuePlace { get; set; }
    public DateTime? CollectionDate { get; set; }

    #endregion

    #region Tutar Bilgileri (Amount Information)

    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal ExchangeRate { get; set; } = 1;
    public decimal AmountTRY { get; set; }

    #endregion

    #region Borçlu Bilgileri (Debtor Information)

    public string DebtorName { get; set; } = string.Empty;
    public string? DebtorTaxId { get; set; }
    public string? DebtorAddress { get; set; }
    public string? DebtorPhone { get; set; }

    #endregion

    #region Alacaklı Bilgileri (Creditor Information)

    public string? CreditorName { get; set; }
    public string? CreditorTaxId { get; set; }

    #endregion

    #region Kefil Bilgileri (Guarantor Information)

    public string? GuarantorName { get; set; }
    public string? GuarantorTaxId { get; set; }
    public string? GuarantorAddress { get; set; }

    #endregion

    #region Cari Hesap Bilgileri (Current Account Information)

    public int? CurrentAccountId { get; set; }
    public string? CurrentAccountName { get; set; }

    #endregion

    #region Hareket Bilgileri (Movement Information)

    public bool IsGivenToBank { get; set; }
    public int? CollectionBankAccountId { get; set; }
    public string? CollectionBankAccountName { get; set; }
    public DateTime? GivenToBankDate { get; set; }
    public decimal? DiscountAmount { get; set; }
    public bool IsEndorsed { get; set; }
    public int? EndorsedToCurrentAccountId { get; set; }
    public string? EndorsedToCurrentAccountName { get; set; }
    public DateTime? EndorsementDate { get; set; }
    public bool IsGivenAsCollateral { get; set; }
    public string? CollateralGivenTo { get; set; }
    public DateTime? CollateralDate { get; set; }

    #endregion

    #region Protesto Bilgileri (Protest Information)

    public bool IsProtested { get; set; }
    public DateTime? ProtestDate { get; set; }
    public string? ProtestReason { get; set; }

    #endregion

    #region Referans Bilgileri (Reference Information)

    public int? PaymentId { get; set; }
    public int? JournalEntryId { get; set; }
    public string? Notes { get; set; }

    #endregion

    #region Hareketler (Movements)

    public List<PromissoryNoteMovementDto> Movements { get; set; } = new();

    #endregion

    #region Audit

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    #endregion
}

/// <summary>
/// Senet Hareket DTO (Promissory Note Movement DTO)
/// </summary>
public class PromissoryNoteMovementDto
{
    public int Id { get; set; }
    public int PromissoryNoteId { get; set; }
    public PromissoryNoteMovementType MovementType { get; set; }
    public string MovementTypeName { get; set; } = string.Empty;
    public DateTime MovementDate { get; set; }
    public string Description { get; set; } = string.Empty;
}

/// <summary>
/// Senet Özet DTO (Promissory Note Summary DTO)
/// </summary>
public class PromissoryNoteSummaryDto
{
    public int Id { get; set; }
    public string NoteNumber { get; set; } = string.Empty;
    public string PortfolioNumber { get; set; } = string.Empty;
    public PromissoryNoteType NoteType { get; set; }
    public string NoteTypeName { get; set; } = string.Empty;
    public MovementDirection Direction { get; set; }
    public string DirectionName { get; set; } = string.Empty;
    public NegotiableInstrumentStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal AmountTRY { get; set; }
    public string DebtorName { get; set; } = string.Empty;
    public string? CurrentAccountName { get; set; }
    public int DaysUntilDue { get; set; }
    public bool IsOverdue { get; set; }
}

/// <summary>
/// Senet Oluşturma DTO (Create Promissory Note DTO)
/// </summary>
public class CreatePromissoryNoteDto
{
    #region Temel Bilgiler (Basic Information)

    public string NoteNumber { get; set; } = string.Empty;
    public string PortfolioNumber { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public PromissoryNoteType NoteType { get; set; } = PromissoryNoteType.CustomerNote;

    #endregion

    #region Tarih Bilgileri (Date Information)

    public DateTime RegistrationDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime IssueDate { get; set; }
    public string? IssuePlace { get; set; }

    #endregion

    #region Tutar Bilgileri (Amount Information)

    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal? ExchangeRate { get; set; }

    #endregion

    #region Borçlu Bilgileri (Debtor Information)

    public string DebtorName { get; set; } = string.Empty;
    public string? DebtorTaxId { get; set; }
    public string? DebtorAddress { get; set; }
    public string? DebtorPhone { get; set; }

    #endregion

    #region Alacaklı Bilgileri (Creditor Information)

    public string? CreditorName { get; set; }
    public string? CreditorTaxId { get; set; }

    #endregion

    #region Kefil Bilgileri (Guarantor Information)

    public string? GuarantorName { get; set; }
    public string? GuarantorTaxId { get; set; }
    public string? GuarantorAddress { get; set; }

    #endregion

    #region Cari Hesap Bilgileri (Current Account Information)

    public int? CurrentAccountId { get; set; }

    #endregion

    #region Notlar (Notes)

    public string? Notes { get; set; }

    #endregion
}

/// <summary>
/// Senet Güncelleme DTO (Update Promissory Note DTO)
/// </summary>
public class UpdatePromissoryNoteDto
{
    #region Temel Bilgiler (Basic Information)

    public string? SerialNumber { get; set; }

    #endregion

    #region Tarih Bilgileri (Date Information)

    public DateTime? DueDate { get; set; }
    public string? IssuePlace { get; set; }

    #endregion

    #region Tutar Bilgileri (Amount Information)

    public decimal? ExchangeRate { get; set; }

    #endregion

    #region Borçlu Bilgileri (Debtor Information)

    public string? DebtorName { get; set; }
    public string? DebtorTaxId { get; set; }
    public string? DebtorAddress { get; set; }
    public string? DebtorPhone { get; set; }

    #endregion

    #region Alacaklı Bilgileri (Creditor Information)

    public string? CreditorName { get; set; }
    public string? CreditorTaxId { get; set; }

    #endregion

    #region Kefil Bilgileri (Guarantor Information)

    public string? GuarantorName { get; set; }
    public string? GuarantorTaxId { get; set; }
    public string? GuarantorAddress { get; set; }

    #endregion

    #region Cari Hesap Bilgileri (Current Account Information)

    public int? CurrentAccountId { get; set; }

    #endregion

    #region Notlar (Notes)

    public string? Notes { get; set; }

    #endregion
}

/// <summary>
/// Senet Filtre DTO (Promissory Note Filter DTO)
/// </summary>
public class PromissoryNoteFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public MovementDirection? Direction { get; set; }
    public PromissoryNoteType? NoteType { get; set; }
    public NegotiableInstrumentStatus? Status { get; set; }
    public int? CurrentAccountId { get; set; }
    public DateTime? DueDateStart { get; set; }
    public DateTime? DueDateEnd { get; set; }
    /// <summary>
    /// Vade Tarihi Başlangıç (Alias for DueDateStart)
    /// </summary>
    public DateTime? DueDateFrom { get => DueDateStart; set => DueDateStart = value; }
    /// <summary>
    /// Vade Tarihi Bitiş (Alias for DueDateEnd)
    /// </summary>
    public DateTime? DueDateTo { get => DueDateEnd; set => DueDateEnd = value; }
    public DateTime? RegistrationDateStart { get; set; }
    public DateTime? RegistrationDateEnd { get; set; }
    public bool? IsOverdue { get; set; }
    public bool? IsGivenToBank { get; set; }
    public bool? IsEndorsed { get; set; }
    public bool? IsGivenAsCollateral { get; set; }
    public bool? IsProtested { get; set; }
    public string? Currency { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}

/// <summary>
/// Senet Tahsil DTO (Collect Promissory Note DTO)
/// </summary>
public class CollectPromissoryNoteDto
{
    public DateTime CollectionDate { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Senet Protesto DTO (Protest Promissory Note DTO)
/// </summary>
public class ProtestPromissoryNoteDto
{
    public DateTime ProtestDate { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Senet Bankaya Verme DTO (Give Promissory Note to Bank DTO)
/// </summary>
public class PromissoryNoteGiveToBankDto
{
    public int BankAccountId { get; set; }
    public DateTime Date { get; set; }
    public decimal? DiscountAmount { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Senet Ciro DTO (Endorse Promissory Note DTO)
/// </summary>
public class EndorsePromissoryNoteDto
{
    public int EndorsedToCurrentAccountId { get; set; }
    public DateTime EndorsementDate { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Senet Teminata Verme DTO (Give as Collateral DTO)
/// </summary>
public class GiveAsCollateralDto
{
    public string CollateralGivenTo { get; set; } = string.Empty;
    public DateTime CollateralDate { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Senet İptal DTO (Cancel Promissory Note DTO)
/// </summary>
public class CancelPromissoryNoteDto
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
/// Senet Portföy Özet DTO (Promissory Note Portfolio Summary DTO)
/// </summary>
public class PromissoryNotePortfolioSummaryDto
{
    /// <summary>
    /// Toplam Senet Adedi (Total Note Count)
    /// </summary>
    public int TotalNoteCount { get; set; }

    /// <summary>
    /// Alınan Senet Adedi (Received Note Count)
    /// </summary>
    public int ReceivedNoteCount { get; set; }

    /// <summary>
    /// Verilen Senet Adedi (Given Note Count)
    /// </summary>
    public int GivenNoteCount { get; set; }

    /// <summary>
    /// Portföydeki Senet Adedi (Notes in Portfolio Count)
    /// </summary>
    public int InPortfolioCount { get; set; }

    /// <summary>
    /// Bankadaki Senet Adedi (Notes in Bank Count)
    /// </summary>
    public int InBankCount { get; set; }

    /// <summary>
    /// Ciro Edilen Senet Adedi (Endorsed Note Count)
    /// </summary>
    public int EndorsedCount { get; set; }

    /// <summary>
    /// Tahsil Edilen Senet Adedi (Collected Note Count)
    /// </summary>
    public int CollectedCount { get; set; }

    /// <summary>
    /// Protesto Edilen Senet Adedi (Protested Note Count)
    /// </summary>
    public int ProtestedCount { get; set; }

    /// <summary>
    /// Teminattaki Senet Adedi (Notes as Collateral Count)
    /// </summary>
    public int AsCollateralCount { get; set; }

    /// <summary>
    /// Toplam Alınan Senet Tutarı (Total Received Note Amount)
    /// </summary>
    public decimal TotalReceivedAmount { get; set; }

    /// <summary>
    /// Toplam Verilen Senet Tutarı (Total Given Note Amount)
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
    /// Vadesi Gelen Senetler (Notes Due Today)
    /// </summary>
    public int NotesDueTodayCount { get; set; }

    /// <summary>
    /// Bu Hafta Vadesi Gelen Senetler (Notes Due This Week)
    /// </summary>
    public int NotesDueThisWeekCount { get; set; }

    /// <summary>
    /// Bu Ay Vadesi Gelen Senetler (Notes Due This Month)
    /// </summary>
    public int NotesDueThisMonthCount { get; set; }

    /// <summary>
    /// Vadesi Geçmiş Senet Adedi (Overdue Notes Count)
    /// </summary>
    public int OverdueNotesCount { get; set; }

    /// <summary>
    /// Vadesi Geçmiş Senet Tutarı (Overdue Notes Amount)
    /// </summary>
    public decimal OverdueNotesAmount { get; set; }
}
