using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.API.Controllers.Base;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Services;
using Stocker.Domain.Master.Entities;

namespace Stocker.API.Controllers.Tenant;

/// <summary>
/// Manages billing and subscription operations for tenants.
/// Integrates with Lemon Squeezy and Iyzico for payment processing.
/// This is a tenant-scoped controller - tenant resolution is handled by middleware.
/// </summary>
[Route("api/tenant/billing")]
[Authorize]
public class BillingController : ApiController
{
    private readonly ILemonSqueezyService _lemonSqueezyService;
    private readonly IIyzicoService _iyzicoService;
    private readonly IPricingService _pricingService;
    private readonly IMasterDbContext _masterContext;
    private readonly ILogger<BillingController> _logger;

    public BillingController(
        ILemonSqueezyService lemonSqueezyService,
        IIyzicoService iyzicoService,
        IPricingService pricingService,
        IMasterDbContext masterContext,
        ILogger<BillingController> logger)
    {
        _lemonSqueezyService = lemonSqueezyService;
        _iyzicoService = iyzicoService;
        _pricingService = pricingService;
        _masterContext = masterContext;
        _logger = logger;
    }

    #region Checkout

    /// <summary>
    /// Creates a checkout session for subscription purchase.
    /// </summary>
    /// <param name="request">Checkout request details</param>
    /// <returns>Checkout URL to redirect user</returns>
    [HttpPost("checkout")]
    [ProducesResponseType(typeof(CheckoutResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCheckout(
        [FromBody] CreateCheckoutRequestDto request,
        CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        if (!tenantId.HasValue)
        {
            return BadRequest(new { success = false, error = "Tenant bilgisi bulunamadı" });
        }

        var userEmail = GetUserEmail();
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest(new { success = false, error = "Kullanıcı email bilgisi bulunamadı" });
        }

        var checkoutRequest = new CreateCheckoutRequest
        {
            TenantId = tenantId.Value,
            VariantId = request.VariantId,
            CustomerEmail = userEmail,
            CustomerName = request.CustomerName,
            SuccessUrl = request.SuccessUrl,
            CancelUrl = request.CancelUrl
        };

        var result = await _lemonSqueezyService.CreateCheckoutAsync(checkoutRequest, cancellationToken);

        if (!result.IsSuccess)
        {
            return BadRequest(new { success = false, error = result.Error.Description });
        }

        return Ok(new CheckoutResponseDto
        {
            Success = true,
            CheckoutUrl = result.Value.CheckoutUrl,
            CheckoutId = result.Value.CheckoutId,
            ExpiresAt = result.Value.ExpiresAt
        });
    }

    /// <summary>
    /// Creates an Iyzico checkout form for subscription purchase (Turkish payments).
    /// </summary>
    /// <param name="request">Iyzico checkout request details</param>
    /// <returns>Checkout form content and token</returns>
    [HttpPost("iyzico/checkout")]
    [ProducesResponseType(typeof(IyzicoCheckoutResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateIyzicoCheckout(
        [FromBody] CreateIyzicoCheckoutRequestDto request,
        CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        if (!tenantId.HasValue)
        {
            return BadRequest(new { success = false, error = "Tenant bilgisi bulunamadı" });
        }

        var userEmail = GetUserEmail();
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest(new { success = false, error = "Kullanıcı email bilgisi bulunamadı" });
        }

        // Get package/plan info for price
        var package = await _masterContext.Packages
            .FirstOrDefaultAsync(p => p.Id == request.PackageId, cancellationToken);

        if (package == null)
        {
            return BadRequest(new { success = false, error = "Paket bulunamadı" });
        }

        var checkoutRequest = new IyzicoCheckoutRequest
        {
            TenantId = tenantId.Value,
            CustomerEmail = userEmail,
            CustomerName = request.CustomerName ?? "",
            CustomerGsmNumber = request.CustomerPhone,
            Price = package.BasePrice.Amount,
            Currency = "TRY",
            BasketId = $"SUBSCRIPTION-{tenantId.Value}",
            PaymentGroup = "SUBSCRIPTION",
            CallbackUrl = request.CallbackUrl ?? $"{Request.Scheme}://{Request.Host}/api/webhooks/iyzico/checkout-callback",
            EnableInstallment = request.EnableInstallment,
            Enable3DSecure = true,
            BillingAddress = request.BillingAddress != null ? new IyzicoAddress
            {
                ContactName = request.BillingAddress.ContactName,
                City = request.BillingAddress.City,
                Country = request.BillingAddress.Country ?? "Turkey",
                Address = request.BillingAddress.Address,
                ZipCode = request.BillingAddress.ZipCode
            } : null,
            BasketItems = new List<IyzicoBasketItem>
            {
                new()
                {
                    Id = package.Id.ToString(),
                    Name = package.Name,
                    Category1 = "Subscription",
                    Category2 = package.Type.ToString(),
                    ItemType = "VIRTUAL",
                    Price = package.BasePrice.Amount
                }
            }
        };

        var result = await _iyzicoService.CreateCheckoutFormAsync(checkoutRequest, cancellationToken);

        if (!result.IsSuccess)
        {
            return BadRequest(new { success = false, error = result.Error.Description });
        }

        return Ok(new IyzicoCheckoutResponseDto
        {
            Success = true,
            Token = result.Value.Token,
            CheckoutFormContent = result.Value.CheckoutFormContent,
            PaymentPageUrl = result.Value.PaymentPageUrl,
            TokenExpireTime = result.Value.TokenExpireTime
        });
    }

    /// <summary>
    /// Gets Iyzico checkout result after 3D Secure callback.
    /// </summary>
    [HttpGet("iyzico/checkout-result")]
    [ProducesResponseType(typeof(IyzicoPaymentResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetIyzicoCheckoutResult(
        [FromQuery] string token,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(token))
        {
            return BadRequest(new { success = false, error = "Token gereklidir" });
        }

        var result = await _iyzicoService.GetCheckoutFormResultAsync(token, cancellationToken);

        if (!result.IsSuccess)
        {
            return BadRequest(new { success = false, error = result.Error.Description });
        }

        var paymentResult = result.Value;
        return Ok(new IyzicoPaymentResultDto
        {
            Success = paymentResult.IsSuccess,
            PaymentId = paymentResult.PaymentId,
            PaidPrice = paymentResult.PaidPrice,
            Currency = paymentResult.Currency,
            Installment = paymentResult.Installment,
            CardAssociation = paymentResult.CardAssociation,
            CardFamily = paymentResult.CardFamily,
            LastFourDigits = paymentResult.LastFourDigits,
            ErrorCode = paymentResult.ErrorCode,
            ErrorMessage = paymentResult.ErrorMessage
        });
    }

    /// <summary>
    /// Gets available installment options for a given card BIN and price.
    /// </summary>
    [HttpGet("iyzico/installments")]
    [ProducesResponseType(typeof(IyzicoInstallmentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetInstallmentOptions(
        [FromQuery] string binNumber,
        [FromQuery] decimal price,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(binNumber) || binNumber.Length < 6)
        {
            return BadRequest(new { success = false, error = "Geçerli bir kart numarası (ilk 6 hane) gereklidir" });
        }

        var result = await _iyzicoService.GetInstallmentOptionsAsync(binNumber, price, cancellationToken);

        if (!result.IsSuccess)
        {
            return BadRequest(new { success = false, error = result.Error.Description });
        }

        var info = result.Value;
        return Ok(new IyzicoInstallmentResponseDto
        {
            Success = true,
            BinNumber = info.BinNumber,
            CardAssociation = info.CardAssociation,
            CardFamily = info.CardFamily,
            BankName = info.BankName,
            InstallmentOptions = info.InstallmentDetails.Select(d => new InstallmentOptionDto
            {
                InstallmentNumber = d.InstallmentNumber,
                TotalPrice = d.TotalPrice,
                InstallmentPrice = d.InstallmentPrice
            }).ToList()
        });
    }

    /// <summary>
    /// Gets available payment gateway based on user's location/preference.
    /// Returns 'iyzico' for Turkey/TRY, 'lemonsqueezy' for others.
    /// </summary>
    [HttpGet("payment-gateway")]
    [ProducesResponseType(typeof(PaymentGatewayInfoDto), StatusCodes.Status200OK)]
    public IActionResult GetPaymentGateway([FromQuery] string? currency = null)
    {
        // Determine gateway based on currency preference
        var preferredGateway = currency?.ToUpperInvariant() == "TRY" ? "iyzico" : "lemonsqueezy";

        return Ok(new PaymentGatewayInfoDto
        {
            Gateway = preferredGateway,
            SupportedCurrencies = preferredGateway == "iyzico"
                ? new[] { "TRY" }
                : new[] { "USD", "EUR", "GBP" },
            SupportsInstallment = preferredGateway == "iyzico",
            Supports3DSecure = preferredGateway == "iyzico"
        });
    }

    #endregion

    #region Products & Plans

    /// <summary>
    /// Gets available subscription plans/products.
    /// </summary>
    [HttpGet("plans")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PlansResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPlans(CancellationToken cancellationToken)
    {
        var productsResult = await _lemonSqueezyService.GetProductsAsync(cancellationToken);

        if (!productsResult.IsSuccess)
        {
            return BadRequest(new { success = false, error = productsResult.Error.Description });
        }

        var plans = new List<PlanDto>();

        foreach (var product in productsResult.Value)
        {
            var variantsResult = await _lemonSqueezyService.GetVariantsAsync(product.Id, cancellationToken);

            if (variantsResult.IsSuccess)
            {
                foreach (var variant in variantsResult.Value)
                {
                    plans.Add(new PlanDto
                    {
                        ProductId = product.Id,
                        ProductName = product.Name,
                        ProductDescription = product.Description,
                        VariantId = variant.Id,
                        VariantName = variant.Name,
                        Price = variant.Price,
                        PriceFormatted = variant.PriceFormatted,
                        Interval = variant.Interval,
                        IntervalCount = variant.IntervalCount,
                        IsSubscription = variant.IsSubscription
                    });
                }
            }
        }

        return Ok(new PlansResponseDto
        {
            Success = true,
            Plans = plans
        });
    }

    #endregion

    #region Module & Bundle Pricing

    /// <summary>
    /// Gets available module pricings for purchase.
    /// </summary>
    [HttpGet("modules")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ModulePricingListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetModulePricings(CancellationToken cancellationToken)
    {
        var modules = await _pricingService.GetModulePricingsAsync(cancellationToken);

        return Ok(new ModulePricingListDto
        {
            Success = true,
            Modules = modules.Select(m => new ModulePricingItemDto
            {
                Id = m.Id,
                ModuleCode = m.ModuleCode,
                ModuleName = m.ModuleName,
                Description = m.Description,
                Icon = m.Icon,
                MonthlyPrice = m.MonthlyPrice,
                YearlyPrice = m.YearlyPrice,
                Currency = m.Currency,
                IsCore = m.IsCore,
                TrialDays = m.TrialDays,
                DisplayOrder = m.DisplayOrder,
                IncludedFeatures = m.IncludedFeatures
            }).ToList()
        });
    }

    /// <summary>
    /// Gets available module bundles for purchase.
    /// </summary>
    [HttpGet("bundles")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ModuleBundleListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetModuleBundles(CancellationToken cancellationToken)
    {
        var bundles = await _pricingService.GetModuleBundlesAsync(cancellationToken);

        return Ok(new ModuleBundleListDto
        {
            Success = true,
            Bundles = bundles.Select(b => new ModuleBundleItemDto
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
                DisplayOrder = b.DisplayOrder,
                ModuleCodes = b.ModuleCodes,
                OriginalMonthlyPrice = b.OriginalMonthlyPrice,
                SavingsAmount = b.SavingsAmount
            }).ToList()
        });
    }

    /// <summary>
    /// Gets available add-ons for purchase.
    /// </summary>
    [HttpGet("addons")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AddOnListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAddOns([FromQuery] string? moduleCode, CancellationToken cancellationToken)
    {
        var addOns = await _pricingService.GetAddOnsAsync(moduleCode, cancellationToken);

        return Ok(new AddOnListDto
        {
            Success = true,
            AddOns = addOns.Select(a => new AddOnItemDto
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
    /// Gets all pricing information in one call.
    /// </summary>
    [HttpGet("pricing")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(FullPricingDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFullPricing(CancellationToken cancellationToken)
    {
        var modules = await _pricingService.GetModulePricingsAsync(cancellationToken);
        var bundles = await _pricingService.GetModuleBundlesAsync(cancellationToken);
        var addOns = await _pricingService.GetAddOnsAsync(null, cancellationToken);

        return Ok(new FullPricingDto
        {
            Success = true,
            Modules = modules.Select(m => new ModulePricingItemDto
            {
                Id = m.Id,
                ModuleCode = m.ModuleCode,
                ModuleName = m.ModuleName,
                Description = m.Description,
                Icon = m.Icon,
                MonthlyPrice = m.MonthlyPrice,
                YearlyPrice = m.YearlyPrice,
                Currency = m.Currency,
                IsCore = m.IsCore,
                TrialDays = m.TrialDays,
                DisplayOrder = m.DisplayOrder,
                IncludedFeatures = m.IncludedFeatures
            }).ToList(),
            Bundles = bundles.Select(b => new ModuleBundleItemDto
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
                DisplayOrder = b.DisplayOrder,
                ModuleCodes = b.ModuleCodes,
                OriginalMonthlyPrice = b.OriginalMonthlyPrice,
                SavingsAmount = b.SavingsAmount
            }).ToList(),
            AddOns = addOns.Select(a => new AddOnItemDto
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
    /// Calculate subscription price preview.
    /// </summary>
    [HttpPost("calculate-price")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PriceCalculationDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CalculatePrice(
        [FromBody] CalculatePriceRequestDto request,
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
                BillingCycle = request.BillingCycle?.ToLowerInvariant() == "yearly"
                    ? Domain.Master.Enums.BillingCycle.Yillik
                    : Domain.Master.Enums.BillingCycle.Aylik
            },
            cancellationToken);

        return Ok(new PriceCalculationDto
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
            LineItems = result.LineItems.Select(li => new PriceLineItemDto
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

    #region Subscription Management

    /// <summary>
    /// Gets current subscription information for the tenant.
    /// Returns both internal subscription and LemonSqueezy subscription if available.
    /// </summary>
    [HttpGet("subscription")]
    [ProducesResponseType(typeof(SubscriptionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSubscription(CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        if (!tenantId.HasValue)
        {
            return BadRequest(new { success = false, error = "Tenant bilgisi bulunamadı" });
        }

        // First, check internal subscription (always exists for registered tenants)
        var subscription = await _masterContext.Subscriptions
            .Include(s => s.Package)
            .Include(s => s.Modules)
            .FirstOrDefaultAsync(s => s.TenantId == tenantId.Value, cancellationToken);

        if (subscription == null)
        {
            return NotFound(new { success = false, error = "Abonelik bulunamadı" });
        }

        // Check if there's a LemonSqueezy subscription (paid users)
        var lsSubscription = await _masterContext.LemonSqueezySubscriptions
            .FirstOrDefaultAsync(s => s.TenantId == tenantId.Value, cancellationToken);

        // If user has LemonSqueezy subscription, get fresh data from API
        if (lsSubscription != null)
        {
            var result = await _lemonSqueezyService.GetSubscriptionAsync(
                lsSubscription.LsSubscriptionId, cancellationToken);

            if (result.IsSuccess)
            {
                var info = result.Value;
                return Ok(new SubscriptionResponseDto
                {
                    Success = true,
                    Subscription = new SubscriptionDto
                    {
                        Id = info.Id,
                        Status = info.Status,
                        StatusFormatted = info.StatusFormatted,
                        ProductName = info.ProductName,
                        VariantName = info.VariantName,
                        UnitPrice = info.UnitPrice,
                        Currency = info.Currency,
                        BillingInterval = info.BillingInterval,
                        RenewsAt = info.RenewsAt,
                        EndsAt = info.EndsAt,
                        TrialEndsAt = info.TrialEndsAt,
                        IsCancelled = lsSubscription.IsCancelled,
                        IsPaused = lsSubscription.IsPaused,
                        CardBrand = info.CardBrand,
                        CardLastFour = info.CardLastFour,
                        CustomerPortalUrl = info.Urls.CustomerPortal,
                        UpdatePaymentMethodUrl = info.Urls.UpdatePaymentMethod
                    }
                });
            }

            // Return cached LemonSqueezy data if API fails
            return Ok(new SubscriptionResponseDto
            {
                Success = true,
                Subscription = new SubscriptionDto
                {
                    Id = lsSubscription.LsSubscriptionId,
                    Status = lsSubscription.Status.ToString(),
                    ProductName = subscription.Package?.Name ?? "",
                    VariantName = "",
                    UnitPrice = lsSubscription.UnitPrice,
                    Currency = lsSubscription.Currency,
                    BillingInterval = lsSubscription.BillingInterval,
                    RenewsAt = lsSubscription.RenewsAt,
                    EndsAt = lsSubscription.EndsAt,
                    TrialEndsAt = lsSubscription.TrialEndsAt,
                    IsCancelled = lsSubscription.IsCancelled,
                    IsPaused = lsSubscription.IsPaused,
                    CardBrand = lsSubscription.CardBrand,
                    CardLastFour = lsSubscription.CardLastFour,
                    CustomerPortalUrl = lsSubscription.CustomerPortalUrl,
                    UpdatePaymentMethodUrl = lsSubscription.UpdatePaymentMethodUrl
                }
            });
        }

        // Return internal subscription info (trial users)
        var billingInterval = subscription.BillingCycle switch
        {
            Domain.Master.Enums.BillingCycle.Aylik => "month",
            Domain.Master.Enums.BillingCycle.UcAylik => "3 months",
            Domain.Master.Enums.BillingCycle.AltiAylik => "6 months",
            Domain.Master.Enums.BillingCycle.Yillik => "year",
            _ => "month"
        };

        var statusFormatted = subscription.Status switch
        {
            Domain.Master.Enums.SubscriptionStatus.Deneme => "Deneme Sürümü",
            Domain.Master.Enums.SubscriptionStatus.Aktif => "Aktif",
            Domain.Master.Enums.SubscriptionStatus.Askida => "Askıda",
            Domain.Master.Enums.SubscriptionStatus.IptalEdildi => "İptal Edildi",
            Domain.Master.Enums.SubscriptionStatus.SuresiDoldu => "Süresi Doldu",
            Domain.Master.Enums.SubscriptionStatus.OdemesiGecikti => "Ödemesi Gecikti",
            Domain.Master.Enums.SubscriptionStatus.Beklemede => "Beklemede",
            _ => subscription.Status.ToString()
        };

        return Ok(new SubscriptionResponseDto
        {
            Success = true,
            Subscription = new SubscriptionDto
            {
                Id = subscription.Id.ToString(),
                Status = subscription.Status.ToString(),
                StatusFormatted = statusFormatted,
                ProductName = subscription.Package?.Name ?? "Özel Paket",
                VariantName = "",
                UnitPrice = (int)(subscription.Price?.Amount ?? 0),
                Currency = subscription.Price?.Currency ?? "TRY",
                BillingInterval = billingInterval,
                RenewsAt = subscription.CurrentPeriodEnd,
                EndsAt = subscription.Status == Domain.Master.Enums.SubscriptionStatus.IptalEdildi
                    ? subscription.CancelledAt
                    : null,
                TrialEndsAt = subscription.TrialEndDate,
                IsCancelled = subscription.Status == Domain.Master.Enums.SubscriptionStatus.IptalEdildi,
                IsPaused = subscription.Status == Domain.Master.Enums.SubscriptionStatus.Askida,
                CardBrand = null,
                CardLastFour = null,
                CustomerPortalUrl = null,
                UpdatePaymentMethodUrl = null
            }
        });
    }

    /// <summary>
    /// Cancels the current subscription.
    /// </summary>
    [HttpPost("subscription/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelSubscription(CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        if (!tenantId.HasValue)
        {
            return BadRequest(new { success = false, error = "Tenant bilgisi bulunamadı" });
        }

        // IsActive is a computed property, use Status directly for EF Core query
        var lsSubscription = await _masterContext.LemonSqueezySubscriptions
            .FirstOrDefaultAsync(s => s.TenantId == tenantId.Value &&
                (s.Status == LemonSqueezyStatus.Active || s.Status == LemonSqueezyStatus.OnTrial),
                cancellationToken);

        if (lsSubscription == null)
        {
            return NotFound(new { success = false, error = "Aktif abonelik bulunamadı" });
        }

        var result = await _lemonSqueezyService.CancelSubscriptionAsync(
            lsSubscription.LsSubscriptionId, cancellationToken);

        if (!result.IsSuccess)
        {
            return BadRequest(new { success = false, error = result.Error.Description });
        }

        _logger.LogInformation("Subscription cancelled for tenant {TenantId}", tenantId);
        return Ok(new { success = true, message = "Abonelik başarıyla iptal edildi" });
    }

    /// <summary>
    /// Pauses the current subscription.
    /// </summary>
    [HttpPost("subscription/pause")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PauseSubscription(CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        if (!tenantId.HasValue)
        {
            return BadRequest(new { success = false, error = "Tenant bilgisi bulunamadı" });
        }

        // IsActive is a computed property, use Status directly for EF Core query
        var lsSubscription = await _masterContext.LemonSqueezySubscriptions
            .FirstOrDefaultAsync(s => s.TenantId == tenantId.Value &&
                (s.Status == LemonSqueezyStatus.Active || s.Status == LemonSqueezyStatus.OnTrial),
                cancellationToken);

        if (lsSubscription == null)
        {
            return NotFound(new { success = false, error = "Aktif abonelik bulunamadı" });
        }

        var result = await _lemonSqueezyService.PauseSubscriptionAsync(
            lsSubscription.LsSubscriptionId, cancellationToken);

        if (!result.IsSuccess)
        {
            return BadRequest(new { success = false, error = result.Error.Description });
        }

        _logger.LogInformation("Subscription paused for tenant {TenantId}", tenantId);
        return Ok(new { success = true, message = "Abonelik başarıyla duraklatıldı" });
    }

    /// <summary>
    /// Resumes a paused subscription.
    /// </summary>
    [HttpPost("subscription/resume")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResumeSubscription(CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        if (!tenantId.HasValue)
        {
            return BadRequest(new { success = false, error = "Tenant bilgisi bulunamadı" });
        }

        // IsPaused is a computed property, use Status directly for EF Core query
        var lsSubscription = await _masterContext.LemonSqueezySubscriptions
            .FirstOrDefaultAsync(s => s.TenantId == tenantId.Value &&
                s.Status == LemonSqueezyStatus.Paused, cancellationToken);

        if (lsSubscription == null)
        {
            return NotFound(new { success = false, error = "Duraklatılmış abonelik bulunamadı" });
        }

        var result = await _lemonSqueezyService.ResumeSubscriptionAsync(
            lsSubscription.LsSubscriptionId, cancellationToken);

        if (!result.IsSuccess)
        {
            return BadRequest(new { success = false, error = result.Error.Description });
        }

        _logger.LogInformation("Subscription resumed for tenant {TenantId}", tenantId);
        return Ok(new { success = true, message = "Abonelik başarıyla devam ettirildi" });
    }

    /// <summary>
    /// Upgrades or downgrades the subscription to a different plan.
    /// </summary>
    [HttpPost("subscription/change-plan")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangePlan(
        [FromBody] ChangePlanRequestDto request,
        CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        if (!tenantId.HasValue)
        {
            return BadRequest(new { success = false, error = "Tenant bilgisi bulunamadı" });
        }

        // IsActive is a computed property, use Status directly for EF Core query
        var lsSubscription = await _masterContext.LemonSqueezySubscriptions
            .FirstOrDefaultAsync(s => s.TenantId == tenantId.Value &&
                (s.Status == LemonSqueezyStatus.Active || s.Status == LemonSqueezyStatus.OnTrial),
                cancellationToken);

        if (lsSubscription == null)
        {
            // For trial users without LemonSqueezy subscription, redirect to checkout
            return BadRequest(new {
                success = false,
                error = "Plan değiştirmek için önce ücretli bir abonelik başlatmanız gerekmektedir.",
                requiresCheckout = true
            });
        }

        var updateRequest = new UpdateSubscriptionRequest
        {
            VariantId = request.NewVariantId
        };

        var result = await _lemonSqueezyService.UpdateSubscriptionAsync(
            lsSubscription.LsSubscriptionId, updateRequest, cancellationToken);

        if (!result.IsSuccess)
        {
            return BadRequest(new { success = false, error = result.Error.Description });
        }

        _logger.LogInformation("Subscription plan changed for tenant {TenantId} to variant {VariantId}",
            tenantId, request.NewVariantId);
        return Ok(new { success = true, message = "Plan başarıyla değiştirildi" });
    }

    #endregion

    #region Customer Portal

    /// <summary>
    /// Gets the Lemon Squeezy customer portal URL for managing subscription.
    /// </summary>
    [HttpGet("portal")]
    [ProducesResponseType(typeof(PortalUrlResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCustomerPortal(CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        if (!tenantId.HasValue)
        {
            return BadRequest(new { success = false, error = "Tenant bilgisi bulunamadı" });
        }

        var lsSubscription = await _masterContext.LemonSqueezySubscriptions
            .FirstOrDefaultAsync(s => s.TenantId == tenantId.Value, cancellationToken);

        if (lsSubscription == null)
        {
            return NotFound(new { success = false, error = "Abonelik bulunamadı" });
        }

        // Use cached URL if available
        if (!string.IsNullOrEmpty(lsSubscription.CustomerPortalUrl))
        {
            return Ok(new PortalUrlResponseDto
            {
                Success = true,
                PortalUrl = lsSubscription.CustomerPortalUrl
            });
        }

        // Fetch from API
        var result = await _lemonSqueezyService.GetCustomerPortalUrlAsync(
            lsSubscription.LsCustomerId, cancellationToken);

        if (!result.IsSuccess)
        {
            return BadRequest(new { success = false, error = result.Error.Description });
        }

        return Ok(new PortalUrlResponseDto
        {
            Success = true,
            PortalUrl = result.Value
        });
    }

    #endregion
}

#region DTOs

public class CreateCheckoutRequestDto
{
    public string VariantId { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public string? SuccessUrl { get; set; }
    public string? CancelUrl { get; set; }
}

public class CheckoutResponseDto
{
    public bool Success { get; set; }
    public string CheckoutUrl { get; set; } = string.Empty;
    public string CheckoutId { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class PlansResponseDto
{
    public bool Success { get; set; }
    public List<PlanDto> Plans { get; set; } = new();
}

public class PlanDto
{
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? ProductDescription { get; set; }
    public string VariantId { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public int Price { get; set; }
    public string? PriceFormatted { get; set; }
    public string? Interval { get; set; }
    public int? IntervalCount { get; set; }
    public bool IsSubscription { get; set; }
}

public class SubscriptionResponseDto
{
    public bool Success { get; set; }
    public SubscriptionDto? Subscription { get; set; }
}

public class SubscriptionDto
{
    public string Id { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? StatusFormatted { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public int UnitPrice { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string BillingInterval { get; set; } = string.Empty;
    public DateTime? RenewsAt { get; set; }
    public DateTime? EndsAt { get; set; }
    public DateTime? TrialEndsAt { get; set; }
    public bool IsCancelled { get; set; }
    public bool IsPaused { get; set; }
    public string? CardBrand { get; set; }
    public string? CardLastFour { get; set; }
    public string? CustomerPortalUrl { get; set; }
    public string? UpdatePaymentMethodUrl { get; set; }
}

public class ChangePlanRequestDto
{
    public string NewVariantId { get; set; } = string.Empty;
}

public class PortalUrlResponseDto
{
    public bool Success { get; set; }
    public string PortalUrl { get; set; } = string.Empty;
}

// Iyzico DTOs
public class CreateIyzicoCheckoutRequestDto
{
    public Guid PackageId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CallbackUrl { get; set; }
    public bool EnableInstallment { get; set; } = true;
    public BillingAddressDto? BillingAddress { get; set; }
}

public class BillingAddressDto
{
    public string ContactName { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Country { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? ZipCode { get; set; }
}

public class IyzicoCheckoutResponseDto
{
    public bool Success { get; set; }
    public string Token { get; set; } = string.Empty;
    public string CheckoutFormContent { get; set; } = string.Empty;
    public string PaymentPageUrl { get; set; } = string.Empty;
    public long TokenExpireTime { get; set; }
}

public class IyzicoPaymentResultDto
{
    public bool Success { get; set; }
    public string? PaymentId { get; set; }
    public decimal? PaidPrice { get; set; }
    public string? Currency { get; set; }
    public int? Installment { get; set; }
    public string? CardAssociation { get; set; }
    public string? CardFamily { get; set; }
    public string? LastFourDigits { get; set; }
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
}

public class IyzicoInstallmentResponseDto
{
    public bool Success { get; set; }
    public string BinNumber { get; set; } = string.Empty;
    public string? CardAssociation { get; set; }
    public string? CardFamily { get; set; }
    public string? BankName { get; set; }
    public List<InstallmentOptionDto> InstallmentOptions { get; set; } = new();
}

public class InstallmentOptionDto
{
    public int InstallmentNumber { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal InstallmentPrice { get; set; }
}

public class PaymentGatewayInfoDto
{
    public string Gateway { get; set; } = string.Empty;
    public string[] SupportedCurrencies { get; set; } = Array.Empty<string>();
    public bool SupportsInstallment { get; set; }
    public bool Supports3DSecure { get; set; }
}

// Module & Bundle Pricing DTOs
public class ModulePricingListDto
{
    public bool Success { get; set; }
    public List<ModulePricingItemDto> Modules { get; set; } = new();
}

public class ModulePricingItemDto
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
    public int? TrialDays { get; set; }
    public int DisplayOrder { get; set; }
    public string[] IncludedFeatures { get; set; } = Array.Empty<string>();
}

public class ModuleBundleListDto
{
    public bool Success { get; set; }
    public List<ModuleBundleItemDto> Bundles { get; set; } = new();
}

public class ModuleBundleItemDto
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
    public int DisplayOrder { get; set; }
    public List<string> ModuleCodes { get; set; } = new();
    public decimal OriginalMonthlyPrice { get; set; }
    public decimal SavingsAmount { get; set; }
}

public class AddOnListDto
{
    public bool Success { get; set; }
    public List<AddOnItemDto> AddOns { get; set; } = new();
}

public class AddOnItemDto
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
    public int DisplayOrder { get; set; }
    public string? Category { get; set; }
    public string? RequiredModuleCode { get; set; }
    public int? Quantity { get; set; }
    public string? QuantityUnit { get; set; }
    public List<string> Features { get; set; } = new();
}

public class FullPricingDto
{
    public bool Success { get; set; }
    public List<ModulePricingItemDto> Modules { get; set; } = new();
    public List<ModuleBundleItemDto> Bundles { get; set; } = new();
    public List<AddOnItemDto> AddOns { get; set; } = new();
}

public class CalculatePriceRequestDto
{
    public Guid? PackageId { get; set; }
    public string? BundleCode { get; set; }
    public List<string>? ModuleCodes { get; set; }
    public List<string>? AddOnCodes { get; set; }
    public int UserCount { get; set; } = 1;
    public string? BillingCycle { get; set; } = "monthly";
}

public class PriceCalculationDto
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
    public List<PriceLineItemDto> LineItems { get; set; } = new();
}

public class PriceLineItemDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
}

#endregion
