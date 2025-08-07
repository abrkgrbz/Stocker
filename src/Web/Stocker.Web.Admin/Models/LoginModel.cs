using System.ComponentModel.DataAnnotations;

namespace Stocker.Web.Admin.Models;

public class LoginModel
{
    [Required(ErrorMessage = "Email adı gereklidir")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre gereklidir")]
    public string Password { get; set; } = string.Empty;
}

public class LoginResult
{
    public bool Success { get; set; }
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? AccessTokenExpiration { get; set; }
    public UserInfo? User { get; set; }
    public List<string> Errors { get; set; } = new();
    public string? Message { get; set; }
}

public class UserInfo
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public Guid? TenantId { get; set; }
    public string? TenantName { get; set; }
    public bool IsMasterUser { get; set; }
    public List<string> Roles { get; set; } = new();
}