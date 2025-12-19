using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.WarehouseZones.Commands;

/// <summary>
/// Command to create a new warehouse zone
/// </summary>
public class CreateWarehouseZoneCommand : IRequest<Result<WarehouseZoneDto>>
{
    public Guid TenantId { get; set; }
    public CreateWarehouseZoneDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for CreateWarehouseZoneCommand
/// </summary>
public class CreateWarehouseZoneCommandValidator : AbstractValidator<CreateWarehouseZoneCommand>
{
    public CreateWarehouseZoneCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.WarehouseId).GreaterThan(0);
        RuleFor(x => x.Data.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Data.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Data.ZoneType).NotEmpty();
        RuleFor(x => x.Data.Description).MaximumLength(500);
        RuleFor(x => x.Data.HazardClass).MaximumLength(50);
        RuleFor(x => x.Data.UnNumber).MaximumLength(50);
    }
}

/// <summary>
/// Handler for CreateWarehouseZoneCommand
/// </summary>
public class CreateWarehouseZoneCommandHandler : IRequestHandler<CreateWarehouseZoneCommand, Result<WarehouseZoneDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateWarehouseZoneCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<WarehouseZoneDto>> Handle(CreateWarehouseZoneCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        // Check if code already exists in warehouse
        var existingZone = await _unitOfWork.WarehouseZones.GetByCodeAsync(data.WarehouseId, data.Code, cancellationToken);
        if (existingZone != null)
        {
            return Result<WarehouseZoneDto>.Failure(new Error("WarehouseZone.DuplicateCode", $"Zone with code '{data.Code}' already exists in this warehouse", ErrorType.Conflict));
        }

        var zoneType = Enum.Parse<ZoneType>(data.ZoneType);
        var entity = new WarehouseZone(data.WarehouseId, data.Code, data.Name, zoneType);

        entity.SetTenantId(request.TenantId);
        entity.SetDescription(data.Description);
        entity.SetPriority(data.Priority);
        entity.SetTemperatureControl(data.MinTemperature, data.MaxTemperature, data.TargetTemperature, data.RequiresTemperatureMonitoring);
        entity.SetHumidityControl(data.MinHumidity, data.MaxHumidity);
        entity.SetHazardInfo(data.IsHazardous, data.HazardClass, data.UnNumber);
        entity.SetAccessControl(data.RequiresSpecialAccess, data.AccessLevel);
        entity.SetCapacity(data.TotalArea, data.UsableArea, data.MaxPalletCapacity, data.MaxHeight);
        entity.SetOperationFlags(data.IsDefaultPickingZone, data.IsDefaultPutawayZone, data.IsQuarantineZone, data.IsReturnsZone);

        await _unitOfWork.WarehouseZones.AddAsync(entity, cancellationToken);
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
            CreatedAt = entity.CreatedDate
        };

        return Result<WarehouseZoneDto>.Success(dto);
    }
}
