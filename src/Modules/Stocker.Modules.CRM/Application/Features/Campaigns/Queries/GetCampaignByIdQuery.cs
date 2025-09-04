using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Queries;

public class GetCampaignByIdQuery : IRequest<CampaignDto?>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}