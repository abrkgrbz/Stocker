using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Application.Features.LandingPage.Queries;

// ==================== Get All Integrations ====================
public class GetIntegrationsQuery : IRequest<List<IntegrationDto>>
{
}

public class GetIntegrationsQueryHandler : IRequestHandler<GetIntegrationsQuery, List<IntegrationDto>>
{
    private readonly CMSDbContext _context;

    public GetIntegrationsQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<IntegrationDto>> Handle(GetIntegrationsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Integrations
            .Include(x => x.Items)
            .OrderBy(x => x.SortOrder)
            .Select(e => new IntegrationDto(
                e.Id, e.Name, e.Slug, e.Description, e.Icon, e.Color, e.SortOrder, e.IsActive,
                e.Items.OrderBy(i => i.SortOrder).Select(i => new IntegrationItemDto(
                    i.Id, i.Name, i.Description, i.Logo, i.Url, i.SortOrder, i.IsActive, i.IntegrationId)).ToList(),
                e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Active Integrations ====================
public class GetActiveIntegrationsQuery : IRequest<List<IntegrationDto>>
{
}

public class GetActiveIntegrationsQueryHandler : IRequestHandler<GetActiveIntegrationsQuery, List<IntegrationDto>>
{
    private readonly CMSDbContext _context;

    public GetActiveIntegrationsQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<IntegrationDto>> Handle(GetActiveIntegrationsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Integrations
            .Include(x => x.Items)
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .Select(e => new IntegrationDto(
                e.Id, e.Name, e.Slug, e.Description, e.Icon, e.Color, e.SortOrder, e.IsActive,
                e.Items.Where(i => i.IsActive).OrderBy(i => i.SortOrder).Select(i => new IntegrationItemDto(
                    i.Id, i.Name, i.Description, i.Logo, i.Url, i.SortOrder, i.IsActive, i.IntegrationId)).ToList(),
                e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Integration By ID ====================
public class GetIntegrationByIdQuery : IRequest<IntegrationDto?>
{
    public Guid Id { get; set; }
}

public class GetIntegrationByIdQueryHandler : IRequestHandler<GetIntegrationByIdQuery, IntegrationDto?>
{
    private readonly CMSDbContext _context;

    public GetIntegrationByIdQueryHandler(CMSDbContext context) => _context = context;

    public async Task<IntegrationDto?> Handle(GetIntegrationByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.Integrations
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity == null) return null;

        return new IntegrationDto(
            entity.Id, entity.Name, entity.Slug, entity.Description, entity.Icon, entity.Color, entity.SortOrder, entity.IsActive,
            entity.Items.OrderBy(i => i.SortOrder).Select(i => new IntegrationItemDto(
                i.Id, i.Name, i.Description, i.Logo, i.Url, i.SortOrder, i.IsActive, i.IntegrationId)).ToList(),
            entity.CreatedAt);
    }
}

// ==================== Get Integration By Slug ====================
public class GetIntegrationBySlugQuery : IRequest<IntegrationDto?>
{
    public string Slug { get; set; } = string.Empty;
}

public class GetIntegrationBySlugQueryHandler : IRequestHandler<GetIntegrationBySlugQuery, IntegrationDto?>
{
    private readonly CMSDbContext _context;

    public GetIntegrationBySlugQueryHandler(CMSDbContext context) => _context = context;

    public async Task<IntegrationDto?> Handle(GetIntegrationBySlugQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.Integrations
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Slug == request.Slug, cancellationToken);

        if (entity == null) return null;

        return new IntegrationDto(
            entity.Id, entity.Name, entity.Slug, entity.Description, entity.Icon, entity.Color, entity.SortOrder, entity.IsActive,
            entity.Items.OrderBy(i => i.SortOrder).Select(i => new IntegrationItemDto(
                i.Id, i.Name, i.Description, i.Logo, i.Url, i.SortOrder, i.IsActive, i.IntegrationId)).ToList(),
            entity.CreatedAt);
    }
}

// ==================== Get Integration Item By ID ====================
public class GetIntegrationItemByIdQuery : IRequest<IntegrationItemDto?>
{
    public Guid Id { get; set; }
}

public class GetIntegrationItemByIdQueryHandler : IRequestHandler<GetIntegrationItemByIdQuery, IntegrationItemDto?>
{
    private readonly CMSDbContext _context;

    public GetIntegrationItemByIdQueryHandler(CMSDbContext context) => _context = context;

    public async Task<IntegrationItemDto?> Handle(GetIntegrationItemByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.IntegrationItems.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null) return null;

        return new IntegrationItemDto(
            entity.Id, entity.Name, entity.Description, entity.Logo, entity.Url, entity.SortOrder, entity.IsActive, entity.IntegrationId);
    }
}

// ==================== Get Integration Items By Integration ====================
public class GetIntegrationItemsByIntegrationQuery : IRequest<List<IntegrationItemDto>>
{
    public Guid IntegrationId { get; set; }
}

public class GetIntegrationItemsByIntegrationQueryHandler : IRequestHandler<GetIntegrationItemsByIntegrationQuery, List<IntegrationItemDto>>
{
    private readonly CMSDbContext _context;

    public GetIntegrationItemsByIntegrationQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<IntegrationItemDto>> Handle(GetIntegrationItemsByIntegrationQuery request, CancellationToken cancellationToken)
    {
        return await _context.IntegrationItems
            .Where(x => x.IntegrationId == request.IntegrationId)
            .OrderBy(x => x.SortOrder)
            .Select(e => new IntegrationItemDto(
                e.Id, e.Name, e.Description, e.Logo, e.Url, e.SortOrder, e.IsActive, e.IntegrationId))
            .ToListAsync(cancellationToken);
    }
}
