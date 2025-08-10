namespace Stocker.Web.Portal.Models;

public class LoginModel
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public Guid? TenantId { get; set; }
}

public class RegisterModel
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}

public class AuthenticationResponse
{
    public bool Success { get; set; }
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? AccessTokenExpiration { get; set; }
    public DateTime? RefreshTokenExpiration { get; set; }
    public List<string> Errors { get; set; } = new();
    public UserInfo? User { get; set; }
}

public class UserInfo
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public Guid? TenantId { get; set; }
    public string? TenantName { get; set; }
    public List<string> Roles { get; set; } = new();
    public bool IsMasterUser { get; set; }
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public List<string>? Errors { get; set; }
}