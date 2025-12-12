using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Application.Features.CompanyPage.Queries;

// ==================== Get All Social Links ====================
public class GetSocialLinksQuery : IRequest<List<SocialLinkDto>>
{
}

public class GetSocialLinksQueryHandler : IRequestHandler<GetSocialLinksQuery, List<SocialLinkDto>>
{
    private readonly CMSDbContext _context;

    public GetSocialLinksQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<SocialLinkDto>> Handle(GetSocialLinksQuery request, CancellationToken cancellationToken)
    {
        return await _context.SocialLinks
            .OrderBy(x => x.SortOrder)
            .Select(e => new SocialLinkDto(
                e.Id, e.Platform, e.Url, e.Icon, e.Label, e.SortOrder, e.IsActive, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Active Social Links ====================
public class GetActiveSocialLinksQuery : IRequest<List<SocialLinkDto>>
{
}

public class GetActiveSocialLinksQueryHandler : IRequestHandler<GetActiveSocialLinksQuery, List<SocialLinkDto>>
{
    private readonly CMSDbContext _context;

    public GetActiveSocialLinksQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<SocialLinkDto>> Handle(GetActiveSocialLinksQuery request, CancellationToken cancellationToken)
    {
        return await _context.SocialLinks
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .Select(e => new SocialLinkDto(
                e.Id, e.Platform, e.Url, e.Icon, e.Label, e.SortOrder, e.IsActive, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Social Link By ID ====================
public class GetSocialLinkByIdQuery : IRequest<SocialLinkDto?>
{
    public Guid Id { get; set; }
}

public class GetSocialLinkByIdQueryHandler : IRequestHandler<GetSocialLinkByIdQuery, SocialLinkDto?>
{
    private readonly CMSDbContext _context;

    public GetSocialLinkByIdQueryHandler(CMSDbContext context) => _context = context;

    public async Task<SocialLinkDto?> Handle(GetSocialLinkByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.SocialLinks.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null) return null;

        return new SocialLinkDto(
            entity.Id, entity.Platform, entity.Url, entity.Icon, entity.Label, entity.SortOrder, entity.IsActive, entity.CreatedAt);
    }
}
