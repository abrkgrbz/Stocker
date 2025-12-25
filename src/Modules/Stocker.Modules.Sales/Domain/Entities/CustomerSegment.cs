using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a customer segmentation for strategic marketing and pricing.
/// Customers can be grouped into segments with special pricing, credit limits,
/// and priority levels. Examples: "VIP", "Enterprise", "Retail", "Wholesale".
/// </summary>
public class CustomerSegment : TenantAggregateRoot
{
    private readonly List<Guid> _customerIds = new();

    #region Properties

    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    // Pricing & Discounts
    public decimal DiscountPercentage { get; private set; } // Global discount for segment
    public decimal? MinimumOrderAmount { get; private set; }
    public decimal? MaximumOrderAmount { get; private set; }
    public bool AllowSpecialPricing { get; private set; } = true;

    // Credit & Payment Terms
    public decimal? DefaultCreditLimit { get; private set; }
    public int DefaultPaymentTermDays { get; private set; } = 30;
    public bool RequiresAdvancePayment { get; private set; }
    public decimal? AdvancePaymentPercentage { get; private set; }

    // Priority & Service Level
    public SegmentPriority Priority { get; private set; }
    public ServiceLevel ServiceLevel { get; private set; }
    public int? MaxResponseTimeHours { get; private set; }
    public bool HasDedicatedSupport { get; private set; }

    // Eligibility Criteria
    public decimal? MinimumAnnualRevenue { get; private set; }
    public int? MinimumOrderCount { get; private set; }
    public int? MinimumMonthsAsCustomer { get; private set; }

    // Benefits
    public bool FreeShipping { get; private set; }
    public decimal? FreeShippingThreshold { get; private set; }
    public bool EarlyAccessToProducts { get; private set; }
    public bool ExclusivePromotions { get; private set; }
    public string? BenefitsDescription { get; private set; }

    // Visual
    public string? Color { get; private set; }
    public string? BadgeIcon { get; private set; }

    // Status
    public bool IsActive { get; private set; } = true;
    public bool IsDefault { get; private set; }

    // Metrics
    public int CustomerCount { get; private set; }
    public decimal TotalRevenue { get; private set; }
    public decimal AverageOrderValue { get; private set; }

    // Audit
    public Guid? CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public IReadOnlyList<Guid> CustomerIds => _customerIds.AsReadOnly();

    #endregion

    #region Constructors

    private CustomerSegment() { }

    private CustomerSegment(
        Guid tenantId,
        string code,
        string name,
        SegmentPriority priority) : base(Guid.NewGuid(), tenantId)
    {
        Code = code;
        Name = name;
        Priority = priority;
        ServiceLevel = ServiceLevel.Standard;
        CreatedAt = DateTime.UtcNow;
    }

    #endregion

    #region Factory Methods

    public static Result<CustomerSegment> Create(
        Guid tenantId,
        string code,
        string name,
        SegmentPriority priority = SegmentPriority.Normal)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result<CustomerSegment>.Failure(Error.Validation("Segment.CodeRequired", "Segment code is required"));

        if (string.IsNullOrWhiteSpace(name))
            return Result<CustomerSegment>.Failure(Error.Validation("Segment.NameRequired", "Segment name is required"));

