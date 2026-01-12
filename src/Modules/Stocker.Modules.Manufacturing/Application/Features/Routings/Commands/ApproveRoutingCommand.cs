using MediatR;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.Routings.Commands;

public record ApproveRoutingCommand(int Id, string? Notes = null) : IRequest;

public class ApproveRoutingCommandHandler : IRequestHandler<ApproveRoutingCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ApproveRoutingCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(ApproveRoutingCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var routing = await _unitOfWork.Routings.GetByIdWithOperationsAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan rota bulunamadı.");
        
        // Verify tenant access
        if (routing.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaynağa erişim yetkiniz bulunmamaktadır.");

        if (routing.Status != RoutingStatus.Taslak)
            throw new InvalidOperationException("Sadece taslak durumundaki rotalar onaylanabilir.");

        if (!routing.Operations.Any())
            throw new InvalidOperationException("En az bir operasyon olmadan rota onaylanamaz.");

        routing.Approve(userId.ToString(), command.Notes);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
