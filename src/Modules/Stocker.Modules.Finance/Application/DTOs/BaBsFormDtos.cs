using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Ba-Bs Form DTO - 5.000 TL ve üzeri mal/hizmet alım-satım bildirimi
/// </summary>
public class BaBsFormDto
{
    public int Id { get; set; }
    public string FormNumber { get; set; } = string.Empty;
    public BaBsFormType FormType { get; set; }
    public string FormTypeName { get; set; } = string.Empty;
    public int PeriodYear { get; set; }
    public int PeriodMonth { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public DateTime FilingDeadline { get; set; }

    // Totals
    public int TotalRecordCount { get; set; }
    public decimal TotalAmountExcludingVat { get; set; }
    public decimal TotalVat { get; set; }
    public decimal TotalAmountIncludingVat { get; set; }
    public string Currency { get; set; } = "TRY";

    // Status
    public BaBsFormStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;

    // Correction Info
    public bool IsCorrection { get; set; }
    public int? CorrectedFormId { get; set; }
    public int CorrectionSequence { get; set; }
    public string? CorrectionReason { get; set; }

    // Company Info
    public string TaxId { get; set; } = string.Empty;
    public string? TaxOffice { get; set; }
    public string CompanyName { get; set; } = string.Empty;

    // Workflow
    public string? PreparedBy { get; set; }
    public DateTime? PreparationDate { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public DateTime? FilingDate { get; set; }

    // GIB Info
    public string? GibApprovalNumber { get; set; }
    public string? GibSubmissionReference { get; set; }

    // Relations
    public int? AccountingPeriodId { get; set; }
    public string? Notes { get; set; }

    // Items
    public List<BaBsFormItemDto> Items { get; set; } = new();

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Ba-Bs Form Özet DTO
/// </summary>
public class BaBsFormSummaryDto
{
    public int Id { get; set; }
    public string FormNumber { get; set; } = string.Empty;
    public BaBsFormType FormType { get; set; }
    public string FormTypeName { get; set; } = string.Empty;
    public int PeriodYear { get; set; }
    public int PeriodMonth { get; set; }
    public string PeriodDisplay { get; set; } = string.Empty; // "Ocak 2024"
    public DateTime FilingDeadline { get; set; }
    public int TotalRecordCount { get; set; }
    public decimal TotalAmountIncludingVat { get; set; }
    public string Currency { get; set; } = "TRY";
    public BaBsFormStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public bool IsCorrection { get; set; }
    public bool IsOverdue { get; set; }
}

/// <summary>
/// Ba-Bs Form Kalemi DTO
/// </summary>
public class BaBsFormItemDto
{
    public int Id { get; set; }
    public int BaBsFormId { get; set; }
    public int SequenceNumber { get; set; }
    public string CounterpartyTaxId { get; set; } = string.Empty;
    public string CounterpartyName { get; set; } = string.Empty;
    public string? CountryCode { get; set; }
    public BaBsDocumentType DocumentType { get; set; }
    public string DocumentTypeName { get; set; } = string.Empty;
    public int DocumentCount { get; set; }
    public decimal AmountExcludingVat { get; set; }
    public decimal VatAmount { get; set; }
    public decimal TotalAmountIncludingVat { get; set; }
    public string Currency { get; set; } = "TRY";
    public string? Notes { get; set; }
}

/// <summary>
/// Ba-Bs Form Oluşturma DTO
/// </summary>
public class CreateBaBsFormDto
{
    public BaBsFormType FormType { get; set; }
    public int PeriodYear { get; set; }
    public int PeriodMonth { get; set; }
    public string TaxId { get; set; } = string.Empty;
    public string? TaxOffice { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public int? AccountingPeriodId { get; set; }
    public string? Notes { get; set; }

    // Items to add
    public List<CreateBaBsFormItemDto>? Items { get; set; }
}

/// <summary>
/// Ba-Bs Form Kalemi Oluşturma DTO
/// </summary>
public class CreateBaBsFormItemDto
{
    public string CounterpartyTaxId { get; set; } = string.Empty;
    public string CounterpartyName { get; set; } = string.Empty;
    public string? CountryCode { get; set; }
    public BaBsDocumentType DocumentType { get; set; } = BaBsDocumentType.Invoice;
    public int DocumentCount { get; set; }
    public decimal AmountExcludingVat { get; set; }
    public decimal VatAmount { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Ba-Bs Form Güncelleme DTO
/// </summary>
public class UpdateBaBsFormDto
{
    public string? TaxOffice { get; set; }
    public int? AccountingPeriodId { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Ba-Bs Form Filtre DTO
/// </summary>
public class BaBsFormFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public BaBsFormType? FormType { get; set; }
    public BaBsFormStatus? Status { get; set; }
    public int? PeriodYear { get; set; }
    public int? PeriodMonth { get; set; }
    public bool? IsCorrection { get; set; }
    public bool? IsOverdue { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}

/// <summary>
/// Ba-Bs Form Onay DTO
/// </summary>
public class ApproveBaBsFormDto
{
    public string? Note { get; set; }
}

/// <summary>
/// Ba-Bs Form GİB Gönderim DTO
/// </summary>
public class FileBaBsFormDto
{
    public string? GibSubmissionReference { get; set; }
}

/// <summary>
/// Ba-Bs Form GİB Sonuç DTO
/// </summary>
public class BaBsGibResultDto
{
    public bool IsAccepted { get; set; }
    public string? ApprovalNumber { get; set; }
    public string? RejectionReason { get; set; }
}

/// <summary>
/// Ba-Bs Form Düzeltme Oluşturma DTO
/// </summary>
public class CreateBaBsCorrectionDto
{
    public string CorrectionReason { get; set; } = string.Empty;
}

/// <summary>
/// Ba-Bs Form İptal DTO
/// </summary>
public class CancelBaBsFormDto
{
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Ba-Bs Doğrulama Sonuç DTO
/// </summary>
public class BaBsValidationResultDto
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
}

/// <summary>
/// Ba-Bs Form İstatistik DTO
/// </summary>
public class BaBsFormStatsDto
{
    public int TotalForms { get; set; }
    public int DraftForms { get; set; }
    public int ReadyForms { get; set; }
    public int ApprovedForms { get; set; }
    public int FiledForms { get; set; }
    public int AcceptedForms { get; set; }
    public int RejectedForms { get; set; }
    public int OverdueForms { get; set; }
    public decimal TotalBaAmount { get; set; }
    public decimal TotalBsAmount { get; set; }
}

/// <summary>
/// Fatura'dan Ba-Bs Oluşturma DTO
/// </summary>
public class GenerateBaBsFromInvoicesDto
{
    public BaBsFormType FormType { get; set; }
    public int PeriodYear { get; set; }
    public int PeriodMonth { get; set; }
    public string TaxId { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? TaxOffice { get; set; }
}
