using MediatR;
using Stocker.Application.DTOs.Tenant;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Queries.GetTenantsList;

public record GetTenantsListQuery : IRequest<Result<List<TenantListDto>>>
{
    public bool? IsActive { get; init; }
    public string? SearchTerm { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}