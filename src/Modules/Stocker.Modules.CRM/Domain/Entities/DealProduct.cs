using Stocker.SharedKernel.MultiTenancy;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.CRM.Domain.Entities;

public class DealProduct : TenantEntity
{
    public Guid DealId { get; private set; }
    public int ProductId { get; private set; }  // Keep int for now, will fix in Phase 4
    public string ProductName { get; private set; }
    public string? ProductCode { get; private set; }
    public string? Description { get; private set; }
    public decimal Quantity { get; private set; }
    public Money UnitPrice { get; private set; }
    public decimal DiscountPercent { get; private set; }
    public Money DiscountAmount { get; private set; }
    public Money TotalPrice { get; private set; }
    public decimal Tax { get; private set; }
    public Money TaxAmount { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsRecurring { get; private set; }
    public string? RecurringPeriod { get; private set; }
    public int? RecurringCycles { get; private set; }
    
    public Deal Deal { get; private set; }
    
    protected DealProduct() : base() { }
    
    public DealProduct(
        Guid tenantId,
        Guid dealId,
        int productId,
        string productName,
        decimal quantity,
        Money unitPrice,
        decimal tax = 0,
        int sortOrder = 0) : base(Guid.NewGuid(), tenantId)
    {
        DealId = dealId;
        ProductId = productId;
        ProductName = productName;
        Quantity = quantity;
        UnitPrice = unitPrice;
        Tax = tax;
        SortOrder = sortOrder;
        DiscountPercent = 0;
        DiscountAmount = Money.Create(0, unitPrice.Currency);
        IsRecurring = false;
        
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
    
    public void SetTax(decimal taxPercent)
    {
        if (taxPercent < 0 || taxPercent > 100)
            throw new ArgumentException("Tax percent must be between 0 and 100");
            
        Tax = taxPercent;
        CalculateTotalPrice();
    }
    
    public void SetAsRecurring(string period, int? cycles = null)
    {
        IsRecurring = true;
        RecurringPeriod = period;
        RecurringCycles = cycles;
    }
    
    public void SetAsOneTime()
    {
        IsRecurring = false;
        RecurringPeriod = null;
        RecurringCycles = null;
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
        var discountedPrice = subtotal - DiscountAmount.Amount;
        TaxAmount = Money.Create(discountedPrice * (Tax / 100), UnitPrice.Currency);
        var total = discountedPrice + TaxAmount.Amount;
        TotalPrice = Money.Create(total, UnitPrice.Currency);
    }
    
    public Money CalculateRecurringRevenue()
    {
        if (!IsRecurring)
            return Money.Create(0, UnitPrice.Currency);
            
        var cycles = RecurringCycles ?? 12; // Default to 12 cycles if not specified
        return Money.Create(TotalPrice.Amount * cycles, UnitPrice.Currency);
    }
}