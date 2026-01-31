using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.API.Controllers.Base;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;

namespace Stocker.API.Controllers.Master;

/// <summary>
/// Pricing management controller for admin panel.
/// Manages module pricing, bundles, and add-ons.
/// </summary>
[Route("api/master/pricing")]
[Authorize(Policy = "RequireMasterAccess")]
public class PricingController : ApiController
{
    private readonly IMasterDbContext _masterContext;
    private readonly IPricingService _pricingService;
    private readonly ILogger<PricingController> _logger;

    public PricingController(
        IMasterDbContext masterContext,
        IPricingService pricingService,
        ILogger<PricingController> logger)
    {
        _masterContext = masterContext;
        _pricingService = pricingService;
        _logger = logger;
    }

    #region Module Pricing

    /// <summary>
    /// Gets all module pricings for admin management.
    /// </summary>
    [HttpGet("modules")]
    [ProducesResponseType(typeof(ModulePricingListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetModulePricings(CancellationToken cancellationToken)
    {
        var pricings = await _masterContext.ModulePricing
            .OrderBy(p => p.DisplayOrder)
            .ToListAsync(cancellationToken);

        return Ok(new ModulePricingListResponse
        {
            Success = true,
            Modules = pricings.Select(p => new ModulePricingResponse
            {
                Id = p.Id,
                ModuleCode = p.ModuleCode,
                ModuleName = p.ModuleName,
                Description = p.Description,
                Icon = p.Icon,
                MonthlyPrice = p.MonthlyPrice.Amount,
                YearlyPrice = p.YearlyPrice.Amount,
                Currency = p.MonthlyPrice.Currency,
                IsCore = p.IsCore,
                IsActive = p.IsActive,
                TrialDays = p.TrialDays,
                DisplayOrder = p.DisplayOrder,
                IncludedFeatures = p.GetIncludedFeatures(),
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            }).ToList()
        });
    }

    /// <summary>
    /// Gets a specific module pricing by code.
    /// </summary>
    [HttpGet("modules/{moduleCode}")]
    [ProducesResponseType(typeof(ModulePricingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetModulePricing(string moduleCode, CancellationToken cancellationToken)
    {
        var pricing = await _masterContext.ModulePricing
            .FirstOrDefaultAsync(p => p.ModuleCode == moduleCode, cancellationToken);

        if (pricing == null)
        {
            return NotFound(new { success = false, error = "Modül fiyatlandırması bulunamadı" });
        }

        return Ok(new ModulePricingResponse
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
            IncludedFeatures = pricing.GetIncludedFeatures(),
            CreatedAt = pricing.CreatedAt,
            UpdatedAt = pricing.UpdatedAt
        });
    }

    /// <summary>
    /// Creates a new module pricing.
    /// </summary>
    [HttpPost("modules")]
    [ProducesResponseType(typeof(ModulePricingResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateModulePricing(
        [FromBody] CreateModulePricingRequest request,
        CancellationToken cancellationToken)
    {
        // Check if module code already exists
        var exists = await _masterContext.ModulePricing
            .AnyAsync(p => p.ModuleCode == request.ModuleCode, cancellationToken);

        if (exists)
        {
            return BadRequest(new { success = false, error = "Bu modül kodu zaten mevcut" });
        }

        var pricing = ModulePricing.Create(
            moduleCode: request.ModuleCode,
            moduleName: request.ModuleName,
            monthlyPrice: Money.Create(request.MonthlyPrice, request.Currency ?? "TRY"),
            yearlyPrice: Money.Create(request.YearlyPrice, request.Currency ?? "TRY"),
            description: request.Description,
            icon: request.Icon,
            isCore: request.IsCore,
            trialDays: request.TrialDays,
            displayOrder: request.DisplayOrder);

        if (request.IncludedFeatures?.Any() == true)
        {
            pricing.SetIncludedFeatures(request.IncludedFeatures);
        }

        await _masterContext.ModulePricing.AddAsync(pricing, cancellationToken);
        await _masterContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created module pricing for {ModuleCode}", request.ModuleCode);

        return CreatedAtAction(nameof(GetModulePricing), new { moduleCode = pricing.ModuleCode }, new ModulePricingResponse
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
            IncludedFeatures = pricing.GetIncludedFeatures(),
            CreatedAt = pricing.CreatedAt
        });
    }

    /// <summary>
    /// Updates a module pricing.
    /// </summary>
    [HttpPut("modules/{moduleCode}")]
    [ProducesResponseType(typeof(ModulePricingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateModulePricing(
        string moduleCode,
        [FromBody] UpdateModulePricingRequest request,
        CancellationToken cancellationToken)
    {
        var pricing = await _masterContext.ModulePricing
            .FirstOrDefaultAsync(p => p.ModuleCode == moduleCode, cancellationToken);

        if (pricing == null)
        {
            return NotFound(new { success = false, error = "Modül fiyatlandırması bulunamadı" });
        }

        pricing.Update(
            moduleName: request.ModuleName,
            monthlyPrice: Money.Create(request.MonthlyPrice, request.Currency ?? "TRY"),
            yearlyPrice: Money.Create(request.YearlyPrice, request.Currency ?? "TRY"),
            description: request.Description,
            icon: request.Icon,
            trialDays: request.TrialDays,
            displayOrder: request.DisplayOrder);

        if (request.IncludedFeatures != null)
        {
            pricing.SetIncludedFeatures(request.IncludedFeatures);
        }

        await _masterContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Updated module pricing for {ModuleCode}", moduleCode);

        return Ok(new ModulePricingResponse
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
            IncludedFeatures = pricing.GetIncludedFeatures(),
            CreatedAt = pricing.CreatedAt,
            UpdatedAt = pricing.UpdatedAt
        });
    }

    /// <summary>
    /// Activates or deactivates a module pricing.
    /// </summary>
    [HttpPatch("modules/{moduleCode}/status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetModulePricingStatus(
        string moduleCode,
        [FromBody] SetStatusRequest request,
        CancellationToken cancellationToken)
    {
        var pricing = await _masterContext.ModulePricing
            .FirstOrDefaultAsync(p => p.ModuleCode == moduleCode, cancellationToken);

        if (pricing == null)
        {
            return NotFound(new { success = false, error = "Modül fiyatlandırması bulunamadı" });
        }

        if (request.IsActive)
        {
            pricing.Activate();
        }
        else
        {
            pricing.Deactivate();
        }

        await _masterContext.SaveChangesAsync(cancellationToken);

        return Ok(new { success = true, isActive = pricing.IsActive });
    }

    #endregion

    #region Module Bundles

    /// <summary>
    /// Gets all module bundles for admin management.
    /// </summary>
    [HttpGet("bundles")]
    [ProducesResponseType(typeof(ModuleBundleListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetModuleBundles(CancellationToken cancellationToken)
    {
        var bundles = await _pricingService.GetModuleBundlesAsync(cancellationToken);

        return Ok(new ModuleBundleListResponse
        {
            Success = true,
            Bundles = bundles.Select(b => new ModuleBundleResponse
            {
                Id = b.Id,
                BundleCode = b.BundleCode,
                BundleName = b.BundleName,
                Description = b.Description,
                Icon = b.Icon,
                MonthlyPrice = b.MonthlyPrice,
                YearlyPrice = b.YearlyPrice,
                Currency = b.Currency,
                DiscountPercent = b.DiscountPercent,
                IsActive = b.IsActive,
                DisplayOrder = b.DisplayOrder,
                ModuleCodes = b.ModuleCodes,
                OriginalMonthlyPrice = b.OriginalMonthlyPrice,
                SavingsAmount = b.SavingsAmount
            }).ToList()
        });
    }

    /// <summary>
    /// Creates a new module bundle.
    /// </summary>
    [HttpPost("bundles")]
    [ProducesResponseType(typeof(ModuleBundleResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateModuleBundle(
        [FromBody] CreateModuleBundleRequest request,
        CancellationToken cancellationToken)
    {
        // Check if bundle code already exists
        var exists = await _masterContext.ModuleBundles
            .AnyAsync(b => b.BundleCode == request.BundleCode, cancellationToken);

        if (exists)
        {
            return BadRequest(new { success = false, error = "Bu paket kodu zaten mevcut" });
        }

        var bundle = ModuleBundle.Create(
            bundleCode: request.BundleCode,
            bundleName: request.BundleName,
            monthlyPrice: Money.Create(request.MonthlyPrice, request.Currency ?? "TRY"),
            yearlyPrice: Money.Create(request.YearlyPrice, request.Currency ?? "TRY"),
            discountPercent: request.DiscountPercent,
            description: request.Description,
            icon: request.Icon,
            displayOrder: request.DisplayOrder);

        foreach (var moduleCode in request.ModuleCodes)
        {
            bundle.AddModule(moduleCode);
        }

        await _masterContext.ModuleBundles.AddAsync(bundle, cancellationToken);
        await _masterContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created module bundle {BundleCode} with {ModuleCount} modules",
            request.BundleCode, request.ModuleCodes.Count);

        var bundleDto = await _pricingService.GetModuleBundleByCodeAsync(bundle.BundleCode, cancellationToken);

        return CreatedAtAction(nameof(GetModuleBundles), null, new ModuleBundleResponse
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
            ModuleCodes = bundleDto?.ModuleCodes ?? request.ModuleCodes,
            OriginalMonthlyPrice = bundleDto?.OriginalMonthlyPrice ?? 0,
            SavingsAmount = bundleDto?.SavingsAmount ?? 0
        });
    }

    /// <summary>
    /// Updates a module bundle.
    /// </summary>
    [HttpPut("bundles/{bundleCode}")]
    [ProducesResponseType(typeof(ModuleBundleResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateModuleBundle(
        string bundleCode,
        [FromBody] UpdateModuleBundleRequest request,
        CancellationToken cancellationToken)
    {
        var bundle = await _masterContext.ModuleBundles
            .Include(b => b.Modules)
            .FirstOrDefaultAsync(b => b.BundleCode == bundleCode, cancellationToken);

        if (bundle == null)
        {
            return NotFound(new { success = false, error = "Paket bulunamadı" });
        }

        bundle.Update(
            bundleName: request.BundleName,
            monthlyPrice: Money.Create(request.MonthlyPrice, request.Currency ?? "TRY"),
            yearlyPrice: Money.Create(request.YearlyPrice, request.Currency ?? "TRY"),
            discountPercent: request.DiscountPercent,
            description: request.Description,
            icon: request.Icon,
            displayOrder: request.DisplayOrder);

        // Update modules - remove old, add new
        var currentModules = bundle.Modules.Select(m => m.ModuleCode).ToList();
        var modulesToRemove = currentModules.Except(request.ModuleCodes).ToList();
        var modulesToAdd = request.ModuleCodes.Except(currentModules).ToList();

        foreach (var moduleCode in modulesToRemove)
        {
            bundle.RemoveModule(moduleCode);
        }

        foreach (var moduleCode in modulesToAdd)
        {
            bundle.AddModule(moduleCode);
        }

        await _masterContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Updated module bundle {BundleCode}", bundleCode);

        var bundleDto = await _pricingService.GetModuleBundleByCodeAsync(bundle.BundleCode, cancellationToken);

        return Ok(new ModuleBundleResponse
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
            ModuleCodes = bundleDto?.ModuleCodes ?? request.ModuleCodes,
            OriginalMonthlyPrice = bundleDto?.OriginalMonthlyPrice ?? 0,
            SavingsAmount = bundleDto?.SavingsAmount ?? 0
        });
    }

    /// <summary>
    /// Deletes a module bundle.
    /// </summary>
    [HttpDelete("bundles/{bundleCode}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteModuleBundle(string bundleCode, CancellationToken cancellationToken)
    {
        var bundle = await _masterContext.ModuleBundles
            .FirstOrDefaultAsync(b => b.BundleCode == bundleCode, cancellationToken);

        if (bundle == null)
        {
            return NotFound(new { success = false, error = "Paket bulunamadı" });
        }

        _masterContext.ModuleBundles.Remove(bundle);
        await _masterContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Deleted module bundle {BundleCode}", bundleCode);

        return Ok(new { success = true });
    }

    #endregion

    #region Add-ons

    /// <summary>
    /// Gets all add-ons for admin management.
    /// </summary>
    [HttpGet("addons")]
    [ProducesResponseType(typeof(AddOnListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAddOns(CancellationToken cancellationToken)
    {
        var addOns = await _pricingService.GetAddOnsAsync(null, cancellationToken);

        return Ok(new AddOnListResponse
        {
            Success = true,
            AddOns = addOns.Select(a => new AddOnResponse
            {
                Id = a.Id,
                Code = a.Code,
                Name = a.Name,
                Description = a.Description,
                Icon = a.Icon,
                Type = a.Type,
                MonthlyPrice = a.MonthlyPrice,
                YearlyPrice = a.YearlyPrice,
                Currency = a.Currency,
                IsActive = a.IsActive,
                DisplayOrder = a.DisplayOrder,
                Category = a.Category,
                RequiredModuleCode = a.RequiredModuleCode,
                Quantity = a.Quantity,
                QuantityUnit = a.QuantityUnit,
                Features = a.Features
            }).ToList()
        });
    }

    /// <summary>
    /// Updates an add-on.
    /// </summary>
    [HttpPut("addons/{code}")]
    [ProducesResponseType(typeof(AddOnResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAddOn(
        string code,
        [FromBody] UpdateAddOnRequest request,
        CancellationToken cancellationToken)
    {
        var addOn = await _masterContext.AddOns
            .FirstOrDefaultAsync(a => a.Code == code, cancellationToken);

        if (addOn == null)
        {
            return NotFound(new { success = false, error = "Add-on bulunamadı" });
        }

        addOn.Update(
            name: request.Name,
            type: Enum.Parse<AddOnType>(request.Type),
            monthlyPrice: Money.Create(request.MonthlyPrice, request.Currency ?? "TRY"),
            yearlyPrice: request.YearlyPrice.HasValue ? Money.Create(request.YearlyPrice.Value, request.Currency ?? "TRY") : null,
            description: request.Description,
            icon: request.Icon,
            displayOrder: request.DisplayOrder,
            category: request.Category,
            requiredModuleCode: request.RequiredModuleCode,
            quantity: request.Quantity,
            quantityUnit: request.QuantityUnit);

        await _masterContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Updated add-on {Code}", code);

        return Ok(new AddOnResponse
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
            QuantityUnit = addOn.QuantityUnit
        });
    }

    #endregion

    #region Price Calculation

    /// <summary>
    /// Calculates subscription price for preview.
    /// </summary>
    [HttpPost("calculate")]
    [AllowAnonymous] // Allow price preview without auth
    [ProducesResponseType(typeof(PriceCalculationResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> CalculatePrice(
        [FromBody] CalculatePriceRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _pricingService.CalculateSubscriptionPriceAsync(
            new SubscriptionPriceRequest
            {
                PackageId = request.PackageId,
                BundleCode = request.BundleCode,
                ModuleCodes = request.ModuleCodes ?? new List<string>(),
                AddOnCodes = request.AddOnCodes ?? new List<string>(),
                UserCount = request.UserCount,
                BillingCycle = request.BillingCycle == "yearly" ? BillingCycle.Yillik : BillingCycle.Aylik
            },
            cancellationToken);

        return Ok(new PriceCalculationResponse
        {
            Success = true,
            Subtotal = result.Subtotal,
            Discount = result.Discount,
            Tax = result.Tax,
            Total = result.Total,
            Currency = result.Currency,
            BillingCycle = result.BillingCycle.ToString(),
            BasePackagePrice = result.BasePackagePrice,
            ModulesPrice = result.ModulesPrice,
            BundlePrice = result.BundlePrice,
            AddOnsPrice = result.AddOnsPrice,
            UserPrice = result.UserPrice,
            IncludedUsers = result.IncludedUsers,
            AdditionalUsers = result.AdditionalUsers,
            PricePerAdditionalUser = result.PricePerAdditionalUser,
            LineItems = result.LineItems.Select(li => new PriceLineItemResponse
            {
                Code = li.Code,
                Name = li.Name,
                Type = li.Type,
                UnitPrice = li.UnitPrice,
                Quantity = li.Quantity,
                TotalPrice = li.TotalPrice
            }).ToList()
        });
    }

    #endregion
}

#region DTOs

public class ModulePricingListResponse
{
    public bool Success { get; set; }
    public List<ModulePricingResponse> Modules { get; set; } = new();
}

public class ModulePricingResponse
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
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateModulePricingRequest
{
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }
    public string? Currency { get; set; }
    public bool IsCore { get; set; }
    public int? TrialDays { get; set; }
    public int DisplayOrder { get; set; }
    public string[]? IncludedFeatures { get; set; }
}

public class UpdateModulePricingRequest
{
    public string ModuleName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }
    public string? Currency { get; set; }
    public int? TrialDays { get; set; }
    public int DisplayOrder { get; set; }
    public string[]? IncludedFeatures { get; set; }
}

public class SetStatusRequest
{
    public bool IsActive { get; set; }
}

public class ModuleBundleListResponse
{
    public bool Success { get; set; }
    public List<ModuleBundleResponse> Bundles { get; set; } = new();
}

public class ModuleBundleResponse
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
    public decimal OriginalMonthlyPrice { get; set; }
    public decimal SavingsAmount { get; set; }
}

public class CreateModuleBundleRequest
{
    public string BundleCode { get; set; } = string.Empty;
    public string BundleName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }
    public string? Currency { get; set; }
    public decimal DiscountPercent { get; set; }
    public int DisplayOrder { get; set; }
    public List<string> ModuleCodes { get; set; } = new();
}

public class UpdateModuleBundleRequest
{
    public string BundleName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }
    public string? Currency { get; set; }
    public decimal DiscountPercent { get; set; }
    public int DisplayOrder { get; set; }
    public List<string> ModuleCodes { get; set; } = new();
}

public class AddOnListResponse
{
    public bool Success { get; set; }
    public List<AddOnResponse> AddOns { get; set; } = new();
}

public class AddOnResponse
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

public class UpdateAddOnRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal MonthlyPrice { get; set; }
    public decimal? YearlyPrice { get; set; }
    public string? Currency { get; set; }
    public int DisplayOrder { get; set; }
    public string? Category { get; set; }
    public string? RequiredModuleCode { get; set; }
    public int? Quantity { get; set; }
    public string? QuantityUnit { get; set; }
}

public class CalculatePriceRequest
{
    public Guid? PackageId { get; set; }
    public string? BundleCode { get; set; }
    public List<string>? ModuleCodes { get; set; }
    public List<string>? AddOnCodes { get; set; }
    public int UserCount { get; set; } = 1;
    public string BillingCycle { get; set; } = "monthly";
}

public class PriceCalculationResponse
{
    public bool Success { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public string Currency { get; set; } = "TRY";
    public string BillingCycle { get; set; } = string.Empty;
    public decimal BasePackagePrice { get; set; }
    public decimal ModulesPrice { get; set; }
    public decimal BundlePrice { get; set; }
    public decimal AddOnsPrice { get; set; }
    public decimal UserPrice { get; set; }
    public int IncludedUsers { get; set; }
    public int AdditionalUsers { get; set; }
    public decimal PricePerAdditionalUser { get; set; }
    public List<PriceLineItemResponse> LineItems { get; set; } = new();
}

public class PriceLineItemResponse
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
}

#endregion
