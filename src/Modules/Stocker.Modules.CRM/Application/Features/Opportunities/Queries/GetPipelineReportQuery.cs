using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Queries;

public class GetPipelineReportQuery : IRequest<PipelineReportDto>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid? PipelineId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}