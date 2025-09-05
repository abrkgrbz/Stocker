using MediatR;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Application.Features.Tenant.Users.Commands;

public class ToggleUserStatusCommand : IRequest<ToggleUserStatusResult>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string? ModifiedBy { get; set; }
}

public class ToggleUserStatusResult
{
    public bool IsActive { get; set; }
}