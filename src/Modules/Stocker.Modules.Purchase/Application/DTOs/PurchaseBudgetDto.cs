using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Application.DTOs;

public record PurchaseBudgetDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Status { get; init; } = string.Empty;
    public string PeriodType { get; init; } = string.Empty;
    public int Year { get; init; }
    public int? Quarter { get; init; }
    public int? Month { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public Guid? DepartmentId { get; init; }
    public string? DepartmentName { get; init; }
    public string? CostCenterCode { get; init; }
    public string? CostCenterName { get; init; }
    public Guid? CategoryId { get; init; }
    public string? CategoryName { get; init; }
    public decimal AllocatedAmount { get; init; }
    public decimal CommittedAmount { get; init; }
    public decimal SpentAmount { get; init; }
    public decimal RemainingAmount { get; init; }
    public decimal AvailableAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal? WarningThreshold { get; init; }
    public decimal? CriticalThreshold { get; init; }
    public bool AlertOnWarning { get; init; }
    public bool AlertOnCritical { get; init; }
    public bool BlockOnExceed { get; init; }
    public Guid? ParentBudgetId { get; init; }
    public string? ParentBudgetCode { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public Guid? CreatedById { get; init; }
    public string? CreatedByName { get; init; }
    public Guid? ApprovedById { get; init; }
    public string? ApprovedByName { get; init; }
    public DateTime? ApprovalDate { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public decimal UtilizationPercentage { get; init; }
    public string AlertLevel { get; init; } = "Normal";
    public List<PurchaseBudgetRevisionDto> Revisions { get; init; } = new();
    public List<PurchaseBudgetTransactionDto> RecentTransactions { get; init; } = new();
}

public record PurchaseBudgetRevisionDto
{
    public Guid Id { get; init; }
    public Guid BudgetId { get; init; }
    public decimal PreviousAmount { get; init; }
    public decimal NewAmount { get; init; }
    public decimal ChangeAmount { get; init; }
    public string Reason { get; init; } = string.Empty;
    public Guid RevisedById { get; init; }
    public string RevisedByName { get; init; } = string.Empty;
    public DateTime RevisedAt { get; init; }
}

public record PurchaseBudgetTransactionDto
{
    public Guid Id { get; init; }
    public Guid BudgetId { get; init; }
    public string Type { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string Reference { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid? ReferenceId { get; init; }
    public DateTime TransactionDate { get; init; }
}

public record PurchaseBudgetListDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string PeriodType { get; init; } = string.Empty;
    public int Year { get; init; }
    public int? Quarter { get; init; }
    public string? DepartmentName { get; init; }
    public string? CategoryName { get; init; }
    public decimal AllocatedAmount { get; init; }
    public decimal SpentAmount { get; init; }
    public decimal AvailableAmount { get; init; }
    public decimal UtilizationPercentage { get; init; }
    public string AlertLevel { get; init; } = "Normal";
    public string Currency { get; init; } = "TRY";
    public DateTime CreatedAt { get; init; }
}

public record CreatePurchaseBudgetDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public PurchaseBudgetPeriodType PeriodType { get; init; } = PurchaseBudgetPeriodType.Annual;
    public int Year { get; init; }
    public int? Quarter { get; init; }
    public int? Month { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public Guid? DepartmentId { get; init; }
    public string? DepartmentName { get; init; }
    public string? CostCenterCode { get; init; }
    public string? CostCenterName { get; init; }
    public Guid? CategoryId { get; init; }
    public string? CategoryName { get; init; }
    public decimal AllocatedAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal? WarningThreshold { get; init; } = 80;
    public decimal? CriticalThreshold { get; init; } = 95;
    public bool AlertOnWarning { get; init; } = true;
    public bool AlertOnCritical { get; init; } = true;
    public bool BlockOnExceed { get; init; }
    public Guid? ParentBudgetId { get; init; }
    public string? ParentBudgetCode { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
}

public record UpdatePurchaseBudgetDto
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public decimal? AllocatedAmount { get; init; }
    public decimal? WarningThreshold { get; init; }
    public decimal? CriticalThreshold { get; init; }
    public bool? AlertOnWarning { get; init; }
    public bool? AlertOnCritical { get; init; }
    public bool? BlockOnExceed { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
}

public record ReviseBudgetDto
{
    public decimal NewAmount { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record BudgetCheckRequestDto
{
    public Guid BudgetId { get; init; }
    public decimal Amount { get; init; }
}

public record BudgetCheckResultDto
{
    public bool IsAllowed { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public decimal AvailableAmount { get; init; }
    public decimal CurrentUtilization { get; init; }
    public decimal ProjectedUtilization { get; init; }
}

public record CommitBudgetDto
{
    public decimal Amount { get; init; }
    public string Reference { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid? ReferenceId { get; init; }
}

public record SpendBudgetDto
{
    public decimal Amount { get; init; }
    public string Reference { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid? ReferenceId { get; init; }
}

public record ReleaseBudgetDto
{
    public decimal Amount { get; init; }
    public string Reference { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid? ReferenceId { get; init; }
}

public record PurchaseBudgetSummaryDto
{
    public int TotalBudgets { get; init; }
    public int ActiveBudgets { get; init; }
    public int BudgetsAtWarning { get; init; }
    public int BudgetsAtCritical { get; init; }
    public int BudgetsExceeded { get; init; }
    public decimal TotalAllocated { get; init; }
    public decimal TotalCommitted { get; init; }
    public decimal TotalSpent { get; init; }
    public decimal TotalAvailable { get; init; }
    public decimal OverallUtilization { get; init; }
    public Dictionary<string, decimal> AllocationByDepartment { get; init; } = new();
    public Dictionary<string, decimal> SpendingByCategory { get; init; } = new();
    public Dictionary<string, int> BudgetsByStatus { get; init; } = new();
}
