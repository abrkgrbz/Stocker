using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a sales promotion campaign
/// </summary>
public class Promotion : TenantAggregateRoot
{
    private readonly List<PromotionRule> _rules = new();

    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public PromotionType Type { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public PromotionStatus Status { get; private set; }
    public bool IsActive { get; private set; }
    public int Priority { get; private set; }
    public bool IsStackable { get; private set; }
    public bool IsExclusive { get; private set; }
    public int? UsageLimit { get; private set; }
    public int? UsageLimitPerCustomer { get; private set; }
    public int TotalUsageCount { get; private set; }
    public decimal? MinimumOrderAmount { get; private set; }
    public decimal? MaximumDiscountAmount { get; private set; }
    public string? ApplicableChannels { get; private set; }
    public string? TargetCustomerSegments { get; private set; }
    public string? TargetProductCategories { get; private set; }
    public string? ExcludedProducts { get; private set; }
    public string? ImageUrl { get; private set; }
    public string? BannerUrl { get; private set; }
    public string? TermsAndConditions { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public Guid? CreatedBy { get; private set; }

    public IReadOnlyList<PromotionRule> Rules => _rules.AsReadOnly();

    private Promotion() : base() { }

    public static Result<Promotion> Create(
        Guid tenantId,
        string code,
        string name,
        PromotionType type,
        DateTime startDate,
        DateTime endDate,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result<Promotion>.Failure(Error.Validation("Promotion.Code", "Promotion code is required"));

        if (string.IsNullOrWhiteSpace(name))
            return Result<Promotion>.Failure(Error.Validation("Promotion.Name", "Promotion name is required"));

        if (endDate <= startDate)
            return Result<Promotion>.Failure(Error.Validation("Promotion.EndDate", "End date must be after start date"));

        var promotion = new Promotion
        {
            Id = Guid.NewGuid(),
            Code = code.ToUpperInvariant(),
            Name = name,
            Description = description,
            Type = type,
            StartDate = startDate,
            EndDate = endDate,
            Status = PromotionStatus.Draft,
            IsActive = false,
            Priority = 0,
            IsStackable = false,
            IsExclusive = false,
            TotalUsageCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        promotion.SetTenantId(tenantId);

        return Result<Promotion>.Success(promotion);
    }

    public Result Update(
        string name,
        string? description,
        DateTime startDate,
        DateTime endDate)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure(Error.Validation("Promotion.Name", "Promotion name is required"));

        if (endDate <= startDate)
            return Result.Failure(Error.Validation("Promotion.EndDate", "End date must be after start date"));

        Name = name;
        Description = description;
        StartDate = startDate;
        EndDate = endDate;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result AddRule(PromotionRule rule)
    {
        if (Status != PromotionStatus.Draft)
            return Result.Failure(Error.Conflict("Promotion.Status", "Cannot add rules to non-draft promotion"));

        _rules.Add(rule);
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result RemoveRule(Guid ruleId)
    {
        if (Status != PromotionStatus.Draft)
            return Result.Failure(Error.Conflict("Promotion.Status", "Cannot remove rules from non-draft promotion"));

        var rule = _rules.FirstOrDefault(r => r.Id == ruleId);
        if (rule == null)
            return Result.Failure(Error.NotFound("Promotion.Rule", "Rule not found"));

        _rules.Remove(rule);
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetLimits(
        int? usageLimit,
        int? usageLimitPerCustomer,
        decimal? minimumOrderAmount,
        decimal? maximumDiscountAmount)
    {
        UsageLimit = usageLimit;
        UsageLimitPerCustomer = usageLimitPerCustomer;
        MinimumOrderAmount = minimumOrderAmount;
        MaximumDiscountAmount = maximumDiscountAmount;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetStacking(bool isStackable, bool isExclusive, int priority)
    {
        IsStackable = isStackable;
        IsExclusive = isExclusive;
        Priority = priority;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetTargeting(
        string? applicableChannels,
        string? targetCustomerSegments,
        string? targetProductCategories,
        string? excludedProducts)
    {
        ApplicableChannels = applicableChannels;
        TargetCustomerSegments = targetCustomerSegments;
        TargetProductCategories = targetProductCategories;
        ExcludedProducts = excludedProducts;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetMedia(string? imageUrl, string? bannerUrl)
    {
        ImageUrl = imageUrl;
        BannerUrl = bannerUrl;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetTermsAndConditions(string? termsAndConditions)
    {
        TermsAndConditions = termsAndConditions;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Activate()
    {
        if (!_rules.Any())
            return Result.Failure(Error.Validation("Promotion.Rules", "Promotion must have at least one rule"));

        IsActive = true;
        Status = PromotionStatus.Active;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Deactivate()
    {
        IsActive = false;
        Status = PromotionStatus.Inactive;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Pause()
    {
        if (Status != PromotionStatus.Active)
            return Result.Failure(Error.Conflict("Promotion.Status", "Only active promotions can be paused"));

        Status = PromotionStatus.Paused;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Resume()
    {
        if (Status != PromotionStatus.Paused)
            return Result.Failure(Error.Conflict("Promotion.Status", "Only paused promotions can be resumed"));

        Status = PromotionStatus.Active;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Complete()
    {
        Status = PromotionStatus.Completed;
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result IncrementUsage()
    {
        TotalUsageCount++;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public bool IsValid()
    {
        if (!IsActive || Status != PromotionStatus.Active)
            return false;

        var now = DateTime.UtcNow;
        if (now < StartDate || now > EndDate)
            return false;

        if (UsageLimit.HasValue && TotalUsageCount >= UsageLimit.Value)
            return false;

        return true;
    }
}

public class PromotionRule
{
    public Guid Id { get; private set; }
    public Guid PromotionId { get; private set; }
    public PromotionRuleType RuleType { get; private set; }
    public string? Condition { get; private set; }
    public DiscountValueType DiscountType { get; private set; }
    public decimal DiscountValue { get; private set; }
    public string? ApplicableProducts { get; private set; }
    public string? ApplicableCategories { get; private set; }
    public int? MinimumQuantity { get; private set; }
    public int? MaximumQuantity { get; private set; }
    public Guid? FreeProductId { get; private set; }
    public int? FreeProductQuantity { get; private set; }
    public int SortOrder { get; private set; }

    private PromotionRule() { }

    public static PromotionRule Create(
        PromotionRuleType ruleType,
        DiscountValueType discountType,
        decimal discountValue,
        string? condition = null,
        string? applicableProducts = null,
        string? applicableCategories = null,
        int? minimumQuantity = null,
        int? maximumQuantity = null,
        Guid? freeProductId = null,
        int? freeProductQuantity = null)
    {
        return new PromotionRule
        {
            Id = Guid.NewGuid(),
            RuleType = ruleType,
            DiscountType = discountType,
            DiscountValue = discountValue,
            Condition = condition,
            ApplicableProducts = applicableProducts,
            ApplicableCategories = applicableCategories,
            MinimumQuantity = minimumQuantity,
            MaximumQuantity = maximumQuantity,
            FreeProductId = freeProductId,
            FreeProductQuantity = freeProductQuantity
        };
    }

    public void SetPromotionId(Guid promotionId)
    {
        PromotionId = promotionId;
    }

    public void SetSortOrder(int sortOrder)
    {
        SortOrder = sortOrder;
    }
}

public enum PromotionType
{
    Discount = 0,
    BuyXGetY = 1,
    FreeShipping = 2,
    Bundle = 3,
    Flash = 4,
    Seasonal = 5,
    Clearance = 6,
    Loyalty = 7
}

public enum PromotionStatus
{
    Draft = 0,
    Active = 1,
    Paused = 2,
    Inactive = 3,
    Completed = 4,
    Cancelled = 5
}

public enum PromotionRuleType
{
    PercentageOff = 0,
    AmountOff = 1,
    BuyXGetY = 2,
    BuyXGetYFree = 3,
    FixedPrice = 4,
    FreeShipping = 5,
    FreeProduct = 6,
    TieredDiscount = 7
}
