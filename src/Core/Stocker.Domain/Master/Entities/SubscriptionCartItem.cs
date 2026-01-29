using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Item in a subscription cart (module, bundle, add-on, storage, users)
/// </summary>
public sealed class SubscriptionCartItem : Entity
{
    public Guid CartId { get; private set; }
    public CartItemType ItemType { get; private set; }
    public Guid ItemId { get; private set; }  // Reference to ModulePricing, ModuleBundle, AddOn, etc.
    public string ItemCode { get; private set; }
    public string ItemName { get; private set; }
    public Money UnitPrice { get; private set; }
    public int Quantity { get; private set; }
    public Money LineTotal => Money.Create(UnitPrice.Amount * Quantity, UnitPrice.Currency);

    // Item-specific metadata (JSON or nullable columns)
    public int? TrialDays { get; private set; }           // For modules
    public decimal? DiscountPercent { get; private set; } // For bundles
    public string? IncludedModuleCodesJson { get; private set; }  // For bundles
    public string? RequiredModuleCode { get; private set; }  // For add-ons
    public int? StorageGB { get; private set; }           // For storage plans

    public DateTime AddedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public List<string>? IncludedModuleCodes
    {
        get
        {
            if (string.IsNullOrEmpty(IncludedModuleCodesJson))
                return null;
            return System.Text.Json.JsonSerializer.Deserialize<List<string>>(IncludedModuleCodesJson);
        }
    }

    private SubscriptionCartItem() { } // EF Constructor

    private SubscriptionCartItem(
        Guid cartId,
        CartItemType itemType,
        Guid itemId,
        string itemCode,
        string itemName,
        Money unitPrice,
        int quantity = 1)
    {
        Id = Guid.NewGuid();
        CartId = cartId;
        ItemType = itemType;
        ItemId = itemId;
        ItemCode = itemCode;
        ItemName = itemName;
        UnitPrice = unitPrice;
        Quantity = quantity;
        AddedAt = DateTime.UtcNow;
    }

    public static SubscriptionCartItem CreateModule(
        Guid cartId,
        Guid modulePricingId,
        string moduleCode,
        string moduleName,
        Money price,
        int? trialDays = null)
    {
        var item = new SubscriptionCartItem(
            cartId, CartItemType.Module, modulePricingId, moduleCode, moduleName, price, 1)
        {
            TrialDays = trialDays
        };
        return item;
    }

    public static SubscriptionCartItem CreateBundle(
        Guid cartId,
        Guid bundleId,
        string bundleCode,
        string bundleName,
        Money price,
        decimal discountPercent,
        List<string> includedModuleCodes)
    {
        var item = new SubscriptionCartItem(
            cartId, CartItemType.Bundle, bundleId, bundleCode, bundleName, price, 1)
        {
            DiscountPercent = discountPercent,
            IncludedModuleCodesJson = System.Text.Json.JsonSerializer.Serialize(includedModuleCodes)
        };
        return item;
    }

    public static SubscriptionCartItem CreateAddOn(
        Guid cartId,
        Guid addOnId,
        string addOnCode,
        string addOnName,
        Money price,
        int quantity = 1,
        string? requiredModuleCode = null)
    {
        var item = new SubscriptionCartItem(
            cartId, CartItemType.AddOn, addOnId, addOnCode, addOnName, price, quantity)
        {
            RequiredModuleCode = requiredModuleCode
        };
        return item;
    }

    public static SubscriptionCartItem CreateStoragePlan(
        Guid cartId,
        Guid storagePlanId,
        string planCode,
        string planName,
        Money price,
        int storageGB)
    {
        var item = new SubscriptionCartItem(
            cartId, CartItemType.StoragePlan, storagePlanId, planCode, planName, price, 1)
        {
            StorageGB = storageGB
        };
        return item;
    }

    public static SubscriptionCartItem CreateUsers(
        Guid cartId,
        Guid userTierId,
        string tierCode,
        string tierName,
        Money pricePerUser,
        int userCount)
    {
        return new SubscriptionCartItem(
            cartId, CartItemType.Users, userTierId, tierCode, tierName, pricePerUser, userCount);
    }

    public void UpdateQuantity(int newQuantity)
    {
        if (ItemType != CartItemType.AddOn && ItemType != CartItemType.Users)
            throw new InvalidOperationException("Only add-ons and users can have quantity updated.");

        if (newQuantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.", nameof(newQuantity));

        Quantity = newQuantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdatePrice(Money newPrice)
    {
        UnitPrice = newPrice;
        UpdatedAt = DateTime.UtcNow;
    }
}
