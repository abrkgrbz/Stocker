using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Inventory.Infrastructure.Security;

/// <summary>
/// Attribute to enforce tenant isolation on controller actions.
/// Validates that all entity operations are within the authenticated tenant's scope.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class EnforceTenantIsolationAttribute : TypeFilterAttribute
{
    public EnforceTenantIsolationAttribute() : base(typeof(TenantIsolationFilter)) { }
}

/// <summary>
/// Filter that validates tenant context is present and consistent.
/// Prevents cross-tenant data access.
/// </summary>
public class TenantIsolationFilter : IAsyncActionFilter
{
    private readonly ITenantService _tenantService;
    private readonly ILogger<TenantIsolationFilter> _logger;

    public TenantIsolationFilter(ITenantService tenantService, ILogger<TenantIsolationFilter> logger)
    {
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var tenantId = _tenantService.GetCurrentTenantId();

        if (!tenantId.HasValue)
        {
            _logger.LogWarning("Tenant isolation violation: No tenant context for {Action}",
                context.ActionDescriptor.DisplayName);

            context.Result = new ObjectResult(new
            {
                error = "Tenant context required",
                message = "This operation requires a valid tenant context."
            })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
            return;
        }

        // Validate tenant ID in request body matches authenticated tenant
        if (context.ActionArguments.Count > 0)
        {
            foreach (var arg in context.ActionArguments.Values)
            {
                if (arg == null) continue;

                var tenantIdProp = arg.GetType().GetProperty("TenantId");
                if (tenantIdProp != null)
                {
                    var bodyTenantId = tenantIdProp.GetValue(arg);
                    if (bodyTenantId is Guid bodyGuid && bodyGuid != Guid.Empty && bodyGuid != tenantId.Value)
                    {
                        _logger.LogWarning(
                            "Tenant isolation violation: Body TenantId={BodyTenant} != Auth TenantId={AuthTenant} for {Action}",
                            bodyGuid, tenantId.Value, context.ActionDescriptor.DisplayName);

                        context.Result = new ObjectResult(new
                        {
                            error = "Tenant mismatch",
                            message = "Request tenant does not match authenticated tenant."
                        })
                        {
                            StatusCode = StatusCodes.Status403Forbidden
                        };
                        return;
                    }
                }
            }
        }

        await next();
    }
}

/// <summary>
/// Query-level tenant isolation enforcer.
/// Ensures all queries are filtered by the correct tenant ID.
/// </summary>
public class TenantQueryGuard
{
    private readonly ILogger<TenantQueryGuard> _logger;

    public TenantQueryGuard(ILogger<TenantQueryGuard> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Validate that a tenant ID matches the expected tenant for the operation.
    /// </summary>
    public bool ValidateTenantAccess(Guid requestedTenantId, Guid authenticatedTenantId)
    {
        if (requestedTenantId != authenticatedTenantId)
        {
            _logger.LogWarning(
                "Cross-tenant access attempt detected: Requested={Requested}, Authenticated={Authenticated}",
                requestedTenantId, authenticatedTenantId);
            return false;
        }
        return true;
    }

    /// <summary>
    /// Validate entity belongs to the correct tenant before modification.
    /// </summary>
    public bool ValidateEntityOwnership(Guid entityTenantId, Guid authenticatedTenantId, string entityType, string entityId)
    {
        if (entityTenantId != authenticatedTenantId)
        {
            _logger.LogWarning(
                "Entity ownership violation: {EntityType}#{EntityId} belongs to tenant {EntityTenant}, accessed by tenant {AuthTenant}",
                entityType, entityId, entityTenantId, authenticatedTenantId);
            return false;
        }
        return true;
    }
}
