using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Tenant.Enums;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Tenant.Entities;

public sealed class Invoice : AggregateRoot, ITenantEntity
{
    private readonly List<InvoiceItem> _items = new();
    
    public Guid TenantId { get; private set; }
    public string InvoiceNumber { get; private set; }
    public Guid CustomerId { get; private set; }
    public DateTime InvoiceDate { get; private set; }
    public DateTime DueDate { get; private set; }
    public Money SubTotal { get; private set; }
    public Money TaxAmount { get; private set; }
    public Money DiscountAmount { get; private set; }
    public Money TotalAmount { get; private set; }
    public InvoiceStatus Status { get; private set; }
    public string? Notes { get; private set; }
    public string? Terms { get; private set; }
    public DateTime? PaidDate { get; private set; }
    public string? PaymentMethod { get; private set; }
    public string? PaymentReference { get; private set; }
    public IReadOnlyCollection<InvoiceItem> Items => _items.AsReadOnly();
    
    private Invoice() { } // EF Constructor
    
    private Invoice(
        Guid tenantId,
        string invoiceNumber,
        Guid customerId,
        DateTime invoiceDate,
        DateTime dueDate)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        InvoiceNumber = invoiceNumber;
        CustomerId = customerId;
        InvoiceDate = invoiceDate;
        DueDate = dueDate;
        Status = InvoiceStatus.Draft;
        SubTotal = Money.Zero("TRY");
        TaxAmount = Money.Zero("TRY");
        DiscountAmount = Money.Zero("TRY");
        TotalAmount = Money.Zero("TRY");
    }
    
    public static Invoice Create(
        Guid tenantId,
        string invoiceNumber,
        Guid customerId,
        DateTime invoiceDate,
        DateTime dueDate)
    {
        if (string.IsNullOrWhiteSpace(invoiceNumber))
            throw new ArgumentException("Invoice number cannot be empty.", nameof(invoiceNumber));
            
        if (dueDate < invoiceDate)
            throw new ArgumentException("Due date cannot be before invoice date.", nameof(dueDate));
            
        return new Invoice(tenantId, invoiceNumber, customerId, invoiceDate, dueDate);
    }
    
    public void AddItem(InvoiceItem item)
    {
        if (Status != InvoiceStatus.Draft)
            throw new InvalidOperationException("Cannot add items to a non-draft invoice.");
            
        _items.Add(item);
        CalculateTotals();
    }
    
    public void RemoveItem(Guid itemId)
    {
        if (Status != InvoiceStatus.Draft)
            throw new InvalidOperationException("Cannot remove items from a non-draft invoice.");
            
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            _items.Remove(item);
            CalculateTotals();
        }
    }
    
    public void SetDiscount(Money discount)
    {
        if (Status != InvoiceStatus.Draft)
            throw new InvalidOperationException("Cannot modify a non-draft invoice.");
            
        DiscountAmount = discount;
        CalculateTotals();
    }
    
    public void SetTax(Money tax)
    {
        if (Status != InvoiceStatus.Draft)
            throw new InvalidOperationException("Cannot modify a non-draft invoice.");
            
        TaxAmount = tax;
        CalculateTotals();
    }
    
    private void CalculateTotals()
    {
        SubTotal = Money.Zero("TRY");
        foreach (var item in _items)
        {
            SubTotal = SubTotal.Add(item.TotalPrice);
        }
        
        TotalAmount = SubTotal.Add(TaxAmount).Subtract(DiscountAmount);
    }
    
    public void Send()
    {
        if (Status != InvoiceStatus.Draft)
            throw new InvalidOperationException("Only draft invoices can be sent.");
            
        if (!_items.Any())
            throw new InvalidOperationException("Cannot send an invoice with no items.");
            
        Status = InvoiceStatus.Sent;
    }
    
    public void MarkAsPaid(DateTime paidDate, string paymentMethod, string? paymentReference = null)
    {
        if (Status == InvoiceStatus.Paid)
            throw new InvalidOperationException("Invoice is already paid.");
            
        if (Status == InvoiceStatus.Cancelled)
            throw new InvalidOperationException("Cannot mark a cancelled invoice as paid.");
            
        Status = InvoiceStatus.Paid;
        PaidDate = paidDate;
        PaymentMethod = paymentMethod;
        PaymentReference = paymentReference;
    }
    
    public void Cancel(string reason)
    {
        if (Status == InvoiceStatus.Paid)
            throw new InvalidOperationException("Cannot cancel a paid invoice.");
            
        Status = InvoiceStatus.Cancelled;
        Notes = $"[CANCELLED] {reason}";
    }
    
    public void MarkAsOverdue()
    {
        if (Status == InvoiceStatus.Sent && DateTime.UtcNow > DueDate)
        {
            Status = InvoiceStatus.Overdue;
        }
    }
    
    public void SetNotes(string notes)
    {
        Notes = notes;
    }
    
    public void SetTerms(string terms)
    {
        Terms = terms;
    }
    
    public void SetTenantId(Guid tenantId)
    {
        TenantId = tenantId;
    }
}