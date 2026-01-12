using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.MasterProductionSchedules.Queries;

public record GetMasterProductionSchedulesQuery(
    string? Status = null,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    bool? ActiveOnly = null) : IRequest<IReadOnlyList<MasterProductionScheduleListDto>>;

public class GetMasterProductionSchedulesQueryHandler : IRequestHandler<GetMasterProductionSchedulesQuery, IReadOnlyList<MasterProductionScheduleListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMasterProductionSchedulesQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MasterProductionScheduleListDto>> Handle(GetMasterProductionSchedulesQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<MasterProductionSchedule> schedules;

        if (query.ActiveOnly == true)
        {
            var active = await _unitOfWork.MasterProductionSchedules.GetActiveAsync(tenantId, cancellationToken);
            schedules = active != null ? new List<MasterProductionSchedule> { active } : new List<MasterProductionSchedule>();
        }
        else if (!string.IsNullOrEmpty(query.Status) && Enum.TryParse<MpsStatus>(query.Status, out var status))
        {
            schedules = await _unitOfWork.MasterProductionSchedules.GetByStatusAsync(tenantId, status, cancellationToken);
        }
        else if (query.StartDate.HasValue && query.EndDate.HasValue)
        {
            schedules = await _unitOfWork.MasterProductionSchedules.GetByDateRangeAsync(tenantId, query.StartDate.Value, query.EndDate.Value, cancellationToken);
        }
        else
        {
            schedules = await _unitOfWork.MasterProductionSchedules.GetAllAsync(tenantId, cancellationToken);
        }

        return schedules.Select(MapToListDto).ToList();
    }

    private static MasterProductionScheduleListDto MapToListDto(MasterProductionSchedule entity) => new(
        entity.Id,
        entity.ScheduleNumber,
        entity.Name,
        entity.Status.ToString(),
        entity.PeriodStart,
        entity.PeriodEnd,
        entity.PeriodType.ToString(),
        entity.Lines.Count,
        entity.IsActive,
        entity.CreatedDate);
}

public record GetMasterProductionScheduleQuery(int Id) : IRequest<MasterProductionScheduleDto>;

public class GetMasterProductionScheduleQueryHandler : IRequestHandler<GetMasterProductionScheduleQuery, MasterProductionScheduleDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMasterProductionScheduleQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MasterProductionScheduleDto> Handle(GetMasterProductionScheduleQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var schedule = await _unitOfWork.MasterProductionSchedules.GetWithLinesAsync(query.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{query.Id}' olan MPS bulunamadı.");

        if (schedule.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu MPS'e erişim yetkiniz yok.");

        return MapToDto(schedule);
    }

    private static MasterProductionScheduleDto MapToDto(MasterProductionSchedule entity) => new(
        entity.Id,
        entity.ScheduleNumber,
        entity.Name,
        entity.Status.ToString(),
        entity.PeriodStart,
        entity.PeriodEnd,
        entity.PeriodType.ToString(),
        entity.FrozenPeriodDays,
        entity.SlushyPeriodDays,
        entity.FreePeriodDays,
        entity.CreatedBy,
        entity.ApprovedBy,
        entity.ApprovalDate,
        entity.Notes,
        entity.IsActive,
        entity.CreatedDate,
        entity.Lines.Select(MapLineDto).ToList());

    private static MpsLineDto MapLineDto(MpsLine line) => new(
        line.Id,
        line.MpsId,
        line.ProductId,
        null, null, // ProductCode, ProductName
        line.PeriodDate,
        line.PeriodNumber,
        line.ForecastQuantity,
        line.CustomerOrderQuantity,
        line.DependentDemand,
        line.PlannedProductionQuantity,
        line.ProjectedAvailableBalance,
        line.AvailableToPromise,
        line.BeginningInventory,
        line.SafetyStock,
        line.ActualProductionQuantity,
        line.ActualSalesQuantity,
        line.Notes);
}

public record GetMpsLinesQuery(
    int? ScheduleId = null,
    int? ProductId = null,
    DateTime? PeriodStart = null,
    DateTime? PeriodEnd = null) : IRequest<IReadOnlyList<MpsLineListDto>>;

public class GetMpsLinesQueryHandler : IRequestHandler<GetMpsLinesQuery, IReadOnlyList<MpsLineListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMpsLinesQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MpsLineListDto>> Handle(GetMpsLinesQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<MpsLine> lines;

        if (query.ProductId.HasValue)
        {
            lines = await _unitOfWork.MasterProductionSchedules.GetLinesByProductAsync(tenantId, query.ProductId.Value, cancellationToken);
        }
        else if (query.ScheduleId.HasValue && query.PeriodStart.HasValue && query.PeriodEnd.HasValue)
        {
            lines = await _unitOfWork.MasterProductionSchedules.GetLinesByPeriodAsync(query.ScheduleId.Value, query.PeriodStart.Value, query.PeriodEnd.Value, cancellationToken);
        }
        else if (query.ScheduleId.HasValue)
        {
            var schedule = await _unitOfWork.MasterProductionSchedules.GetWithLinesAsync(query.ScheduleId.Value, cancellationToken);
            lines = schedule?.Lines.ToList() ?? new List<MpsLine>();
        }
        else
        {
            lines = new List<MpsLine>();
        }

        return lines.Select(l => new MpsLineListDto(
            l.Id,
            l.ProductId,
            null, null,
            l.PeriodDate,
            l.ForecastQuantity,
            l.CustomerOrderQuantity,
            l.PlannedProductionQuantity,
            l.ProjectedAvailableBalance,
            l.AvailableToPromise)).ToList();
    }
}

public record GetAvailableToPromiseQuery(int ProductId, DateTime Date) : IRequest<AtpQueryResponse>;

public class GetAvailableToPromiseQueryHandler : IRequestHandler<GetAvailableToPromiseQuery, AtpQueryResponse>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetAvailableToPromiseQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<AtpQueryResponse> Handle(GetAvailableToPromiseQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var atp = await _unitOfWork.MasterProductionSchedules.GetAvailableToPromiseAsync(tenantId, query.ProductId, query.Date, cancellationToken);

        // Get active MPS to determine fence type
        var activeMps = await _unitOfWork.MasterProductionSchedules.GetActiveAsync(tenantId, cancellationToken);
        var fenceType = activeMps?.GetFenceType(query.Date) ?? MpsFenceType.Free;

        return new AtpQueryResponse(
            query.ProductId,
            null, null, // ProductCode, ProductName
            query.Date,
            atp,
            fenceType.ToString());
    }
}
