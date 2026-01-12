using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.MrpPlans.Commands;

public record CreateMrpPlanCommand(CreateMrpPlanRequest Request) : IRequest<MrpPlanDto>;

public class CreateMrpPlanCommandHandler : IRequestHandler<CreateMrpPlanCommand, MrpPlanDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CreateMrpPlanCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MrpPlanDto> Handle(CreateMrpPlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var planNumber = $"MRP-{DateTime.UtcNow:yyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

        if (!Enum.TryParse<MrpPlanType>(request.Type, out var planType))
            throw new ArgumentException($"Geçersiz plan tipi: {request.Type}");

        if (!Enum.TryParse<LotSizingMethod>(request.DefaultLotSizingMethod, out var lotSizingMethod))
            throw new ArgumentException($"Geçersiz lot boyutlandırma yöntemi: {request.DefaultLotSizingMethod}");

        var plan = new MrpPlan(
            planNumber,
            request.Name,
            planType,
            request.PlanningHorizonStart,
            request.PlanningHorizonEnd);

        plan.SetPlanningParameters(
            request.PlanningBucketDays,
            request.IncludeSafetyStock,
            request.ConsiderLeadTimes,
            request.NetChangeOnly);

        plan.SetLotSizingMethod(
            lotSizingMethod,
            request.FixedOrderQuantity,
            request.PeriodsOfSupply);

        if (!string.IsNullOrEmpty(request.Notes))
            plan.SetNotes(request.Notes);

        _unitOfWork.MrpPlans.Add(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
        null, null, null);
}

public record ExecuteMrpPlanCommand(int Id, ExecuteMrpPlanRequest Request) : IRequest;

public class ExecuteMrpPlanCommandHandler : IRequestHandler<ExecuteMrpPlanCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ExecuteMrpPlanCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(ExecuteMrpPlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var plan = await _unitOfWork.MrpPlans.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan MRP planı bulunamadı.");

        if (plan.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu plana erişim yetkiniz yok.");

        plan.StartExecution(userName);

        // MRP hesaplama burada yapılacak - şimdilik sadece status güncellemesi
        // TODO: IMrpCalculationService.ExecuteMrpAsync çağrılacak

        plan.CompleteExecution(0, 0, 0); // Placeholder values

        _unitOfWork.MrpPlans.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record ApproveMrpPlanCommand(int Id) : IRequest;

public class ApproveMrpPlanCommandHandler : IRequestHandler<ApproveMrpPlanCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ApproveMrpPlanCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(ApproveMrpPlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var plan = await _unitOfWork.MrpPlans.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan MRP planı bulunamadı.");

        if (plan.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu plana erişim yetkiniz yok.");

        plan.Approve(userName);

        _unitOfWork.MrpPlans.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record CancelMrpPlanCommand(int Id) : IRequest;

public class CancelMrpPlanCommandHandler : IRequestHandler<CancelMrpPlanCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CancelMrpPlanCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CancelMrpPlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var plan = await _unitOfWork.MrpPlans.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan MRP planı bulunamadı.");

        if (plan.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu planı iptal etme yetkiniz yok.");

        plan.Cancel();

        _unitOfWork.MrpPlans.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record DeleteMrpPlanCommand(int Id) : IRequest;

public class DeleteMrpPlanCommandHandler : IRequestHandler<DeleteMrpPlanCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteMrpPlanCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteMrpPlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var plan = await _unitOfWork.MrpPlans.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan MRP planı bulunamadı.");

        if (plan.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu planı silme yetkiniz yok.");

        if (plan.Status == MrpPlanStatus.Onaylandı)
            throw new InvalidOperationException("Onaylanmış plan silinemez.");

        _unitOfWork.MrpPlans.Delete(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
