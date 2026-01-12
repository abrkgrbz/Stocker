using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.Maintenance.Queries;

#region Maintenance Plan Queries

public record GetMaintenancePlansQuery : IRequest<IReadOnlyList<MaintenancePlanListDto>>;

public record GetMaintenancePlanByIdQuery(int Id) : IRequest<MaintenancePlanDto?>;

public record GetMaintenancePlanByCodeQuery(string Code) : IRequest<MaintenancePlanDto?>;

public record GetActivePlansQuery : IRequest<IReadOnlyList<MaintenancePlanListDto>>;

public record GetDuePlansQuery(DateTime AsOfDate) : IRequest<IReadOnlyList<MaintenancePlanListDto>>;

public record GetOverduePlansQuery(DateTime AsOfDate) : IRequest<IReadOnlyList<MaintenancePlanListDto>>;

public record GetUpcomingPlansQuery(DateTime StartDate, DateTime EndDate) : IRequest<IReadOnlyList<MaintenancePlanListDto>>;

public record GetPlansByMachineQuery(int MachineId) : IRequest<IReadOnlyList<MaintenancePlanListDto>>;

public record GetPlansByTypeQuery(MaintenanceType MaintenanceType) : IRequest<IReadOnlyList<MaintenancePlanListDto>>;

#endregion

#region Maintenance Record Queries

public record GetMaintenanceRecordsQuery(MaintenanceRecordStatus? Status = null, DateTime? StartDate = null, DateTime? EndDate = null) : IRequest<IReadOnlyList<MaintenanceRecordListDto>>;

public record GetMaintenanceRecordByIdQuery(int Id) : IRequest<MaintenanceRecordDto?>;

public record GetMaintenanceRecordByNumberQuery(string RecordNumber) : IRequest<MaintenanceRecordDto?>;

public record GetPendingRecordsQuery : IRequest<IReadOnlyList<MaintenanceRecordListDto>>;

public record GetRecordsByMachineQuery(int MachineId, DateTime? StartDate = null, DateTime? EndDate = null) : IRequest<IReadOnlyList<MaintenanceRecordListDto>>;

public record GetRecordsByTypeQuery(MaintenanceType MaintenanceType, DateTime? StartDate = null, DateTime? EndDate = null) : IRequest<IReadOnlyList<MaintenanceRecordListDto>>;

#endregion

#region Spare Part Queries

public record GetSparePartsQuery : IRequest<IReadOnlyList<SparePartListDto>>;

public record GetSparePartByIdQuery(int Id) : IRequest<SparePartDto?>;

public record GetSparePartByCodeQuery(string Code) : IRequest<SparePartDto?>;

public record GetSparePartsByCategoryQuery(string Category) : IRequest<IReadOnlyList<SparePartListDto>>;

public record GetSparePartsByCriticalityQuery(SparePartCriticality Criticality) : IRequest<IReadOnlyList<SparePartListDto>>;

public record SearchSparePartsQuery(string SearchTerm) : IRequest<IReadOnlyList<SparePartListDto>>;

public record GetCompatibleSparePartsQuery(int MachineId) : IRequest<IReadOnlyList<SparePartListDto>>;

#endregion

#region Machine Counter Queries

public record GetMachineCountersQuery(int MachineId) : IRequest<IReadOnlyList<MachineCounterListDto>>;

public record GetMachineCounterByIdQuery(int Id) : IRequest<MachineCounterDto?>;

public record GetCountersNeedingMaintenanceQuery : IRequest<IReadOnlyList<MachineCounterListDto>>;

public record GetCriticalCountersQuery : IRequest<IReadOnlyList<MachineCounterListDto>>;

#endregion

#region Dashboard Queries

public record GetMaintenanceDashboardQuery : IRequest<MaintenanceDashboardDto>;

public record GetMaintenanceSummaryQuery(DateTime PeriodStart, DateTime PeriodEnd) : IRequest<MaintenanceSummaryDto>;

#endregion

#region Query Handlers

