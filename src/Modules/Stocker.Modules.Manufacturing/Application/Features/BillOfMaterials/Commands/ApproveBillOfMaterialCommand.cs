using MediatR;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.BillOfMaterials.Commands;

public record ApproveBillOfMaterialCommand(int Id, string? Notes = null) : IRequest;

public class ApproveBillOfMaterialCommandHandler : IRequestHandler<ApproveBillOfMaterialCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ApproveBillOfMaterialCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(ApproveBillOfMaterialCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var bom = await _unitOfWork.BillOfMaterials.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan ürün reçetesi bulunamadı.");

        // Verify tenant access
        if (bom.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaynağa erişim yetkiniz bulunmamaktadır.");

        if (bom.Status != BomStatus.Taslak)
            throw new InvalidOperationException("Sadece taslak durumundaki ürün reçeteleri onaylanabilir.");

        if (!bom.Lines.Any())
            throw new InvalidOperationException("En az bir malzeme satırı olmadan ürün reçetesi onaylanamaz.");

        bom.Approve(userId.ToString(), command.Notes);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
