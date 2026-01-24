using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.InventoryReservations.Queries;

public record GetReservationByIdQuery(Guid Id) : IRequest<Result<InventoryReservationDto>>;

public record GetReservationByNumberQuery(string ReservationNumber) : IRequest<Result<InventoryReservationDto>>;

public record GetReservationsPagedQuery(
    int Page = 1,
    int PageSize = 20,
    string? Status = null,
    string? Type = null,
    Guid? ProductId = null,
    Guid? WarehouseId = null,
    Guid? SalesOrderId = null) : IRequest<Result<PagedResult<InventoryReservationListDto>>>;

public record GetReservationsByProductQuery(Guid ProductId) : IRequest<Result<IReadOnlyList<InventoryReservationListDto>>>;

public record GetReservationsBySalesOrderQuery(Guid SalesOrderId) : IRequest<Result<IReadOnlyList<InventoryReservationListDto>>>;

public record GetActiveReservationsByProductQuery(Guid ProductId) : IRequest<Result<IReadOnlyList<InventoryReservationListDto>>>;

public record GetExpiredReservationsQuery() : IRequest<Result<IReadOnlyList<InventoryReservationListDto>>>;

public record GetTotalReservedQuantityQuery(Guid ProductId, Guid? WarehouseId = null) : IRequest<Result<decimal>>;
