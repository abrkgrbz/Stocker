using MediatR;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.Routings.Commands;

public record ActivateRoutingCommand(int Id) : IRequest;

public class ActivateRoutingCommandHandler : IRequestHandler<ActivateRoutingCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public ActivateRoutingCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ActivateRoutingCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var routing = await _unitOfWork.Routings.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan rota bulunamadı.");
        
        // Verify tenant access
        if (routing.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaynağa erişim yetkiniz bulunmamaktadır.");

        if (routing.Status != RoutingStatus.Onaylandı)
            throw new InvalidOperationException("Sadece onaylanmış rotalar aktif edilebilir.");

        routing.ChangeStatus(RoutingStatus.Aktif);
        routing.Activate();

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record DeactivateRoutingCommand(int Id) : IRequest;

public class DeactivateRoutingCommandHandler : IRequestHandler<DeactivateRoutingCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeactivateRoutingCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeactivateRoutingCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var routing = await _unitOfWork.Routings.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan rota bulunamadı.");
        
        // Verify tenant access
        if (routing.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaynağa erişim yetkiniz bulunmamaktadır.");

        routing.ChangeStatus(RoutingStatus.Pasif);
        routing.Deactivate();

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
