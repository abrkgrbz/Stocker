using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a payment received for an invoice
/// </summary>
public class Payment : TenantAggregateRoot
{
    public string PaymentNumber { get; private set; } = string.Empty;
    public DateTime PaymentDate { get; private set; }
    public Guid? InvoiceId { get; private set; }
    public Guid? CustomerId { get; private set; }
    public string? CustomerName { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public decimal ExchangeRate { get; private set; } = 1;
    public PaymentMethod Method { get; private set; }
    public PaymentStatus Status { get; private set; }
    public string? ReferenceNumber { get; private set; }
    public string? BankName { get; private set; }
    public string? BankAccountNumber { get; private set; }
    public string? CheckNumber { get; private set; }
    public DateTime? CheckDueDate { get; private set; }
    public string? CardLastFourDigits { get; private set; }
    public string? CardType { get; private set; }
    public string? TransactionId { get; private set; }
    public string? Notes { get; private set; }
    public Guid? ReceivedBy { get; private set; }
    public string? ReceivedByName { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public virtual Invoice? Invoice { get; private set; }

    private Payment() : base() { }

    public static Result<Payment> Create(
        Guid tenantId,
        string paymentNumber,
        DateTime paymentDate,
        decimal amount,
        PaymentMethod method,
        Guid? invoiceId = null,
        Guid? customerId = null,
        string? customerName = null,
        string currency = "TRY")
    {
        if (string.IsNullOrWhiteSpace(paymentNumber))
            return Result<Payment>.Failure(Error.Validation("Payment.PaymentNumber", "Payment number is required"));

        if (amount <= 0)
            return Result<Payment>.Failure(Error.Validation("Payment.Amount", "Payment amount must be greater than 0"));

        var payment = new Payment();
        payment.Id = Guid.NewGuid();
        payment.SetTenantId(tenantId);
        payment.PaymentNumber = paymentNumber;
        payment.PaymentDate = paymentDate;
        payment.Amount = amount;
        payment.Method = method;
        payment.InvoiceId = invoiceId;
        payment.CustomerId = customerId;
        payment.CustomerName = customerName;
        payment.Currency = currency;
        payment.ExchangeRate = 1;
        payment.Status = PaymentStatus.Pending;
        payment.CreatedAt = DateTime.UtcNow;

        return Result<Payment>.Success(payment);
    }

    public Result SetBankDetails(string? bankName, string? accountNumber)
    {
        BankName = bankName;
        BankAccountNumber = accountNumber;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetCheckDetails(string checkNumber, DateTime? dueDate)
    {
        if (Method != PaymentMethod.Check)
            return Result.Failure(Error.Conflict("Payment.Method", "Check details can only be set for check payments"));

        CheckNumber = checkNumber;
        CheckDueDate = dueDate;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetCardDetails(string lastFourDigits, string? cardType)
    {
        if (Method != PaymentMethod.CreditCard && Method != PaymentMethod.DebitCard)
            return Result.Failure(Error.Conflict("Payment.Method", "Card details can only be set for card payments"));

        CardLastFourDigits = lastFourDigits;
        CardType = cardType;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetTransactionId(string transactionId)
    {
        TransactionId = transactionId;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetReference(string referenceNumber)
    {
        ReferenceNumber = referenceNumber;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetReceivedBy(Guid userId, string userName)
    {
        ReceivedBy = userId;
        ReceivedByName = userName;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Confirm()
    {
        if (Status != PaymentStatus.Pending)
            return Result.Failure(Error.Conflict("Payment.Status", "Only pending payments can be confirmed"));

        Status = PaymentStatus.Confirmed;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Complete()
    {
        if (Status != PaymentStatus.Confirmed)
            return Result.Failure(Error.Conflict("Payment.Status", "Only confirmed payments can be completed"));

        Status = PaymentStatus.Completed;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Reject(string reason)
    {
        if (Status == PaymentStatus.Completed)
            return Result.Failure(Error.Conflict("Payment.Status", "Completed payments cannot be rejected"));

        if (Status == PaymentStatus.Rejected)
            return Result.Failure(Error.Conflict("Payment.Status", "Payment is already rejected"));

        Status = PaymentStatus.Rejected;
        Notes = string.IsNullOrEmpty(Notes)
            ? $"Rejected: {reason}"
            : $"{Notes}\nRejected: {reason}";
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Refund(string reason)
    {
        if (Status != PaymentStatus.Completed)
            return Result.Failure(Error.Conflict("Payment.Status", "Only completed payments can be refunded"));

        Status = PaymentStatus.Refunded;
        Notes = string.IsNullOrEmpty(Notes)
            ? $"Refunded: {reason}"
            : $"{Notes}\nRefunded: {reason}";
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }
}

public enum PaymentStatus
{
    Pending = 0,
    Confirmed = 1,
    Completed = 2,
    Rejected = 3,
    Refunded = 4
}

public enum PaymentMethod
{
    Cash = 0,
    BankTransfer = 1,
    CreditCard = 2,
    DebitCard = 3,
    Check = 4,
    DirectDebit = 5,
    Other = 6
}
