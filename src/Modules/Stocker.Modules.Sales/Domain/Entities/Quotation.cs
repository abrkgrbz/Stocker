using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a sales quotation/proposal
/// </summary>
public class Quotation : TenantAggregateRoot
{
    private readonly List<QuotationItem> _items = new();

    public string QuotationNumber { get; private set; } = string.Empty;
    public string? Name { get; private set; }
    public DateTime QuotationDate { get; private set; }
    public DateTime? ExpirationDate { get; private set; }
    public Guid? CustomerId { get; private set; }
    public string? CustomerName { get; private set; }
    public string? CustomerEmail { get; private set; }
    public string? CustomerPhone { get; private set; }
    public string? CustomerTaxNumber { get; private set; }
    public Guid? ContactId { get; private set; }
    public string? ContactName { get; private set; }
    public Guid? OpportunityId { get; private set; }
    public Guid? SalesPersonId { get; private set; }
    public string? SalesPersonName { get; private set; }
    public decimal SubTotal { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal DiscountRate { get; private set; }
    public decimal VatAmount { get; private set; }
    public decimal ShippingAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public decimal ExchangeRate { get; private set; } = 1;
    public QuotationStatus Status { get; private set; }
    public string? ShippingAddress { get; private set; }
    public string? BillingAddress { get; private set; }
    public string? PaymentTerms { get; private set; }
    public string? DeliveryTerms { get; private set; }
    public int ValidityDays { get; private set; } = 30;
    public string? Notes { get; private set; }
    public string? TermsAndConditions { get; private set; }
    public string? InternalNotes { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public DateTime? SentDate { get; private set; }
    public DateTime? AcceptedDate { get; private set; }
    public DateTime? RejectedDate { get; private set; }
    public string? RejectionReason { get; private set; }
    public Guid? ConvertedToOrderId { get; private set; }
    public DateTime? ConvertedDate { get; private set; }
    public int RevisionNumber { get; private set; } = 1;
    public Guid? ParentQuotationId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public IReadOnlyList<QuotationItem> Items => _items.AsReadOnly();

    private Quotation() : base() { }

    public static Result<Quotation> Create(
        Guid tenantId,
        string quotationNumber,
        DateTime quotationDate,
        Guid? customerId = null,
        string? customerName = null,
        string? customerEmail = null,
        int validityDays = 30,
        string currency = "TRY")
    {
        if (string.IsNullOrWhiteSpace(quotationNumber))
            return Result<Quotation>.Failure(Error.Validation("Quotation.QuotationNumber", "Quotation number is required"));

        var quotation = new Quotation
        {
            Id = Guid.NewGuid(),
            QuotationNumber = quotationNumber,
            QuotationDate = quotationDate,
            CustomerId = customerId,
            CustomerName = customerName,
            CustomerEmail = customerEmail,
            Currency = currency,
            ExchangeRate = 1,
            ValidityDays = validityDays,
            ExpirationDate = quotationDate.AddDays(validityDays),
            Status = QuotationStatus.Draft,
            SubTotal = 0,
            DiscountAmount = 0,
            DiscountRate = 0,
            VatAmount = 0,
            ShippingAmount = 0,
            TotalAmount = 0,
            RevisionNumber = 1,
            CreatedAt = DateTime.UtcNow
        };

        quotation.SetTenantId(tenantId);

        return Result<Quotation>.Success(quotation);
    }

    public static string GenerateQuotationNumber()
    {
        return $"QT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
    }

    public Result AddItem(QuotationItem item)
    {
        if (item == null)
            return Result.Failure(Error.Validation("Quotation.Item", "Item cannot be null"));

        if (Status != QuotationStatus.Draft)
            return Result.Failure(Error.Conflict("Quotation.Status", "Cannot add items to a non-draft quotation"));

        _items.Add(item);
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result RemoveItem(Guid itemId)
    {
        if (Status != QuotationStatus.Draft)
            return Result.Failure(Error.Conflict("Quotation.Status", "Cannot remove items from a non-draft quotation"));

        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            return Result.Failure(Error.NotFound("Quotation.Item", "Item not found"));

        _items.Remove(item);
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result UpdateCustomer(Guid? customerId, string? customerName, string? customerEmail, string? customerPhone, string? customerTaxNumber)
    {
        CustomerId = customerId;
        CustomerName = customerName;
        CustomerEmail = customerEmail;
        CustomerPhone = customerPhone;
        CustomerTaxNumber = customerTaxNumber;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetContact(Guid? contactId, string? contactName)
    {
        ContactId = contactId;
        ContactName = contactName;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetSalesPerson(Guid? salesPersonId, string? salesPersonName)
    {
        SalesPersonId = salesPersonId;
        SalesPersonName = salesPersonName;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetOpportunity(Guid? opportunityId)
    {
        OpportunityId = opportunityId;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetAddresses(string? shippingAddress, string? billingAddress)
    {
        ShippingAddress = shippingAddress;
        BillingAddress = billingAddress;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetTerms(string? paymentTerms, string? deliveryTerms, string? termsAndConditions)
    {
        PaymentTerms = paymentTerms;
        DeliveryTerms = deliveryTerms;
        TermsAndConditions = termsAndConditions;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetNotes(string? notes, string? internalNotes)
    {
        Notes = notes;
        InternalNotes = internalNotes;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetName(string? name)
    {
        Name = name;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetValidityDays(int validityDays)
    {
        if (validityDays <= 0)
            return Result.Failure(Error.Validation("Quotation.ValidityDays", "Validity days must be greater than 0"));

        ValidityDays = validityDays;
        ExpirationDate = QuotationDate.AddDays(validityDays);
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetShippingAmount(decimal shippingAmount)
    {
        if (shippingAmount < 0)
            return Result.Failure(Error.Validation("Quotation.ShippingAmount", "Shipping amount cannot be negative"));

        ShippingAmount = shippingAmount;
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result ApplyDiscount(decimal discountAmount, decimal discountRate)
    {
        if (discountAmount < 0)
            return Result.Failure(Error.Validation("Quotation.DiscountAmount", "Discount amount cannot be negative"));

        if (discountRate < 0 || discountRate > 100)
            return Result.Failure(Error.Validation("Quotation.DiscountRate", "Discount rate must be between 0 and 100"));

        DiscountAmount = discountAmount;
        DiscountRate = discountRate;
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SubmitForApproval()
    {
        if (Status != QuotationStatus.Draft)
            return Result.Failure(Error.Conflict("Quotation.Status", "Only draft quotations can be submitted for approval"));

        if (!_items.Any())
            return Result.Failure(Error.Validation("Quotation.Items", "Cannot submit a quotation without items"));

        Status = QuotationStatus.PendingApproval;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Approve(Guid userId)
    {
        if (Status != QuotationStatus.PendingApproval && Status != QuotationStatus.Draft)
            return Result.Failure(Error.Conflict("Quotation.Status", "Quotation is not pending approval"));

        if (!_items.Any())
            return Result.Failure(Error.Validation("Quotation.Items", "Cannot approve a quotation without items"));

        ApprovedBy = userId;
        ApprovedDate = DateTime.UtcNow;
        Status = QuotationStatus.Approved;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Send()
    {
        if (Status != QuotationStatus.Approved && Status != QuotationStatus.Draft)
            return Result.Failure(Error.Conflict("Quotation.Status", "Quotation must be approved or in draft to send"));

        if (!_items.Any())
            return Result.Failure(Error.Validation("Quotation.Items", "Cannot send a quotation without items"));

        Status = QuotationStatus.Sent;
        SentDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Accept()
    {
        if (Status != QuotationStatus.Sent)
            return Result.Failure(Error.Conflict("Quotation.Status", "Only sent quotations can be accepted"));

        if (ExpirationDate.HasValue && ExpirationDate.Value < DateTime.UtcNow)
            return Result.Failure(Error.Conflict("Quotation.ExpirationDate", "Quotation has expired"));

        Status = QuotationStatus.Accepted;
        AcceptedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Reject(string reason)
    {
        if (Status != QuotationStatus.Sent && Status != QuotationStatus.PendingApproval)
            return Result.Failure(Error.Conflict("Quotation.Status", "Only sent or pending quotations can be rejected"));

        if (string.IsNullOrWhiteSpace(reason))
            return Result.Failure(Error.Validation("Quotation.RejectionReason", "Rejection reason is required"));

        Status = QuotationStatus.Rejected;
        RejectedDate = DateTime.UtcNow;
        RejectionReason = reason;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Expire()
    {
        if (Status == QuotationStatus.Accepted || Status == QuotationStatus.Converted || Status == QuotationStatus.Cancelled)
            return Result.Failure(Error.Conflict("Quotation.Status", "Cannot expire this quotation"));

        Status = QuotationStatus.Expired;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Cancel(string reason)
    {
        if (Status == QuotationStatus.Converted || Status == QuotationStatus.Cancelled)
            return Result.Failure(Error.Conflict("Quotation.Status", "Cannot cancel this quotation"));

        Status = QuotationStatus.Cancelled;
        Notes = string.IsNullOrEmpty(Notes) ? $"Cancelled: {reason}" : $"{Notes}\nCancelled: {reason}";
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result ConvertToOrder(Guid orderId)
    {
        if (Status != QuotationStatus.Accepted)
            return Result.Failure(Error.Conflict("Quotation.Status", "Only accepted quotations can be converted to orders"));

        ConvertedToOrderId = orderId;
        ConvertedDate = DateTime.UtcNow;
        Status = QuotationStatus.Converted;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result<Quotation> CreateRevision(Guid tenantId)
    {
        if (Status == QuotationStatus.Converted)
            return Result<Quotation>.Failure(Error.Conflict("Quotation.Status", "Cannot create revision from converted quotation"));

        var newQuotationNumber = $"{QuotationNumber}-R{RevisionNumber + 1}";
        var revision = new Quotation
        {
            Id = Guid.NewGuid(),
            QuotationNumber = newQuotationNumber,
            Name = Name,
            QuotationDate = DateTime.UtcNow,
            CustomerId = CustomerId,
            CustomerName = CustomerName,
            CustomerEmail = CustomerEmail,
            CustomerPhone = CustomerPhone,
            CustomerTaxNumber = CustomerTaxNumber,
            ContactId = ContactId,
            ContactName = ContactName,
            OpportunityId = OpportunityId,
            SalesPersonId = SalesPersonId,
            SalesPersonName = SalesPersonName,
            Currency = Currency,
            ExchangeRate = ExchangeRate,
            ValidityDays = ValidityDays,
            ExpirationDate = DateTime.UtcNow.AddDays(ValidityDays),
            ShippingAddress = ShippingAddress,
            BillingAddress = BillingAddress,
            PaymentTerms = PaymentTerms,
            DeliveryTerms = DeliveryTerms,
            TermsAndConditions = TermsAndConditions,
            Notes = Notes,
            Status = QuotationStatus.Draft,
            RevisionNumber = RevisionNumber + 1,
            ParentQuotationId = Id,
            CreatedAt = DateTime.UtcNow
        };

        revision.SetTenantId(tenantId);

        // Copy items
        foreach (var item in _items)
        {
            var newItem = QuotationItem.Create(
                tenantId,
                item.ProductId,
                item.ProductName,
                item.ProductCode,
                item.Quantity,
                item.UnitPrice,
                item.VatRate,
                item.DiscountRate,
                item.DiscountAmount,
                item.Description,
                item.Unit
            );

            if (newItem.IsSuccess)
                revision._items.Add(newItem.Value);
        }

        revision.ShippingAmount = ShippingAmount;
        revision.DiscountAmount = DiscountAmount;
        revision.DiscountRate = DiscountRate;
        revision.RecalculateTotals();

        return Result<Quotation>.Success(revision);
    }

    private void RecalculateTotals()
    {
        SubTotal = _items.Sum(i => i.LineTotal);
        VatAmount = _items.Sum(i => i.VatAmount);

        var totalDiscount = DiscountAmount;
        if (DiscountRate > 0)
        {
            totalDiscount += SubTotal * DiscountRate / 100;
        }

        TotalAmount = SubTotal + VatAmount + ShippingAmount - totalDiscount;
    }
}

public enum QuotationStatus
{
    Draft = 0,
    PendingApproval = 1,
    Approved = 2,
    Sent = 3,
    Accepted = 4,
    Rejected = 5,
    Expired = 6,
    Converted = 7,
    Cancelled = 8
}
