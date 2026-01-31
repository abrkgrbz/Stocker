using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Posts.Queries.GetPostsList;

public class GetPostsListQueryHandler : IRequestHandler<GetPostsListQuery, Result<PagedResult<BlogPostListDto>>>
{
    private readonly IMasterDbContext _context;

    public GetPostsListQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<BlogPostListDto>>> Handle(GetPostsListQuery request, CancellationToken cancellationToken)
    {
        var query = _context.BlogPosts
            .Include(p => p.Author)
            .Include(p => p.Category)
            .AsQueryable();

        // Filter by status
        if (request.Status.HasValue)
        {
            query = query.Where(p => p.Status == request.Status.Value);
        }

        // Filter by category ID
        if (request.CategoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == request.CategoryId.Value);
        }

        // Filter by category slug
        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            query = query.Where(p => p.Category!.Slug == request.Category.ToLowerInvariant());
        }

        // Search filter
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.ToLower();
            query = query.Where(p =>
                p.Title.ToLower().Contains(searchLower) ||
                p.Slug.ToLower().Contains(searchLower) ||
                (p.Excerpt != null && p.Excerpt.ToLower().Contains(searchLower)));
        }

        // Sorting
        query = request.SortBy?.ToLower() switch
        {
            "title" => request.SortDescending ? query.OrderByDescending(p => p.Title) : query.OrderBy(p => p.Title),
            "views" => request.SortDescending ? query.OrderByDescending(p => p.Views) : query.OrderBy(p => p.Views),
            "publishdate" => request.SortDescending ? query.OrderByDescending(p => p.PublishDate) : query.OrderBy(p => p.PublishDate),
            _ => request.SortDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt)
        };

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var posts = await query
            .Skip((request.Page - 1) * request.Limit)
            .Take(request.Limit)
            .Select(p => new BlogPostListDto
            {
                Id = p.Id,
                Title = p.Title,
                Slug = p.Slug,
                Excerpt = p.Excerpt,
                CategoryName = p.Category!.Name,
                CategorySlug = p.Category.Slug,
                Tags = p.Tags.ToList(),
                Status = p.Status,
                PublishDate = p.PublishDate,
                FeaturedImage = p.FeaturedImage,
                Views = p.Views,
                CreatedAt = p.CreatedAt,
                Author = new AuthorDto
                {
                    Id = p.Author!.Id,
                    Name = p.Author.FirstName + " " + p.Author.LastName,
                    Avatar = null
                }
            })
            .ToListAsync(cancellationToken);

        var result = new PagedResult<BlogPostListDto>(posts, totalCount, request.Page, request.Limit);

        return Result<PagedResult<BlogPostListDto>>.Success(result);
    }
}
