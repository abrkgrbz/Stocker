using MediatR;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Application.Features.Tenant.Users.Queries;

public class GetUserByIdQuery : IRequest<UserDetailDto?>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
}