using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Cart;
using Stocker.Application.Features.Cart;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Cart.Queries.GetOrder;

/// <summary>
/// Sipariş detaylarını getir
/// </summary>
public record GetOrderQuery : IRequest<Result<OrderDto>>
{
    public Guid OrderId { get; init; }
    public Guid TenantId { get; init; }
}

public class GetOrderQueryHandler : IRequestHandler<GetOrderQuery, Result<OrderDto>>
{
    private readonly IMasterDbContext _context;

    public GetOrderQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<OrderDto>> Handle(GetOrderQuery request, CancellationToken cancellationToken)
    {
        var order = await _context.SubscriptionOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o =>
                o.Id == request.OrderId &&
                o.TenantId == request.TenantId,
                cancellationToken);

        if (order == null)
        {
            return Result<OrderDto>.Failure(Error.NotFound("Siparis.Bulunamadi", "Sipariş bulunamadı."));
        }

        return Result<OrderDto>.Success(CartMapper.MapToDto(order));
    }
}
