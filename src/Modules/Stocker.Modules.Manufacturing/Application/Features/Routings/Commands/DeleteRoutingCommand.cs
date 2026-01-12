using MediatR;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.Routings.Commands;

public record DeleteRoutingCommand(int Id) : IRequest;

public class DeleteRoutingCommandHandler : IRequestHandler<DeleteRoutingCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteRoutingCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteRoutingCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var routing = await _unitOfWork.Routings.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan rota bulunamadı.");
        
        // Verify tenant access
        if (routing.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaynağa erişim yetkiniz bulunmamaktadır.");

        if (routing.Status == RoutingStatus.Aktif)
            throw new InvalidOperationException("Aktif durumdaki rota silinemez. Önce pasif duruma getiriniz.");

        // Check if routing is used in any production orders
        if (await _unitOfWork.Routings.HasActiveProductionOrdersAsync(command.Id, cancellationToken))
            throw new InvalidOperationException("Bu rota aktif üretim emirlerinde kullanılmaktadır ve silinemez.");

        _unitOfWork.Routings.Delete(routing);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
