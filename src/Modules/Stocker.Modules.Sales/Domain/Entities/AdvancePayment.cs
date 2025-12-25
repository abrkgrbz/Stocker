using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents an advance payment (deposit/pre-payment) received from a customer
/// BEFORE the invoice is issued. Used for securing orders, especially for
/// custom or high-value items.
/// </summary>
public class AdvancePayment : TenantAggregateRoot
{
    #region Properties

    public string PaymentNumber { get; private set; } = string.Empty;
    public DateTime PaymentDate { get; private set; }

    // Customer
    public Guid? CustomerId { get; private set; }
    public string CustomerName { get; private set; } = string.Empty;
    public string? CustomerTaxNumber { get; private set; }

    // Related Order
    public Guid? SalesOrderId { get; private set; }
    public string? SalesOrderNumber { get; private set; }
    public decimal OrderTotalAmount { get; private set; }

    // Payment Details
    public decimal Amount { get; private set; }
    public decimal AppliedAmount { get; private set; }
    public decimal RemainingAmount => Amount - AppliedAmount - RefundedAmount;
    public decimal RefundedAmount { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public decimal ExchangeRate { get; private set; } = 1m;

    // Payment Method
    public PaymentMethod PaymentMethod { get; private set; }
    public string? PaymentReference { get; private set; }
    public string? BankName { get; private set; }
    public string? BankAccountNumber { get; private set; }
    public string? CheckNumber { get; private set; }
    public DateTime? CheckDate { get; private set; }

    // Status
    public AdvancePaymentStatus Status { get; private set; }
    public bool IsCaptured => Status == AdvancePaymentStatus.Captured || Status == AdvancePaymentStatus.PartiallyApplied || Status == AdvancePaymentStatus.FullyApplied;
    public bool IsFullyApplied => AppliedAmount >= Amount - RefundedAmount;
    public bool IsRefunded => Status == AdvancePaymentStatus.Refunded;

    // Capture
    public DateTime? CapturedDate { get; private set; }
    public Guid? CapturedBy { get; private set; }
    public string? CapturedByName { get; private set; }

    // Refund
    public DateTime? RefundedDate { get; private set; }
    public Guid? RefundedBy { get; private set; }
    public string? RefundReason { get; private set; }

    // Receipt
    public string? ReceiptNumber { get; private set; }
    public DateTime? ReceiptDate { get; private set; }
    public bool ReceiptIssued => !string.IsNullOrEmpty(ReceiptNumber);

    // Audit
    public string? Notes { get; private set; }
    public Guid? CreatedBy { get; private set; }
    public string? CreatedByName { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    #endregion

    #region Constructors

    private AdvancePayment() { }

    private AdvancePayment(
        Guid tenantId,
        string paymentNumber,
        Guid? customerId,
        string customerName,
        decimal amount,
        string currency) : base(Guid.NewGuid(), tenantId)
    {
        PaymentNumber = paymentNumber;
        CustomerId = customerId;
        CustomerName = customerName;
        Amount = amount;
        Currency = currency;
        PaymentDate = DateTime.UtcNow;
        Status = AdvancePaymentStatus.Pending;
        PaymentMethod = PaymentMethod.BankTransfer;
        CreatedAt = DateTime.UtcNow;
    }

    #endregion

    #region Factory Methods

    public static Result<AdvancePayment> Create(
        Guid tenantId,
        string paymentNumber,
        Guid? customerId,
        string customerName,
        decimal amount,
        string currency = "TRY")
    {
        if (string.IsNullOrWhiteSpace(paymentNumber))
            return Result<AdvancePayment>.Failure(Error.Validation("AdvancePayment.NumberRequired", "Payment number is required"));

        if (string.IsNullOrWhiteSpace(customerName))
            return Result<AdvancePayment>.Failure(Error.Validation("AdvancePayment.CustomerRequired", "Customer name is required"));

        if (amount <= 0)
            return Result<AdvancePayment>.Failure(Error.Validation("AdvancePayment.InvalidAmount", "Amount must be greater than zero"));

        return Result<AdvancePayment>.Success(new AdvancePayment(tenantId, paymentNumber, customerId, customerName, amount, currency));
    }

    /// <summary>
    /// Creates an advance payment linked to a sales order with validation
    /// </summary>
    public static Result<AdvancePayment> CreateForOrder(
        Guid tenantId,
        string paymentNumber,
        Guid salesOrderId,
        string salesOrderNumber,
        decimal orderTotal,
        Guid? customerId,
        string customerName,
        decimal amount,
        string currency = "TRY")
    {
        if (amount > orderTotal)
            return Result<AdvancePayment>.Failure(Error.Validation("AdvancePayment.ExceedsOrder",
                $"Advance payment ({amount:N2}) cannot exceed order total ({orderTotal:N2})"));

        var result = Create(tenantId, paymentNumber, customerId, customerName, amount, currency);
        if (!result.IsSuccess)
            return result;

        var payment = result.Value;
        payment.SalesOrderId = salesOrderId;
        payment.SalesOrderNumber = salesOrderNumber;
        payment.OrderTotalAmount = orderTotal;

        return Result<AdvancePayment>.Success(payment);
    }

    #endregion

    #region Order Link

    public Result LinkToOrder(Guid salesOrderId, string salesOrderNumber, decimal orderTotal)
    {
        if (Amount > orderTotal)
            return Result.Failure(Error.Validation("AdvancePayment.ExceedsOrder",
                $"Advance payment ({Amount:N2}) cannot exceed order total ({orderTotal:N2})"));

        SalesOrderId = salesOrderId;
        SalesOrderNumber = salesOrderNumber;
        OrderTotalAmount = orderTotal;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result UpdateOrderTotal(decimal newOrderTotal)
    {
        if (Amount > newOrderTotal)
            return Result.Failure(Error.Validation("AdvancePayment.ExceedsOrder",
                "Current advance payment exceeds new order total"));

        OrderTotalAmount = newOrderTotal;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Capture

    public Result Capture(Guid capturedBy, string? capturedByName = null)
    {
        if (Status != AdvancePaymentStatus.Pending)
            return Result.Failure(Error.Validation("AdvancePayment.NotPending", "Only pending payments can be captured"));

        Status = AdvancePaymentStatus.Captured;
        CapturedDate = DateTime.UtcNow;
        CapturedBy = capturedBy;
        CapturedByName = capturedByName;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetPaymentDetails(
        PaymentMethod method,
        string? reference = null,
        string? bankName = null,
        string? accountNumber = null,
        string? checkNumber = null,
        DateTime? checkDate = null)
    {
        PaymentMethod = method;
        PaymentReference = reference;
        BankName = bankName;
        BankAccountNumber = accountNumber;
        CheckNumber = checkNumber;
        CheckDate = checkDate;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Apply to Invoice

    /// <summary>
    /// Applies a portion of this advance payment to an invoice
    /// </summary>
    public Result ApplyToInvoice(Guid invoiceId, string invoiceNumber, decimal amountToApply)
    {
        if (!IsCaptured)
            return Result.Failure(Error.Validation("AdvancePayment.NotCaptured", "Payment must be captured before applying"));

        if (amountToApply <= 0)
            return Result.Failure(Error.Validation("AdvancePayment.InvalidApplyAmount", "Amount to apply must be greater than zero"));

        if (amountToApply > RemainingAmount)
            return Result.Failure(Error.Validation("AdvancePayment.ExceedsRemaining",
                $"Amount to apply ({amountToApply:N2}) exceeds remaining balance ({RemainingAmount:N2})"));

        AppliedAmount += amountToApply;

        // Update status
        if (IsFullyApplied)
            Status = AdvancePaymentStatus.FullyApplied;
        else
            Status = AdvancePaymentStatus.PartiallyApplied;

        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Reverses a previously applied amount
    /// </summary>
    public Result ReverseApplication(decimal amountToReverse)
    {
        if (amountToReverse <= 0)
            return Result.Failure(Error.Validation("AdvancePayment.InvalidReverseAmount", "Amount to reverse must be greater than zero"));

        if (amountToReverse > AppliedAmount)
            return Result.Failure(Error.Validation("AdvancePayment.ExceedsApplied",
                $"Amount to reverse ({amountToReverse:N2}) exceeds applied amount ({AppliedAmount:N2})"));

        AppliedAmount -= amountToReverse;

        // Update status
        if (AppliedAmount == 0)
            Status = AdvancePaymentStatus.Captured;
        else
            Status = AdvancePaymentStatus.PartiallyApplied;

        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Refund

    public Result Refund(Guid refundedBy, string reason)
    {
        if (Status == AdvancePaymentStatus.Refunded)
            return Result.Failure(Error.Validation("AdvancePayment.AlreadyRefunded", "Payment is already refunded"));

        if (AppliedAmount > 0)
            return Result.Failure(Error.Validation("AdvancePayment.HasApplications",
                "Cannot refund payment that has been applied to invoices. Reverse applications first."));

        if (string.IsNullOrWhiteSpace(reason))
            return Result.Failure(Error.Validation("AdvancePayment.ReasonRequired", "Refund reason is required"));

        RefundedAmount = RemainingAmount;
        Status = AdvancePaymentStatus.Refunded;
        RefundedDate = DateTime.UtcNow;
        RefundedBy = refundedBy;
        RefundReason = reason;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Partial refund of remaining balance
    /// </summary>
    public Result PartialRefund(decimal refundAmount, Guid refundedBy, string reason)
    {
        if (refundAmount <= 0)
            return Result.Failure(Error.Validation("AdvancePayment.InvalidRefundAmount", "Refund amount must be greater than zero"));

        if (refundAmount > RemainingAmount)
            return Result.Failure(Error.Validation("AdvancePayment.ExceedsRemaining",
                $"Refund amount ({refundAmount:N2}) exceeds remaining balance ({RemainingAmount:N2})"));

        RefundedAmount += refundAmount;
        RefundedDate = DateTime.UtcNow;
        RefundedBy = refundedBy;
        RefundReason = reason;

        // Check if fully refunded
        if (RemainingAmount <= 0 && AppliedAmount <= 0)
            Status = AdvancePaymentStatus.Refunded;

        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Cancel

    public Result Cancel(string reason)
    {
        if (Status != AdvancePaymentStatus.Pending)
            return Result.Failure(Error.Validation("AdvancePayment.CannotCancel", "Only pending payments can be cancelled"));

        Status = AdvancePaymentStatus.Cancelled;
        Notes = $"{Notes}\nCancelled: {reason}".Trim();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Receipt

    public Result IssueReceipt(string receiptNumber)
    {
        if (string.IsNullOrWhiteSpace(receiptNumber))
            return Result.Failure(Error.Validation("AdvancePayment.ReceiptRequired", "Receipt number is required"));

        if (!IsCaptured)
            return Result.Failure(Error.Validation("AdvancePayment.NotCaptured", "Cannot issue receipt for uncaptured payment"));

        ReceiptNumber = receiptNumber;
        ReceiptDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Metadata

    public Result SetCustomerDetails(string? taxNumber)
    {
        CustomerTaxNumber = taxNumber;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetExchangeRate(decimal exchangeRate)
    {
        if (exchangeRate <= 0)
            return Result.Failure(Error.Validation("AdvancePayment.InvalidRate", "Exchange rate must be greater than zero"));

        ExchangeRate = exchangeRate;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetCreator(Guid userId, string? userName)
    {
        CreatedBy = userId;
        CreatedByName = userName;
        return Result.Success();
    }

    public Result SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion
}

#region Enums

public enum AdvancePaymentStatus
{
    Pending = 0,            // Payment recorded but not yet confirmed
    Captured = 1,           // Payment confirmed/received
    PartiallyApplied = 2,   // Some amount applied to invoices
    FullyApplied = 3,       // Entire amount applied to invoices
    Refunded = 4,           // Payment refunded to customer
    Cancelled = 5           // Payment cancelled before capture
}

// Note: PaymentMethod enum is defined in Payment.cs

#endregion
