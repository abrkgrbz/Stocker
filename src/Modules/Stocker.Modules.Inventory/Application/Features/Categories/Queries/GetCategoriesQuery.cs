using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Categories.Queries;

/// <summary>
/// Query to get all categories
/// </summary>
public class GetCategoriesQuery : IRequest<Result<List<CategoryDto>>>
{
    public Guid TenantId { get; set; }
    public bool IncludeInactive { get; set; } = false;
    public int? ParentCategoryId { get; set; }
}

/// <summary>
/// Handler for GetCategoriesQuery
/// </summary>
public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, Result<List<CategoryDto>>>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IProductRepository _productRepository;

    public GetCategoriesQueryHandler(
        ICategoryRepository categoryRepository,
        IProductRepository productRepository)
    {
        _categoryRepository = categoryRepository;
        _productRepository = productRepository;
    }

    public async Task<Result<List<CategoryDto>>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Category> categories;

        if (request.ParentCategoryId.HasValue)
        {
            categories = await _categoryRepository.GetSubCategoriesAsync(request.ParentCategoryId.Value, cancellationToken);
        }
        else
        {
            categories = await _categoryRepository.GetRootCategoriesAsync(cancellationToken);
        }

        if (!request.IncludeInactive)
        {
            categories = categories.Where(c => c.IsActive).ToList();
        }

        var categoryDtos = new List<CategoryDto>();
        foreach (var category in categories)
        {
            var productCount = await _productRepository.GetCountByCategoryAsync(category.Id, cancellationToken);
            var parentCategory = category.ParentCategoryId.HasValue
                ? await _categoryRepository.GetByIdAsync(category.ParentCategoryId.Value, cancellationToken)
                : null;

            categoryDtos.Add(new CategoryDto
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
            });
        }

        return Result<List<CategoryDto>>.Success(categoryDtos.OrderBy(c => c.DisplayOrder).ToList());
    }
}
