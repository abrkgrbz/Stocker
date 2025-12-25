using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a back order for items that are ordered but not currently in stock.
/// Created when an order cannot be fully fulfilled due to inventory shortage.
/// Tracks pending quantities and expected restock dates.
/// </summary>
public class BackOrder : TenantAggregateRoot
{
    private readonly List<BackOrderItem> _items = new();

    #region Properties

    public string BackOrderNumber { get; private set; } = string.Empty;
    public DateTime BackOrderDate { get; private set; }
    public BackOrderType Type { get; private set; }
    public BackOrderPriority Priority { get; private set; }

    // Source Order
    public Guid SalesOrderId { get; private set; }
    public string SalesOrderNumber { get; private set; } = string.Empty;

    // Customer
    public Guid? CustomerId { get; private set; }
    public string? CustomerName { get; private set; }
    public string? CustomerEmail { get; private set; }

    // Warehouse
    public Guid? WarehouseId { get; private set; }
    public string? WarehouseCode { get; private set; }

    // Status & Timeline
    public BackOrderStatus Status { get; private set; }
    public DateTime? EstimatedRestockDate { get; private set; }
    public DateTime? ActualFulfillmentDate { get; private set; }
    public DateTime? CancelledDate { get; private set; }
    public string? CancellationReason { get; private set; }

    // Quantities
    public int TotalItemCount => _items.Count;
    public decimal TotalPendingQuantity => _items.Sum(i => i.PendingQuantity);
    public decimal TotalFulfilledQuantity => _items.Sum(i => i.FulfilledQuantity);

    // Notification
    public bool CustomerNotified { get; private set; }
    public DateTime? CustomerNotifiedDate { get; private set; }
    public bool IsAutoFulfill { get; private set; } = true;

