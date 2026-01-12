using MediatR;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.BillOfMaterials.Commands;

public record ActivateBillOfMaterialCommand(int Id) : IRequest;

public class ActivateBillOfMaterialCommandHandler : IRequestHandler<ActivateBillOfMaterialCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public ActivateBillOfMaterialCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ActivateBillOfMaterialCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var bom = await _unitOfWork.BillOfMaterials.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan ürün reçetesi bulunamadı.");

        // Verify tenant access
        if (bom.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaynağa erişim yetkiniz bulunmamaktadır.");

        if (bom.Status != BomStatus.Onaylandı)
            throw new InvalidOperationException("Sadece onaylanmış ürün reçeteleri aktif edilebilir.");

        bom.ChangeStatus(BomStatus.Aktif);
        bom.Activate();

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record DeactivateBillOfMaterialCommand(int Id) : IRequest;

public class DeactivateBillOfMaterialCommandHandler : IRequestHandler<DeactivateBillOfMaterialCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeactivateBillOfMaterialCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeactivateBillOfMaterialCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var bom = await _unitOfWork.BillOfMaterials.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan ürün reçetesi bulunamadı.");

        // Verify tenant access
        if (bom.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaynağa erişim yetkiniz bulunmamaktadır.");

        bom.ChangeStatus(BomStatus.Pasif);
        bom.Deactivate();

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
