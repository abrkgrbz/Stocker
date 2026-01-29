using Stocker.Domain.Master.Enums;

namespace Stocker.Application.DTOs.Cart;

/// <summary>
/// Order DTO for API responses
/// </summary>
public class OrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public Guid? UserId { get; set; }
    public Guid CartId { get; set; }
    public Guid? SubscriptionId { get; set; }
    public OrderStatus Status { get; set; }
    public string StatusDisplay { get; set; } = string.Empty;

    // Billing
    public BillingCycle BillingCycle { get; set; }
    public string BillingCycleDisplay { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public decimal DiscountTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
    public string Currency { get; set; } = "TRY";

    // Coupon
    public string? CouponCode { get; set; }
    public decimal CouponDiscountPercent { get; set; }

    // Payment
    public PaymentMethod? PaymentMethod { get; set; }
    public string? PaymentMethodDisplay { get; set; }
    public string? PaymentProviderOrderId { get; set; }
    public DateTime? PaymentInitiatedAt { get; set; }
    public DateTime? PaymentCompletedAt { get; set; }
    public string? PaymentFailureReason { get; set; }

    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }

    // Billing Address
    public string? BillingName { get; set; }
    public string? BillingAddress { get; set; }
    public string? BillingCity { get; set; }
    public string? BillingCountry { get; set; }
    public string? BillingZipCode { get; set; }
    public string? TaxId { get; set; }

    // Items
    public List<OrderItemDto> Items { get; set; } = new();
}

/// <summary>
/// Order item DTO for API responses
/// </summary>
public class OrderItemDto
{
    public Guid Id { get; set; }
    public CartItemType ItemType { get; set; }
    public string ItemTypeDisplay { get; set; } = string.Empty;
    public Guid ItemId { get; set; }
    public string ItemCode { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
    public string Currency { get; set; } = "TRY";

    // Activation status
    public bool IsActivated { get; set; }
    public DateTime? ActivatedAt { get; set; }
    public string? ActivationError { get; set; }

    // Item-specific metadata
    public int? TrialDays { get; set; }
    public decimal? DiscountPercent { get; set; }
    public List<string>? IncludedModuleCodes { get; set; }
    public string? RequiredModuleCode { get; set; }
    public int? StorageGB { get; set; }
}

/// <summary>
/// Checkout initialization response
/// </summary>
public class CheckoutInitResponse
{
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public string Currency { get; set; } = "TRY";

    // Payment gateway info
    public string? PaymentProviderOrderId { get; set; }
    public string? CheckoutFormContent { get; set; }  // Iyzico checkout form HTML
    public string? CheckoutPageUrl { get; set; }       // Alternative: redirect URL
    public string? PaymentToken { get; set; }          // Token for client-side payment
}

/// <summary>
/// Billing address for checkout
/// </summary>
public class BillingAddressDto
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = "Türkiye";
    public string? ZipCode { get; set; }
    public string? TaxId { get; set; }
}

/// <summary>
/// Checkout request
/// </summary>
public class InitiateCheckoutRequest
{
    public BillingAddressDto BillingAddress { get; set; } = new();
    public string? CallbackUrl { get; set; }  // URL to redirect after payment
}