public class GetMaintenancePlansQueryHandler : IRequestHandler<GetMaintenancePlansQuery, IReadOnlyList<MaintenancePlanListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMaintenancePlansQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaintenancePlanListDto>> Handle(GetMaintenancePlansQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var plans = await _unitOfWork.MaintenancePlans.GetAllAsync(tenantId, cancellationToken);
        return plans.Select(p => new MaintenancePlanListDto(
            p.Id, p.Code, p.Name, p.MachineId, p.Machine?.Name, p.WorkCenterId, p.WorkCenter?.Name,
            p.MaintenanceType, p.Priority, p.Status, p.NextScheduledDate, p.GetTotalEstimatedCost(), p.IsActive
        )).ToList();
    }
}

public class GetMaintenancePlanByIdQueryHandler : IRequestHandler<GetMaintenancePlanByIdQuery, MaintenancePlanDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMaintenancePlanByIdQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MaintenancePlanDto?> Handle(GetMaintenancePlanByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var plan = await _unitOfWork.MaintenancePlans.GetByIdWithDetailsAsync(tenantId, request.Id, cancellationToken);
        if (plan == null) return null;

        return new MaintenancePlanDto(
            plan.Id, plan.Code, plan.Name, plan.Description,
            plan.MachineId, plan.Machine?.Name, plan.WorkCenterId, plan.WorkCenter?.Name,
            plan.MaintenanceType, plan.Priority, plan.Status, plan.TriggerType,
            plan.FrequencyValue, plan.FrequencyUnit, plan.TriggerMeterValue, plan.WarningThreshold,
            plan.EffectiveFrom, plan.EffectiveTo, plan.LastExecutionDate, plan.NextScheduledDate,
            plan.EstimatedDurationHours, plan.EstimatedLaborCost, plan.EstimatedMaterialCost, plan.GetTotalEstimatedCost(),
            plan.Instructions, plan.SafetyNotes, plan.IsActive, plan.ApprovedByUser, plan.ApprovedDate,
            plan.Tasks.Select(t => new MaintenanceTaskDto(
                t.Id, t.MaintenancePlanId, t.SequenceNumber, t.TaskName, t.Description,
                t.Status, t.EstimatedDurationMinutes, t.RequiredSkills, t.RequiredTools,
                t.IsChecklistItem, t.ChecklistCriteria, t.AcceptanceValue, t.IsMandatory, t.IsActive
            )).ToList(),
            plan.RequiredSpareParts.Select(sp => new MaintenancePlanSparePartDto(
                sp.Id, sp.MaintenancePlanId, sp.SparePartId, sp.SparePart.Code, sp.SparePart.Name,
                sp.RequiredQuantity, sp.IsMandatory, sp.Notes
            )).ToList()
        );
    }
}

public class GetMaintenancePlanByCodeQueryHandler : IRequestHandler<GetMaintenancePlanByCodeQuery, MaintenancePlanDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMaintenancePlanByCodeQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MaintenancePlanDto?> Handle(GetMaintenancePlanByCodeQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var plan = await _unitOfWork.MaintenancePlans.GetByCodeAsync(tenantId, request.Code, cancellationToken);
        if (plan == null) return null;

        return new MaintenancePlanDto(
            plan.Id, plan.Code, plan.Name, plan.Description,
            plan.MachineId, plan.Machine?.Name, plan.WorkCenterId, plan.WorkCenter?.Name,
            plan.MaintenanceType, plan.Priority, plan.Status, plan.TriggerType,
            plan.FrequencyValue, plan.FrequencyUnit, plan.TriggerMeterValue, plan.WarningThreshold,
            plan.EffectiveFrom, plan.EffectiveTo, plan.LastExecutionDate, plan.NextScheduledDate,
            plan.EstimatedDurationHours, plan.EstimatedLaborCost, plan.EstimatedMaterialCost, plan.GetTotalEstimatedCost(),
            plan.Instructions, plan.SafetyNotes, plan.IsActive, plan.ApprovedByUser, plan.ApprovedDate,
            new List<MaintenanceTaskDto>(),
            new List<MaintenancePlanSparePartDto>()
        );
    }
}

