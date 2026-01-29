using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Cart;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Cart.Commands.RemoveItemFromCart;

/// <summary>
/// Sepetten bir öğeyi kaldır
/// </summary>
public record RemoveItemFromCartCommand : IRequest<Result<CartDto>>
{
    public Guid TenantId { get; init; }
    public Guid ItemId { get; init; }
}

public class RemoveItemFromCartCommandHandler : IRequestHandler<RemoveItemFromCartCommand, Result<CartDto>>
{
    private readonly IMasterDbContext _context;

    public RemoveItemFromCartCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CartDto>> Handle(RemoveItemFromCartCommand request, CancellationToken cancellationToken)
    {
        var cart = await _context.SubscriptionCarts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c =>
                c.TenantId == request.TenantId &&
                c.Status == CartStatus.Active,
                cancellationToken);

        if (cart == null)
        {
            return Result<CartDto>.Failure(Error.NotFound("Sepet.Bulunamadi", "Aktif sepet bulunamadı."));
        }

        try
        {
            cart.RemoveItem(request.ItemId);
            await _context.SaveChangesAsync(cancellationToken);

            return Result<CartDto>.Success(CartMapper.MapToDto(cart));
        }
        catch (InvalidOperationException ex)
        {
            return Result<CartDto>.Failure(Error.Failure("Sepet.OgeKaldirilamadi", ex.Message));
        }
    }
}
