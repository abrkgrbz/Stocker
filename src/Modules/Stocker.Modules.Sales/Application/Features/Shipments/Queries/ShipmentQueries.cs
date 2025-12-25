using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Shipments.Queries;

public record GetShipmentsQuery : IRequest<Result<PagedResult<ShipmentListDto>>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public ShipmentStatus? Status { get; init; }
    public ShipmentType? ShipmentType { get; init; }
    public Guid? SalesOrderId { get; init; }
    public Guid? CustomerId { get; init; }
    public Guid? CarrierId { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public ShipmentPriority? Priority { get; init; }
    public bool? IsDeliveryNoteCreated { get; init; }
    public bool? IsInvoiced { get; init; }
    public string? SortBy { get; init; } = "ShipmentDate";
    public bool SortDescending { get; init; } = true;
}

public record GetShipmentByIdQuery : IRequest<Result<ShipmentDto>>
{
    public Guid Id { get; init; }
}

public record GetShipmentByNumberQuery : IRequest<Result<ShipmentDto>>
{
    public string ShipmentNumber { get; init; } = string.Empty;
}

public record GetShipmentsByOrderQuery : IRequest<Result<IReadOnlyList<ShipmentListDto>>>
{
    public Guid SalesOrderId { get; init; }
}

public record GetShipmentsByCustomerQuery : IRequest<Result<PagedResult<ShipmentListDto>>>
{
    public Guid CustomerId { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public record GetPendingShipmentsQuery : IRequest<Result<IReadOnlyList<ShipmentListDto>>>
{
    public ShipmentPriority? MinPriority { get; init; }
}

public record GetShipmentsInTransitQuery : IRequest<Result<IReadOnlyList<ShipmentListDto>>>
{
}

public record GetOverdueShipmentsQuery : IRequest<Result<IReadOnlyList<ShipmentListDto>>>
{
}

public record GetShipmentStatisticsQuery : IRequest<Result<ShipmentStatisticsDto>>
{
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}

public record ShipmentStatisticsDto
{
    public int TotalShipments { get; init; }
    public int DraftShipments { get; init; }
    public int PreparingShipments { get; init; }
    public int ReadyShipments { get; init; }
    public int ShippedShipments { get; init; }
    public int InTransitShipments { get; init; }
    public int DeliveredShipments { get; init; }
    public int ReturnedShipments { get; init; }
    public int CancelledShipments { get; init; }
    public decimal TotalShippingCost { get; init; }
    public decimal AverageDeliveryDays { get; init; }
    public decimal OnTimeDeliveryRate { get; init; }
}
