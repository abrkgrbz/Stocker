using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Categories.Commands;

/// <summary>
/// Command to deactivate a category
/// </summary>
public class DeactivateCategoryCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int CategoryId { get; set; }
}

/// <summary>
/// Handler for DeactivateCategoryCommand
/// </summary>
public class DeactivateCategoryCommandHandler : IRequestHandler<DeactivateCategoryCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeactivateCategoryCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeactivateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId, cancellationToken);
        
        if (category == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Category", $"Kategori bulunamadı (ID: {request.CategoryId})"));
        }

        // Verify tenant ownership
        if (category.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(
                Error.NotFound("Category", $"Kategori bulunamadı (ID: {request.CategoryId})"));
        }

        // Check if category has active products
        var hasActiveProducts = await _unitOfWork.Categories.HasActiveProductsAsync(request.CategoryId, cancellationToken);
        if (hasActiveProducts)
        {
            return Result<bool>.Failure(
                Error.Validation("Category.HasActiveProducts", "Aktif ürünleri olan kategori pasife alınamaz. Önce ürünleri pasife alın veya başka kategoriye taşıyın."));
        }

        category.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
