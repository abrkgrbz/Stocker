using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Commands;

public class CompleteCampaignCommand : IRequest<Result<CampaignDto>>
{
    public Guid Id { get; set; }
}