using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for pricing calculations and module/bundle pricing operations
/// </summary>
public interface IPricingService
{
    #region Module Pricing

    /// <summary>
    /// Get all active module pricings
    /// </summary>
    Task<IReadOnlyList<ModulePricingDto>> GetModulePricingsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get module pricing by code
    /// </summary>
    Task<ModulePricingDto?> GetModulePricingByCodeAsync(string moduleCode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculate total price for selected modules
    /// </summary>
    Task<PriceCalculationResult> CalculateModulesPriceAsync(
        IEnumerable<string> moduleCodes,
        BillingCycle billingCycle,
        CancellationToken cancellationToken = default);

    #endregion

    #region Bundle Pricing

    /// <summary>
    /// Get all active module bundles
    /// </summary>
    Task<IReadOnlyList<ModuleBundleDto>> GetModuleBundlesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get bundle by code
    /// </summary>
    Task<ModuleBundleDto?> GetModuleBundleByCodeAsync(string bundleCode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculate bundle price with discount info
    /// </summary>
    Task<BundlePriceCalculation> CalculateBundlePriceAsync(
        string bundleCode,
        BillingCycle billingCycle,
        CancellationToken cancellationToken = default);

    #endregion

    #region Add-on Pricing

    /// <summary>
    /// Get all active add-ons
    /// </summary>
    Task<IReadOnlyList<AddOnPricingDto>> GetAddOnsAsync(string? moduleCode = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculate add-on price
    /// </summary>
    Task<PriceCalculationResult> CalculateAddOnsPriceAsync(
        IEnumerable<string> addOnCodes,
        BillingCycle billingCycle,
        CancellationToken cancellationToken = default);

    #endregion

    #region Combined Calculations

    /// <summary>
    /// Calculate complete subscription price including package, modules, add-ons, and users
    /// </summary>
    Task<SubscriptionPriceCalculation> CalculateSubscriptionPriceAsync(
        SubscriptionPriceRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculate upgrade/downgrade price with proration
    /// </summary>
    Task<UpgradePriceCalculation> CalculateUpgradePriceAsync(
        Guid currentSubscriptionId,
        SubscriptionPriceRequest newConfiguration,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get recommended modules for an industry
    /// </summary>
    Task<IReadOnlyList<string>> GetRecommendedModulesAsync(string industryCode, CancellationToken cancellationToken = default);

    #endregion
}

#region DTOs

public class ModulePricingDto
{
    public Guid Id { get; set; }
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }
    public string Currency { get; set; } = "TRY";
    public bool IsCore { get; set; }
    public bool IsActive { get; set; }
    public int? TrialDays { get; set; }
    public int DisplayOrder { get; set; }
    public string[] IncludedFeatures { get; set; } = Array.Empty<string>();
}

public class ModuleBundleDto
{
    public Guid Id { get; set; }
    public string BundleCode { get; set; } = string.Empty;
    public string BundleName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal DiscountPercent { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public List<string> ModuleCodes { get; set; } = new();
    public decimal OriginalMonthlyPrice { get; set; } // Sum of individual modules
    public decimal SavingsAmount { get; set; } // How much you save with bundle
}

public class AddOnPricingDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal MonthlyPrice { get; set; }
    public decimal? YearlyPrice { get; set; }
    public string Currency { get; set; } = "TRY";
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public string? Category { get; set; }
    public string? RequiredModuleCode { get; set; }
    public int? Quantity { get; set; }
    public string? QuantityUnit { get; set; }
    public List<string> Features { get; set; } = new();
}

public class PriceCalculationResult
{
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public string Currency { get; set; } = "TRY";
    public BillingCycle BillingCycle { get; set; }
    public List<PriceLineItem> LineItems { get; set; } = new();
}

public class PriceLineItem
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Module, Bundle, AddOn, User
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal TotalPrice { get; set; }
}

public class BundlePriceCalculation : PriceCalculationResult
{
    public string BundleCode { get; set; } = string.Empty;
    public string BundleName { get; set; } = string.Empty;
    public decimal OriginalPrice { get; set; } // If bought separately
    public decimal SavingsAmount { get; set; }
    public decimal SavingsPercent { get; set; }
    public List<string> IncludedModules { get; set; } = new();
}

public class SubscriptionPriceRequest
{
    public Guid? PackageId { get; set; }
    public string? BundleCode { get; set; }
    public List<string> ModuleCodes { get; set; } = new();
    public List<string> AddOnCodes { get; set; } = new();
    public int UserCount { get; set; } = 1;
    public BillingCycle BillingCycle { get; set; } = BillingCycle.Aylik;
}

public class SubscriptionPriceCalculation : PriceCalculationResult
{
    public decimal BasePackagePrice { get; set; }
    public decimal ModulesPrice { get; set; }
    public decimal BundlePrice { get; set; }
    public decimal AddOnsPrice { get; set; }
    public decimal UserPrice { get; set; }
    public int IncludedUsers { get; set; }
    public int AdditionalUsers { get; set; }
    public decimal PricePerAdditionalUser { get; set; }
    public string? AppliedBundleCode { get; set; }
    public List<string> AppliedModuleCodes { get; set; } = new();
    public List<string> AppliedAddOnCodes { get; set; } = new();
}

public class UpgradePriceCalculation : SubscriptionPriceCalculation
{
    public Guid CurrentSubscriptionId { get; set; }
    public decimal CurrentMonthlyPrice { get; set; }
    public decimal NewMonthlyPrice { get; set; }
    public decimal ProratedAmount { get; set; } // Amount to charge/credit now
    public int DaysRemaining { get; set; }
    public bool IsUpgrade { get; set; } // true = upgrade, false = downgrade
    public DateTime EffectiveDate { get; set; }
}

#endregion
