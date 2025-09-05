using MediatR;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Application.Features.Tenant.Users.Commands;

public class UpdateUserCommand : IRequest<bool>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Role { get; set; }
    public string? Department { get; set; }
    public string? Branch { get; set; }
    public string? Phone { get; set; }
    public string? ModifiedBy { get; set; }
}