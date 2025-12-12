using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Application.Features.CompanyPage.Queries;

// ==================== Get All Team Members ====================
public class GetTeamMembersQuery : IRequest<List<TeamMemberDto>>
{
}

public class GetTeamMembersQueryHandler : IRequestHandler<GetTeamMembersQuery, List<TeamMemberDto>>
{
    private readonly CMSDbContext _context;

    public GetTeamMembersQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<TeamMemberDto>> Handle(GetTeamMembersQuery request, CancellationToken cancellationToken)
    {
        return await _context.TeamMembers
            .OrderBy(x => x.SortOrder)
            .Select(e => new TeamMemberDto(
                e.Id, e.Name, e.Role, e.Department, e.Bio, e.Avatar, e.Email, e.LinkedIn, e.Twitter,
                e.SortOrder, e.IsActive, e.IsLeadership, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Active Team Members ====================
public class GetActiveTeamMembersQuery : IRequest<List<TeamMemberDto>>
{
}

public class GetActiveTeamMembersQueryHandler : IRequestHandler<GetActiveTeamMembersQuery, List<TeamMemberDto>>
{
    private readonly CMSDbContext _context;

    public GetActiveTeamMembersQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<TeamMemberDto>> Handle(GetActiveTeamMembersQuery request, CancellationToken cancellationToken)
    {
        return await _context.TeamMembers
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .Select(e => new TeamMemberDto(
                e.Id, e.Name, e.Role, e.Department, e.Bio, e.Avatar, e.Email, e.LinkedIn, e.Twitter,
                e.SortOrder, e.IsActive, e.IsLeadership, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Leadership Team Members ====================
public class GetLeadershipTeamMembersQuery : IRequest<List<TeamMemberDto>>
{
}

public class GetLeadershipTeamMembersQueryHandler : IRequestHandler<GetLeadershipTeamMembersQuery, List<TeamMemberDto>>
{
    private readonly CMSDbContext _context;

    public GetLeadershipTeamMembersQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<TeamMemberDto>> Handle(GetLeadershipTeamMembersQuery request, CancellationToken cancellationToken)
    {
        return await _context.TeamMembers
            .Where(x => x.IsActive && x.IsLeadership)
            .OrderBy(x => x.SortOrder)
            .Select(e => new TeamMemberDto(
                e.Id, e.Name, e.Role, e.Department, e.Bio, e.Avatar, e.Email, e.LinkedIn, e.Twitter,
                e.SortOrder, e.IsActive, e.IsLeadership, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Team Member By ID ====================
public class GetTeamMemberByIdQuery : IRequest<TeamMemberDto?>
{
    public Guid Id { get; set; }
}

public class GetTeamMemberByIdQueryHandler : IRequestHandler<GetTeamMemberByIdQuery, TeamMemberDto?>
{
    private readonly CMSDbContext _context;

    public GetTeamMemberByIdQueryHandler(CMSDbContext context) => _context = context;

    public async Task<TeamMemberDto?> Handle(GetTeamMemberByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.TeamMembers.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null) return null;

        return new TeamMemberDto(
            entity.Id, entity.Name, entity.Role, entity.Department, entity.Bio, entity.Avatar, entity.Email, entity.LinkedIn, entity.Twitter,
            entity.SortOrder, entity.IsActive, entity.IsLeadership, entity.CreatedAt);
    }
}
