using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.InventoryReservations.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.InventoryReservations.Handlers;

public class GetReservationByIdHandler : IRequestHandler<GetReservationByIdQuery, Result<InventoryReservationDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetReservationByIdHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InventoryReservationDto>> Handle(GetReservationByIdQuery request, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.InventoryReservations.GetByIdAsync(request.Id, cancellationToken);
        if (reservation == null)
            return Result<InventoryReservationDto>.Failure(Error.NotFound("Reservation.NotFound", "Reservation not found"));

        return Result<InventoryReservationDto>.Success(CreateReservationHandler.MapToDto(reservation));
    }
}

public class GetReservationByNumberHandler : IRequestHandler<GetReservationByNumberQuery, Result<InventoryReservationDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetReservationByNumberHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InventoryReservationDto>> Handle(GetReservationByNumberQuery request, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.InventoryReservations.GetByNumberAsync(request.ReservationNumber, cancellationToken);
        if (reservation == null)
            return Result<InventoryReservationDto>.Failure(Error.NotFound("Reservation.NotFound", "Reservation not found"));

        return Result<InventoryReservationDto>.Success(CreateReservationHandler.MapToDto(reservation));
    }
}

public class GetReservationsPagedHandler : IRequestHandler<GetReservationsPagedQuery, Result<PagedResult<InventoryReservationListDto>>>
{
    private readonly SalesDbContext _context;

    public GetReservationsPagedHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<InventoryReservationListDto>>> Handle(GetReservationsPagedQuery request, CancellationToken cancellationToken)
    {
        var query = _context.InventoryReservations
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<ReservationStatus>(request.Status, true, out var status))
            query = query.Where(r => r.Status == status);

        if (!string.IsNullOrWhiteSpace(request.Type) && Enum.TryParse<ReservationType>(request.Type, true, out var type))
            query = query.Where(r => r.Type == type);

        if (request.ProductId.HasValue)
            query = query.Where(r => r.ProductId == request.ProductId.Value);

        if (request.WarehouseId.HasValue)
            query = query.Where(r => r.WarehouseId == request.WarehouseId.Value);

        if (request.SalesOrderId.HasValue)
            query = query.Where(r => r.SalesOrderId == request.SalesOrderId.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(r => r.ReservedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(CreateReservationHandler.MapToListDto).ToList();

        return Result<PagedResult<InventoryReservationListDto>>.Success(
            new PagedResult<InventoryReservationListDto>(dtos, totalCount, request.Page, request.PageSize));
    }
}

public class GetReservationsByProductHandler : IRequestHandler<GetReservationsByProductQuery, Result<IReadOnlyList<InventoryReservationListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetReservationsByProductHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<InventoryReservationListDto>>> Handle(GetReservationsByProductQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _unitOfWork.InventoryReservations.GetByProductIdAsync(request.ProductId, cancellationToken);
        var dtos = reservations.Select(CreateReservationHandler.MapToListDto).ToList();
        return Result<IReadOnlyList<InventoryReservationListDto>>.Success(dtos);
    }
}

public class GetReservationsBySalesOrderHandler : IRequestHandler<GetReservationsBySalesOrderQuery, Result<IReadOnlyList<InventoryReservationListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetReservationsBySalesOrderHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<InventoryReservationListDto>>> Handle(GetReservationsBySalesOrderQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _unitOfWork.InventoryReservations.GetBySalesOrderIdAsync(request.SalesOrderId, cancellationToken);
        var dtos = reservations.Select(CreateReservationHandler.MapToListDto).ToList();
        return Result<IReadOnlyList<InventoryReservationListDto>>.Success(dtos);
    }
}

public class GetActiveReservationsByProductHandler : IRequestHandler<GetActiveReservationsByProductQuery, Result<IReadOnlyList<InventoryReservationListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetActiveReservationsByProductHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<InventoryReservationListDto>>> Handle(GetActiveReservationsByProductQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _unitOfWork.InventoryReservations.GetActiveByProductAsync(request.ProductId, cancellationToken);
        var dtos = reservations.Select(CreateReservationHandler.MapToListDto).ToList();
        return Result<IReadOnlyList<InventoryReservationListDto>>.Success(dtos);
    }
}

public class GetExpiredReservationsHandler : IRequestHandler<GetExpiredReservationsQuery, Result<IReadOnlyList<InventoryReservationListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetExpiredReservationsHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<InventoryReservationListDto>>> Handle(GetExpiredReservationsQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _unitOfWork.InventoryReservations.GetExpiredAsync(cancellationToken);
        var dtos = reservations.Select(CreateReservationHandler.MapToListDto).ToList();
        return Result<IReadOnlyList<InventoryReservationListDto>>.Success(dtos);
    }
}

public class GetTotalReservedQuantityHandler : IRequestHandler<GetTotalReservedQuantityQuery, Result<decimal>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetTotalReservedQuantityHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<decimal>> Handle(GetTotalReservedQuantityQuery request, CancellationToken cancellationToken)
    {
        var total = await _unitOfWork.InventoryReservations.GetTotalReservedQuantityAsync(request.ProductId, request.WarehouseId, cancellationToken);
        return Result<decimal>.Success(total);
    }
}
