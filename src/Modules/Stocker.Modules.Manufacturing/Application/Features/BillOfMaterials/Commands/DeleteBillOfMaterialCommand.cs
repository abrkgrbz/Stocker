using MediatR;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.BillOfMaterials.Commands;

public record DeleteBillOfMaterialCommand(int Id) : IRequest;

public class DeleteBillOfMaterialCommandHandler : IRequestHandler<DeleteBillOfMaterialCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteBillOfMaterialCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteBillOfMaterialCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var bom = await _unitOfWork.BillOfMaterials.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan ürün reçetesi bulunamadı.");

        // Verify tenant access
        if (bom.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaynağa erişim yetkiniz bulunmamaktadır.");

        if (bom.Status == BomStatus.Aktif)
            throw new InvalidOperationException("Aktif durumdaki ürün reçetesi silinemez. Önce pasif duruma getiriniz.");

        // Check if BOM is used in any production orders
        if (await _unitOfWork.BillOfMaterials.HasActiveProductionOrdersAsync(command.Id, cancellationToken))
            throw new InvalidOperationException("Bu ürün reçetesi aktif üretim emirlerinde kullanılmaktadır ve silinemez.");

        _unitOfWork.BillOfMaterials.Delete(bom);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
