using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Price list for different customer groups, sales channels, or time periods
/// Allows flexible pricing strategies
/// </summary>
public class PriceList : BaseEntity
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string Currency { get; private set; }
    public bool IsDefault { get; private set; }
    public bool IsActive { get; private set; }
    public decimal? GlobalDiscountPercentage { get; private set; }
    public decimal? GlobalMarkupPercentage { get; private set; }
    public DateTime? ValidFrom { get; private set; }
    public DateTime? ValidTo { get; private set; }
    public int? CustomerGroupId { get; private set; }
    public int Priority { get; private set; }

    public virtual ICollection<PriceListItem> Items { get; private set; }

    protected PriceList() { }

    public PriceList(string code, string name, string currency = "TRY")
    {
        Code = code;
        Name = name;
        Currency = currency;
        IsDefault = false;
        IsActive = true;
        Priority = 0;
        Items = new List<PriceListItem>();
    }

    public void UpdatePriceList(string name, string? description, string currency)
    {
        Name = name;
        Description = description;
        Currency = currency;
    }

    public void SetAsDefault()
    {
        IsDefault = true;
    }

    public void UnsetDefault()
    {
        IsDefault = false;
    }

    public void SetValidityPeriod(DateTime? validFrom, DateTime? validTo)
    {
        if (validFrom.HasValue && validTo.HasValue && validFrom > validTo)
            throw new ArgumentException("ValidFrom cannot be after ValidTo");

        ValidFrom = validFrom;
        ValidTo = validTo;
    }

    public void SetGlobalDiscount(decimal? discountPercentage)
    {
        if (discountPercentage.HasValue && (discountPercentage < 0 || discountPercentage > 100))
            throw new ArgumentException("Discount percentage must be between 0 and 100");

        GlobalDiscountPercentage = discountPercentage;
    }

    public void SetGlobalMarkup(decimal? markupPercentage)
    {
        if (markupPercentage.HasValue && markupPercentage < 0)
            throw new ArgumentException("Markup percentage cannot be negative");

        GlobalMarkupPercentage = markupPercentage;
    }

    public void SetCustomerGroup(int? customerGroupId)
    {
        CustomerGroupId = customerGroupId;
    }

    public void SetPriority(int priority)
    {
        Priority = priority;
    }

    public PriceListItem AddItem(int productId, Money price)
    {
        var existingItem = Items.FirstOrDefault(i => i.ProductId == productId);
        if (existingItem != null)
            throw new InvalidOperationException("Product already exists in price list");

        var item = new PriceListItem(Id, productId, price);
        Items.Add(item);
        return item;
    }

    public void UpdateItem(int productId, Money price)
    {
        var item = Items.FirstOrDefault(i => i.ProductId == productId);
        if (item == null)
            throw new InvalidOperationException("Product not found in price list");

        item.UpdatePrice(price);
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

        return IsActive;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Individual product price in a price list
/// </summary>
public class PriceListItem : BaseEntity
{
    public int PriceListId { get; private set; }
    public int ProductId { get; private set; }
    public Money Price { get; private set; }
    public decimal? MinQuantity { get; private set; }
    public decimal? MaxQuantity { get; private set; }
    public decimal? DiscountPercentage { get; private set; }
    public DateTime? ValidFrom { get; private set; }
    public DateTime? ValidTo { get; private set; }

    public virtual PriceList PriceList { get; private set; }
    public virtual Product Product { get; private set; }

    protected PriceListItem() { }

    public PriceListItem(int priceListId, int productId, Money price)
    {
        PriceListId = priceListId;
        ProductId = productId;
        Price = price;
    }

    public void UpdatePrice(Money price)
    {
        Price = price;
    }

    public void SetQuantityRange(decimal? minQuantity, decimal? maxQuantity)
    {
        if (minQuantity.HasValue && maxQuantity.HasValue && minQuantity > maxQuantity)
            throw new ArgumentException("MinQuantity cannot be greater than MaxQuantity");

        MinQuantity = minQuantity;
        MaxQuantity = maxQuantity;
    }

    public void SetDiscount(decimal? discountPercentage)
    {
        if (discountPercentage.HasValue && (discountPercentage < 0 || discountPercentage > 100))
            throw new ArgumentException("Discount percentage must be between 0 and 100");

        DiscountPercentage = discountPercentage;
    }

    public void SetValidityPeriod(DateTime? validFrom, DateTime? validTo)
    {
        if (validFrom.HasValue && validTo.HasValue && validFrom > validTo)
            throw new ArgumentException("ValidFrom cannot be after ValidTo");

        ValidFrom = validFrom;
        ValidTo = validTo;
    }

    public Money GetEffectivePrice()
    {
        if (!DiscountPercentage.HasValue)
            return Price;

        var discountAmount = Price.Amount * (DiscountPercentage.Value / 100);
        return Money.Create(Price.Amount - discountAmount, Price.Currency);
    }

    public bool IsValidForQuantity(decimal quantity)
    {
        if (MinQuantity.HasValue && quantity < MinQuantity.Value)
            return false;

        if (MaxQuantity.HasValue && quantity > MaxQuantity.Value)
            return false;

        return true;
    }

    public bool IsValid()
    {
        var now = DateTime.UtcNow;

        if (ValidFrom.HasValue && now < ValidFrom.Value)
            return false;

        if (ValidTo.HasValue && now > ValidTo.Value)
            return false;

        return true;
    }
}
