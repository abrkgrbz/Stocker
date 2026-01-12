using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.Maintenance.Commands;

#region Maintenance Plan Commands

public record CreateMaintenancePlanCommand(CreateMaintenancePlanRequest Request) : IRequest<MaintenancePlanDto>;

public record UpdateMaintenancePlanCommand(int Id, UpdateMaintenancePlanRequest Request) : IRequest;

public record ActivateMaintenancePlanCommand(int Id) : IRequest;

public record SuspendMaintenancePlanCommand(int Id) : IRequest;

public record ApproveMaintenancePlanCommand(int Id, string ApprovedBy) : IRequest;

public record DeleteMaintenancePlanCommand(int Id) : IRequest;

#endregion

#region Maintenance Task Commands

public record CreateMaintenanceTaskCommand(CreateMaintenanceTaskRequest Request) : IRequest<MaintenanceTaskDto>;

public record UpdateMaintenanceTaskCommand(int Id, UpdateMaintenanceTaskRequest Request) : IRequest;

public record DeleteMaintenanceTaskCommand(int Id) : IRequest;

public record ReorderMaintenanceTasksCommand(int PlanId, IReadOnlyList<int> TaskIds) : IRequest;

#endregion

#region Maintenance Record Commands

public record CreateMaintenanceRecordCommand(CreateMaintenanceRecordRequest Request) : IRequest<MaintenanceRecordDto>;

public record UpdateMaintenanceRecordCommand(int Id, UpdateMaintenanceRecordRequest Request) : IRequest;

public record StartMaintenanceRecordCommand(int Id, StartMaintenanceRecordRequest Request) : IRequest;

public record CompleteMaintenanceRecordCommand(int Id, CompleteMaintenanceRecordRequest Request) : IRequest;

public record ApproveMaintenanceRecordCommand(int Id, string ApprovedBy) : IRequest;

public record CancelMaintenanceRecordCommand(int Id) : IRequest;

public record CompleteMaintenanceRecordTaskCommand(int RecordTaskId, CompleteMaintenanceRecordTaskRequest Request) : IRequest;

public record AddMaintenanceRecordSparePartCommand(AddMaintenanceRecordSparePartRequest Request) : IRequest<MaintenanceRecordSparePartDto>;

#endregion

#region Spare Part Commands

public record CreateSparePartCommand(CreateSparePartRequest Request) : IRequest<SparePartDto>;

public record UpdateSparePartCommand(int Id, UpdateSparePartRequest Request) : IRequest;

public record ActivateSparePartCommand(int Id) : IRequest;

public record DeactivateSparePartCommand(int Id) : IRequest;

public record DeleteSparePartCommand(int Id) : IRequest;

#endregion

#region Machine Counter Commands

public record CreateMachineCounterCommand(CreateMachineCounterRequest Request) : IRequest<MachineCounterDto>;

public record UpdateMachineCounterValueCommand(int Id, UpdateMachineCounterValueRequest Request) : IRequest;

public record ResetMachineCounterCommand(int Id, ResetMachineCounterRequest Request) : IRequest;

#endregion

#region Plan Spare Part Commands

public record AddPlanSparePartCommand(AddMaintenancePlanSparePartRequest Request) : IRequest<MaintenancePlanSparePartDto>;

public record RemovePlanSparePartCommand(int Id) : IRequest;

#endregion

#region Command Handlers

