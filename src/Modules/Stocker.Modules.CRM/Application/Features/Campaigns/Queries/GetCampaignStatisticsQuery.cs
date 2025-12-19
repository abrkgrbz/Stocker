using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Queries;

public class GetCampaignStatisticsQuery : IRequest<CampaignStatisticsDto>
{
    public Guid CampaignId { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetCampaignStatisticsQueryHandler : IRequestHandler<GetCampaignStatisticsQuery, CampaignStatisticsDto>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetCampaignStatisticsQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CampaignStatisticsDto> Handle(GetCampaignStatisticsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var campaign = await _unitOfWork.ReadRepository<Campaign>().AsQueryable()
            .Include(c => c.Members)
            .FirstOrDefaultAsync(c => c.Id == request.CampaignId && c.TenantId == tenantId, cancellationToken);

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
