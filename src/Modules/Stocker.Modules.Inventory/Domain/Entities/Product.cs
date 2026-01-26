using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Domain.Entities;

public class Product : BaseEntity
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string? Barcode { get; private set; }
    public string? SKU { get; private set; }
    public ProductType ProductType { get; private set; }
    public int CategoryId { get; private set; }
    public int? BrandId { get; private set; }
    public int? SupplierId { get; private set; }
    public string Unit { get; private set; }
    public int? UnitId { get; private set; }
    public Money UnitPrice { get; private set; }
    public Money? CostPrice { get; private set; }
    public decimal VatRate { get; private set; }
    public decimal MinimumStock { get; private set; }
    public decimal MaximumStock { get; private set; }
    public decimal ReorderPoint { get; private set; }
    public decimal ReorderQuantity { get; private set; }
    public int LeadTimeDays { get; private set; }
    public decimal? Weight { get; private set; }
    public string? WeightUnit { get; private set; }
    public decimal? Length { get; private set; }
    public decimal? Width { get; private set; }
    public decimal? Height { get; private set; }
    public string? DimensionUnit { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsStockTracked { get; private set; }
    public bool IsSerialTracked { get; private set; }
    public bool IsLotTracked { get; private set; }

    // Computed property - ana görsel Images collection'dan alınır
    public string? PrimaryImageUrl => Images?.FirstOrDefault(i => i.IsPrimary && i.IsActive)?.Url
                                      ?? Images?.FirstOrDefault(i => i.IsActive)?.Url;

    public virtual Category Category { get; private set; }
    public virtual Brand? Brand { get; private set; }
    public virtual Supplier? Supplier { get; private set; }
    public virtual Unit? UnitEntity { get; private set; }
    public virtual ICollection<Stock> Stocks { get; private set; }
    public virtual ICollection<StockMovement> StockMovements { get; private set; }
    public virtual ICollection<ProductImage> Images { get; private set; }
    public virtual ICollection<ProductVariant> Variants { get; private set; }
    public virtual ICollection<SupplierProduct> SupplierProducts { get; private set; }
    public virtual ICollection<ProductAttributeValue> AttributeValues { get; private set; }
    public virtual ICollection<SerialNumber> SerialNumbers { get; private set; }
    public virtual ICollection<LotBatch> LotBatches { get; private set; }
    
    protected Product() { }
    
    public Product(
        string code,
        string name,
        int categoryId,
        string unit,
        Money unitPrice,
        decimal vatRate = 18,
        string? sku = null,
        ProductType productType = ProductType.Finished,
        int? unitId = null,
        decimal reorderQuantity = 0,
        int leadTimeDays = 0)
    {
        Code = code;
        Name = name;
        CategoryId = categoryId;
        Unit = unit;
        UnitId = unitId;
        UnitPrice = unitPrice;
        VatRate = vatRate;
        SKU = sku;
        ProductType = productType;
        ReorderQuantity = reorderQuantity;
        LeadTimeDays = leadTimeDays;
        IsActive = true;
        IsStockTracked = true;
        MinimumStock = 0;
        MaximumStock = 0;
        ReorderPoint = 0;
        Stocks = new List<Stock>();
        StockMovements = new List<StockMovement>();
        Images = new List<ProductImage>();
        Variants = new List<ProductVariant>();
        SupplierProducts = new List<SupplierProduct>();
        AttributeValues = new List<ProductAttributeValue>();
        SerialNumbers = new List<SerialNumber>();
        LotBatches = new List<LotBatch>();
    }

    /// <summary>
    /// Ürün oluşturulduktan sonra domain event fırlatır.
    /// Bu metod repository veya application layer tarafından çağrılmalıdır.
    /// </summary>
    public void RaiseCreatedEvent()
    {
        RaiseDomainEvent(new ProductCreatedDomainEvent(
            Id,
            TenantId,
            Code,
            Name,
            SKU,
            Barcode,
            CategoryId,
            BrandId,
            ProductType.ToString(),
            CostPrice?.Amount ?? 0,
            UnitPrice.Amount));
    }

    public void UpdateProductInfo(
        string name,
        string? description,
        Money unitPrice,
        Money? costPrice,
        decimal vatRate)
    {
        Name = name;
        Description = description;
        UnitPrice = unitPrice;
        CostPrice = costPrice;
        VatRate = vatRate;

        RaiseDomainEvent(new ProductUpdatedDomainEvent(
            Id,
            TenantId,
            Code,
            Name,
            CostPrice?.Amount ?? 0,
            UnitPrice.Amount));
    }
    
    public void SetStockLevels(
        decimal minimumStock,
        decimal maximumStock,
        decimal reorderPoint)
    {
        MinimumStock = minimumStock;
        MaximumStock = maximumStock;
        ReorderPoint = reorderPoint;

        RaiseDomainEvent(new ProductStockLevelsChangedDomainEvent(
            Id,
            TenantId,
            Code,
            MinimumStock,
            MaximumStock,
            ReorderPoint,
            ReorderQuantity));
    }
    
    public void SetCategory(int categoryId)
    {
        CategoryId = categoryId;
    }
    
    public void SetBrand(int? brandId)
    {
        BrandId = brandId;
    }
    
    public void SetSupplier(int? supplierId)
    {
        SupplierId = supplierId;
    }
    
    public void SetBarcode(string barcode)
    {
        Barcode = barcode;
    }
    
    public void SetTrackingOptions(
        bool isStockTracked,
        bool isSerialTracked,
        bool isLotTracked)
    {
        IsStockTracked = isStockTracked;
        IsSerialTracked = isSerialTracked;
        IsLotTracked = isLotTracked;
    }

    public void SetSku(string? sku)
    {
        SKU = sku;
    }

    public void SetProductType(ProductType productType)
    {
        ProductType = productType;
    }

    public void SetUnit(int unitId)
    {
        UnitId = unitId;
    }

    public void SetPhysicalProperties(
        decimal? weight,
        string? weightUnit,
        decimal? length,
        decimal? width,
        decimal? height,
        string? dimensionUnit)
    {
        Weight = weight;
        WeightUnit = weightUnit;
        Length = length;
        Width = width;
        Height = height;
        DimensionUnit = dimensionUnit;
    }

    public void SetReorderQuantity(decimal reorderQuantity)
    {
        ReorderQuantity = reorderQuantity;
    }

    public void SetLeadTimeDays(int leadTimeDays)
    {
        LeadTimeDays = leadTimeDays;
    }

    public void Activate()
    {
        IsActive = true;

        RaiseDomainEvent(new ProductActivatedDomainEvent(
            Id,
            TenantId,
            Code,
            Name));
    }

    public void Deactivate(string deactivatedBy, string? reason = null)
    {
        IsActive = false;

        RaiseDomainEvent(new ProductDeactivatedDomainEvent(
            Id,
            TenantId,
            Code,
            Name,
            deactivatedBy,
            reason));
    }

    #region Variant Stock Integrity / Varyant Stok Bütünlüğü

    /// <summary>
    /// Checks if this product has variants configured
    /// </summary>
    public bool HasVariants => Variants?.Any(v => v.IsActive) == true;

    /// <summary>
    /// Gets the total stock quantity across all variants for a specific warehouse.
    /// Returns null if product doesn't have variants.
    /// </summary>
    public decimal? GetTotalVariantStock(int warehouseId)
    {
        if (!HasVariants)
            return null;

        return Variants
            .Where(v => v.IsActive && v.TrackInventory)
            .SelectMany(v => v.Stocks ?? Enumerable.Empty<Stock>())
            .Where(s => s.WarehouseId == warehouseId)
            .Sum(s => s.Quantity);
    }

    /// <summary>
    /// Gets the total available stock (excluding reserved) across all variants for a specific warehouse.
    /// Returns null if product doesn't have variants.
    /// </summary>
    public decimal? GetTotalVariantAvailableStock(int warehouseId)
    {
        if (!HasVariants)
            return null;

        return Variants
            .Where(v => v.IsActive && v.TrackInventory)
            .SelectMany(v => v.Stocks ?? Enumerable.Empty<Stock>())
            .Where(s => s.WarehouseId == warehouseId)
            .Sum(s => s.AvailableQuantity);
    }

    /// <summary>
    /// Validates that the product-level stock matches the sum of variant-level stocks.
    /// This helps ensure stock integrity when products have variants.
    /// </summary>
    /// <returns>
    /// A tuple containing:
    /// - IsValid: Whether the stock is consistent
    /// - ProductStock: The product-level stock total
    /// - VariantStock: The sum of all variant stocks
    /// - Discrepancy: The difference (positive means product has more, negative means variants have more)
    /// </returns>
    public (bool IsValid, decimal ProductStock, decimal VariantStock, decimal Discrepancy) ValidateVariantStockIntegrity(int warehouseId)
    {
        if (!HasVariants)
            return (true, 0, 0, 0);

        // Product-level stock (stock records with no variant)
        var productStock = Stocks?
            .Where(s => s.WarehouseId == warehouseId && s.ProductVariantId == null)
            .Sum(s => s.Quantity) ?? 0;

        // Variant-level stock total
        var variantStock = GetTotalVariantStock(warehouseId) ?? 0;

        // For products with variants, product-level stock should typically be 0
        // All stock should be at variant level
        var discrepancy = productStock - variantStock;
        var isValid = productStock == 0 || Math.Abs(discrepancy) < 0.0001m;

        return (isValid, productStock, variantStock, discrepancy);
    }

    /// <summary>
    /// Gets stock summary for each variant
    /// </summary>
    public IEnumerable<VariantStockSummary> GetVariantStockSummaries(int warehouseId)
    {
        if (!HasVariants)
            return Enumerable.Empty<VariantStockSummary>();

        return Variants
            .Where(v => v.IsActive)
            .Select(v => new VariantStockSummary
            {
                VariantId = v.Id,
                VariantSku = v.Sku,
                VariantName = v.VariantName,
                OptionsDisplay = v.GetOptionsSummary(),
                TotalQuantity = v.Stocks?.Where(s => s.WarehouseId == warehouseId).Sum(s => s.Quantity) ?? 0,
                ReservedQuantity = v.Stocks?.Where(s => s.WarehouseId == warehouseId).Sum(s => s.ReservedQuantity) ?? 0,
                AvailableQuantity = v.Stocks?.Where(s => s.WarehouseId == warehouseId).Sum(s => s.AvailableQuantity) ?? 0,
                IsLowStock = v.TrackInventory &&
                    (v.Stocks?.Where(s => s.WarehouseId == warehouseId).Sum(s => s.AvailableQuantity) ?? 0) <= v.LowStockThreshold
            });
    }

    #endregion
}

/// <summary>
/// Stock summary for a product variant
/// </summary>
public record VariantStockSummary
{
    public int VariantId { get; init; }
    public string VariantSku { get; init; } = string.Empty;
    public string VariantName { get; init; } = string.Empty;
    public string OptionsDisplay { get; init; } = string.Empty;
    public decimal TotalQuantity { get; init; }
    public decimal ReservedQuantity { get; init; }
    public decimal AvailableQuantity { get; init; }
    public bool IsLowStock { get; init; }
}