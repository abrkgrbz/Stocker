using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;

namespace Stocker.Infrastructure.Services.Pricing;

/// <summary>
/// Implementation of pricing calculation service
/// </summary>
public class PricingService : IPricingService
{
    private readonly IMasterDbContext _masterContext;
    private readonly ILogger<PricingService> _logger;
    private const decimal TAX_RATE = 0.20m; // 20% KDV

    public PricingService(IMasterDbContext masterContext, ILogger<PricingService> logger)
    {
        _masterContext = masterContext;
        _logger = logger;
    }

    #region Module Pricing

    public async Task<IReadOnlyList<ModulePricingDto>> GetModulePricingsAsync(CancellationToken cancellationToken = default)
    {
        var pricings = await _masterContext.ModulePricing
            .Where(p => p.IsActive)
            .OrderBy(p => p.DisplayOrder)
            .ToListAsync(cancellationToken);

        return pricings.Select(MapToModulePricingDto).ToList();
    }

    public async Task<ModulePricingDto?> GetModulePricingByCodeAsync(string moduleCode, CancellationToken cancellationToken = default)
    {
        var pricing = await _masterContext.ModulePricing
            .FirstOrDefaultAsync(p => p.ModuleCode == moduleCode && p.IsActive, cancellationToken);

        return pricing != null ? MapToModulePricingDto(pricing) : null;
    }

    public async Task<PriceCalculationResult> CalculateModulesPriceAsync(
        IEnumerable<string> moduleCodes,
        BillingCycle billingCycle,
        CancellationToken cancellationToken = default)
    {
        var codes = moduleCodes.ToList();
        var pricings = await _masterContext.ModulePricing
            .Where(p => codes.Contains(p.ModuleCode) && p.IsActive)
            .ToListAsync(cancellationToken);

        var lineItems = new List<PriceLineItem>();
        decimal subtotal = 0;

        foreach (var pricing in pricings)
        {
            var price = billingCycle == BillingCycle.Yillik
                ? pricing.YearlyPrice.Amount
                : pricing.MonthlyPrice.Amount;

            lineItems.Add(new PriceLineItem
            {
                Code = pricing.ModuleCode,
                Name = pricing.ModuleName,
                Type = "Module",
                UnitPrice = price,
                Quantity = 1,
                TotalPrice = price
            });

            subtotal += price;
        }

        var tax = subtotal * TAX_RATE;

        return new PriceCalculationResult
        {
            Subtotal = subtotal,
            Discount = 0,
            Tax = tax,
            Total = subtotal + tax,
            Currency = "TRY",
            BillingCycle = billingCycle,
            LineItems = lineItems
        };
    }

    #endregion

    #region Bundle Pricing

    public async Task<IReadOnlyList<ModuleBundleDto>> GetModuleBundlesAsync(CancellationToken cancellationToken = default)
    {
        var bundles = await _masterContext.ModuleBundles
            .Include(b => b.Modules)
            .Where(b => b.IsActive)
            .OrderBy(b => b.DisplayOrder)
            .ToListAsync(cancellationToken);

        var modulePricings = await _masterContext.ModulePricing
            .Where(p => p.IsActive)
            .ToListAsync(cancellationToken);

        return bundles.Select(b => MapToModuleBundleDto(b, modulePricings)).ToList();
    }

    public async Task<ModuleBundleDto?> GetModuleBundleByCodeAsync(string bundleCode, CancellationToken cancellationToken = default)
    {
        var bundle = await _masterContext.ModuleBundles
            .Include(b => b.Modules)
            .FirstOrDefaultAsync(b => b.BundleCode == bundleCode && b.IsActive, cancellationToken);

        if (bundle == null) return null;

        var modulePricings = await _masterContext.ModulePricing
            .Where(p => p.IsActive)
            .ToListAsync(cancellationToken);

        return MapToModuleBundleDto(bundle, modulePricings);
    }

