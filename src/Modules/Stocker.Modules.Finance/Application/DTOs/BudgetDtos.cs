using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Butce DTO (Budget DTO)
/// </summary>
public class BudgetDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public BudgetType Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public BudgetCategory Category { get; set; }
    public string CategoryName { get; set; } = string.Empty;

    // Period Information
    public int FiscalYear { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public BudgetPeriodType PeriodType { get; set; }
    public string PeriodTypeName { get; set; } = string.Empty;

    // Amount Information
    public decimal TotalBudget { get; set; }
    public decimal UsedAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public decimal CommittedAmount { get; set; }
    public decimal AvailableAmount { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal? RevisedBudget { get; set; }
    public decimal OriginalBudget { get; set; }

    // Control Information
    public bool AllowOverrun { get; set; }
    public bool RequireApprovalForOverrun { get; set; }
    public decimal WarningThreshold { get; set; }
    public decimal CriticalThreshold { get; set; }
    public bool AllowTransfer { get; set; }
    public decimal? MaxTransferRate { get; set; }

    // Relationship Information
    public int? ParentBudgetId { get; set; }
    public string? ParentBudgetName { get; set; }
    public int? CostCenterId { get; set; }
    public string? CostCenterName { get; set; }
    public int? DepartmentId { get; set; }
    public int? ProjectId { get; set; }
    public int? AccountId { get; set; }
    public string? AccountCode { get; set; }

    // Responsibility Information
    public int? OwnerUserId { get; set; }
    public string? OwnerUserName { get; set; }
    public int? ApproverUserId { get; set; }

    // Status Information
    public BudgetStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsLocked { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public int RevisionCount { get; set; }
    public DateTime? LastRevisionDate { get; set; }
    public string? Notes { get; set; }

    // Analysis
    public decimal UsagePercentage { get; set; }
    public decimal CommitmentPercentage { get; set; }
    public decimal TotalAllocationPercentage { get; set; }
    public BudgetHealthStatus HealthStatus { get; set; }
    public string HealthStatusName { get; set; } = string.Empty;

    // Child Budgets
    public List<BudgetSummaryDto> ChildBudgets { get; set; } = new();

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Butce Ozet DTO (Budget Summary DTO)
/// </summary>
public class BudgetSummaryDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public BudgetType Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public BudgetCategory Category { get; set; }
    public int FiscalYear { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalBudget { get; set; }
    public decimal UsedAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public decimal AvailableAmount { get; set; }
    public string Currency { get; set; } = "TRY";
    public BudgetStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public decimal UsagePercentage { get; set; }
    public BudgetHealthStatus HealthStatus { get; set; }
    public string HealthStatusName { get; set; } = string.Empty;
}

/// <summary>
/// Butce Olusturma DTO (Create Budget DTO)
/// </summary>
public class CreateBudgetDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public BudgetType Type { get; set; }
    public BudgetCategory Category { get; set; }

    // Period Information
    public int FiscalYear { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public BudgetPeriodType PeriodType { get; set; } = BudgetPeriodType.Annual;

    // Amount Information
    public decimal TotalBudget { get; set; }
    public string Currency { get; set; } = "TRY";

    // Control Information
    public bool AllowOverrun { get; set; }
    public bool RequireApprovalForOverrun { get; set; } = true;
    public decimal WarningThreshold { get; set; } = 80;
    public decimal CriticalThreshold { get; set; } = 95;
    public bool AllowTransfer { get; set; } = true;
    public decimal? MaxTransferRate { get; set; }

    // Relationship Information
    public int? ParentBudgetId { get; set; }
    public int? CostCenterId { get; set; }
    public int? DepartmentId { get; set; }
    public int? ProjectId { get; set; }
    public int? AccountId { get; set; }
    public string? AccountCode { get; set; }

    // Responsibility Information
    public int? OwnerUserId { get; set; }
    public string? OwnerUserName { get; set; }
    public int? ApproverUserId { get; set; }

    // Notes
    public string? Notes { get; set; }
}

/// <summary>
/// Butce Guncelleme DTO (Update Budget DTO)
/// </summary>
public class UpdateBudgetDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }

    // Control Information
    public bool? AllowOverrun { get; set; }
    public bool? RequireApprovalForOverrun { get; set; }
    public decimal? WarningThreshold { get; set; }
    public decimal? CriticalThreshold { get; set; }
    public bool? AllowTransfer { get; set; }
    public decimal? MaxTransferRate { get; set; }

    // Responsibility Information
    public int? OwnerUserId { get; set; }
    public string? OwnerUserName { get; set; }
    public int? ApproverUserId { get; set; }

    // Notes
    public string? Notes { get; set; }
}

/// <summary>
/// Butce Filtre DTO (Budget Filter DTO)
/// </summary>
public class BudgetFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public BudgetType? Type { get; set; }
    public BudgetCategory? Category { get; set; }
    public BudgetStatus? Status { get; set; }
    public BudgetHealthStatus? HealthStatus { get; set; }
    public int? FiscalYear { get; set; }
    public int? ParentBudgetId { get; set; }
    public int? CostCenterId { get; set; }
    public int? DepartmentId { get; set; }
    public int? ProjectId { get; set; }
    public int? OwnerUserId { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsLocked { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}

/// <summary>
/// Butce Revize DTO (Revise Budget DTO)
/// </summary>
public class ReviseBudgetDto
{
    public decimal NewBudget { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// Butce Kullanim Raporu DTO (Budget Utilization Report DTO)
/// </summary>
public class BudgetUtilizationDto
{
    public int BudgetId { get; set; }
    public string BudgetCode { get; set; } = string.Empty;
    public string BudgetName { get; set; } = string.Empty;
    public BudgetType Type { get; set; }
    public int FiscalYear { get; set; }
    public string Currency { get; set; } = "TRY";

    // Amounts
    public decimal TotalBudget { get; set; }
    public decimal OriginalBudget { get; set; }
    public decimal? RevisedBudget { get; set; }
    public decimal UsedAmount { get; set; }
    public decimal CommittedAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public decimal AvailableAmount { get; set; }

    // Percentages
    public decimal UsagePercentage { get; set; }
    public decimal CommitmentPercentage { get; set; }
    public decimal TotalAllocationPercentage { get; set; }

    // Status
    public BudgetHealthStatus HealthStatus { get; set; }
    public string HealthStatusName { get; set; } = string.Empty;
    public bool IsAtWarningLevel { get; set; }
    public bool IsAtCriticalLevel { get; set; }
    public bool IsOverBudget { get; set; }

    // Thresholds
    public decimal WarningThreshold { get; set; }
    public decimal CriticalThreshold { get; set; }

    // Period remaining
    public int DaysRemaining { get; set; }
    public decimal DailyBurnRate { get; set; }
    public decimal ProjectedEndAmount { get; set; }
}

/// <summary>
/// Butce Onay DTO (Approve Budget DTO)
/// </summary>
public class ApproveBudgetDto
{
    public string? Note { get; set; }
}

/// <summary>
/// Butce Reddet DTO (Reject Budget DTO)
/// </summary>
public class RejectBudgetDto
{
    public string Reason { get; set; } = string.Empty;
}
