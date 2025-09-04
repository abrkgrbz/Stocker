using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Queries;

public class GetPipelineStagesQuery : IRequest<IEnumerable<PipelineStageDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid PipelineId { get; set; }
}