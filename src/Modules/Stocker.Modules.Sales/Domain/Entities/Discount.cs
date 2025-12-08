using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a discount definition
/// </summary>
public class Discount : TenantAggregateRoot
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public DiscountType Type { get; private set; }
    public DiscountValueType ValueType { get; private set; }
    public decimal Value { get; private set; }
    public decimal? MinimumOrderAmount { get; private set; }
    public decimal? MaximumDiscountAmount { get; private set; }
    public int? MinimumQuantity { get; private set; }
    public DateTime? StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public bool IsActive { get; private set; }
    public int? UsageLimit { get; private set; }
    public int UsageCount { get; private set; }
    public bool IsStackable { get; private set; }
    public int Priority { get; private set; }
    public DiscountApplicability Applicability { get; private set; }
    public string? ApplicableProductIds { get; private set; }
    public string? ApplicableCategoryIds { get; private set; }
    public string? ApplicableCustomerIds { get; private set; }
    public string? ApplicableCustomerGroupIds { get; private set; }
    public string? ExcludedProductIds { get; private set; }
    public string? ExcludedCategoryIds { get; private set; }
    public bool RequiresCouponCode { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public Guid? CreatedBy { get; private set; }

    private Discount() : base() { }

    public static Result<Discount> Create(
        Guid tenantId,
        string code,
        string name,
        DiscountType type,
        DiscountValueType valueType,
        decimal value,
        DateTime? startDate = null,
        DateTime? endDate = null,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result<Discount>.Failure(Error.Validation("Discount.Code", "Discount code is required"));

        if (string.IsNullOrWhiteSpace(name))
            return Result<Discount>.Failure(Error.Validation("Discount.Name", "Discount name is required"));

        if (value < 0)
            return Result<Discount>.Failure(Error.Validation("Discount.Value", "Discount value cannot be negative"));

        if (valueType == DiscountValueType.Percentage && value > 100)
            return Result<Discount>.Failure(Error.Validation("Discount.Value", "Percentage discount cannot exceed 100%"));

        if (startDate.HasValue && endDate.HasValue && endDate < startDate)
            return Result<Discount>.Failure(Error.Validation("Discount.EndDate", "End date cannot be before start date"));

        var discount = new Discount
        {
            Id = Guid.NewGuid(),
            Code = code.ToUpperInvariant(),
            Name = name,
            Description = description,
            Type = type,
            ValueType = valueType,
            Value = value,
            StartDate = startDate,
            EndDate = endDate,
            IsActive = true,
            UsageCount = 0,
            IsStackable = false,
            Priority = 0,
            Applicability = DiscountApplicability.All,
            RequiresCouponCode = type == DiscountType.Coupon,
            CreatedAt = DateTime.UtcNow
        };

        discount.SetTenantId(tenantId);

        return Result<Discount>.Success(discount);
    }

    public Result Update(
        string name,
        string? description,
        decimal value,
        DateTime? startDate,
        DateTime? endDate)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure(Error.Validation("Discount.Name", "Discount name is required"));

        if (value < 0)
            return Result.Failure(Error.Validation("Discount.Value", "Discount value cannot be negative"));

        if (ValueType == DiscountValueType.Percentage && value > 100)
            return Result.Failure(Error.Validation("Discount.Value", "Percentage discount cannot exceed 100%"));

        Name = name;
        Description = description;
        Value = value;
        StartDate = startDate;
        EndDate = endDate;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetLimits(
        decimal? minimumOrderAmount,
        decimal? maximumDiscountAmount,
        int? minimumQuantity,
        int? usageLimit)
    {
        MinimumOrderAmount = minimumOrderAmount;
        MaximumDiscountAmount = maximumDiscountAmount;
        MinimumQuantity = minimumQuantity;
        UsageLimit = usageLimit;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetApplicability(
        DiscountApplicability applicability,
        string? applicableProductIds = null,
        string? applicableCategoryIds = null,
        string? applicableCustomerIds = null,
        string? applicableCustomerGroupIds = null)
    {
        Applicability = applicability;
        ApplicableProductIds = applicableProductIds;
        ApplicableCategoryIds = applicableCategoryIds;
        ApplicableCustomerIds = applicableCustomerIds;
        ApplicableCustomerGroupIds = applicableCustomerGroupIds;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetExclusions(string? excludedProductIds, string? excludedCategoryIds)
    {
        ExcludedProductIds = excludedProductIds;
        ExcludedCategoryIds = excludedCategoryIds;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetStackable(bool isStackable, int priority)
    {
        IsStackable = isStackable;
        Priority = priority;
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

    public Result IncrementUsage()
    {
        UsageCount++;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result<decimal> CalculateDiscount(decimal orderAmount, int quantity = 1)
    {
        if (!IsValid())
            return Result<decimal>.Failure(Error.Conflict("Discount.Invalid", "Discount is not valid"));

        if (MinimumOrderAmount.HasValue && orderAmount < MinimumOrderAmount.Value)
            return Result<decimal>.Failure(Error.Validation("Discount.MinimumOrderAmount", $"Minimum order amount is {MinimumOrderAmount.Value}"));

        if (MinimumQuantity.HasValue && quantity < MinimumQuantity.Value)
            return Result<decimal>.Failure(Error.Validation("Discount.MinimumQuantity", $"Minimum quantity is {MinimumQuantity.Value}"));

        decimal discountAmount;
        if (ValueType == DiscountValueType.Percentage)
        {
            discountAmount = orderAmount * Value / 100;
        }
        else
        {
            discountAmount = Value;
        }

        if (MaximumDiscountAmount.HasValue && discountAmount > MaximumDiscountAmount.Value)
        {
            discountAmount = MaximumDiscountAmount.Value;
        }

        return Result<decimal>.Success(discountAmount);
    }

    public bool IsValid()
    {
        if (!IsActive)
            return false;

        var now = DateTime.UtcNow;

        if (StartDate.HasValue && now < StartDate.Value)
            return false;

        if (EndDate.HasValue && now > EndDate.Value)
            return false;

        if (UsageLimit.HasValue && UsageCount >= UsageLimit.Value)
            return false;

        return true;
    }
}

public enum DiscountType
{
    Automatic = 0,
    Coupon = 1,
    Promotion = 2,
    Volume = 3,
    Loyalty = 4,
    Seasonal = 5,
    FirstOrder = 6,
    Bundle = 7
}

public enum DiscountValueType
{
    Percentage = 0,
    FixedAmount = 1,
    FixedPrice = 2
}

public enum DiscountApplicability
{
    All = 0,
    SpecificProducts = 1,
    SpecificCategories = 2,
    SpecificCustomers = 3,
    SpecificCustomerGroups = 4
}
