using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Queries;

public class GetPipelinesQuery : IRequest<IEnumerable<PipelineDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsDefault { get; set; }
}