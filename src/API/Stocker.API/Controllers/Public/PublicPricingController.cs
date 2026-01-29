using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.API.Controllers.Base;
using Stocker.Application.Common.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Public;

/// <summary>
/// Public pricing endpoints - No authentication required
/// These endpoints allow visitors to view pricing information before signing up
/// </summary>
[AllowAnonymous]
[ApiController]
[Route("api/public/pricing")]
[SwaggerTag("Public - Pricing Information (No Auth Required)")]
public class PublicPricingController : ApiController
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<PublicPricingController> _logger;

    public PublicPricingController(
        IMasterDbContext context,
        ILogger<PublicPricingController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all active module pricings
    /// </summary>
    [HttpGet("modules")]
    [SwaggerOperation(Summary = "Get module pricing list", Description = "Returns all active modules with their pricing information")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetModules()
    {
        var modules = await _context.ModulePricing
            .AsNoTracking()
            .Where(m => m.IsActive)
            .OrderBy(m => m.DisplayOrder)
            .Select(m => new
            {
                id = m.Id,
                moduleCode = m.ModuleCode,
                moduleName = m.ModuleName,
                description = m.Description,
                icon = m.IconName,
                monthlyPrice = m.MonthlyPrice.Amount,
                yearlyPrice = m.YearlyPrice.Amount,
                currency = m.MonthlyPrice.Currency,
                isCore = m.IsCore,
                trialDays = m.TrialDays,
                displayOrder = m.DisplayOrder,
                includedFeatures = m.IncludedFeatures ?? new List<string>()
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            modules
        });
    }

    /// <summary>
    /// Get all active module bundles
    /// </summary>
    [HttpGet("bundles")]
    [SwaggerOperation(Summary = "Get bundle pricing list", Description = "Returns all active bundles with included modules and pricing")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBundles()
    {
        var bundles = await _context.ModuleBundles
            .AsNoTracking()
            .Include(b => b.Modules)
            .Where(b => b.IsActive)
            .OrderBy(b => b.DisplayOrder)
            .ToListAsync();

        var result = bundles.Select(b => new
        {
            id = b.Id,
            bundleCode = b.BundleCode,
            bundleName = b.BundleName,
            description = b.Description,
            icon = b.IconName,
            monthlyPrice = b.MonthlyPrice.Amount,
            yearlyPrice = b.YearlyPrice.Amount,
            currency = b.MonthlyPrice.Currency,
            discountPercent = b.DiscountPercent,
            displayOrder = b.DisplayOrder,
            moduleCodes = b.Modules.Select(m => m.ModuleCode).ToList(),
            originalMonthlyPrice = b.OriginalMonthlyPrice?.Amount ?? 0,
            savingsAmount = b.SavingsAmount?.Amount ?? 0
        });

        return Ok(new
        {
            success = true,
            bundles = result
        });
    }

    /// <summary>
    /// Get all active add-ons
    /// </summary>
    [HttpGet("addons")]
    [SwaggerOperation(Summary = "Get add-on pricing list", Description = "Returns all active add-ons with their pricing")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAddOns([FromQuery] string? moduleCode = null)
    {
        var query = _context.AddOns
            .AsNoTracking()
            .Where(a => a.IsActive);

        if (!string.IsNullOrEmpty(moduleCode))
        {
            query = query.Where(a => a.RequiredModuleCode == null || a.RequiredModuleCode == moduleCode);
        }

        var addOns = await query
            .OrderBy(a => a.DisplayOrder)
            .Select(a => new
            {
                id = a.Id,
                code = a.Code,
                name = a.Name,
                description = a.Description,
                icon = a.IconName,
                type = a.Type.ToString(),
                monthlyPrice = a.MonthlyPrice.Amount,
                yearlyPrice = a.YearlyPrice != null ? a.YearlyPrice.Amount : (decimal?)null,
                currency = a.MonthlyPrice.Currency,
                displayOrder = a.DisplayOrder,
                category = a.Category,
                requiredModuleCode = a.RequiredModuleCode,
                quantity = a.Quantity,
                quantityUnit = a.QuantityUnit,
                features = a.Features ?? new List<string>()
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            addOns
        });
    }

    /// <summary>
    /// Get full pricing information (modules, bundles, and add-ons)
    /// </summary>
    [HttpGet]
    [SwaggerOperation(Summary = "Get full pricing information", Description = "Returns all modules, bundles, and add-ons in a single response")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFullPricing()
    {
        // Get modules
        var modules = await _context.ModulePricing
            .AsNoTracking()
            .Where(m => m.IsActive)
            .OrderBy(m => m.DisplayOrder)
            .Select(m => new
            {
                id = m.Id,
                moduleCode = m.ModuleCode,
                moduleName = m.ModuleName,
                description = m.Description,
                icon = m.IconName,
                monthlyPrice = m.MonthlyPrice.Amount,
                yearlyPrice = m.YearlyPrice.Amount,
                currency = m.MonthlyPrice.Currency,
                isCore = m.IsCore,
                trialDays = m.TrialDays,
                displayOrder = m.DisplayOrder,
                includedFeatures = m.IncludedFeatures ?? new List<string>()
            })
            .ToListAsync();

        // Get bundles
        var bundlesRaw = await _context.ModuleBundles
            .AsNoTracking()
            .Include(b => b.Modules)
            .Where(b => b.IsActive)
            .OrderBy(b => b.DisplayOrder)
            .ToListAsync();

        var bundles = bundlesRaw.Select(b => new
        {
            id = b.Id,
            bundleCode = b.BundleCode,
            bundleName = b.BundleName,
            description = b.Description,
            icon = b.IconName,
            monthlyPrice = b.MonthlyPrice.Amount,
            yearlyPrice = b.YearlyPrice.Amount,
            currency = b.MonthlyPrice.Currency,
            discountPercent = b.DiscountPercent,
            displayOrder = b.DisplayOrder,
            moduleCodes = b.Modules.Select(m => m.ModuleCode).ToList(),
            originalMonthlyPrice = b.OriginalMonthlyPrice?.Amount ?? 0,
            savingsAmount = b.SavingsAmount?.Amount ?? 0
        });

        // Get add-ons
        var addOns = await _context.AddOns
            .AsNoTracking()
            .Where(a => a.IsActive)
            .OrderBy(a => a.DisplayOrder)
            .Select(a => new
            {
                id = a.Id,
                code = a.Code,
                name = a.Name,
                description = a.Description,
                icon = a.IconName,
                type = a.Type.ToString(),
                monthlyPrice = a.MonthlyPrice.Amount,
                yearlyPrice = a.YearlyPrice != null ? a.YearlyPrice.Amount : (decimal?)null,
                currency = a.MonthlyPrice.Currency,
                displayOrder = a.DisplayOrder,
                category = a.Category,
                requiredModuleCode = a.RequiredModuleCode,
                quantity = a.Quantity,
                quantityUnit = a.QuantityUnit,
                features = a.Features ?? new List<string>()
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            modules,
            bundles,
            addOns
        });
    }

    /// <summary>
    /// Calculate price preview for selected items
    /// </summary>
    [HttpPost("calculate")]
    [SwaggerOperation(Summary = "Calculate subscription price", Description = "Calculate total price for selected modules, bundles, add-ons and user count")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> CalculatePrice([FromBody] CalculatePriceRequest request)
    {
        const decimal TAX_RATE = 0.20m; // 20% KDV
        const decimal YEARLY_DISCOUNT = 0.20m; // 20% yearly discount

        decimal subtotal = 0;
        decimal bundlePrice = 0;
        decimal modulesPrice = 0;
        decimal addOnsPrice = 0;
        decimal userPrice = 0;
        int includedUsers = 1;
        decimal pricePerAdditionalUser = 29m; // Default per-user price

        var lineItems = new List<object>();
        var isYearly = request.BillingCycle?.ToLower() == "yearly";

        // Calculate bundle price if selected
        if (!string.IsNullOrEmpty(request.BundleCode))
        {
            var bundle = await _context.ModuleBundles
                .AsNoTracking()
                .Include(b => b.Modules)
                .FirstOrDefaultAsync(b => b.BundleCode == request.BundleCode && b.IsActive);

            if (bundle != null)
            {
                var price = isYearly ? bundle.YearlyPrice.Amount : bundle.MonthlyPrice.Amount;
                bundlePrice = price;
                subtotal += price;

                lineItems.Add(new
                {
                    code = bundle.BundleCode,
                    name = bundle.BundleName,
                    type = "Bundle",
                    unitPrice = price,
                    quantity = 1,
                    totalPrice = price
                });

                // Bundles typically include more users
                includedUsers = 5;
            }
        }

        // Calculate individual module prices if no bundle
        if (request.ModuleCodes?.Any() == true && string.IsNullOrEmpty(request.BundleCode))
        {
            var modules = await _context.ModulePricing
                .AsNoTracking()
                .Where(m => request.ModuleCodes.Contains(m.ModuleCode) && m.IsActive)
                .ToListAsync();

            foreach (var module in modules)
            {
                var price = isYearly ? module.YearlyPrice.Amount : module.MonthlyPrice.Amount;
                modulesPrice += price;
                subtotal += price;

                lineItems.Add(new
                {
                    code = module.ModuleCode,
                    name = module.ModuleName,
                    type = "Module",
                    unitPrice = price,
                    quantity = 1,
                    totalPrice = price
                });
            }
        }

        // Calculate add-on prices
        if (request.AddOnCodes?.Any() == true)
        {
            var addOns = await _context.AddOns
                .AsNoTracking()
                .Where(a => request.AddOnCodes.Contains(a.Code) && a.IsActive)
                .ToListAsync();

            foreach (var addOn in addOns)
            {
                var price = isYearly && addOn.YearlyPrice != null
                    ? addOn.YearlyPrice.Amount
                    : addOn.MonthlyPrice.Amount;
                addOnsPrice += price;
                subtotal += price;

                lineItems.Add(new
                {
                    code = addOn.Code,
                    name = addOn.Name,
                    type = "AddOn",
                    unitPrice = price,
                    quantity = 1,
                    totalPrice = price
                });
            }
        }

        // Calculate additional user cost
        var additionalUsers = Math.Max(0, request.UserCount - includedUsers);
        if (additionalUsers > 0)
        {
            userPrice = additionalUsers * pricePerAdditionalUser;
            subtotal += userPrice;

            lineItems.Add(new
            {
                code = "ADDITIONAL_USERS",
                name = $"Ek Kullanıcı ({additionalUsers} kişi)",
                type = "Users",
                unitPrice = pricePerAdditionalUser,
                quantity = additionalUsers,
                totalPrice = userPrice
            });
        }

        // Calculate discount (already applied in yearly prices, but show it)
        decimal discount = 0;
        if (isYearly)
        {
            // Calculate what monthly total would be
            var monthlyEquivalent = subtotal / (1 - YEARLY_DISCOUNT);
            discount = monthlyEquivalent - subtotal;
        }

        // Calculate tax
        var tax = subtotal * TAX_RATE;
        var total = subtotal + tax;

        return Ok(new
        {
            success = true,
            subtotal,
            discount,
            tax,
            total,
            currency = "TRY",
            billingCycle = isYearly ? "Yıllık" : "Aylık",
            basePackagePrice = 0m,
            modulesPrice,
            bundlePrice,
            addOnsPrice,
            userPrice,
            includedUsers,
            additionalUsers,
            pricePerAdditionalUser,
            lineItems
        });
    }
}

public class CalculatePriceRequest
{
    public string? PackageId { get; set; }
    public string? BundleCode { get; set; }
    public List<string>? ModuleCodes { get; set; }
    public List<string>? AddOnCodes { get; set; }
    public int UserCount { get; set; } = 1;
    public string? BillingCycle { get; set; } = "monthly";
}
