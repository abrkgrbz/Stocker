using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Shopping cart for subscription items (modules, bundles, add-ons)
/// Each tenant can have one active cart at a time
/// </summary>
public sealed class SubscriptionCart : AggregateRoot
{
    private readonly List<SubscriptionCartItem> _items = new();

    public Guid TenantId { get; private set; }
    public Guid? UserId { get; private set; }  // MasterUser who created the cart
    public CartStatus Status { get; private set; }
    public BillingCycle BillingCycle { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }  // Cart expiration (e.g., 24 hours)

    // Coupon/Discount tracking
    public string? CouponCode { get; private set; }
    public decimal DiscountPercent { get; private set; }
    public decimal DiscountAmount { get; private set; }

    public IReadOnlyList<SubscriptionCartItem> Items => _items.AsReadOnly();

    // Calculated properties
    public Money SubTotal => CalculateSubTotal();
    public Money DiscountTotal => CalculateDiscountTotal();
    public Money Total => CalculateTotal();
    public int ItemCount => _items.Count;
    public bool IsEmpty => !_items.Any();
    public bool HasExpired => ExpiresAt.HasValue && DateTime.UtcNow > ExpiresAt;

    private SubscriptionCart() { } // EF Constructor

    private SubscriptionCart(
        Guid tenantId,
        Guid? userId,
        BillingCycle billingCycle,
        string currency = "TRY")
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        UserId = userId;
        Status = CartStatus.Active;
        BillingCycle = billingCycle;
        Currency = currency;
        CreatedAt = DateTime.UtcNow;
        ExpiresAt = DateTime.UtcNow.AddHours(24); // Default 24 hour expiration
    }

    public static SubscriptionCart Create(
        Guid tenantId,
        Guid? userId,
        BillingCycle billingCycle,
        string currency = "TRY")
    {
        return new SubscriptionCart(tenantId, userId, billingCycle, currency);
    }

    /// <summary>
    /// Add a module to the cart
    /// </summary>
    public void AddModule(
        Guid modulePricingId,
        string moduleCode,
        string moduleName,
        Money price,
        int? trialDays = null)
    {
        ValidateCartState();

        if (_items.Any(i => i.ItemType == CartItemType.Module && i.ItemCode == moduleCode))
            throw new InvalidOperationException($"Module '{moduleCode}' already exists in cart.");

        _items.Add(SubscriptionCartItem.CreateModule(
            Id, modulePricingId, moduleCode, moduleName, price, trialDays));

        UpdateTimestamp();
    }

    /// <summary>
    /// Add a bundle to the cart
    /// </summary>
    public void AddBundle(
        Guid bundleId,
        string bundleCode,
        string bundleName,
        Money price,
        decimal discountPercent,
        List<string> includedModuleCodes)
    {
        ValidateCartState();

        if (_items.Any(i => i.ItemType == CartItemType.Bundle && i.ItemCode == bundleCode))
            throw new InvalidOperationException($"Bundle '{bundleCode}' already exists in cart.");

        // Remove individual modules that are part of this bundle
        var modulesToRemove = _items
            .Where(i => i.ItemType == CartItemType.Module && includedModuleCodes.Contains(i.ItemCode))
            .ToList();

        foreach (var module in modulesToRemove)
        {
            _items.Remove(module);
        }

        _items.Add(SubscriptionCartItem.CreateBundle(
            Id, bundleId, bundleCode, bundleName, price, discountPercent, includedModuleCodes));

        UpdateTimestamp();
    }

    /// <summary>
    /// Add an add-on to the cart
    /// </summary>
    public void AddAddOn(
        Guid addOnId,
        string addOnCode,
        string addOnName,
        Money price,
        int quantity = 1,
        string? requiredModuleCode = null)
    {
        ValidateCartState();

        // Check if required module exists in cart or current subscription
        if (!string.IsNullOrEmpty(requiredModuleCode))
        {
            var hasRequiredModule = _items.Any(i =>
                (i.ItemType == CartItemType.Module && i.ItemCode == requiredModuleCode) ||
                (i.ItemType == CartItemType.Bundle && i.IncludedModuleCodes?.Contains(requiredModuleCode) == true));

            if (!hasRequiredModule)
            {
                // This will be validated against existing subscription modules during checkout
            }
        }

        var existingAddOn = _items.FirstOrDefault(i => i.ItemType == CartItemType.AddOn && i.ItemCode == addOnCode);
        if (existingAddOn != null)
        {
            // Update quantity instead of adding duplicate
            existingAddOn.UpdateQuantity(existingAddOn.Quantity + quantity);
        }
        else
        {
            _items.Add(SubscriptionCartItem.CreateAddOn(
                Id, addOnId, addOnCode, addOnName, price, quantity, requiredModuleCode));
        }

        UpdateTimestamp();
    }

    /// <summary>
    /// Add a storage plan to the cart
    /// </summary>
    public void AddStoragePlan(
        Guid storagePlanId,
        string planCode,
        string planName,
        Money price,
        int storageGB)
    {
        ValidateCartState();

        // Remove any existing storage plan (only one can be active)
        var existingPlan = _items.FirstOrDefault(i => i.ItemType == CartItemType.StoragePlan);
        if (existingPlan != null)
        {
            _items.Remove(existingPlan);
        }

        _items.Add(SubscriptionCartItem.CreateStoragePlan(
            Id, storagePlanId, planCode, planName, price, storageGB));

        UpdateTimestamp();
    }

    /// <summary>
    /// Add additional users to the cart
    /// </summary>
    public void AddUsers(
        Guid userTierId,
        string tierCode,
        string tierName,
        Money pricePerUser,
        int userCount)
    {
        ValidateCartState();

        if (userCount <= 0)
            throw new ArgumentException("User count must be greater than zero.", nameof(userCount));

        // Remove any existing user tier (replace with new selection)
        var existingUsers = _items.FirstOrDefault(i => i.ItemType == CartItemType.Users);
        if (existingUsers != null)
        {
            _items.Remove(existingUsers);
        }

        _items.Add(SubscriptionCartItem.CreateUsers(
            Id, userTierId, tierCode, tierName, pricePerUser, userCount));

        UpdateTimestamp();
    }

    /// <summary>
    /// Remove an item from the cart
    /// </summary>
    public void RemoveItem(Guid itemId)
    {
        ValidateCartState();

        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new InvalidOperationException("Item not found in cart.");

        _items.Remove(item);
        UpdateTimestamp();
    }

    /// <summary>
    /// Update quantity for an item (add-ons, users)
    /// </summary>
    public void UpdateItemQuantity(Guid itemId, int newQuantity)
    {
        ValidateCartState();

        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new InvalidOperationException("Item not found in cart.");

        if (item.ItemType != CartItemType.AddOn && item.ItemType != CartItemType.Users)
            throw new InvalidOperationException("Only add-ons and users can have quantity updated.");

        if (newQuantity <= 0)
        {
            _items.Remove(item);
        }
        else
        {
            item.UpdateQuantity(newQuantity);
        }

        UpdateTimestamp();
    }

    /// <summary>
    /// Apply a coupon code
    /// </summary>
    public void ApplyCoupon(string couponCode, decimal discountPercent, decimal maxDiscountAmount)
    {
        ValidateCartState();

        if (string.IsNullOrWhiteSpace(couponCode))
            throw new ArgumentException("Coupon code cannot be empty.", nameof(couponCode));

        if (discountPercent < 0 || discountPercent > 100)
            throw new ArgumentException("Discount percent must be between 0 and 100.", nameof(discountPercent));

        CouponCode = couponCode;
        DiscountPercent = discountPercent;

        // Calculate actual discount amount (capped at max)
        var calculatedDiscount = SubTotal.Amount * (discountPercent / 100);
        DiscountAmount = Math.Min(calculatedDiscount, maxDiscountAmount);

        UpdateTimestamp();
    }

    /// <summary>
    /// Remove applied coupon
    /// </summary>
    public void RemoveCoupon()
    {
        ValidateCartState();

        CouponCode = null;
        DiscountPercent = 0;
        DiscountAmount = 0;

        UpdateTimestamp();
    }

    /// <summary>
    /// Change billing cycle (recalculates all prices)
    /// </summary>
    public void ChangeBillingCycle(BillingCycle newCycle)
    {
        ValidateCartState();

        if (BillingCycle == newCycle)
            return;

        BillingCycle = newCycle;
        // Note: Prices should be recalculated by the application layer
        // by calling the appropriate pricing service

        UpdateTimestamp();
    }

    /// <summary>
    /// Clear all items from cart
    /// </summary>
    public void Clear()
    {
        ValidateCartState();

        _items.Clear();
        CouponCode = null;
        DiscountPercent = 0;
        DiscountAmount = 0;

        UpdateTimestamp();
    }

    /// <summary>
    /// Mark cart as checked out (payment pending)
    /// </summary>
    public void StartCheckout()
    {
        if (Status != CartStatus.Active)
            throw new InvalidOperationException("Only active carts can start checkout.");

        if (IsEmpty)
            throw new InvalidOperationException("Cannot checkout an empty cart.");

        Status = CartStatus.CheckoutPending;
        UpdateTimestamp();
    }

    /// <summary>
    /// Mark cart as completed (payment successful, features unlocked)
    /// </summary>
    public void Complete(string? transactionId = null)
    {
        if (Status != CartStatus.CheckoutPending)
            throw new InvalidOperationException("Only carts in checkout can be completed.");

        Status = CartStatus.Completed;
        UpdateTimestamp();
    }

    /// <summary>
    /// Mark checkout as failed
    /// </summary>
    public void FailCheckout(string reason)
    {
        if (Status != CartStatus.CheckoutPending)
            throw new InvalidOperationException("Only carts in checkout can be failed.");

        Status = CartStatus.Active; // Return to active for retry
        UpdateTimestamp();
    }

    /// <summary>
    /// Expire the cart
    /// </summary>
    public void Expire()
    {
        Status = CartStatus.Expired;
        UpdateTimestamp();
    }

    /// <summary>
    /// Abandon the cart
    /// </summary>
    public void Abandon()
    {
        Status = CartStatus.Abandoned;
        UpdateTimestamp();
    }

    /// <summary>
    /// Extend cart expiration
    /// </summary>
    public void ExtendExpiration(TimeSpan extension)
    {
        ValidateCartState();

        ExpiresAt = (ExpiresAt ?? DateTime.UtcNow).Add(extension);
        UpdateTimestamp();
    }

    private void ValidateCartState()
    {
        if (Status != CartStatus.Active)
            throw new InvalidOperationException($"Cart is not active. Current status: {Status}");

        if (HasExpired)
            throw new InvalidOperationException("Cart has expired.");
    }

    private Money CalculateSubTotal()
    {
        var total = _items.Sum(i => i.LineTotal.Amount);
        return Money.Create(total, Currency);
    }

    private Money CalculateDiscountTotal()
    {
        // Bundle discounts are already reflected in item prices
        // Additional coupon discount
        return Money.Create(DiscountAmount, Currency);
    }

    private Money CalculateTotal()
    {
        return Money.Create(SubTotal.Amount - DiscountAmount, Currency);
    }

    private void UpdateTimestamp()
    {
        UpdatedAt = DateTime.UtcNow;
    }
}
