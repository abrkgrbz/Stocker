using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.SalesTeams.Queries;

public class GetSalesTeamByIdQuery : IRequest<SalesTeamDto?>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class GetSalesTeamByIdQueryHandler : IRequestHandler<GetSalesTeamByIdQuery, SalesTeamDto?>
{
    private readonly CRMDbContext _context;

    public GetSalesTeamByIdQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<SalesTeamDto?> Handle(GetSalesTeamByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.SalesTeams
            .Include(s => s.ParentTeam)
            .Include(s => s.Territory)
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.TenantId == request.TenantId, cancellationToken);

        if (entity == null)
            return null;

        return new SalesTeamDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Code = entity.Code,
            Description = entity.Description,
            IsActive = entity.IsActive,
            TeamLeaderId = entity.TeamLeaderId,
            TeamLeaderName = entity.TeamLeaderName,
            ParentTeamId = entity.ParentTeamId,
            ParentTeamName = entity.ParentTeam?.Name,
            SalesTarget = entity.SalesTarget,
            TargetPeriod = entity.TargetPeriod,
            Currency = entity.Currency,
            TerritoryId = entity.TerritoryId,
            TerritoryNames = entity.TerritoryNames,
            TeamEmail = entity.TeamEmail,
            CommunicationChannel = entity.CommunicationChannel,
            ActiveMemberCount = entity.Members.Count(m => m.IsActive),
            TotalMemberCount = entity.Members.Count
        };
    }
}
