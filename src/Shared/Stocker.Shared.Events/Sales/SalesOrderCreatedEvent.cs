namespace Stocker.Shared.Events.Sales;

/// <summary>
/// Published when a sales order is created in the Sales module
/// Consumed by Inventory module for stock reservation
/// </summary>
public record SalesOrderCreatedEvent(
    Guid OrderId,
    string OrderNumber,
    Guid? CustomerId,
    string CustomerName,
    Guid TenantId,
    decimal TotalAmount,
    string Currency,
    List<SalesOrderItemDto> Items,
    DateTime OrderDate,
    Guid? CreatedBy
) : IntegrationEvent, ITenantEvent;

/// <summary>
/// Item information in a sales order
/// </summary>
public record SalesOrderItemDto(
    Guid ItemId,
    Guid? ProductId,
    string ProductCode,
    string ProductName,
    string Unit,
    decimal Quantity,
    decimal UnitPrice,
    decimal DiscountAmount
);
