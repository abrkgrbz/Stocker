using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Tenant.Enums;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Tenant.Entities;

public sealed class Payment : AggregateRoot, ITenantEntity
{
    public Guid TenantId { get; private set; }
    public string PaymentNumber { get; private set; }
    public Guid InvoiceId { get; private set; }
    public Guid CustomerId { get; private set; }
    public DateTime PaymentDate { get; private set; }
    public Money Amount { get; private set; }
    public PaymentMethod PaymentMethod { get; private set; }
    public PaymentStatus Status { get; private set; }
    public string? ReferenceNumber { get; private set; }
    public string? TransactionId { get; private set; }
    public string? Notes { get; private set; }
    public string? BankName { get; private set; }
    public string? CheckNumber { get; private set; }
    public DateTime? ClearanceDate { get; private set; }
    public string? CardLastFourDigits { get; private set; }
    public string? CardType { get; private set; }
    
    private Payment() { } // EF Constructor
    
    private Payment(
        Guid tenantId,
        string paymentNumber,
        Guid invoiceId,
        Guid customerId,
        DateTime paymentDate,
        Money amount,
        PaymentMethod paymentMethod)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        PaymentNumber = paymentNumber;
        InvoiceId = invoiceId;
        CustomerId = customerId;
        PaymentDate = paymentDate;
        Amount = amount;
        PaymentMethod = paymentMethod;
        Status = PaymentStatus.Pending;
    }
    
    public static Payment Create(
        Guid tenantId,
        string paymentNumber,
        Guid invoiceId,
        Guid customerId,
        DateTime paymentDate,
        Money amount,
        PaymentMethod paymentMethod)
    {
        if (string.IsNullOrWhiteSpace(paymentNumber))
            throw new ArgumentException("Payment number cannot be empty.", nameof(paymentNumber));
            
        if (amount.Amount <= 0)
            throw new ArgumentException("Payment amount must be greater than zero.", nameof(amount));
            
        return new Payment(tenantId, paymentNumber, invoiceId, customerId, paymentDate, amount, paymentMethod);
    }
    
    public void SetReferenceNumber(string referenceNumber)
    {
        ReferenceNumber = referenceNumber;
    }
    
    public void SetTransactionId(string transactionId)
    {
        TransactionId = transactionId;
    }
    
    public void SetNotes(string notes)
    {
        Notes = notes;
    }
    
    public void SetBankDetails(string bankName, string? checkNumber = null)
    {
        if (PaymentMethod != PaymentMethod.BankTransfer && PaymentMethod != PaymentMethod.Check)
            throw new InvalidOperationException("Bank details can only be set for bank transfer or check payments.");
            
        BankName = bankName;
        CheckNumber = checkNumber;
    }
    
    public void SetCardDetails(string lastFourDigits, string cardType)
    {
        if (PaymentMethod != PaymentMethod.CreditCard)
            throw new InvalidOperationException("Card details can only be set for credit card payments.");
            
        CardLastFourDigits = lastFourDigits;
        CardType = cardType;
    }
    
    public void Process()
    {
        if (Status != PaymentStatus.Pending)
            throw new InvalidOperationException("Only pending payments can be processed.");
            
        Status = PaymentStatus.Processing;
    }
    
    public void Complete(string? transactionId = null)
    {
        if (Status != PaymentStatus.Processing)
            throw new InvalidOperationException("Only processing payments can be completed.");
            
        Status = PaymentStatus.Completed;
        if (!string.IsNullOrEmpty(transactionId))
        {
            TransactionId = transactionId;
        }
    }
    
    public void Fail(string reason)
    {
        if (Status == PaymentStatus.Completed || Status == PaymentStatus.Refunded)
            throw new InvalidOperationException("Cannot fail a completed or refunded payment.");
            
        Status = PaymentStatus.Failed;
        Notes = $"[FAILED] {reason}";
    }
    
    public void Cancel(string reason)
    {
        if (Status == PaymentStatus.Completed || Status == PaymentStatus.Refunded)
            throw new InvalidOperationException("Cannot cancel a completed or refunded payment.");
            
        Status = PaymentStatus.Cancelled;
        Notes = $"[CANCELLED] {reason}";
    }
    
    public void Refund(string reason)
    {
        if (Status != PaymentStatus.Completed)
            throw new InvalidOperationException("Only completed payments can be refunded.");
            
        Status = PaymentStatus.Refunded;
        Notes = $"[REFUNDED] {reason}";
    }
    
    public void MarkAsCleared(DateTime clearanceDate)
    {
        if (PaymentMethod != PaymentMethod.Check)
            throw new InvalidOperationException("Only check payments can be marked as cleared.");
            
        if (Status != PaymentStatus.Processing)
            throw new InvalidOperationException("Only processing check payments can be marked as cleared.");
            
        ClearanceDate = clearanceDate;
        Status = PaymentStatus.Completed;
    }
    
    public void SetTenantId(Guid tenantId)
    {
        TenantId = tenantId;
    }
}