public class GetActivePlansQueryHandler : IRequestHandler<GetActivePlansQuery, IReadOnlyList<MaintenancePlanListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetActivePlansQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaintenancePlanListDto>> Handle(GetActivePlansQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var plans = await _unitOfWork.MaintenancePlans.GetActivePlansAsync(tenantId, cancellationToken);
        return plans.Select(p => new MaintenancePlanListDto(
            p.Id, p.Code, p.Name, p.MachineId, p.Machine?.Name, p.WorkCenterId, p.WorkCenter?.Name,
            p.MaintenanceType, p.Priority, p.Status, p.NextScheduledDate, p.GetTotalEstimatedCost(), p.IsActive
        )).ToList();
    }
}

public class GetDuePlansQueryHandler : IRequestHandler<GetDuePlansQuery, IReadOnlyList<MaintenancePlanListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetDuePlansQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaintenancePlanListDto>> Handle(GetDuePlansQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var plans = await _unitOfWork.MaintenancePlans.GetDuePlansAsync(tenantId, request.AsOfDate, cancellationToken);
        return plans.Select(p => new MaintenancePlanListDto(
            p.Id, p.Code, p.Name, p.MachineId, p.Machine?.Name, p.WorkCenterId, p.WorkCenter?.Name,
            p.MaintenanceType, p.Priority, p.Status, p.NextScheduledDate, p.GetTotalEstimatedCost(), p.IsActive
        )).ToList();
    }
}

public class GetOverduePlansQueryHandler : IRequestHandler<GetOverduePlansQuery, IReadOnlyList<MaintenancePlanListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetOverduePlansQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaintenancePlanListDto>> Handle(GetOverduePlansQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var plans = await _unitOfWork.MaintenancePlans.GetOverduePlansAsync(tenantId, request.AsOfDate, cancellationToken);
        return plans.Select(p => new MaintenancePlanListDto(
            p.Id, p.Code, p.Name, p.MachineId, p.Machine?.Name, p.WorkCenterId, p.WorkCenter?.Name,
            p.MaintenanceType, p.Priority, p.Status, p.NextScheduledDate, p.GetTotalEstimatedCost(), p.IsActive
        )).ToList();
    }
}

public class GetUpcomingPlansQueryHandler : IRequestHandler<GetUpcomingPlansQuery, IReadOnlyList<MaintenancePlanListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetUpcomingPlansQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaintenancePlanListDto>> Handle(GetUpcomingPlansQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var plans = await _unitOfWork.MaintenancePlans.GetUpcomingPlansAsync(tenantId, request.StartDate, request.EndDate, cancellationToken);
        return plans.Select(p => new MaintenancePlanListDto(
            p.Id, p.Code, p.Name, p.MachineId, p.Machine?.Name, p.WorkCenterId, p.WorkCenter?.Name,
            p.MaintenanceType, p.Priority, p.Status, p.NextScheduledDate, p.GetTotalEstimatedCost(), p.IsActive
        )).ToList();
    }
}

public class GetPlansByMachineQueryHandler : IRequestHandler<GetPlansByMachineQuery, IReadOnlyList<MaintenancePlanListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetPlansByMachineQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaintenancePlanListDto>> Handle(GetPlansByMachineQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var plans = await _unitOfWork.MaintenancePlans.GetByMachineIdAsync(tenantId, request.MachineId, cancellationToken);
        return plans.Select(p => new MaintenancePlanListDto(
            p.Id, p.Code, p.Name, p.MachineId, p.Machine?.Name, p.WorkCenterId, p.WorkCenter?.Name,
            p.MaintenanceType, p.Priority, p.Status, p.NextScheduledDate, p.GetTotalEstimatedCost(), p.IsActive
        )).ToList();
    }
}

public class GetPlansByTypeQueryHandler : IRequestHandler<GetPlansByTypeQuery, IReadOnlyList<MaintenancePlanListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetPlansByTypeQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaintenancePlanListDto>> Handle(GetPlansByTypeQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var plans = await _unitOfWork.MaintenancePlans.GetByTypeAsync(tenantId, request.MaintenanceType, cancellationToken);
        return plans.Select(p => new MaintenancePlanListDto(
            p.Id, p.Code, p.Name, p.MachineId, p.Machine?.Name, p.WorkCenterId, p.WorkCenter?.Name,
            p.MaintenanceType, p.Priority, p.Status, p.NextScheduledDate, p.GetTotalEstimatedCost(), p.IsActive
        )).ToList();
    }
}

