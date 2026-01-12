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
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("Category ID must be greater than 0");
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
                Error.NotFound("Category", $"Category with ID {request.CategoryId} not found"));
        }

        // Verify tenant ownership
        if (category.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(
                Error.NotFound("Category", $"Category with ID {request.CategoryId} not found"));
        }

        // Check if category has products
        var hasProducts = await _unitOfWork.Categories.HasProductsAsync(request.CategoryId, cancellationToken);
        if (hasProducts)
        {
            return Result<bool>.Failure(
                Error.Conflict("Category.HasProducts", "Cannot delete category that has products. Please move or delete the products first."));
        }

        // Check if category has subcategories
        var hasSubcategories = await _unitOfWork.Categories.HasSubcategoriesAsync(request.CategoryId, cancellationToken);
        if (hasSubcategories)
        {
            return Result<bool>.Failure(
                Error.Conflict("Category.HasSubcategories", "Cannot delete category that has subcategories. Please delete the subcategories first."));
        }

        // Delete the category
        _unitOfWork.Categories.Remove(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
