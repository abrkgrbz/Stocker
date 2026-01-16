using Microsoft.AspNetCore.Authorization;

namespace Stocker.API.Authorization;

/// <summary>
/// Authorization requirement for checking user permissions
/// </summary>
public class PermissionRequirement : IAuthorizationRequirement
{
    public string Resource { get; }
    public string PermissionType { get; }

    public PermissionRequirement(string resource, string permissionType)
    {
        Resource = resource ?? throw new ArgumentNullException(nameof(resource));
        PermissionType = permissionType ?? throw new ArgumentNullException(nameof(permissionType));
    }

    /// <summary>
    /// Gets the permission string in format "Resource:PermissionType"
    /// </summary>
    public string PermissionString => $"{Resource}:{PermissionType}";
}
