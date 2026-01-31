using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Pages.Queries.GetPagesList;

public class GetPagesListQueryHandler : IRequestHandler<GetPagesListQuery, Result<PagedResult<CmsPageListDto>>>
{
    private readonly IMasterDbContext _context;

    public GetPagesListQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<CmsPageListDto>>> Handle(GetPagesListQuery request, CancellationToken cancellationToken)
    {
        var query = _context.CmsPages
            .Include(p => p.Author)
            .AsQueryable();

        // Filter by status
        if (request.Status.HasValue)
        {
            query = query.Where(p => p.Status == request.Status.Value);
        }

        // Search filter
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.ToLower();
            query = query.Where(p =>
                p.Title.ToLower().Contains(searchLower) ||
                p.Slug.ToLower().Contains(searchLower));
        }

        // Sorting
        query = request.SortBy?.ToLower() switch
        {
            "title" => request.SortDescending ? query.OrderByDescending(p => p.Title) : query.OrderBy(p => p.Title),
            "views" => request.SortDescending ? query.OrderByDescending(p => p.Views) : query.OrderBy(p => p.Views),
            "updatedat" => request.SortDescending ? query.OrderByDescending(p => p.UpdatedAt) : query.OrderBy(p => p.UpdatedAt),
            _ => request.SortDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt)
        };

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var pages = await query
            .Skip((request.Page - 1) * request.Limit)
            .Take(request.Limit)
            .Select(p => new CmsPageListDto
            {
                Id = p.Id,
                Title = p.Title,
                Slug = p.Slug,
                Status = p.Status,
                FeaturedImage = p.FeaturedImage,
                Views = p.Views,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                Author = new AuthorDto
                {
                    Id = p.Author!.Id,
                    Name = p.Author.FirstName + " " + p.Author.LastName,
                    Avatar = null
                }
            })
            .ToListAsync(cancellationToken);

        var result = new PagedResult<CmsPageListDto>(pages, totalCount, request.Page, request.Limit);

        return Result<PagedResult<CmsPageListDto>>.Success(result);
    }
}
