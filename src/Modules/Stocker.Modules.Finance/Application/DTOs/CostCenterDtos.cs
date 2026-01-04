using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Masraf Merkezi DTO (Cost Center DTO)
/// Full details for single cost center view
/// </summary>
public class CostCenterDto
{
    public int Id { get; set; }

    #region Temel Bilgiler (Basic Information)

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CostCenterType Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public CostCenterCategory Category { get; set; }
    public string CategoryName { get; set; } = string.Empty;

    #endregion

    #region Hiyerarşi Bilgileri (Hierarchy Information)

    public int? ParentId { get; set; }
    public string? ParentName { get; set; }
    public int Level { get; set; }
    public string? FullPath { get; set; }
    public int SortOrder { get; set; }

    #endregion

    #region Sorumluluk Bilgileri (Responsibility Information)

    public int? ResponsibleUserId { get; set; }
    public string? ResponsibleUserName { get; set; }
    public int? DepartmentId { get; set; }
    public int? BranchId { get; set; }

    #endregion

    #region Bütçe Bilgileri (Budget Information)

    public decimal? AnnualBudgetAmount { get; set; }
    public decimal? MonthlyBudgetAmount { get; set; }
    public string BudgetCurrency { get; set; } = "TRY";
    public decimal SpentAmount { get; set; }
    public decimal RemainingBudgetAmount { get; set; }
    public decimal BudgetUsagePercentage { get; set; }
    public decimal BudgetWarningThreshold { get; set; }
    public bool AllowBudgetOverrun { get; set; }
    public bool RequireApprovalForOverrun { get; set; }
    public bool IsBudgetWarning { get; set; }
    public bool IsOverBudget { get; set; }

    #endregion

    #region Dağıtım Bilgileri (Allocation Information)

    public string? AllocationKey { get; set; }
    public decimal? AllocationRate { get; set; }
    public bool IsAutoAllocationEnabled { get; set; }
    public AllocationPeriod? AllocationPeriod { get; set; }

    #endregion

    #region Muhasebe Entegrasyonu (Accounting Integration)

    public int? AccountingAccountId { get; set; }
    public string? AccountingAccountCode { get; set; }
    public int? DefaultExpenseAccountId { get; set; }

    #endregion

    #region İstatistik ve Analiz (Statistics and Analysis)

    public int TotalTransactionCount { get; set; }
    public decimal? MonthlyAverageSpending { get; set; }
    public DateTime? LastTransactionDate { get; set; }
    public DateTime? LastBudgetUpdateDate { get; set; }

    #endregion

    #region Durum Bilgileri (Status Information)

    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public bool IsFrozen { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Notes { get; set; }

    #endregion

    #region Audit Information

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    #endregion
}

/// <summary>
/// Masraf Merkezi Özet DTO (Cost Center Summary DTO)
/// For list views and dropdowns
/// </summary>
public class CostCenterSummaryDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public CostCenterType Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public CostCenterCategory Category { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int? ParentId { get; set; }
    public string? ParentName { get; set; }
    public int Level { get; set; }
    public string? FullPath { get; set; }
    public decimal? AnnualBudgetAmount { get; set; }
    public decimal SpentAmount { get; set; }
    public decimal BudgetUsagePercentage { get; set; }
    public bool IsActive { get; set; }
    public bool IsFrozen { get; set; }
    public bool IsBudgetWarning { get; set; }
    public bool IsOverBudget { get; set; }
}

/// <summary>
/// Masraf Merkezi Oluşturma DTO (Create Cost Center DTO)
/// </summary>
public class CreateCostCenterDto
{
    #region Temel Bilgiler (Basic Information)

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CostCenterType Type { get; set; }
    public CostCenterCategory Category { get; set; }

    #endregion

    #region Hiyerarşi Bilgileri (Hierarchy Information)

    public int? ParentId { get; set; }
    public int SortOrder { get; set; }

    #endregion

    #region Sorumluluk Bilgileri (Responsibility Information)

    public int? ResponsibleUserId { get; set; }
    public string? ResponsibleUserName { get; set; }
    public int? DepartmentId { get; set; }
    public int? BranchId { get; set; }

    #endregion

    #region Bütçe Bilgileri (Budget Information)

