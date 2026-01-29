using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Cart;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Cart.Commands.ClearCart;

/// <summary>
/// Sepetteki tüm öğeleri temizle
/// </summary>
public record ClearCartCommand : IRequest<Result<CartDto>>
{
    public Guid TenantId { get; init; }
}

public class ClearCartCommandHandler : IRequestHandler<ClearCartCommand, Result<CartDto>>
{
    private readonly IMasterDbContext _context;

    public ClearCartCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CartDto>> Handle(ClearCartCommand request, CancellationToken cancellationToken)
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
            cart.Clear();
            await _context.SaveChangesAsync(cancellationToken);

            return Result<CartDto>.Success(CartMapper.MapToDto(cart));
        }
        catch (InvalidOperationException ex)
        {
            return Result<CartDto>.Failure(Error.Failure("Sepet.TemizlenemeBulunamadiFailed", ex.Message));
        }
    }
}
