using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.CRM.Application.Features.SalesTeams.Queries;

public class GetSalesTeamsQuery : IRequest<PagedResult<SalesTeamDto>>
{
    public bool? IsActive { get; set; }
    public Guid? ParentTeamId { get; set; }
    public Guid? TerritoryId { get; set; }
    public int? TeamLeaderId { get; set; }
    public string? SearchTerm { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetSalesTeamsQueryHandler : IRequestHandler<GetSalesTeamsQuery, PagedResult<SalesTeamDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetSalesTeamsQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<PagedResult<SalesTeamDto>> Handle(GetSalesTeamsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<SalesTeam>().AsQueryable()
            .Include(s => s.ParentTeam)
            .Include(s => s.Territory)
            .Include(s => s.Members)
            .Where(s => s.TenantId == tenantId);

        if (request.IsActive.HasValue)
            query = query.Where(s => s.IsActive == request.IsActive.Value);

        if (request.ParentTeamId.HasValue)
            query = query.Where(s => s.ParentTeamId == request.ParentTeamId.Value);

        if (request.TerritoryId.HasValue)
            query = query.Where(s => s.TerritoryId == request.TerritoryId.Value);

        if (request.TeamLeaderId.HasValue)
            query = query.Where(s => s.TeamLeaderId == request.TeamLeaderId.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(s => s.Name.ToLower().Contains(searchTerm) ||
                                   s.Code.ToLower().Contains(searchTerm));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(s => s.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(s => new SalesTeamDto
            {
                Id = s.Id,
                Name = s.Name,
                Code = s.Code,
                Description = s.Description,
                IsActive = s.IsActive,
                TeamLeaderId = s.TeamLeaderId,
                TeamLeaderName = s.TeamLeaderName,
                ParentTeamId = s.ParentTeamId,
                ParentTeamName = s.ParentTeam != null ? s.ParentTeam.Name : null,
                SalesTarget = s.SalesTarget,
                TargetPeriod = s.TargetPeriod,
                Currency = s.Currency,
                TerritoryId = s.TerritoryId,
                TerritoryNames = s.TerritoryNames,
                TeamEmail = s.TeamEmail,
                CommunicationChannel = s.CommunicationChannel,
                ActiveMemberCount = s.Members.Count(m => m.IsActive),
                TotalMemberCount = s.Members.Count
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<SalesTeamDto>(items, totalCount, request.Page, request.PageSize);
    }
}
