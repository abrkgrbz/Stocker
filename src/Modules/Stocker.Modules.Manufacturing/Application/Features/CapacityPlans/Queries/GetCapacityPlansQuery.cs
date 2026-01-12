using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.CapacityPlans.Queries;

public record GetCapacityPlansQuery(
    CapacityPlanStatus? Status = null,
    int? MrpPlanId = null,
    DateTime? StartDate = null,
    DateTime? EndDate = null) : IRequest<IReadOnlyList<CapacityPlanListDto>>;

public class GetCapacityPlansQueryHandler : IRequestHandler<GetCapacityPlansQuery, IReadOnlyList<CapacityPlanListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCapacityPlansQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CapacityPlanListDto>> Handle(GetCapacityPlansQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<CapacityPlan> plans;

        if (query.Status.HasValue)
        {
            plans = await _unitOfWork.CapacityPlans.GetByStatusAsync(query.Status.Value, cancellationToken);
        }
        else if (query.MrpPlanId.HasValue)
        {
            plans = await _unitOfWork.CapacityPlans.GetByMrpPlanAsync(query.MrpPlanId.Value, cancellationToken);
        }
        else if (query.StartDate.HasValue && query.EndDate.HasValue)
        {
            plans = await _unitOfWork.CapacityPlans.GetByDateRangeAsync(query.StartDate.Value, query.EndDate.Value, cancellationToken);
        }
        else
        {
            plans = await _unitOfWork.CapacityPlans.GetAllAsync(cancellationToken);
        }

        return plans
            .Where(p => p.TenantId == tenantId)
            .Select(p => new CapacityPlanListDto(
                p.Id,
                p.PlanNumber,
                p.Name,
                p.MrpPlanId,
                p.Status.ToString(),
                p.PlanningHorizonStart,
                p.PlanningHorizonEnd,
                p.ExecutionStartTime,
                p.ExecutionEndTime,
                p.WorkCenterCount,
                p.OverloadedPeriodCount,
                p.AverageUtilization,
                p.IsActive,
                p.CreatedDate))
            .ToList();
    }
}

public record GetCapacityPlanByIdQuery(int Id) : IRequest<CapacityPlanDto?>;

public class GetCapacityPlanByIdQueryHandler : IRequestHandler<GetCapacityPlanByIdQuery, CapacityPlanDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCapacityPlanByIdQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CapacityPlanDto?> Handle(GetCapacityPlanByIdQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var plan = await _unitOfWork.CapacityPlans.GetFullPlanAsync(query.Id, cancellationToken);
        if (plan == null || plan.TenantId != tenantId)
            return null;

        return MapToDto(plan);
    }

    private static CapacityPlanDto MapToDto(CapacityPlan entity) => new(
        entity.Id,
        entity.PlanNumber,
        entity.Name,
        entity.MrpPlanId,
        entity.PlanningHorizonStart,
        entity.PlanningHorizonEnd,
        entity.PlanningBucketDays,
        entity.IsFiniteCapacity,
        entity.IncludeSetupTime,
        entity.IncludeQueueTime,
        entity.IncludeMoveTime,
        entity.OverloadThreshold,
        entity.BottleneckThreshold,
        entity.Status.ToString(),
        entity.ExecutionStartTime,
        entity.ExecutionEndTime,
        entity.ExecutedBy,
        entity.WorkCenterCount,
        entity.OverloadedPeriodCount,
        entity.BottleneckCount,
        entity.AverageUtilization,
        entity.Notes,
        entity.IsActive,
        entity.CreatedDate,
        entity.Requirements.Select(r => new CapacityRequirementDto(
            r.Id,
            r.CapacityPlanId,
            r.WorkCenterId,
            r.WorkCenter?.Code,
            r.WorkCenter?.Name,
            r.PeriodDate,
            r.PeriodNumber,
            r.AvailableCapacity,
            r.RequiredCapacity,
            r.SetupTime,
            r.RunTime,
            r.QueueTime,
            r.MoveTime,
            r.LoadPercent,
            r.OverUnderCapacity,
            r.Status.ToString(),
            r.ShiftedHours,
            r.ShiftedToDate,
            r.Notes,
            r.LoadDetails.Select(d => new CapacityLoadDetailDto(
                d.Id,
                d.CapacityRequirementId,
                d.ProductionOrderId,
                d.ProductionOrder?.OrderNumber,
                d.PlannedOrderId,
                d.OperationId,
                d.Operation?.Code,
                d.ProductId,
                null,
                d.SetupHours,
                d.RunHours,
                d.QueueHours,
                d.MoveHours,
                d.TotalHours,
                d.Quantity,
                d.PlannedStartDate,
                d.PlannedEndDate,
                d.LoadType.ToString()
            )).ToList()
        )).ToList(),
        entity.Exceptions.Select(e => new CapacityExceptionDto(
            e.Id,
            e.CapacityPlanId,
            e.WorkCenterId,
            e.WorkCenter?.Code,
            e.WorkCenter?.Name,
            e.PeriodDate,
            e.Type.ToString(),
            e.Severity.ToString(),
            e.Message,
            e.RequiredCapacity,
            e.AvailableCapacity,
            e.ShortageHours,
            e.IsResolved,
            e.ResolvedBy,
            e.ResolvedDate,
            e.ResolutionNotes
        )).ToList());
}

public record GetCapacityRequirementsQuery(
    int? CapacityPlanId = null,
    int? WorkCenterId = null,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    bool OnlyOverloaded = false) : IRequest<IReadOnlyList<CapacityRequirementDto>>;

