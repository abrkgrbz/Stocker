using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a line item in a quotation
/// </summary>
public class QuotationItem : TenantEntity
{
    public Guid QuotationId { get; private set; }
    public int? ProductId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public string? ProductCode { get; private set; }
    public string? Description { get; private set; }
    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = "Adet";
    public decimal UnitPrice { get; private set; }
    public decimal DiscountRate { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal VatRate { get; private set; } = 20;
    public decimal VatAmount { get; private set; }
    public decimal LineTotal { get; private set; }
    public int SortOrder { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public virtual Quotation? Quotation { get; private set; }

    private QuotationItem() : base() { }

    public static Result<QuotationItem> Create(
        Guid tenantId,
        int? productId,
        string productName,
        string? productCode,
        decimal quantity,
        decimal unitPrice,
        decimal vatRate = 20,
        decimal discountRate = 0,
        decimal discountAmount = 0,
        string? description = null,
        string unit = "Adet")
    {

        if (string.IsNullOrWhiteSpace(productName))
            return Result<QuotationItem>.Failure(Error.Validation("QuotationItem.ProductName", "Product name is required"));

        if (quantity <= 0)
            return Result<QuotationItem>.Failure(Error.Validation("QuotationItem.Quantity", "Quantity must be greater than 0"));

        if (unitPrice < 0)
            return Result<QuotationItem>.Failure(Error.Validation("QuotationItem.UnitPrice", "Unit price cannot be negative"));

        var item = new QuotationItem
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            ProductName = productName,
            ProductCode = productCode,
            Description = description,
            Quantity = quantity,
            Unit = unit,
            UnitPrice = unitPrice,
            DiscountRate = discountRate,
            DiscountAmount = discountAmount,
            VatRate = vatRate,
            CreatedAt = DateTime.UtcNow
        };

        item.SetTenantId(tenantId);
        item.CalculateTotals();

        return Result<QuotationItem>.Success(item);
    }

    public void SetQuotationId(Guid quotationId)
    {
        QuotationId = quotationId;
    }

    public void SetSortOrder(int sortOrder)
    {
        SortOrder = sortOrder;
    }

    public Result Update(
        decimal quantity,
        decimal unitPrice,
        decimal vatRate,
        decimal discountRate,
        decimal discountAmount,
        string? description)
    {
        if (quantity <= 0)
            return Result.Failure(Error.Validation("QuotationItem.Quantity", "Quantity must be greater than 0"));

        if (unitPrice < 0)
            return Result.Failure(Error.Validation("QuotationItem.UnitPrice", "Unit price cannot be negative"));

        Quantity = quantity;
        UnitPrice = unitPrice;
        VatRate = vatRate;
        DiscountRate = discountRate;
        DiscountAmount = discountAmount;
        Description = description;
        UpdatedAt = DateTime.UtcNow;

        CalculateTotals();

        return Result.Success();
    }

    private void CalculateTotals()
    {
        var grossTotal = Quantity * UnitPrice;
        var discountTotal = DiscountAmount + (grossTotal * DiscountRate / 100);
        var netTotal = grossTotal - discountTotal;
        VatAmount = netTotal * VatRate / 100;
        LineTotal = netTotal + VatAmount;
    }
}
