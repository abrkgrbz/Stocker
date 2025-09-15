using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Stocker.Infrastructure.Services;
using System.Diagnostics;
using System.Text.Json;

namespace Stocker.API.Filters;

/// <summary>
/// Action filter for automatic audit logging of API calls
/// </summary>
public class AuditActionFilter : IAsyncActionFilter
{
    private readonly IAuditService _auditService;
    private readonly ILogger<AuditActionFilter> _logger;
    private readonly HashSet<string> _excludedActions;
    private readonly HashSet<string> _sensitiveParameters;

    public AuditActionFilter(
        IAuditService auditService,
        ILogger<AuditActionFilter> logger)
    {
        _auditService = auditService;
        _logger = logger;
        
        // Actions to exclude from audit logging
        _excludedActions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Health",
            "GetHealth",
            "Swagger",
            "GetSwagger",
            "Metrics",
            "GetMetrics"
        };
        
        // Parameters to mask in audit logs
        _sensitiveParameters = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "password",
            "newPassword",
            "oldPassword",
            "confirmPassword",
            "token",
            "refreshToken",
            "apiKey",
            "secret",
            "creditCard",
            "ssn"
        };
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        // Skip if action is excluded
        var actionName = context.ActionDescriptor.DisplayName ?? "Unknown";
        if (ShouldSkipAudit(context))
        {
            await next();
            return;
        }

        var stopwatch = Stopwatch.StartNew();
        var requestData = GetRequestData(context);
        
        try
        {
            // Execute the action
            var resultContext = await next();
            stopwatch.Stop();

            // Log successful execution
            await LogAuditAsync(
                context,
                resultContext,
                requestData,
                stopwatch.ElapsedMilliseconds,
                success: true);
            
            // Log performance for slow operations
            if (stopwatch.ElapsedMilliseconds > 1000)
            {
                if (_auditService is EnhancedAuditService enhancedService)
                {
                    await enhancedService.LogPerformanceEventAsync(
                        actionName,
                        stopwatch.ElapsedMilliseconds,
                        new Dictionary<string, object>
                        {
                            ["Controller"] = context.Controller.GetType().Name,
                            ["Action"] = context.ActionDescriptor.DisplayName ?? "Unknown"
                        });
                }
            }
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            
            // Log failed execution
            await LogAuditAsync(
                context,
                null,
                requestData,
                stopwatch.ElapsedMilliseconds,
                success: false,
                error: ex.Message);
            
            throw;
        }
    }

    private bool ShouldSkipAudit(ActionExecutingContext context)
    {
        // Skip if action is in excluded list
        var actionName = context.ActionDescriptor.DisplayName?.Split('.').LastOrDefault();
        if (actionName != null && _excludedActions.Contains(actionName))
            return true;

        // Skip GET requests unless they're search or export operations
        if (context.HttpContext.Request.Method == "GET")
        {
            var path = context.HttpContext.Request.Path.Value?.ToLower() ?? "";
            if (!path.Contains("search") && !path.Contains("export") && !path.Contains("report"))
                return true;
        }

        // Skip if NoAudit attribute is present
        var noAuditAttribute = context.ActionDescriptor.EndpointMetadata
            .OfType<NoAuditAttribute>()
            .FirstOrDefault();
        
        return noAuditAttribute != null;
    }

    private Dictionary<string, object> GetRequestData(ActionExecutingContext context)
    {
        var data = new Dictionary<string, object>();
        
        // Add basic request info
        data["Method"] = context.HttpContext.Request.Method;
        data["Path"] = context.HttpContext.Request.Path.Value ?? "";
        data["QueryString"] = context.HttpContext.Request.QueryString.Value ?? "";
        data["Controller"] = context.Controller.GetType().Name;
        data["Action"] = context.ActionDescriptor.DisplayName ?? "Unknown";
        
        // Add action arguments (masked)
        if (context.ActionArguments.Any())
        {
            var maskedArguments = MaskSensitiveData(context.ActionArguments);
            data["Arguments"] = JsonSerializer.Serialize(maskedArguments);
        }
        
        return data;
    }

    private async Task LogAuditAsync(
        ActionExecutingContext context,
        ActionExecutedContext? resultContext,
        Dictionary<string, object> requestData,
        long elapsedMs,
        bool success,
        string? error = null)
    {
        try
        {
            var additionalData = new Dictionary<string, object>(requestData)
            {
                ["Success"] = success,
                ["ElapsedMs"] = elapsedMs
            };

            if (!success && error != null)
            {
                additionalData["Error"] = error;
            }

            if (resultContext?.Result is ObjectResult objectResult)
            {
                additionalData["StatusCode"] = objectResult.StatusCode ?? 200;
                
                // Don't log the full response, just the type
                additionalData["ResponseType"] = objectResult.Value?.GetType().Name ?? "null";
            }

            var entityName = "ApiCall";
            var entityId = context.HttpContext.TraceIdentifier;
            var action = $"{context.HttpContext.Request.Method}:{context.HttpContext.Request.Path}";

            await _auditService.LogAsync(
                entityName,
                entityId,
                action,
                null,
                null,
                additionalData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to write audit log");
        }
    }

    private Dictionary<string, object?> MaskSensitiveData(IDictionary<string, object?> data)
    {
        var masked = new Dictionary<string, object?>();
        
        foreach (var kvp in data)
        {
            if (_sensitiveParameters.Contains(kvp.Key))
            {
                masked[kvp.Key] = "***MASKED***";
            }
            else if (kvp.Value is string strValue && _sensitiveParameters.Any(p => kvp.Key.Contains(p, StringComparison.OrdinalIgnoreCase)))
            {
                masked[kvp.Key] = "***MASKED***";
            }
            else
            {
                masked[kvp.Key] = kvp.Value;
            }
        }
        
        return masked;
    }
}

/// <summary>
/// Attribute to exclude an action from audit logging
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class NoAuditAttribute : Attribute
{
}