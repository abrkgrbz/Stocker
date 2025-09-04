using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Queries;

public class GetPipelineByIdQuery : IRequest<PipelineDto?>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}