    public async Task<BundlePriceCalculation> CalculateBundlePriceAsync(
        string bundleCode,
        BillingCycle billingCycle,
        CancellationToken cancellationToken = default)
    {
        var bundle = await _masterContext.ModuleBundles
            .Include(b => b.Modules)
            .FirstOrDefaultAsync(b => b.BundleCode == bundleCode && b.IsActive, cancellationToken);

        if (bundle == null)
        {
            return new BundlePriceCalculation
            {
                BundleCode = bundleCode,
                Total = 0
            };
        }

        var moduleCodes = bundle.Modules.Select(m => m.ModuleCode).ToList();
        var modulePricings = await _masterContext.ModulePricing
            .Where(p => moduleCodes.Contains(p.ModuleCode) && p.IsActive)
            .ToListAsync(cancellationToken);

        // Calculate original price (if bought separately)
        decimal originalPrice = modulePricings.Sum(p =>
            billingCycle == BillingCycle.Yillik ? p.YearlyPrice.Amount : p.MonthlyPrice.Amount);

        // Bundle price
        decimal bundlePrice = billingCycle == BillingCycle.Yillik
            ? bundle.YearlyPrice.Amount
            : bundle.MonthlyPrice.Amount;

        decimal savingsAmount = originalPrice - bundlePrice;
        decimal savingsPercent = originalPrice > 0 ? (savingsAmount / originalPrice) * 100 : 0;
        decimal tax = bundlePrice * TAX_RATE;

        return new BundlePriceCalculation
        {
            BundleCode = bundle.BundleCode,
            BundleName = bundle.BundleName,
            Subtotal = bundlePrice,
            Discount = savingsAmount,
            Tax = tax,
            Total = bundlePrice + tax,
            Currency = "TRY",
            BillingCycle = billingCycle,
            OriginalPrice = originalPrice,
            SavingsAmount = savingsAmount,
            SavingsPercent = Math.Round(savingsPercent, 1),
            IncludedModules = moduleCodes,
            LineItems = new List<PriceLineItem>
            {
                new()
                {
                    Code = bundle.BundleCode,
                    Name = bundle.BundleName,
                    Type = "Bundle",
                    UnitPrice = bundlePrice,
                    Quantity = 1,
                    TotalPrice = bundlePrice
                }
            }
        };
    }

    #endregion

    #region Add-on Pricing

    public async Task<IReadOnlyList<AddOnPricingDto>> GetAddOnsAsync(string? moduleCode = null, CancellationToken cancellationToken = default)
    {
        var query = _masterContext.AddOns.Where(a => a.IsActive);

        if (!string.IsNullOrEmpty(moduleCode))
        {
            query = query.Where(a => a.RequiredModuleCode == null || a.RequiredModuleCode == moduleCode);
        }

        var addOns = await query
            .Include(a => a.Features)
            .OrderBy(a => a.DisplayOrder)
            .ToListAsync(cancellationToken);

        return addOns.Select(MapToAddOnPricingDto).ToList();
    }

    public async Task<PriceCalculationResult> CalculateAddOnsPriceAsync(
        IEnumerable<string> addOnCodes,
        BillingCycle billingCycle,
        CancellationToken cancellationToken = default)
    {
        var codes = addOnCodes.ToList();
        var addOns = await _masterContext.AddOns
            .Where(a => codes.Contains(a.Code) && a.IsActive)
            .ToListAsync(cancellationToken);

        var lineItems = new List<PriceLineItem>();
        decimal subtotal = 0;

        foreach (var addOn in addOns)
        {
            var price = billingCycle == BillingCycle.Yillik && addOn.YearlyPrice != null
                ? addOn.YearlyPrice.Amount
                : addOn.MonthlyPrice.Amount;

            lineItems.Add(new PriceLineItem
            {
                Code = addOn.Code,
                Name = addOn.Name,
                Type = "AddOn",
                UnitPrice = price,
                Quantity = 1,
                TotalPrice = price
            });

            subtotal += price;
        }

        var tax = subtotal * TAX_RATE;

        return new PriceCalculationResult
        {
            Subtotal = subtotal,
            Discount = 0,
            Tax = tax,
            Total = subtotal + tax,
            Currency = "TRY",
            BillingCycle = billingCycle,
            LineItems = lineItems
        };
    }

    #endregion

    #region Combined Calculations

