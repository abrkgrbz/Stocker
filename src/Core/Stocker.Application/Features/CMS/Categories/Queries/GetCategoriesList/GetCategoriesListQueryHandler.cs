using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.Domain.Master.Enums.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Categories.Queries.GetCategoriesList;

public class GetCategoriesListQueryHandler : IRequestHandler<GetCategoriesListQuery, Result<List<BlogCategoryListDto>>>
{
    private readonly IMasterDbContext _context;

    public GetCategoriesListQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<BlogCategoryListDto>>> Handle(GetCategoriesListQuery request, CancellationToken cancellationToken)
    {
        var query = _context.BlogCategories.AsQueryable();

        if (request.ActiveOnly == true)
        {
            query = query.Where(c => c.IsActive);
        }

        var categories = await query
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .Select(c => new BlogCategoryListDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Color = c.Color,
                Icon = c.Icon,
                IsActive = c.IsActive,
                PostCount = _context.BlogPosts.Count(p =>
                    p.CategoryId == c.Id &&
                    p.Status == PostStatus.Published)
            })
            .ToListAsync(cancellationToken);

        return Result<List<BlogCategoryListDto>>.Success(categories);
    }
}
