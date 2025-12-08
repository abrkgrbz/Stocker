using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a sales commission configuration
/// </summary>
public class CommissionPlan : TenantAggregateRoot
{
    private readonly List<CommissionTier> _tiers = new();

    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public CommissionType Type { get; private set; }
    public CommissionCalculationType CalculationType { get; private set; }
    public decimal? BaseRate { get; private set; }
    public decimal? BaseAmount { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsTiered { get; private set; }
    public DateTime? StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public string? ApplicableProductCategories { get; private set; }
    public string? ApplicableProducts { get; private set; }
    public string? ExcludedProducts { get; private set; }
    public string? ApplicableSalesPersons { get; private set; }
    public string? ApplicableRoles { get; private set; }
    public bool IncludeVat { get; private set; }
    public bool CalculateOnProfit { get; private set; }
    public decimal? MinimumSaleAmount { get; private set; }
    public decimal? MaximumCommissionAmount { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public Guid? CreatedBy { get; private set; }

    public IReadOnlyList<CommissionTier> Tiers => _tiers.AsReadOnly();

    private CommissionPlan() : base() { }

    public static Result<CommissionPlan> Create(
        Guid tenantId,
        string name,
        CommissionType type,
        CommissionCalculationType calculationType,
        decimal? baseRate = null,
        decimal? baseAmount = null,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result<CommissionPlan>.Failure(Error.Validation("CommissionPlan.Name", "Commission plan name is required"));

        if (calculationType == CommissionCalculationType.Percentage && !baseRate.HasValue)
            return Result<CommissionPlan>.Failure(Error.Validation("CommissionPlan.BaseRate", "Base rate is required for percentage calculation"));

        if (calculationType == CommissionCalculationType.FixedAmount && !baseAmount.HasValue)
            return Result<CommissionPlan>.Failure(Error.Validation("CommissionPlan.BaseAmount", "Base amount is required for fixed amount calculation"));

        var plan = new CommissionPlan
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            Type = type,
            CalculationType = calculationType,
            BaseRate = baseRate,
            BaseAmount = baseAmount,
            IsActive = true,
            IsTiered = false,
            IncludeVat = false,
            CalculateOnProfit = false,
            CreatedAt = DateTime.UtcNow
        };

        plan.SetTenantId(tenantId);

        return Result<CommissionPlan>.Success(plan);
    }

    public Result Update(
        string name,
        string? description,
        decimal? baseRate,
        decimal? baseAmount)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure(Error.Validation("CommissionPlan.Name", "Commission plan name is required"));

        Name = name;
        Description = description;
        BaseRate = baseRate;
        BaseAmount = baseAmount;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result AddTier(CommissionTier tier)
    {
        _tiers.Add(tier);
        IsTiered = true;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result RemoveTier(Guid tierId)
    {
        var tier = _tiers.FirstOrDefault(t => t.Id == tierId);
        if (tier == null)
            return Result.Failure(Error.NotFound("CommissionPlan.Tier", "Tier not found"));

        _tiers.Remove(tier);
        IsTiered = _tiers.Any();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetDateRange(DateTime? startDate, DateTime? endDate)
    {
        if (startDate.HasValue && endDate.HasValue && endDate < startDate)
            return Result.Failure(Error.Validation("CommissionPlan.EndDate", "End date cannot be before start date"));

        StartDate = startDate;
        EndDate = endDate;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetApplicability(
        string? applicableProductCategories,
        string? applicableProducts,
        string? excludedProducts)
    {
        ApplicableProductCategories = applicableProductCategories;
        ApplicableProducts = applicableProducts;
        ExcludedProducts = excludedProducts;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetSalesPersonApplicability(
        string? applicableSalesPersons,
        string? applicableRoles)
    {
        ApplicableSalesPersons = applicableSalesPersons;
        ApplicableRoles = applicableRoles;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetCalculationOptions(
        bool includeVat,
        bool calculateOnProfit,
        decimal? minimumSaleAmount,
        decimal? maximumCommissionAmount)
    {
        IncludeVat = includeVat;
        CalculateOnProfit = calculateOnProfit;
        MinimumSaleAmount = minimumSaleAmount;
        MaximumCommissionAmount = maximumCommissionAmount;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result<decimal> CalculateCommission(decimal saleAmount, decimal? profitAmount = null)
    {
        if (!IsActive)
            return Result<decimal>.Failure(Error.Conflict("CommissionPlan.Inactive", "Commission plan is not active"));

        var now = DateTime.UtcNow;
        if (StartDate.HasValue && now < StartDate.Value)
            return Result<decimal>.Failure(Error.Conflict("CommissionPlan.NotStarted", "Commission plan has not started"));

        if (EndDate.HasValue && now > EndDate.Value)
            return Result<decimal>.Failure(Error.Conflict("CommissionPlan.Expired", "Commission plan has expired"));

        if (MinimumSaleAmount.HasValue && saleAmount < MinimumSaleAmount.Value)
            return Result<decimal>.Success(0);

        var baseForCalculation = CalculateOnProfit && profitAmount.HasValue ? profitAmount.Value : saleAmount;
        decimal commission;

        if (IsTiered && _tiers.Any())
        {
            commission = CalculateTieredCommission(baseForCalculation);
        }
        else
        {
            commission = CalculationType switch
            {
                CommissionCalculationType.Percentage => baseForCalculation * (BaseRate ?? 0) / 100,
                CommissionCalculationType.FixedAmount => BaseAmount ?? 0,
                CommissionCalculationType.PerUnit => BaseAmount ?? 0,
                _ => 0
            };
        }

        if (MaximumCommissionAmount.HasValue && commission > MaximumCommissionAmount.Value)
        {
            commission = MaximumCommissionAmount.Value;
        }

        return Result<decimal>.Success(commission);
    }

    private decimal CalculateTieredCommission(decimal amount)
    {
        var orderedTiers = _tiers.OrderBy(t => t.FromAmount).ToList();
        decimal totalCommission = 0;
        decimal remainingAmount = amount;

        foreach (var tier in orderedTiers)
        {
            if (remainingAmount <= 0)
                break;

            if (amount < tier.FromAmount)
                continue;

            var tierAmount = tier.ToAmount.HasValue
                ? Math.Min(remainingAmount, tier.ToAmount.Value - tier.FromAmount)
                : remainingAmount;

            if (tierAmount <= 0)
                continue;

            var tierCommission = tier.CalculationType switch
            {
                CommissionCalculationType.Percentage => tierAmount * tier.Rate / 100,
                CommissionCalculationType.FixedAmount => tier.FixedAmount ?? 0,
                _ => 0
            };

            totalCommission += tierCommission;
            remainingAmount -= tierAmount;
        }

        return totalCommission;
    }
}

public class CommissionTier
{
    public Guid Id { get; private set; }
    public Guid CommissionPlanId { get; private set; }
    public string? Name { get; private set; }
    public decimal FromAmount { get; private set; }
    public decimal? ToAmount { get; private set; }
    public CommissionCalculationType CalculationType { get; private set; }
    public decimal Rate { get; private set; }
    public decimal? FixedAmount { get; private set; }
    public int SortOrder { get; private set; }

    private CommissionTier() { }

    public static CommissionTier Create(
        decimal fromAmount,
        decimal? toAmount,
        CommissionCalculationType calculationType,
        decimal rate,
        decimal? fixedAmount = null,
        string? name = null)
    {
        return new CommissionTier
        {
            Id = Guid.NewGuid(),
            Name = name,
            FromAmount = fromAmount,
            ToAmount = toAmount,
            CalculationType = calculationType,
            Rate = rate,
            FixedAmount = fixedAmount
        };
    }

    public void SetCommissionPlanId(Guid commissionPlanId)
    {
        CommissionPlanId = commissionPlanId;
    }

    public void SetSortOrder(int sortOrder)
    {
        SortOrder = sortOrder;
    }
}

/// <summary>
/// Represents a calculated commission record for a sale
/// </summary>
public class SalesCommission : TenantEntity
{
    public Guid SalesOrderId { get; private set; }
    public Guid? InvoiceId { get; private set; }
    public Guid SalesPersonId { get; private set; }
    public string SalesPersonName { get; private set; } = string.Empty;
    public Guid CommissionPlanId { get; private set; }
    public string CommissionPlanName { get; private set; } = string.Empty;
    public decimal SaleAmount { get; private set; }
    public decimal CommissionAmount { get; private set; }
    public decimal CommissionRate { get; private set; }
    public SalesCommissionStatus Status { get; private set; }
    public DateTime CalculatedDate { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTime? PaidDate { get; private set; }
    public string? PaymentReference { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private SalesCommission() : base() { }

    public static Result<SalesCommission> Create(
        Guid tenantId,
        Guid salesOrderId,
        Guid salesPersonId,
        string salesPersonName,
        Guid commissionPlanId,
        string commissionPlanName,
        decimal saleAmount,
        decimal commissionAmount,
        decimal commissionRate,
        Guid? invoiceId = null)
    {
        var commission = new SalesCommission
        {
            Id = Guid.NewGuid(),
            SalesOrderId = salesOrderId,
            InvoiceId = invoiceId,
            SalesPersonId = salesPersonId,
            SalesPersonName = salesPersonName,
            CommissionPlanId = commissionPlanId,
            CommissionPlanName = commissionPlanName,
            SaleAmount = saleAmount,
            CommissionAmount = commissionAmount,
            CommissionRate = commissionRate,
            Status = SalesCommissionStatus.Pending,
            CalculatedDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        commission.SetTenantId(tenantId);

        return Result<SalesCommission>.Success(commission);
    }

    public Result Approve(Guid approvedBy)
    {
        if (Status != SalesCommissionStatus.Pending)
            return Result.Failure(Error.Conflict("SalesCommission.Status", "Only pending commissions can be approved"));

        Status = SalesCommissionStatus.Approved;
        ApprovedBy = approvedBy;
        ApprovedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Reject(string reason)
    {
        if (Status != SalesCommissionStatus.Pending)
            return Result.Failure(Error.Conflict("SalesCommission.Status", "Only pending commissions can be rejected"));

        Status = SalesCommissionStatus.Rejected;
        Notes = reason;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result MarkAsPaid(string paymentReference)
    {
        if (Status != SalesCommissionStatus.Approved)
            return Result.Failure(Error.Conflict("SalesCommission.Status", "Only approved commissions can be marked as paid"));

        Status = SalesCommissionStatus.Paid;
        PaidDate = DateTime.UtcNow;
        PaymentReference = paymentReference;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Cancel(string reason)
    {
        if (Status == SalesCommissionStatus.Paid)
            return Result.Failure(Error.Conflict("SalesCommission.Status", "Paid commissions cannot be cancelled"));

        Status = SalesCommissionStatus.Cancelled;
        Notes = reason;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }
}

public enum CommissionType
{
    Sales = 0,
    Margin = 1,
    Revenue = 2,
    NewCustomer = 3,
    Upsell = 4,
    Renewal = 5
}

public enum CommissionCalculationType
{
    Percentage = 0,
    FixedAmount = 1,
    PerUnit = 2,
    Tiered = 3
}

public enum SalesCommissionStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Paid = 3,
    Cancelled = 4
}
