using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Application.Features.Documentation.Queries;

// ==================== Get All Doc Articles ====================
public class GetDocArticlesQuery : IRequest<List<DocArticleDto>>
{
}

public class GetDocArticlesQueryHandler : IRequestHandler<GetDocArticlesQuery, List<DocArticleDto>>
{
    private readonly CMSDbContext _context;

    public GetDocArticlesQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<DocArticleDto>> Handle(GetDocArticlesQuery request, CancellationToken cancellationToken)
    {
        return await _context.DocArticles
            .Include(x => x.Category)
            .OrderBy(x => x.SortOrder)
            .Select(e => new DocArticleDto(
                e.Id, e.Title, e.Slug, e.Description, e.Content, e.Icon, e.MetaTitle, e.MetaDescription,
                e.SortOrder, e.IsActive, e.IsPopular, e.ViewCount, e.CategoryId, e.Category.Title, e.CreatedAt, e.UpdatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Active Doc Articles ====================
public class GetActiveDocArticlesQuery : IRequest<List<DocArticleListDto>>
{
}

public class GetActiveDocArticlesQueryHandler : IRequestHandler<GetActiveDocArticlesQuery, List<DocArticleListDto>>
{
    private readonly CMSDbContext _context;

    public GetActiveDocArticlesQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<DocArticleListDto>> Handle(GetActiveDocArticlesQuery request, CancellationToken cancellationToken)
    {
        return await _context.DocArticles
            .Include(x => x.Category)
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .Select(e => new DocArticleListDto(
                e.Id, e.Title, e.Slug, e.Description, e.Icon, e.SortOrder, e.IsActive, e.IsPopular, e.ViewCount, e.Category.Title))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Popular Doc Articles ====================
public class GetPopularDocArticlesQuery : IRequest<List<DocArticleListDto>>
{
}

public class GetPopularDocArticlesQueryHandler : IRequestHandler<GetPopularDocArticlesQuery, List<DocArticleListDto>>
{
    private readonly CMSDbContext _context;

    public GetPopularDocArticlesQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<DocArticleListDto>> Handle(GetPopularDocArticlesQuery request, CancellationToken cancellationToken)
    {
        return await _context.DocArticles
            .Include(x => x.Category)
            .Where(x => x.IsActive && x.IsPopular)
            .OrderByDescending(x => x.ViewCount)
            .Take(10)
            .Select(e => new DocArticleListDto(
                e.Id, e.Title, e.Slug, e.Description, e.Icon, e.SortOrder, e.IsActive, e.IsPopular, e.ViewCount, e.Category.Title))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Doc Articles By Category ====================
public class GetDocArticlesByCategoryQuery : IRequest<List<DocArticleListDto>>
{
    public Guid CategoryId { get; set; }
}

public class GetDocArticlesByCategoryQueryHandler : IRequestHandler<GetDocArticlesByCategoryQuery, List<DocArticleListDto>>
{
    private readonly CMSDbContext _context;

    public GetDocArticlesByCategoryQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<DocArticleListDto>> Handle(GetDocArticlesByCategoryQuery request, CancellationToken cancellationToken)
    {
        return await _context.DocArticles
            .Include(x => x.Category)
            .Where(x => x.CategoryId == request.CategoryId)
            .OrderBy(x => x.SortOrder)
            .Select(e => new DocArticleListDto(
                e.Id, e.Title, e.Slug, e.Description, e.Icon, e.SortOrder, e.IsActive, e.IsPopular, e.ViewCount, e.Category.Title))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Doc Article By ID ====================
public class GetDocArticleByIdQuery : IRequest<DocArticleDto?>
{
    public Guid Id { get; set; }
}

public class GetDocArticleByIdQueryHandler : IRequestHandler<GetDocArticleByIdQuery, DocArticleDto?>
{
    private readonly CMSDbContext _context;

    public GetDocArticleByIdQueryHandler(CMSDbContext context) => _context = context;

    public async Task<DocArticleDto?> Handle(GetDocArticleByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.DocArticles
            .Include(x => x.Category)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity == null) return null;

        return new DocArticleDto(
            entity.Id, entity.Title, entity.Slug, entity.Description, entity.Content, entity.Icon,
            entity.MetaTitle, entity.MetaDescription, entity.SortOrder, entity.IsActive, entity.IsPopular,
            entity.ViewCount, entity.CategoryId, entity.Category?.Title, entity.CreatedAt, entity.UpdatedAt);
    }
}

// ==================== Get Doc Article By Slug ====================
public class GetDocArticleBySlugQuery : IRequest<DocArticleDto?>
{
    public string Slug { get; set; } = string.Empty;
}

public class GetDocArticleBySlugQueryHandler : IRequestHandler<GetDocArticleBySlugQuery, DocArticleDto?>
{
    private readonly CMSDbContext _context;

    public GetDocArticleBySlugQueryHandler(CMSDbContext context) => _context = context;

    public async Task<DocArticleDto?> Handle(GetDocArticleBySlugQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.DocArticles
            .Include(x => x.Category)
            .FirstOrDefaultAsync(x => x.Slug == request.Slug, cancellationToken);

        if (entity == null) return null;

        return new DocArticleDto(
            entity.Id, entity.Title, entity.Slug, entity.Description, entity.Content, entity.Icon,
            entity.MetaTitle, entity.MetaDescription, entity.SortOrder, entity.IsActive, entity.IsPopular,
            entity.ViewCount, entity.CategoryId, entity.Category?.Title, entity.CreatedAt, entity.UpdatedAt);
    }
}

// ==================== Search Doc Articles ====================
public class SearchDocArticlesQuery : IRequest<List<DocArticleListDto>>
{
    public string SearchTerm { get; set; } = string.Empty;
}

public class SearchDocArticlesQueryHandler : IRequestHandler<SearchDocArticlesQuery, List<DocArticleListDto>>
{
    private readonly CMSDbContext _context;

    public SearchDocArticlesQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<DocArticleListDto>> Handle(SearchDocArticlesQuery request, CancellationToken cancellationToken)
    {
        var searchLower = request.SearchTerm.ToLower();

        return await _context.DocArticles
            .Include(x => x.Category)
            .Where(x => x.IsActive && (
                x.Title.ToLower().Contains(searchLower) ||
                (x.Description != null && x.Description.ToLower().Contains(searchLower)) ||
                (x.Content != null && x.Content.ToLower().Contains(searchLower))))
            .OrderBy(x => x.SortOrder)
            .Select(e => new DocArticleListDto(
                e.Id, e.Title, e.Slug, e.Description, e.Icon, e.SortOrder, e.IsActive, e.IsPopular, e.ViewCount, e.Category.Title))
            .ToListAsync(cancellationToken);
    }
}
