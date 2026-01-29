using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Services;
using Stocker.Infrastructure.Configuration;
using Stocker.SharedKernel.Results;

namespace Stocker.Infrastructure.Services.Payment;

/// <summary>
/// Factory for creating payment gateways based on provider or region
/// </summary>
public class PaymentGatewayFactory : IPaymentGatewayFactory
{
    private readonly ILogger<PaymentGatewayFactory> _logger;
    private readonly ILemonSqueezyService _lemonSqueezyService;
    private readonly IIyzicoService _iyzicoService;
    private readonly IyzicoOptions _iyzicoOptions;
    private readonly LemonSqueezyPaymentGateway _lemonSqueezyGateway;
    private readonly IyzicoPaymentGateway _iyzicoGateway;

    // Countries that should use Iyzico (Turkey)
    private static readonly HashSet<string> IyzicoCountries = new(StringComparer.OrdinalIgnoreCase)
    {
        "TR", "TUR", "Turkey", "Türkiye"
    };

    // Currencies that should use Iyzico
    private static readonly HashSet<string> IyzicoCurrencies = new(StringComparer.OrdinalIgnoreCase)
    {
        "TRY", "TL"
    };

    public PaymentGatewayFactory(
        ILogger<PaymentGatewayFactory> logger,
        ILemonSqueezyService lemonSqueezyService,
        IIyzicoService iyzicoService,
        IOptions<IyzicoOptions> iyzicoOptions,
        LemonSqueezyPaymentGateway lemonSqueezyGateway,
        IyzicoPaymentGateway iyzicoGateway)
    {
        _logger = logger;
        _lemonSqueezyService = lemonSqueezyService;
        _iyzicoService = iyzicoService;
        _iyzicoOptions = iyzicoOptions.Value;
        _lemonSqueezyGateway = lemonSqueezyGateway;
        _iyzicoGateway = iyzicoGateway;
    }

    /// <inheritdoc />
    public IPaymentGateway GetGateway(PaymentProvider provider)
    {
        return provider switch
        {
            PaymentProvider.LemonSqueezy => _lemonSqueezyGateway,
            PaymentProvider.Iyzico => _iyzicoGateway,
            _ => throw new ArgumentException($"Unknown payment provider: {provider}", nameof(provider))
        };
    }

    /// <inheritdoc />
    public IPaymentGateway GetGatewayForCountry(string countryCode)
    {
        if (string.IsNullOrEmpty(countryCode))
        {
            _logger.LogDebug("No country code provided, defaulting to LemonSqueezy");
            return _lemonSqueezyGateway;
        }

        if (IyzicoCountries.Contains(countryCode))
        {
            if (_iyzicoGateway.IsAvailable)
            {
                _logger.LogDebug("Using Iyzico gateway for country {CountryCode}", countryCode);
                return _iyzicoGateway;
            }

            _logger.LogWarning("Iyzico is not available for country {CountryCode}, falling back to LemonSqueezy", countryCode);
        }

        return _lemonSqueezyGateway;
    }

    /// <inheritdoc />
    public IPaymentGateway GetGatewayForCurrency(string currencyCode)
    {
        if (string.IsNullOrEmpty(currencyCode))
        {
            _logger.LogDebug("No currency code provided, defaulting to LemonSqueezy");
            return _lemonSqueezyGateway;
        }

        if (IyzicoCurrencies.Contains(currencyCode))
        {
            if (_iyzicoGateway.IsAvailable)
            {
                _logger.LogDebug("Using Iyzico gateway for currency {CurrencyCode}", currencyCode);
                return _iyzicoGateway;
            }

            _logger.LogWarning("Iyzico is not available for currency {CurrencyCode}, falling back to LemonSqueezy", currencyCode);
        }

        return _lemonSqueezyGateway;
    }

    /// <inheritdoc />
    public IEnumerable<IPaymentGateway> GetAvailableGateways()
    {
        var gateways = new List<IPaymentGateway>();

        if (_lemonSqueezyGateway.IsAvailable)
            gateways.Add(_lemonSqueezyGateway);

        if (_iyzicoGateway.IsAvailable)
            gateways.Add(_iyzicoGateway);

        return gateways;
    }
}

/// <summary>
/// Iyzico payment gateway adapter implementing the unified interface
/// </summary>
public class IyzicoPaymentGateway : IPaymentGateway
{
    private readonly IIyzicoService _iyzicoService;
    private readonly IyzicoOptions _options;
    private readonly ILogger<IyzicoPaymentGateway> _logger;

