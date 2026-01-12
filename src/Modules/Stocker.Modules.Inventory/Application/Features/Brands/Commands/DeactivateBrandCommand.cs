using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Brands.Commands;

/// <summary>
/// Command to deactivate a brand
/// </summary>
public class DeactivateBrandCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int BrandId { get; set; }
}

/// <summary>
/// Handler for DeactivateBrandCommand
/// </summary>
public class DeactivateBrandCommandHandler : IRequestHandler<DeactivateBrandCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeactivateBrandCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeactivateBrandCommand request, CancellationToken cancellationToken)
    {
        var brand = await _unitOfWork.Brands.GetWithProductsAsync(request.BrandId, cancellationToken);

        if (brand == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Brand", $"Marka bulunamadı (ID: {request.BrandId})"));
        }

        // Verify tenant ownership
        if (brand.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(
                Error.NotFound("Brand", $"Marka bulunamadı (ID: {request.BrandId})"));
        }

        // Check if brand has active products
        if (brand.Products != null && brand.Products.Any(p => p.IsActive))
        {
            return Result<bool>.Failure(
                Error.Validation("Brand.HasActiveProducts", "Aktif ürünleri olan marka pasife alınamaz. Önce ürünleri pasife alın veya başka markaya taşıyın."));
        }

        brand.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
