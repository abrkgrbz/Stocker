using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Application.Features.LandingPage.Queries;

// ==================== Get All Features ====================
public class GetFeaturesQuery : IRequest<List<FeatureDto>>
{
}

public class GetFeaturesQueryHandler : IRequestHandler<GetFeaturesQuery, List<FeatureDto>>
{
    private readonly CMSDbContext _context;

    public GetFeaturesQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<FeatureDto>> Handle(GetFeaturesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Features
            .OrderBy(x => x.SortOrder)
            .Select(e => new FeatureDto(
                e.Id, e.Title, e.Description, e.Icon, e.IconColor, e.Image, e.Category,
                e.SortOrder, e.IsActive, e.IsFeatured, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Active Features ====================
public class GetActiveFeaturesQuery : IRequest<List<FeatureDto>>
{
}

public class GetActiveFeaturesQueryHandler : IRequestHandler<GetActiveFeaturesQuery, List<FeatureDto>>
{
    private readonly CMSDbContext _context;

    public GetActiveFeaturesQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<FeatureDto>> Handle(GetActiveFeaturesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Features
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .Select(e => new FeatureDto(
                e.Id, e.Title, e.Description, e.Icon, e.IconColor, e.Image, e.Category,
                e.SortOrder, e.IsActive, e.IsFeatured, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Featured Features ====================
public class GetFeaturedFeaturesQuery : IRequest<List<FeatureDto>>
{
}

public class GetFeaturedFeaturesQueryHandler : IRequestHandler<GetFeaturedFeaturesQuery, List<FeatureDto>>
{
    private readonly CMSDbContext _context;

    public GetFeaturedFeaturesQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<FeatureDto>> Handle(GetFeaturedFeaturesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Features
            .Where(x => x.IsActive && x.IsFeatured)
            .OrderBy(x => x.SortOrder)
            .Select(e => new FeatureDto(
                e.Id, e.Title, e.Description, e.Icon, e.IconColor, e.Image, e.Category,
                e.SortOrder, e.IsActive, e.IsFeatured, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Features By Category ====================
public class GetFeaturesByCategoryQuery : IRequest<List<FeatureDto>>
{
    public string Category { get; set; } = string.Empty;
}

public class GetFeaturesByCategoryQueryHandler : IRequestHandler<GetFeaturesByCategoryQuery, List<FeatureDto>>
{
    private readonly CMSDbContext _context;

    public GetFeaturesByCategoryQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<FeatureDto>> Handle(GetFeaturesByCategoryQuery request, CancellationToken cancellationToken)
    {
        return await _context.Features
            .Where(x => x.IsActive && x.Category == request.Category)
            .OrderBy(x => x.SortOrder)
            .Select(e => new FeatureDto(
                e.Id, e.Title, e.Description, e.Icon, e.IconColor, e.Image, e.Category,
                e.SortOrder, e.IsActive, e.IsFeatured, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Feature By ID ====================
public class GetFeatureByIdQuery : IRequest<FeatureDto?>
{
    public Guid Id { get; set; }
}

public class GetFeatureByIdQueryHandler : IRequestHandler<GetFeatureByIdQuery, FeatureDto?>
{
    private readonly CMSDbContext _context;

    public GetFeatureByIdQueryHandler(CMSDbContext context) => _context = context;

    public async Task<FeatureDto?> Handle(GetFeatureByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.Features.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null) return null;

        return new FeatureDto(
            entity.Id, entity.Title, entity.Description, entity.Icon, entity.IconColor, entity.Image, entity.Category,
            entity.SortOrder, entity.IsActive, entity.IsFeatured, entity.CreatedAt);
    }
}
