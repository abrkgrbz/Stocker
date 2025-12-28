using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Tracks Lemon Squeezy subscription data for a tenant.
/// Links the internal Subscription entity with Lemon Squeezy's external IDs.
/// </summary>
public class LemonSqueezySubscription : Entity<Guid>
{
    public Guid TenantId { get; private set; }
    public Guid? SubscriptionId { get; private set; }  // FK to internal Subscription

    // Lemon Squeezy External IDs
    public string LsSubscriptionId { get; private set; } = string.Empty;
    public string LsCustomerId { get; private set; } = string.Empty;
    public string LsProductId { get; private set; } = string.Empty;
    public string LsVariantId { get; private set; } = string.Empty;
    public string? LsOrderId { get; private set; }

    // Subscription Status from Lemon Squeezy
    public LemonSqueezyStatus Status { get; private set; }
    public string StatusFormatted { get; private set; } = string.Empty;

    // Important Dates
    public DateTime? TrialEndsAt { get; private set; }
    public DateTime? RenewsAt { get; private set; }
    public DateTime? EndsAt { get; private set; }
    public DateTime? PausedAt { get; private set; }
    public DateTime? CancelledAt { get; private set; }

    // Billing Info
    public string? CardBrand { get; private set; }
    public string? CardLastFour { get; private set; }
    public string BillingAnchor { get; private set; } = string.Empty;

    // Pricing
    public int UnitPrice { get; private set; }  // In cents
    public string Currency { get; private set; } = "TRY";
    public string BillingInterval { get; private set; } = "month";  // month, year
    public int BillingIntervalCount { get; private set; } = 1;

    // Customer Portal
    public string? CustomerPortalUrl { get; private set; }
    public string? UpdatePaymentMethodUrl { get; private set; }

    // Metadata
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    public string? LastWebhookEventId { get; private set; }
    public DateTime? LastWebhookAt { get; private set; }

    private LemonSqueezySubscription() { } // EF Constructor

    public static LemonSqueezySubscription Create(
        Guid tenantId,
        string lsSubscriptionId,
        string lsCustomerId,
        string lsProductId,
        string lsVariantId)
    {
        return new LemonSqueezySubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            LsSubscriptionId = lsSubscriptionId,
            LsCustomerId = lsCustomerId,
            LsProductId = lsProductId,
            LsVariantId = lsVariantId,
            Status = LemonSqueezyStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void LinkToSubscription(Guid subscriptionId)
    {
        SubscriptionId = subscriptionId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateFromWebhook(
        LemonSqueezyStatus status,
        string statusFormatted,
        DateTime? trialEndsAt,
        DateTime? renewsAt,
        DateTime? endsAt,
        string? cardBrand,
        string? cardLastFour,
        int unitPrice,
        string currency,
        string billingInterval,
        int billingIntervalCount,
        string? customerPortalUrl,
        string? updatePaymentMethodUrl,
        string webhookEventId)
    {
        Status = status;
        StatusFormatted = statusFormatted;
        TrialEndsAt = trialEndsAt;
        RenewsAt = renewsAt;
        EndsAt = endsAt;
        CardBrand = cardBrand;
        CardLastFour = cardLastFour;
        UnitPrice = unitPrice;
        Currency = currency;
        BillingInterval = billingInterval;
        BillingIntervalCount = billingIntervalCount;
        CustomerPortalUrl = customerPortalUrl;
        UpdatePaymentMethodUrl = updatePaymentMethodUrl;
        LastWebhookEventId = webhookEventId;
        LastWebhookAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetOrderId(string orderId)
    {
        LsOrderId = orderId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsPaused()
    {
        Status = LemonSqueezyStatus.Paused;
        PausedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsResumed()
    {
        Status = LemonSqueezyStatus.Active;
        PausedAt = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsCancelled()
    {
        Status = LemonSqueezyStatus.Cancelled;
        CancelledAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsExpired()
    {
        Status = LemonSqueezyStatus.Expired;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsActive => Status == LemonSqueezyStatus.Active || Status == LemonSqueezyStatus.OnTrial;
    public bool IsPaused => Status == LemonSqueezyStatus.Paused;
    public bool IsCancelled => Status == LemonSqueezyStatus.Cancelled;
    public bool IsExpired => Status == LemonSqueezyStatus.Expired;
    public bool IsPastDue => Status == LemonSqueezyStatus.PastDue;
}

/// <summary>
/// Lemon Squeezy subscription statuses
/// </summary>
public enum LemonSqueezyStatus
{
    OnTrial = 0,
    Active = 1,
    Paused = 2,
    PastDue = 3,
    Unpaid = 4,
    Cancelled = 5,
    Expired = 6
}
