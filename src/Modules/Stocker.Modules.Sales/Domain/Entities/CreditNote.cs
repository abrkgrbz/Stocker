using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a credit note (alacak dekontu) issued to reduce customer debt.
/// Used for returns, discounts, corrections, and adjustments.
/// Links to original Invoice and optionally to SalesReturn.
/// </summary>
public class CreditNote : TenantAggregateRoot
{
    private readonly List<CreditNoteItem> _items = new();

    #region Properties

    public string CreditNoteNumber { get; private set; } = string.Empty;
    public DateTime CreditNoteDate { get; private set; }
    public CreditNoteType Type { get; private set; }
    public CreditNoteReason Reason { get; private set; }
    public string? ReasonDescription { get; private set; }

    // Source Documents
    public Guid InvoiceId { get; private set; }
    public string InvoiceNumber { get; private set; } = string.Empty;
    public Guid? SalesReturnId { get; private set; }
    public string? SalesReturnNumber { get; private set; }
    public Guid? SalesOrderId { get; private set; }
    public string? SalesOrderNumber { get; private set; }

    // Customer
    public Guid? CustomerId { get; private set; }
    public string CustomerName { get; private set; } = string.Empty;
    public string? CustomerTaxNumber { get; private set; }
    public string? CustomerAddress { get; private set; }

