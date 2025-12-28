using Stocker.SharedKernel.Results;

namespace Stocker.Application.Services;

/// <summary>
/// Service for interacting with Lemon Squeezy payment platform
/// </summary>
public interface ILemonSqueezyService
{
    // Checkout
    Task<Result<CheckoutResponse>> CreateCheckoutAsync(CreateCheckoutRequest request, CancellationToken cancellationToken = default);

    // Subscription Management
    Task<Result<LsSubscriptionInfo>> GetSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken = default);
    Task<Result> CancelSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken = default);
    Task<Result> PauseSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken = default);
    Task<Result> ResumeSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken = default);
    Task<Result> UpdateSubscriptionAsync(string subscriptionId, UpdateSubscriptionRequest request, CancellationToken cancellationToken = default);

    // Customer Portal
    Task<Result<string>> GetCustomerPortalUrlAsync(string customerId, CancellationToken cancellationToken = default);

    // Webhooks
    Task<Result> ProcessWebhookAsync(string payload, string signature, CancellationToken cancellationToken = default);
    Task<bool> ValidateWebhookSignatureAsync(string payload, string signature, CancellationToken cancellationToken = default);
    bool ValidateWebhookSignature(string payload, string signature);

    // Products & Variants
    Task<Result<List<LsProduct>>> GetProductsAsync(CancellationToken cancellationToken = default);
    Task<Result<List<LsVariant>>> GetVariantsAsync(string productId, CancellationToken cancellationToken = default);
}

#region Request/Response DTOs

public record CreateCheckoutRequest
{
    public Guid TenantId { get; init; }
    public string VariantId { get; init; } = string.Empty;
    public string CustomerEmail { get; init; } = string.Empty;
    public string? CustomerName { get; init; }
    public string? SuccessUrl { get; init; }
    public string? CancelUrl { get; init; }
    public Dictionary<string, string>? CustomData { get; init; }
    public bool? EnabledTaxes { get; init; }
}

public record CheckoutResponse
{
    public string CheckoutUrl { get; init; } = string.Empty;
    public string CheckoutId { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
}

public record UpdateSubscriptionRequest
{
    public string? VariantId { get; init; }
    public bool? Pause { get; init; }
    public bool? Cancelled { get; init; }
    public string? InvoicingEmail { get; init; }
}

public record LsSubscriptionInfo
{
    public string Id { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string StatusFormatted { get; init; } = string.Empty;
    public string ProductId { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string VariantId { get; init; } = string.Empty;
    public string VariantName { get; init; } = string.Empty;
    public string CustomerId { get; init; } = string.Empty;
    public string CustomerEmail { get; init; } = string.Empty;
    public int UnitPrice { get; init; }
    public string Currency { get; init; } = string.Empty;
    public string BillingInterval { get; init; } = string.Empty;
    public int BillingIntervalCount { get; init; }
    public DateTime? TrialEndsAt { get; init; }
    public DateTime? RenewsAt { get; init; }
    public DateTime? EndsAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public string? CardBrand { get; init; }
    public string? CardLastFour { get; init; }
    public LsUrls Urls { get; init; } = new();
}

public record LsUrls
{
    public string? UpdatePaymentMethod { get; init; }
    public string? CustomerPortal { get; init; }
}

public record LsProduct
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Status { get; init; } = string.Empty;
    public int Price { get; init; }
    public string? PriceFormatted { get; init; }
    public bool IsSubscription { get; init; }
}

public record LsVariant
{
    public string Id { get; init; } = string.Empty;
    public string ProductId { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public int Price { get; init; }
    public string? PriceFormatted { get; init; }
    public string? Interval { get; init; }
    public int? IntervalCount { get; init; }
    public bool IsSubscription { get; init; }
}

#endregion
