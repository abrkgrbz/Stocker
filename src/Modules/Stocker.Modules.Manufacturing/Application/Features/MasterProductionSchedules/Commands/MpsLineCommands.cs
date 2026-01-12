using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.MasterProductionSchedules.Commands;

public record AddMpsLineCommand(int ScheduleId, AddMpsLineRequest Request) : IRequest<MpsLineDto>;

public class AddMpsLineCommandHandler : IRequestHandler<AddMpsLineCommand, MpsLineDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public AddMpsLineCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MpsLineDto> Handle(AddMpsLineCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var schedule = await _unitOfWork.MasterProductionSchedules.GetWithLinesAsync(command.ScheduleId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.ScheduleId}' olan MPS bulunamadı.");

        if (schedule.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu MPS'e erişim yetkiniz yok.");

        var line = schedule.AddLine(
            request.ProductId,
            request.PeriodDate,
            request.ForecastQuantity,
            request.CustomerOrderQuantity,
            request.PlannedProductionQuantity);

        line.SetInventoryLevels(request.BeginningInventory, request.SafetyStock);

        if (!string.IsNullOrEmpty(request.Notes))
            line.SetNotes(request.Notes);

        _unitOfWork.MasterProductionSchedules.Update(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(line);
    }

    private static MpsLineDto MapToDto(MpsLine entity) => new(
        entity.Id,
        entity.MpsId,
        entity.ProductId,
        null, null, // ProductCode, ProductName
        entity.PeriodDate,
        entity.PeriodNumber,
        entity.ForecastQuantity,
        entity.CustomerOrderQuantity,
        entity.DependentDemand,
        entity.PlannedProductionQuantity,
        entity.ProjectedAvailableBalance,
        entity.AvailableToPromise,
        entity.BeginningInventory,
        entity.SafetyStock,
        entity.ActualProductionQuantity,
        entity.ActualSalesQuantity,
        entity.Notes);
}

public record UpdateMpsLineCommand(int ScheduleId, int LineId, UpdateMpsLineRequest Request) : IRequest<MpsLineDto>;

public class UpdateMpsLineCommandHandler : IRequestHandler<UpdateMpsLineCommand, MpsLineDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateMpsLineCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MpsLineDto> Handle(UpdateMpsLineCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var schedule = await _unitOfWork.MasterProductionSchedules.GetWithLinesAsync(command.ScheduleId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.ScheduleId}' olan MPS bulunamadı.");

        if (schedule.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu MPS'e erişim yetkiniz yok.");

        var line = schedule.Lines.FirstOrDefault(l => l.Id == command.LineId)
            ?? throw new KeyNotFoundException($"ID '{command.LineId}' olan MPS satırı bulunamadı.");

        // Check fence type
        var fenceType = schedule.GetFenceType(line.PeriodDate);
        if (fenceType == MpsFenceType.Frozen)
            throw new InvalidOperationException("Dondurulmuş dönemdeki satırlar güncellenemez.");

        line.UpdatePlannedProduction(request.PlannedProductionQuantity);
        line.SetInventoryLevels(request.BeginningInventory, request.SafetyStock);

        if (!string.IsNullOrEmpty(request.Notes))
            line.SetNotes(request.Notes);

        _unitOfWork.MasterProductionSchedules.Update(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(line);
    }

    private static MpsLineDto MapToDto(MpsLine entity) => new(
        entity.Id,
        entity.MpsId,
        entity.ProductId,
        null, null,
        entity.PeriodDate,
        entity.PeriodNumber,
        entity.ForecastQuantity,
        entity.CustomerOrderQuantity,
        entity.DependentDemand,
        entity.PlannedProductionQuantity,
        entity.ProjectedAvailableBalance,
        entity.AvailableToPromise,
        entity.BeginningInventory,
        entity.SafetyStock,
        entity.ActualProductionQuantity,
        entity.ActualSalesQuantity,
        entity.Notes);
}

public record RecordActualsCommand(int ScheduleId, int LineId, decimal ProductionQuantity, decimal SalesQuantity) : IRequest<MpsLineDto>;

public class RecordActualsCommandHandler : IRequestHandler<RecordActualsCommand, MpsLineDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public RecordActualsCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MpsLineDto> Handle(RecordActualsCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var schedule = await _unitOfWork.MasterProductionSchedules.GetWithLinesAsync(command.ScheduleId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.ScheduleId}' olan MPS bulunamadı.");

        if (schedule.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu MPS'e erişim yetkiniz yok.");

        var line = schedule.Lines.FirstOrDefault(l => l.Id == command.LineId)
            ?? throw new KeyNotFoundException($"ID '{command.LineId}' olan MPS satırı bulunamadı.");

        line.RecordActuals(command.ProductionQuantity, command.SalesQuantity);

        _unitOfWork.MasterProductionSchedules.Update(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(line);
    }

    private static MpsLineDto MapToDto(MpsLine entity) => new(
        entity.Id,
        entity.MpsId,
        entity.ProductId,
        null, null,
        entity.PeriodDate,
        entity.PeriodNumber,
        entity.ForecastQuantity,
        entity.CustomerOrderQuantity,
        entity.DependentDemand,
        entity.PlannedProductionQuantity,
        entity.ProjectedAvailableBalance,
        entity.AvailableToPromise,
        entity.BeginningInventory,
        entity.SafetyStock,
        entity.ActualProductionQuantity,
        entity.ActualSalesQuantity,
        entity.Notes);
}

public record DeleteMpsLineCommand(int ScheduleId, int LineId) : IRequest;

public class DeleteMpsLineCommandHandler : IRequestHandler<DeleteMpsLineCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteMpsLineCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteMpsLineCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var schedule = await _unitOfWork.MasterProductionSchedules.GetWithLinesAsync(command.ScheduleId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.ScheduleId}' olan MPS bulunamadı.");

        if (schedule.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu MPS'e erişim yetkiniz yok.");

        var line = schedule.Lines.FirstOrDefault(l => l.Id == command.LineId)
            ?? throw new KeyNotFoundException($"ID '{command.LineId}' olan MPS satırı bulunamadı.");

        // Check fence type
        var fenceType = schedule.GetFenceType(line.PeriodDate);
        if (fenceType == MpsFenceType.Frozen)
            throw new InvalidOperationException("Dondurulmuş dönemdeki satır silinemez.");

        // Remove from collection (EF will handle deletion via cascade)
        schedule.Lines.Remove(line);

        _unitOfWork.MasterProductionSchedules.Update(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