    public async Task<SubscriptionPriceCalculation> CalculateSubscriptionPriceAsync(
        SubscriptionPriceRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = new SubscriptionPriceCalculation
        {
            BillingCycle = request.BillingCycle,
            Currency = "TRY",
            AppliedModuleCodes = request.ModuleCodes,
            AppliedAddOnCodes = request.AddOnCodes,
            AppliedBundleCode = request.BundleCode
        };

        var lineItems = new List<PriceLineItem>();

        // 1. Base Package Price
        if (request.PackageId.HasValue)
        {
            var package = await _masterContext.Packages
                .FirstOrDefaultAsync(p => p.Id == request.PackageId.Value, cancellationToken);

            if (package != null)
            {
                var packagePrice = request.BillingCycle == BillingCycle.Yillik
                    ? package.BasePrice.Amount * 10 // 2 months free
                    : package.BasePrice.Amount;

                result.BasePackagePrice = packagePrice;
                result.IncludedUsers = package.Limits.MaxUsers;
                result.PricePerAdditionalUser = package.PricePerUser?.Amount ?? 29m;

                lineItems.Add(new PriceLineItem
                {
                    Code = package.Id.ToString(),
                    Name = package.Name,
                    Type = "Package",
                    UnitPrice = packagePrice,
                    Quantity = 1,
                    TotalPrice = packagePrice
                });
            }
        }

        // 2. Bundle Price (if selected)
        if (!string.IsNullOrEmpty(request.BundleCode))
        {
            var bundleCalc = await CalculateBundlePriceAsync(request.BundleCode, request.BillingCycle, cancellationToken);
            result.BundlePrice = bundleCalc.Subtotal;
            lineItems.AddRange(bundleCalc.LineItems);

            // Remove modules that are in the bundle from individual module calculation
            var bundleModules = bundleCalc.IncludedModules;
            request.ModuleCodes = request.ModuleCodes.Where(m => !bundleModules.Contains(m)).ToList();
        }

        // 3. Individual Modules Price
        if (request.ModuleCodes.Any())
        {
            var modulesCalc = await CalculateModulesPriceAsync(request.ModuleCodes, request.BillingCycle, cancellationToken);
            result.ModulesPrice = modulesCalc.Subtotal;
            lineItems.AddRange(modulesCalc.LineItems);
        }

        // 4. Add-ons Price
        if (request.AddOnCodes.Any())
        {
            var addOnsCalc = await CalculateAddOnsPriceAsync(request.AddOnCodes, request.BillingCycle, cancellationToken);
            result.AddOnsPrice = addOnsCalc.Subtotal;
            lineItems.AddRange(addOnsCalc.LineItems);
        }

        // 5. Additional Users Price
        if (request.UserCount > result.IncludedUsers)
        {
            result.AdditionalUsers = request.UserCount - result.IncludedUsers;
            var userPrice = result.PricePerAdditionalUser * result.AdditionalUsers;

            if (request.BillingCycle == BillingCycle.Yillik)
            {
                userPrice = userPrice * 10; // 2 months free for users too
            }

            result.UserPrice = userPrice;

            lineItems.Add(new PriceLineItem
            {
                Code = "ADDITIONAL_USERS",
                Name = $"Ek Kullanıcı ({result.AdditionalUsers} kişi)",
                Type = "User",
                UnitPrice = result.PricePerAdditionalUser,
                Quantity = result.AdditionalUsers,
                TotalPrice = userPrice
            });
        }

        // Calculate totals
        result.Subtotal = result.BasePackagePrice + result.BundlePrice + result.ModulesPrice + result.AddOnsPrice + result.UserPrice;
        result.Tax = result.Subtotal * TAX_RATE;
        result.Total = result.Subtotal + result.Tax;
        result.LineItems = lineItems;

        return result;
    }

    public async Task<UpgradePriceCalculation> CalculateUpgradePriceAsync(
        Guid currentSubscriptionId,
        SubscriptionPriceRequest newConfiguration,
        CancellationToken cancellationToken = default)
    {
        // Get current subscription
        var currentSubscription = await _masterContext.Subscriptions
            .Include(s => s.Package)
            .FirstOrDefaultAsync(s => s.Id == currentSubscriptionId, cancellationToken);

        if (currentSubscription == null)
        {
            throw new InvalidOperationException("Subscription not found");
        }

        // Calculate new price
        var newPriceCalc = await CalculateSubscriptionPriceAsync(newConfiguration, cancellationToken);

        // Current monthly price
        var currentMonthlyPrice = currentSubscription.Package?.BasePrice.Amount ?? 0;

        // Calculate proration
        var renewsAt = currentSubscription.CurrentPeriodEnd != default
            ? currentSubscription.CurrentPeriodEnd
            : DateTime.UtcNow.AddMonths(1);
        var daysRemaining = (int)(renewsAt - DateTime.UtcNow).TotalDays;
        var daysInPeriod = currentSubscription.BillingCycle == BillingCycle.Yillik ? 365 : 30;

        var newMonthlyEquivalent = newConfiguration.BillingCycle == BillingCycle.Yillik
            ? newPriceCalc.Total / 12
            : newPriceCalc.Total;

        var proratedAmount = ((newMonthlyEquivalent - currentMonthlyPrice) / daysInPeriod) * daysRemaining;

        var result = new UpgradePriceCalculation
        {
            // Copy from new calculation
            Subtotal = newPriceCalc.Subtotal,
            Discount = newPriceCalc.Discount,
            Tax = newPriceCalc.Tax,
            Total = newPriceCalc.Total,
            Currency = newPriceCalc.Currency,
            BillingCycle = newPriceCalc.BillingCycle,
            LineItems = newPriceCalc.LineItems,
            BasePackagePrice = newPriceCalc.BasePackagePrice,
            ModulesPrice = newPriceCalc.ModulesPrice,
            BundlePrice = newPriceCalc.BundlePrice,
            AddOnsPrice = newPriceCalc.AddOnsPrice,
            UserPrice = newPriceCalc.UserPrice,
            IncludedUsers = newPriceCalc.IncludedUsers,
            AdditionalUsers = newPriceCalc.AdditionalUsers,
            PricePerAdditionalUser = newPriceCalc.PricePerAdditionalUser,
            AppliedBundleCode = newPriceCalc.AppliedBundleCode,
            AppliedModuleCodes = newPriceCalc.AppliedModuleCodes,
            AppliedAddOnCodes = newPriceCalc.AppliedAddOnCodes,

            // Upgrade specific
            CurrentSubscriptionId = currentSubscriptionId,
            CurrentMonthlyPrice = currentMonthlyPrice,
            NewMonthlyPrice = newMonthlyEquivalent,
            ProratedAmount = Math.Max(0, proratedAmount), // Don't charge negative (credit handled separately)
            DaysRemaining = daysRemaining,
            IsUpgrade = newMonthlyEquivalent > currentMonthlyPrice,
            EffectiveDate = DateTime.UtcNow
        };

        return result;
    }

