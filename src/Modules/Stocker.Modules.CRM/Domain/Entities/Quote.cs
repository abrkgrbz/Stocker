using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Represents a quote/proposal in the CRM system
/// </summary>
public class Quote : TenantAggregateRoot
{
    private readonly List<QuoteLineItem> _lineItems = new();
    private readonly List<Note> _notes = new();

    /// <summary>
    /// Gets the quote number
    /// </summary>
    public string QuoteNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the quote name
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the quote status
    /// </summary>
    public QuoteStatus Status { get; private set; }

    /// <summary>
    /// Gets the account ID
    /// </summary>
    public Guid? AccountId { get; private set; }

    /// <summary>
    /// Gets the account
    /// </summary>
    public Account? Account { get; private set; }

    /// <summary>
    /// Gets the contact ID
    /// </summary>
    public Guid? ContactId { get; private set; }

    /// <summary>
    /// Gets the contact
    /// </summary>
    public Contact? Contact { get; private set; }

    /// <summary>
    /// Gets the opportunity ID
    /// </summary>
    public Guid? OpportunityId { get; private set; }

    /// <summary>
    /// Gets the opportunity
    /// </summary>
    public Opportunity? Opportunity { get; private set; }

    /// <summary>
    /// Gets the price list ID
    /// </summary>
    public Guid? PriceListId { get; private set; }

    /// <summary>
    /// Gets the owner user ID
    /// </summary>
    public Guid OwnerId { get; private set; }

    /// <summary>
    /// Gets the quote date
    /// </summary>
    public DateTime QuoteDate { get; private set; }

    /// <summary>
    /// Gets the expiration date
    /// </summary>
    public DateTime? ExpirationDate { get; private set; }

    /// <summary>
    /// Gets the subtotal amount
    /// </summary>
    public decimal SubTotal { get; private set; }

    /// <summary>
    /// Gets the discount amount
    /// </summary>
    public decimal DiscountAmount { get; private set; }

    /// <summary>
    /// Gets the discount percentage
    /// </summary>
    public decimal DiscountPercentage { get; private set; }

    /// <summary>
    /// Gets the tax amount
    /// </summary>
    public decimal TaxAmount { get; private set; }

    /// <summary>
    /// Gets the tax percentage
    /// </summary>
    public decimal TaxPercentage { get; private set; }

    /// <summary>
    /// Gets the shipping amount
    /// </summary>
    public decimal ShippingAmount { get; private set; }

    /// <summary>
    /// Gets the total amount
    /// </summary>
    public decimal TotalAmount { get; private set; }

    /// <summary>
    /// Gets the currency code
    /// </summary>
    public string CurrencyCode { get; private set; } = "TRY";

    /// <summary>
    /// Gets the payment terms
    /// </summary>
    public string? PaymentTerms { get; private set; }

    /// <summary>
    /// Gets the delivery terms
    /// </summary>
    public string? DeliveryTerms { get; private set; }

    /// <summary>
    /// Gets the billing address
    /// </summary>
    public Address? BillingAddress { get; private set; }

    /// <summary>
    /// Gets the shipping address
    /// </summary>
    public Address? ShippingAddress { get; private set; }

    /// <summary>
    /// Gets the description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Gets the terms and conditions
    /// </summary>
    public string? TermsAndConditions { get; private set; }

    /// <summary>
    /// Gets the approval status
    /// </summary>
    public ApprovalStatus ApprovalStatus { get; private set; }

    /// <summary>
    /// Gets the approved by user ID
    /// </summary>
    public Guid? ApprovedById { get; private set; }

    /// <summary>
    /// Gets the approval date
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    /// <summary>
    /// Gets the sent date
    /// </summary>
    public DateTime? SentDate { get; private set; }

    /// <summary>
    /// Gets the accepted date
    /// </summary>
    public DateTime? AcceptedDate { get; private set; }

    /// <summary>
    /// Gets the rejected date
    /// </summary>
    public DateTime? RejectedDate { get; private set; }

    /// <summary>
    /// Gets the rejection reason
    /// </summary>
    public string? RejectionReason { get; private set; }

    /// <summary>
    /// Gets the line items
    /// </summary>
    public IReadOnlyList<QuoteLineItem> LineItems => _lineItems.AsReadOnly();

