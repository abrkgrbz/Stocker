using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Units.Commands;

/// <summary>
/// Command to deactivate a unit
/// </summary>
public class DeactivateUnitCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int UnitId { get; set; }
}

/// <summary>
/// Handler for DeactivateUnitCommand
/// </summary>
public class DeactivateUnitCommandHandler : IRequestHandler<DeactivateUnitCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeactivateUnitCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeactivateUnitCommand request, CancellationToken cancellationToken)
    {
        var unit = await _unitOfWork.Units.GetByIdAsync(request.UnitId, cancellationToken);

        if (unit == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Unit", $"Birim bulunamadı (ID: {request.UnitId})"));
        }

        // Verify tenant ownership
        if (unit.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(
                Error.NotFound("Unit", $"Birim bulunamadı (ID: {request.UnitId})"));
        }

        // Check if unit has active products
        if (unit.Products != null && unit.Products.Any(p => p.IsActive))
        {
            return Result<bool>.Failure(
                Error.Validation("Unit.HasActiveProducts", "Aktif ürünleri olan birim pasife alınamaz. Önce ürünlerin birimini değiştirin veya ürünleri pasife alın."));
        }

        unit.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
