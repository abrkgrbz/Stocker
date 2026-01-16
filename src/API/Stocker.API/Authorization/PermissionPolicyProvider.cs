using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace Stocker.API.Authorization;

/// <summary>
/// Policy provider that dynamically creates permission policies based on the policy name
/// </summary>
public class PermissionPolicyProvider : IAuthorizationPolicyProvider
{
    private const string PermissionPolicyPrefix = "Permission:";
    private readonly DefaultAuthorizationPolicyProvider _fallbackPolicyProvider;

    public PermissionPolicyProvider(IOptions<AuthorizationOptions> options)
    {
        _fallbackPolicyProvider = new DefaultAuthorizationPolicyProvider(options);
    }

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        // Check if this is a permission policy
        if (policyName.StartsWith(PermissionPolicyPrefix, StringComparison.OrdinalIgnoreCase))
        {
            // Parse the permission from the policy name
            // Format: Permission:Resource:PermissionType
            var permissionPart = policyName.Substring(PermissionPolicyPrefix.Length);
            var parts = permissionPart.Split(':');

            if (parts.Length == 2)
            {
                var resource = parts[0];
                var permissionType = parts[1];

                var policy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .AddRequirements(new PermissionRequirement(resource, permissionType))
                    .Build();

                return Task.FromResult<AuthorizationPolicy?>(policy);
            }
        }

        // Fall back to the default provider for other policies
        return _fallbackPolicyProvider.GetPolicyAsync(policyName);
    }

    public Task<AuthorizationPolicy> GetDefaultPolicyAsync() =>
        _fallbackPolicyProvider.GetDefaultPolicyAsync();

    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync() =>
        _fallbackPolicyProvider.GetFallbackPolicyAsync();
}
