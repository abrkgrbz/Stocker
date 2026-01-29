using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Cart;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Cart.Commands.UpdateItemQuantity;

/// <summary>
/// Sepetteki bir öğenin miktarını güncelle
/// </summary>
public record UpdateItemQuantityCommand : IRequest<Result<CartDto>>
{
    public Guid TenantId { get; init; }
    public Guid ItemId { get; init; }
    public int Quantity { get; init; }
}

public class UpdateItemQuantityCommandHandler : IRequestHandler<UpdateItemQuantityCommand, Result<CartDto>>
{
    private readonly IMasterDbContext _context;

    public UpdateItemQuantityCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CartDto>> Handle(UpdateItemQuantityCommand request, CancellationToken cancellationToken)
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
            cart.UpdateItemQuantity(request.ItemId, request.Quantity);
            await _context.SaveChangesAsync(cancellationToken);

            return Result<CartDto>.Success(CartMapper.MapToDto(cart));
        }
        catch (InvalidOperationException ex)
        {
            return Result<CartDto>.Failure(Error.Failure("Sepet.MiktarGuncellenemedi", ex.Message));
        }
        catch (ArgumentException ex)
        {
            return Result<CartDto>.Failure(Error.Validation("Sepet.GecersizMiktar", ex.Message));
        }
    }
}
