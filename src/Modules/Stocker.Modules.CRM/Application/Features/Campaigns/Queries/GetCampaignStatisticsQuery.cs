using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Queries;

public class GetCampaignStatisticsQuery : IRequest<CampaignStatisticsDto>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid CampaignId { get; set; }
}

public class GetCampaignStatisticsQueryHandler : IRequestHandler<GetCampaignStatisticsQuery, CampaignStatisticsDto>
{
    private readonly CRMDbContext _context;

    public GetCampaignStatisticsQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<CampaignStatisticsDto> Handle(GetCampaignStatisticsQuery request, CancellationToken cancellationToken)
    {
        var campaign = await _context.Campaigns
            .Include(c => c.Members)
            .FirstOrDefaultAsync(c => c.Id == request.CampaignId && c.TenantId == request.TenantId, cancellationToken);

        if (campaign == null)
            return new CampaignStatisticsDto();

        var members = campaign.Members.ToList();
        var respondedCount = members.Count(m => m.RespondedDate.HasValue);
        var convertedCount = members.Count(m => m.HasConverted);

        var membersByStatus = members
            .GroupBy(m => m.Status)
            .ToDictionary(g => g.Key, g => g.Count());

        // Group by RespondedDate or ConvertedDate since CampaignMember has no CreatedAt
        var dailyActivity = members
            .Where(m => m.RespondedDate.HasValue || m.ConvertedDate.HasValue)
            .GroupBy(m => (m.RespondedDate ?? m.ConvertedDate)!.Value.Date)
            .OrderBy(g => g.Key)
            .Select(g => new DailyCampaignActivityDto
            {
                Date = g.Key,
                NewMembers = g.Count(),
                Responses = g.Count(m => m.RespondedDate.HasValue && m.RespondedDate.Value.Date == g.Key),
                Conversions = g.Count(m => m.ConvertedDate.HasValue && m.ConvertedDate.Value.Date == g.Key)
            })
            .ToList();

        return new CampaignStatisticsDto
        {
            CampaignId = campaign.Id,
            CampaignName = campaign.Name,
            TotalMembers = members.Count,
            RespondedMembers = respondedCount,
            ConvertedMembers = convertedCount,
            ResponseRate = members.Count > 0 ? (decimal)respondedCount / members.Count * 100 : 0,
            ConversionRate = members.Count > 0 ? (decimal)convertedCount / members.Count * 100 : 0,
            MembersByStatus = membersByStatus,
            DailyActivity = dailyActivity
        };
    }
}