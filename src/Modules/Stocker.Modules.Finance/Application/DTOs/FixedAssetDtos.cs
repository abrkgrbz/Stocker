using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Sabit Kıymet Detay DTO (Fixed Asset Detail DTO)
/// </summary>
public class FixedAssetDto
{
    public int Id { get; set; }

    #region Temel Bilgiler (Basic Information)

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Barcode { get; set; }
    public string? SerialNumber { get; set; }
    public string? ModelNumber { get; set; }
    public string? Brand { get; set; }

    #endregion

    #region Sınıflandırma (Classification)

    public FixedAssetType AssetType { get; set; }
    public string AssetTypeName { get; set; } = string.Empty;
    public FixedAssetCategory Category { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? SubCategory { get; set; }
    public string AccountGroup { get; set; } = string.Empty;

    #endregion

    #region Tarih Bilgileri (Date Information)

    public DateTime AcquisitionDate { get; set; }
    public DateTime? InServiceDate { get; set; }
    public DateTime? WarrantyEndDate { get; set; }
    public DateTime? DisposalDate { get; set; }

    #endregion

    #region Değer Bilgileri (Value Information)

    public decimal AcquisitionCost { get; set; }
    public decimal CostValue { get; set; }
    public decimal SalvageValue { get; set; }
    public decimal DepreciableAmount { get; set; }
    public decimal AccumulatedDepreciation { get; set; }
    public decimal NetBookValue { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal? RevaluationAmount { get; set; }
    public DateTime? LastRevaluationDate { get; set; }

    #endregion

    #region Amortisman Bilgileri (Depreciation Information)

    public DepreciationMethod DepreciationMethod { get; set; }
    public string DepreciationMethodName { get; set; } = string.Empty;
    public int UsefulLifeYears { get; set; }
    public int UsefulLifeMonths { get; set; }
    public decimal DepreciationRate { get; set; }
    public int RemainingUsefulLifeMonths { get; set; }
    public DateTime? DepreciationStartDate { get; set; }
    public DateTime? LastDepreciationDate { get; set; }
    public bool IsPartialYearDepreciation { get; set; }
    public DepreciationPeriod DepreciationPeriod { get; set; }
    public string DepreciationPeriodName { get; set; } = string.Empty;

    #endregion

    #region Lokasyon Bilgileri (Location Information)

    public int? LocationId { get; set; }
    public string? LocationName { get; set; }
    public int? DepartmentId { get; set; }
    public int? BranchId { get; set; }
    public int? CustodianUserId { get; set; }
    public string? CustodianName { get; set; }

    #endregion

    #region Tedarikçi Bilgileri (Supplier Information)

    public int? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public int? InvoiceId { get; set; }
    public string? InvoiceNumber { get; set; }

    #endregion

    #region Muhasebe Entegrasyonu (Accounting Integration)

    public int? AssetAccountId { get; set; }
    public string? AssetAccountCode { get; set; }
    public int? AccumulatedDepreciationAccountId { get; set; }
    public string? AccumulatedDepreciationAccountCode { get; set; }
    public int? DepreciationExpenseAccountId { get; set; }
    public int? CostCenterId { get; set; }

    #endregion

    #region Elden Çıkarma Bilgileri (Disposal Information)

    public DisposalType? DisposalType { get; set; }
    public string? DisposalTypeName { get; set; }
    public decimal? SaleAmount { get; set; }
    public decimal? DisposalGainLoss { get; set; }
    public int? SaleInvoiceId { get; set; }
    public int? BuyerId { get; set; }
    public string? DisposalReason { get; set; }

    #endregion

    #region Sigorta Bilgileri (Insurance Information)

    public bool IsInsured { get; set; }
    public string? InsurancePolicyNumber { get; set; }
    public string? InsuranceCompany { get; set; }
    public DateTime? InsuranceEndDate { get; set; }
    public decimal? InsuranceValue { get; set; }

    #endregion

    #region Durum Bilgileri (Status Information)

    public FixedAssetStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsFullyDepreciated { get; set; }
    public string? Notes { get; set; }
    public string? Tags { get; set; }
    public string? ImagePath { get; set; }

    #endregion

    #region Audit

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    #endregion

    // Depreciation records
    public List<DepreciationDto> Depreciations { get; set; } = new();
}

/// <summary>
/// Sabit Kıymet Özet DTO (Fixed Asset Summary DTO)
/// Liste görünümü için
/// </summary>
public class FixedAssetSummaryDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public FixedAssetType AssetType { get; set; }
    public string AssetTypeName { get; set; } = string.Empty;
    public FixedAssetCategory Category { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public DateTime AcquisitionDate { get; set; }
    public decimal AcquisitionCost { get; set; }
    public decimal NetBookValue { get; set; }
    public string Currency { get; set; } = "TRY";
    public FixedAssetStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsFullyDepreciated { get; set; }
    public string? LocationName { get; set; }
    public string? CustodianName { get; set; }
    public int RemainingUsefulLifeMonths { get; set; }
}

/// <summary>
/// Sabit Kıymet Oluşturma DTO (Create Fixed Asset DTO)
/// </summary>
public class CreateFixedAssetDto
{
    #region Temel Bilgiler (Required)

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public FixedAssetType AssetType { get; set; }
    public FixedAssetCategory Category { get; set; }
    public DateTime AcquisitionDate { get; set; }
    public decimal AcquisitionCost { get; set; }
    public string Currency { get; set; } = "TRY";

    #endregion

    #region Amortisman Bilgileri (Depreciation)

    public int UsefulLifeYears { get; set; }
    public DepreciationMethod DepreciationMethod { get; set; } = DepreciationMethod.StraightLine;
    public decimal? CustomDepreciationRate { get; set; }
    public DepreciationPeriod DepreciationPeriod { get; set; } = DepreciationPeriod.Monthly;
    public bool IsPartialYearDepreciation { get; set; } = true;
    public decimal SalvageValue { get; set; } = 0;

    #endregion

    #region Opsiyonel Bilgiler (Optional)

    public string? Description { get; set; }
    public string? Barcode { get; set; }
    public string? SerialNumber { get; set; }
    public string? ModelNumber { get; set; }
    public string? Brand { get; set; }
    public string? SubCategory { get; set; }

    // Dates
    public DateTime? InServiceDate { get; set; }
    public DateTime? WarrantyEndDate { get; set; }

    // Location
    public int? LocationId { get; set; }
    public string? LocationName { get; set; }
    public int? DepartmentId { get; set; }
    public int? BranchId { get; set; }
    public int? CustodianUserId { get; set; }
    public string? CustodianName { get; set; }

    // Supplier
    public int? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public int? InvoiceId { get; set; }
    public string? InvoiceNumber { get; set; }

    // Accounting
    public int? AssetAccountId { get; set; }
    public string? AssetAccountCode { get; set; }
    public int? AccumulatedDepreciationAccountId { get; set; }
    public string? AccumulatedDepreciationAccountCode { get; set; }
    public int? DepreciationExpenseAccountId { get; set; }
    public int? CostCenterId { get; set; }

    // Insurance
    public bool IsInsured { get; set; }
    public string? InsurancePolicyNumber { get; set; }
    public string? InsuranceCompany { get; set; }
    public DateTime? InsuranceEndDate { get; set; }
    public decimal? InsuranceValue { get; set; }

    // Other
    public string? Notes { get; set; }
    public string? Tags { get; set; }
    public string? ImagePath { get; set; }

    #endregion
}

/// <summary>
/// Sabit Kıymet Güncelleme DTO (Update Fixed Asset DTO)
/// </summary>
public class UpdateFixedAssetDto
{
    #region Temel Bilgiler (Basic Information)

    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Barcode { get; set; }
    public string? SerialNumber { get; set; }
    public string? ModelNumber { get; set; }
    public string? Brand { get; set; }
    public string? SubCategory { get; set; }

    #endregion

    #region Tarih Bilgileri (Date Information)

    public DateTime? InServiceDate { get; set; }
    public DateTime? WarrantyEndDate { get; set; }

    #endregion

    #region Değer Bilgileri (Value Information)

    public decimal? SalvageValue { get; set; }

    #endregion

    #region Amortisman Bilgileri (Depreciation Information)

    public DepreciationMethod? DepreciationMethod { get; set; }
    public int? UsefulLifeYears { get; set; }
    public decimal? CustomDepreciationRate { get; set; }
    public DepreciationPeriod? DepreciationPeriod { get; set; }
    public bool? IsPartialYearDepreciation { get; set; }

    #endregion

    #region Lokasyon Bilgileri (Location Information)

    public int? LocationId { get; set; }
    public string? LocationName { get; set; }
    public int? DepartmentId { get; set; }
    public int? BranchId { get; set; }
    public int? CustodianUserId { get; set; }
    public string? CustodianName { get; set; }

    #endregion

    #region Tedarikçi Bilgileri (Supplier Information)

    public int? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public int? InvoiceId { get; set; }
    public string? InvoiceNumber { get; set; }

    #endregion

    #region Muhasebe Entegrasyonu (Accounting Integration)

    public int? AssetAccountId { get; set; }
    public string? AssetAccountCode { get; set; }
    public int? AccumulatedDepreciationAccountId { get; set; }
    public string? AccumulatedDepreciationAccountCode { get; set; }
    public int? DepreciationExpenseAccountId { get; set; }
    public int? CostCenterId { get; set; }

    #endregion

    #region Sigorta Bilgileri (Insurance Information)

    public bool? IsInsured { get; set; }
    public string? InsurancePolicyNumber { get; set; }
    public string? InsuranceCompany { get; set; }
    public DateTime? InsuranceEndDate { get; set; }
    public decimal? InsuranceValue { get; set; }

    #endregion

    #region Diğer (Other)

    public string? Notes { get; set; }
    public string? Tags { get; set; }
    public string? ImagePath { get; set; }

    #endregion
}

/// <summary>
/// Sabit Kıymet Filtre DTO (Fixed Asset Filter DTO)
/// Sayfalı listeleme için
/// </summary>
public class FixedAssetFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }

