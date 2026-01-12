using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Suppliers.Commands;

/// <summary>
/// Command to deactivate a supplier
/// </summary>
public class DeactivateSupplierCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int SupplierId { get; set; }
}

/// <summary>
/// Handler for DeactivateSupplierCommand
/// </summary>
public class DeactivateSupplierCommandHandler : IRequestHandler<DeactivateSupplierCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeactivateSupplierCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeactivateSupplierCommand request, CancellationToken cancellationToken)
    {
        var supplier = await _unitOfWork.Suppliers.GetWithProductsAsync(request.SupplierId, cancellationToken);

        if (supplier == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Supplier", $"Tedarikçi bulunamadı (ID: {request.SupplierId})"));
        }

        // Verify tenant ownership
        if (supplier.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(
                Error.NotFound("Supplier", $"Tedarikçi bulunamadı (ID: {request.SupplierId})"));
        }

        // Check if supplier has active products
        if (supplier.Products != null && supplier.Products.Any(p => p.IsActive))
        {
            return Result<bool>.Failure(
                Error.Validation("Supplier.HasActiveProducts", "Aktif ürünleri olan tedarikçi pasife alınamaz. Önce ürünleri pasife alın veya başka tedarikçiye taşıyın."));
        }

        supplier.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