public class GetMaintenanceRecordsQueryHandler : IRequestHandler<GetMaintenanceRecordsQuery, IReadOnlyList<MaintenanceRecordListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMaintenanceRecordsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaintenanceRecordListDto>> Handle(GetMaintenanceRecordsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        IReadOnlyList<Domain.Entities.MaintenanceRecord> records;

        if (request.Status.HasValue)
            records = await _unitOfWork.MaintenanceRecords.GetByStatusAsync(tenantId, request.Status.Value, cancellationToken);
        else if (request.StartDate.HasValue && request.EndDate.HasValue)
            records = await _unitOfWork.MaintenanceRecords.GetByDateRangeAsync(tenantId, request.StartDate.Value, request.EndDate.Value, cancellationToken);
        else
            records = await _unitOfWork.MaintenanceRecords.GetAllAsync(tenantId, cancellationToken);

        return records.Select(r => new MaintenanceRecordListDto(
            r.Id, r.RecordNumber, r.MachineId, r.Machine?.Name, r.WorkCenterId, r.WorkCenter?.Name,
            r.MaintenanceType, r.Status, r.Priority, r.ScheduledDate, r.EndDate, r.GetTotalCost(), r.AssignedTechnician
        )).ToList();
    }
}

public class GetMaintenanceRecordByIdQueryHandler : IRequestHandler<GetMaintenanceRecordByIdQuery, MaintenanceRecordDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMaintenanceRecordByIdQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MaintenanceRecordDto?> Handle(GetMaintenanceRecordByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var record = await _unitOfWork.MaintenanceRecords.GetByIdWithDetailsAsync(tenantId, request.Id, cancellationToken);
        if (record == null) return null;

        return new MaintenanceRecordDto(
            record.Id, record.RecordNumber, record.MaintenancePlanId, record.MaintenancePlan?.Name,
            record.MachineId, record.Machine?.Name, record.WorkCenterId, record.WorkCenter?.Name,
            record.MaintenanceType, record.Status, record.Priority,
            record.ScheduledDate, record.StartDate, record.EndDate, record.ActualDurationHours,
            record.FailureCode, record.FailureDescription, record.RootCause,
            record.WorkPerformed, record.PartsReplaced, record.TechnicianNotes,
            record.LaborCost, record.MaterialCost, record.ExternalServiceCost, record.GetTotalCost(),
            record.MeterReadingBefore, record.MeterReadingAfter,
            record.AssignedTechnician, record.PerformedBy, record.ApprovedBy, record.ApprovedDate,
            record.NextActionRecommendation, record.RecommendedNextDate,
            record.RecordTasks.Select(t => new MaintenanceRecordTaskDto(
                t.Id, t.MaintenanceRecordId, t.MaintenanceTaskId, t.MaintenanceTask.TaskName,
                t.SequenceNumber, t.IsCompleted, t.CompletedDate, t.CompletedBy, t.MeasuredValue, t.PassedCheck, t.Notes
            )).ToList(),
            record.UsedSpareParts.Select(sp => new MaintenanceRecordSparePartDto(
                sp.Id, sp.MaintenanceRecordId, sp.SparePartId, sp.SparePart.Code, sp.SparePart.Name,
                sp.UsedQuantity, sp.UnitCost, sp.TotalCost, sp.LotNumber, sp.SerialNumber, sp.Notes
            )).ToList()
        );
    }
}

