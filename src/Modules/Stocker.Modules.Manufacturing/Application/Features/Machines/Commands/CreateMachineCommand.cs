using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.Machines.Commands;

public record CreateMachineCommand(CreateMachineRequest Request) : IRequest<MachineDto>;

public class CreateMachineCommandValidator : AbstractValidator<CreateMachineCommand>
{
    public CreateMachineCommandValidator()
    {
        RuleFor(x => x.Request.Code)
            .NotEmpty().WithMessage("Makine kodu zorunludur.")
            .MinimumLength(2).WithMessage("Makine kodu en az 2 karakter olmalıdır.")
            .MaximumLength(20).WithMessage("Makine kodu en fazla 20 karakter olabilir.");

        RuleFor(x => x.Request.Name)
            .NotEmpty().WithMessage("Makine adı zorunludur.")
            .MinimumLength(2).WithMessage("Makine adı en az 2 karakter olmalıdır.")
            .MaximumLength(100).WithMessage("Makine adı en fazla 100 karakter olabilir.");

        RuleFor(x => x.Request.WorkCenterId)
            .GreaterThan(0).WithMessage("İş merkezi ID geçerli olmalıdır.");

        RuleFor(x => x.Request.HourlyCapacity)
            .GreaterThan(0).WithMessage("Saatlik kapasite sıfırdan büyük olmalıdır.");

        RuleFor(x => x.Request.EfficiencyRate)
            .InclusiveBetween(0, 100).WithMessage("Verimlilik oranı 0-100 arasında olmalıdır.");

        RuleFor(x => x.Request.HourlyCost)
            .GreaterThanOrEqualTo(0).WithMessage("Saatlik maliyet negatif olamaz.");
    }
}

public class CreateMachineCommandHandler : IRequestHandler<CreateMachineCommand, MachineDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CreateMachineCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MachineDto> Handle(CreateMachineCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        // Check if code already exists
        if (await _unitOfWork.Machines.ExistsAsync(tenantId, request.Code, cancellationToken))
            throw new InvalidOperationException($"'{request.Code}' kodlu makine zaten mevcut.");

        // Verify work center exists
        var workCenter = await _unitOfWork.WorkCenters.GetByIdAsync(request.WorkCenterId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{request.WorkCenterId}' olan iş merkezi bulunamadı.");

        // Verify tenant access
        if (workCenter.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu iş merkezine erişim yetkiniz bulunmamaktadır.");

        var machine = new Machine(request.Code, request.Name, request.WorkCenterId);

        // Set technical info
        machine.SetTechnicalInfo(
            request.Manufacturer,
            request.Model,
            request.SerialNumber,
            request.PurchaseDate,
            request.InstallationDate,
            request.WarrantyExpiryDate);

        // Set capacity
        machine.SetCapacity(request.HourlyCapacity, request.EfficiencyRate, request.PowerConsumptionKw);

        // Set costs
        machine.SetCosts(request.HourlyCost, request.SetupCost, request.MaintenanceCostPerHour);

        // Set maintenance schedule
        if (request.MaintenanceIntervalDays.HasValue)
        {
            var nextMaintenance = DateTime.UtcNow.AddDays(request.MaintenanceIntervalDays.Value);
            machine.SetMaintenanceSchedule(request.MaintenanceIntervalDays.Value, nextMaintenance);
        }

        await _unitOfWork.Machines.AddAsync(machine, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(machine);
    }

    private static MachineDto MapToDto(Machine entity) => new(
        entity.Id,
        entity.WorkCenterId,
        null,
        null,
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
