using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a sales return/refund request
/// </summary>
public class SalesReturn : TenantAggregateRoot
{
    private readonly List<SalesReturnItem> _items = new();

    public string ReturnNumber { get; private set; } = string.Empty;
    public DateTime ReturnDate { get; private set; }
    public Guid SalesOrderId { get; private set; }
    public string SalesOrderNumber { get; private set; } = string.Empty;
    public Guid? InvoiceId { get; private set; }
    public string? InvoiceNumber { get; private set; }
    public Guid? CustomerId { get; private set; }
    public string? CustomerName { get; private set; }
    public string? CustomerEmail { get; private set; }
    public SalesReturnType Type { get; private set; }
    public SalesReturnReason Reason { get; private set; }
    public string? ReasonDetails { get; private set; }
    public SalesReturnStatus Status { get; private set; }
    public decimal SubTotal { get; private set; }
    public decimal VatAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public decimal RefundAmount { get; private set; }
    public RefundMethod RefundMethod { get; private set; }
    public string? RefundReference { get; private set; }
    public DateTime? RefundDate { get; private set; }
    public bool RestockItems { get; private set; }
    public Guid? RestockWarehouseId { get; private set; }
    public bool IsRestocked { get; private set; }
    public DateTime? RestockedDate { get; private set; }
    public Guid? ProcessedBy { get; private set; }
    public DateTime? ProcessedDate { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public string? Notes { get; private set; }
    public string? InternalNotes { get; private set; }
    public Guid? CreditNoteId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public IReadOnlyList<SalesReturnItem> Items => _items.AsReadOnly();

    private SalesReturn() : base() { }

    public static Result<SalesReturn> Create(
        Guid tenantId,
        string returnNumber,
        Guid salesOrderId,
        string salesOrderNumber,
        SalesReturnType type,
        SalesReturnReason reason,
        Guid? customerId = null,
        string? customerName = null,
        Guid? invoiceId = null,
        string? invoiceNumber = null,
        string? reasonDetails = null)
    {
        if (string.IsNullOrWhiteSpace(returnNumber))
            return Result<SalesReturn>.Failure(Error.Validation("SalesReturn.ReturnNumber", "Return number is required"));

        if (salesOrderId == Guid.Empty)
            return Result<SalesReturn>.Failure(Error.Validation("SalesReturn.SalesOrderId", "Sales order is required"));

        var salesReturn = new SalesReturn
        {
            Id = Guid.NewGuid(),
            ReturnNumber = returnNumber,
            ReturnDate = DateTime.UtcNow,
            SalesOrderId = salesOrderId,
            SalesOrderNumber = salesOrderNumber,
            InvoiceId = invoiceId,
            InvoiceNumber = invoiceNumber,
            CustomerId = customerId,
            CustomerName = customerName,
            Type = type,
            Reason = reason,
            ReasonDetails = reasonDetails,
            Status = SalesReturnStatus.Pending,
            SubTotal = 0,
            VatAmount = 0,
            TotalAmount = 0,
            RefundAmount = 0,
            RefundMethod = RefundMethod.Original,
            RestockItems = true,
            IsRestocked = false,
            CreatedAt = DateTime.UtcNow
        };

        salesReturn.SetTenantId(tenantId);

        return Result<SalesReturn>.Success(salesReturn);
    }

    public static string GenerateReturnNumber()
    {
        return $"RET-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
    }

    public Result AddItem(SalesReturnItem item)
    {
        if (item == null)
            return Result.Failure(Error.Validation("SalesReturn.Item", "Item cannot be null"));

        if (Status != SalesReturnStatus.Pending)
            return Result.Failure(Error.Conflict("SalesReturn.Status", "Cannot add items to a non-pending return"));

        _items.Add(item);
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result RemoveItem(Guid itemId)
    {
        if (Status != SalesReturnStatus.Pending)
            return Result.Failure(Error.Conflict("SalesReturn.Status", "Cannot remove items from a non-pending return"));

        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            return Result.Failure(Error.NotFound("SalesReturn.Item", "Item not found"));

        _items.Remove(item);
        RecalculateTotals();
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

    public Result SetRestockOptions(bool restockItems, Guid? restockWarehouseId)
    {
        RestockItems = restockItems;
        RestockWarehouseId = restockWarehouseId;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetRefundMethod(RefundMethod refundMethod)
    {
        RefundMethod = refundMethod;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Submit()
    {
        if (Status != SalesReturnStatus.Pending)
            return Result.Failure(Error.Conflict("SalesReturn.Status", "Only pending returns can be submitted"));

        if (!_items.Any())
            return Result.Failure(Error.Validation("SalesReturn.Items", "Cannot submit a return without items"));

        Status = SalesReturnStatus.Submitted;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Approve(Guid userId)
    {
        if (Status != SalesReturnStatus.Submitted)
            return Result.Failure(Error.Conflict("SalesReturn.Status", "Only submitted returns can be approved"));

        Status = SalesReturnStatus.Approved;
        ApprovedBy = userId;
        ApprovedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Reject(Guid userId, string reason)
    {
        if (Status != SalesReturnStatus.Submitted)
            return Result.Failure(Error.Conflict("SalesReturn.Status", "Only submitted returns can be rejected"));

        if (string.IsNullOrWhiteSpace(reason))
            return Result.Failure(Error.Validation("SalesReturn.RejectReason", "Rejection reason is required"));

        Status = SalesReturnStatus.Rejected;
        ProcessedBy = userId;
        ProcessedDate = DateTime.UtcNow;
        InternalNotes = string.IsNullOrEmpty(InternalNotes) ? $"Rejected: {reason}" : $"{InternalNotes}\nRejected: {reason}";
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Receive(Guid userId)
    {
        if (Status != SalesReturnStatus.Approved)
            return Result.Failure(Error.Conflict("SalesReturn.Status", "Only approved returns can be received"));

        Status = SalesReturnStatus.Received;
        ProcessedBy = userId;
        ProcessedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result MarkAsRestocked()
    {
        if (!RestockItems)
            return Result.Failure(Error.Conflict("SalesReturn.Restock", "This return is not marked for restocking"));

        IsRestocked = true;
        RestockedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result ProcessRefund(string refundReference, decimal? overrideAmount = null)
    {
        if (Status != SalesReturnStatus.Received && Status != SalesReturnStatus.Approved)
            return Result.Failure(Error.Conflict("SalesReturn.Status", "Return must be approved or received to process refund"));

        RefundAmount = overrideAmount ?? TotalAmount;
        RefundReference = refundReference;
        RefundDate = DateTime.UtcNow;
        Status = SalesReturnStatus.Refunded;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetCreditNote(Guid creditNoteId)
    {
        CreditNoteId = creditNoteId;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Complete()
    {
        if (Status != SalesReturnStatus.Refunded)
            return Result.Failure(Error.Conflict("SalesReturn.Status", "Only refunded returns can be completed"));

        Status = SalesReturnStatus.Completed;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Cancel(string reason)
    {
        if (Status == SalesReturnStatus.Refunded || Status == SalesReturnStatus.Completed)
            return Result.Failure(Error.Conflict("SalesReturn.Status", "Cannot cancel refunded or completed returns"));

        Status = SalesReturnStatus.Cancelled;
        Notes = string.IsNullOrEmpty(Notes) ? $"Cancelled: {reason}" : $"{Notes}\nCancelled: {reason}";
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    private void RecalculateTotals()
    {
        SubTotal = _items.Sum(i => i.LineTotal - i.VatAmount);
        VatAmount = _items.Sum(i => i.VatAmount);
        TotalAmount = SubTotal + VatAmount;
        RefundAmount = TotalAmount;
    }
}

public class SalesReturnItem : TenantEntity
{
    public Guid SalesReturnId { get; private set; }
    public Guid SalesOrderItemId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public string? ProductCode { get; private set; }
    public decimal QuantityOrdered { get; private set; }
    public decimal QuantityReturned { get; private set; }
    public string Unit { get; private set; } = "Adet";
    public decimal UnitPrice { get; private set; }
    public decimal VatRate { get; private set; }
    public decimal VatAmount { get; private set; }
    public decimal LineTotal { get; private set; }
    public SalesReturnItemCondition Condition { get; private set; }
    public string? ConditionNotes { get; private set; }
    public bool IsRestockable { get; private set; }
    public bool IsRestocked { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private SalesReturnItem() : base() { }

    public static Result<SalesReturnItem> Create(
        Guid tenantId,
        Guid salesOrderItemId,
        Guid productId,
        string productName,
        string? productCode,
        decimal quantityOrdered,
        decimal quantityReturned,
        decimal unitPrice,
        decimal vatRate,
        SalesReturnItemCondition condition = SalesReturnItemCondition.Good,
        string? conditionNotes = null,
        string unit = "Adet")
    {
        if (productId == Guid.Empty)
            return Result<SalesReturnItem>.Failure(Error.Validation("SalesReturnItem.ProductId", "Product is required"));

        if (quantityReturned <= 0)
            return Result<SalesReturnItem>.Failure(Error.Validation("SalesReturnItem.QuantityReturned", "Return quantity must be greater than 0"));

        if (quantityReturned > quantityOrdered)
            return Result<SalesReturnItem>.Failure(Error.Validation("SalesReturnItem.QuantityReturned", "Return quantity cannot exceed ordered quantity"));

        var item = new SalesReturnItem
        {
            Id = Guid.NewGuid(),
            SalesOrderItemId = salesOrderItemId,
            ProductId = productId,
            ProductName = productName,
            ProductCode = productCode,
            QuantityOrdered = quantityOrdered,
            QuantityReturned = quantityReturned,
            Unit = unit,
            UnitPrice = unitPrice,
            VatRate = vatRate,
            Condition = condition,
            ConditionNotes = conditionNotes,
            IsRestockable = condition == SalesReturnItemCondition.Good || condition == SalesReturnItemCondition.Opened,
            IsRestocked = false,
            CreatedAt = DateTime.UtcNow
        };

        item.SetTenantId(tenantId);
        item.CalculateTotals();

        return Result<SalesReturnItem>.Success(item);
    }

    public void SetSalesReturnId(Guid salesReturnId)
    {
        SalesReturnId = salesReturnId;
    }

    public Result UpdateCondition(SalesReturnItemCondition condition, string? conditionNotes)
    {
        Condition = condition;
        ConditionNotes = conditionNotes;
        IsRestockable = condition == SalesReturnItemCondition.Good || condition == SalesReturnItemCondition.Opened;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result MarkAsRestocked()
    {
        if (!IsRestockable)
            return Result.Failure(Error.Conflict("SalesReturnItem.Restockable", "This item is not restockable"));

        IsRestocked = true;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    private void CalculateTotals()
    {
        var netTotal = QuantityReturned * UnitPrice;
        VatAmount = netTotal * VatRate / 100;
        LineTotal = netTotal + VatAmount;
    }
}

public enum SalesReturnType
{
    FullReturn = 0,
    PartialReturn = 1,
    Exchange = 2
}

public enum SalesReturnReason
{
    Defective = 0,
    WrongItem = 1,
    NotAsDescribed = 2,
    DamagedInTransit = 3,
    ChangedMind = 4,
    BetterPriceFound = 5,
    NoLongerNeeded = 6,
    IncorrectQuantity = 7,
    LateDelivery = 8,
    Other = 99
}

public enum SalesReturnStatus
{
    Pending = 0,
    Submitted = 1,
    Approved = 2,
    Rejected = 3,
    Received = 4,
    Refunded = 5,
    Completed = 6,
    Cancelled = 7
}

public enum SalesReturnItemCondition
{
    Good = 0,
    Opened = 1,
    Damaged = 2,
    Defective = 3,
    Missing = 4
}

public enum RefundMethod
{
    Original = 0,
    StoreCredit = 1,
    BankTransfer = 2,
    Cash = 3,
    Check = 4
}
