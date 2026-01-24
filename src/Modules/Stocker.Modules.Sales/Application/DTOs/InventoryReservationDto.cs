namespace Stocker.Modules.Sales.Application.DTOs;

public class InventoryReservationDto
{
    public Guid Id { get; init; }
    public string ReservationNumber { get; init; } = string.Empty;
    public Guid ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public Guid? WarehouseId { get; init; }
    public string? WarehouseCode { get; init; }
    public decimal ReservedQuantity { get; init; }
    public decimal AllocatedQuantity { get; init; }
    public decimal RemainingQuantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public string? LotNumber { get; init; }
    public string? SerialNumber { get; init; }
    public string Source { get; init; } = string.Empty;
    public Guid? SalesOrderId { get; init; }
    public string? SalesOrderNumber { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public DateTime ReservedAt { get; init; }
    public DateTime ReservedUntil { get; init; }
    public DateTime? ReleasedAt { get; init; }
    public int Priority { get; init; }
    public bool IsAutoRelease { get; init; }
    public string? Notes { get; init; }
}

public class InventoryReservationListDto
{
    public Guid Id { get; init; }
    public string ReservationNumber { get; init; } = string.Empty;
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal ReservedQuantity { get; init; }
    public decimal RemainingQuantity { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Source { get; init; } = string.Empty;
    public DateTime ReservedAt { get; init; }
    public DateTime ReservedUntil { get; init; }
    public string? SalesOrderNumber { get; init; }
}

public class CreateReservationDto
{
    public Guid ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = "Adet";
    public DateTime ReservedUntil { get; init; }
    public Guid? WarehouseId { get; init; }
    public string? WarehouseCode { get; init; }
    public string? Source { get; init; }
    public Guid? SalesOrderId { get; init; }
    public string? SalesOrderNumber { get; init; }
    public Guid? SalesOrderItemId { get; init; }
    public string? LotNumber { get; init; }
    public string? SerialNumber { get; init; }
    public int Priority { get; init; } = 1;
    public string? Notes { get; init; }
}

public class AllocateReservationDto
{
    public decimal Quantity { get; init; }
}

public class ExtendReservationDto
{
    public DateTime NewExpiry { get; init; }
}

public class ReleaseReservationDto
{
    public string? Reason { get; init; }
}
