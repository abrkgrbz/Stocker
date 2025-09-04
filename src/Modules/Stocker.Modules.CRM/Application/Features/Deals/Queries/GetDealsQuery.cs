using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Deals.Queries;

public class GetDealsQuery : IRequest<IEnumerable<DealDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string? Search { get; set; }
    public DealStatus? Status { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? PipelineId { get; set; }
    public Guid? StageId { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}