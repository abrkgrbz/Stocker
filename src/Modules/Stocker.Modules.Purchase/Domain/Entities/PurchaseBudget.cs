using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

/// <summary>
/// Satın Alma Bütçesi / Purchase Budget
/// </summary>
public class PurchaseBudget : TenantAggregateRoot
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public PurchaseBudgetStatus Status { get; private set; }
    public PurchaseBudgetPeriodType PeriodType { get; private set; }

    // Period
    public int Year { get; private set; }
    public int? Quarter { get; private set; }
    public int? Month { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }

    // Department/Cost Center
    public Guid? DepartmentId { get; private set; }
    public string? DepartmentName { get; private set; }
    public string? CostCenterCode { get; private set; }
    public string? CostCenterName { get; private set; }

    // Category
    public Guid? CategoryId { get; private set; }
    public string? CategoryName { get; private set; }

    // Amounts
    public decimal AllocatedAmount { get; private set; }
    public decimal CommittedAmount { get; private set; }
    public decimal SpentAmount { get; private set; }
    public decimal RemainingAmount { get; private set; }
    public decimal AvailableAmount { get; private set; }
    public string Currency { get; private set; } = "TRY";

    // Thresholds
    public decimal? WarningThreshold { get; private set; }
    public decimal? CriticalThreshold { get; private set; }
    public bool AlertOnWarning { get; private set; }
    public bool AlertOnCritical { get; private set; }
    public bool BlockOnExceed { get; private set; }

    // Hierarchy
    public Guid? ParentBudgetId { get; private set; }
    public string? ParentBudgetCode { get; private set; }

    // Notes
    public string? Notes { get; private set; }
    public string? InternalNotes { get; private set; }

    // Audit
    public Guid? CreatedById { get; private set; }
    public string? CreatedByName { get; private set; }
    public Guid? ApprovedById { get; private set; }
    public string? ApprovedByName { get; private set; }
    public DateTime? ApprovalDate { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<PurchaseBudgetRevision> _revisions = new();
    public IReadOnlyCollection<PurchaseBudgetRevision> Revisions => _revisions.AsReadOnly();

    private readonly List<PurchaseBudgetTransaction> _transactions = new();
    public IReadOnlyCollection<PurchaseBudgetTransaction> Transactions => _transactions.AsReadOnly();

    protected PurchaseBudget() : base() { }

    public static PurchaseBudget Create(
        string code,
        string name,
        int year,
        DateTime startDate,
        DateTime endDate,
        decimal allocatedAmount,
        Guid tenantId,
        PurchaseBudgetPeriodType periodType = PurchaseBudgetPeriodType.Annual,
        string currency = "TRY",
        int? quarter = null,
        int? month = null)
    {
        var budget = new PurchaseBudget();
        budget.Id = Guid.NewGuid();
        budget.SetTenantId(tenantId);
        budget.Code = code;
        budget.Name = name;
        budget.Year = year;
        budget.Quarter = quarter;
        budget.Month = month;
        budget.StartDate = startDate;
        budget.EndDate = endDate;
        budget.PeriodType = periodType;
        budget.AllocatedAmount = allocatedAmount;
        budget.CommittedAmount = 0;
        budget.SpentAmount = 0;
        budget.Currency = currency;
        budget.Status = PurchaseBudgetStatus.Draft;
        budget.CalculateAmounts();
        budget.CreatedAt = DateTime.UtcNow;
        return budget;
    }

    public void Update(
        string name,
        string? description,
        decimal allocatedAmount,
        decimal? warningThreshold,
        decimal? criticalThreshold,
        bool alertOnWarning,
        bool alertOnCritical,
        bool blockOnExceed,
        string? notes,
        string? internalNotes)
    {
        Name = name;
        Description = description;
        AllocatedAmount = allocatedAmount;
        WarningThreshold = warningThreshold;
        CriticalThreshold = criticalThreshold;
        AlertOnWarning = alertOnWarning;
        AlertOnCritical = alertOnCritical;
        BlockOnExceed = blockOnExceed;
        Notes = notes;
        InternalNotes = internalNotes;
        CalculateAmounts();
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDepartment(Guid? departmentId, string? departmentName)
    {
        DepartmentId = departmentId;
        DepartmentName = departmentName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCostCenter(string? costCenterCode, string? costCenterName)
    {
        CostCenterCode = costCenterCode;
        CostCenterName = costCenterName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCategory(Guid? categoryId, string? categoryName)
    {
        CategoryId = categoryId;
        CategoryName = categoryName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetParentBudget(Guid? parentBudgetId, string? parentBudgetCode)
    {
        ParentBudgetId = parentBudgetId;
        ParentBudgetCode = parentBudgetCode;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCreator(Guid createdById, string createdByName)
    {
        CreatedById = createdById;
        CreatedByName = createdByName;
    }

    public void Submit()
    {
        if (Status != PurchaseBudgetStatus.Draft)
            throw new InvalidOperationException("Only draft budgets can be submitted.");

        Status = PurchaseBudgetStatus.PendingApproval;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approvedById, string approvedByName)
    {
        if (Status != PurchaseBudgetStatus.PendingApproval)
            throw new InvalidOperationException("Only pending budgets can be approved.");

        Status = PurchaseBudgetStatus.Approved;
        ApprovedById = approvedById;
        ApprovedByName = approvedByName;
        ApprovalDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(string reason)
    {
        if (Status != PurchaseBudgetStatus.PendingApproval)
            throw new InvalidOperationException("Only pending budgets can be rejected.");

        Status = PurchaseBudgetStatus.Rejected;
        InternalNotes = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        if (Status != PurchaseBudgetStatus.Approved && Status != PurchaseBudgetStatus.Frozen)
            throw new InvalidOperationException("Only approved or frozen budgets can be activated.");

        Status = PurchaseBudgetStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Freeze()
    {
        if (Status != PurchaseBudgetStatus.Active)
            throw new InvalidOperationException("Only active budgets can be frozen.");

        Status = PurchaseBudgetStatus.Frozen;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Close()
    {
        if (Status == PurchaseBudgetStatus.Closed)
            throw new InvalidOperationException("Budget is already closed.");

        Status = PurchaseBudgetStatus.Closed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ReviseBudget(decimal newAmount, string reason, Guid revisedById, string revisedByName)
    {
        if (Status != PurchaseBudgetStatus.Active && Status != PurchaseBudgetStatus.Approved)
            throw new InvalidOperationException("Only active or approved budgets can be revised.");

        var revision = PurchaseBudgetRevision.Create(
            Id,
            TenantId,
            AllocatedAmount,
            newAmount,
            reason,
            revisedById,
            revisedByName);

        _revisions.Add(revision);
        AllocatedAmount = newAmount;
        CalculateAmounts();
        UpdatedAt = DateTime.UtcNow;
    }

    public BudgetCheckResult CheckBudget(decimal amount)
    {
        if (Status != PurchaseBudgetStatus.Active)
            return new BudgetCheckResult(false, BudgetCheckStatus.Inactive, "Budget is not active.");

        if (BlockOnExceed && amount > AvailableAmount)
            return new BudgetCheckResult(false, BudgetCheckStatus.Exceeded, $"Amount exceeds available budget. Available: {AvailableAmount:N2}");

        var newCommitted = CommittedAmount + amount;
        var utilization = (SpentAmount + newCommitted) / AllocatedAmount * 100;

        if (CriticalThreshold.HasValue && utilization >= CriticalThreshold.Value)
            return new BudgetCheckResult(true, BudgetCheckStatus.Critical, $"Budget utilization will reach {utilization:N1}% (Critical threshold: {CriticalThreshold}%)");

        if (WarningThreshold.HasValue && utilization >= WarningThreshold.Value)
            return new BudgetCheckResult(true, BudgetCheckStatus.Warning, $"Budget utilization will reach {utilization:N1}% (Warning threshold: {WarningThreshold}%)");

        return new BudgetCheckResult(true, BudgetCheckStatus.Available, "Budget available.");
    }

    public void CommitAmount(decimal amount, string reference, string description, Guid? referenceId = null)
    {
        if (Status != PurchaseBudgetStatus.Active)
            throw new InvalidOperationException("Budget is not active.");

        if (BlockOnExceed && amount > AvailableAmount)
            throw new InvalidOperationException($"Amount exceeds available budget. Available: {AvailableAmount:N2}");

        var transaction = PurchaseBudgetTransaction.Create(
            Id,
            TenantId,
            BudgetTransactionType.Commitment,
            amount,
            reference,
            description,
            referenceId);

        _transactions.Add(transaction);
        CommittedAmount += amount;
        CalculateAmounts();
        UpdatedAt = DateTime.UtcNow;
    }

    public void SpendAmount(decimal amount, string reference, string description, Guid? referenceId = null)
    {
        if (Status != PurchaseBudgetStatus.Active)
            throw new InvalidOperationException("Budget is not active.");

        var transaction = PurchaseBudgetTransaction.Create(
            Id,
            TenantId,
            BudgetTransactionType.Expenditure,
            amount,
            reference,
            description,
            referenceId);

        _transactions.Add(transaction);

        // Move from committed to spent (if previously committed)
        if (CommittedAmount >= amount)
        {
            CommittedAmount -= amount;
        }
        SpentAmount += amount;
        CalculateAmounts();
        UpdatedAt = DateTime.UtcNow;
    }

    public void ReleaseCommitment(decimal amount, string reference, string description, Guid? referenceId = null)
    {
        if (amount > CommittedAmount)
            throw new InvalidOperationException("Cannot release more than committed amount.");

        var transaction = PurchaseBudgetTransaction.Create(
            Id,
            TenantId,
            BudgetTransactionType.Release,
            -amount,
            reference,
            description,
            referenceId);

        _transactions.Add(transaction);
        CommittedAmount -= amount;
        CalculateAmounts();
        UpdatedAt = DateTime.UtcNow;
    }

    public void RefundAmount(decimal amount, string reference, string description, Guid? referenceId = null)
    {
        var transaction = PurchaseBudgetTransaction.Create(
            Id,
            TenantId,
            BudgetTransactionType.Refund,
            -amount,
            reference,
            description,
            referenceId);

        _transactions.Add(transaction);
        SpentAmount -= amount;
        CalculateAmounts();
        UpdatedAt = DateTime.UtcNow;
    }

    private void CalculateAmounts()
    {
        RemainingAmount = AllocatedAmount - SpentAmount;
        AvailableAmount = AllocatedAmount - SpentAmount - CommittedAmount;
    }

    public decimal GetUtilizationPercentage()
    {
        if (AllocatedAmount == 0) return 0;
        return (SpentAmount + CommittedAmount) / AllocatedAmount * 100;
    }

    public BudgetAlertLevel GetAlertLevel()
    {
        var utilization = GetUtilizationPercentage();

        if (CriticalThreshold.HasValue && utilization >= CriticalThreshold.Value)
            return BudgetAlertLevel.Critical;

        if (WarningThreshold.HasValue && utilization >= WarningThreshold.Value)
            return BudgetAlertLevel.Warning;

        return BudgetAlertLevel.Normal;
    }
}

public class PurchaseBudgetRevision : TenantEntity
{
    public Guid BudgetId { get; private set; }
    public decimal PreviousAmount { get; private set; }
    public decimal NewAmount { get; private set; }
    public decimal ChangeAmount { get; private set; }
    public string Reason { get; private set; } = string.Empty;
    public Guid RevisedById { get; private set; }
    public string RevisedByName { get; private set; } = string.Empty;
    public DateTime RevisedAt { get; private set; }

    protected PurchaseBudgetRevision() : base() { }

    public static PurchaseBudgetRevision Create(
        Guid budgetId,
        Guid tenantId,
        decimal previousAmount,
        decimal newAmount,
        string reason,
        Guid revisedById,
        string revisedByName)
    {
        var revision = new PurchaseBudgetRevision();
        revision.Id = Guid.NewGuid();
        revision.SetTenantId(tenantId);
        revision.BudgetId = budgetId;
        revision.PreviousAmount = previousAmount;
        revision.NewAmount = newAmount;
        revision.ChangeAmount = newAmount - previousAmount;
        revision.Reason = reason;
        revision.RevisedById = revisedById;
        revision.RevisedByName = revisedByName;
        revision.RevisedAt = DateTime.UtcNow;
        return revision;
    }
}

public class PurchaseBudgetTransaction : TenantEntity
{
    public Guid BudgetId { get; private set; }
    public BudgetTransactionType Type { get; private set; }
    public decimal Amount { get; private set; }
    public string Reference { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public Guid? ReferenceId { get; private set; }
    public DateTime TransactionDate { get; private set; }

    protected PurchaseBudgetTransaction() : base() { }

    public static PurchaseBudgetTransaction Create(
        Guid budgetId,
        Guid tenantId,
        BudgetTransactionType type,
        decimal amount,
        string reference,
        string description,
        Guid? referenceId = null)
    {
        var transaction = new PurchaseBudgetTransaction();
        transaction.Id = Guid.NewGuid();
        transaction.SetTenantId(tenantId);
        transaction.BudgetId = budgetId;
        transaction.Type = type;
        transaction.Amount = amount;
        transaction.Reference = reference;
        transaction.Description = description;
        transaction.ReferenceId = referenceId;
        transaction.TransactionDate = DateTime.UtcNow;
        return transaction;
    }
}

// Result classes
public record BudgetCheckResult(bool IsAllowed, BudgetCheckStatus Status, string Message);

// Enums
public enum PurchaseBudgetStatus
{
    Draft,
    PendingApproval,
    Approved,
    Rejected,
    Active,
    Frozen,
    Closed
}

public enum PurchaseBudgetPeriodType
{
    Annual,
    Quarterly,
    Monthly,
    Custom
}

public enum BudgetTransactionType
{
    Commitment,
    Expenditure,
    Release,
    Refund,
    Adjustment
}

public enum BudgetCheckStatus
{
    Available,
    Warning,
    Critical,
    Exceeded,
    Inactive
}

public enum BudgetAlertLevel
{
    Normal,
    Warning,
    Critical
}
