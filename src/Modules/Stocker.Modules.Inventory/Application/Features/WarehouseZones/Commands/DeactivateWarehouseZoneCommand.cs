using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.WarehouseZones.Commands;

/// <summary>
/// Command to deactivate a warehouse zone
/// </summary>
public class DeactivateWarehouseZoneCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Validator for DeactivateWarehouseZoneCommand
/// </summary>
public class DeactivateWarehouseZoneCommandValidator : AbstractValidator<DeactivateWarehouseZoneCommand>
{
    public DeactivateWarehouseZoneCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Bölge ID'si geçerli olmalıdır");
    }
}

/// <summary>
/// Handler for DeactivateWarehouseZoneCommand
/// </summary>
public class DeactivateWarehouseZoneCommandHandler : IRequestHandler<DeactivateWarehouseZoneCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeactivateWarehouseZoneCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeactivateWarehouseZoneCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.WarehouseZones.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<bool>.Failure(new Error("WarehouseZone.NotFound", $"Depo bölgesi bulunamadı (ID: {request.Id})", ErrorType.NotFound));
        }

        if (!entity.IsActive)
        {
            return Result<bool>.Failure(new Error("WarehouseZone.AlreadyInactive", "Depo bölgesi zaten pasif durumda", ErrorType.Validation));
        }

        // Check if zone has active locations
        if (entity.Locations != null && entity.Locations.Any(l => l.IsActive))
        {
            return Result<bool>.Failure(new Error("WarehouseZone.HasActiveLocations", "Aktif konumları olan bölge pasifleştirilemez. Önce konumları pasifleştirin.", ErrorType.Validation));
        }

        entity.Deactivate();
        await _unitOfWork.WarehouseZones.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
