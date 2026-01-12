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
    // Regex: Only letters (including Turkish chars), numbers, spaces, and hyphens allowed
    private static readonly System.Text.RegularExpressions.Regex ValidNamePattern = 
        new(@"^[\p{L}\p{N}\s\-]+$", System.Text.RegularExpressions.RegexOptions.Compiled);

    public UpdateCategoryCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Kiracı kimliği gereklidir");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("Kategori kimliği 0'dan büyük olmalıdır");

        RuleFor(x => x.CategoryData)
            .NotNull().WithMessage("Kategori bilgileri gereklidir");

        When(x => x.CategoryData != null, () =>
        {
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
                Error.NotFound("Category", $"Kategori bulunamadı (ID: {request.CategoryId})"));
        }

        // Verify tenant ownership
        if (category.TenantId != request.TenantId)
        {
            return Result<CategoryDto>.Failure(
                Error.NotFound("Category", $"Kategori bulunamadı (ID: {request.CategoryId})"));
        }

        // If parent category specified, verify it exists and is not the same category
        string? parentCategoryName = null;
        if (request.CategoryData.ParentCategoryId.HasValue)
        {
            if (request.CategoryData.ParentCategoryId.Value == request.CategoryId)
            {
                return Result<CategoryDto>.Failure(
                    Error.Validation("Category.ParentCategoryId", "Bir kategori kendi üst kategorisi olamaz"));
            }

            var parentCategory = await _unitOfWork.Categories.GetByIdAsync(
                request.CategoryData.ParentCategoryId.Value, cancellationToken);

            if (parentCategory == null)
            {
                return Result<CategoryDto>.Failure(
                    Error.NotFound("Category", $"Üst kategori bulunamadı (ID: {request.CategoryData.ParentCategoryId})"));
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
