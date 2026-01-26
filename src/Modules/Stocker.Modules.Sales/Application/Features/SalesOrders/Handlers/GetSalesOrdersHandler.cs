using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Queries;
using Stocker.Modules.Sales.Application.Services;
using Stocker.Modules.Sales.Domain;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesOrders.Handlers;

/// <summary>
/// Handler for GetSalesOrdersQuery
/// Uses ISalesUnitOfWork for consistent data access
/// Applies territory-based filtering for non-manager users
/// </summary>
public class GetSalesOrdersHandler : IRequestHandler<GetSalesOrdersQuery, Result<PagedResult<SalesOrderListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IResourceAuthorizationService _resourceAuth;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<GetSalesOrdersHandler> _logger;

    public GetSalesOrdersHandler(
        ISalesUnitOfWork unitOfWork,
        IResourceAuthorizationService resourceAuth,
        ICurrentUserService currentUser,
        ILogger<GetSalesOrdersHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _resourceAuth = resourceAuth;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task<Result<PagedResult<SalesOrderListDto>>> Handle(GetSalesOrdersQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.SalesOrders.AsQueryable()
            .Include(o => o.Items)
            .Where(o => o.TenantId == tenantId)
            .AsQueryable();

        // Territory-based access control: non-managers only see their own orders
        if (!_resourceAuth.IsManager())
        {
            var userId = _currentUser.UserId;
            var territoryIds = await _resourceAuth.GetUserTerritoryIdsAsync(cancellationToken);

            if (userId.HasValue)
            {
                if (territoryIds.Count > 0)
                {
                    // User sees orders where they are sales person OR order is in their territory
                    query = query.Where(o =>
                        o.SalesPersonId == userId.Value ||
                        (o.TerritoryId.HasValue && territoryIds.Contains(o.TerritoryId.Value)));
                }
                else
                {
                    // No territory assignments - only see own orders
                    query = query.Where(o => o.SalesPersonId == userId.Value);
                }
            }
        }

        // Apply smart search across multiple fields
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.Trim().ToLower();

            // Smart Search: Multi-field search with weighted relevance
            // Priority 1: Exact OrderNumber match
            // Priority 2: CustomerName, CustomerEmail
            // Priority 3: Product codes and names in items
            // Priority 4: Order notes
            // Priority 5: QuotationNumber reference
            query = query.Where(o =>
                // Priority 1: Order Number (exact or contains)
                o.OrderNumber.ToLower().Contains(searchTerm) ||
                // Priority 2: Customer info
                (o.CustomerName != null && o.CustomerName.ToLower().Contains(searchTerm)) ||
                (o.CustomerEmail != null && o.CustomerEmail.ToLower().Contains(searchTerm)) ||
                // Priority 3: Product info in items
                o.Items.Any(i =>
                    i.ProductCode.ToLower().Contains(searchTerm) ||
                    i.ProductName.ToLower().Contains(searchTerm)) ||
                // Priority 4: Notes
                (o.Notes != null && o.Notes.ToLower().Contains(searchTerm)) ||
                // Priority 5: Source document reference
                (o.QuotationNumber != null && o.QuotationNumber.ToLower().Contains(searchTerm)) ||
                (o.CustomerOrderNumber != null && o.CustomerOrderNumber.ToLower().Contains(searchTerm)));
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

        // Filter by invoicing status
        if (!string.IsNullOrWhiteSpace(request.InvoicingStatus))
        {
            if (Enum.TryParse<InvoicingStatus>(request.InvoicingStatus, true, out var invoicingStatus))
                query = query.Where(o => o.InvoicingStatus == invoicingStatus);
        }

        // Filter by fulfillment status
        if (!string.IsNullOrWhiteSpace(request.FulfillmentStatus))
        {
            if (Enum.TryParse<FulfillmentStatus>(request.FulfillmentStatus, true, out var fulfillmentStatus))
                query = query.Where(o => o.FulfillmentStatus == fulfillmentStatus);
        }

        // Filter for returnable orders only (evaluated in-memory due to complex domain logic)
        // Note: For performance, consider caching return eligibility if this filter is heavily used

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
/// Includes resource-level authorization check
/// </summary>
public class GetSalesOrderByIdHandler : IRequestHandler<GetSalesOrderByIdQuery, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IResourceAuthorizationService _resourceAuth;

    public GetSalesOrderByIdHandler(
        ISalesUnitOfWork unitOfWork,
        IResourceAuthorizationService resourceAuth)
    {
        _unitOfWork = unitOfWork;
        _resourceAuth = resourceAuth;
    }

    public async Task<Result<SalesOrderDto>> Handle(GetSalesOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.NotFound(request.Id));

        // SECURITY: Resource-level authorization check
        var authResult = await _resourceAuth.CanAccessSalesOrderAsync(request.Id, cancellationToken);
        if (!authResult.IsSuccess)
            return Result<SalesOrderDto>.Failure(authResult.Error!);
        if (!authResult.Value)
            return Result<SalesOrderDto>.Failure(
                Error.Forbidden("Order.AccessDenied", "Bu siparişi görüntüleme yetkiniz bulunmamaktadır."));

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

/// <summary>
/// Handler for GetSalesOrderStatisticsQuery
/// Uses ISalesUnitOfWork for consistent data access
/// Applies territory-based filtering for non-manager users
/// </summary>
public class GetSalesOrderStatisticsHandler : IRequestHandler<GetSalesOrderStatisticsQuery, Result<SalesOrderStatisticsDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IResourceAuthorizationService _resourceAuth;
    private readonly ICurrentUserService _currentUser;

    public GetSalesOrderStatisticsHandler(
        ISalesUnitOfWork unitOfWork,
        IResourceAuthorizationService resourceAuth,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _resourceAuth = resourceAuth;
        _currentUser = currentUser;
    }

    public async Task<Result<SalesOrderStatisticsDto>> Handle(GetSalesOrderStatisticsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.SalesOrders.AsQueryable()
            .Where(o => o.TenantId == tenantId);

        // Territory-based access control for statistics
        if (!_resourceAuth.IsManager())
        {
            var userId = _currentUser.UserId;
            var territoryIds = await _resourceAuth.GetUserTerritoryIdsAsync(cancellationToken);

            if (userId.HasValue)
            {
                if (territoryIds.Count > 0)
                {
                    query = query.Where(o =>
                        o.SalesPersonId == userId.Value ||
                        (o.TerritoryId.HasValue && territoryIds.Contains(o.TerritoryId.Value)));
                }
                else
                {
                    query = query.Where(o => o.SalesPersonId == userId.Value);
                }
            }
        }

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
