namespace Stocker.Application.DTOs.Tenant.Users;

public class UserDetailDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Role { get; set; }
    public string? Department { get; set; }
    public string? Branch { get; set; }
    public bool IsActive { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public bool EmailConfirmed { get; set; }
    public bool PhoneConfirmed { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public DateTime? LastPasswordChangeDate { get; set; }
    public DateTime CreatedDate { get; set; }
    public List<string> Permissions { get; set; } = new();
    public List<LoginHistoryDto> LoginHistory { get; set; } = new();
}

public class LoginHistoryDto
{
    public DateTime Date { get; set; }
    public string? IpAddress { get; set; }
    public string? Device { get; set; }
    public string Status { get; set; } = string.Empty;
}