    /// <summary>
    /// Gets the notes
    /// </summary>
    public IReadOnlyList<Note> Notes => _notes.AsReadOnly();

    /// <summary>
    /// Gets the created date
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Gets the last modified date
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    /// <summary>
    /// Private constructor for EF Core
    /// </summary>
    private Quote() : base()
    {
    }

    /// <summary>
    /// Creates a new quote
    /// </summary>
    public static Result<Quote> Create(
        Guid tenantId,
        string name,
        Guid ownerId,
        Guid? accountId = null,
        Guid? contactId = null,
        Guid? opportunityId = null,
        DateTime? expirationDate = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result<Quote>.Failure(Error.Validation("Quote.Name", "Quote name is required"));

        if (ownerId == Guid.Empty)
            return Result<Quote>.Failure(Error.Validation("Quote.OwnerId", "Owner is required"));

        if (expirationDate.HasValue && expirationDate.Value < DateTime.UtcNow.Date)
            return Result<Quote>.Failure(Error.Validation("Quote.ExpirationDate", "Expiration date cannot be in the past"));

        var quote = new Quote
        {
            Id = Guid.NewGuid(),
            QuoteNumber = GenerateQuoteNumber(),
            Name = name,
            Status = QuoteStatus.Draft,
            OwnerId = ownerId,
            AccountId = accountId,
            ContactId = contactId,
            OpportunityId = opportunityId,
            QuoteDate = DateTime.UtcNow.Date,
            ExpirationDate = expirationDate ?? DateTime.UtcNow.Date.AddDays(30),
            SubTotal = 0,
            DiscountAmount = 0,
            DiscountPercentage = 0,
            TaxAmount = 0,
            TaxPercentage = 18, // Default KDV
            ShippingAmount = 0,
            TotalAmount = 0,
            CurrencyCode = "TRY",
            ApprovalStatus = ApprovalStatus.NotSubmitted,
            CreatedAt = DateTime.UtcNow
        };

        quote.SetTenantId(tenantId);

        return Result<Quote>.Success(quote);
    }