public class CreateMaintenancePlanCommandHandler : IRequestHandler<CreateMaintenancePlanCommand, MaintenancePlanDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CreateMaintenancePlanCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MaintenancePlanDto> Handle(CreateMaintenancePlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        if (await _unitOfWork.MaintenancePlans.ExistsWithCodeAsync(tenantId, request.Code, cancellationToken: cancellationToken))
            throw new InvalidOperationException($"Bakım planı kodu '{request.Code}' zaten mevcut.");

        var plan = new MaintenancePlan(request.Code, request.Name, request.MaintenanceType, request.TriggerType);
        plan.SetTenantId(tenantId);
        plan.Update(request.Name, request.Description);
        plan.SetTarget(request.MachineId, request.WorkCenterId);
        plan.SetPriority(request.Priority);
        plan.SetFrequency(request.FrequencyValue, request.FrequencyUnit, request.TriggerMeterValue);
        plan.SetWarningThreshold(request.WarningThreshold);
        plan.SetEffectiveDates(request.EffectiveFrom, request.EffectiveTo);
        plan.SetEstimates(request.EstimatedDurationHours, request.EstimatedLaborCost, request.EstimatedMaterialCost);
        plan.SetInstructions(request.Instructions, request.SafetyNotes);

        await _unitOfWork.MaintenancePlans.AddAsync(plan, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new MaintenancePlanDto(
            plan.Id, plan.Code, plan.Name, plan.Description,
            plan.MachineId, null, plan.WorkCenterId, null,
            plan.MaintenanceType, plan.Priority, plan.Status, plan.TriggerType,
            plan.FrequencyValue, plan.FrequencyUnit, plan.TriggerMeterValue, plan.WarningThreshold,
            plan.EffectiveFrom, plan.EffectiveTo, plan.LastExecutionDate, plan.NextScheduledDate,
            plan.EstimatedDurationHours, plan.EstimatedLaborCost, plan.EstimatedMaterialCost, plan.GetTotalEstimatedCost(),
            plan.Instructions, plan.SafetyNotes, plan.IsActive, plan.ApprovedByUser, plan.ApprovedDate,
            new List<MaintenanceTaskDto>(), new List<MaintenancePlanSparePartDto>()
        );
    }
}

