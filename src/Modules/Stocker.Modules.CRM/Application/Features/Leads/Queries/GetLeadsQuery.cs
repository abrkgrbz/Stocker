using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.CRM.Application.Features.Leads.Queries;

public class GetLeadsQuery : IRequest<PagedResult<LeadDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string? Search { get; set; }
    public LeadStatus? Status { get; set; }
    public LeadRating? Rating { get; set; }
    public string? Source { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}