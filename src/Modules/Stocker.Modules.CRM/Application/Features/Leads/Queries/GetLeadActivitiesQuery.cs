using MediatR;
using Stocker.Modules.CRM.Application.DTOs;

namespace Stocker.Modules.CRM.Application.Features.Leads.Queries;

public class GetLeadActivitiesQuery : IRequest<IEnumerable<ActivityDto>>
{
    public Guid LeadId { get; set; }
}