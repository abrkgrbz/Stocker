using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class Payment : Entity
{
    public Guid InvoiceId { get; private set; }
    public Enums.PaymentMethod Method { get; private set; }
    public PaymentStatus Status { get; private set; }
    public Money Amount { get; private set; }
    public string? TransactionId { get; private set; }
    public string? Notes { get; private set; }
    public DateTime ProcessedAt { get; private set; }
    public bool IsRefund { get; private set; }
    public string? RefundReason { get; private set; }

    private Payment() { } // EF Constructor

    private Payment(
        Guid invoiceId,
        Enums.PaymentMethod method,
        Money amount,
        string? transactionId = null,
        string? notes = null,
        bool isRefund = false,
        string? refundReason = null)
    {
        Id = Guid.NewGuid();
        InvoiceId = invoiceId;
        Method = method;
        Status = PaymentStatus.Tamamlandi;
        Amount = amount;
        TransactionId = transactionId;
        Notes = notes;
        ProcessedAt = DateTime.UtcNow;
        IsRefund = isRefund;
        RefundReason = refundReason;
    }

    public static Payment Create(
        Guid invoiceId,
        Enums.PaymentMethod method,
        Money amount,
        string? transactionId = null,
        string? notes = null)
    {
        if (amount.Amount <= 0)
        {
            throw new ArgumentException("Payment amount must be greater than zero.", nameof(amount));
        }

        return new Payment(invoiceId, method, amount, transactionId, notes);
    }

    public static Payment CreateRefund(
        Guid invoiceId,
        Money amount,
        string reason)
    {
        if (amount.Amount <= 0)
        {
            throw new ArgumentException("Refund amount must be greater than zero.", nameof(amount));
        }

        if (string.IsNullOrWhiteSpace(reason))
        {
            throw new ArgumentException("Refund reason is required.", nameof(reason));
        }

        return new Payment(
            invoiceId,
            Enums.PaymentMethod.Diger,
            amount,
            isRefund: true,
            refundReason: reason);
    }

    public void MarkAsFailed(string reason)
    {
        if (Status != PaymentStatus.Beklemede && Status != PaymentStatus.Isleniyor)
        {
            throw new InvalidOperationException("Only pending or processing payments can be marked as failed.");
        }

        Status = PaymentStatus.Basarisiz;
        Notes = $"Failed: {reason}";
    }

    public void MarkAsCompleted(string? transactionId = null)
    {
        if (Status != PaymentStatus.Beklemede && Status != PaymentStatus.Isleniyor)
        {
            throw new InvalidOperationException("Only pending or processing payments can be marked as completed.");
        }

        Status = PaymentStatus.Tamamlandi;
        ProcessedAt = DateTime.UtcNow;
        
        if (!string.IsNullOrWhiteSpace(transactionId))
        {
            TransactionId = transactionId;
        }
    }
}