using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Application.Features.LandingPage.Queries;

// ==================== Get All Industries ====================
public class GetIndustriesQuery : IRequest<List<IndustryDto>>
{
}

public class GetIndustriesQueryHandler : IRequestHandler<GetIndustriesQuery, List<IndustryDto>>
{
    private readonly CMSDbContext _context;

    public GetIndustriesQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<IndustryDto>> Handle(GetIndustriesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Industries
            .OrderBy(x => x.SortOrder)
            .Select(e => new IndustryDto(
                e.Id, e.Name, e.Slug, e.Description, e.Icon, e.Image, e.Color,
                e.SortOrder, e.IsActive, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Active Industries ====================
public class GetActiveIndustriesQuery : IRequest<List<IndustryDto>>
{
}

public class GetActiveIndustriesQueryHandler : IRequestHandler<GetActiveIndustriesQuery, List<IndustryDto>>
{
    private readonly CMSDbContext _context;

    public GetActiveIndustriesQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<IndustryDto>> Handle(GetActiveIndustriesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Industries
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .Select(e => new IndustryDto(
                e.Id, e.Name, e.Slug, e.Description, e.Icon, e.Image, e.Color,
                e.SortOrder, e.IsActive, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Industry By ID ====================
public class GetIndustryByIdQuery : IRequest<IndustryDto?>
{
    public Guid Id { get; set; }
}

public class GetIndustryByIdQueryHandler : IRequestHandler<GetIndustryByIdQuery, IndustryDto?>
{
    private readonly CMSDbContext _context;

    public GetIndustryByIdQueryHandler(CMSDbContext context) => _context = context;

    public async Task<IndustryDto?> Handle(GetIndustryByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.Industries.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null) return null;

        return new IndustryDto(
            entity.Id, entity.Name, entity.Slug, entity.Description, entity.Icon, entity.Image, entity.Color,
            entity.SortOrder, entity.IsActive, entity.CreatedAt);
    }
}

// ==================== Get Industry By Slug ====================
public class GetIndustryBySlugQuery : IRequest<IndustryDto?>
{
    public string Slug { get; set; } = string.Empty;
}

public class GetIndustryBySlugQueryHandler : IRequestHandler<GetIndustryBySlugQuery, IndustryDto?>
{
    private readonly CMSDbContext _context;

    public GetIndustryBySlugQueryHandler(CMSDbContext context) => _context = context;

    public async Task<IndustryDto?> Handle(GetIndustryBySlugQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.Industries.FirstOrDefaultAsync(x => x.Slug == request.Slug, cancellationToken);
        if (entity == null) return null;

        return new IndustryDto(
            entity.Id, entity.Name, entity.Slug, entity.Description, entity.Icon, entity.Image, entity.Color,
            entity.SortOrder, entity.IsActive, entity.CreatedAt);
    }
}
