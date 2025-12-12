using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Application.Features.LandingPage.Queries;

// ==================== Get All Stats ====================
public class GetStatsQuery : IRequest<List<StatDto>>
{
}

public class GetStatsQueryHandler : IRequestHandler<GetStatsQuery, List<StatDto>>
{
    private readonly CMSDbContext _context;

    public GetStatsQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<StatDto>> Handle(GetStatsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Stats
            .OrderBy(x => x.SortOrder)
            .Select(e => new StatDto(
                e.Id, e.Label, e.Value, e.Suffix, e.Prefix, e.Icon, e.Section,
                e.SortOrder, e.IsActive, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Active Stats ====================
public class GetActiveStatsQuery : IRequest<List<StatDto>>
{
}

public class GetActiveStatsQueryHandler : IRequestHandler<GetActiveStatsQuery, List<StatDto>>
{
    private readonly CMSDbContext _context;

    public GetActiveStatsQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<StatDto>> Handle(GetActiveStatsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Stats
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .Select(e => new StatDto(
                e.Id, e.Label, e.Value, e.Suffix, e.Prefix, e.Icon, e.Section,
                e.SortOrder, e.IsActive, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Stats By Section ====================
public class GetStatsBySectionQuery : IRequest<List<StatDto>>
{
    public string Section { get; set; } = string.Empty;
}

public class GetStatsBySectionQueryHandler : IRequestHandler<GetStatsBySectionQuery, List<StatDto>>
{
    private readonly CMSDbContext _context;

    public GetStatsBySectionQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<StatDto>> Handle(GetStatsBySectionQuery request, CancellationToken cancellationToken)
    {
        return await _context.Stats
            .Where(x => x.IsActive && x.Section == request.Section)
            .OrderBy(x => x.SortOrder)
            .Select(e => new StatDto(
                e.Id, e.Label, e.Value, e.Suffix, e.Prefix, e.Icon, e.Section,
                e.SortOrder, e.IsActive, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Stat By ID ====================
public class GetStatByIdQuery : IRequest<StatDto?>
{
    public Guid Id { get; set; }
}

public class GetStatByIdQueryHandler : IRequestHandler<GetStatByIdQuery, StatDto?>
{
    private readonly CMSDbContext _context;

    public GetStatByIdQueryHandler(CMSDbContext context) => _context = context;

    public async Task<StatDto?> Handle(GetStatByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.Stats.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null) return null;

        return new StatDto(
            entity.Id, entity.Label, entity.Value, entity.Suffix, entity.Prefix, entity.Icon, entity.Section,
            entity.SortOrder, entity.IsActive, entity.CreatedAt);
    }
}
