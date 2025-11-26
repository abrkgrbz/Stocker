using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesOrders.Commands;

public record CreateSalesOrderCommand : IRequest<Result<SalesOrderDto>>
{
    public DateTime OrderDate { get; init; } = DateTime.UtcNow;
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? CustomerEmail { get; init; }
    public Guid? BranchId { get; init; }
    public Guid? WarehouseId { get; init; }
    public string? CustomerOrderNumber { get; init; }
    public string Currency { get; init; } = "TRY";
    public string? ShippingAddress { get; init; }
    public string? BillingAddress { get; init; }
    public string? Notes { get; init; }
    public Guid? SalesPersonId { get; init; }
    public string? SalesPersonName { get; init; }
    public List<CreateSalesOrderItemCommand> Items { get; init; } = new();
}

public record CreateSalesOrderItemCommand
{
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal VatRate { get; init; } = 20;
    public decimal DiscountRate { get; init; }
}

public record UpdateSalesOrderCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid Id { get; init; }
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? CustomerEmail { get; init; }
    public DateTime? DeliveryDate { get; init; }
    public string? CustomerOrderNumber { get; init; }
    public string? ShippingAddress { get; init; }
    public string? BillingAddress { get; init; }
    public string? Notes { get; init; }
    public Guid? SalesPersonId { get; init; }
    public string? SalesPersonName { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal DiscountRate { get; init; }
}

public record AddSalesOrderItemCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid SalesOrderId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal VatRate { get; init; } = 20;
    public decimal DiscountRate { get; init; }
}

public record RemoveSalesOrderItemCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid SalesOrderId { get; init; }
    public Guid ItemId { get; init; }
}

public record ApproveSalesOrderCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid Id { get; init; }
}

public record ConfirmSalesOrderCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid Id { get; init; }
}

public record ShipSalesOrderCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid Id { get; init; }
}

public record DeliverSalesOrderCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid Id { get; init; }
}

public record CompleteSalesOrderCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid Id { get; init; }
}

public record CancelSalesOrderCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record DeleteSalesOrderCommand : IRequest<Result>
{
    public Guid Id { get; init; }
}
