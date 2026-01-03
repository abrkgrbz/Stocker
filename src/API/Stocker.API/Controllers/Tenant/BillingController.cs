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
/// Integrates with Lemon Squeezy for payment processing.
/// This is a tenant-scoped controller - tenant resolution is handled by middleware.
/// </summary>
[Route("api/tenant/billing")]
[Authorize]
public class BillingController : ApiController
{
    private readonly ILemonSqueezyService _lemonSqueezyService;
    private readonly IMasterDbContext _masterContext;
    private readonly ILogger<BillingController> _logger;

    public BillingController(
        ILemonSqueezyService lemonSqueezyService,
        IMasterDbContext masterContext,
        ILogger<BillingController> logger)
    {
        _lemonSqueezyService = lemonSqueezyService;
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

#endregion