    // Amounts
    public decimal SubTotal { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public decimal ExchangeRate { get; private set; } = 1;

    // Application
    public decimal AppliedAmount { get; private set; }
    public decimal RemainingAmount => TotalAmount - AppliedAmount;
    public bool IsFullyApplied => AppliedAmount >= TotalAmount;

    // Status
    public CreditNoteStatus Status { get; private set; }
    public bool IsApproved { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public bool IsVoided { get; private set; }
    public string? VoidReason { get; private set; }
    public DateTime? VoidedDate { get; private set; }

    // e-Document (e-Fatura entegrasyonu)
    public bool IsEDocument { get; private set; }
    public string? EDocumentId { get; private set; }
    public DateTime? EDocumentDate { get; private set; }

    // Metadata
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public IReadOnlyCollection<CreditNoteItem> Items => _items.AsReadOnly();

    #endregion

    #region Constructors

    private CreditNote() { }

    private CreditNote(
        Guid tenantId,
        string creditNoteNumber,
        DateTime creditNoteDate,
        CreditNoteType type,
        CreditNoteReason reason,
        Guid invoiceId,
        string invoiceNumber,
        string currency) : base(Guid.NewGuid(), tenantId)
    {
        CreditNoteNumber = creditNoteNumber;
        CreditNoteDate = creditNoteDate;
        Type = type;
        Reason = reason;
        InvoiceId = invoiceId;
        InvoiceNumber = invoiceNumber;
        Currency = currency;
        Status = CreditNoteStatus.Draft;
        CreatedAt = DateTime.UtcNow;
    }

    #endregion

    #region Factory Methods

    public static Result<CreditNote> Create(
        Guid tenantId,
        string creditNoteNumber,
        DateTime creditNoteDate,
        CreditNoteType type,
        CreditNoteReason reason,
        Guid invoiceId,
        string invoiceNumber,
        string currency = "TRY")
    {
        if (string.IsNullOrWhiteSpace(creditNoteNumber))
            return Result<CreditNote>.Failure(Error.Validation("CreditNote.NumberRequired", "Credit note number is required"));

        if (string.IsNullOrWhiteSpace(invoiceNumber))
            return Result<CreditNote>.Failure(Error.Validation("CreditNote.InvoiceRequired", "Invoice number is required"));

        return Result<CreditNote>.Success(
            new CreditNote(tenantId, creditNoteNumber, creditNoteDate, type, reason, invoiceId, invoiceNumber, currency));
    }

    public static Result<CreditNote> CreateForReturn(
        Guid tenantId,
        string creditNoteNumber,
        DateTime creditNoteDate,
        Guid invoiceId,
        string invoiceNumber,
        Guid salesReturnId,
        string salesReturnNumber,
        string currency = "TRY")
    {
        var result = Create(tenantId, creditNoteNumber, creditNoteDate, CreditNoteType.Return, CreditNoteReason.ProductReturn, invoiceId, invoiceNumber, currency);
        if (!result.IsSuccess) return result;

        var creditNote = result.Value;
        creditNote.SalesReturnId = salesReturnId;
        creditNote.SalesReturnNumber = salesReturnNumber;

        return Result<CreditNote>.Success(creditNote);
    }

    #endregion

    #region Customer

    public Result SetCustomer(Guid? customerId, string customerName, string? taxNumber, string? address)
    {
        if (string.IsNullOrWhiteSpace(customerName))
            return Result.Failure(Error.Validation("CreditNote.CustomerNameRequired", "Customer name is required"));

        CustomerId = customerId;
        CustomerName = customerName;
        CustomerTaxNumber = taxNumber;
        CustomerAddress = address;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Items Management

    public Result AddItem(CreditNoteItem item)
    {
        if (Status != CreditNoteStatus.Draft)
            return Result.Failure(Error.Validation("CreditNote.NotDraft", "Can only add items to draft credit notes"));

        _items.Add(item);
        RecalculateTotals();

        return Result.Success();
    }

    public Result RemoveItem(Guid itemId)
    {
        if (Status != CreditNoteStatus.Draft)
            return Result.Failure(Error.Validation("CreditNote.NotDraft", "Can only remove items from draft credit notes"));

        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            return Result.Failure(Error.NotFound("CreditNote.ItemNotFound", "Item not found"));

        _items.Remove(item);
        RecalculateTotals();

        return Result.Success();
    }

    private void RecalculateTotals()
    {
        SubTotal = _items.Sum(i => i.LineTotal);
        TaxAmount = _items.Sum(i => i.TaxAmount);
        TotalAmount = SubTotal + TaxAmount - DiscountAmount;
        UpdatedAt = DateTime.UtcNow;
    }

    public Result SetDiscount(decimal discountAmount)
    {
        if (discountAmount < 0)
            return Result.Failure(Error.Validation("CreditNote.InvalidDiscount", "Discount cannot be negative"));

        DiscountAmount = discountAmount;
        RecalculateTotals();

        return Result.Success();
    }

    #endregion

    #region Validation & Approval

    public Result ValidateAgainstInvoice(decimal invoiceRemainingBalance)
    {
        if (TotalAmount > invoiceRemainingBalance)
            return Result.Failure(Error.Validation("CreditNote.ExceedsBalance",
                $"Credit note amount ({TotalAmount}) exceeds invoice remaining balance ({invoiceRemainingBalance})"));

        return Result.Success();
    }

    public Result Submit()
    {
        if (Status != CreditNoteStatus.Draft)
            return Result.Failure(Error.Validation("CreditNote.NotDraft", "Can only submit draft credit notes"));

        if (!_items.Any())
            return Result.Failure(Error.Validation("CreditNote.NoItems", "Credit note must have at least one item"));

        if (TotalAmount <= 0)
            return Result.Failure(Error.Validation("CreditNote.InvalidAmount", "Total amount must be greater than zero"));

        Status = CreditNoteStatus.PendingApproval;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Approve(Guid approvedBy)
    {
        if (Status != CreditNoteStatus.PendingApproval)
            return Result.Failure(Error.Validation("CreditNote.NotPending", "Can only approve pending credit notes"));

        IsApproved = true;
        ApprovedBy = approvedBy;
        ApprovedDate = DateTime.UtcNow;
        Status = CreditNoteStatus.Approved;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Reject(string reason)
    {
        if (Status != CreditNoteStatus.PendingApproval)
            return Result.Failure(Error.Validation("CreditNote.NotPending", "Can only reject pending credit notes"));

        Status = CreditNoteStatus.Rejected;
        Notes = $"{Notes}\nRejection reason: {reason}".Trim();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Issue()
    {
        if (Status != CreditNoteStatus.Approved)
            return Result.Failure(Error.Validation("CreditNote.NotApproved", "Can only issue approved credit notes"));

        Status = CreditNoteStatus.Issued;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Application

    public Result Apply(decimal amount, Guid? targetInvoiceId = null, string? reference = null)
    {
        if (Status != CreditNoteStatus.Issued)
            return Result.Failure(Error.Validation("CreditNote.NotIssued", "Can only apply issued credit notes"));

        if (amount <= 0 || amount > RemainingAmount)
            return Result.Failure(Error.Validation("CreditNote.InvalidAmount", "Invalid amount to apply"));

        AppliedAmount += amount;

        if (IsFullyApplied)
            Status = CreditNoteStatus.FullyApplied;
        else
            Status = CreditNoteStatus.PartiallyApplied;

        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Void

    public Result Void(string reason)
    {
        if (IsVoided)
            return Result.Failure(Error.Validation("CreditNote.AlreadyVoided", "Credit note is already voided"));

        if (AppliedAmount > 0)
            return Result.Failure(Error.Validation("CreditNote.HasApplications", "Cannot void credit note with applications"));

        IsVoided = true;
        VoidReason = reason;
        VoidedDate = DateTime.UtcNow;
        Status = CreditNoteStatus.Voided;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region e-Document

    public Result SetEDocument(string eDocumentId, DateTime eDocumentDate)
    {
        IsEDocument = true;
        EDocumentId = eDocumentId;
        EDocumentDate = eDocumentDate;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Metadata

    public Result SetReasonDescription(string? description)
    {
        ReasonDescription = description;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetSalesOrder(Guid salesOrderId, string salesOrderNumber)
    {
        SalesOrderId = salesOrderId;
        SalesOrderNumber = salesOrderNumber;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetExchangeRate(decimal exchangeRate)
    {
        if (exchangeRate <= 0)
            return Result.Failure(Error.Validation("CreditNote.InvalidExchangeRate", "Exchange rate must be positive"));

        ExchangeRate = exchangeRate;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion
}

/// <summary>
/// Line item for a credit note
/// </summary>
public class CreditNoteItem : TenantEntity
{
    public Guid CreditNoteId { get; private set; }
    public int LineNumber { get; private set; }

    // Product
    public Guid? ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    // Original Invoice Item Reference
    public Guid? InvoiceItemId { get; private set; }

    // Quantity & Price
    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = "Adet";
    public decimal UnitPrice { get; private set; }
    public decimal DiscountRate { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal TaxRate { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal LineTotal { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private CreditNoteItem() { }

    private CreditNoteItem(
        Guid tenantId,
        Guid creditNoteId,
        int lineNumber,
        Guid? productId,
        string productCode,
        string productName,
        decimal quantity,
        string unit,
        decimal unitPrice,
        decimal taxRate) : base(Guid.NewGuid(), tenantId)
    {
        CreditNoteId = creditNoteId;
        LineNumber = lineNumber;
        ProductId = productId;
        ProductCode = productCode;
        ProductName = productName;
        Quantity = quantity;
        Unit = unit;
        UnitPrice = unitPrice;
        TaxRate = taxRate;
        CreatedAt = DateTime.UtcNow;

        CalculateTotals();
    }

    public static Result<CreditNoteItem> Create(
        Guid tenantId,
        Guid creditNoteId,
        int lineNumber,
        Guid? productId,
        string productCode,
        string productName,
        decimal quantity,
        string unit,
        decimal unitPrice,
        decimal taxRate)
    {
        if (quantity <= 0)
            return Result<CreditNoteItem>.Failure(Error.Validation("CreditNoteItem.InvalidQuantity", "Quantity must be greater than zero"));

        if (unitPrice < 0)
            return Result<CreditNoteItem>.Failure(Error.Validation("CreditNoteItem.InvalidPrice", "Unit price cannot be negative"));

        return Result<CreditNoteItem>.Success(
            new CreditNoteItem(tenantId, creditNoteId, lineNumber, productId, productCode, productName, quantity, unit, unitPrice, taxRate));
    }

    public Result ApplyDiscount(decimal discountRate)
    {
        if (discountRate < 0 || discountRate > 100)
            return Result.Failure(Error.Validation("CreditNoteItem.InvalidDiscount", "Discount rate must be between 0 and 100"));

        DiscountRate = discountRate;
        CalculateTotals();
        return Result.Success();
    }

    public Result SetInvoiceItemReference(Guid invoiceItemId)
    {
        InvoiceItemId = invoiceItemId;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetDescription(string? description)
    {
        Description = description;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    private void CalculateTotals()
    {
        var subtotal = Quantity * UnitPrice;
        DiscountAmount = subtotal * (DiscountRate / 100);
        var taxableAmount = subtotal - DiscountAmount;
        TaxAmount = taxableAmount * (TaxRate / 100);
        LineTotal = taxableAmount + TaxAmount;
        UpdatedAt = DateTime.UtcNow;
    }
}

#region Enums

public enum CreditNoteType
{
    Return = 0,         // Product return
    Discount = 1,       // Post-sale discount
    Correction = 2,     // Invoice correction
    Adjustment = 3,     // Price adjustment
    Cancellation = 4    // Full invoice cancellation
}

public enum CreditNoteReason
{
    ProductReturn = 0,
    DefectiveProduct = 1,
    WrongProduct = 2,
    PriceError = 3,
    QuantityError = 4,
    DuplicateInvoice = 5,
    CustomerRequest = 6,
    ContractAdjustment = 7,
    VolumeDiscount = 8,
    PromotionalCredit = 9,
    Other = 99
}

public enum CreditNoteStatus
{
    Draft = 0,
    PendingApproval = 1,
    Approved = 2,
    Rejected = 3,
    Issued = 4,
    PartiallyApplied = 5,
    FullyApplied = 6,
    Voided = 7
}

#endregion
