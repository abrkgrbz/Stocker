using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Cart;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Cart.Queries.GetCart;

/// <summary>
/// Get the current active cart for a tenant
/// </summary>
public record GetCartQuery : IRequest<Result<CartDto?>>
{
    public Guid TenantId { get; init; }
}

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, Result<CartDto?>>
{
    private readonly IMasterDbContext _context;

    public GetCartQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CartDto?>> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        var cart = await _context.SubscriptionCarts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c =>
                c.TenantId == request.TenantId &&
                c.Status == CartStatus.Active,
                cancellationToken);

        if (cart == null)
        {
            return Result<CartDto?>.Success(null);
        }

        // Check if cart has expired
        if (cart.HasExpired)
        {
            cart.Expire();
            await _context.SaveChangesAsync(cancellationToken);
            return Result<CartDto?>.Success(null);
        }

        return Result<CartDto?>.Success(CartMapper.MapToDto(cart));
    }
}
