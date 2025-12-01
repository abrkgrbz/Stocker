using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Product bundle/kit that contains multiple products sold together
/// Supports dynamic pricing, assembly options, and inventory management
/// </summary>
public class ProductBundle : BaseEntity
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public BundleType BundleType { get; private set; }
    public BundlePricingType PricingType { get; private set; }
    public Money? FixedPrice { get; private set; }
    public decimal? DiscountPercentage { get; private set; }
    public decimal? DiscountAmount { get; private set; }
    public bool RequireAllItems { get; private set; }
    public int? MinSelectableItems { get; private set; }
    public int? MaxSelectableItems { get; private set; }
    public DateTime? ValidFrom { get; private set; }
    public DateTime? ValidTo { get; private set; }
    public bool IsActive { get; private set; }
    public string? ImageUrl { get; private set; }
    public int DisplayOrder { get; private set; }

    public virtual ICollection<ProductBundleItem> Items { get; private set; }

    protected ProductBundle() { }

    public ProductBundle(
        string code,
        string name,
        BundleType bundleType = BundleType.FixedBundle,
        BundlePricingType pricingType = BundlePricingType.SumOfItems)
    {
        Code = code;
        Name = name;
        BundleType = bundleType;
        PricingType = pricingType;
        RequireAllItems = true;
        IsActive = true;
        DisplayOrder = 0;
        Items = new List<ProductBundleItem>();
    }

    public void UpdateBundle(string name, string? description)
    {
        Name = name;
        Description = description;
    }

    public void SetPricing(BundlePricingType pricingType, Money? fixedPrice = null, decimal? discountPercentage = null, decimal? discountAmount = null)
    {
        PricingType = pricingType;
        FixedPrice = fixedPrice;
        DiscountPercentage = discountPercentage;
        DiscountAmount = discountAmount;
    }

    public void SetSelectableOptions(bool requireAll, int? minItems = null, int? maxItems = null)
    {
        RequireAllItems = requireAll;
        MinSelectableItems = minItems;
        MaxSelectableItems = maxItems;
    }

    public void SetValidityPeriod(DateTime? validFrom, DateTime? validTo)
    {
        if (validFrom.HasValue && validTo.HasValue && validFrom > validTo)
            throw new ArgumentException("ValidFrom cannot be after ValidTo");

        ValidFrom = validFrom;
        ValidTo = validTo;
    }

    public void SetImage(string? imageUrl)
    {
        ImageUrl = imageUrl;
    }

    public void SetDisplayOrder(int order)
    {
        DisplayOrder = order;
    }

    public ProductBundleItem AddItem(int productId, decimal quantity, bool isRequired = true)
    {
        var existingItem = Items.FirstOrDefault(i => i.ProductId == productId);
        if (existingItem != null)
            throw new InvalidOperationException("Product already exists in bundle");

        var item = new ProductBundleItem(Id, productId, quantity, isRequired);
        item.SetDisplayOrder(Items.Count);
        Items.Add(item);
        return item;
    }

    public void UpdateItem(int productId, decimal quantity)
    {
        var item = Items.FirstOrDefault(i => i.ProductId == productId);
        if (item == null)
            throw new InvalidOperationException("Product not found in bundle");

        item.UpdateQuantity(quantity);
    }

    public void RemoveItem(int productId)
    {
        var item = Items.FirstOrDefault(i => i.ProductId == productId);
        if (item != null)
        {
            Items.Remove(item);
        }
    }

    public bool IsValid()
    {
        var now = DateTime.UtcNow;

        if (ValidFrom.HasValue && now < ValidFrom.Value)
            return false;

        if (ValidTo.HasValue && now > ValidTo.Value)
            return false;

        return IsActive && Items.Any();
    }

    public Money CalculatePrice()
    {
        if (!Items.Any())
            return Money.Zero("TRY");

        switch (PricingType)
        {
            case BundlePricingType.FixedPrice:
                return FixedPrice ?? Money.Zero("TRY");

            case BundlePricingType.SumOfItems:
                // This would need product prices from Items
                // Actual calculation done in application layer
                return Money.Zero("TRY");

            case BundlePricingType.PercentageDiscount:
                // Actual calculation done in application layer
                return Money.Zero("TRY");

            case BundlePricingType.FixedDiscount:
                // Actual calculation done in application layer
                return Money.Zero("TRY");

            default:
                return Money.Zero("TRY");
        }
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Individual item in a product bundle
/// </summary>
public class ProductBundleItem : BaseEntity
{
    public int ProductBundleId { get; private set; }
    public int ProductId { get; private set; }
    public decimal Quantity { get; private set; }
    public bool IsRequired { get; private set; }
    public bool IsDefault { get; private set; }
    public Money? OverridePrice { get; private set; }
    public decimal? DiscountPercentage { get; private set; }
    public int DisplayOrder { get; private set; }
    public int? MinQuantity { get; private set; }
    public int? MaxQuantity { get; private set; }

    public virtual ProductBundle ProductBundle { get; private set; }
    public virtual Product Product { get; private set; }

    protected ProductBundleItem() { }

    public ProductBundleItem(int productBundleId, int productId, decimal quantity, bool isRequired = true)
    {
        ProductBundleId = productBundleId;
        ProductId = productId;
        Quantity = quantity;
        IsRequired = isRequired;
        IsDefault = true;
        DisplayOrder = 0;
    }

    public void UpdateQuantity(decimal quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");

        Quantity = quantity;
    }

    public void SetRequired(bool isRequired)
    {
        IsRequired = isRequired;
    }

    public void SetDefault(bool isDefault)
    {
        IsDefault = isDefault;
    }

    public void SetOverridePrice(Money? price)
    {
        OverridePrice = price;
    }

    public void SetDiscount(decimal? discountPercentage)
    {
        if (discountPercentage.HasValue && (discountPercentage < 0 || discountPercentage > 100))
            throw new ArgumentException("Discount percentage must be between 0 and 100");

        DiscountPercentage = discountPercentage;
    }

    public void SetQuantityLimits(int? minQuantity, int? maxQuantity)
    {
        if (minQuantity.HasValue && maxQuantity.HasValue && minQuantity > maxQuantity)
            throw new ArgumentException("MinQuantity cannot be greater than MaxQuantity");

        MinQuantity = minQuantity;
        MaxQuantity = maxQuantity;
    }

    public void SetDisplayOrder(int order)
    {
        DisplayOrder = order;
    }
}

/// <summary>
/// Type of product bundle
/// </summary>
public enum BundleType
{
    /// <summary>
    /// Fixed bundle - all items are included
    /// </summary>
    FixedBundle = 1,

    /// <summary>
    /// Configurable bundle - customer can select items
    /// </summary>
    ConfigurableBundle = 2,

    /// <summary>
    /// Kit - items are assembled into a new product
    /// </summary>
    Kit = 3,

    /// <summary>
    /// Pack - quantity-based bundle (e.g., 6-pack)
    /// </summary>
    Pack = 4,

    /// <summary>
    /// Combo - meal/promotional combo
    /// </summary>
    Combo = 5
}

/// <summary>
/// Pricing strategy for bundles
/// </summary>
public enum BundlePricingType
{
    /// <summary>
    /// Sum of individual item prices
    /// </summary>
    SumOfItems = 1,

    /// <summary>
    /// Fixed price for the entire bundle
    /// </summary>
    FixedPrice = 2,

    /// <summary>
    /// Percentage discount on sum of items
    /// </summary>
    PercentageDiscount = 3,

    /// <summary>
    /// Fixed amount discount on sum of items
    /// </summary>
    FixedDiscount = 4,

    /// <summary>
    /// Cheapest item free
    /// </summary>
    CheapestFree = 5,

    /// <summary>
    /// Buy X get Y pricing
    /// </summary>
    BuyXGetY = 6
}
