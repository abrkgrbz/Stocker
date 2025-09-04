using Stocker.SharedKernel.MultiTenancy;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.CRM.Domain.Entities;

public class OpportunityProduct : TenantEntity
{
    public int OpportunityId { get; private set; }
    public int ProductId { get; private set; }
    public string ProductName { get; private set; }
    public string? ProductCode { get; private set; }
    public string? Description { get; private set; }
    public decimal Quantity { get; private set; }
    public Money UnitPrice { get; private set; }
    public decimal DiscountPercent { get; private set; }
    public Money DiscountAmount { get; private set; }
    public Money TotalPrice { get; private set; }
    public int SortOrder { get; private set; }
    
    public virtual Opportunity Opportunity { get; private set; }
    
    protected OpportunityProduct() { }
    
    public OpportunityProduct(
        Guid tenantId,
        int opportunityId,
        int productId,
        string productName,
        decimal quantity,
        Money unitPrice,
        int sortOrder = 0) : base(tenantId)
    {
        OpportunityId = opportunityId;
        ProductId = productId;
        ProductName = productName;
        Quantity = quantity;
        UnitPrice = unitPrice;
        SortOrder = sortOrder;
        DiscountPercent = 0;
        DiscountAmount = Money.Create(0, unitPrice.Currency);
        
        CalculateTotalPrice();
    }
    
    public void UpdateQuantity(decimal quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");
            
        Quantity = quantity;
        CalculateTotalPrice();
    }
    
    public void UpdatePrice(Money unitPrice)
    {
        UnitPrice = unitPrice;
        CalculateTotalPrice();
    }
    
    public void ApplyDiscountPercent(decimal discountPercent)
    {
        if (discountPercent < 0 || discountPercent > 100)
            throw new ArgumentException("Discount percent must be between 0 and 100");
            
        DiscountPercent = discountPercent;
        DiscountAmount = Money.Create(
            (UnitPrice.Amount * Quantity) * (discountPercent / 100),
            UnitPrice.Currency);
        
        CalculateTotalPrice();
    }
    
    public void ApplyDiscountAmount(Money discountAmount)
    {
        var maxDiscount = Money.Create(UnitPrice.Amount * Quantity, UnitPrice.Currency);
        if (discountAmount.Amount > maxDiscount.Amount)
            throw new ArgumentException("Discount amount cannot exceed total price");
            
        DiscountAmount = discountAmount;
        DiscountPercent = (discountAmount.Amount / (UnitPrice.Amount * Quantity)) * 100;
        
        CalculateTotalPrice();
    }
    
    public void SetProductCode(string productCode)
    {
        ProductCode = productCode;
    }
    
    public void SetDescription(string description)
    {
        Description = description;
    }
    
    public void SetSortOrder(int sortOrder)
    {
        SortOrder = sortOrder;
    }
    
    private void CalculateTotalPrice()
    {
        var subtotal = UnitPrice.Amount * Quantity;
        var total = subtotal - DiscountAmount.Amount;
        TotalPrice = Money.Create(total, UnitPrice.Currency);
    }
}