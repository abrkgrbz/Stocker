using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.MrpPlans.Queries;

public record GetMrpPlansQuery(
    string? Status = null,
    string? Type = null,
    DateTime? StartDate = null,
    DateTime? EndDate = null) : IRequest<IReadOnlyList<MrpPlanListDto>>;

public class GetMrpPlansQueryHandler : IRequestHandler<GetMrpPlansQuery, IReadOnlyList<MrpPlanListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMrpPlansQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MrpPlanListDto>> Handle(GetMrpPlansQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<MrpPlan> plans;

        if (!string.IsNullOrEmpty(query.Status) && Enum.TryParse<MrpPlanStatus>(query.Status, out var status))
        {
            plans = await _unitOfWork.MrpPlans.GetByStatusAsync(tenantId, status, cancellationToken);
        }
        else if (!string.IsNullOrEmpty(query.Type) && Enum.TryParse<MrpPlanType>(query.Type, out var type))
        {
            plans = await _unitOfWork.MrpPlans.GetByTypeAsync(tenantId, type, cancellationToken);
        }
        else if (query.StartDate.HasValue && query.EndDate.HasValue)
        {
            plans = await _unitOfWork.MrpPlans.GetByDateRangeAsync(tenantId, query.StartDate.Value, query.EndDate.Value, cancellationToken);
        }
        else
        {
            plans = await _unitOfWork.MrpPlans.GetAllAsync(tenantId, cancellationToken);
        }

        return plans.Select(MapToListDto).ToList();
    }

    private static MrpPlanListDto MapToListDto(MrpPlan entity) => new(
        entity.Id,
        entity.PlanNumber,
        entity.Name,
        entity.Type.ToString(),
        entity.Status.ToString(),
        entity.PlanningHorizonStart,
        entity.PlanningHorizonEnd,
        entity.ExecutionStartTime,
        entity.ExecutionEndTime,
        entity.ProcessedItemCount,
        entity.GeneratedOrderCount,
        entity.IsActive,
        entity.CreatedDate);
}

public record GetMrpPlanQuery(int Id) : IRequest<MrpPlanDto>;