    public IyzicoPaymentGateway(
        IIyzicoService iyzicoService,
        IOptions<IyzicoOptions> options,
        ILogger<IyzicoPaymentGateway> logger)
    {
        _iyzicoService = iyzicoService;
        _options = options.Value;
        _logger = logger;
    }

    public PaymentProvider Provider => PaymentProvider.Iyzico;

    public bool IsAvailable => _options.IsValid;

    public async Task<Result<PaymentCheckoutResult>> CreateCheckoutAsync(PaymentCheckoutRequest request, CancellationToken cancellationToken = default)
    {
        var iyzicoRequest = new IyzicoCheckoutRequest
        {
            TenantId = request.TenantId,
            CustomerEmail = request.CustomerEmail,
            CustomerName = request.CustomerName ?? "Müşteri",
            Price = request.Amount,
            Currency = request.Currency,
            CallbackUrl = request.SuccessUrl,
            BillingAddress = request.BillingAddress != null ? new IyzicoAddress
            {
                ContactName = request.BillingAddress.Name ?? request.CustomerName ?? "Müşteri",
                City = request.BillingAddress.City ?? "Istanbul",
                Country = request.BillingAddress.Country ?? "Turkey",
                Address = request.BillingAddress.Address ?? "Adres bilgisi",
                ZipCode = request.BillingAddress.ZipCode
            } : null,
            BasketItems = new List<IyzicoBasketItem>
            {
                new()
                {
                    Id = request.PlanId,
                    Name = "Abonelik",
                    Category1 = "Subscription",
                    ItemType = "VIRTUAL",
                    Price = request.Amount
                }
            }
        };

        var result = await _iyzicoService.CreateCheckoutFormAsync(iyzicoRequest, cancellationToken);

        if (!result.IsSuccess)
        {
            return Result<PaymentCheckoutResult>.Failure(Error.Failure("Payment.Error", result.Error?.Description ?? "Checkout creation failed"));
        }

        return Result<PaymentCheckoutResult>.Success(new PaymentCheckoutResult
        {
            CheckoutId = result.Value!.Token,
            CheckoutUrl = result.Value.PaymentPageUrl,
            CheckoutFormHtml = result.Value.CheckoutFormContent,
            ExpiresAt = DateTime.UtcNow.AddMilliseconds(result.Value.TokenExpireTime),
            Provider = PaymentProvider.Iyzico
        });
    }

    public async Task<Result<PaymentSubscriptionResult>> CreateSubscriptionAsync(PaymentSubscriptionRequest request, CancellationToken cancellationToken = default)
    {
        var iyzicoRequest = new IyzicoCreateSubscriptionRequest
        {
            CustomerReferenceCode = request.CustomerId,
            PricingPlanReferenceCode = request.PlanId,
            CardToken = request.CardToken
        };

        var result = await _iyzicoService.CreateSubscriptionAsync(iyzicoRequest, cancellationToken);

        if (!result.IsSuccess)
        {
            return Result<PaymentSubscriptionResult>.Failure(Error.Failure("Payment.Error", result.Error?.Description ?? "Subscription creation failed"));
        }

        return Result<PaymentSubscriptionResult>.Success(new PaymentSubscriptionResult
        {
            SubscriptionId = result.Value!.ReferenceCode,
            CustomerId = result.Value.CustomerReferenceCode,
            PlanId = result.Value.PricingPlanReferenceCode,
            Status = MapIyzicoStatus(result.Value.Status),
            StartDate = result.Value.StartDate,
            CurrentPeriodEnd = result.Value.EndDate,
            Provider = PaymentProvider.Iyzico
        });
    }

