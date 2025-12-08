namespace Stocker.SharedKernel.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? UserName { get; }
    string? Email { get; }
    Guid? TenantId { get; }
    bool IsAuthenticated { get; }
    bool IsSuperAdmin { get; }
    string? Role { get; }
    IEnumerable<string> Permissions { get; }

    /// <summary>
    /// Gets the current user information
    /// </summary>
    CurrentUserInfo? GetCurrentUser();
}

/// <summary>
/// Represents current user information
/// </summary>
public class CurrentUserInfo
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
}