using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesOrders.Handlers;

/// <summary>
/// Handler for GetSalesOrdersQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetSalesOrdersHandler : IRequestHandler<GetSalesOrdersQuery, Result<PagedResult<SalesOrderListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<GetSalesOrdersHandler> _logger;

    public GetSalesOrdersHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<GetSalesOrdersHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<PagedResult<SalesOrderListDto>>> Handle(GetSalesOrdersQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.SalesOrders.AsQueryable()
            .Include(o => o.Items)
            .Where(o => o.TenantId == tenantId)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(o =>
                o.OrderNumber.ToLower().Contains(searchTerm) ||
                (o.CustomerName != null && o.CustomerName.ToLower().Contains(searchTerm)));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<SalesOrderStatus>(request.Status, true, out var status))
                query = query.Where(o => o.Status == status);
        }

        if (request.CustomerId.HasValue)
            query = query.Where(o => o.CustomerId == request.CustomerId.Value);

        if (request.SalesPersonId.HasValue)
            query = query.Where(o => o.SalesPersonId == request.SalesPersonId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(o => o.OrderDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(o => o.OrderDate <= request.ToDate.Value);

        // Apply sorting
        query = request.SortBy?.ToLower() switch
        {
            "ordernumber" => request.SortDescending
                ? query.OrderByDescending(o => o.OrderNumber)
                : query.OrderBy(o => o.OrderNumber),
            "customername" => request.SortDescending
                ? query.OrderByDescending(o => o.CustomerName)
                : query.OrderBy(o => o.CustomerName),
            "totalamount" => request.SortDescending
                ? query.OrderByDescending(o => o.TotalAmount)
                : query.OrderBy(o => o.TotalAmount),
            "status" => request.SortDescending
                ? query.OrderByDescending(o => o.Status)
                : query.OrderBy(o => o.Status),
            _ => request.SortDescending
                ? query.OrderByDescending(o => o.OrderDate)
                : query.OrderBy(o => o.OrderDate)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var result = new PagedResult<SalesOrderListDto>(
            items.Select(SalesOrderListDto.FromEntity),
            request.Page,
            request.PageSize,
            totalCount);

        return Result<PagedResult<SalesOrderListDto>>.Success(result);
    }
}

/// <summary>
/// Handler for GetSalesOrderByIdQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetSalesOrderByIdHandler : IRequestHandler<GetSalesOrderByIdQuery, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetSalesOrderByIdHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesOrderDto>> Handle(GetSalesOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

/// <summary>
/// Handler for GetSalesOrderStatisticsQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetSalesOrderStatisticsHandler : IRequestHandler<GetSalesOrderStatisticsQuery, Result<SalesOrderStatisticsDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetSalesOrderStatisticsHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesOrderStatisticsDto>> Handle(GetSalesOrderStatisticsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.SalesOrders.AsQueryable()
            .Where(o => o.TenantId == tenantId);

        if (request.FromDate.HasValue)
            query = query.Where(o => o.OrderDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(o => o.OrderDate <= request.ToDate.Value);

        var orders = await query.ToListAsync(cancellationToken);

        var stats = new SalesOrderStatisticsDto
        {
            TotalOrders = orders.Count,
            DraftOrders = orders.Count(o => o.Status == SalesOrderStatus.Draft),
            ApprovedOrders = orders.Count(o => o.Status == SalesOrderStatus.Approved),
            CompletedOrders = orders.Count(o => o.Status == SalesOrderStatus.Completed),
            CancelledOrders = orders.Count(o => o.Status == SalesOrderStatus.Cancelled),
            TotalAmount = orders.Where(o => !o.IsCancelled).Sum(o => o.TotalAmount),
            AverageOrderValue = orders.Count > 0 ? orders.Where(o => !o.IsCancelled).Average(o => o.TotalAmount) : 0,
            Currency = "TRY"
        };

        return Result<SalesOrderStatisticsDto>.Success(stats);
    }
}
