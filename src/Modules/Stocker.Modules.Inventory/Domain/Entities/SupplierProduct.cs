using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Supplier-Product relationship with supplier-specific pricing and details
/// Allows tracking different prices, lead times, and codes per supplier
/// </summary>
public class SupplierProduct : BaseEntity
{
    public int SupplierId { get; private set; }
    public int ProductId { get; private set; }
    public string? SupplierProductCode { get; private set; }
    public string? SupplierProductName { get; private set; }
    public string? SupplierBarcode { get; private set; }
    public Money UnitCost { get; private set; }
    public Money? LastPurchasePrice { get; private set; }
    public DateTime? LastPurchaseDate { get; private set; }
    public string Currency { get; private set; }
    public decimal MinOrderQuantity { get; private set; }
    public decimal OrderMultiple { get; private set; }
    public int LeadTimeDays { get; private set; }
    public bool IsPreferred { get; private set; }
    public bool IsActive { get; private set; }
    public string? Notes { get; private set; }
    public int Priority { get; private set; }

    // Quantity-based pricing tiers
    public virtual ICollection<SupplierProductPriceTier> PriceTiers { get; private set; }

    public virtual Supplier Supplier { get; private set; }
    public virtual Product Product { get; private set; }

    protected SupplierProduct() { }

    public SupplierProduct(int supplierId, int productId, Money unitCost)
    {
        SupplierId = supplierId;
        ProductId = productId;
        UnitCost = unitCost;
        Currency = unitCost.Currency;
        MinOrderQuantity = 1;
        OrderMultiple = 1;
        LeadTimeDays = 0;
        IsPreferred = false;
        IsActive = true;
        Priority = 0;
        PriceTiers = new List<SupplierProductPriceTier>();
    }

    public void SetSupplierProductInfo(string? supplierCode, string? supplierName, string? supplierBarcode)
    {
        SupplierProductCode = supplierCode;
        SupplierProductName = supplierName;
        SupplierBarcode = supplierBarcode;
    }

    public void UpdateCost(Money unitCost)
    {
        UnitCost = unitCost;
        Currency = unitCost.Currency;
    }

    public void RecordPurchase(Money purchasePrice, DateTime purchaseDate)
    {
        LastPurchasePrice = purchasePrice;
        LastPurchaseDate = purchaseDate;
    }

    public void SetOrderConstraints(decimal minOrderQuantity, decimal orderMultiple, int leadTimeDays)
    {
        if (minOrderQuantity < 0)
            throw new ArgumentException("Minimum order quantity cannot be negative");
        if (orderMultiple <= 0)
            throw new ArgumentException("Order multiple must be greater than zero");
        if (leadTimeDays < 0)
            throw new ArgumentException("Lead time cannot be negative");

        MinOrderQuantity = minOrderQuantity;
        OrderMultiple = orderMultiple;
        LeadTimeDays = leadTimeDays;
    }

    public void SetAsPreferred()
    {
        IsPreferred = true;
    }

    public void UnsetPreferred()
    {
        IsPreferred = false;
    }

    public void SetPriority(int priority)
    {
        Priority = priority;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public SupplierProductPriceTier AddPriceTier(decimal minQuantity, Money unitPrice)
    {
        var existingTier = PriceTiers.FirstOrDefault(t => t.MinQuantity == minQuantity);
        if (existingTier != null)
            throw new InvalidOperationException($"Price tier for quantity {minQuantity} already exists");

        var tier = new SupplierProductPriceTier(Id, minQuantity, unitPrice);
        PriceTiers.Add(tier);
        return tier;
    }

    public void UpdatePriceTier(decimal minQuantity, Money unitPrice)
    {
        var tier = PriceTiers.FirstOrDefault(t => t.MinQuantity == minQuantity);
        if (tier == null)
            throw new InvalidOperationException($"Price tier for quantity {minQuantity} not found");

        tier.UpdatePrice(unitPrice);
    }

    public void RemovePriceTier(decimal minQuantity)
    {
        var tier = PriceTiers.FirstOrDefault(t => t.MinQuantity == minQuantity);
        if (tier != null)
        {
            PriceTiers.Remove(tier);
        }
    }

    public Money GetPriceForQuantity(decimal quantity)
    {
        if (!PriceTiers.Any())
            return UnitCost;

        var applicableTier = PriceTiers
            .Where(t => quantity >= t.MinQuantity)
            .OrderByDescending(t => t.MinQuantity)
            .FirstOrDefault();

        return applicableTier?.UnitPrice ?? UnitCost;
    }

    public decimal CalculateOrderQuantity(decimal requiredQuantity)
    {
        // Ensure minimum order quantity
        var orderQty = Math.Max(requiredQuantity, MinOrderQuantity);

        // Round up to order multiple
        if (OrderMultiple > 1)
        {
            orderQty = Math.Ceiling(orderQty / OrderMultiple) * OrderMultiple;
        }

        return orderQty;
    }

    public DateTime CalculateExpectedDeliveryDate(DateTime orderDate)
    {
        return orderDate.AddDays(LeadTimeDays);
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Quantity-based price tier for supplier products
/// </summary>
public class SupplierProductPriceTier : BaseEntity
{
    public int SupplierProductId { get; private set; }
    public decimal MinQuantity { get; private set; }
    public decimal? MaxQuantity { get; private set; }
    public Money UnitPrice { get; private set; }
    public decimal? DiscountPercentage { get; private set; }
    public DateTime? ValidFrom { get; private set; }
    public DateTime? ValidTo { get; private set; }

    public virtual SupplierProduct SupplierProduct { get; private set; }

    protected SupplierProductPriceTier() { }

    public SupplierProductPriceTier(int supplierProductId, decimal minQuantity, Money unitPrice)
    {
        SupplierProductId = supplierProductId;
        MinQuantity = minQuantity;
        UnitPrice = unitPrice;
    }

    public void UpdatePrice(Money unitPrice)
    {
        UnitPrice = unitPrice;
    }

    public void SetQuantityRange(decimal minQuantity, decimal? maxQuantity)
    {
        if (maxQuantity.HasValue && minQuantity > maxQuantity.Value)
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

    public bool IsValid()
    {
        var now = DateTime.UtcNow;

        if (ValidFrom.HasValue && now < ValidFrom.Value)
            return false;

        if (ValidTo.HasValue && now > ValidTo.Value)
            return false;

        return true;
    }

    public bool IsApplicableForQuantity(decimal quantity)
    {
        if (quantity < MinQuantity)
            return false;

        if (MaxQuantity.HasValue && quantity > MaxQuantity.Value)
            return false;

        return IsValid();
    }
}
