using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Primitives;
using PaymentMethodEnum = Stocker.Domain.Master.Enums.PaymentMethod;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Order created from a cart checkout
/// Tracks the purchase and connects to payment/subscription
/// </summary>
public sealed class SubscriptionOrder : AggregateRoot
{
    private readonly List<SubscriptionOrderItem> _items = new();

    public string OrderNumber { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid? UserId { get; private set; }
    public Guid CartId { get; private set; }
    public Guid? SubscriptionId { get; private set; }  // Linked subscription after activation
    public OrderStatus Status { get; private set; }

    // Billing information
    public BillingCycle BillingCycle { get; private set; }
    public Money SubTotal { get; private set; }
    public Money DiscountTotal { get; private set; }
    public Money TaxAmount { get; private set; }
    public Money Total { get; private set; }

    // Coupon tracking
    public string? CouponCode { get; private set; }
    public decimal CouponDiscountPercent { get; private set; }

    // Payment information
    public PaymentMethodEnum? PaymentMethod { get; private set; }
    public string? PaymentProviderOrderId { get; private set; }  // Iyzico order ID
    public string? PaymentProviderToken { get; private set; }    // Iyzico checkout token
    public DateTime? PaymentInitiatedAt { get; private set; }
    public DateTime? PaymentCompletedAt { get; private set; }
    public string? PaymentFailureReason { get; private set; }

    // Timestamps
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    public string? CancellationReason { get; private set; }

    // Billing address (for invoice)
    public string? BillingName { get; private set; }
    public string? BillingAddress { get; private set; }
    public string? BillingCity { get; private set; }
    public string? BillingCountry { get; private set; }
    public string? BillingZipCode { get; private set; }
    public string? TaxId { get; private set; }

    public IReadOnlyList<SubscriptionOrderItem> Items => _items.AsReadOnly();

    private SubscriptionOrder() { } // EF Constructor

    private SubscriptionOrder(
        Guid tenantId,
        Guid? userId,
        Guid cartId,
        BillingCycle billingCycle,
        Money subTotal,
        Money discountTotal,
        Money total,
        string? couponCode = null,
        decimal couponDiscountPercent = 0)
    {
        Id = Guid.NewGuid();
        OrderNumber = GenerateOrderNumber();
        TenantId = tenantId;
        UserId = userId;
        CartId = cartId;
        Status = OrderStatus.Pending;
        BillingCycle = billingCycle;
        SubTotal = subTotal;
        DiscountTotal = discountTotal;
        TaxAmount = Money.Create(0, total.Currency); // TODO: Calculate tax if applicable
        Total = total;
        CouponCode = couponCode;
        CouponDiscountPercent = couponDiscountPercent;
        CreatedAt = DateTime.UtcNow;
    }

    public static SubscriptionOrder CreateFromCart(SubscriptionCart cart)
    {
        if (cart.IsEmpty)
            throw new InvalidOperationException("Cannot create order from empty cart.");

        var order = new SubscriptionOrder(
            cart.TenantId,
            cart.UserId,
            cart.Id,
            cart.BillingCycle,
            cart.SubTotal,
            cart.DiscountTotal,
            cart.Total,
            cart.CouponCode,
            cart.DiscountPercent);

        // Copy items from cart
        foreach (var cartItem in cart.Items)
        {
            order._items.Add(SubscriptionOrderItem.CreateFromCartItem(order.Id, cartItem));
        }

        return order;
    }

    /// <summary>
    /// Set billing address for the order
    /// </summary>
    public void SetBillingAddress(
        string name,
        string address,
        string city,
        string country,
        string? zipCode = null,
        string? taxId = null)
    {
        if (Status != OrderStatus.Pending)
            throw new InvalidOperationException("Cannot modify billing address after order is processing.");

        BillingName = name;
        BillingAddress = address;
        BillingCity = city;
        BillingCountry = country;
        BillingZipCode = zipCode;
        TaxId = taxId;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Initiate payment process
    /// </summary>
    public void InitiatePayment(
        PaymentMethodEnum method,
        string? providerOrderId = null,
        string? providerToken = null)
    {
        if (Status != OrderStatus.Pending)
            throw new InvalidOperationException("Payment can only be initiated for pending orders.");

        Status = OrderStatus.PaymentProcessing;
        PaymentMethod = method;
        PaymentProviderOrderId = providerOrderId;
        PaymentProviderToken = providerToken;
        PaymentInitiatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Mark payment as completed
    /// </summary>
    public void CompletePayment()
    {
        if (Status != OrderStatus.PaymentProcessing)
            throw new InvalidOperationException("Cannot complete payment for non-processing order.");

        Status = OrderStatus.PaymentCompleted;
        PaymentCompletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Mark payment as failed
    /// </summary>
    public void FailPayment(string reason)
    {
        if (Status != OrderStatus.PaymentProcessing)
            throw new InvalidOperationException("Cannot fail payment for non-processing order.");

        Status = OrderStatus.PaymentFailed;
        PaymentFailureReason = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Mark order as activating (unlocking features)
    /// </summary>
    public void StartActivation()
    {
        if (Status != OrderStatus.PaymentCompleted)
            throw new InvalidOperationException("Can only activate after payment is completed.");

        Status = OrderStatus.Activating;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Complete the order (all features activated)
    /// </summary>
    public void Complete(Guid subscriptionId)
    {
        if (Status != OrderStatus.Activating)
            throw new InvalidOperationException("Can only complete from activating status.");

        Status = OrderStatus.Completed;
        SubscriptionId = subscriptionId;
        CompletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Cancel the order
    /// </summary>
    public void Cancel(string reason)
    {
        if (Status == OrderStatus.Completed)
            throw new InvalidOperationException("Cannot cancel completed orders.");

        Status = OrderStatus.Cancelled;
        CancellationReason = reason;
        CancelledAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Request refund for completed order
    /// </summary>
    public void RequestRefund(string reason)
    {
        if (Status != OrderStatus.Completed)
            throw new InvalidOperationException("Can only refund completed orders.");

        Status = OrderStatus.RefundRequested;
        CancellationReason = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Complete refund
    /// </summary>
    public void CompleteRefund()
    {
        if (Status != OrderStatus.RefundRequested)
            throw new InvalidOperationException("Order must be in refund requested state.");

        Status = OrderStatus.Refunded;
        UpdatedAt = DateTime.UtcNow;
    }

    private static string GenerateOrderNumber()
    {
        return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
    }
}
