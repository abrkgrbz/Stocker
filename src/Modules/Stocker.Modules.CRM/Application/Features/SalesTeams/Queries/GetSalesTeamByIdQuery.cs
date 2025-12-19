using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.SalesTeams.Queries;

public class GetSalesTeamByIdQuery : IRequest<SalesTeamDto?>
{
    public Guid Id { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetSalesTeamByIdQueryHandler : IRequestHandler<GetSalesTeamByIdQuery, SalesTeamDto?>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetSalesTeamByIdQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<SalesTeamDto?> Handle(GetSalesTeamByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var entity = await _unitOfWork.ReadRepository<SalesTeam>().AsQueryable()
            .Include(s => s.ParentTeam)
            .Include(s => s.Territory)
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.TenantId == tenantId, cancellationToken);

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