    public async Task<Result<PaymentSubscriptionInfo>> GetSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken = default)
    {
        var result = await _iyzicoService.GetSubscriptionAsync(subscriptionId, cancellationToken);

        if (!result.IsSuccess)
        {
            return Result<PaymentSubscriptionInfo>.Failure(Error.Failure("Payment.Error", result.Error?.Description ?? "Failed to get subscription"));
        }

        return Result<PaymentSubscriptionInfo>.Success(new PaymentSubscriptionInfo
        {
            SubscriptionId = result.Value!.ReferenceCode,
            CustomerId = result.Value.CustomerReferenceCode,
            PlanId = result.Value.PricingPlanReferenceCode,
            PlanName = result.Value.PlanName,
            Status = MapIyzicoStatus(result.Value.Status),
            Amount = result.Value.Price ?? 0,
            Currency = result.Value.Currency ?? "TRY",
            BillingInterval = "month",
            BillingIntervalCount = 1,
            TrialEndsAt = result.Value.TrialEndDate,
            CurrentPeriodStart = result.Value.StartDate,
            CurrentPeriodEnd = result.Value.EndDate,
            CreatedAt = result.Value.StartDate ?? DateTime.UtcNow,
            Provider = PaymentProvider.Iyzico
        });
    }

    public async Task<Result> CancelSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken = default)
    {
        return await _iyzicoService.CancelSubscriptionAsync(subscriptionId, cancellationToken);
    }

    public async Task<Result> UpgradeSubscriptionAsync(string subscriptionId, string newPlanId, CancellationToken cancellationToken = default)
    {
        return await _iyzicoService.UpgradeSubscriptionAsync(subscriptionId, newPlanId, cancellationToken);
    }

    public async Task<Result> DowngradeSubscriptionAsync(string subscriptionId, string newPlanId, CancellationToken cancellationToken = default)
    {
        return await _iyzicoService.DowngradeSubscriptionAsync(subscriptionId, newPlanId, cancellationToken);
    }

    public async Task<Result<PaymentWebhookResult>> ProcessWebhookAsync(string payload, string? signature, CancellationToken cancellationToken = default)
    {
        var result = await _iyzicoService.ProcessWebhookAsync(payload, cancellationToken);

        if (!result.IsSuccess)
        {
            return Result<PaymentWebhookResult>.Failure(Error.Failure("Payment.Error", result.Error?.Description ?? "Webhook processing failed"));
        }

        // Parse webhook payload to extract event details
        // This is a simplified implementation - the actual parsing should be done in the controller
        return Result<PaymentWebhookResult>.Success(new PaymentWebhookResult
        {
            EventType = "subscription_updated",
            Provider = PaymentProvider.Iyzico
        });
    }

    public Task<Result<string>> GetCustomerPortalUrlAsync(string customerId, CancellationToken cancellationToken = default)
    {
        // Iyzico doesn't have a customer portal like LemonSqueezy
        // Return a custom billing management URL instead
        return Task.FromResult(Result<string>.Failure(Error.Failure("Iyzico.NoPortal", "Iyzico does not support customer portal")));
    }

    private static PaymentSubscriptionStatus MapIyzicoStatus(string status)
    {
        return status?.ToUpperInvariant() switch
        {
            "ACTIVE" => PaymentSubscriptionStatus.Active,
            "PENDING" => PaymentSubscriptionStatus.Pending,
            "UNPAID" => PaymentSubscriptionStatus.Unpaid,
            "CANCELLED" => PaymentSubscriptionStatus.Cancelled,
            "EXPIRED" => PaymentSubscriptionStatus.Expired,
            "UPGRADED" => PaymentSubscriptionStatus.Active,
            _ => PaymentSubscriptionStatus.Active
        };
    }
}

/// <summary>
/// LemonSqueezy payment gateway adapter implementing the unified interface
/// </summary>
public class LemonSqueezyPaymentGateway : IPaymentGateway
{
    private readonly ILemonSqueezyService _lemonSqueezyService;
    private readonly ILogger<LemonSqueezyPaymentGateway> _logger;

    public LemonSqueezyPaymentGateway(
        ILemonSqueezyService lemonSqueezyService,
        ILogger<LemonSqueezyPaymentGateway> logger)
    {
        _lemonSqueezyService = lemonSqueezyService;
        _logger = logger;
    }

    public PaymentProvider Provider => PaymentProvider.LemonSqueezy;

    public bool IsAvailable => true; // LemonSqueezy is always available as the default

    public async Task<Result<PaymentCheckoutResult>> CreateCheckoutAsync(PaymentCheckoutRequest request, CancellationToken cancellationToken = default)
    {
        var lsRequest = new CreateCheckoutRequest
        {
            TenantId = request.TenantId,
            VariantId = request.PlanId,
            CustomerEmail = request.CustomerEmail,
            CustomerName = request.CustomerName,
            SuccessUrl = request.SuccessUrl,
            CancelUrl = request.CancelUrl,
            CustomData = request.Metadata
        };

        var result = await _lemonSqueezyService.CreateCheckoutAsync(lsRequest, cancellationToken);

        if (!result.IsSuccess)
        {
            return Result<PaymentCheckoutResult>.Failure(Error.Failure("Payment.Error", result.Error?.Description ?? "Checkout creation failed"));
        }

        return Result<PaymentCheckoutResult>.Success(new PaymentCheckoutResult
        {
            CheckoutId = result.Value!.CheckoutId,
            CheckoutUrl = result.Value.CheckoutUrl,
            ExpiresAt = result.Value.ExpiresAt,
            Provider = PaymentProvider.LemonSqueezy
        });
    }

