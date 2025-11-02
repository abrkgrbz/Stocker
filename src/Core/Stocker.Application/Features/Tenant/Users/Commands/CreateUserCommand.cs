using MediatR;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Application.Features.Tenant.Users.Commands;

public class CreateUserCommand : IRequest<UserDto>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // Legacy: single role
    public List<Guid>? RoleIds { get; set; } // Multiple roles support
    public string? Department { get; set; }
    public string? Branch { get; set; }
    public string? Phone { get; set; }
    public string? CreatedBy { get; set; }
}