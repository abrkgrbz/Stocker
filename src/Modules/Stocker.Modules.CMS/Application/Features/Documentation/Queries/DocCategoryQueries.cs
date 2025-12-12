using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Application.Features.Documentation.Queries;

// ==================== Get All Doc Categories ====================
public class GetDocCategoriesQuery : IRequest<List<DocCategoryDto>>
{
}

public class GetDocCategoriesQueryHandler : IRequestHandler<GetDocCategoriesQuery, List<DocCategoryDto>>
{
    private readonly CMSDbContext _context;

    public GetDocCategoriesQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<DocCategoryDto>> Handle(GetDocCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await _context.DocCategories
            .Include(x => x.Articles)
            .OrderBy(x => x.SortOrder)
            .Select(e => new DocCategoryDto(
                e.Id, e.Title, e.Slug, e.Description, e.Icon, e.Color, e.SortOrder, e.IsActive,
                e.Articles.Count,
                e.Articles.OrderBy(a => a.SortOrder).Select(a => new DocArticleDto(
                    a.Id, a.Title, a.Slug, a.Description, a.Content, a.Icon, a.MetaTitle, a.MetaDescription,
                    a.SortOrder, a.IsActive, a.IsPopular, a.ViewCount, a.CategoryId, e.Title, a.CreatedAt, a.UpdatedAt)).ToList(),
                e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Active Doc Categories ====================
public class GetActiveDocCategoriesQuery : IRequest<List<DocCategoryDto>>
{
}

public class GetActiveDocCategoriesQueryHandler : IRequestHandler<GetActiveDocCategoriesQuery, List<DocCategoryDto>>
{
    private readonly CMSDbContext _context;

    public GetActiveDocCategoriesQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<DocCategoryDto>> Handle(GetActiveDocCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await _context.DocCategories
            .Include(x => x.Articles)
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .Select(e => new DocCategoryDto(
                e.Id, e.Title, e.Slug, e.Description, e.Icon, e.Color, e.SortOrder, e.IsActive,
                e.Articles.Count(a => a.IsActive),
                e.Articles.Where(a => a.IsActive).OrderBy(a => a.SortOrder).Select(a => new DocArticleDto(
                    a.Id, a.Title, a.Slug, a.Description, a.Content, a.Icon, a.MetaTitle, a.MetaDescription,
                    a.SortOrder, a.IsActive, a.IsPopular, a.ViewCount, a.CategoryId, e.Title, a.CreatedAt, a.UpdatedAt)).ToList(),
                e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Doc Category List (without articles) ====================
public class GetDocCategoryListQuery : IRequest<List<DocCategoryListDto>>
{
}

public class GetDocCategoryListQueryHandler : IRequestHandler<GetDocCategoryListQuery, List<DocCategoryListDto>>
{
    private readonly CMSDbContext _context;

    public GetDocCategoryListQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<DocCategoryListDto>> Handle(GetDocCategoryListQuery request, CancellationToken cancellationToken)
    {
        return await _context.DocCategories
            .Include(x => x.Articles)
            .OrderBy(x => x.SortOrder)
            .Select(e => new DocCategoryListDto(
                e.Id, e.Title, e.Slug, e.Description, e.Icon, e.Color, e.SortOrder, e.IsActive, e.Articles.Count))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Doc Category By ID ====================
public class GetDocCategoryByIdQuery : IRequest<DocCategoryDto?>
{
    public Guid Id { get; set; }
}

public class GetDocCategoryByIdQueryHandler : IRequestHandler<GetDocCategoryByIdQuery, DocCategoryDto?>
{
    private readonly CMSDbContext _context;

    public GetDocCategoryByIdQueryHandler(CMSDbContext context) => _context = context;

    public async Task<DocCategoryDto?> Handle(GetDocCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.DocCategories
            .Include(x => x.Articles)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity == null) return null;

        return new DocCategoryDto(
            entity.Id, entity.Title, entity.Slug, entity.Description, entity.Icon, entity.Color, entity.SortOrder, entity.IsActive,
            entity.Articles?.Count ?? 0,
            entity.Articles?.OrderBy(a => a.SortOrder).Select(a => new DocArticleDto(
                a.Id, a.Title, a.Slug, a.Description, a.Content, a.Icon, a.MetaTitle, a.MetaDescription,
                a.SortOrder, a.IsActive, a.IsPopular, a.ViewCount, a.CategoryId, entity.Title, a.CreatedAt, a.UpdatedAt)).ToList() ?? new(),
            entity.CreatedAt);
    }
}

// ==================== Get Doc Category By Slug ====================
public class GetDocCategoryBySlugQuery : IRequest<DocCategoryDto?>
{
    public string Slug { get; set; } = string.Empty;
}

public class GetDocCategoryBySlugQueryHandler : IRequestHandler<GetDocCategoryBySlugQuery, DocCategoryDto?>
{
    private readonly CMSDbContext _context;

    public GetDocCategoryBySlugQueryHandler(CMSDbContext context) => _context = context;

    public async Task<DocCategoryDto?> Handle(GetDocCategoryBySlugQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.DocCategories
            .Include(x => x.Articles)
            .FirstOrDefaultAsync(x => x.Slug == request.Slug, cancellationToken);

        if (entity == null) return null;

        return new DocCategoryDto(
            entity.Id, entity.Title, entity.Slug, entity.Description, entity.Icon, entity.Color, entity.SortOrder, entity.IsActive,
            entity.Articles?.Count ?? 0,
            entity.Articles?.OrderBy(a => a.SortOrder).Select(a => new DocArticleDto(
                a.Id, a.Title, a.Slug, a.Description, a.Content, a.Icon, a.MetaTitle, a.MetaDescription,
                a.SortOrder, a.IsActive, a.IsPopular, a.ViewCount, a.CategoryId, entity.Title, a.CreatedAt, a.UpdatedAt)).ToList() ?? new(),
            entity.CreatedAt);
    }
}
