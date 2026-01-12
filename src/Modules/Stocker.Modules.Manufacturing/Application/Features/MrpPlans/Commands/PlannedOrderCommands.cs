using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.MrpPlans.Commands;

public record ConfirmPlannedOrderCommand(int PlanId, int OrderId, ConfirmPlannedOrderRequest Request) : IRequest;

public class ConfirmPlannedOrderCommandHandler : IRequestHandler<ConfirmPlannedOrderCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public ConfirmPlannedOrderCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ConfirmPlannedOrderCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var plan = await _unitOfWork.MrpPlans.GetWithPlannedOrdersAsync(command.PlanId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.PlanId}' olan MRP planı bulunamadı.");

        if (plan.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu plana erişim yetkiniz yok.");

        var order = plan.PlannedOrders.FirstOrDefault(o => o.Id == command.OrderId)
            ?? throw new KeyNotFoundException($"ID '{command.OrderId}' olan planlı sipariş bulunamadı.");

        order.Confirm();

        if (!string.IsNullOrEmpty(command.Request.Notes))
            order.SetNotes(command.Request.Notes);

        _unitOfWork.MrpPlans.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record ReleasePlannedOrderCommand(int PlanId, int OrderId, ReleasePlannedOrderRequest Request) : IRequest;

public class ReleasePlannedOrderCommandHandler : IRequestHandler<ReleasePlannedOrderCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public ReleasePlannedOrderCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ReleasePlannedOrderCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var plan = await _unitOfWork.MrpPlans.GetWithPlannedOrdersAsync(command.PlanId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.PlanId}' olan MRP planı bulunamadı.");

        if (plan.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu plana erişim yetkiniz yok.");

        var order = plan.PlannedOrders.FirstOrDefault(o => o.Id == command.OrderId)
            ?? throw new KeyNotFoundException($"ID '{command.OrderId}' olan planlı sipariş bulunamadı.");

        order.Release();

        if (!string.IsNullOrEmpty(command.Request.Notes))
            order.SetNotes(command.Request.Notes);

        _unitOfWork.MrpPlans.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record ConvertPlannedOrderCommand(int PlanId, int OrderId, ConvertPlannedOrderRequest Request) : IRequest<int>;

public class ConvertPlannedOrderCommandHandler : IRequestHandler<ConvertPlannedOrderCommand, int>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ConvertPlannedOrderCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<int> Handle(ConvertPlannedOrderCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var plan = await _unitOfWork.MrpPlans.GetWithPlannedOrdersAsync(command.PlanId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.PlanId}' olan MRP planı bulunamadı.");

        if (plan.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu plana erişim yetkiniz yok.");

        var order = plan.PlannedOrders.FirstOrDefault(o => o.Id == command.OrderId)
            ?? throw new KeyNotFoundException($"ID '{command.OrderId}' olan planlı sipariş bulunamadı.");

        // ConvertedOrderId ve ConvertedOrderType request'ten geliyor
        order.ConvertToOrder(command.Request.ConvertedOrderId, command.Request.ConvertedOrderType, userName);

        if (!string.IsNullOrEmpty(command.Request.Notes))
            order.SetNotes(command.Request.Notes);

        _unitOfWork.MrpPlans.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return command.Request.ConvertedOrderId;
    }
}

public record ResolveMrpExceptionCommand(int PlanId, int ExceptionId, ResolveMrpExceptionRequest Request) : IRequest;

public class ResolveMrpExceptionCommandHandler : IRequestHandler<ResolveMrpExceptionCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ResolveMrpExceptionCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(ResolveMrpExceptionCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var plan = await _unitOfWork.MrpPlans.GetWithExceptionsAsync(command.PlanId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.PlanId}' olan MRP planı bulunamadı.");

        if (plan.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu plana erişim yetkiniz yok.");

        var exception = plan.Exceptions.FirstOrDefault(e => e.Id == command.ExceptionId)
            ?? throw new KeyNotFoundException($"ID '{command.ExceptionId}' olan istisna bulunamadı.");

        exception.Resolve(userName, command.Request.ResolutionNotes);

        _unitOfWork.MrpPlans.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
