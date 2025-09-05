using MediatR;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Application.Features.Tenant.Users.Queries;

public class GetUsersQuery : IRequest<UsersListDto>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public string? Role { get; set; }
    public string? Status { get; set; }
}