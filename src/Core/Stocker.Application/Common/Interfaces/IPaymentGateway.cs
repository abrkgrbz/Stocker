using Stocker.SharedKernel.Results;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Payment provider types supported by the system
/// </summary>
public enum PaymentProvider
{
    /// <summary>
    /// LemonSqueezy - International payment provider
    /// </summary>
    LemonSqueezy = 0,

    /// <summary>
    /// Iyzico - Turkish payment provider
    /// </summary>
    Iyzico = 1
}

/// <summary>
/// Unified payment gateway interface for all payment providers
/// Abstracts the differences between LemonSqueezy and Iyzico
/// </summary>
public interface IPaymentGateway
{
    /// <summary>
    /// The payment provider this gateway implements
    /// </summary>
    PaymentProvider Provider { get; }

    /// <summary>
    /// Check if this gateway is available/configured
    /// </summary>
    bool IsAvailable { get; }

    /// <summary>
    /// Create a checkout session for subscription or one-time payment
    /// </summary>
    Task<Result<PaymentCheckoutResult>> CreateCheckoutAsync(PaymentCheckoutRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Create a new subscription
    /// </summary>
    Task<Result<PaymentSubscriptionResult>> CreateSubscriptionAsync(PaymentSubscriptionRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get subscription details
    /// </summary>
    Task<Result<PaymentSubscriptionInfo>> GetSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Cancel a subscription
    /// </summary>
    Task<Result> CancelSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Upgrade subscription to a higher tier
    /// </summary>
    Task<Result> UpgradeSubscriptionAsync(string subscriptionId, string newPlanId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Downgrade subscription to a lower tier
    /// </summary>
    Task<Result> DowngradeSubscriptionAsync(string subscriptionId, string newPlanId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Process incoming webhook from the payment provider
    /// </summary>
    Task<Result<PaymentWebhookResult>> ProcessWebhookAsync(string payload, string? signature, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get customer portal URL for self-service
    /// </summary>
    Task<Result<string>> GetCustomerPortalUrlAsync(string customerId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Factory for creating payment gateways based on provider or region
/// </summary>
public interface IPaymentGatewayFactory
{
    /// <summary>
    /// Get gateway for a specific provider
    /// </summary>
    IPaymentGateway GetGateway(PaymentProvider provider);

    /// <summary>
    /// Get the best gateway for a given country
    /// Turkey -> Iyzico, Others -> LemonSqueezy
    /// </summary>
    IPaymentGateway GetGatewayForCountry(string countryCode);

    /// <summary>
    /// Get the best gateway for a given currency
    /// TRY -> Iyzico, Others -> LemonSqueezy
    /// </summary>
    IPaymentGateway GetGatewayForCurrency(string currencyCode);

    /// <summary>
    /// Get all available gateways
    /// </summary>
    IEnumerable<IPaymentGateway> GetAvailableGateways();
}

#region Unified DTOs

public record PaymentCheckoutRequest
{
    public Guid TenantId { get; init; }
    public string PlanId { get; init; } = string.Empty;
    public string CustomerEmail { get; init; } = string.Empty;
    public string? CustomerName { get; init; }
    public string? CustomerPhone { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "TRY";
    public string SuccessUrl { get; init; } = string.Empty;
    public string CancelUrl { get; init; } = string.Empty;
    public Dictionary<string, string>? Metadata { get; init; }
    public PaymentBillingAddress? BillingAddress { get; init; }
}

public record PaymentBillingAddress
{
    public string? Name { get; init; }
    public string? Address { get; init; }
    public string? City { get; init; }
    public string? Country { get; init; }
    public string? ZipCode { get; init; }
}

public record PaymentCheckoutResult
{
    public string CheckoutId { get; init; } = string.Empty;
    public string CheckoutUrl { get; init; } = string.Empty;
    public string? CheckoutFormHtml { get; init; }
    public DateTime? ExpiresAt { get; init; }
    public PaymentProvider Provider { get; init; }
}

public record PaymentSubscriptionRequest
{
    public Guid TenantId { get; init; }
    public string CustomerId { get; init; } = string.Empty;
    public string PlanId { get; init; } = string.Empty;
    public string? CardToken { get; init; }
    public int? TrialDays { get; init; }
    public Dictionary<string, string>? Metadata { get; init; }
}

public record PaymentSubscriptionResult
{
    public string SubscriptionId { get; init; } = string.Empty;
    public string CustomerId { get; init; } = string.Empty;
    public string PlanId { get; init; } = string.Empty;
    public PaymentSubscriptionStatus Status { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? CurrentPeriodEnd { get; init; }
    public PaymentProvider Provider { get; init; }
}

public record PaymentSubscriptionInfo
{
    public string SubscriptionId { get; init; } = string.Empty;
    public string CustomerId { get; init; } = string.Empty;
    public string CustomerEmail { get; init; } = string.Empty;
    public string PlanId { get; init; } = string.Empty;
    public string? PlanName { get; init; }
    public PaymentSubscriptionStatus Status { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public string BillingInterval { get; init; } = string.Empty;
    public int BillingIntervalCount { get; init; }
    public DateTime? TrialEndsAt { get; init; }
    public DateTime? CurrentPeriodStart { get; init; }
    public DateTime? CurrentPeriodEnd { get; init; }
    public DateTime? CancelledAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public PaymentCardInfo? Card { get; init; }
    public PaymentProvider Provider { get; init; }
}

public record PaymentCardInfo
{
    public string? Brand { get; init; }
    public string? LastFour { get; init; }
    public string? ExpiryMonth { get; init; }
    public string? ExpiryYear { get; init; }
}

public enum PaymentSubscriptionStatus
{
    Active,
    Trialing,
    PastDue,
    Paused,
    Cancelled,
    Expired,
    Unpaid,
    Pending
}

public record PaymentWebhookResult
{
    public string EventType { get; init; } = string.Empty;
    public string? SubscriptionId { get; init; }
    public string? CustomerId { get; init; }
    public string? PaymentId { get; init; }
    public PaymentSubscriptionStatus? NewStatus { get; init; }
    public Dictionary<string, object>? Data { get; init; }
    public PaymentProvider Provider { get; init; }
}

#endregion
