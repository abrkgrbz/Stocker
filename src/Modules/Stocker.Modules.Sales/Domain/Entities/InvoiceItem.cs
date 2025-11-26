using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a line item in an invoice
/// </summary>
public class InvoiceItem : TenantAggregateRoot
{
    public Guid InvoiceId { get; private set; }
    public Guid? SalesOrderItemId { get; private set; }
    public Guid? ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Unit { get; private set; } = "Adet";
    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal DiscountRate { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal VatRate { get; private set; }
    public decimal VatAmount { get; private set; }
    public decimal LineTotal { get; private set; }
    public int LineNumber { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public virtual Invoice? Invoice { get; private set; }

    private InvoiceItem() : base() { }

    public static Result<InvoiceItem> Create(
        Guid tenantId,
        Guid invoiceId,
        int lineNumber,
        Guid? productId,
        string productCode,
        string productName,
        string unit,
        decimal quantity,
        decimal unitPrice,
        decimal vatRate,
        Guid? salesOrderItemId = null,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(productCode))
            return Result<InvoiceItem>.Failure(Error.Validation("InvoiceItem.ProductCode", "Product code is required"));

        if (string.IsNullOrWhiteSpace(productName))
            return Result<InvoiceItem>.Failure(Error.Validation("InvoiceItem.ProductName", "Product name is required"));

        if (quantity <= 0)
            return Result<InvoiceItem>.Failure(Error.Validation("InvoiceItem.Quantity", "Quantity must be greater than zero"));

        if (unitPrice < 0)
            return Result<InvoiceItem>.Failure(Error.Validation("InvoiceItem.UnitPrice", "Unit price cannot be negative"));

        if (vatRate < 0 || vatRate > 100)
            return Result<InvoiceItem>.Failure(Error.Validation("InvoiceItem.VatRate", "VAT rate must be between 0 and 100"));

        var item = new InvoiceItem();
        item.Id = Guid.NewGuid();
        item.SetTenantId(tenantId);
        item.InvoiceId = invoiceId;
        item.LineNumber = lineNumber;
        item.ProductId = productId;
        item.ProductCode = productCode;
        item.ProductName = productName;
        item.Description = description;
        item.Unit = unit;
        item.Quantity = quantity;
        item.UnitPrice = unitPrice;
        item.VatRate = vatRate;
        item.SalesOrderItemId = salesOrderItemId;
        item.DiscountRate = 0;
        item.DiscountAmount = 0;
        item.CreatedAt = DateTime.UtcNow;

        item.CalculateAmounts();

        return Result<InvoiceItem>.Success(item);
    }

    public Result UpdateQuantity(decimal quantity)
    {
        if (quantity <= 0)
            return Result.Failure(Error.Validation("InvoiceItem.Quantity", "Quantity must be greater than zero"));

        Quantity = quantity;
        CalculateAmounts();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result UpdateUnitPrice(decimal unitPrice)
    {
        if (unitPrice < 0)
            return Result.Failure(Error.Validation("InvoiceItem.UnitPrice", "Unit price cannot be negative"));

        UnitPrice = unitPrice;
        CalculateAmounts();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result ApplyDiscount(decimal discountRate)
    {
        if (discountRate < 0 || discountRate > 100)
            return Result.Failure(Error.Validation("InvoiceItem.DiscountRate", "Discount rate must be between 0 and 100"));

        DiscountRate = discountRate;
        CalculateAmounts();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetDescription(string? description)
    {
        Description = description;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    private void CalculateAmounts()
    {
        var subtotal = UnitPrice * Quantity;
        DiscountAmount = subtotal * DiscountRate / 100;
        var discountedAmount = subtotal - DiscountAmount;
        VatAmount = discountedAmount * VatRate / 100;
        LineTotal = discountedAmount + VatAmount;
    }
}
