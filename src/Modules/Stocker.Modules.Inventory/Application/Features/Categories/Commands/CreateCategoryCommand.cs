using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
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
    // Regex: Only letters (including Turkish chars), numbers, spaces, and hyphens allowed
    private static readonly System.Text.RegularExpressions.Regex ValidNamePattern = 
        new(@"^[\p{L}\p{N}\s\-]+$", System.Text.RegularExpressions.RegexOptions.Compiled);

    public CreateCategoryCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Kiracı kimliği gereklidir");

        RuleFor(x => x.CategoryData)
            .NotNull().WithMessage("Kategori bilgileri gereklidir");

        When(x => x.CategoryData != null, () =>
        {
            RuleFor(x => x.CategoryData.Code)
                .NotEmpty().WithMessage("Kategori kodu gereklidir")
                .MinimumLength(2).WithMessage("Kategori kodu en az 2 karakter olmalıdır")
                .MaximumLength(50).WithMessage("Kategori kodu en fazla 50 karakter olabilir")
                .Must(code => !string.IsNullOrEmpty(code) && ValidNamePattern.IsMatch(code))
                .WithMessage("Kategori kodu sadece harf, rakam, boşluk ve tire içerebilir. Özel karakterlere izin verilmez.");

            RuleFor(x => x.CategoryData.Name)
                .NotEmpty().WithMessage("Kategori adı gereklidir")
                .MinimumLength(2).WithMessage("Kategori adı en az 2 karakter olmalıdır")
                .MaximumLength(100).WithMessage("Kategori adı en fazla 100 karakter olabilir")
                .Must(name => !string.IsNullOrEmpty(name) && ValidNamePattern.IsMatch(name))
                .WithMessage("Kategori adı sadece harf, rakam, boşluk ve tire içerebilir. Özel karakterlere izin verilmez.");

            RuleFor(x => x.CategoryData.Description)
                .MaximumLength(500).WithMessage("Açıklama en fazla 500 karakter olabilir");

            RuleFor(x => x.CategoryData.DisplayOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Görüntüleme sırası negatif olamaz");
        });
    }
}

/// <summary>
/// Handler for CreateCategoryCommand
/// Uses IInventoryUnitOfWork to ensure repository and SaveChanges use the same DbContext instance
/// </summary>
public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Result<CategoryDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateCategoryCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CategoryDto>> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        // Check if category with same code already exists
        var existingCategory = await _unitOfWork.Categories.GetByCodeAsync(request.CategoryData.Code, cancellationToken);
        if (existingCategory != null)
        {
            return Result<CategoryDto>.Failure(
                Error.Conflict("Category.Code", "Bu kategori kodu zaten kullanılmaktadır"));
        }

        // If parent category specified, verify it exists
        Category? parentCategory = null;
        if (request.CategoryData.ParentCategoryId.HasValue)
        {
            parentCategory = await _unitOfWork.Categories.GetByIdAsync(
                request.CategoryData.ParentCategoryId.Value, cancellationToken);

            if (parentCategory == null)
            {
                return Result<CategoryDto>.Failure(
                    Error.NotFound("Category", $"Üst kategori bulunamadı (ID: {request.CategoryData.ParentCategoryId})"));
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
        await _unitOfWork.Categories.AddAsync(category, cancellationToken);
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
