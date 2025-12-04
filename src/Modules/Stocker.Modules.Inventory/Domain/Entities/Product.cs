using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Domain.Enums;

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
    }
    
    public void SetStockLevels(
        decimal minimumStock,
        decimal maximumStock,
        decimal reorderPoint)
    {
        MinimumStock = minimumStock;
        MaximumStock = maximumStock;
        ReorderPoint = reorderPoint;
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

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}