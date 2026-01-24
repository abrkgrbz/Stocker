using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.BackOrders.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.BackOrders.Handlers;

public class GetBackOrderByIdHandler : IRequestHandler<GetBackOrderByIdQuery, Result<BackOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetBackOrderByIdHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BackOrderDto>> Handle(GetBackOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var backOrder = await _unitOfWork.BackOrders.GetWithItemsAsync(request.Id, cancellationToken);
        if (backOrder == null)
            return Result<BackOrderDto>.Failure(Error.NotFound("BackOrder.NotFound", "Back order not found"));

        return Result<BackOrderDto>.Success(CreateBackOrderHandler.MapToDto(backOrder));
    }
}

public class GetBackOrderByNumberHandler : IRequestHandler<GetBackOrderByNumberQuery, Result<BackOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetBackOrderByNumberHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BackOrderDto>> Handle(GetBackOrderByNumberQuery request, CancellationToken cancellationToken)
    {
        var backOrder = await _unitOfWork.BackOrders.GetByNumberAsync(request.BackOrderNumber, cancellationToken);
        if (backOrder == null)
            return Result<BackOrderDto>.Failure(Error.NotFound("BackOrder.NotFound", "Back order not found"));

        return Result<BackOrderDto>.Success(CreateBackOrderHandler.MapToDto(backOrder));
    }
}

public class GetBackOrdersPagedHandler : IRequestHandler<GetBackOrdersPagedQuery, Result<PagedResult<BackOrderListDto>>>
{
    private readonly SalesDbContext _context;

    public GetBackOrdersPagedHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<BackOrderListDto>>> Handle(GetBackOrdersPagedQuery request, CancellationToken cancellationToken)
    {
        var query = _context.BackOrders
            .Include(b => b.Items)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<BackOrderStatus>(request.Status, true, out var status))
            query = query.Where(b => b.Status == status);

        if (!string.IsNullOrWhiteSpace(request.Priority) && Enum.TryParse<BackOrderPriority>(request.Priority, true, out var priority))
            query = query.Where(b => b.Priority == priority);

        if (!string.IsNullOrWhiteSpace(request.Type) && Enum.TryParse<BackOrderType>(request.Type, true, out var type))
            query = query.Where(b => b.Type == type);

        if (request.CustomerId.HasValue)
            query = query.Where(b => b.CustomerId == request.CustomerId.Value);

        if (request.SalesOrderId.HasValue)
            query = query.Where(b => b.SalesOrderId == request.SalesOrderId.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(b => b.BackOrderDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(CreateBackOrderHandler.MapToListDto).ToList();

        return Result<PagedResult<BackOrderListDto>>.Success(
            new PagedResult<BackOrderListDto>(dtos, totalCount, request.Page, request.PageSize));
    }
}

public class GetBackOrdersBySalesOrderHandler : IRequestHandler<GetBackOrdersBySalesOrderQuery, Result<IReadOnlyList<BackOrderListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetBackOrdersBySalesOrderHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<BackOrderListDto>>> Handle(GetBackOrdersBySalesOrderQuery request, CancellationToken cancellationToken)
    {
        var backOrders = await _unitOfWork.BackOrders.GetBySalesOrderIdAsync(request.SalesOrderId, cancellationToken);
        var dtos = backOrders.Select(CreateBackOrderHandler.MapToListDto).ToList();
        return Result<IReadOnlyList<BackOrderListDto>>.Success(dtos);
    }
}

public class GetBackOrdersByCustomerHandler : IRequestHandler<GetBackOrdersByCustomerQuery, Result<IReadOnlyList<BackOrderListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetBackOrdersByCustomerHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<BackOrderListDto>>> Handle(GetBackOrdersByCustomerQuery request, CancellationToken cancellationToken)
    {
        var backOrders = await _unitOfWork.BackOrders.GetByCustomerIdAsync(request.CustomerId, cancellationToken);
        var dtos = backOrders.Select(CreateBackOrderHandler.MapToListDto).ToList();
        return Result<IReadOnlyList<BackOrderListDto>>.Success(dtos);
    }
}

public class GetBackOrdersByStatusHandler : IRequestHandler<GetBackOrdersByStatusQuery, Result<IReadOnlyList<BackOrderListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetBackOrdersByStatusHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<BackOrderListDto>>> Handle(GetBackOrdersByStatusQuery request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<BackOrderStatus>(request.Status, true, out var status))
            return Result<IReadOnlyList<BackOrderListDto>>.Failure(Error.Validation("BackOrder.InvalidStatus", "Invalid status value"));

        var backOrders = await _unitOfWork.BackOrders.GetByStatusAsync(status, cancellationToken);
        var dtos = backOrders.Select(CreateBackOrderHandler.MapToListDto).ToList();
        return Result<IReadOnlyList<BackOrderListDto>>.Success(dtos);
    }
}

public class GetPendingBackOrdersHandler : IRequestHandler<GetPendingBackOrdersQuery, Result<IReadOnlyList<BackOrderListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetPendingBackOrdersHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<BackOrderListDto>>> Handle(GetPendingBackOrdersQuery request, CancellationToken cancellationToken)
    {
        var backOrders = await _unitOfWork.BackOrders.GetPendingAsync(cancellationToken);
        var dtos = backOrders.Select(CreateBackOrderHandler.MapToListDto).ToList();
        return Result<IReadOnlyList<BackOrderListDto>>.Success(dtos);
    }
}
