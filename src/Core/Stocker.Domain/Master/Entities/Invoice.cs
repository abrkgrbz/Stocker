using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class Invoice : AggregateRoot
{
    private readonly List<InvoiceItem> _items = new();
    private readonly List<Payment> _payments = new();

    public Guid TenantId { get; private set; }
    public Guid SubscriptionId { get; private set; }
    public string InvoiceNumber { get; private set; }
    public InvoiceStatus Status { get; private set; }
    public Money Subtotal { get; private set; }
    public Money TaxAmount { get; private set; }
    public Money TotalAmount { get; private set; }
    public Money PaidAmount { get; private set; }
    public decimal TaxRate { get; private set; }
    public DateTime IssueDate { get; private set; }
    public DateTime DueDate { get; private set; }
    public DateTime? PaidDate { get; private set; }
    public string? Notes { get; private set; }
    public Address? BillingAddress { get; private set; }
    public IReadOnlyList<InvoiceItem> Items => _items.AsReadOnly();
    public IReadOnlyList<Payment> Payments => _payments.AsReadOnly();

    private Invoice() { } // EF Constructor

    private Invoice(
        Guid tenantId,
        Guid subscriptionId,
        Money totalAmount,
        decimal taxRate,
        DateTime issueDate,
        DateTime dueDate,
        Address? billingAddress = null,
        string? notes = null)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        SubscriptionId = subscriptionId;
        InvoiceNumber = GenerateInvoiceNumber();
        Status = InvoiceStatus.Draft;
        TaxRate = taxRate;
        Subtotal = totalAmount;
        TaxAmount = totalAmount.Multiply(taxRate / 100);
        TotalAmount = totalAmount.Add(TaxAmount);
        PaidAmount = Money.Zero(totalAmount.Currency);
        IssueDate = issueDate;
        DueDate = dueDate;
        BillingAddress = billingAddress;
        Notes = notes;
    }

    public static Invoice Create(
        Guid tenantId,
        Guid subscriptionId,
        Money totalAmount,
        decimal taxRate,
        DateTime issueDate,
        DateTime dueDate,
        Address? billingAddress = null,
        string? notes = null)
    {
        if (taxRate < 0 || taxRate > 100)
        {
            throw new ArgumentException("Tax rate must be between 0 and 100.", nameof(taxRate));
        }

        if (dueDate < issueDate)
        {
            throw new ArgumentException("Due date must be after issue date.", nameof(dueDate));
        }

        return new Invoice(tenantId, subscriptionId, totalAmount, taxRate, issueDate, dueDate, billingAddress, notes);
    }

    public void AddItem(string description, int quantity, Money unitPrice)
    {
        if (Status != InvoiceStatus.Draft)
        {
            throw new InvalidOperationException("Items can only be added to draft invoices.");
        }

        var lineTotal = unitPrice.Multiply(quantity);
        _items.Add(new InvoiceItem(Id, description, quantity, unitPrice, lineTotal));

        RecalculateTotals();
    }

    public void RemoveItem(Guid itemId)
    {
        if (Status != InvoiceStatus.Draft)
        {
            throw new InvalidOperationException("Items can only be removed from draft invoices.");
        }

        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
        {
            throw new InvalidOperationException($"Item with ID '{itemId}' not found.");
        }

        _items.Remove(item);
        RecalculateTotals();
    }

    public void Send()
    {
        if (Status != InvoiceStatus.Draft)
        {
            throw new InvalidOperationException("Only draft invoices can be sent.");
        }

        if (!_items.Any())
        {
            throw new InvalidOperationException("Cannot send an invoice without items.");
        }

        Status = InvoiceStatus.Sent;
    }

    public void AddPayment(PaymentMethod method, Money amount, string? transactionId = null, string? notes = null)
    {
        if (Status == InvoiceStatus.Cancelled || Status == InvoiceStatus.Refunded)
        {
            throw new InvalidOperationException("Cannot add payment to cancelled or refunded invoices.");
        }

        if (amount.Currency != TotalAmount.Currency)
        {
            throw new InvalidOperationException("Payment currency must match invoice currency.");
        }

        var payment = Payment.Create(Id, method, amount, transactionId, notes);
        _payments.Add(payment);

        PaidAmount = PaidAmount.Add(amount);
        UpdatePaymentStatus();
    }

    public void MarkAsPaid()
    {
        if (Status == InvoiceStatus.Paid)
        {
            throw new InvalidOperationException("Invoice is already paid.");
        }

        Status = InvoiceStatus.Paid;
        PaidDate = DateTime.UtcNow;
        PaidAmount = TotalAmount;
    }

    public void MarkAsOverdue()
    {
        if (Status != InvoiceStatus.Sent && Status != InvoiceStatus.PartiallyPaid)
        {
            throw new InvalidOperationException("Only sent or partially paid invoices can be marked as overdue.");
        }

        if (DateTime.UtcNow <= DueDate)
        {
            throw new InvalidOperationException("Invoice is not yet overdue.");
        }

        Status = InvoiceStatus.Overdue;
    }

    public void Cancel()
    {
        if (Status == InvoiceStatus.Paid || Status == InvoiceStatus.Refunded)
        {
            throw new InvalidOperationException("Cannot cancel paid or refunded invoices.");
        }

        Status = InvoiceStatus.Cancelled;
    }

    public void Refund(Money amount, string reason)
    {
        if (Status != InvoiceStatus.Paid)
        {
            throw new InvalidOperationException("Only paid invoices can be refunded.");
        }

        if (amount.Currency != TotalAmount.Currency)
        {
            throw new InvalidOperationException("Refund currency must match invoice currency.");
        }

        var payment = Payment.CreateRefund(Id, amount, reason);
        _payments.Add(payment);

        PaidAmount = PaidAmount.Subtract(amount);
        Status = PaidAmount.IsZero() ? InvoiceStatus.Refunded : InvoiceStatus.PartiallyPaid;
    }

    private void RecalculateTotals()
    {
        var currency = _items.FirstOrDefault()?.UnitPrice.Currency ?? "USD";
        Subtotal = _items.Aggregate(Money.Zero(currency), (total, item) => total.Add(item.LineTotal));
        TaxAmount = Subtotal.Multiply(TaxRate / 100);
        TotalAmount = Subtotal.Add(TaxAmount);
    }

    private void UpdatePaymentStatus()
    {
        if (PaidAmount.Equals(TotalAmount))
        {
            Status = InvoiceStatus.Paid;
            PaidDate = DateTime.UtcNow;
        }
        else if (PaidAmount.Amount > 0 && PaidAmount.Amount < TotalAmount.Amount)
        {
            Status = InvoiceStatus.PartiallyPaid;
        }
    }

    private static string GenerateInvoiceNumber()
    {
        return $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
    }
}