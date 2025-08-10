using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;

namespace Stocker.Application.DTOs.MasterUser;

public class MasterUserDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string? Phone { get; set; }
    public UserType UserType { get; set; }
    public bool IsActive { get; set; }
    public bool IsEmailVerified { get; set; }
    public bool IsTwoFactorEnabled { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<TenantAssignmentDto> AssignedTenants { get; set; } = new();
}

public class TenantAssignmentDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime AssignedDate { get; set; }
}