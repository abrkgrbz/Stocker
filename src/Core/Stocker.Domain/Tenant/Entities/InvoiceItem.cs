using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Tenant.Entities;

public sealed class InvoiceItem : Entity, ITenantEntity
{
    public Guid TenantId { get; private set; }
    public Guid InvoiceId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; }
    public string? Description { get; private set; }
    public decimal Quantity { get; private set; }
    public Money UnitPrice { get; private set; }
    public Money TotalPrice { get; private set; }
    public decimal? DiscountPercentage { get; private set; }
    public Money? DiscountAmount { get; private set; }
    public decimal? TaxRate { get; private set; }
    public Money? TaxAmount { get; private set; }
    
    private InvoiceItem() { } // EF Constructor
    
    private InvoiceItem(
        Guid tenantId,
        Guid invoiceId,
        Guid productId,
        string productName,
        decimal quantity,
        Money unitPrice)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        InvoiceId = invoiceId;
        ProductId = productId;
        ProductName = productName;
        Quantity = quantity;
        UnitPrice = unitPrice;
        CalculateTotal();
    }
    
    public static InvoiceItem Create(
        Guid tenantId,
        Guid invoiceId,
        Guid productId,
        string productName,
        decimal quantity,
        Money unitPrice)
    {
        if (string.IsNullOrWhiteSpace(productName))
            throw new ArgumentException("Product name cannot be empty.", nameof(productName));
            
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.", nameof(quantity));
            
        if (unitPrice.Amount < 0)
            throw new ArgumentException("Unit price cannot be negative.", nameof(unitPrice));
            
        return new InvoiceItem(tenantId, invoiceId, productId, productName, quantity, unitPrice);
    }
    
    public void SetDescription(string description)
    {
        Description = description;
    }
    
    public void SetQuantity(decimal quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.", nameof(quantity));
            
        Quantity = quantity;
        CalculateTotal();
    }
    
    public void SetUnitPrice(Money unitPrice)
    {
        if (unitPrice.Amount < 0)
            throw new ArgumentException("Unit price cannot be negative.", nameof(unitPrice));
            
        UnitPrice = unitPrice;
        CalculateTotal();
    }
    
    public void ApplyDiscount(decimal percentage)
    {
        if (percentage < 0 || percentage > 100)
            throw new ArgumentException("Discount percentage must be between 0 and 100.", nameof(percentage));
            
        DiscountPercentage = percentage;
        CalculateTotal();
    }
    
    public void ApplyTax(decimal rate)
    {
        if (rate < 0)
            throw new ArgumentException("Tax rate cannot be negative.", nameof(rate));
            
        TaxRate = rate;
        CalculateTotal();
    }
    
    private void CalculateTotal()
    {
        var baseAmount = UnitPrice.Amount * Quantity;
        var baseMoney = Money.Create(baseAmount, UnitPrice.Currency);
        
        // Apply discount
        if (DiscountPercentage.HasValue && DiscountPercentage.Value > 0)
        {
            var discountValue = baseAmount * (DiscountPercentage.Value / 100);
            DiscountAmount = Money.Create(discountValue, UnitPrice.Currency);
            baseAmount -= discountValue;
        }
        
        // Apply tax
        if (TaxRate.HasValue && TaxRate.Value > 0)
        {
            var taxValue = baseAmount * (TaxRate.Value / 100);
            TaxAmount = Money.Create(taxValue, UnitPrice.Currency);
            baseAmount += taxValue;
        }
        
        TotalPrice = Money.Create(baseAmount, UnitPrice.Currency);
    }
    
    public void SetTenantId(Guid tenantId)
    {
        TenantId = tenantId;
    }
}