    public decimal? AnnualBudgetAmount { get; set; }
    public string BudgetCurrency { get; set; } = "TRY";
    public decimal BudgetWarningThreshold { get; set; } = 80;
    public bool AllowBudgetOverrun { get; set; }
    public bool RequireApprovalForOverrun { get; set; } = true;

    #endregion

    #region Dağıtım Bilgileri (Allocation Information)

    public string? AllocationKey { get; set; }
    public decimal? AllocationRate { get; set; }
    public bool IsAutoAllocationEnabled { get; set; }
    public AllocationPeriod? AllocationPeriod { get; set; }

    #endregion

    #region Muhasebe Entegrasyonu (Accounting Integration)

    public int? AccountingAccountId { get; set; }
    public string? AccountingAccountCode { get; set; }
    public int? DefaultExpenseAccountId { get; set; }

    #endregion

    #region Durum Bilgileri (Status Information)

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Notes { get; set; }

    #endregion
}

/// <summary>
/// Masraf Merkezi Güncelleme DTO (Update Cost Center DTO)
/// </summary>
public class UpdateCostCenterDto
{
    #region Temel Bilgiler (Basic Information)

    public string? Name { get; set; }
    public string? Description { get; set; }
    public CostCenterType? Type { get; set; }
    public CostCenterCategory? Category { get; set; }

    #endregion

    #region Hiyerarşi Bilgileri (Hierarchy Information)

    public int? ParentId { get; set; }
    public int? SortOrder { get; set; }

    #endregion

    #region Sorumluluk Bilgileri (Responsibility Information)

    public int? ResponsibleUserId { get; set; }
    public string? ResponsibleUserName { get; set; }
    public int? DepartmentId { get; set; }
    public int? BranchId { get; set; }

    #endregion

    #region Bütçe Bilgileri (Budget Information)

    public decimal? AnnualBudgetAmount { get; set; }
    public string? BudgetCurrency { get; set; }
    public decimal? BudgetWarningThreshold { get; set; }
    public bool? AllowBudgetOverrun { get; set; }
    public bool? RequireApprovalForOverrun { get; set; }

    #endregion

    #region Dağıtım Bilgileri (Allocation Information)

    public string? AllocationKey { get; set; }
    public decimal? AllocationRate { get; set; }
    public bool? IsAutoAllocationEnabled { get; set; }
    public AllocationPeriod? AllocationPeriod { get; set; }

    #endregion

    #region Muhasebe Entegrasyonu (Accounting Integration)

    public int? AccountingAccountId { get; set; }
    public string? AccountingAccountCode { get; set; }
    public int? DefaultExpenseAccountId { get; set; }

    #endregion

    #region Durum Bilgileri (Status Information)

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Notes { get; set; }

    #endregion
}

/// <summary>
/// Masraf Merkezi Filtre DTO (Cost Center Filter DTO)
/// </summary>
public class CostCenterFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public CostCenterType? Type { get; set; }
    public CostCenterCategory? Category { get; set; }
    public int? ParentId { get; set; }
    public int? DepartmentId { get; set; }
    public int? BranchId { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsFrozen { get; set; }
    public bool? IsOverBudget { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
}

/// <summary>
/// Masraf Merkezi Ağaç Düğümü DTO (Cost Center Tree Node DTO)
/// For hierarchical tree display
/// </summary>
public class CostCenterTreeNodeDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public CostCenterType Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public CostCenterCategory Category { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int? ParentId { get; set; }
    public int Level { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public bool IsFrozen { get; set; }
    public decimal? AnnualBudgetAmount { get; set; }
    public decimal SpentAmount { get; set; }
    public decimal BudgetUsagePercentage { get; set; }
    public bool IsBudgetWarning { get; set; }
    public bool IsOverBudget { get; set; }

    /// <summary>
    /// Alt Düğümler (Child Nodes)
    /// </summary>
    public List<CostCenterTreeNodeDto> Children { get; set; } = new();

    /// <summary>
    /// Alt Düğüm Sayısı (Child Count)
    /// </summary>
    public int ChildCount { get; set; }

    /// <summary>
    /// Genişletilmiş mi? (Is Expanded) - For UI state
    /// </summary>
    public bool IsExpanded { get; set; }

    /// <summary>
    /// Seçili mi? (Is Selected) - For UI state
    /// </summary>
    public bool IsSelected { get; set; }
}
