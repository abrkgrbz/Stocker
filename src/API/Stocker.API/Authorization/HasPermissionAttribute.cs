using Microsoft.AspNetCore.Authorization;

namespace Stocker.API.Authorization;

/// <summary>
/// Attribute to require a specific permission for an action or controller
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class HasPermissionAttribute : AuthorizeAttribute
{
    /// <summary>
    /// Creates a permission requirement with the specified resource and permission type
    /// </summary>
    /// <param name="resource">The resource name (e.g., "CRM", "CRM.Customers")</param>
    /// <param name="permissionType">The permission type (e.g., "View", "Create", "Edit", "Delete")</param>
    public HasPermissionAttribute(string resource, string permissionType)
        : base(policy: $"Permission:{resource}:{permissionType}")
    {
        Resource = resource;
        PermissionType = permissionType;
    }

    public string Resource { get; }
    public string PermissionType { get; }
}
