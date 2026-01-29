using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Cart;
using Stocker.Application.Features.Cart;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Checkout.Queries.GetOrder;

/// <summary>
/// ID ile sipariş getir
/// </summary>
public record GetOrderQuery : IRequest<Result<OrderDto?>>
{
    public Guid OrderId { get; init; }
}

/// <summary>
/// Sipariş numarası ile sipariş getir
/// </summary>
public record GetOrderByNumberQuery : IRequest<Result<OrderDto?>>
{
    public string OrderNumber { get; init; } = string.Empty;
}

/// <summary>
/// Tenant için tüm siparişleri getir
/// </summary>
public record GetTenantOrdersQuery : IRequest<Result<List<OrderDto>>>
{
    public Guid TenantId { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetOrderQueryHandler : IRequestHandler<GetOrderQuery, Result<OrderDto?>>
{
    private readonly IMasterDbContext _context;

    public GetOrderQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<OrderDto?>> Handle(GetOrderQuery request, CancellationToken cancellationToken)
    {
        var order = await _context.SubscriptionOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order == null)
        {
            return Result<OrderDto?>.Success(null);
        }

        return Result<OrderDto?>.Success(CartMapper.MapToDto(order));
    }
}

public class GetOrderByNumberQueryHandler : IRequestHandler<GetOrderByNumberQuery, Result<OrderDto?>>
{
    private readonly IMasterDbContext _context;

    public GetOrderByNumberQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<OrderDto?>> Handle(GetOrderByNumberQuery request, CancellationToken cancellationToken)
    {
        var order = await _context.SubscriptionOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == request.OrderNumber, cancellationToken);

        if (order == null)
        {
            return Result<OrderDto?>.Success(null);
        }

        return Result<OrderDto?>.Success(CartMapper.MapToDto(order));
    }
}

public class GetTenantOrdersQueryHandler : IRequestHandler<GetTenantOrdersQuery, Result<List<OrderDto>>>
{
    private readonly IMasterDbContext _context;

    public GetTenantOrdersQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<OrderDto>>> Handle(GetTenantOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await _context.SubscriptionOrders
            .Include(o => o.Items)
            .Where(o => o.TenantId == request.TenantId)
            .OrderByDescending(o => o.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = orders.Select(CartMapper.MapToDto).ToList();

        return Result<List<OrderDto>>.Success(dtos);
    }
}