public class GetMaintenanceRecordByNumberQueryHandler : IRequestHandler<GetMaintenanceRecordByNumberQuery, MaintenanceRecordDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMaintenanceRecordByNumberQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MaintenanceRecordDto?> Handle(GetMaintenanceRecordByNumberQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var record = await _unitOfWork.MaintenanceRecords.GetByRecordNumberAsync(tenantId, request.RecordNumber, cancellationToken);
        if (record == null) return null;

        return new MaintenanceRecordDto(
            record.Id, record.RecordNumber, record.MaintenancePlanId, record.MaintenancePlan?.Name,
            record.MachineId, record.Machine?.Name, record.WorkCenterId, record.WorkCenter?.Name,
            record.MaintenanceType, record.Status, record.Priority,
            record.ScheduledDate, record.StartDate, record.EndDate, record.ActualDurationHours,
            record.FailureCode, record.FailureDescription, record.RootCause,
            record.WorkPerformed, record.PartsReplaced, record.TechnicianNotes,
            record.LaborCost, record.MaterialCost, record.ExternalServiceCost, record.GetTotalCost(),
            record.MeterReadingBefore, record.MeterReadingAfter,
            record.AssignedTechnician, record.PerformedBy, record.ApprovedBy, record.ApprovedDate,
            record.NextActionRecommendation, record.RecommendedNextDate,
            new List<MaintenanceRecordTaskDto>(),
            new List<MaintenanceRecordSparePartDto>()
        );
    }
}

public class GetPendingRecordsQueryHandler : IRequestHandler<GetPendingRecordsQuery, IReadOnlyList<MaintenanceRecordListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetPendingRecordsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaintenanceRecordListDto>> Handle(GetPendingRecordsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var records = await _unitOfWork.MaintenanceRecords.GetPendingRecordsAsync(tenantId, cancellationToken);
        return records.Select(r => new MaintenanceRecordListDto(
            r.Id, r.RecordNumber, r.MachineId, r.Machine?.Name, r.WorkCenterId, r.WorkCenter?.Name,
            r.MaintenanceType, r.Status, r.Priority, r.ScheduledDate, r.EndDate, r.GetTotalCost(), r.AssignedTechnician
        )).ToList();
    }
}

public class GetRecordsByMachineQueryHandler : IRequestHandler<GetRecordsByMachineQuery, IReadOnlyList<MaintenanceRecordListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetRecordsByMachineQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaintenanceRecordListDto>> Handle(GetRecordsByMachineQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var records = await _unitOfWork.MaintenanceRecords.GetByMachineIdAsync(tenantId, request.MachineId, request.StartDate, request.EndDate, cancellationToken);
        return records.Select(r => new MaintenanceRecordListDto(
            r.Id, r.RecordNumber, r.MachineId, r.Machine?.Name, r.WorkCenterId, r.WorkCenter?.Name,
            r.MaintenanceType, r.Status, r.Priority, r.ScheduledDate, r.EndDate, r.GetTotalCost(), r.AssignedTechnician
        )).ToList();
    }
}

public class GetRecordsByTypeQueryHandler : IRequestHandler<GetRecordsByTypeQuery, IReadOnlyList<MaintenanceRecordListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetRecordsByTypeQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaintenanceRecordListDto>> Handle(GetRecordsByTypeQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var records = await _unitOfWork.MaintenanceRecords.GetByTypeAsync(tenantId, request.MaintenanceType, request.StartDate, request.EndDate, cancellationToken);
        return records.Select(r => new MaintenanceRecordListDto(
            r.Id, r.RecordNumber, r.MachineId, r.Machine?.Name, r.WorkCenterId, r.WorkCenter?.Name,
            r.MaintenanceType, r.Status, r.Priority, r.ScheduledDate, r.EndDate, r.GetTotalCost(), r.AssignedTechnician
        )).ToList();
    }
}

public class GetSparePartsQueryHandler : IRequestHandler<GetSparePartsQuery, IReadOnlyList<SparePartListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetSparePartsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SparePartListDto>> Handle(GetSparePartsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var parts = await _unitOfWork.SpareParts.GetActivePartsAsync(tenantId, cancellationToken);
        return parts.Select(p => new SparePartListDto(
            p.Id, p.Code, p.Name, p.Category, p.Criticality, p.Status, p.Manufacturer, p.UnitCost, p.ReorderPoint, p.IsActive
        )).ToList();
    }
}

