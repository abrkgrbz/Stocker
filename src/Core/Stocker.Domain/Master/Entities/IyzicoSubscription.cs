using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Tracks Iyzico subscription data for a tenant.
/// Links the internal Subscription entity with Iyzico's external IDs.
/// </summary>
public class IyzicoSubscription : Entity<Guid>
{
    public Guid TenantId { get; private set; }
    public Tenant Tenant { get; private set; } = null!;
    public Guid? SubscriptionId { get; private set; }

    // Iyzico External IDs
    public string IyzicoSubscriptionReferenceCode { get; private set; } = string.Empty;
    public string IyzicoCustomerReferenceCode { get; private set; } = string.Empty;
    public string IyzicoPricingPlanReferenceCode { get; private set; } = string.Empty;
    public string? IyzicoParentReferenceCode { get; private set; }

    // Customer Info
    public string CustomerEmail { get; private set; } = string.Empty;
    public string? CustomerName { get; private set; }
    public string? CustomerGsmNumber { get; private set; }
    public string? CustomerIdentityNumber { get; private set; }

    // Plan Info
    public string? PlanName { get; private set; }
    public string? ProductName { get; private set; }

    // Subscription Status
    public IyzicoSubscriptionStatus Status { get; private set; }

    // Important Dates
    public DateTime? TrialStartDate { get; private set; }
    public DateTime? TrialEndDate { get; private set; }
    public DateTime? StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }

    // Billing Info
    public string? CardToken { get; private set; }
    public string? CardBrand { get; private set; }
    public string? CardLastFour { get; private set; }
    public string? CardHolderName { get; private set; }
    public string? CardAssociation { get; private set; }  // VISA, MASTERCARD, etc.
    public string? CardFamily { get; private set; }  // Bonus, Maximum, etc.

    // Pricing
    public decimal Price { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public string BillingPeriod { get; private set; } = "MONTHLY";  // MONTHLY, YEARLY, WEEKLY
    public int BillingPeriodCount { get; private set; } = 1;

    // Installment
    public int? InstallmentCount { get; private set; }
    public decimal? InstallmentPrice { get; private set; }

    // Address Info (required by Iyzico for 3D Secure)
    public string? BillingAddress { get; private set; }
    public string? BillingCity { get; private set; }
    public string? BillingCountry { get; private set; }
    public string? BillingZipCode { get; private set; }

    // Metadata
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    public string? LastWebhookEventId { get; private set; }
    public DateTime? LastWebhookAt { get; private set; }
    public string? FailureReason { get; private set; }
    public int RetryCount { get; private set; }

    private IyzicoSubscription() { } // EF Constructor

    public static IyzicoSubscription Create(
        Guid tenantId,
        string subscriptionReferenceCode,
        string customerReferenceCode,
        string pricingPlanReferenceCode,
        string customerEmail)
    {
        return new IyzicoSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            IyzicoSubscriptionReferenceCode = subscriptionReferenceCode,
            IyzicoCustomerReferenceCode = customerReferenceCode,
            IyzicoPricingPlanReferenceCode = pricingPlanReferenceCode,
            CustomerEmail = customerEmail,
            Status = IyzicoSubscriptionStatus.Active,
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
        IyzicoSubscriptionStatus status,
        DateTime? startDate,
        DateTime? endDate,
        DateTime? trialStartDate,
        DateTime? trialEndDate,
        decimal price,
        string currency,
        string billingPeriod,
        int billingPeriodCount,
        string webhookEventId)
    {
        Status = status;
        StartDate = startDate;
        EndDate = endDate;
        TrialStartDate = trialStartDate;
        TrialEndDate = trialEndDate;
        Price = price;
        Currency = currency;
        BillingPeriod = billingPeriod;
        BillingPeriodCount = billingPeriodCount;
        LastWebhookEventId = webhookEventId;
        LastWebhookAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetParentReferenceCode(string parentReferenceCode)
    {
        IyzicoParentReferenceCode = parentReferenceCode;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdatePaymentInfo(
        string? cardToken,
        string? cardBrand,
        string? cardLastFour,
        string? cardHolderName,
        string? cardAssociation,
        string? cardFamily)
    {
        CardToken = cardToken;
        CardBrand = cardBrand;
        CardLastFour = cardLastFour;
        CardHolderName = cardHolderName;
        CardAssociation = cardAssociation;
        CardFamily = cardFamily;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateCustomerInfo(
        string? customerName,
        string? customerGsmNumber,
        string? customerIdentityNumber)
    {
        CustomerName = customerName;
        CustomerGsmNumber = customerGsmNumber;
        CustomerIdentityNumber = customerIdentityNumber;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateBillingAddress(
        string? address,
        string? city,
        string? country,
        string? zipCode)
    {
        BillingAddress = address;
        BillingCity = city;
        BillingCountry = country;
        BillingZipCode = zipCode;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPlanInfo(string? planName, string? productName)
    {
        PlanName = planName;
        ProductName = productName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetInstallmentInfo(int? installmentCount, decimal? installmentPrice)
    {
        InstallmentCount = installmentCount;
        InstallmentPrice = installmentPrice;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsActive()
    {
        Status = IyzicoSubscriptionStatus.Active;
        FailureReason = null;
        RetryCount = 0;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsPending()
    {
        Status = IyzicoSubscriptionStatus.Pending;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsCancelled()
    {
        Status = IyzicoSubscriptionStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsExpired()
    {
        Status = IyzicoSubscriptionStatus.Expired;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsUpgraded()
    {
        Status = IyzicoSubscriptionStatus.Upgraded;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsFailed(string? reason)
    {
        Status = IyzicoSubscriptionStatus.Failed;
        FailureReason = reason;
        RetryCount++;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsUnpaid()
    {
        Status = IyzicoSubscriptionStatus.Unpaid;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsActive => Status == IyzicoSubscriptionStatus.Active;
    public bool IsPending => Status == IyzicoSubscriptionStatus.Pending;
    public bool IsCancelled => Status == IyzicoSubscriptionStatus.Cancelled;
    public bool IsExpired => Status == IyzicoSubscriptionStatus.Expired;
    public bool IsFailed => Status == IyzicoSubscriptionStatus.Failed;
    public bool IsUnpaid => Status == IyzicoSubscriptionStatus.Unpaid;
    public bool IsInTrial => TrialEndDate.HasValue && TrialEndDate > DateTime.UtcNow;
}

/// <summary>
/// Iyzico subscription statuses
/// </summary>
public enum IyzicoSubscriptionStatus
{
    /// <summary>
    /// Ödeme bekleniyor
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Aktif abonelik
    /// </summary>
    Active = 1,

    /// <summary>
    /// Ödeme başarısız
    /// </summary>
    Unpaid = 2,

    /// <summary>
    /// İptal edildi
    /// </summary>
    Cancelled = 3,

    /// <summary>
    /// Süresi doldu
    /// </summary>
    Expired = 4,

    /// <summary>
    /// Üst plana geçildi
    /// </summary>
    Upgraded = 5,

    /// <summary>
    /// Ödeme hatası
    /// </summary>
    Failed = 6
}