    public async Task<IReadOnlyList<string>> GetRecommendedModulesAsync(string industryCode, CancellationToken cancellationToken = default)
    {
        var industry = await _masterContext.Industries
            .Include(i => i.RecommendedModules)
            .FirstOrDefaultAsync(i => i.Code == industryCode && i.IsActive, cancellationToken);

        if (industry == null)
        {
            return Array.Empty<string>();
        }

        return industry.RecommendedModules.Select(m => m.ModuleCode).ToList();
    }

    #endregion

    #region Mapping Helpers

    private static ModulePricingDto MapToModulePricingDto(ModulePricing pricing)
    {
        return new ModulePricingDto
        {
            Id = pricing.Id,
            ModuleCode = pricing.ModuleCode,
            ModuleName = pricing.ModuleName,
            Description = pricing.Description,
            Icon = pricing.Icon,
            MonthlyPrice = pricing.MonthlyPrice.Amount,
            YearlyPrice = pricing.YearlyPrice.Amount,
            Currency = pricing.MonthlyPrice.Currency,
            IsCore = pricing.IsCore,
            IsActive = pricing.IsActive,
            TrialDays = pricing.TrialDays,
            DisplayOrder = pricing.DisplayOrder,
            IncludedFeatures = pricing.GetIncludedFeatures()
        };
    }

    private static ModuleBundleDto MapToModuleBundleDto(ModuleBundle bundle, List<ModulePricing> modulePricings)
    {
        var moduleCodes = bundle.Modules.Select(m => m.ModuleCode).ToList();

        // Calculate original price
        var originalMonthlyPrice = modulePricings
            .Where(p => moduleCodes.Contains(p.ModuleCode))
            .Sum(p => p.MonthlyPrice.Amount);

        var savingsAmount = originalMonthlyPrice - bundle.MonthlyPrice.Amount;

        return new ModuleBundleDto
        {
            Id = bundle.Id,
            BundleCode = bundle.BundleCode,
            BundleName = bundle.BundleName,
            Description = bundle.Description,
            Icon = bundle.Icon,
            MonthlyPrice = bundle.MonthlyPrice.Amount,
            YearlyPrice = bundle.YearlyPrice.Amount,
            Currency = bundle.MonthlyPrice.Currency,
            DiscountPercent = bundle.DiscountPercent,
            IsActive = bundle.IsActive,
            DisplayOrder = bundle.DisplayOrder,
            ModuleCodes = moduleCodes,
            OriginalMonthlyPrice = originalMonthlyPrice,
            SavingsAmount = savingsAmount
        };
    }

    private static AddOnPricingDto MapToAddOnPricingDto(AddOn addOn)
    {
        return new AddOnPricingDto
        {
            Id = addOn.Id,
            Code = addOn.Code,
            Name = addOn.Name,
            Description = addOn.Description,
            Icon = addOn.Icon,
            Type = addOn.Type.ToString(),
            MonthlyPrice = addOn.MonthlyPrice.Amount,
            YearlyPrice = addOn.YearlyPrice?.Amount,
            Currency = addOn.MonthlyPrice.Currency,
            IsActive = addOn.IsActive,
            DisplayOrder = addOn.DisplayOrder,
            Category = addOn.Category,
            RequiredModuleCode = addOn.RequiredModuleCode,
            Quantity = addOn.Quantity,
            QuantityUnit = addOn.QuantityUnit,
            Features = addOn.Features.Select(f => f.FeatureName).ToList()
        };
    }

    #endregion
}
