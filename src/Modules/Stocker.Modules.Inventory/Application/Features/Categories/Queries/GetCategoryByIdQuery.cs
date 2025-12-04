using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Categories.Queries;

/// <summary>
/// Query to get a category by ID
/// </summary>
public class GetCategoryByIdQuery : IRequest<Result<CategoryDto>>
{
    public Guid TenantId { get; set; }
    public int CategoryId { get; set; }
}

/// <summary>
/// Handler for GetCategoryByIdQuery
/// </summary>
public class GetCategoryByIdQueryHandler : IRequestHandler<GetCategoryByIdQuery, Result<CategoryDto>>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IProductRepository _productRepository;

    public GetCategoryByIdQueryHandler(
        ICategoryRepository categoryRepository,
        IProductRepository productRepository)
    {
        _categoryRepository = categoryRepository;
        _productRepository = productRepository;
    }

    public async Task<Result<CategoryDto>> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);

        if (category == null)
        {
            return Result<CategoryDto>.Failure(
                Error.NotFound("Category", $"Category with ID {request.CategoryId} not found"));
        }

        var productCount = await _productRepository.GetCountByCategoryAsync(category.Id, cancellationToken);
        var parentCategory = category.ParentCategoryId.HasValue
            ? await _categoryRepository.GetByIdAsync(category.ParentCategoryId.Value, cancellationToken)
            : null;

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
            ProductCount = productCount
        };

        return Result<CategoryDto>.Success(categoryDto);
    }
}
