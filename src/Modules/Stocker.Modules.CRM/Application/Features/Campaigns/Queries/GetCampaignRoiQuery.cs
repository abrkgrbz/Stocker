using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Queries;

public class GetCampaignRoiQuery : IRequest<CampaignRoiDto>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid CampaignId { get; set; }
}

public class GetCampaignRoiQueryHandler : IRequestHandler<GetCampaignRoiQuery, CampaignRoiDto>
{
    private readonly CRMDbContext _context;

    public GetCampaignRoiQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<CampaignRoiDto> Handle(GetCampaignRoiQuery request, CancellationToken cancellationToken)
    {
        var campaign = await _context.Campaigns
            .Include(c => c.Members)
            .Include(c => c.GeneratedLeads)
            .FirstOrDefaultAsync(c => c.Id == request.CampaignId && c.TenantId == request.TenantId, cancellationToken);

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