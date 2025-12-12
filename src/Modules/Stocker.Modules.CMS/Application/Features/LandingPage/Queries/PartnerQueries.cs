using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Application.Features.LandingPage.Queries;

// ==================== Get All Partners ====================
public class GetPartnersQuery : IRequest<List<PartnerDto>>
{
}

public class GetPartnersQueryHandler : IRequestHandler<GetPartnersQuery, List<PartnerDto>>
{
    private readonly CMSDbContext _context;

    public GetPartnersQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<PartnerDto>> Handle(GetPartnersQuery request, CancellationToken cancellationToken)
    {
        return await _context.Partners
            .OrderBy(x => x.SortOrder)
            .Select(e => new PartnerDto(
                e.Id, e.Name, e.Logo, e.LogoDark, e.Url, e.SortOrder, e.IsActive, e.IsFeatured, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Active Partners ====================
public class GetActivePartnersQuery : IRequest<List<PartnerDto>>
{
}

public class GetActivePartnersQueryHandler : IRequestHandler<GetActivePartnersQuery, List<PartnerDto>>
{
    private readonly CMSDbContext _context;

    public GetActivePartnersQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<PartnerDto>> Handle(GetActivePartnersQuery request, CancellationToken cancellationToken)
    {
        return await _context.Partners
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .Select(e => new PartnerDto(
                e.Id, e.Name, e.Logo, e.LogoDark, e.Url, e.SortOrder, e.IsActive, e.IsFeatured, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Featured Partners ====================
public class GetFeaturedPartnersQuery : IRequest<List<PartnerDto>>
{
}

public class GetFeaturedPartnersQueryHandler : IRequestHandler<GetFeaturedPartnersQuery, List<PartnerDto>>
{
    private readonly CMSDbContext _context;

    public GetFeaturedPartnersQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<PartnerDto>> Handle(GetFeaturedPartnersQuery request, CancellationToken cancellationToken)
    {
        return await _context.Partners
            .Where(x => x.IsActive && x.IsFeatured)
            .OrderBy(x => x.SortOrder)
            .Select(e => new PartnerDto(
                e.Id, e.Name, e.Logo, e.LogoDark, e.Url, e.SortOrder, e.IsActive, e.IsFeatured, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Partner By ID ====================
public class GetPartnerByIdQuery : IRequest<PartnerDto?>
{
    public Guid Id { get; set; }
}

public class GetPartnerByIdQueryHandler : IRequestHandler<GetPartnerByIdQuery, PartnerDto?>
{
    private readonly CMSDbContext _context;

    public GetPartnerByIdQueryHandler(CMSDbContext context) => _context = context;

    public async Task<PartnerDto?> Handle(GetPartnerByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.Partners.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null) return null;

        return new PartnerDto(
            entity.Id, entity.Name, entity.Logo, entity.LogoDark, entity.Url, entity.SortOrder, entity.IsActive, entity.IsFeatured, entity.CreatedAt);
    }
}