public class GetSparePartByIdQueryHandler : IRequestHandler<GetSparePartByIdQuery, SparePartDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetSparePartByIdQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<SparePartDto?> Handle(GetSparePartByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var part = await _unitOfWork.SpareParts.GetByIdWithDetailsAsync(tenantId, request.Id, cancellationToken);
        if (part == null) return null;

        return new SparePartDto(
            part.Id, part.Code, part.Name, part.Description, part.Category, part.SubCategory,
            part.Criticality, part.Status, part.PartNumber, part.Manufacturer, part.ManufacturerPartNo,
            part.AlternativePartNo, part.InventoryItemId, part.Unit, part.MinimumStock, part.ReorderPoint,
            part.ReorderQuantity, part.LeadTimeDays, part.UnitCost, part.LastPurchasePrice,
            part.CompatibleMachines, part.CompatibleModels, part.ShelfLifeMonths, part.StorageConditions, part.IsActive
        );
    }
}

public class GetSparePartByCodeQueryHandler : IRequestHandler<GetSparePartByCodeQuery, SparePartDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetSparePartByCodeQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<SparePartDto?> Handle(GetSparePartByCodeQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var part = await _unitOfWork.SpareParts.GetByCodeAsync(tenantId, request.Code, cancellationToken);
        if (part == null) return null;

        return new SparePartDto(
            part.Id, part.Code, part.Name, part.Description, part.Category, part.SubCategory,
            part.Criticality, part.Status, part.PartNumber, part.Manufacturer, part.ManufacturerPartNo,
            part.AlternativePartNo, part.InventoryItemId, part.Unit, part.MinimumStock, part.ReorderPoint,
            part.ReorderQuantity, part.LeadTimeDays, part.UnitCost, part.LastPurchasePrice,
            part.CompatibleMachines, part.CompatibleModels, part.ShelfLifeMonths, part.StorageConditions, part.IsActive
        );
    }
}

public class GetSparePartsByCategoryQueryHandler : IRequestHandler<GetSparePartsByCategoryQuery, IReadOnlyList<SparePartListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetSparePartsByCategoryQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SparePartListDto>> Handle(GetSparePartsByCategoryQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var parts = await _unitOfWork.SpareParts.GetByCategoryAsync(tenantId, request.Category, cancellationToken);
        return parts.Select(p => new SparePartListDto(
            p.Id, p.Code, p.Name, p.Category, p.Criticality, p.Status, p.Manufacturer, p.UnitCost, p.ReorderPoint, p.IsActive
        )).ToList();
    }
}

public class GetSparePartsByCriticalityQueryHandler : IRequestHandler<GetSparePartsByCriticalityQuery, IReadOnlyList<SparePartListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetSparePartsByCriticalityQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SparePartListDto>> Handle(GetSparePartsByCriticalityQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var parts = await _unitOfWork.SpareParts.GetByCriticalityAsync(tenantId, request.Criticality, cancellationToken);
        return parts.Select(p => new SparePartListDto(
            p.Id, p.Code, p.Name, p.Category, p.Criticality, p.Status, p.Manufacturer, p.UnitCost, p.ReorderPoint, p.IsActive
        )).ToList();
    }
}

public class SearchSparePartsQueryHandler : IRequestHandler<SearchSparePartsQuery, IReadOnlyList<SparePartListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public SearchSparePartsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SparePartListDto>> Handle(SearchSparePartsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var parts = await _unitOfWork.SpareParts.SearchAsync(tenantId, request.SearchTerm, cancellationToken);
        return parts.Select(p => new SparePartListDto(
            p.Id, p.Code, p.Name, p.Category, p.Criticality, p.Status, p.Manufacturer, p.UnitCost, p.ReorderPoint, p.IsActive
        )).ToList();
    }
}

public class GetCompatibleSparePartsQueryHandler : IRequestHandler<GetCompatibleSparePartsQuery, IReadOnlyList<SparePartListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCompatibleSparePartsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SparePartListDto>> Handle(GetCompatibleSparePartsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var parts = await _unitOfWork.SpareParts.GetByMachineCompatibilityAsync(tenantId, request.MachineId, cancellationToken);
        return parts.Select(p => new SparePartListDto(
            p.Id, p.Code, p.Name, p.Category, p.Criticality, p.Status, p.Manufacturer, p.UnitCost, p.ReorderPoint, p.IsActive
        )).ToList();
    }
}

