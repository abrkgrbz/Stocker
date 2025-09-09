using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.Tenant;

namespace Stocker.Application.Features.Tenants.Queries.GetTenantsStatistics;

public class GetTenantsStatisticsQuery : IRequest<Result<TenantsStatisticsDto>>
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}