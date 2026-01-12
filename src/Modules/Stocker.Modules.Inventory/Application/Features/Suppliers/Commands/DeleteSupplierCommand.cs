using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Suppliers.Commands;

/// <summary>
/// Command to delete a supplier
/// </summary>
public class DeleteSupplierCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int SupplierId { get; set; }
}

/// <summary>
/// Validator for DeleteSupplierCommand
/// </summary>
public class DeleteSupplierCommandValidator : AbstractValidator<DeleteSupplierCommand>
{
    public DeleteSupplierCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Kiracı kimliği gereklidir");

        RuleFor(x => x.SupplierId)
            .GreaterThan(0).WithMessage("Tedarikçi kimliği 0'dan büyük olmalıdır");
    }
}

/// <summary>
/// Handler for DeleteSupplierCommand
/// </summary>
public class DeleteSupplierCommandHandler : IRequestHandler<DeleteSupplierCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeleteSupplierCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteSupplierCommand request, CancellationToken cancellationToken)
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

        // Check if supplier has products
        if (supplier.Products != null && supplier.Products.Count > 0)
        {
            return Result<bool>.Failure(
                Error.Validation("Supplier.HasProducts", "Bu tedarikçiye ait ürünler bulunmaktadır. Önce ürünleri taşıyın veya silin."));
        }

        // Soft delete
        supplier.Delete("system");
        await _unitOfWork.Suppliers.UpdateAsync(supplier, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
