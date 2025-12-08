using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

public class SupplierPayment : TenantAggregateRoot
{
    public string PaymentNumber { get; private set; } = string.Empty;
    public DateTime PaymentDate { get; private set; }
    public Guid SupplierId { get; private set; }
    public string? SupplierName { get; private set; }
    public SupplierPaymentStatus Status { get; private set; }
    public SupplierPaymentType Type { get; private set; }
    public PaymentMethod Method { get; private set; }

    // Amount
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public decimal ExchangeRate { get; private set; }
    public decimal AmountInBaseCurrency { get; private set; }

    // Bank details
    public string? BankName { get; private set; }
    public string? BankAccountNumber { get; private set; }
    public string? IBAN { get; private set; }
    public string? SwiftCode { get; private set; }
    public string? CheckNumber { get; private set; }
    public DateTime? CheckDate { get; private set; }

    // References
    public string? TransactionReference { get; private set; }
    public string? Description { get; private set; }

    // Linked documents
    public Guid? PurchaseInvoiceId { get; private set; }
    public string? PurchaseInvoiceNumber { get; private set; }
    public string? LinkedInvoiceIds { get; private set; } // JSON array for multiple invoices

    // Approval
    public bool RequiresApproval { get; private set; }
    public Guid? ApprovedById { get; private set; }
    public string? ApprovedByName { get; private set; }
    public DateTime? ApprovalDate { get; private set; }

    // Processing
    public Guid? ProcessedById { get; private set; }
    public string? ProcessedByName { get; private set; }
    public DateTime? ProcessedDate { get; private set; }

    // Notes
    public string? Notes { get; private set; }
    public string? InternalNotes { get; private set; }

    // Reconciliation
    public bool IsReconciled { get; private set; }
    public DateTime? ReconciliationDate { get; private set; }
    public string? ReconciliationReference { get; private set; }

    // Audit
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    protected SupplierPayment() : base() { }

    public static SupplierPayment Create(
        string paymentNumber,
        Guid supplierId,
        string? supplierName,
        decimal amount,
        PaymentMethod method,
        Guid tenantId,
        SupplierPaymentType type = SupplierPaymentType.Standard,
        string currency = "TRY")
    {
        var payment = new SupplierPayment();
        payment.Id = Guid.NewGuid();
        payment.SetTenantId(tenantId);
        payment.PaymentNumber = paymentNumber;
        payment.PaymentDate = DateTime.UtcNow;
        payment.SupplierId = supplierId;
        payment.SupplierName = supplierName;
        payment.Amount = amount;
        payment.Currency = currency;
        payment.ExchangeRate = 1;
        payment.AmountInBaseCurrency = amount;
        payment.Method = method;
        payment.Type = type;
        payment.Status = SupplierPaymentStatus.Draft;
        payment.RequiresApproval = amount >= 10000;
        payment.IsReconciled = false;
        payment.CreatedAt = DateTime.UtcNow;
        return payment;
    }

    public void SetAmount(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be greater than 0");

        Amount = amount;
        AmountInBaseCurrency = amount * ExchangeRate;
        RequiresApproval = amount >= 10000;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetExchangeRate(decimal rate)
    {
        if (rate <= 0)
            throw new ArgumentException("Exchange rate must be greater than 0");

        ExchangeRate = rate;
        AmountInBaseCurrency = Amount * rate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPaymentDate(DateTime paymentDate)
    {
        PaymentDate = paymentDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetBankDetails(string? bankName, string? accountNumber, string? iban, string? swiftCode)
    {
        BankName = bankName;
        BankAccountNumber = accountNumber;
        IBAN = iban;
        SwiftCode = swiftCode;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCheckDetails(string? checkNumber, DateTime? checkDate)
    {
        CheckNumber = checkNumber;
        CheckDate = checkDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetTransactionReference(string reference)
    {
        TransactionReference = reference;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDescription(string? description)
    {
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }

    public void LinkToInvoice(Guid invoiceId, string? invoiceNumber)
    {
        PurchaseInvoiceId = invoiceId;
        PurchaseInvoiceNumber = invoiceNumber;
        UpdatedAt = DateTime.UtcNow;
    }

    public void LinkToMultipleInvoices(string invoiceIdsJson)
    {
        LinkedInvoiceIds = invoiceIdsJson;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetNotes(string? notes, string? internalNotes)
    {
        Notes = notes;
        InternalNotes = internalNotes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Submit()
    {
        if (Status != SupplierPaymentStatus.Draft)
            throw new InvalidOperationException("Only draft payments can be submitted");

        Status = RequiresApproval ? SupplierPaymentStatus.PendingApproval : SupplierPaymentStatus.Approved;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approvedById, string? approvedByName)
    {
        if (Status != SupplierPaymentStatus.PendingApproval)
            throw new InvalidOperationException("Only pending approval payments can be approved");

        Status = SupplierPaymentStatus.Approved;
        ApprovedById = approvedById;
        ApprovedByName = approvedByName;
        ApprovalDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(string reason)
    {
        if (Status != SupplierPaymentStatus.PendingApproval)
            throw new InvalidOperationException("Only pending approval payments can be rejected");

        Status = SupplierPaymentStatus.Rejected;
        InternalNotes = $"Rejected: {reason}. {InternalNotes}";
        UpdatedAt = DateTime.UtcNow;
    }

    public void Process(Guid processedById, string? processedByName)
    {
        if (Status != SupplierPaymentStatus.Approved)
            throw new InvalidOperationException("Only approved payments can be processed");

        Status = SupplierPaymentStatus.Processed;
        ProcessedById = processedById;
        ProcessedByName = processedByName;
        ProcessedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        if (Status != SupplierPaymentStatus.Processed)
            throw new InvalidOperationException("Only processed payments can be completed");

        Status = SupplierPaymentStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsReconciled(string? reference = null)
    {
        IsReconciled = true;
        ReconciliationDate = DateTime.UtcNow;
        ReconciliationReference = reference;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        if (Status == SupplierPaymentStatus.Completed || Status == SupplierPaymentStatus.Cancelled)
            throw new InvalidOperationException("Cannot cancel a completed or already cancelled payment");

        Status = SupplierPaymentStatus.Cancelled;
        InternalNotes = $"Cancelled: {reason}. {InternalNotes}";
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reverse(string reason)
    {
        if (Status != SupplierPaymentStatus.Completed)
            throw new InvalidOperationException("Only completed payments can be reversed");

        Status = SupplierPaymentStatus.Reversed;
        InternalNotes = $"Reversed: {reason}. {InternalNotes}";
        UpdatedAt = DateTime.UtcNow;
    }
}

public enum SupplierPaymentStatus
{
    Draft,
    PendingApproval,
    Approved,
    Rejected,
    Processed,
    Completed,
    Cancelled,
    Reversed
}

public enum SupplierPaymentType
{
    Standard,
    Advance,
    Partial,
    Final,
    Refund,
    Adjustment
}
