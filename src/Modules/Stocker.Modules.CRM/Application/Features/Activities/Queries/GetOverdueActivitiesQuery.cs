using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Activities.Queries;

public class GetOverdueActivitiesQuery : IRequest<IEnumerable<ActivityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid? AssignedToId { get; set; }
}