public class GetMachineCountersQueryHandler : IRequestHandler<GetMachineCountersQuery, IReadOnlyList<MachineCounterListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMachineCountersQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MachineCounterListDto>> Handle(GetMachineCountersQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var counters = await _unitOfWork.MachineCounters.GetByMachineIdAsync(tenantId, request.MachineId, cancellationToken);
        return counters.Select(c => new MachineCounterListDto(
            c.Id, c.MachineId, c.Machine?.Name ?? "", c.CounterName, c.CurrentValue,
            c.WarningThreshold, c.CriticalThreshold, c.IsWarning(), c.IsCritical()
        )).ToList();
    }
}

public class GetMachineCounterByIdQueryHandler : IRequestHandler<GetMachineCounterByIdQuery, MachineCounterDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMachineCounterByIdQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MachineCounterDto?> Handle(GetMachineCounterByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var counter = await _unitOfWork.MachineCounters.GetByIdAsync(tenantId, request.Id, cancellationToken);
        if (counter == null) return null;

        return new MachineCounterDto(
            counter.Id, counter.MachineId, counter.Machine?.Name ?? "", counter.CounterName, counter.CounterUnit,
            counter.CurrentValue, counter.PreviousValue, counter.LastUpdated,
            counter.ResetValue, counter.LastResetDate,
            counter.WarningThreshold, counter.CriticalThreshold, counter.IsWarning(), counter.IsCritical()
        );
    }
}

public class GetCountersNeedingMaintenanceQueryHandler : IRequestHandler<GetCountersNeedingMaintenanceQuery, IReadOnlyList<MachineCounterListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCountersNeedingMaintenanceQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MachineCounterListDto>> Handle(GetCountersNeedingMaintenanceQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var counters = await _unitOfWork.MachineCounters.GetCountersNeedingMaintenanceAsync(tenantId, cancellationToken);
        return counters.Select(c => new MachineCounterListDto(
            c.Id, c.MachineId, c.Machine?.Name ?? "", c.CounterName, c.CurrentValue,
            c.WarningThreshold, c.CriticalThreshold, c.IsWarning(), c.IsCritical()
        )).ToList();
    }
}

public class GetCriticalCountersQueryHandler : IRequestHandler<GetCriticalCountersQuery, IReadOnlyList<MachineCounterListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCriticalCountersQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MachineCounterListDto>> Handle(GetCriticalCountersQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var counters = await _unitOfWork.MachineCounters.GetCountersAtCriticalLevelAsync(tenantId, cancellationToken);
        return counters.Select(c => new MachineCounterListDto(
            c.Id, c.MachineId, c.Machine?.Name ?? "", c.CounterName, c.CurrentValue,
            c.WarningThreshold, c.CriticalThreshold, c.IsWarning(), c.IsCritical()
        )).ToList();
    }
}

