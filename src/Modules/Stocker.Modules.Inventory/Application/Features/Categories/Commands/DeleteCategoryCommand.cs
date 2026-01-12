using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Categories.Commands;

/// <summary>
/// Command to delete a category
/// </summary>
public class DeleteCategoryCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int CategoryId { get; set; }
}

/// <summary>
/// Validator for DeleteCategoryCommand
/// </summary>
public class DeleteCategoryCommandValidator : AbstractValidator<DeleteCategoryCommand>
{
    public DeleteCategoryCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Kiracı kimliği gereklidir");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("Kategori kimliği 0'dan büyük olmalıdır");
    }
}

/// <summary>
/// Handler for DeleteCategoryCommand
/// </summary>
public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeleteCategoryCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        // Get existing category
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

        // Check if category has products
        var hasProducts = await _unitOfWork.Categories.HasProductsAsync(request.CategoryId, cancellationToken);
        if (hasProducts)
        {
            return Result<bool>.Failure(
                Error.Conflict("Category.HasProducts", "Bu kategoride ürünler bulunmaktadır. Önce ürünleri taşıyın veya silin."));
        }

        // Check if category has subcategories
        var hasSubcategories = await _unitOfWork.Categories.HasSubcategoriesAsync(request.CategoryId, cancellationToken);
        if (hasSubcategories)
        {
            return Result<bool>.Failure(
                Error.Conflict("Category.HasSubcategories", "Bu kategorinin alt kategorileri bulunmaktadır. Önce alt kategorileri silin."));
        }

        // Delete the category
        _unitOfWork.Categories.Remove(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