public class GetCapacityRequirementsQueryHandler : IRequestHandler<GetCapacityRequirementsQuery, IReadOnlyList<CapacityRequirementDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCapacityRequirementsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CapacityRequirementDto>> Handle(GetCapacityRequirementsQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<CapacityRequirement> requirements;

        if (query.CapacityPlanId.HasValue && query.OnlyOverloaded)
        {
            requirements = await _unitOfWork.CapacityPlans.GetOverloadedRequirementsAsync(query.CapacityPlanId.Value, cancellationToken);
        }
        else if (query.CapacityPlanId.HasValue)
        {
            requirements = await _unitOfWork.CapacityPlans.GetRequirementsByPlanAsync(query.CapacityPlanId.Value, cancellationToken);
        }
        else if (query.WorkCenterId.HasValue && query.StartDate.HasValue && query.EndDate.HasValue)
        {
            requirements = await _unitOfWork.CapacityPlans.GetRequirementsByWorkCenterAsync(
                query.WorkCenterId.Value, query.StartDate.Value, query.EndDate.Value, cancellationToken);
        }
        else
        {
            return new List<CapacityRequirementDto>();
        }

        return requirements
            .Where(r => r.CapacityPlan.TenantId == tenantId)
            .Select(r => new CapacityRequirementDto(
                r.Id,
                r.CapacityPlanId,
                r.WorkCenterId,
                r.WorkCenter?.Code,
                r.WorkCenter?.Name,
                r.PeriodDate,
                r.PeriodNumber,
                r.AvailableCapacity,
                r.RequiredCapacity,
                r.SetupTime,
                r.RunTime,
                r.QueueTime,
                r.MoveTime,
                r.LoadPercent,
                r.OverUnderCapacity,
                r.Status.ToString(),
                r.ShiftedHours,
                r.ShiftedToDate,
                r.Notes,
                null))
            .ToList();
    }
}

public record GetCapacityExceptionsQuery(
    int CapacityPlanId,
    bool OnlyUnresolved = true) : IRequest<IReadOnlyList<CapacityExceptionDto>>;

public class GetCapacityExceptionsQueryHandler : IRequestHandler<GetCapacityExceptionsQuery, IReadOnlyList<CapacityExceptionDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCapacityExceptionsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CapacityExceptionDto>> Handle(GetCapacityExceptionsQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var plan = await _unitOfWork.CapacityPlans.GetByIdAsync(query.CapacityPlanId, cancellationToken);
        if (plan == null || plan.TenantId != tenantId)
            return new List<CapacityExceptionDto>();

        var exceptions = query.OnlyUnresolved
            ? await _unitOfWork.CapacityPlans.GetUnresolvedExceptionsAsync(query.CapacityPlanId, cancellationToken)
            : (await _unitOfWork.CapacityPlans.GetWithExceptionsAsync(query.CapacityPlanId, cancellationToken))?.Exceptions.ToList()
              ?? new List<CapacityException>();

        return exceptions.Select(e => new CapacityExceptionDto(
            e.Id,
            e.CapacityPlanId,
            e.WorkCenterId,
            e.WorkCenter?.Code,
            e.WorkCenter?.Name,
            e.PeriodDate,
            e.Type.ToString(),
            e.Severity.ToString(),
            e.Message,
            e.RequiredCapacity,
            e.AvailableCapacity,
            e.ShortageHours,
            e.IsResolved,
            e.ResolvedBy,
            e.ResolvedDate,
            e.ResolutionNotes
        )).ToList();
    }
}

public record GetWorkCenterCapacityOverviewQuery(
    int[] WorkCenterIds,
    DateTime StartDate,
    DateTime EndDate) : IRequest<IReadOnlyList<WorkCenterCapacityOverviewDto>>;

public class GetWorkCenterCapacityOverviewQueryHandler : IRequestHandler<GetWorkCenterCapacityOverviewQuery, IReadOnlyList<WorkCenterCapacityOverviewDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetWorkCenterCapacityOverviewQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<WorkCenterCapacityOverviewDto>> Handle(GetWorkCenterCapacityOverviewQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var result = new List<WorkCenterCapacityOverviewDto>();

        foreach (var workCenterId in query.WorkCenterIds)
        {
            var requirements = await _unitOfWork.CapacityPlans.GetRequirementsByWorkCenterAsync(
                workCenterId, query.StartDate, query.EndDate, cancellationToken);

            if (!requirements.Any())
                continue;

            var workCenter = requirements.First().WorkCenter;
            if (workCenter == null || workCenter.TenantId != tenantId)
                continue;

            var totalAvailable = requirements.Sum(r => r.AvailableCapacity);
            var totalRequired = requirements.Sum(r => r.RequiredCapacity);
            var avgLoad = requirements.Average(r => r.LoadPercent);
            var overloaded = requirements.Count(r => r.Status == Domain.Enums.CapacityStatus.Aşırı || r.Status == Domain.Enums.CapacityStatus.Darboğaz);
            var bottleneck = requirements.Count(r => r.Status == Domain.Enums.CapacityStatus.Darboğaz);

            result.Add(new WorkCenterCapacityOverviewDto(
                workCenter.Id,
                workCenter.Code,
                workCenter.Name,
                totalAvailable,
                totalRequired,
                avgLoad,
                overloaded,
                bottleneck,
                workCenter.IsBottleneck,
                requirements.Select(r => new CapacityRequirementSummaryDto(
                    r.WorkCenterId,
                    workCenter.Code,
                    workCenter.Name,
                    r.PeriodDate,
                    r.AvailableCapacity,
                    r.RequiredCapacity,
                    r.LoadPercent,
                    r.Status.ToString()
                )).ToList()));
        }

        return result;
    }
}