    /// <summary>
    /// Adds a line item
    /// </summary>
    public Result AddLineItem(
        Guid productId,
        string productName,
        decimal quantity,
        decimal unitPrice,
        decimal? discount = null,
        string? description = null)
    {
        if (Status != QuoteStatus.Draft)
            return Result.Failure(Error.Conflict("Quote.Status", "Can only add items to draft quotes"));

        if (quantity <= 0)
            return Result.Failure(Error.Validation("Quote.LineItem", "Quantity must be greater than zero"));

        if (unitPrice < 0)
            return Result.Failure(Error.Validation("Quote.LineItem", "Unit price cannot be negative"));

        var lineItem = QuoteLineItem.Create(
            productId,
            productName,
            quantity,
            unitPrice,
            discount ?? 0,
            description);

        _lineItems.Add(lineItem);
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Removes a line item
    /// </summary>
    public Result RemoveLineItem(Guid lineItemId)
    {
        if (Status != QuoteStatus.Draft)
            return Result.Failure(Error.Conflict("Quote.Status", "Can only remove items from draft quotes"));

        var lineItem = _lineItems.FirstOrDefault(li => li.Id == lineItemId);
        if (lineItem == null)
            return Result.Failure(Error.NotFound("Quote.LineItem", "Line item not found"));

        _lineItems.Remove(lineItem);
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates discount
    /// </summary>
    public Result UpdateDiscount(decimal discountPercentage, decimal discountAmount)
    {
        if (Status != QuoteStatus.Draft)
            return Result.Failure(Error.Conflict("Quote.Status", "Can only update draft quotes"));

        if (discountPercentage < 0 || discountPercentage > 100)
            return Result.Failure(Error.Validation("Quote.DiscountPercentage", "Discount percentage must be between 0 and 100"));

        if (discountAmount < 0)
            return Result.Failure(Error.Validation("Quote.DiscountAmount", "Discount amount cannot be negative"));

        DiscountPercentage = discountPercentage;
        DiscountAmount = discountAmount;
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates tax
    /// </summary>
    public Result UpdateTax(decimal taxPercentage)
    {
        if (Status != QuoteStatus.Draft)
            return Result.Failure(Error.Conflict("Quote.Status", "Can only update draft quotes"));

        if (taxPercentage < 0 || taxPercentage > 100)
            return Result.Failure(Error.Validation("Quote.TaxPercentage", "Tax percentage must be between 0 and 100"));

        TaxPercentage = taxPercentage;
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates shipping
    /// </summary>
    public Result UpdateShipping(decimal shippingAmount)
    {
        if (Status != QuoteStatus.Draft)
            return Result.Failure(Error.Conflict("Quote.Status", "Can only update draft quotes"));

        if (shippingAmount < 0)
            return Result.Failure(Error.Validation("Quote.ShippingAmount", "Shipping amount cannot be negative"));

        ShippingAmount = shippingAmount;
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Sends the quote
    /// </summary>
    public Result Send()
    {
        if (Status != QuoteStatus.Draft && Status != QuoteStatus.InReview)
            return Result.Failure(Error.Conflict("Quote.Status", "Quote must be in draft or review status to send"));

        if (!_lineItems.Any())
            return Result.Failure(Error.Validation("Quote.LineItems", "Quote must have at least one line item"));

        Status = QuoteStatus.Sent;
        SentDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Accepts the quote
    /// </summary>
    public Result Accept()
    {
        if (Status != QuoteStatus.Sent)
            return Result.Failure(Error.Conflict("Quote.Status", "Only sent quotes can be accepted"));

        if (ExpirationDate.HasValue && ExpirationDate.Value < DateTime.UtcNow.Date)
            return Result.Failure(Error.Conflict("Quote.ExpirationDate", "Quote has expired"));

        Status = QuoteStatus.Accepted;
        AcceptedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Rejects the quote
    /// </summary>
    public Result Reject(string reason)
    {
        if (Status != QuoteStatus.Sent)
            return Result.Failure(Error.Conflict("Quote.Status", "Only sent quotes can be rejected"));

        if (string.IsNullOrWhiteSpace(reason))
            return Result.Failure(Error.Validation("Quote.RejectionReason", "Rejection reason is required"));

        Status = QuoteStatus.Rejected;
        RejectedDate = DateTime.UtcNow;
        RejectionReason = reason;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Submits for approval
    /// </summary>
    public Result SubmitForApproval()
    {
        if (Status != QuoteStatus.Draft)
            return Result.Failure(Error.Conflict("Quote.Status", "Only draft quotes can be submitted for approval"));

        if (!_lineItems.Any())
            return Result.Failure(Error.Validation("Quote.LineItems", "Quote must have at least one line item"));

        Status = QuoteStatus.InReview;
        ApprovalStatus = ApprovalStatus.Pending;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Approves the quote
    /// </summary>
    public Result Approve(Guid approvedById)
    {
        if (ApprovalStatus != ApprovalStatus.Pending)
            return Result.Failure(Error.Conflict("Quote.ApprovalStatus", "Quote is not pending approval"));

        ApprovalStatus = ApprovalStatus.Approved;
        ApprovedById = approvedById;
        ApprovalDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Recalculates totals
    /// </summary>
    private void RecalculateTotals()
    {
        SubTotal = _lineItems.Sum(li => li.TotalPrice);
        
        if (DiscountPercentage > 0)
            DiscountAmount = SubTotal * (DiscountPercentage / 100);
        
        var discountedTotal = SubTotal - DiscountAmount;
        TaxAmount = discountedTotal * (TaxPercentage / 100);
        TotalAmount = discountedTotal + TaxAmount + ShippingAmount;
    }

    /// <summary>
    /// Generates quote number
    /// </summary>
    private static string GenerateQuoteNumber()
    {
        return $"QT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
    }
}

/// <summary>
/// Represents a line item in a quote
/// </summary>
public class QuoteLineItem
{
    public Guid Id { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal Discount { get; private set; }
    public decimal TotalPrice { get; private set; }
    public int SortOrder { get; private set; }

    private QuoteLineItem() { }

    public static QuoteLineItem Create(
        Guid productId,
        string productName,
        decimal quantity,
        decimal unitPrice,
        decimal discount,
        string? description)
    {
        var lineItem = new QuoteLineItem
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            ProductName = productName,
            Description = description,
            Quantity = quantity,
            UnitPrice = unitPrice,
            Discount = discount
        };

        lineItem.TotalPrice = (quantity * unitPrice) - discount;

        return lineItem;
    }
}