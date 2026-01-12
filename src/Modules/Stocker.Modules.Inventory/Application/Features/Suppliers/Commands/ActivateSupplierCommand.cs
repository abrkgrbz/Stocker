using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Suppliers.Commands;

/// <summary>
/// Command to activate a supplier
/// </summary>
public class ActivateSupplierCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int SupplierId { get; set; }
}

/// <summary>
/// Handler for ActivateSupplierCommand
/// </summary>
public class ActivateSupplierCommandHandler : IRequestHandler<ActivateSupplierCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ActivateSupplierCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ActivateSupplierCommand request, CancellationToken cancellationToken)
    {
        var supplier = await _unitOfWork.Suppliers.GetByIdAsync(request.SupplierId, cancellationToken);

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

        supplier.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
