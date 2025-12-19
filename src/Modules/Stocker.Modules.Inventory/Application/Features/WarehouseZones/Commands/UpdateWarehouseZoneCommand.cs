using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.WarehouseZones.Commands;

/// <summary>
/// Command to update an existing warehouse zone
/// </summary>
public class UpdateWarehouseZoneCommand : IRequest<Result<WarehouseZoneDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateWarehouseZoneDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateWarehouseZoneCommand
/// </summary>
public class UpdateWarehouseZoneCommandValidator : AbstractValidator<UpdateWarehouseZoneCommand>
{
    public UpdateWarehouseZoneCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Data.Description).MaximumLength(500);
        RuleFor(x => x.Data.HazardClass).MaximumLength(50);
        RuleFor(x => x.Data.UnNumber).MaximumLength(50);
    }
}

/// <summary>
/// Handler for UpdateWarehouseZoneCommand
/// </summary>
public class UpdateWarehouseZoneCommandHandler : IRequestHandler<UpdateWarehouseZoneCommand, Result<WarehouseZoneDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public UpdateWarehouseZoneCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<WarehouseZoneDto>> Handle(UpdateWarehouseZoneCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.WarehouseZones.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<WarehouseZoneDto>.Failure(new Error("WarehouseZone.NotFound", $"Warehouse zone with ID {request.Id} not found", ErrorType.NotFound));
        }

        var data = request.Data;

        entity.SetDescription(data.Description);
        entity.SetPriority(data.Priority);
        entity.SetTemperatureControl(data.MinTemperature, data.MaxTemperature, data.TargetTemperature, data.RequiresTemperatureMonitoring);
        entity.SetHumidityControl(data.MinHumidity, data.MaxHumidity);
        entity.SetHazardInfo(data.IsHazardous, data.HazardClass, data.UnNumber);
        entity.SetAccessControl(data.RequiresSpecialAccess, data.AccessLevel);
        entity.SetCapacity(data.TotalArea, data.UsableArea, data.MaxPalletCapacity, data.MaxHeight);
        entity.SetOperationFlags(data.IsDefaultPickingZone, data.IsDefaultPutawayZone, data.IsQuarantineZone, data.IsReturnsZone);

        if (data.IsActive)
            entity.Activate();
        else
            entity.Deactivate();

        await _unitOfWork.WarehouseZones.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new WarehouseZoneDto
        {
            Id = entity.Id,
            WarehouseId = entity.WarehouseId,
            Code = entity.Code,
            Name = entity.Name,
            Description = entity.Description,
            ZoneType = entity.ZoneType.ToString(),
            IsActive = entity.IsActive,
            IsTemperatureControlled = entity.IsTemperatureControlled,
            MinTemperature = entity.MinTemperature,
            MaxTemperature = entity.MaxTemperature,
            TargetTemperature = entity.TargetTemperature,
            RequiresTemperatureMonitoring = entity.RequiresTemperatureMonitoring,
            IsHumidityControlled = entity.IsHumidityControlled,
            MinHumidity = entity.MinHumidity,
            MaxHumidity = entity.MaxHumidity,
            IsHazardous = entity.IsHazardous,
            HazardClass = entity.HazardClass,
            UnNumber = entity.UnNumber,
            RequiresSpecialAccess = entity.RequiresSpecialAccess,
            AccessLevel = entity.AccessLevel,
            TotalArea = entity.TotalArea,
            UsableArea = entity.UsableArea,
            MaxPalletCapacity = entity.MaxPalletCapacity,
            MaxHeight = entity.MaxHeight,
            MaxWeightPerArea = entity.MaxWeightPerArea,
            Priority = entity.Priority,
            IsDefaultPickingZone = entity.IsDefaultPickingZone,
            IsDefaultPutawayZone = entity.IsDefaultPutawayZone,
            IsQuarantineZone = entity.IsQuarantineZone,
            IsReturnsZone = entity.IsReturnsZone,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<WarehouseZoneDto>.Success(dto);
    }
}
