using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.WarehouseZones.Commands;

/// <summary>
/// Command to activate a warehouse zone
/// </summary>
public class ActivateWarehouseZoneCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Validator for ActivateWarehouseZoneCommand
/// </summary>
public class ActivateWarehouseZoneCommandValidator : AbstractValidator<ActivateWarehouseZoneCommand>
{
    public ActivateWarehouseZoneCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Bölge ID'si geçerli olmalıdır");
    }
}

/// <summary>
/// Handler for ActivateWarehouseZoneCommand
/// </summary>
public class ActivateWarehouseZoneCommandHandler : IRequestHandler<ActivateWarehouseZoneCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ActivateWarehouseZoneCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ActivateWarehouseZoneCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.WarehouseZones.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<bool>.Failure(new Error("WarehouseZone.NotFound", $"Depo bölgesi bulunamadı (ID: {request.Id})", ErrorType.NotFound));
        }

        if (entity.IsActive)
        {
            return Result<bool>.Failure(new Error("WarehouseZone.AlreadyActive", "Depo bölgesi zaten aktif durumda", ErrorType.Validation));
        }

        // Check if parent warehouse is active
        var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(entity.WarehouseId, cancellationToken);
        if (warehouse != null && !warehouse.IsActive)
        {
            return Result<bool>.Failure(new Error("WarehouseZone.WarehouseInactive", "Bağlı olduğu depo pasif durumda. Önce depoyu aktifleştirin.", ErrorType.Validation));
        }

        entity.Activate();
        await _unitOfWork.WarehouseZones.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