public class GetMaintenanceDashboardQueryHandler : IRequestHandler<GetMaintenanceDashboardQuery, MaintenanceDashboardDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMaintenanceDashboardQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MaintenanceDashboardDto> Handle(GetMaintenanceDashboardQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var today = DateTime.UtcNow.Date;
        var monthStart = new DateTime(today.Year, today.Month, 1);

        var allPlans = await _unitOfWork.MaintenancePlans.GetAllAsync(tenantId, cancellationToken);
        var activePlans = await _unitOfWork.MaintenancePlans.GetActivePlansAsync(tenantId, cancellationToken);
        var duePlans = await _unitOfWork.MaintenancePlans.GetDuePlansAsync(tenantId, today, cancellationToken);
        var overduePlans = await _unitOfWork.MaintenancePlans.GetOverduePlansAsync(tenantId, today, cancellationToken);
        var upcomingPlans = await _unitOfWork.MaintenancePlans.GetUpcomingPlansAsync(tenantId, today, today.AddDays(7), cancellationToken);

        var pendingRecords = await _unitOfWork.MaintenanceRecords.GetPendingRecordsAsync(tenantId, cancellationToken);
        var monthRecords = await _unitOfWork.MaintenanceRecords.GetByDateRangeAsync(tenantId, monthStart, today.AddDays(1), cancellationToken);
        var recentRecords = await _unitOfWork.MaintenanceRecords.GetByDateRangeAsync(tenantId, today.AddDays(-30), today.AddDays(1), cancellationToken);

        var criticalCounters = await _unitOfWork.MachineCounters.GetCountersAtCriticalLevelAsync(tenantId, cancellationToken);

        var totalCostMTD = monthRecords.Where(r => r.Status == MaintenanceRecordStatus.Onaylandı).Sum(r => r.GetTotalCost());
        var avgDuration = monthRecords.Where(r => r.ActualDurationHours.HasValue).Select(r => r.ActualDurationHours!.Value).DefaultIfEmpty(0).Average();

        return new MaintenanceDashboardDto(
            allPlans.Count,
            activePlans.Count,
            duePlans.Count,
            overduePlans.Count,
            pendingRecords.Count(r => r.Status == MaintenanceRecordStatus.Açık),
            pendingRecords.Count(r => r.Status == MaintenanceRecordStatus.DevamEdiyor),
            totalCostMTD,
            avgDuration,
            upcomingPlans.Select(p => new MaintenancePlanListDto(
                p.Id, p.Code, p.Name, p.MachineId, p.Machine?.Name, p.WorkCenterId, p.WorkCenter?.Name,
                p.MaintenanceType, p.Priority, p.Status, p.NextScheduledDate, p.GetTotalEstimatedCost(), p.IsActive
            )).ToList(),
            recentRecords.Take(10).Select(r => new MaintenanceRecordListDto(
                r.Id, r.RecordNumber, r.MachineId, r.Machine?.Name, r.WorkCenterId, r.WorkCenter?.Name,
                r.MaintenanceType, r.Status, r.Priority, r.ScheduledDate, r.EndDate, r.GetTotalCost(), r.AssignedTechnician
            )).ToList(),
            criticalCounters.Select(c => new MachineCounterListDto(
                c.Id, c.MachineId, c.Machine?.Name ?? "", c.CounterName, c.CurrentValue,
                c.WarningThreshold, c.CriticalThreshold, c.IsWarning(), c.IsCritical()
            )).ToList()
        );
    }
}

public class GetMaintenanceSummaryQueryHandler : IRequestHandler<GetMaintenanceSummaryQuery, MaintenanceSummaryDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMaintenanceSummaryQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MaintenanceSummaryDto> Handle(GetMaintenanceSummaryQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var records = await _unitOfWork.MaintenanceRecords.GetByDateRangeAsync(tenantId, request.PeriodStart, request.PeriodEnd, cancellationToken);

        var completedRecords = records.Where(r => r.Status == MaintenanceRecordStatus.Onaylandı || r.Status == MaintenanceRecordStatus.Tamamlandı).ToList();
        var preventiveCount = records.Count(r => r.MaintenanceType == MaintenanceType.Önleyici);
        var correctiveCount = records.Count(r => r.MaintenanceType == MaintenanceType.Arıza);
        var totalCost = completedRecords.Sum(r => r.GetTotalCost());
        var avgDuration = completedRecords.Where(r => r.ActualDurationHours.HasValue).Select(r => r.ActualDurationHours!.Value).DefaultIfEmpty(0).Average();

        var predictiveCount = records.Count(r => r.MaintenanceType == MaintenanceType.Kestirimci);
        var totalLaborCost = completedRecords.Sum(r => r.LaborCost);
        var totalMaterialCost = completedRecords.Sum(r => r.MaterialCost);
        var totalExternalCost = completedRecords.Sum(r => r.ExternalServiceCost);

        // MTBF ve MTTR hesaplamaları (basitleştirilmiş)
        var mtbf = completedRecords.Any() ? (decimal)(request.PeriodEnd - request.PeriodStart).TotalHours / Math.Max(correctiveCount, 1) : 0m;
        var mttr = avgDuration;

        return new MaintenanceSummaryDto(
            request.PeriodStart,
            request.PeriodEnd,
            records.Count,
            preventiveCount,
            correctiveCount,
            predictiveCount,
            totalLaborCost,
            totalMaterialCost,
            totalExternalCost,
            totalCost,
            avgDuration,
            mtbf,
            mttr
        );
    }
}

#endregion
