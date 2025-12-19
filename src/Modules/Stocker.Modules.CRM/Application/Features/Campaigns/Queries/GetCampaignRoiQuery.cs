using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Queries;

public class GetCampaignRoiQuery : IRequest<CampaignRoiDto>
{
    public Guid CampaignId { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetCampaignRoiQueryHandler : IRequestHandler<GetCampaignRoiQuery, CampaignRoiDto>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetCampaignRoiQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CampaignRoiDto> Handle(GetCampaignRoiQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var campaign = await _unitOfWork.ReadRepository<Campaign>().AsQueryable()
            .Include(c => c.Members)
            .Include(c => c.GeneratedLeads)
            .FirstOrDefaultAsync(c => c.Id == request.CampaignId && c.TenantId == tenantId, cancellationToken);

        if (campaign == null)
            return new CampaignRoiDto();

        var convertedCount = campaign.Members.Count(m => m.HasConverted);

        return new CampaignRoiDto
        {
            CampaignId = campaign.Id,
            CampaignName = campaign.Name,
            BudgetedCost = campaign.BudgetedCost.Amount,
            ActualCost = campaign.ActualCost.Amount,
            ExpectedRevenue = campaign.ExpectedRevenue.Amount,
            ActualRevenue = campaign.ActualRevenue.Amount,
            ActualLeads = campaign.GeneratedLeads.Count,
            ConvertedLeads = convertedCount
        };
    }
}
