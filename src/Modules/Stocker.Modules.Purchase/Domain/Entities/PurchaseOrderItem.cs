using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Purchase.Domain.Entities;

public class PurchaseOrderItem : BaseEntity
{
    public int PurchaseOrderId { get; private set; }
    public int ProductId { get; private set; }
    public string ProductCode { get; private set; }
    public string ProductName { get; private set; }
    public string Unit { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal ReceivedQuantity { get; private set; }
    public Money UnitPrice { get; private set; }
    public decimal DiscountRate { get; private set; }
    public Money DiscountAmount { get; private set; }
    public decimal VatRate { get; private set; }
    public Money VatAmount { get; private set; }
    public Money TotalAmount { get; private set; }
    public string? Description { get; private set; }
    public int LineNumber { get; private set; }
    public bool IsReceived { get; private set; }
    
    public virtual PurchaseOrder PurchaseOrder { get; private set; }
    
    protected PurchaseOrderItem() { }
    
    public PurchaseOrderItem(
        int purchaseOrderId,
        int productId,
        string productCode,
        string productName,
        string unit,
        decimal quantity,
        Money unitPrice,
        decimal vatRate,
        int lineNumber)
    {
        PurchaseOrderId = purchaseOrderId;
        ProductId = productId;
        ProductCode = productCode;
        ProductName = productName;
        Unit = unit;
        Quantity = quantity;
        UnitPrice = unitPrice;
        VatRate = vatRate;
        LineNumber = lineNumber;
        ReceivedQuantity = 0;
        IsReceived = false;
        DiscountRate = 0;
        DiscountAmount = Money.Create(0, unitPrice.Currency);
        
        CalculateAmounts();
    }
    
    public void UpdateQuantity(decimal quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");
            
        Quantity = quantity;
        CalculateAmounts();
    }
    
    public void UpdateUnitPrice(Money unitPrice)
    {
        UnitPrice = unitPrice;
        CalculateAmounts();
    }
    
    public void ApplyDiscount(decimal discountRate)
    {
        if (discountRate < 0 || discountRate > 100)
            throw new ArgumentException("Discount rate must be between 0 and 100");
            
        DiscountRate = discountRate;
        CalculateAmounts();
    }
    
    public void SetDescription(string description)
    {
        Description = description;
    }
    
    public void UpdateReceivedQuantity(decimal receivedQuantity)
    {
        if (receivedQuantity < 0)
            throw new ArgumentException("Received quantity cannot be negative");
            
        if (receivedQuantity > Quantity)
            throw new InvalidOperationException("Received quantity cannot exceed ordered quantity");
            
        ReceivedQuantity = receivedQuantity;
        IsReceived = ReceivedQuantity >= Quantity;
    }
    
    private void CalculateAmounts()
    {
        var subtotal = UnitPrice.Amount * Quantity;
        DiscountAmount = Money.Create(subtotal * DiscountRate / 100, UnitPrice.Currency);
        var discountedAmount = subtotal - DiscountAmount.Amount;
        VatAmount = Money.Create(discountedAmount * VatRate / 100, UnitPrice.Currency);
        TotalAmount = Money.Create(discountedAmount + VatAmount.Amount, UnitPrice.Currency);
    }
    
    public decimal GetRemainingQuantity() => Quantity - ReceivedQuantity;
}