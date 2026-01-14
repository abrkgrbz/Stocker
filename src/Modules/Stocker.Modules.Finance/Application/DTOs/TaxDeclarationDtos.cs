using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Vergi Beyannamesi DTO - KDV, Muhtasar, Geçici Vergi vb.
/// </summary>
public class TaxDeclarationDto
{
    public int Id { get; set; }
    public string DeclarationNumber { get; set; } = string.Empty;
    public TaxDeclarationType DeclarationType { get; set; }
    public string DeclarationTypeName { get; set; } = string.Empty;

    // Period
    public int TaxYear { get; set; }
    public int? TaxMonth { get; set; }
    public int? TaxQuarter { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public string PeriodDisplay { get; set; } = string.Empty;

    // Deadlines
    public DateTime FilingDeadline { get; set; }
    public DateTime PaymentDeadline { get; set; }

    // Amounts
    public decimal TaxBase { get; set; }
    public decimal CalculatedTax { get; set; }
    public decimal? DeductibleTax { get; set; }
    public decimal? CarriedForwardTax { get; set; }
    public decimal? BroughtForwardTax { get; set; }
    public decimal? DeferredTax { get; set; }
    public decimal NetTax { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingBalance { get; set; }
    public decimal? LateInterest { get; set; }
    public decimal? LatePenalty { get; set; }
    public string Currency { get; set; } = "TRY";

    // Status
    public TaxDeclarationStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime? FilingDate { get; set; }
    public string? GibApprovalNumber { get; set; }

    // Amendment Info
    public bool IsAmendment { get; set; }
    public int? AmendedDeclarationId { get; set; }
    public int AmendmentSequence { get; set; }
    public string? AmendmentReason { get; set; }

    // Tax Office
    public string? TaxOfficeCode { get; set; }
    public string? TaxOfficeName { get; set; }
    public string? AccrualSlipNumber { get; set; }

    // Workflow
    public string? PreparedBy { get; set; }
    public DateTime? PreparationDate { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovalDate { get; set; }

    // Relations
    public int? AccountId { get; set; }
    public int? AccountingPeriodId { get; set; }
    public string? Notes { get; set; }

    // Details & Payments
    public List<TaxDeclarationDetailDto> Details { get; set; } = new();
    public List<TaxDeclarationPaymentDto> Payments { get; set; } = new();

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Vergi Beyannamesi Özet DTO
/// </summary>
public class TaxDeclarationSummaryDto
{
    public int Id { get; set; }
    public string DeclarationNumber { get; set; } = string.Empty;
    public TaxDeclarationType DeclarationType { get; set; }
    public string DeclarationTypeName { get; set; } = string.Empty;
    public int TaxYear { get; set; }
    public int? TaxMonth { get; set; }
    public int? TaxQuarter { get; set; }
    public string PeriodDisplay { get; set; } = string.Empty;
    public DateTime FilingDeadline { get; set; }
    public DateTime PaymentDeadline { get; set; }
    public decimal NetTax { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingBalance { get; set; }
    public string Currency { get; set; } = "TRY";
    public TaxDeclarationStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public bool IsAmendment { get; set; }
    public bool IsOverdue { get; set; }
    public bool IsPaymentOverdue { get; set; }
}

/// <summary>
/// Vergi Beyannamesi Detay DTO
/// </summary>
public class TaxDeclarationDetailDto
{
    public int Id { get; set; }
    public int TaxDeclarationId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal TaxBase { get; set; }
    public decimal? TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public string Currency { get; set; } = "TRY";
    public int SequenceNumber { get; set; }
}

/// <summary>
/// Vergi Beyannamesi Ödeme DTO
/// </summary>
public class TaxDeclarationPaymentDto
{
    public int Id { get; set; }
    public int TaxDeclarationId { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public string PaymentMethod { get; set; } = string.Empty;
    public string? ReceiptNumber { get; set; }
    public int? BankTransactionId { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Vergi Beyannamesi Oluşturma DTO
/// </summary>
public class CreateTaxDeclarationDto
{
    public TaxDeclarationType DeclarationType { get; set; }
    public int TaxYear { get; set; }
    public int? TaxMonth { get; set; }
    public int? TaxQuarter { get; set; }

    // Tax amounts
    public decimal TaxBase { get; set; }
    public decimal CalculatedTax { get; set; }
    public decimal? DeductibleTax { get; set; }
    public decimal? BroughtForwardTax { get; set; }

    // Tax office
    public string? TaxOfficeCode { get; set; }
    public string? TaxOfficeName { get; set; }

    // Relations
    public int? AccountId { get; set; }
    public int? AccountingPeriodId { get; set; }
    public string? Notes { get; set; }

    // Details
    public List<CreateTaxDeclarationDetailDto>? Details { get; set; }
}

/// <summary>
/// Vergi Beyannamesi Detay Oluşturma DTO
/// </summary>
public class CreateTaxDeclarationDetailDto
{
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal TaxBase { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Vergi Beyannamesi Filtre DTO
/// </summary>
public class TaxDeclarationFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public TaxDeclarationType? DeclarationType { get; set; }
    public TaxDeclarationStatus? Status { get; set; }
    public int? TaxYear { get; set; }
    public int? TaxMonth { get; set; }
    public int? TaxQuarter { get; set; }
    public bool? IsAmendment { get; set; }
    public bool? IsOverdue { get; set; }
    public bool? HasUnpaidBalance { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}

/// <summary>
/// Vergi Beyannamesi Onay DTO
/// </summary>
public class ApproveTaxDeclarationDto
{
    public string? Note { get; set; }
}

/// <summary>
/// Vergi Beyannamesi GİB Gönderim DTO
/// </summary>
public class FileTaxDeclarationDto
{
    public string? GibSubmissionReference { get; set; }
}

/// <summary>
/// Vergi Beyannamesi GİB Sonuç DTO
/// </summary>
public class TaxDeclarationGibResultDto
{
    public bool IsAccepted { get; set; }
    public string? ApprovalNumber { get; set; }
    public string? AccrualSlipNumber { get; set; }
    public string? RejectionReason { get; set; }
}

/// <summary>
/// Vergi Beyannamesi Ödeme Kayıt DTO
/// </summary>
public class RecordTaxPaymentDto
{
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public TaxPaymentMethod PaymentMethod { get; set; }
    public string? ReceiptNumber { get; set; }
    public int? BankTransactionId { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Vergi Beyannamesi Düzeltme Oluşturma DTO
/// </summary>
public class CreateTaxAmendmentDto
{
    public string AmendmentReason { get; set; } = string.Empty;
    public decimal? NewTaxBase { get; set; }
    public decimal? NewCalculatedTax { get; set; }
    public decimal? NewDeductibleTax { get; set; }
}

/// <summary>
/// Vergi Beyannamesi İptal DTO
/// </summary>
public class CancelTaxDeclarationDto
{
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Vergi Beyannamesi İstatistik DTO
/// </summary>
public class TaxDeclarationStatsDto
{
    public int TotalDeclarations { get; set; }
    public int DraftDeclarations { get; set; }
    public int PendingApproval { get; set; }
    public int FiledDeclarations { get; set; }
    public int PaidDeclarations { get; set; }
    public int OverdueDeclarations { get; set; }
    public decimal TotalTaxLiability { get; set; }
    public decimal TotalPaidAmount { get; set; }
    public decimal TotalUnpaidAmount { get; set; }

    // By Type
    public int KdvDeclarations { get; set; }
    public int MuhtasarDeclarations { get; set; }
    public int GeciciVergiDeclarations { get; set; }
}

/// <summary>
/// Vergi Takvimi DTO
/// </summary>
public class TaxCalendarItemDto
{
    public TaxDeclarationType DeclarationType { get; set; }
    public string DeclarationTypeName { get; set; } = string.Empty;
    public int TaxYear { get; set; }
    public int? TaxMonth { get; set; }
    public int? TaxQuarter { get; set; }
    public string PeriodDisplay { get; set; } = string.Empty;
    public DateTime FilingDeadline { get; set; }
    public DateTime PaymentDeadline { get; set; }
    public int? DeclarationId { get; set; }
    public TaxDeclarationStatus? Status { get; set; }
    public string? StatusName { get; set; }
    public bool IsFiled { get; set; }
    public bool IsPaid { get; set; }
    public bool IsOverdue { get; set; }
    public int DaysUntilDeadline { get; set; }
}
