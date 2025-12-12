using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Application.Features.CompanyPage.Queries;

// ==================== Get All Contact Info ====================
public class GetContactInfoQuery : IRequest<List<ContactInfoDto>>
{
}

public class GetContactInfoQueryHandler : IRequestHandler<GetContactInfoQuery, List<ContactInfoDto>>
{
    private readonly CMSDbContext _context;

    public GetContactInfoQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<ContactInfoDto>> Handle(GetContactInfoQuery request, CancellationToken cancellationToken)
    {
        return await _context.ContactInfos
            .OrderBy(x => x.SortOrder)
            .Select(e => new ContactInfoDto(
                e.Id, e.Type, e.Title, e.Value, e.Icon, e.IconColor, e.Href, e.AdditionalInfo, e.SortOrder, e.IsActive, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Active Contact Info ====================
public class GetActiveContactInfoQuery : IRequest<List<ContactInfoDto>>
{
}

public class GetActiveContactInfoQueryHandler : IRequestHandler<GetActiveContactInfoQuery, List<ContactInfoDto>>
{
    private readonly CMSDbContext _context;

    public GetActiveContactInfoQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<ContactInfoDto>> Handle(GetActiveContactInfoQuery request, CancellationToken cancellationToken)
    {
        return await _context.ContactInfos
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .Select(e => new ContactInfoDto(
                e.Id, e.Type, e.Title, e.Value, e.Icon, e.IconColor, e.Href, e.AdditionalInfo, e.SortOrder, e.IsActive, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Contact Info By Type ====================
public class GetContactInfoByTypeQuery : IRequest<List<ContactInfoDto>>
{
    public string Type { get; set; } = string.Empty;
}

public class GetContactInfoByTypeQueryHandler : IRequestHandler<GetContactInfoByTypeQuery, List<ContactInfoDto>>
{
    private readonly CMSDbContext _context;

    public GetContactInfoByTypeQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<ContactInfoDto>> Handle(GetContactInfoByTypeQuery request, CancellationToken cancellationToken)
    {
        return await _context.ContactInfos
            .Where(x => x.IsActive && x.Type == request.Type)
            .OrderBy(x => x.SortOrder)
            .Select(e => new ContactInfoDto(
                e.Id, e.Type, e.Title, e.Value, e.Icon, e.IconColor, e.Href, e.AdditionalInfo, e.SortOrder, e.IsActive, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Contact Info By ID ====================
public class GetContactInfoByIdQuery : IRequest<ContactInfoDto?>
{
    public Guid Id { get; set; }
}

public class GetContactInfoByIdQueryHandler : IRequestHandler<GetContactInfoByIdQuery, ContactInfoDto?>
{
    private readonly CMSDbContext _context;

    public GetContactInfoByIdQueryHandler(CMSDbContext context) => _context = context;

    public async Task<ContactInfoDto?> Handle(GetContactInfoByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.ContactInfos.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null) return null;

        return new ContactInfoDto(
            entity.Id, entity.Type, entity.Title, entity.Value, entity.Icon, entity.IconColor, entity.Href, entity.AdditionalInfo, entity.SortOrder, entity.IsActive, entity.CreatedAt);
    }
}
