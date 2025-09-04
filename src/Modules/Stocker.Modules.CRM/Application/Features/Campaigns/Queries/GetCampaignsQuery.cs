using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Queries;

public class GetCampaignsQuery : IRequest<IEnumerable<CampaignDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string? Search { get; set; }
    public CampaignStatus? Status { get; set; }
    public CampaignType? Type { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}