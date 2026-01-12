using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Brands.Commands;

/// <summary>
/// Command to delete a brand
/// </summary>
public class DeleteBrandCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int BrandId { get; set; }
}

/// <summary>
/// Validator for DeleteBrandCommand
/// </summary>
public class DeleteBrandCommandValidator : AbstractValidator<DeleteBrandCommand>
{
    public DeleteBrandCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.BrandId).NotEmpty().WithMessage("Marka kimliği gereklidir");
    }
}

/// <summary>
/// Handler for DeleteBrandCommand
/// Uses IInventoryUnitOfWork to ensure repository and SaveChanges use the same DbContext instance
/// </summary>
public class DeleteBrandCommandHandler : IRequestHandler<DeleteBrandCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeleteBrandCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteBrandCommand request, CancellationToken cancellationToken)
    {
        var brand = await _unitOfWork.Brands.GetWithProductsAsync(request.BrandId, cancellationToken);

        if (brand == null)
        {
            return Result<bool>.Failure(new Error("Brand.NotFound", $"Marka bulunamadı (ID: {request.BrandId})", ErrorType.NotFound));
        }

        // Check if brand has products
        if (brand.Products != null && brand.Products.Count > 0)
        {
            return Result<bool>.Failure(new Error("Brand.HasProducts", "Bu markaya ait ürünler bulunmaktadır. Önce ürünleri taşıyın veya silin.", ErrorType.Validation));
        }

        // Soft delete
        brand.Delete("system");
        await _unitOfWork.Brands.UpdateAsync(brand, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