public class GetMrpPlanQueryHandler : IRequestHandler<GetMrpPlanQuery, MrpPlanDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMrpPlanQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MrpPlanDto> Handle(GetMrpPlanQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var plan = await _unitOfWork.MrpPlans.GetFullAsync(query.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{query.Id}' olan MRP planı bulunamadı.");

        if (plan.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu plana erişim yetkiniz yok.");

        return MapToDto(plan);
    }

    private static MrpPlanDto MapToDto(MrpPlan entity) => new(
        entity.Id,
        entity.PlanNumber,
        entity.Name,
        entity.Type.ToString(),
        entity.Status.ToString(),
        entity.PlanningHorizonStart,
        entity.PlanningHorizonEnd,
        entity.PlanningBucketDays,
        entity.DefaultLotSizingMethod.ToString(),
        entity.IncludeSafetyStock,
        entity.ConsiderLeadTimes,
        entity.NetChangeOnly,
        entity.FixedOrderQuantity,
        entity.PeriodsOfSupply,
        entity.ExecutionStartTime,
        entity.ExecutionEndTime,
        entity.ProcessedItemCount,
        entity.GeneratedRequirementCount,
        entity.GeneratedOrderCount,
        entity.ExecutedBy,
        entity.ApprovedBy,
        entity.ApprovalDate,
        entity.Notes,
        entity.IsActive,
        entity.CreatedDate,
        entity.Requirements.Select(MapRequirementDto).ToList(),
        entity.PlannedOrders.Select(MapPlannedOrderDto).ToList(),
        entity.Exceptions.Select(MapExceptionDto).ToList());

    private static MrpRequirementDto MapRequirementDto(MrpRequirement req) => new(
        req.Id,
        req.MrpPlanId,
        req.ProductId,
        null, null, // ProductCode, ProductName - needs product service
        req.RequirementDate,
        req.PeriodNumber,
        req.GrossRequirement,
        req.OnHandStock,
        req.ScheduledReceipts,
        req.SafetyStock,
        req.NetRequirement,
        req.PlannedOrderReceipt,
        req.PlannedOrderRelease,
        req.ProjectedOnHand,
        req.DemandSource,
        req.DemandSourceId,
        req.IsProcessed);

    private static PlannedOrderDto MapPlannedOrderDto(PlannedOrder order) => new(
        order.Id,
        order.MrpPlanId,
        order.ProductId,
        null, null, // ProductCode, ProductName
        order.OrderType.ToString(),
        order.Status.ToString(),
        order.Quantity,
        order.Unit,
        order.PlannedStartDate,
        order.PlannedEndDate,
        order.ReleaseDate,
        order.LotSizingMethod.ToString(),
        order.OriginalQuantity,
        order.ConvertedToOrderId,
        order.ConvertedToOrderType,
        order.ConversionDate,
        order.ConvertedBy,
        order.Notes);

    private static MrpExceptionDto MapExceptionDto(MrpException ex) => new(
        ex.Id,
        ex.MrpPlanId,
        ex.ProductId,
        null, null, // ProductCode, ProductName
        ex.ExceptionType.ToString(),
        ex.Severity.ToString(),
        ex.Message,
        ex.Details,
        ex.OccurredAt,
        ex.IsResolved,
        ex.ResolvedBy,
        ex.ResolvedAt,
        ex.ResolutionNotes);
}

public record GetPlannedOrdersQuery(
    int? PlanId = null,
    int? ProductId = null,
    string? Status = null) : IRequest<IReadOnlyList<PlannedOrderListDto>>;

public class GetPlannedOrdersQueryHandler : IRequestHandler<GetPlannedOrdersQuery, IReadOnlyList<PlannedOrderListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetPlannedOrdersQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<PlannedOrderListDto>> Handle(GetPlannedOrdersQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<PlannedOrder> orders;

        if (query.ProductId.HasValue)
        {
            orders = await _unitOfWork.MrpPlans.GetPlannedOrdersByProductAsync(tenantId, query.ProductId.Value, cancellationToken);
        }
        else if (!string.IsNullOrEmpty(query.Status) && Enum.TryParse<PlannedOrderStatus>(query.Status, out var status))
        {
            orders = await _unitOfWork.MrpPlans.GetPlannedOrdersByStatusAsync(tenantId, status, cancellationToken);
        }
        else if (query.PlanId.HasValue)
        {
            var plan = await _unitOfWork.MrpPlans.GetWithPlannedOrdersAsync(query.PlanId.Value, cancellationToken);
            orders = plan?.PlannedOrders.ToList() ?? new List<PlannedOrder>();
        }
        else
        {
            orders = new List<PlannedOrder>();
        }

        return orders.Select(o => new PlannedOrderListDto(
            o.Id,
            o.ProductId,
            null, null, // ProductCode, ProductName
            o.OrderType.ToString(),
            o.Status.ToString(),
            o.Quantity,
            o.Unit,
            o.PlannedStartDate,
            o.PlannedEndDate)).ToList();
    }
}

public record GetMrpExceptionsQuery(
    int? PlanId = null,
    bool? UnresolvedOnly = null) : IRequest<IReadOnlyList<MrpExceptionDto>>;

public class GetMrpExceptionsQueryHandler : IRequestHandler<GetMrpExceptionsQuery, IReadOnlyList<MrpExceptionDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMrpExceptionsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MrpExceptionDto>> Handle(GetMrpExceptionsQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<MrpException> exceptions;

        if (query.UnresolvedOnly == true)
        {
            exceptions = await _unitOfWork.MrpPlans.GetUnresolvedExceptionsAsync(tenantId, cancellationToken);
        }
        else if (query.PlanId.HasValue)
        {
            var plan = await _unitOfWork.MrpPlans.GetWithExceptionsAsync(query.PlanId.Value, cancellationToken);
            exceptions = plan?.Exceptions.ToList() ?? new List<MrpException>();
        }
        else
        {
            exceptions = new List<MrpException>();
        }

        return exceptions.Select(e => new MrpExceptionDto(
            e.Id,
            e.MrpPlanId,
            e.ProductId,
            null, null, // ProductCode, ProductName
            e.ExceptionType.ToString(),
            e.Severity.ToString(),
            e.Message,
            e.Details,
            e.OccurredAt,
            e.IsResolved,
            e.ResolvedBy,
            e.ResolvedAt,
            e.ResolutionNotes)).ToList();
    }
}
