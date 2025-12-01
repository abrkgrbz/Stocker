using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Product variant for products with multiple options (e.g., size, color)
/// Each variant can have its own SKU, price, and stock levels
/// </summary>
public class ProductVariant : BaseEntity
{
    public int ProductId { get; private set; }
    public string Sku { get; private set; }
    public string? Barcode { get; private set; }
    public string VariantName { get; private set; }
    public Money? Price { get; private set; }
    public Money? CostPrice { get; private set; }
    public Money? CompareAtPrice { get; private set; }
    public decimal? Weight { get; private set; }
    public string? WeightUnit { get; private set; }
    public string? Dimensions { get; private set; }
    public string? ImageUrl { get; private set; }
    public bool IsDefault { get; private set; }
    public bool IsActive { get; private set; }
    public bool TrackInventory { get; private set; }
    public bool AllowBackorder { get; private set; }
    public decimal LowStockThreshold { get; private set; }
    public int DisplayOrder { get; private set; }

    public virtual Product Product { get; private set; }
    public virtual ICollection<ProductVariantOption> Options { get; private set; }
    public virtual ICollection<Stock> Stocks { get; private set; }

    protected ProductVariant() { }

    public ProductVariant(int productId, string sku, string variantName)
    {
        ProductId = productId;
        Sku = sku;
        VariantName = variantName;
        IsDefault = false;
        IsActive = true;
        TrackInventory = true;
        AllowBackorder = false;
        LowStockThreshold = 0;
        DisplayOrder = 0;
        Options = new List<ProductVariantOption>();
        Stocks = new List<Stock>();
    }

    public void UpdateVariant(string sku, string variantName)
    {
        Sku = sku;
        VariantName = variantName;
    }

    public void SetBarcode(string? barcode)
    {
        Barcode = barcode;
    }

    public void SetPricing(Money? price, Money? costPrice = null, Money? compareAtPrice = null)
    {
        Price = price;
        CostPrice = costPrice;
        CompareAtPrice = compareAtPrice;
    }

    public void SetPhysicalProperties(decimal? weight, string? weightUnit, string? dimensions)
    {
        Weight = weight;
        WeightUnit = weightUnit;
        Dimensions = dimensions;
    }

    public void SetImage(string? imageUrl)
    {
        ImageUrl = imageUrl;
    }

    public void SetAsDefault()
    {
        IsDefault = true;
    }

    public void UnsetDefault()
    {
        IsDefault = false;
    }

    public void SetInventoryOptions(bool trackInventory, bool allowBackorder, decimal lowStockThreshold)
    {
        TrackInventory = trackInventory;
        AllowBackorder = allowBackorder;
        LowStockThreshold = lowStockThreshold;
    }

    public void SetDisplayOrder(int order)
    {
        DisplayOrder = order;
    }

    public ProductVariantOption AddOption(int attributeId, int optionId, string value)
    {
        var existingOption = Options.FirstOrDefault(o => o.ProductAttributeId == attributeId);
        if (existingOption != null)
            throw new InvalidOperationException("Attribute already exists for this variant");

        var option = new ProductVariantOption(Id, attributeId, optionId, value);
        Options.Add(option);
        return option;
    }

    public void RemoveOption(int attributeId)
    {
        var option = Options.FirstOrDefault(o => o.ProductAttributeId == attributeId);
        if (option != null)
        {
            Options.Remove(option);
        }
    }

    public string GetOptionsSummary()
    {
        if (!Options.Any())
            return string.Empty;

        return string.Join(" / ", Options.OrderBy(o => o.DisplayOrder).Select(o => o.Value));
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Option value for a product variant (e.g., Color: Red, Size: M)
/// </summary>
public class ProductVariantOption : BaseEntity
{
    public int ProductVariantId { get; private set; }
    public int ProductAttributeId { get; private set; }
    public int? ProductAttributeOptionId { get; private set; }
    public string Value { get; private set; }
    public int DisplayOrder { get; private set; }

    public virtual ProductVariant ProductVariant { get; private set; }
    public virtual ProductAttribute ProductAttribute { get; private set; }
    public virtual ProductAttributeOption? ProductAttributeOption { get; private set; }

    protected ProductVariantOption() { }

    public ProductVariantOption(int productVariantId, int productAttributeId, int? productAttributeOptionId, string value)
    {
        ProductVariantId = productVariantId;
        ProductAttributeId = productAttributeId;
        ProductAttributeOptionId = productAttributeOptionId;
        Value = value;
        DisplayOrder = 0;
    }

    public void UpdateValue(string value, int? optionId = null)
    {
        Value = value;
        ProductAttributeOptionId = optionId;
    }

    public void SetDisplayOrder(int order)
    {
        DisplayOrder = order;
    }
}
