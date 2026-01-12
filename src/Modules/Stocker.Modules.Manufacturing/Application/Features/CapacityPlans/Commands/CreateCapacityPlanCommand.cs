using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.CapacityPlans.Commands;

public record CreateCapacityPlanCommand(CreateCapacityPlanRequest Request) : IRequest<CapacityPlanDto>;

public class CreateCapacityPlanCommandHandler : IRequestHandler<CreateCapacityPlanCommand, CapacityPlanDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CreateCapacityPlanCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CapacityPlanDto> Handle(CreateCapacityPlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var planNumber = $"CRP-{DateTime.UtcNow:yyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

        var plan = new CapacityPlan(
            planNumber,
            request.Name,
            request.PlanningHorizonStart,
            request.PlanningHorizonEnd);

        plan.SetMrpPlan(request.MrpPlanId);

        plan.SetPlanningParameters(
            request.PlanningBucketDays,
            request.IsFiniteCapacity,
            request.IncludeSetupTime,
            request.IncludeQueueTime,
            request.IncludeMoveTime);

        plan.SetThresholds(request.OverloadThreshold, request.BottleneckThreshold);

        if (!string.IsNullOrEmpty(request.Notes))
            plan.SetNotes(request.Notes);

        _unitOfWork.CapacityPlans.Add(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
        null, null);
}

public record ExecuteCapacityPlanCommand(int Id, ExecuteCapacityPlanRequest Request) : IRequest;

public class ExecuteCapacityPlanCommandHandler : IRequestHandler<ExecuteCapacityPlanCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ExecuteCapacityPlanCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(ExecuteCapacityPlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var plan = await _unitOfWork.CapacityPlans.GetWithRequirementsAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan kapasite planı bulunamadı.");

        if (plan.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu plana erişim yetkiniz yok.");

        plan.StartExecution(userName);

        // Get active work centers
        var workCenters = await _unitOfWork.WorkCenters.GetActiveAsync(tenantId, cancellationToken);
        var workCenterIds = command.Request.WorkCenterIds?.Length > 0
            ? command.Request.WorkCenterIds
            : workCenters.Select(w => w.Id).ToArray();

        var relevantWorkCenters = workCenters.Where(w => workCenterIds.Contains(w.Id)).ToList();

        // Calculate capacity for each work center and period
        int overloadedPeriods = 0;
        int bottleneckCount = 0;
        decimal totalUtilization = 0;
        int periodCount = 0;

        foreach (var workCenter in relevantWorkCenters)
        {
            var currentDate = plan.PlanningHorizonStart;
            int periodNumber = 1;

            while (currentDate <= plan.PlanningHorizonEnd)
            {
                var periodEnd = currentDate.AddDays(plan.PlanningBucketDays);
                var availableCapacity = workCenter.CalculateAvailableCapacity(currentDate) * plan.PlanningBucketDays;

                // Get production orders in this period for this work center
                // TODO: Calculate actual required capacity from production orders and planned orders
                decimal requiredCapacity = 0; // Placeholder - will be calculated from operations

                var requirement = plan.AddRequirement(workCenter.Id, currentDate, requiredCapacity, availableCapacity);
                requirement.SetPeriodNumber(periodNumber);

                // Track statistics
                if (requirement.LoadPercent >= plan.OverloadThreshold)
                    overloadedPeriods++;
                if (requirement.Status == Domain.Enums.CapacityStatus.Darboğaz)
                    bottleneckCount++;

                totalUtilization += requirement.LoadPercent;
                periodCount++;

                // Check for exceptions
                if (requirement.LoadPercent > plan.OverloadThreshold)
                {
                    plan.AddException(
                        workCenter.Id,
                        currentDate,
                        CapacityExceptionType.AşırıYükleme,
                        $"İş merkezi '{workCenter.Name}' dönem {periodNumber}'de %{requirement.LoadPercent:F1} yüklenme oranına sahip.");
                }

                currentDate = periodEnd;
                periodNumber++;
            }

            if (workCenter.IsBottleneck)
                bottleneckCount++;
        }

        var avgUtilization = periodCount > 0 ? totalUtilization / periodCount : 0;
        plan.CompleteExecution(relevantWorkCenters.Count, overloadedPeriods, bottleneckCount, avgUtilization);

        _unitOfWork.CapacityPlans.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record ApproveCapacityPlanCommand(int Id) : IRequest;

public class ApproveCapacityPlanCommandHandler : IRequestHandler<ApproveCapacityPlanCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ApproveCapacityPlanCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(ApproveCapacityPlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var plan = await _unitOfWork.CapacityPlans.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan kapasite planı bulunamadı.");

        if (plan.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu plana erişim yetkiniz yok.");

        plan.Approve(userName);

        _unitOfWork.CapacityPlans.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record CancelCapacityPlanCommand(int Id) : IRequest;

public class CancelCapacityPlanCommandHandler : IRequestHandler<CancelCapacityPlanCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CancelCapacityPlanCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CancelCapacityPlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var plan = await _unitOfWork.CapacityPlans.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan kapasite planı bulunamadı.");

        if (plan.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu planı iptal etme yetkiniz yok.");

        plan.Cancel();

        _unitOfWork.CapacityPlans.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record DeleteCapacityPlanCommand(int Id) : IRequest;

public class DeleteCapacityPlanCommandHandler : IRequestHandler<DeleteCapacityPlanCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteCapacityPlanCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteCapacityPlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var plan = await _unitOfWork.CapacityPlans.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan kapasite planı bulunamadı.");

        if (plan.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu planı silme yetkiniz yok.");

        if (plan.Status == CapacityPlanStatus.Onaylandı)
            throw new InvalidOperationException("Onaylanmış plan silinemez.");

        _unitOfWork.CapacityPlans.Delete(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record ResolveCapacityExceptionCommand(int PlanId, int ExceptionId, ResolveCapacityExceptionRequest Request) : IRequest;

public class ResolveCapacityExceptionCommandHandler : IRequestHandler<ResolveCapacityExceptionCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ResolveCapacityExceptionCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(ResolveCapacityExceptionCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var plan = await _unitOfWork.CapacityPlans.GetWithExceptionsAsync(command.PlanId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.PlanId}' olan kapasite planı bulunamadı.");

        if (plan.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu plana erişim yetkiniz yok.");

        var exception = plan.Exceptions.FirstOrDefault(e => e.Id == command.ExceptionId)
            ?? throw new KeyNotFoundException($"ID '{command.ExceptionId}' olan istisna bulunamadı.");

        exception.Resolve(userName, command.Request.ResolutionNotes);

        _unitOfWork.CapacityPlans.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
