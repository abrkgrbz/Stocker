using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Item in a subscription order (copied from cart for historical record)
/// </summary>
public sealed class SubscriptionOrderItem : Entity
{
    public Guid OrderId { get; private set; }
    public CartItemType ItemType { get; private set; }
    public Guid ItemId { get; private set; }
    public string ItemCode { get; private set; }
    public string ItemName { get; private set; }
    public Money UnitPrice { get; private set; }
    public int Quantity { get; private set; }
    public Money LineTotal { get; private set; }

    // Activation status
    public bool IsActivated { get; private set; }
    public DateTime? ActivatedAt { get; private set; }
    public string? ActivationError { get; private set; }

    // Item-specific metadata (denormalized from cart for historical record)
    public int? TrialDays { get; private set; }
    public decimal? DiscountPercent { get; private set; }
    public string? IncludedModuleCodesJson { get; private set; }
    public string? RequiredModuleCode { get; private set; }
    public int? StorageGB { get; private set; }

    public List<string>? IncludedModuleCodes
    {
        get
        {
            if (string.IsNullOrEmpty(IncludedModuleCodesJson))
                return null;
            return System.Text.Json.JsonSerializer.Deserialize<List<string>>(IncludedModuleCodesJson);
        }
    }

    private SubscriptionOrderItem() { } // EF Constructor

    private SubscriptionOrderItem(
        Guid orderId,
        CartItemType itemType,
        Guid itemId,
        string itemCode,
        string itemName,
        Money unitPrice,
        int quantity,
        Money lineTotal)
    {
        Id = Guid.NewGuid();
        OrderId = orderId;
        ItemType = itemType;
        ItemId = itemId;
        ItemCode = itemCode;
        ItemName = itemName;
        UnitPrice = unitPrice;
        Quantity = quantity;
        LineTotal = lineTotal;
        IsActivated = false;
    }

    public static SubscriptionOrderItem CreateFromCartItem(Guid orderId, SubscriptionCartItem cartItem)
    {
        var item = new SubscriptionOrderItem(
            orderId,
            cartItem.ItemType,
            cartItem.ItemId,
            cartItem.ItemCode,
            cartItem.ItemName,
            cartItem.UnitPrice,
            cartItem.Quantity,
            cartItem.LineTotal)
        {
            TrialDays = cartItem.TrialDays,
            DiscountPercent = cartItem.DiscountPercent,
            IncludedModuleCodesJson = cartItem.IncludedModuleCodesJson,
            RequiredModuleCode = cartItem.RequiredModuleCode,
            StorageGB = cartItem.StorageGB
        };

        return item;
    }

    /// <summary>
    /// Mark this item as activated (feature unlocked)
    /// </summary>
    public void MarkAsActivated()
    {
        IsActivated = true;
        ActivatedAt = DateTime.UtcNow;
        ActivationError = null;
    }

    /// <summary>
    /// Mark activation as failed
    /// </summary>
    public void MarkActivationFailed(string error)
    {
        IsActivated = false;
        ActivationError = error;
    }
}
