using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Categories.Commands;

/// <summary>
/// Command to create a new category
/// </summary>
public class CreateCategoryCommand : IRequest<Result<CategoryDto>>
{
    public Guid TenantId { get; set; }
    public CreateCategoryDto CategoryData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateCategoryCommand
/// </summary>
public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.CategoryData)
            .NotNull().WithMessage("Category data is required");

        When(x => x.CategoryData != null, () =>
        {
            RuleFor(x => x.CategoryData.Code)
                .NotEmpty().WithMessage("Category code is required")
                .MaximumLength(50).WithMessage("Category code must not exceed 50 characters");

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
/// Handler for CreateCategoryCommand
/// </summary>
public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Result<CategoryDto>>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCategoryCommandHandler(
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork)
    {
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CategoryDto>> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        // Check if category with same code already exists
        var existingCategory = await _categoryRepository.GetByCodeAsync(request.CategoryData.Code, cancellationToken);
        if (existingCategory != null)
        {
            return Result<CategoryDto>.Failure(
                Error.Conflict("Category.Code", "A category with this code already exists"));
        }

        // If parent category specified, verify it exists
        Category? parentCategory = null;
        if (request.CategoryData.ParentCategoryId.HasValue)
        {
            parentCategory = await _categoryRepository.GetByIdAsync(
                request.CategoryData.ParentCategoryId.Value, cancellationToken);

            if (parentCategory == null)
            {
                return Result<CategoryDto>.Failure(
                    Error.NotFound("Category", $"Parent category with ID {request.CategoryData.ParentCategoryId} not found"));
            }
        }

        // Create the category
        var category = new Category(
            request.CategoryData.Code,
            request.CategoryData.Name,
            request.CategoryData.ParentCategoryId);

        // Set tenant ID
        category.SetTenantId(request.TenantId);

        if (!string.IsNullOrEmpty(request.CategoryData.Description))
        {
            category.UpdateCategory(request.CategoryData.Name, request.CategoryData.Description, request.CategoryData.ParentCategoryId);
        }

        category.SetDisplayOrder(request.CategoryData.DisplayOrder);

        // Save to repository
        await _categoryRepository.AddAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var categoryDto = new CategoryDto
        {
            Id = category.Id,
            Code = category.Code,
            Name = category.Name,
            Description = category.Description,
            ParentCategoryId = category.ParentCategoryId,
            ParentCategoryName = parentCategory?.Name,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedDate,
            ProductCount = 0
        };

        return Result<CategoryDto>.Success(categoryDto);
    }
}
