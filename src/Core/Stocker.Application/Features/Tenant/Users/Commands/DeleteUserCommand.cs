using MediatR;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Application.Features.Tenant.Users.Commands;

public class DeleteUserCommand : IRequest<bool>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string? DeletedBy { get; set; }
}