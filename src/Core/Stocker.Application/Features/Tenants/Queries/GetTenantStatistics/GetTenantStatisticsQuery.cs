using MediatR;
using Stocker.Application.DTOs.Tenant;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Queries.GetTenantStatistics;

public record GetTenantStatisticsQuery : IRequest<Result<TenantStatisticsDto>>
{
    public Guid TenantId { get; init; }
}