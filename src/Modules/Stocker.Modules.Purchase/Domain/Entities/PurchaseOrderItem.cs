using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

public class PurchaseOrderItem : TenantAggregateRoot
{
    public Guid PurchaseOrderId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public string Unit { get; private set; } = "Adet";
    public decimal Quantity { get; private set; }
    public decimal ReceivedQuantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public decimal DiscountRate { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal VatRate { get; private set; }
    public decimal VatAmount { get; private set; }
    public decimal SubTotal { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string? Description { get; private set; }
    public int LineNumber { get; private set; }
    public bool IsFullyReceived { get; private set; }
    public bool IsCancelled { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public virtual PurchaseOrder PurchaseOrder { get; private set; } = null!;

    protected PurchaseOrderItem() : base() { }

    public static PurchaseOrderItem Create(
        Guid purchaseOrderId,
        Guid productId,
        string productCode,
        string productName,
        string unit,
        decimal quantity,
        decimal unitPrice,
        decimal vatRate,
        int lineNumber,
        Guid tenantId,
        string currency = "TRY")
    {
        var item = new PurchaseOrderItem();
        item.Id = Guid.NewGuid();
        item.SetTenantId(tenantId);
        item.PurchaseOrderId = purchaseOrderId;
        item.ProductId = productId;
        item.ProductCode = productCode;
        item.ProductName = productName;
        item.Unit = unit;
        item.Quantity = quantity;
        item.UnitPrice = unitPrice;
        item.Currency = currency;
        item.VatRate = vatRate;
        item.LineNumber = lineNumber;
        item.ReceivedQuantity = 0;
        item.IsFullyReceived = false;
        item.IsCancelled = false;
        item.DiscountRate = 0;
        item.CreatedAt = DateTime.UtcNow;
        item.CalculateAmounts();
        return item;
    }

    public void Update(decimal quantity, decimal unitPrice, decimal vatRate, decimal discountRate)
    {
        Quantity = quantity;
        UnitPrice = unitPrice;
        VatRate = vatRate;
        DiscountRate = discountRate;
        CalculateAmounts();
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateQuantity(decimal quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");

        Quantity = quantity;
        CalculateAmounts();
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateUnitPrice(decimal unitPrice)
    {
        UnitPrice = unitPrice;
        CalculateAmounts();
        UpdatedAt = DateTime.UtcNow;
    }

    public void ApplyDiscount(decimal discountRate)
    {
        if (discountRate < 0 || discountRate > 100)
            throw new ArgumentException("Discount rate must be between 0 and 100");

        DiscountRate = discountRate;
        CalculateAmounts();
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDescription(string? description)
    {
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateReceivedQuantity(decimal additionalQuantity)
    {
        if (additionalQuantity < 0)
            throw new ArgumentException("Received quantity cannot be negative");

        var newTotal = ReceivedQuantity + additionalQuantity;
        if (newTotal > Quantity)
            throw new InvalidOperationException("Total received quantity cannot exceed ordered quantity");

        ReceivedQuantity = newTotal;
        IsFullyReceived = ReceivedQuantity >= Quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        IsCancelled = true;
        UpdatedAt = DateTime.UtcNow;
    }

    private void CalculateAmounts()
    {
        SubTotal = UnitPrice * Quantity;
        DiscountAmount = SubTotal * DiscountRate / 100;
        var discountedAmount = SubTotal - DiscountAmount;
        VatAmount = discountedAmount * VatRate / 100;
        TotalAmount = discountedAmount + VatAmount;
    }

    public decimal GetRemainingQuantity() => Quantity - ReceivedQuantity;
}
