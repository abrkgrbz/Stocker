namespace Stocker.Application.DTOs.Tenant.Users;

/// <summary>
/// Result DTO for account activation (setup password).
/// Contains authentication tokens for auto-login after activation.
/// </summary>
public class SetupPasswordResultDto
{
    /// <summary>
    /// JWT access token for immediate authentication.
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Refresh token for token renewal.
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>
    /// Token expiration time.
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Token type (always "Bearer").
    /// </summary>
    public string TokenType { get; set; } = "Bearer";

    /// <summary>
    /// User ID for frontend reference.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Tenant ID for frontend reference.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// User's full name for display.
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// User's email.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's roles.
    /// </summary>
    public List<string> Roles { get; set; } = new();

    /// <summary>
    /// Tenant's subdomain for redirect URL (e.g., "companyname" from "companyname.stoocker.app").
    /// </summary>
    public string TenantSubdomain { get; set; } = string.Empty;
}
