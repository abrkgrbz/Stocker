using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents an invoice generated from a sales order
/// </summary>
public class Invoice : TenantAggregateRoot
{
    private readonly List<InvoiceItem> _items = new();

    public string InvoiceNumber { get; private set; } = string.Empty;
    public DateTime InvoiceDate { get; private set; }
    public DateTime? DueDate { get; private set; }
    public Guid? SalesOrderId { get; private set; }
    public Guid? CustomerId { get; private set; }
    public string? CustomerName { get; private set; }
    public string? CustomerEmail { get; private set; }
    public string? CustomerTaxNumber { get; private set; }
    public string? CustomerAddress { get; private set; }
    public decimal SubTotal { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal DiscountRate { get; private set; }
    public decimal VatAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public decimal PaidAmount { get; private set; }
    public decimal RemainingAmount { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public decimal ExchangeRate { get; private set; } = 1;
    public InvoiceStatus Status { get; private set; }
    public InvoiceType Type { get; private set; }
    public string? Notes { get; private set; }
    public string? EInvoiceId { get; private set; }
    public bool IsEInvoice { get; private set; }
    public DateTime? EInvoiceDate { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public virtual SalesOrder? SalesOrder { get; private set; }
    public IReadOnlyList<InvoiceItem> Items => _items.AsReadOnly();

    private Invoice() : base() { }

    public static Result<Invoice> Create(
        Guid tenantId,
        string invoiceNumber,
        DateTime invoiceDate,
        InvoiceType type,
        Guid? salesOrderId = null,
        Guid? customerId = null,
        string? customerName = null,
        string? customerEmail = null,
        string? customerTaxNumber = null,
        string? customerAddress = null,
        string currency = "TRY")
    {
        if (string.IsNullOrWhiteSpace(invoiceNumber))
            return Result<Invoice>.Failure(Error.Validation("Invoice.InvoiceNumber", "Invoice number is required"));

        var invoice = new Invoice();
        invoice.Id = Guid.NewGuid();
        invoice.SetTenantId(tenantId);
        invoice.InvoiceNumber = invoiceNumber;
        invoice.InvoiceDate = invoiceDate;
        invoice.Type = type;
        invoice.SalesOrderId = salesOrderId;
        invoice.CustomerId = customerId;
        invoice.CustomerName = customerName;
        invoice.CustomerEmail = customerEmail;
        invoice.CustomerTaxNumber = customerTaxNumber;
        invoice.CustomerAddress = customerAddress;
        invoice.Currency = currency;
        invoice.ExchangeRate = 1;
        invoice.Status = InvoiceStatus.Draft;
        invoice.SubTotal = 0;
        invoice.DiscountAmount = 0;
        invoice.DiscountRate = 0;
        invoice.VatAmount = 0;
        invoice.TotalAmount = 0;
        invoice.PaidAmount = 0;
        invoice.RemainingAmount = 0;
        invoice.IsEInvoice = false;
        invoice.CreatedAt = DateTime.UtcNow;

        return Result<Invoice>.Success(invoice);
    }

    public Result AddItem(InvoiceItem item)
    {
        if (item == null)
            return Result.Failure(Error.Validation("Invoice.Item", "Item cannot be null"));

        if (Status != InvoiceStatus.Draft)
            return Result.Failure(Error.Conflict("Invoice.Status", "Cannot add items to a non-draft invoice"));

        _items.Add(item);
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result RemoveItem(Guid itemId)
    {
        if (Status != InvoiceStatus.Draft)
            return Result.Failure(Error.Conflict("Invoice.Status", "Cannot remove items from a non-draft invoice"));

        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            return Result.Failure(Error.NotFound("Invoice.Item", "Item not found"));

        _items.Remove(item);
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetDueDate(DateTime dueDate)
    {
        if (dueDate < InvoiceDate)
            return Result.Failure(Error.Validation("Invoice.DueDate", "Due date cannot be before invoice date"));

        DueDate = dueDate;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result ApplyDiscount(decimal discountAmount, decimal discountRate)
    {
        if (discountAmount < 0)
            return Result.Failure(Error.Validation("Invoice.DiscountAmount", "Discount amount cannot be negative"));

        if (discountRate < 0 || discountRate > 100)
            return Result.Failure(Error.Validation("Invoice.DiscountRate", "Discount rate must be between 0 and 100"));

        DiscountAmount = discountAmount;
        DiscountRate = discountRate;
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Issue()
    {
        if (Status != InvoiceStatus.Draft)
            return Result.Failure(Error.Conflict("Invoice.Status", "Only draft invoices can be issued"));

        if (!_items.Any())
            return Result.Failure(Error.Validation("Invoice.Items", "Cannot issue an invoice without items"));

        Status = InvoiceStatus.Issued;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Send()
    {
        if (Status != InvoiceStatus.Issued)
            return Result.Failure(Error.Conflict("Invoice.Status", "Only issued invoices can be sent"));

        Status = InvoiceStatus.Sent;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result RecordPayment(decimal amount)
    {
        if (amount <= 0)
            return Result.Failure(Error.Validation("Invoice.Payment", "Payment amount must be greater than 0"));

        if (amount > RemainingAmount)
            return Result.Failure(Error.Validation("Invoice.Payment", "Payment amount cannot exceed remaining amount"));

        PaidAmount += amount;
        RemainingAmount = TotalAmount - PaidAmount;

        if (RemainingAmount <= 0)
        {
            Status = InvoiceStatus.Paid;
        }
        else if (PaidAmount > 0)
        {
            Status = InvoiceStatus.PartiallyPaid;
        }

        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetEInvoice(string eInvoiceId)
    {
        if (string.IsNullOrWhiteSpace(eInvoiceId))
            return Result.Failure(Error.Validation("Invoice.EInvoiceId", "E-Invoice ID is required"));

        EInvoiceId = eInvoiceId;
        IsEInvoice = true;
        EInvoiceDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Cancel(string reason)
    {
        if (Status == InvoiceStatus.Cancelled)
            return Result.Failure(Error.Conflict("Invoice.Status", "Invoice is already cancelled"));

        if (PaidAmount > 0)
            return Result.Failure(Error.Conflict("Invoice.Status", "Cannot cancel an invoice with payments"));

        Status = InvoiceStatus.Cancelled;
        Notes = string.IsNullOrEmpty(Notes)
            ? $"Cancelled: {reason}"
            : $"{Notes}\nCancelled: {reason}";
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    private void RecalculateTotals()
    {
        SubTotal = _items.Sum(i => i.LineTotal - i.VatAmount);
        VatAmount = _items.Sum(i => i.VatAmount);

        var totalDiscount = DiscountAmount;
        if (DiscountRate > 0)
        {
            totalDiscount += SubTotal * DiscountRate / 100;
        }

        TotalAmount = SubTotal + VatAmount - totalDiscount;
        RemainingAmount = TotalAmount - PaidAmount;
    }
}

public enum InvoiceStatus
{
    Draft = 0,
    Issued = 1,
    Sent = 2,
    PartiallyPaid = 3,
    Paid = 4,
    Overdue = 5,
    Cancelled = 6
}

public enum InvoiceType
{
    Sales = 0,
    Return = 1,
    Credit = 2,
    Debit = 3
}
