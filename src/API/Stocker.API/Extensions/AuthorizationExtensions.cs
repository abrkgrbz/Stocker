namespace Stocker.API.Extensions;

/// <summary>
/// Extension methods for configuring authorization policies
/// </summary>
public static class AuthorizationExtensions
{
    /// <summary>
    /// Adds role-based authorization policies (System Admin, Master Access, Tenant Admin, User)
    /// </summary>
    public static IServiceCollection AddAuthorizationPolicies(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            // System Admin - Full system access
            options.AddPolicy("SystemAdminPolicy", policy =>
                policy.RequireRole("SistemYoneticisi"));

            // Master Access - For master panel operations
            options.AddPolicy("RequireMasterAccess", policy =>
                policy.RequireRole("SistemYoneticisi"));

            // Tenant Admin - Tenant-scoped access
            options.AddPolicy("TenantAdminPolicy", policy =>
                policy.RequireRole("FirmaYoneticisi", "SistemYoneticisi"));

            // Regular User - Requires authentication and TenantId claim
            options.AddPolicy("UserPolicy", policy =>
                policy.RequireAuthenticatedUser()
                      .RequireClaim("TenantId"));
        });

        return services;
    }
}
