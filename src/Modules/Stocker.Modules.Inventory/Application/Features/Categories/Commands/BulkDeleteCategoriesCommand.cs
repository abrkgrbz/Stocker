using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.Modules.Inventory.Application.Features.Products.Commands;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Categories.Commands;

/// <summary>
/// Command to bulk delete categories
/// </summary>
public class BulkDeleteCategoriesCommand : IRequest<Result<BulkDeleteResult>>
{
    public Guid TenantId { get; set; }
    public List<int> CategoryIds { get; set; } = new();
}

/// <summary>
/// Validator for BulkDeleteCategoriesCommand
/// </summary>
public class BulkDeleteCategoriesCommandValidator : AbstractValidator<BulkDeleteCategoriesCommand>
{
    public BulkDeleteCategoriesCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.CategoryIds).NotEmpty().WithMessage("En az bir kategori seçilmelidir");
        RuleFor(x => x.CategoryIds.Count).LessThanOrEqualTo(50)
            .WithMessage("Aynı anda en fazla 50 kategori silinebilir");
    }
}

/// <summary>
/// Handler for BulkDeleteCategoriesCommand
/// </summary>
public class BulkDeleteCategoriesCommandHandler : IRequestHandler<BulkDeleteCategoriesCommand, Result<BulkDeleteResult>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public BulkDeleteCategoriesCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BulkDeleteResult>> Handle(BulkDeleteCategoriesCommand request, CancellationToken cancellationToken)
    {
        var result = new BulkDeleteResult
        {
            TotalRequested = request.CategoryIds.Count
        };

        foreach (var categoryId in request.CategoryIds)
        {
            try
            {
                var category = await _unitOfWork.Categories.GetByIdAsync(categoryId, cancellationToken);

                if (category == null)
                {
                    result.FailedCount++;
                    result.Errors.Add(new BulkDeleteError
                    {
                        Id = categoryId,
                        Reason = "Kategori bulunamadı"
                    });
                    continue;
                }

                // Check if category has products
                var hasProducts = await _unitOfWork.Categories.HasProductsAsync(categoryId, cancellationToken);
                if (hasProducts)
                {
                    result.FailedCount++;
                    result.Errors.Add(new BulkDeleteError
                    {
                        Id = categoryId,
                        Reason = "Kategoride ürün bulunmaktadır"
                    });
                    continue;
                }

                // Check if category has subcategories
                var hasSubcategories = await _unitOfWork.Categories.HasSubcategoriesAsync(categoryId, cancellationToken);
                if (hasSubcategories)
                {
                    result.FailedCount++;
                    result.Errors.Add(new BulkDeleteError
                    {
                        Id = categoryId,
                        Reason = "Kategorinin alt kategorileri bulunmaktadır"
                    });
                    continue;
                }

                // Soft delete the category
                category.Delete("system");
                _unitOfWork.Categories.Update(category);
                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                result.FailedCount++;
                result.Errors.Add(new BulkDeleteError
                {
                    Id = categoryId,
                    Reason = ex.Message
                });
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<BulkDeleteResult>.Success(result);
    }
}
