using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.Machines.Commands;

public record UpdateMachineCommand(int Id, UpdateMachineRequest Request) : IRequest<MachineDto>;

public class UpdateMachineCommandValidator : AbstractValidator<UpdateMachineCommand>
{
    public UpdateMachineCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir ID gereklidir.");

        RuleFor(x => x.Request.Name)
            .NotEmpty().WithMessage("Makine adı zorunludur.")
            .MaximumLength(100).WithMessage("Makine adı en fazla 100 karakter olabilir.");

        RuleFor(x => x.Request.HourlyCapacity)
            .GreaterThan(0).WithMessage("Saatlik kapasite sıfırdan büyük olmalıdır.");

        RuleFor(x => x.Request.EfficiencyRate)
            .InclusiveBetween(0, 100).WithMessage("Verimlilik oranı 0-100 arasında olmalıdır.");
    }
}

public class UpdateMachineCommandHandler : IRequestHandler<UpdateMachineCommand, MachineDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateMachineCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MachineDto> Handle(UpdateMachineCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var machine = await _unitOfWork.Machines.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan makine bulunamadı.");

        machine.Update(request.Name, request.Description);
        machine.SetTechnicalInfo(
            request.Manufacturer,
            request.Model,
            request.SerialNumber,
            machine.PurchaseDate,
            machine.InstallationDate,
            machine.WarrantyExpiryDate);
        machine.SetCapacity(request.HourlyCapacity, request.EfficiencyRate, request.PowerConsumptionKw);
        machine.SetCosts(request.HourlyCost, request.SetupCost, request.MaintenanceCostPerHour);

        if (request.MaintenanceIntervalDays.HasValue)
        {
            var nextMaintenance = machine.LastMaintenanceDate?.AddDays(request.MaintenanceIntervalDays.Value)
                ?? DateTime.UtcNow.AddDays(request.MaintenanceIntervalDays.Value);
            machine.SetMaintenanceSchedule(request.MaintenanceIntervalDays.Value, nextMaintenance);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(machine);
    }

    private static MachineDto MapToDto(Machine entity) => new(
        entity.Id,
        entity.WorkCenterId,
        entity.WorkCenter?.Code,
        entity.WorkCenter?.Name,
        entity.Code,
        entity.Name,
        entity.Description,
        entity.Status.ToString(),
        entity.Manufacturer,
        entity.Model,
        entity.SerialNumber,
        entity.HourlyCapacity,
        entity.EfficiencyRate,
        entity.HourlyCost,
        entity.SetupCost,
        entity.MaintenanceCostPerHour,
        entity.PowerConsumptionKw,
        entity.AvailabilityRate,
        entity.PerformanceRate,
        entity.QualityRate,
        entity.CalculateOee(),
        entity.TotalOperatingHours,
        entity.PurchaseDate,
        entity.InstallationDate,
        entity.WarrantyExpiryDate,
        entity.LastMaintenanceDate,
        entity.NextMaintenanceDate,
        entity.MaintenanceIntervalDays,
        entity.DisplayOrder,
        entity.IsActive,
        entity.CreatedDate);
}

public record UpdateMachineStatusCommand(int Id, UpdateMachineStatusRequest Request) : IRequest;

public class UpdateMachineStatusCommandHandler : IRequestHandler<UpdateMachineStatusCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateMachineStatusCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateMachineStatusCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var machine = await _unitOfWork.Machines.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan makine bulunamadı.");

        var newStatus = Enum.Parse<MachineStatus>(command.Request.Status, true);
        machine.ChangeStatus(newStatus);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record RecordMachineOEECommand(int Id, RecordMachineOEERequest Request) : IRequest;

public class RecordMachineOEECommandHandler : IRequestHandler<RecordMachineOEECommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public RecordMachineOEECommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(RecordMachineOEECommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var machine = await _unitOfWork.Machines.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan makine bulunamadı.");

        machine.UpdateOeeMetrics(
            command.Request.AvailabilityRate,
            command.Request.PerformanceRate,
            command.Request.QualityRate);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record RecordMaintenanceCommand(int Id, RecordMaintenanceRequest Request) : IRequest;

public class RecordMaintenanceCommandHandler : IRequestHandler<RecordMaintenanceCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public RecordMaintenanceCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(RecordMaintenanceCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var machine = await _unitOfWork.Machines.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan makine bulunamadı.");

        machine.RecordMaintenance(command.Request.MaintenanceDate);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record DeleteMachineCommand(int Id) : IRequest;

public class DeleteMachineCommandHandler : IRequestHandler<DeleteMachineCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteMachineCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteMachineCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var machine = await _unitOfWork.Machines.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan makine bulunamadı.");

        if (machine.Status == MachineStatus.Çalışıyor)
            throw new InvalidOperationException("Çalışır durumdaki makine silinemez.");

        await _unitOfWork.Machines.DeleteAsync(machine, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