        return Result<CustomerSegment>.Success(new CustomerSegment(tenantId, code, name, priority));
    }

    /// <summary>
    /// Creates a VIP segment with premium benefits
    /// </summary>
    public static Result<CustomerSegment> CreateVIP(
        Guid tenantId,
        string code,
        string name,
        decimal discountPercentage = 10,
        decimal? creditLimit = null)
    {
        var result = Create(tenantId, code, name, SegmentPriority.VIP);
        if (!result.IsSuccess)
            return result;

        var segment = result.Value;
        segment.DiscountPercentage = discountPercentage;
        segment.DefaultCreditLimit = creditLimit;
        segment.ServiceLevel = ServiceLevel.Premium;
        segment.HasDedicatedSupport = true;
        segment.FreeShipping = true;
        segment.EarlyAccessToProducts = true;
        segment.ExclusivePromotions = true;
        segment.MaxResponseTimeHours = 4;
        segment.Color = "#FFD700"; // Gold

        return Result<CustomerSegment>.Success(segment);
    }

    /// <summary>
    /// Creates an Enterprise segment
    /// </summary>
    public static Result<CustomerSegment> CreateEnterprise(
        Guid tenantId,
        string code,
        string name,
        decimal discountPercentage = 15,
        decimal? creditLimit = null)
    {
        var result = Create(tenantId, code, name, SegmentPriority.Enterprise);
        if (!result.IsSuccess)
            return result;

        var segment = result.Value;
        segment.DiscountPercentage = discountPercentage;
        segment.DefaultCreditLimit = creditLimit;
        segment.ServiceLevel = ServiceLevel.Enterprise;
        segment.HasDedicatedSupport = true;
        segment.FreeShipping = true;
        segment.EarlyAccessToProducts = true;
        segment.ExclusivePromotions = true;
        segment.MaxResponseTimeHours = 2;
        segment.DefaultPaymentTermDays = 60;
        segment.Color = "#4169E1"; // Royal Blue

        return Result<CustomerSegment>.Success(segment);
    }

    #endregion

    #region Pricing & Discounts

    public Result SetPricing(
        decimal discountPercentage,
        decimal? minOrderAmount = null,
        decimal? maxOrderAmount = null)
    {
        if (discountPercentage < 0 || discountPercentage > 100)
            return Result.Failure(Error.Validation("Segment.InvalidDiscount", "Discount must be between 0 and 100"));

        if (minOrderAmount.HasValue && maxOrderAmount.HasValue && minOrderAmount > maxOrderAmount)
            return Result.Failure(Error.Validation("Segment.InvalidOrderRange", "Minimum order cannot exceed maximum order"));

        DiscountPercentage = discountPercentage;
        MinimumOrderAmount = minOrderAmount;
        MaximumOrderAmount = maxOrderAmount;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetSpecialPricing(bool allow)
    {
        AllowSpecialPricing = allow;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Calculates the effective price after segment discount
    /// </summary>
    public decimal CalculateDiscountedPrice(decimal originalPrice)
    {
        if (DiscountPercentage <= 0)
            return originalPrice;

        return originalPrice * (1 - DiscountPercentage / 100);
    }

    #endregion

    #region Credit & Payment Terms

    public Result SetCreditTerms(
        decimal? creditLimit,
        int paymentTermDays = 30,
        bool requiresAdvance = false,
        decimal? advancePercentage = null)
    {
        if (paymentTermDays < 0)
            return Result.Failure(Error.Validation("Segment.InvalidTerms", "Payment terms cannot be negative"));

        if (requiresAdvance && advancePercentage.HasValue && (advancePercentage < 0 || advancePercentage > 100))
            return Result.Failure(Error.Validation("Segment.InvalidAdvance", "Advance percentage must be between 0 and 100"));

        DefaultCreditLimit = creditLimit;
        DefaultPaymentTermDays = paymentTermDays;
        RequiresAdvancePayment = requiresAdvance;
        AdvancePaymentPercentage = advancePercentage;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Priority & Service Level

    public Result SetServiceLevel(
        SegmentPriority priority,
        ServiceLevel serviceLevel,
        int? maxResponseHours = null,
        bool dedicatedSupport = false)
    {
        Priority = priority;
        ServiceLevel = serviceLevel;
        MaxResponseTimeHours = maxResponseHours;
        HasDedicatedSupport = dedicatedSupport;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Eligibility Criteria

    public Result SetEligibilityCriteria(
        decimal? minAnnualRevenue = null,
        int? minOrderCount = null,
        int? minMonthsAsCustomer = null)
    {
        MinimumAnnualRevenue = minAnnualRevenue;
        MinimumOrderCount = minOrderCount;
        MinimumMonthsAsCustomer = minMonthsAsCustomer;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Checks if a customer meets the eligibility criteria for this segment
    /// </summary>
    public Result<bool> CheckEligibility(
        decimal annualRevenue,
        int orderCount,
        int monthsAsCustomer)
    {
        if (MinimumAnnualRevenue.HasValue && annualRevenue < MinimumAnnualRevenue)
            return Result<bool>.Success(false);

        if (MinimumOrderCount.HasValue && orderCount < MinimumOrderCount)
            return Result<bool>.Success(false);

        if (MinimumMonthsAsCustomer.HasValue && monthsAsCustomer < MinimumMonthsAsCustomer)
            return Result<bool>.Success(false);

        return Result<bool>.Success(true);
    }

    #endregion

    #region Benefits

    public Result SetShippingBenefits(bool freeShipping, decimal? freeShippingThreshold = null)
    {
        FreeShipping = freeShipping;
        FreeShippingThreshold = freeShipping ? null : freeShippingThreshold;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetPromotionalBenefits(bool earlyAccess, bool exclusivePromotions, string? benefitsDescription = null)
    {
        EarlyAccessToProducts = earlyAccess;
        ExclusivePromotions = exclusivePromotions;
        BenefitsDescription = benefitsDescription;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Customer Management

    /// <summary>
    /// Assigns a customer to this segment
    /// </summary>
    public Result AssignCustomer(Guid customerId)
    {
        if (_customerIds.Contains(customerId))
            return Result.Failure(Error.Conflict("Segment.CustomerExists", "Customer is already in this segment"));

        _customerIds.Add(customerId);
        CustomerCount = _customerIds.Count;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Removes a customer from this segment
    /// </summary>
    public Result RemoveCustomer(Guid customerId)
    {
        if (!_customerIds.Contains(customerId))
            return Result.Failure(Error.NotFound("Segment.CustomerNotFound", "Customer is not in this segment"));

        _customerIds.Remove(customerId);
        CustomerCount = _customerIds.Count;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Checks if segment should be recalculated for a customer based on their metrics
    /// </summary>
    public Result<SegmentRecommendation> RecalculateSegment(
        decimal annualRevenue,
        int orderCount,
        int monthsAsCustomer,
        decimal averageOrderValue)
    {
        var eligible = CheckEligibility(annualRevenue, orderCount, monthsAsCustomer);
        if (!eligible.IsSuccess)
            return Result<SegmentRecommendation>.Failure(eligible.Error);

        var recommendation = new SegmentRecommendation
        {
            IsEligible = eligible.Value,
            CurrentSegmentId = Id,
            AnnualRevenue = annualRevenue,
            OrderCount = orderCount,
            MonthsAsCustomer = monthsAsCustomer,
            AverageOrderValue = averageOrderValue
        };

        // Suggest upgrade/downgrade based on performance
        if (eligible.Value && annualRevenue > (MinimumAnnualRevenue ?? 0) * 1.5m)
        {
            recommendation.SuggestUpgrade = true;
            recommendation.Reason = "Customer exceeds minimum revenue by 50%";
        }
        else if (!eligible.Value)
        {
            recommendation.SuggestDowngrade = true;
            recommendation.Reason = "Customer no longer meets eligibility criteria";
        }

        return Result<SegmentRecommendation>.Success(recommendation);
    }

    #endregion

    #region Visual & Status

    public Result SetVisual(string? color, string? badgeIcon)
    {
        Color = color;
        BadgeIcon = badgeIcon;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetAsDefault()
    {
        IsDefault = true;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result ClearDefault()
    {
        IsDefault = false;
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
        if (IsDefault)
            return Result.Failure(Error.Validation("Segment.CannotDeactivateDefault", "Cannot deactivate the default segment"));

        if (CustomerCount > 0)
            return Result.Failure(Error.Validation("Segment.HasCustomers",
                $"Cannot deactivate segment with {CustomerCount} customers. Reassign them first."));

        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Metrics

    public Result UpdateMetrics(decimal totalRevenue, decimal avgOrderValue)
    {
        TotalRevenue = totalRevenue;
        AverageOrderValue = avgOrderValue;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Metadata

    public Result UpdateDetails(string? name, string? description)
    {
        if (!string.IsNullOrWhiteSpace(name))
            Name = name;
        if (description != null)
            Description = description;

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetCreator(Guid userId)
    {
        CreatedBy = userId;
        return Result.Success();
    }

    #endregion
}

#region Supporting Types

public class SegmentRecommendation
{
    public bool IsEligible { get; set; }
    public Guid CurrentSegmentId { get; set; }
    public Guid? RecommendedSegmentId { get; set; }
    public bool SuggestUpgrade { get; set; }
    public bool SuggestDowngrade { get; set; }
    public string? Reason { get; set; }
    public decimal AnnualRevenue { get; set; }
    public int OrderCount { get; set; }
    public int MonthsAsCustomer { get; set; }
    public decimal AverageOrderValue { get; set; }
}

#endregion

#region Enums

public enum SegmentPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    VIP = 3,
    Enterprise = 4
}

public enum ServiceLevel
{
    Basic = 0,
    Standard = 1,
    Premium = 2,
    Enterprise = 3,
    Platinum = 4
}

#endregion