    // Filters
    public FixedAssetType? AssetType { get; set; }
    public FixedAssetCategory? Category { get; set; }
    public FixedAssetStatus? Status { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsFullyDepreciated { get; set; }

    // Location filters
    public int? LocationId { get; set; }
    public int? DepartmentId { get; set; }
    public int? BranchId { get; set; }
    public int? CustodianUserId { get; set; }

    // Date filters
    public DateTime? AcquisitionDateFrom { get; set; }
    public DateTime? AcquisitionDateTo { get; set; }
    public DateTime? InServiceDateFrom { get; set; }
    public DateTime? InServiceDateTo { get; set; }

    // Value filters
    public decimal? MinNetBookValue { get; set; }
    public decimal? MaxNetBookValue { get; set; }

    // Supplier filter
    public int? SupplierId { get; set; }

    // Sorting
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}

/// <summary>
/// Amortisman DTO (Depreciation DTO)
/// </summary>
public class DepreciationDto
{
    public int Id { get; set; }
    public int FixedAssetId { get; set; }
    public string FixedAssetCode { get; set; } = string.Empty;
    public string FixedAssetName { get; set; } = string.Empty;
    public string Period { get; set; } = string.Empty;
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public decimal DepreciationAmount { get; set; }
    public decimal AccumulatedDepreciation { get; set; }
    public decimal NetBookValue { get; set; }
    public string Currency { get; set; } = "TRY";
    public int? JournalEntryId { get; set; }
    public bool IsPosted { get; set; }
    public DateTime CalculationDate { get; set; }
}

/// <summary>
/// Amortisman Hesaplama İsteği DTO (Calculate Depreciation Request DTO)
/// </summary>
public class CalculateDepreciationDto
{
    public DateTime AsOfDate { get; set; }
    public bool ApplyDepreciation { get; set; } = false;
    public bool CreateJournalEntry { get; set; } = false;
}

/// <summary>
/// Toplu Amortisman Hesaplama DTO (Bulk Depreciation Calculation DTO)
/// </summary>
public class BulkCalculateDepreciationDto
{
    public List<int>? FixedAssetIds { get; set; }
    public FixedAssetCategory? Category { get; set; }
    public DateTime AsOfDate { get; set; }
    public bool ApplyDepreciation { get; set; } = false;
    public bool CreateJournalEntries { get; set; } = false;
}

/// <summary>
/// Sabit Kıymet Elden Çıkarma DTO (Dispose Fixed Asset DTO)
/// </summary>
public class DisposeFixedAssetDto
{
    public DisposalType DisposalType { get; set; }
    public DateTime DisposalDate { get; set; }
    public decimal? SaleAmount { get; set; }
    public int? BuyerId { get; set; }
    public int? SaleInvoiceId { get; set; }
    public string? DisposalReason { get; set; }
}

/// <summary>
/// Amortisman Tablosu Satırı DTO (Depreciation Schedule Row DTO)
/// </summary>
public class DepreciationScheduleRowDto
{
    public int Period { get; set; }
    public string PeriodName { get; set; } = string.Empty;
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public decimal OpeningValue { get; set; }
    public decimal DepreciationAmount { get; set; }
    public decimal AccumulatedDepreciation { get; set; }
    public decimal ClosingValue { get; set; }
    public bool IsActual { get; set; }
}

/// <summary>
/// Amortisman Tablosu DTO (Depreciation Schedule DTO)
/// </summary>
public class DepreciationScheduleDto
{
    public int FixedAssetId { get; set; }
    public string FixedAssetCode { get; set; } = string.Empty;
    public string FixedAssetName { get; set; } = string.Empty;
    public decimal AcquisitionCost { get; set; }
    public decimal SalvageValue { get; set; }
    public decimal DepreciableAmount { get; set; }
    public DepreciationMethod DepreciationMethod { get; set; }
    public string DepreciationMethodName { get; set; } = string.Empty;
    public int UsefulLifeYears { get; set; }
    public decimal DepreciationRate { get; set; }
    public DateTime DepreciationStartDate { get; set; }
    public string Currency { get; set; } = "TRY";
    public List<DepreciationScheduleRowDto> Rows { get; set; } = new();
}

/// <summary>
/// Maliyete Ekleme DTO (Add To Cost DTO)
/// </summary>
public class AddToCostDto
{
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
}

/// <summary>
/// Yeniden Değerleme DTO (Revaluation DTO)
/// </summary>
public class RevaluationDto
{
    public decimal NewValue { get; set; }
    public string? Reason { get; set; }
}
