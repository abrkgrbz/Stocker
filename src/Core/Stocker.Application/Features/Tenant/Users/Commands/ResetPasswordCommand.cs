using MediatR;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Application.Features.Tenant.Users.Commands;

public class ResetPasswordCommand : IRequest<bool>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string NewPassword { get; set; } = string.Empty;
    public string? ModifiedBy { get; set; }
}