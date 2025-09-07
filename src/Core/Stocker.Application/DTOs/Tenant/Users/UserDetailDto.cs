using Stocker.Application.Interfaces.Repositories;

namespace Stocker.Application.DTOs.Tenant.Users;

public class UserDetailDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Title { get; set; }
    public string? Bio { get; set; }
    public string? Avatar { get; set; }
    public bool IsActive { get; set; }
    public bool EmailConfirmed { get; set; }
    public bool PhoneNumberConfirmed { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public bool LockoutEnabled { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }
    public int AccessFailedCount { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public DateTime? LastPasswordChangeDate { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? ModifiedDate { get; set; }
    public DepartmentDto? Department { get; set; }
    public BranchDto? Branch { get; set; }
    public List<RoleDto> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    public UserSettingsDto Settings { get; set; } = new();
    public List<LoginHistoryDto> LoginHistory { get; set; } = new();
}

public class DepartmentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class BranchDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class UserSettingsDto
{
    public string Theme { get; set; } = "light";
    public string Language { get; set; } = "tr";
    public bool NotificationsEnabled { get; set; } = true;
    public bool EmailNotifications { get; set; } = true;
    public bool SmsNotifications { get; set; } = false;
}

public class LoginHistoryDto
{
    public DateTime Date { get; set; }
    public string? IpAddress { get; set; }
    public string? Device { get; set; }
    public string Status { get; set; } = string.Empty;
}