    public Task<Result<PaymentSubscriptionResult>> CreateSubscriptionAsync(PaymentSubscriptionRequest request, CancellationToken cancellationToken = default)
    {
        // LemonSqueezy creates subscriptions through the checkout flow
        return Task.FromResult(Result<PaymentSubscriptionResult>.Failure(Error.Failure("LemonSqueezy.UseCheckout", "Use CreateCheckoutAsync for LemonSqueezy subscriptions")));
    }

    public async Task<Result<PaymentSubscriptionInfo>> GetSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken = default)
    {
        var result = await _lemonSqueezyService.GetSubscriptionAsync(subscriptionId, cancellationToken);

        if (!result.IsSuccess)
        {
            return Result<PaymentSubscriptionInfo>.Failure(Error.Failure("Payment.Error", result.Error?.Description ?? "Failed to get subscription"));
        }

        return Result<PaymentSubscriptionInfo>.Success(new PaymentSubscriptionInfo
        {
            SubscriptionId = result.Value!.Id,
            CustomerId = result.Value.CustomerId,
            CustomerEmail = result.Value.CustomerEmail,
            PlanId = result.Value.VariantId,
            PlanName = result.Value.VariantName,
            Status = MapLsStatus(result.Value.Status),
            Amount = result.Value.UnitPrice / 100m, // Convert cents to currency
            Currency = result.Value.Currency,
            BillingInterval = result.Value.BillingInterval,
            BillingIntervalCount = result.Value.BillingIntervalCount,
            TrialEndsAt = result.Value.TrialEndsAt,
            CurrentPeriodEnd = result.Value.RenewsAt,
            CreatedAt = result.Value.CreatedAt,
            Card = new PaymentCardInfo
            {
                Brand = result.Value.CardBrand,
                LastFour = result.Value.CardLastFour
            },
            Provider = PaymentProvider.LemonSqueezy
        });
    }

    public async Task<Result> CancelSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken = default)
    {
        return await _lemonSqueezyService.CancelSubscriptionAsync(subscriptionId, cancellationToken);
    }

    public async Task<Result> UpgradeSubscriptionAsync(string subscriptionId, string newPlanId, CancellationToken cancellationToken = default)
    {
        return await _lemonSqueezyService.UpdateSubscriptionAsync(subscriptionId, new UpdateSubscriptionRequest
        {
            VariantId = newPlanId
        }, cancellationToken);
    }

    public async Task<Result> DowngradeSubscriptionAsync(string subscriptionId, string newPlanId, CancellationToken cancellationToken = default)
    {
        return await UpgradeSubscriptionAsync(subscriptionId, newPlanId, cancellationToken);
    }

    public async Task<Result<PaymentWebhookResult>> ProcessWebhookAsync(string payload, string? signature, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(signature) || !_lemonSqueezyService.ValidateWebhookSignature(payload, signature))
        {
            return Result<PaymentWebhookResult>.Failure(Error.Failure("Webhook.InvalidSignature", "Invalid webhook signature"));
        }

        var result = await _lemonSqueezyService.ProcessWebhookAsync(payload, signature, cancellationToken);

        if (!result.IsSuccess)
        {
            return Result<PaymentWebhookResult>.Failure(Error.Failure("Payment.Error", result.Error?.Description ?? "Webhook processing failed"));
        }

        return Result<PaymentWebhookResult>.Success(new PaymentWebhookResult
        {
            EventType = "webhook_processed",
            Provider = PaymentProvider.LemonSqueezy
        });
    }

    public async Task<Result<string>> GetCustomerPortalUrlAsync(string customerId, CancellationToken cancellationToken = default)
    {
        return await _lemonSqueezyService.GetCustomerPortalUrlAsync(customerId, cancellationToken);
    }

    private static PaymentSubscriptionStatus MapLsStatus(string status)
    {
        return status?.ToLowerInvariant() switch
        {
            "active" => PaymentSubscriptionStatus.Active,
            "on_trial" => PaymentSubscriptionStatus.Trialing,
            "past_due" => PaymentSubscriptionStatus.PastDue,
            "paused" => PaymentSubscriptionStatus.Paused,
            "cancelled" => PaymentSubscriptionStatus.Cancelled,
            "expired" => PaymentSubscriptionStatus.Expired,
            "unpaid" => PaymentSubscriptionStatus.Unpaid,
            _ => PaymentSubscriptionStatus.Active
        };
    }
}
