using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Categories.Commands;

/// <summary>
/// Command to update an existing category
/// </summary>
public class UpdateCategoryCommand : IRequest<Result<CategoryDto>>
{
    public Guid TenantId { get; set; }
    public int CategoryId { get; set; }
    public UpdateCategoryDto CategoryData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateCategoryCommand
/// </summary>
public class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("Category ID must be greater than 0");

        RuleFor(x => x.CategoryData)
            .NotNull().WithMessage("Category data is required");

        When(x => x.CategoryData != null, () =>
        {
            RuleFor(x => x.CategoryData.Name)
                .NotEmpty().WithMessage("Category name is required")
                .MaximumLength(100).WithMessage("Category name must not exceed 100 characters");

            RuleFor(x => x.CategoryData.Description)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

            RuleFor(x => x.CategoryData.DisplayOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Display order cannot be negative");
        });
    }
}

/// <summary>
/// Handler for UpdateCategoryCommand
/// </summary>
public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, Result<CategoryDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public UpdateCategoryCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CategoryDto>> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        // Get existing category
        var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId, cancellationToken);
        if (category == null)
        {
            return Result<CategoryDto>.Failure(
                Error.NotFound("Category", $"Category with ID {request.CategoryId} not found"));
        }

        // Verify tenant ownership
        if (category.TenantId != request.TenantId)
        {
            return Result<CategoryDto>.Failure(
                Error.NotFound("Category", $"Category with ID {request.CategoryId} not found"));
        }

        // If parent category specified, verify it exists and is not the same category
        string? parentCategoryName = null;
        if (request.CategoryData.ParentCategoryId.HasValue)
        {
            if (request.CategoryData.ParentCategoryId.Value == request.CategoryId)
            {
                return Result<CategoryDto>.Failure(
                    Error.Validation("Category.ParentCategoryId", "A category cannot be its own parent"));
            }

            var parentCategory = await _unitOfWork.Categories.GetByIdAsync(
                request.CategoryData.ParentCategoryId.Value, cancellationToken);

            if (parentCategory == null)
            {
                return Result<CategoryDto>.Failure(
                    Error.NotFound("Category", $"Parent category with ID {request.CategoryData.ParentCategoryId} not found"));
            }

            parentCategoryName = parentCategory.Name;
        }

        // Update the category
        category.UpdateCategory(
            request.CategoryData.Name,
            request.CategoryData.Description,
            request.CategoryData.ParentCategoryId);

        category.SetDisplayOrder(request.CategoryData.DisplayOrder);

        // Save changes
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var categoryDto = new CategoryDto
        {
            Id = category.Id,
            Code = category.Code,
            Name = category.Name,
            Description = category.Description,
            ParentCategoryId = category.ParentCategoryId,
            ParentCategoryName = parentCategoryName,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedDate,
            UpdatedAt = category.UpdatedDate,
            ProductCount = 0
        };

        return Result<CategoryDto>.Success(categoryDto);
    }
}