    // Audit
    public Guid? CreatedBy { get; private set; }
    public string? CreatedByName { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public IReadOnlyCollection<BackOrderItem> Items => _items.AsReadOnly();

    #endregion

    #region Constructors

    private BackOrder() { }

    private BackOrder(
        Guid tenantId,
        string backOrderNumber,
        Guid salesOrderId,
        string salesOrderNumber) : base(Guid.NewGuid(), tenantId)
    {
        BackOrderNumber = backOrderNumber;
        BackOrderDate = DateTime.UtcNow;
        SalesOrderId = salesOrderId;
        SalesOrderNumber = salesOrderNumber;
        Type = BackOrderType.StockShortage;
        Priority = BackOrderPriority.Normal;
        Status = BackOrderStatus.Pending;
        CreatedAt = DateTime.UtcNow;
    }

    #endregion

    #region Factory Methods

    public static Result<BackOrder> Create(
        Guid tenantId,
        string backOrderNumber,
        Guid salesOrderId,
        string salesOrderNumber)
    {
        if (string.IsNullOrWhiteSpace(backOrderNumber))
            return Result<BackOrder>.Failure(Error.Validation("BackOrder.NumberRequired", "Back order number is required"));

        if (string.IsNullOrWhiteSpace(salesOrderNumber))
            return Result<BackOrder>.Failure(Error.Validation("BackOrder.OrderRequired", "Sales order number is required"));

        return Result<BackOrder>.Success(new BackOrder(tenantId, backOrderNumber, salesOrderId, salesOrderNumber));
    }

    #endregion

    #region Customer & Warehouse

    public Result SetCustomer(Guid? customerId, string? customerName, string? email)
    {
        CustomerId = customerId;
        CustomerName = customerName;
        CustomerEmail = email;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetWarehouse(Guid warehouseId, string? warehouseCode)
    {
        WarehouseId = warehouseId;
        WarehouseCode = warehouseCode;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Item Management

    public Result AddItem(BackOrderItem item)
    {
        if (Status == BackOrderStatus.Fulfilled || Status == BackOrderStatus.Cancelled)
            return Result.Failure(Error.Validation("BackOrder.CannotModify", "Cannot add items to fulfilled or cancelled back orders"));

        _items.Add(item);
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result RemoveItem(Guid itemId)
    {
        if (Status == BackOrderStatus.Fulfilled || Status == BackOrderStatus.Cancelled)
            return Result.Failure(Error.Validation("BackOrder.CannotModify", "Cannot remove items from fulfilled or cancelled back orders"));

        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            return Result.Failure(Error.NotFound("BackOrder.ItemNotFound", "Item not found"));

        if (item.FulfilledQuantity > 0)
            return Result.Failure(Error.Validation("BackOrder.ItemPartiallyFulfilled", "Cannot remove partially fulfilled items"));

        _items.Remove(item);
        UpdatedAt = DateTime.UtcNow;

        if (!_items.Any())
            Status = BackOrderStatus.Cancelled;

        return Result.Success();
    }

    #endregion

    #region Status Management

    public Result SetEstimatedRestockDate(DateTime? estimatedDate)
    {
        EstimatedRestockDate = estimatedDate;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result StartProcessing()
    {
        if (Status != BackOrderStatus.Pending)
            return Result.Failure(Error.Validation("BackOrder.NotPending", "Can only start processing pending back orders"));

        Status = BackOrderStatus.Processing;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result MarkAsReadyToFulfill()
    {
        if (Status != BackOrderStatus.Processing && Status != BackOrderStatus.Pending)
            return Result.Failure(Error.Validation("BackOrder.InvalidStatus", "Can only mark pending or processing back orders as ready"));

        Status = BackOrderStatus.ReadyToFulfill;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result FulfillItem(Guid itemId, decimal quantity)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            return Result.Failure(Error.NotFound("BackOrder.ItemNotFound", "Item not found"));

        var result = item.Fulfill(quantity);
        if (!result.IsSuccess)
            return result;

        // Check if all items are fulfilled
        if (_items.All(i => i.IsFullyFulfilled))
        {
            Status = BackOrderStatus.Fulfilled;
            ActualFulfillmentDate = DateTime.UtcNow;
        }
        else if (_items.Any(i => i.FulfilledQuantity > 0))
        {
            Status = BackOrderStatus.PartiallyFulfilled;
        }

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result FullFulfill()
    {
        if (Status == BackOrderStatus.Fulfilled || Status == BackOrderStatus.Cancelled)
            return Result.Failure(Error.Validation("BackOrder.CannotFulfill", "Back order is already fulfilled or cancelled"));

        foreach (var item in _items)
        {
            item.Fulfill(item.PendingQuantity);
        }

        Status = BackOrderStatus.Fulfilled;
        ActualFulfillmentDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Cancel(string reason)
    {
        if (Status == BackOrderStatus.Fulfilled)
            return Result.Failure(Error.Validation("BackOrder.AlreadyFulfilled", "Cannot cancel fulfilled back order"));

        if (Status == BackOrderStatus.Cancelled)
            return Result.Failure(Error.Validation("BackOrder.AlreadyCancelled", "Back order is already cancelled"));

        if (_items.Any(i => i.FulfilledQuantity > 0))
            return Result.Failure(Error.Validation("BackOrder.PartiallyFulfilled", "Cannot cancel partially fulfilled back order"));

        Status = BackOrderStatus.Cancelled;
        CancelledDate = DateTime.UtcNow;
        CancellationReason = reason;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Priority & Type

    public Result SetPriority(BackOrderPriority priority)
    {
        Priority = priority;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetType(BackOrderType type)
    {
        Type = type;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Notification

    public Result NotifyCustomer()
    {
        CustomerNotified = true;
        CustomerNotifiedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetAutoFulfill(bool autoFulfill)
    {
        IsAutoFulfill = autoFulfill;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Metadata

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

/// <summary>
/// Line item for a back order
/// </summary>
public class BackOrderItem : TenantEntity
{
    public Guid BackOrderId { get; private set; }
    public int LineNumber { get; private set; }

    // Source Order Item
    public Guid SalesOrderItemId { get; private set; }

    // Product
    public Guid? ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public string Unit { get; private set; } = "Adet";

    // Quantities
    public decimal OrderedQuantity { get; private set; }
    public decimal AvailableQuantity { get; private set; }
    public decimal PendingQuantity => OrderedQuantity - AvailableQuantity - FulfilledQuantity;
    public decimal FulfilledQuantity { get; private set; }
    public bool IsFullyFulfilled => FulfilledQuantity >= (OrderedQuantity - AvailableQuantity);

    // Pricing (for reference)
    public decimal UnitPrice { get; private set; }
    public decimal PendingValue => PendingQuantity * UnitPrice;

    // Substitution
    public bool AllowSubstitution { get; private set; }
    public Guid? SubstituteProductId { get; private set; }
    public string? SubstituteProductCode { get; private set; }

    // Expected Restock
    public DateTime? ItemEstimatedRestockDate { get; private set; }
    public Guid? PurchaseOrderId { get; private set; }
    public string? PurchaseOrderNumber { get; private set; }

    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private BackOrderItem() { }

    private BackOrderItem(
        Guid tenantId,
        Guid backOrderId,
        int lineNumber,
        Guid salesOrderItemId,
        Guid? productId,
        string productCode,
        string productName,
        string unit,
        decimal orderedQuantity,
        decimal availableQuantity,
        decimal unitPrice) : base(Guid.NewGuid(), tenantId)
    {
        BackOrderId = backOrderId;
        LineNumber = lineNumber;
        SalesOrderItemId = salesOrderItemId;
        ProductId = productId;
        ProductCode = productCode;
        ProductName = productName;
        Unit = unit;
        OrderedQuantity = orderedQuantity;
        AvailableQuantity = availableQuantity;
        UnitPrice = unitPrice;
        CreatedAt = DateTime.UtcNow;
    }

    public static Result<BackOrderItem> Create(
        Guid tenantId,
        Guid backOrderId,
        int lineNumber,
        Guid salesOrderItemId,
        Guid? productId,
        string productCode,
        string productName,
        string unit,
        decimal orderedQuantity,
        decimal availableQuantity,
        decimal unitPrice)
    {
        if (orderedQuantity <= 0)
            return Result<BackOrderItem>.Failure(Error.Validation("BackOrderItem.InvalidQuantity", "Ordered quantity must be greater than zero"));

        if (availableQuantity < 0)
            return Result<BackOrderItem>.Failure(Error.Validation("BackOrderItem.InvalidAvailable", "Available quantity cannot be negative"));

        if (availableQuantity >= orderedQuantity)
            return Result<BackOrderItem>.Failure(Error.Validation("BackOrderItem.FullyAvailable", "Available quantity equals or exceeds ordered quantity - no back order needed"));

        return Result<BackOrderItem>.Success(
            new BackOrderItem(tenantId, backOrderId, lineNumber, salesOrderItemId, productId, productCode, productName, unit, orderedQuantity, availableQuantity, unitPrice));
    }

    public Result Fulfill(decimal quantity)
    {
        if (quantity <= 0)
            return Result.Failure(Error.Validation("BackOrderItem.InvalidQuantity", "Fulfill quantity must be greater than zero"));

        if (quantity > PendingQuantity)
            return Result.Failure(Error.Validation("BackOrderItem.ExceedsPending", "Fulfill quantity exceeds pending quantity"));

        FulfilledQuantity += quantity;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetSubstitute(Guid productId, string productCode)
    {
        AllowSubstitution = true;
        SubstituteProductId = productId;
        SubstituteProductCode = productCode;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result LinkToPurchaseOrder(Guid purchaseOrderId, string purchaseOrderNumber, DateTime? estimatedDate)
    {
        PurchaseOrderId = purchaseOrderId;
        PurchaseOrderNumber = purchaseOrderNumber;
        ItemEstimatedRestockDate = estimatedDate;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }
}

#region Enums

public enum BackOrderStatus
{
    Pending = 0,
    Processing = 1,
    ReadyToFulfill = 2,
    PartiallyFulfilled = 3,
    Fulfilled = 4,
    Cancelled = 5
}

public enum BackOrderType
{
    StockShortage = 0,
    ProductionDelay = 1,
    SupplierDelay = 2,
    QualityHold = 3,
    CustomerRequest = 4,
    Other = 99
}

public enum BackOrderPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3,
    Critical = 4
}

#endregion
