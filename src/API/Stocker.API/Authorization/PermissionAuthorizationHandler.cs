using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Stocker.API.Authorization;

/// <summary>
/// Authorization handler for checking user permissions from JWT claims
/// </summary>
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly ILogger<PermissionAuthorizationHandler> _logger;

    public PermissionAuthorizationHandler(ILogger<PermissionAuthorizationHandler> logger)
    {
        _logger = logger;
    }

    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        // Get user identity
        var user = context.User;
        if (user?.Identity?.IsAuthenticated != true)
        {
            _logger.LogDebug("User is not authenticated");
            return Task.CompletedTask;
        }

        // Check if user is a system admin (FirmaYoneticisi or SistemYoneticisi) - they have all permissions
        var roles = user.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
        if (roles.Contains("FirmaYoneticisi") || roles.Contains("SistemYoneticisi"))
        {
            _logger.LogDebug("User has admin role, granting permission: {Permission}", requirement.PermissionString);
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Get all Permission claims from the JWT
        var permissions = user.FindAll("Permission").Select(c => c.Value).ToList();

        _logger.LogDebug("Checking permission {Permission} against user permissions: {UserPermissions}",
            requirement.PermissionString, string.Join(", ", permissions));

        // Check if user has the required permission
        if (permissions.Contains(requirement.PermissionString))
        {
            _logger.LogDebug("Permission {Permission} granted", requirement.PermissionString);
            context.Succeed(requirement);
        }
        else
        {
            _logger.LogDebug("Permission {Permission} denied. User permissions: {UserPermissions}",
                requirement.PermissionString, string.Join(", ", permissions));
        }

        return Task.CompletedTask;
    }
}
