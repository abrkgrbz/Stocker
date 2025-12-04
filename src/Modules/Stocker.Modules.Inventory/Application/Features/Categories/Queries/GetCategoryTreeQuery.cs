using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Categories.Queries;

/// <summary>
/// Query to get category tree with hierarchy
/// </summary>
public class GetCategoryTreeQuery : IRequest<Result<List<CategoryTreeDto>>>
{
    public Guid TenantId { get; set; }
}

/// <summary>
/// Handler for GetCategoryTreeQuery
/// </summary>
public class GetCategoryTreeQueryHandler : IRequestHandler<GetCategoryTreeQuery, Result<List<CategoryTreeDto>>>
{
    private readonly ICategoryRepository _categoryRepository;

    public GetCategoryTreeQueryHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<Result<List<CategoryTreeDto>>> Handle(GetCategoryTreeQuery request, CancellationToken cancellationToken)
    {
        var allCategories = await _categoryRepository.GetAllAsync(cancellationToken);
        var rootCategories = allCategories.Where(c => c.ParentCategoryId == null).OrderBy(c => c.DisplayOrder);

        var tree = new List<CategoryTreeDto>();

        foreach (var rootCategory in rootCategories)
        {
            tree.Add(BuildCategoryTree(rootCategory, allCategories, 0));
        }

        return Result<List<CategoryTreeDto>>.Success(tree);
    }

    private static CategoryTreeDto BuildCategoryTree(
        Domain.Entities.Category category,
        IReadOnlyList<Domain.Entities.Category> allCategories,
        int level)
    {
        var children = allCategories
            .Where(c => c.ParentCategoryId == category.Id)
            .OrderBy(c => c.DisplayOrder)
            .ToList();

        var dto = new CategoryTreeDto
        {
            Id = category.Id,
            Code = category.Code,
            Name = category.Name,
            Level = level,
            HasChildren = children.Count > 0
        };

        foreach (var child in children)
        {
            dto.Children.Add(BuildCategoryTree(child, allCategories, level + 1));
        }

        return dto;
    }
}
