using System.Security.Claims;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Authorization;

namespace Stocker.API.Middleware;

/// <summary>
/// Middleware that checks if tenant has subscribed to the module required by the endpoint
/// Blocks access to modules that tenant hasn't purchased/activated
/// Phase 4.5: Now reads tenant-specific module subscriptions from database
/// </summary>
public class ModuleAuthorizationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ModuleAuthorizationMiddleware> _logger;

    public ModuleAuthorizationMiddleware(
        RequestDelegate next,
        ILogger<ModuleAuthorizationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ITenantModuleService tenantModuleService)
    {
        // Skip for non-authenticated requests or public endpoints
        if (!context.User.Identity?.IsAuthenticated ?? true)
        {
            await _next(context);
            return;
        }

        // Check if endpoint has [RequireModule] attribute
        var endpoint = context.GetEndpoint();
        var requireModuleAttr = endpoint?.Metadata.GetMetadata<RequireModuleAttribute>();

        if (requireModuleAttr == null)
        {
            // No module requirement, proceed
            await _next(context);
            return;
        }

        // Get tenant ID from claims
        var tenantIdClaim = context.User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var tenantId))
        {
            _logger.LogWarning("TenantId claim not found or invalid for user {UserId}",
                context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Tenant information not found",
                message = "Unable to verify tenant subscription"
            });
            return;
        }

        // Phase 4.5: Get tenant-specific subscribed modules from database
        var requiredModule = requireModuleAttr.ModuleName;
        bool hasModuleAccess;

        try
        {
            hasModuleAccess = await tenantModuleService.HasModuleAccessAsync(tenantId, requiredModule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error checking module access for tenant {TenantId} and module {Module}",
                tenantId, requiredModule);

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Module authorization error",
                message = "Unable to verify module subscription. Please try again later."
            });
            return;
        }

        if (!hasModuleAccess)
        {
            // Get tenant's subscribed modules for error response
            var subscribedModules = await tenantModuleService.GetSubscribedModulesAsync(tenantId);

            _logger.LogWarning(
                "Tenant {TenantId} attempted to access {Module} module without subscription. Subscribed modules: {SubscribedModules}",
                tenantId,
                requiredModule,
                string.Join(", ", subscribedModules));

            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Module not subscribed",
                message = $"Your subscription does not include the {requiredModule} module. Please contact support to upgrade your plan.",
                requiredModule = requiredModule,
                subscribedModules = subscribedModules,
                upgradeUrl = "/pricing" // Optional: Link to pricing/upgrade page
            });
            return;
        }

        _logger.LogDebug(
            "Tenant {TenantId} authorized for {Module} module",
            tenantId,
            requiredModule);

        // Module authorized, proceed
        await _next(context);
    }
}