public class UpdateMaintenancePlanCommandHandler : IRequestHandler<UpdateMaintenancePlanCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateMaintenancePlanCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateMaintenancePlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var plan = await _unitOfWork.MaintenancePlans.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Bakım planı bulunamadı: {command.Id}");

        var request = command.Request;
        plan.Update(request.Name, request.Description);
        plan.SetTarget(request.MachineId, request.WorkCenterId);
        plan.SetPriority(request.Priority);
        plan.SetFrequency(request.FrequencyValue, request.FrequencyUnit, request.TriggerMeterValue);
        plan.SetWarningThreshold(request.WarningThreshold);
        plan.SetEffectiveDates(request.EffectiveFrom, request.EffectiveTo);
        plan.SetEstimates(request.EstimatedDurationHours, request.EstimatedLaborCost, request.EstimatedMaterialCost);
        plan.SetInstructions(request.Instructions, request.SafetyNotes);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class ActivateMaintenancePlanCommandHandler : IRequestHandler<ActivateMaintenancePlanCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public ActivateMaintenancePlanCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ActivateMaintenancePlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var plan = await _unitOfWork.MaintenancePlans.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Bakım planı bulunamadı: {command.Id}");

        plan.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class SuspendMaintenancePlanCommandHandler : IRequestHandler<SuspendMaintenancePlanCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public SuspendMaintenancePlanCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(SuspendMaintenancePlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var plan = await _unitOfWork.MaintenancePlans.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Bakım planı bulunamadı: {command.Id}");

        plan.Suspend();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class ApproveMaintenancePlanCommandHandler : IRequestHandler<ApproveMaintenancePlanCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public ApproveMaintenancePlanCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ApproveMaintenancePlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var plan = await _unitOfWork.MaintenancePlans.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Bakım planı bulunamadı: {command.Id}");

        plan.Approve(command.ApprovedBy);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class DeleteMaintenancePlanCommandHandler : IRequestHandler<DeleteMaintenancePlanCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteMaintenancePlanCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteMaintenancePlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var plan = await _unitOfWork.MaintenancePlans.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Bakım planı bulunamadı: {command.Id}");

        await _unitOfWork.MaintenancePlans.DeleteAsync(plan, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class CreateMaintenanceTaskCommandHandler : IRequestHandler<CreateMaintenanceTaskCommand, MaintenanceTaskDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CreateMaintenanceTaskCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MaintenanceTaskDto> Handle(CreateMaintenanceTaskCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var plan = await _unitOfWork.MaintenancePlans.GetByIdAsync(tenantId, request.MaintenancePlanId, cancellationToken)
            ?? throw new InvalidOperationException($"Bakım planı bulunamadı: {request.MaintenancePlanId}");

        var maxSeq = await _unitOfWork.MaintenanceTasks.GetMaxSequenceAsync(tenantId, request.MaintenancePlanId, cancellationToken);
        var task = new MaintenanceTask(request.MaintenancePlanId, maxSeq + 1, request.TaskName);
        task.SetTenantId(tenantId);
        task.Update(request.TaskName, request.Description);
        task.SetDuration(request.EstimatedDurationMinutes);
        task.SetRequirements(request.RequiredSkills, request.RequiredTools);
        task.SetMandatory(request.IsMandatory);

        if (request.IsChecklistItem)
            task.SetAsChecklist(request.ChecklistCriteria, request.AcceptanceValue);

        await _unitOfWork.MaintenanceTasks.AddAsync(task, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new MaintenanceTaskDto(
            task.Id, task.MaintenancePlanId, task.SequenceNumber, task.TaskName, task.Description,
            task.Status, task.EstimatedDurationMinutes, task.RequiredSkills, task.RequiredTools,
            task.IsChecklistItem, task.ChecklistCriteria, task.AcceptanceValue, task.IsMandatory, task.IsActive
        );
    }
}

public class UpdateMaintenanceTaskCommandHandler : IRequestHandler<UpdateMaintenanceTaskCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateMaintenanceTaskCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateMaintenanceTaskCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var task = await _unitOfWork.MaintenanceTasks.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Bakım görevi bulunamadı: {command.Id}");

        var request = command.Request;
        task.Update(request.TaskName, request.Description);
        task.SetDuration(request.EstimatedDurationMinutes);
        task.SetRequirements(request.RequiredSkills, request.RequiredTools);
        task.SetMandatory(request.IsMandatory);

        if (request.IsChecklistItem)
            task.SetAsChecklist(request.ChecklistCriteria, request.AcceptanceValue);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class DeleteMaintenanceTaskCommandHandler : IRequestHandler<DeleteMaintenanceTaskCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteMaintenanceTaskCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteMaintenanceTaskCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var task = await _unitOfWork.MaintenanceTasks.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Bakım görevi bulunamadı: {command.Id}");

        await _unitOfWork.MaintenanceTasks.DeleteAsync(task, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class CreateMaintenanceRecordCommandHandler : IRequestHandler<CreateMaintenanceRecordCommand, MaintenanceRecordDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CreateMaintenanceRecordCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MaintenanceRecordDto> Handle(CreateMaintenanceRecordCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;
        var recordNumber = await _unitOfWork.MaintenanceRecords.GenerateRecordNumberAsync(tenantId, cancellationToken);

        var record = new MaintenanceRecord(recordNumber, request.MaintenanceType, request.ScheduledDate);
        record.SetTenantId(tenantId);
        record.SetPriority(request.Priority);

        if (request.MaintenancePlanId.HasValue)
        {
            record.SetPlan(request.MaintenancePlanId.Value);
            var plan = await _unitOfWork.MaintenancePlans.GetByIdWithDetailsAsync(tenantId, request.MaintenancePlanId.Value, cancellationToken);
            if (plan != null)
            {
                record.SetMachine(plan.MachineId ?? 0);
                record.SetWorkCenter(plan.WorkCenterId ?? 0);
            }
        }

        if (request.MachineId.HasValue)
            record.SetMachine(request.MachineId.Value);
        if (request.WorkCenterId.HasValue)
            record.SetWorkCenter(request.WorkCenterId.Value);

        if (!string.IsNullOrEmpty(request.FailureCode))
            record.SetFailureInfo(request.FailureCode, request.FailureDescription, null);

        await _unitOfWork.MaintenanceRecords.AddAsync(record, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new MaintenanceRecordDto(
            record.Id, record.RecordNumber, record.MaintenancePlanId, null,
            record.MachineId, null, record.WorkCenterId, null,
            record.MaintenanceType, record.Status, record.Priority,
            record.ScheduledDate, record.StartDate, record.EndDate, record.ActualDurationHours,
            record.FailureCode, record.FailureDescription, record.RootCause,
            record.WorkPerformed, record.PartsReplaced, record.TechnicianNotes,
            record.LaborCost, record.MaterialCost, record.ExternalServiceCost, record.GetTotalCost(),
            record.MeterReadingBefore, record.MeterReadingAfter,
            record.AssignedTechnician, record.PerformedBy, record.ApprovedBy, record.ApprovedDate,
            record.NextActionRecommendation, record.RecommendedNextDate,
            new List<MaintenanceRecordTaskDto>(), new List<MaintenanceRecordSparePartDto>()
        );
    }
}

public class StartMaintenanceRecordCommandHandler : IRequestHandler<StartMaintenanceRecordCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public StartMaintenanceRecordCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(StartMaintenanceRecordCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var record = await _unitOfWork.MaintenanceRecords.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Bakım kaydı bulunamadı: {command.Id}");

        var request = command.Request;
        record.Start(request.StartDate, request.AssignedTechnician);
        if (request.MeterReadingBefore.HasValue)
            record.SetMeterReadings(request.MeterReadingBefore, null);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class CompleteMaintenanceRecordCommandHandler : IRequestHandler<CompleteMaintenanceRecordCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CompleteMaintenanceRecordCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CompleteMaintenanceRecordCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var record = await _unitOfWork.MaintenanceRecords.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Bakım kaydı bulunamadı: {command.Id}");

        var request = command.Request;
        record.SetWorkDetails(request.WorkPerformed, request.PartsReplaced, request.TechnicianNotes);
        record.SetCosts(request.LaborCost, request.MaterialCost, request.ExternalServiceCost);
        record.SetMeterReadings(record.MeterReadingBefore, request.MeterReadingAfter);
        record.SetNextActionRecommendation(request.NextActionRecommendation, request.RecommendedNextDate);
        record.Complete(request.EndDate, request.PerformedBy);

        // Update plan execution date if linked
        if (record.MaintenancePlanId.HasValue)
        {
            var plan = await _unitOfWork.MaintenancePlans.GetByIdAsync(tenantId, record.MaintenancePlanId.Value, cancellationToken);
            if (plan != null)
            {
                plan.RecordExecution(request.EndDate);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class ApproveMaintenanceRecordCommandHandler : IRequestHandler<ApproveMaintenanceRecordCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public ApproveMaintenanceRecordCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ApproveMaintenanceRecordCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var record = await _unitOfWork.MaintenanceRecords.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Bakım kaydı bulunamadı: {command.Id}");

        record.Approve(command.ApprovedBy);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class CancelMaintenanceRecordCommandHandler : IRequestHandler<CancelMaintenanceRecordCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CancelMaintenanceRecordCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CancelMaintenanceRecordCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var record = await _unitOfWork.MaintenanceRecords.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Bakım kaydı bulunamadı: {command.Id}");

        record.Cancel();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class CreateSparePartCommandHandler : IRequestHandler<CreateSparePartCommand, SparePartDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CreateSparePartCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<SparePartDto> Handle(CreateSparePartCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        if (await _unitOfWork.SpareParts.ExistsWithCodeAsync(tenantId, request.Code, cancellationToken: cancellationToken))
            throw new InvalidOperationException($"Yedek parça kodu '{request.Code}' zaten mevcut.");

        var part = new SparePart(request.Code, request.Name);
        part.SetTenantId(tenantId);
        part.Update(request.Name, request.Description);
        part.SetCategory(request.Category, request.SubCategory);
        part.SetCriticality(request.Criticality);
        part.SetTechnicalInfo(request.PartNumber, request.Manufacturer, request.ManufacturerPartNo, request.AlternativePartNo);
        part.SetStockParameters(request.Unit, request.MinimumStock, request.ReorderPoint, request.ReorderQuantity, request.LeadTimeDays);
        part.SetCost(request.UnitCost);
        part.SetCompatibility(request.CompatibleMachines, request.CompatibleModels);
        part.SetShelfLife(request.ShelfLifeMonths, request.StorageConditions);
        part.SetInventoryLink(request.InventoryItemId);

        await _unitOfWork.SpareParts.AddAsync(part, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new SparePartDto(
            part.Id, part.Code, part.Name, part.Description, part.Category, part.SubCategory,
            part.Criticality, part.Status, part.PartNumber, part.Manufacturer, part.ManufacturerPartNo,
            part.AlternativePartNo, part.InventoryItemId, part.Unit, part.MinimumStock, part.ReorderPoint,
            part.ReorderQuantity, part.LeadTimeDays, part.UnitCost, part.LastPurchasePrice,
            part.CompatibleMachines, part.CompatibleModels, part.ShelfLifeMonths, part.StorageConditions, part.IsActive
        );
    }
}

public class UpdateSparePartCommandHandler : IRequestHandler<UpdateSparePartCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateSparePartCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateSparePartCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var part = await _unitOfWork.SpareParts.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Yedek parça bulunamadı: {command.Id}");

        var request = command.Request;
        part.Update(request.Name, request.Description);
        part.SetCategory(request.Category, request.SubCategory);
        part.SetCriticality(request.Criticality);
        part.SetTechnicalInfo(request.PartNumber, request.Manufacturer, request.ManufacturerPartNo, request.AlternativePartNo);
        part.SetStockParameters(request.Unit, request.MinimumStock, request.ReorderPoint, request.ReorderQuantity, request.LeadTimeDays);
        part.SetCost(request.UnitCost);
        part.SetCompatibility(request.CompatibleMachines, request.CompatibleModels);
        part.SetShelfLife(request.ShelfLifeMonths, request.StorageConditions);
        part.SetInventoryLink(request.InventoryItemId);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class ActivateSparePartCommandHandler : IRequestHandler<ActivateSparePartCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public ActivateSparePartCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ActivateSparePartCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var part = await _unitOfWork.SpareParts.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Yedek parça bulunamadı: {command.Id}");

        part.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class DeactivateSparePartCommandHandler : IRequestHandler<DeactivateSparePartCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeactivateSparePartCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeactivateSparePartCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var part = await _unitOfWork.SpareParts.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Yedek parça bulunamadı: {command.Id}");

        part.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class DeleteSparePartCommandHandler : IRequestHandler<DeleteSparePartCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteSparePartCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteSparePartCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var part = await _unitOfWork.SpareParts.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Yedek parça bulunamadı: {command.Id}");

        await _unitOfWork.SpareParts.DeleteAsync(part, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class CreateMachineCounterCommandHandler : IRequestHandler<CreateMachineCounterCommand, MachineCounterDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CreateMachineCounterCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MachineCounterDto> Handle(CreateMachineCounterCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var machine = await _unitOfWork.Machines.GetByIdAsync(tenantId, request.MachineId, cancellationToken)
            ?? throw new InvalidOperationException($"Makine bulunamadı: {request.MachineId}");

        var existing = await _unitOfWork.MachineCounters.GetByMachineAndNameAsync(tenantId, request.MachineId, request.CounterName, cancellationToken);
        if (existing != null)
            throw new InvalidOperationException($"Bu makine için '{request.CounterName}' sayacı zaten mevcut.");

        var counter = new MachineCounter(request.MachineId, request.CounterName, request.CounterUnit);
        counter.SetTenantId(tenantId);
        counter.UpdateValue(request.InitialValue);
        counter.SetThresholds(request.WarningThreshold, request.CriticalThreshold);

        await _unitOfWork.MachineCounters.AddAsync(counter, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new MachineCounterDto(
            counter.Id, counter.MachineId, machine.Name, counter.CounterName, counter.CounterUnit,
            counter.CurrentValue, counter.PreviousValue, counter.LastUpdated,
            counter.ResetValue, counter.LastResetDate,
            counter.WarningThreshold, counter.CriticalThreshold, counter.IsWarning(), counter.IsCritical()
        );
    }
}

public class UpdateMachineCounterValueCommandHandler : IRequestHandler<UpdateMachineCounterValueCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateMachineCounterValueCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateMachineCounterValueCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var counter = await _unitOfWork.MachineCounters.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Sayaç bulunamadı: {command.Id}");

        counter.UpdateValue(command.Request.NewValue);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public class ResetMachineCounterCommandHandler : IRequestHandler<ResetMachineCounterCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public ResetMachineCounterCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ResetMachineCounterCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var counter = await _unitOfWork.MachineCounters.GetByIdAsync(tenantId, command.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Sayaç bulunamadı: {command.Id}");

        counter.Reset(command.Request.ResetValue);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

#endregion
