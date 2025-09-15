using System;
using System.Collections.Generic;
using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Domain.Tenant.Entities;

public class Product : Entity, ITenantEntity
{
    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string Code { get; private set; } = string.Empty;
    public string? Barcode { get; private set; }
    public Money Price { get; private set; } = null!;
    public Money? CostPrice { get; private set; }
    public decimal StockQuantity { get; private set; }
    public decimal MinimumStockLevel { get; private set; }
    public decimal ReorderLevel { get; private set; }
    public string? Unit { get; private set; }
    public decimal VatRate { get; private set; }
    public bool IsActive { get; private set; } = true;
    public Guid? CategoryId { get; private set; }
    public Guid? SupplierId { get; private set; }

    protected Product() { }

    private Product(
        Guid tenantId,
        string name,
        string description,
        string code,
        Money price) : base(Guid.NewGuid())
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Product name cannot be empty", nameof(name));
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Product code cannot be empty", nameof(code));

        TenantId = tenantId;
        Name = name;
        Description = description ?? string.Empty;
        Code = code;
        Price = price ?? throw new ArgumentNullException(nameof(price));
        StockQuantity = 0;
        MinimumStockLevel = 0;
        ReorderLevel = 0;
        VatRate = 18; // Default VAT rate
        IsActive = true;
    }

    public static Product Create(
        Guid tenantId,
        string name,
        string description,
        string code,
        Money price)
    {
        return new Product(tenantId, name, description, code, price);
    }

    public void UpdatePricing(Money price, Money? costPrice = null)
    {
        Price = price ?? throw new ArgumentNullException(nameof(price));
        
        if (costPrice != null && costPrice.Currency != price.Currency)
            throw new ArgumentException("Cost price currency must match selling price currency");
            
        CostPrice = costPrice;
    }

    public void SetBarcode(string barcode)
    {
        Barcode = barcode;
    }

    public void SetUnit(string unit)
    {
        Unit = unit;
    }

    public void SetVatRate(decimal vatRate)
    {
        if (vatRate < 0 || vatRate > 100)
            throw new ArgumentException("VAT rate must be between 0 and 100", nameof(vatRate));

        VatRate = vatRate;
    }

    public void SetCategory(Guid? categoryId)
    {
        CategoryId = categoryId;
    }

    public void SetSupplier(Guid? supplierId)
    {
        SupplierId = supplierId;
    }

    public void SetStockLevels(decimal minimumStock, decimal reorderLevel)
    {
        if (minimumStock < 0)
            throw new ArgumentException("Minimum stock level cannot be negative", nameof(minimumStock));
        if (reorderLevel < 0)
            throw new ArgumentException("Reorder level cannot be negative", nameof(reorderLevel));

        MinimumStockLevel = minimumStock;
        ReorderLevel = reorderLevel;
    }

    public void UpdateStock(decimal quantity)
    {
        StockQuantity += quantity;
        
        if (StockQuantity < 0)
            StockQuantity = 0;
    }

    public void SetStock(decimal quantity)
    {
        if (quantity < 0)
            throw new ArgumentException("Stock quantity cannot be negative", nameof(quantity));

        StockQuantity = quantity;
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public bool IsInStock()
    {
        return StockQuantity > 0;
    }

    public bool NeedsReorder()
    {
        return StockQuantity <= ReorderLevel;
    }

    public bool IsBelowMinimumStock()
    {
        return StockQuantity < MinimumStockLevel;
    }

    public decimal GetProfitMargin()
    {
        if (CostPrice == null || CostPrice.Amount == 0)
            return 0;

        return ((Price.Amount - CostPrice.Amount) / CostPrice.Amount) * 100;
    }
    
    public void SetTenantId(Guid tenantId)
    {
        TenantId = tenantId;
    }
}