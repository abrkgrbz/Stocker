namespace Stocker.Modules.Sales.Application.DTOs;

public class BackOrderDto
{
    public Guid Id { get; init; }
    public string BackOrderNumber { get; init; } = string.Empty;
    public DateTime BackOrderDate { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public Guid SalesOrderId { get; init; }
    public string SalesOrderNumber { get; init; } = string.Empty;
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public Guid? WarehouseId { get; init; }
    public string? WarehouseCode { get; init; }
    public DateTime? EstimatedRestockDate { get; init; }
    public DateTime? ActualFulfillmentDate { get; init; }
    public bool CustomerNotified { get; init; }
    public bool IsAutoFulfill { get; init; }
    public int TotalItemCount { get; init; }
    public decimal TotalPendingQuantity { get; init; }
    public decimal TotalFulfilledQuantity { get; init; }
    public string? Notes { get; init; }
    public List<BackOrderItemDto> Items { get; init; } = new();
}

public class BackOrderListDto
{
    public Guid Id { get; init; }
    public string BackOrderNumber { get; init; } = string.Empty;
    public DateTime BackOrderDate { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string SalesOrderNumber { get; init; } = string.Empty;
    public string? CustomerName { get; init; }
    public DateTime? EstimatedRestockDate { get; init; }
    public int TotalItemCount { get; init; }
    public decimal TotalPendingQuantity { get; init; }
}

public class BackOrderItemDto
{
    public Guid Id { get; init; }
    public int LineNumber { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string Unit { get; init; } = string.Empty;
    public decimal OrderedQuantity { get; init; }
    public decimal AvailableQuantity { get; init; }
    public decimal PendingQuantity { get; init; }
    public decimal FulfilledQuantity { get; init; }
    public decimal UnitPrice { get; init; }
    public bool IsFullyFulfilled { get; init; }
    public string? SubstituteProductCode { get; init; }
    public string? PurchaseOrderNumber { get; init; }
}

public class CreateBackOrderDto
{
    public Guid SalesOrderId { get; init; }
    public string SalesOrderNumber { get; init; } = string.Empty;
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? CustomerEmail { get; init; }
    public Guid? WarehouseId { get; init; }
    public string? WarehouseCode { get; init; }
    public string? Type { get; init; }
    public string? Priority { get; init; }
    public DateTime? EstimatedRestockDate { get; init; }
    public string? Notes { get; init; }
    public List<CreateBackOrderItemDto> Items { get; init; } = new();
}

public class CreateBackOrderItemDto
{
    public Guid SalesOrderItemId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string Unit { get; init; } = "Adet";
    public decimal OrderedQuantity { get; init; }
    public decimal AvailableQuantity { get; init; }
    public decimal UnitPrice { get; init; }
}

public class FulfillBackOrderItemDto
{
    public Guid ItemId { get; init; }
    public decimal Quantity { get; init; }
}
