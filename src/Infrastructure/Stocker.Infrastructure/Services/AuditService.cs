using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Stocker.Domain.Tenant.Entities;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Interfaces;
using System.Text.Json;
using Stocker.SharedKernel.Exceptions;

namespace Stocker.Infrastructure.Services;

public interface IAuditService
{
    Task LogAsync(
        string entityName,
        string entityId,
        string action,
        object? oldValues = null,
        object? newValues = null,
        Dictionary<string, object>? additionalData = null);

    Task LogSettingChangeAsync(
        string settingKey,
        string? oldValue,
        string newValue,
        Dictionary<string, object>? additionalData = null);

    Task LogModuleToggleAsync(
        string moduleCode,
        bool oldStatus,
        bool newStatus,
        Dictionary<string, object>? additionalData = null);
}

public class AuditService : IAuditService
{
    private readonly ITenantDbContext _context;
    private readonly Application.Common.Interfaces.ICurrentUserService _currentUserService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<AuditService> _logger;

    public AuditService(
        ITenantDbContext context,
        Application.Common.Interfaces.ICurrentUserService currentUserService,
        IHttpContextAccessor httpContextAccessor,
        ILogger<AuditService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task LogAsync(
        string entityName,
        string entityId,
        string action,
        object? oldValues = null,
        object? newValues = null,
        Dictionary<string, object>? additionalData = null)
    {
        try
        {
            if (!Guid.TryParse(_currentUserService.TenantId, out var tenantId) || tenantId == Guid.Empty)
            {
                _logger.LogWarning("Cannot create audit log without tenant ID");
                return;
            }

            var userId = _currentUserService.UserId?.ToString() ?? Guid.Empty.ToString();
            var userName = _currentUserService.UserName ?? "System";
            var userEmail = _currentUserService.Email;
            
            var httpContext = _httpContextAccessor.HttpContext;
            var ipAddress = GetClientIpAddress(httpContext);
            var userAgent = httpContext?.Request.Headers["User-Agent"].ToString();

            var auditLog = AuditLog.Create(
                tenantId,
                entityName,
                entityId,
                action,
                userId,
                userName,
                userEmail,
                ipAddress,
                userAgent
            );

            // Serialize values
            if (oldValues != null)
            {
                auditLog.SetOldValues(JsonSerializer.Serialize(oldValues, GetJsonOptions()));
            }

            if (newValues != null)
            {
                auditLog.SetNewValues(JsonSerializer.Serialize(newValues, GetJsonOptions()));
            }

            // Calculate changes
            if (oldValues != null && newValues != null)
            {
                var changes = CalculateChanges(oldValues, newValues);
                if (changes.Any())
                {
                    auditLog.SetChanges(JsonSerializer.Serialize(changes, GetJsonOptions()));
                }
            }

            // Add additional data
            if (additionalData != null && additionalData.Any())
            {
                auditLog.SetAdditionalData(JsonSerializer.Serialize(additionalData, GetJsonOptions()));
            }

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            _logger.LogDebug("Audit log created for {EntityName} {EntityId} - Action: {Action}",
                entityName, entityId, action);
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error creating audit log for {EntityName} {EntityId}",
                entityName, entityId);
            // Don't throw - audit logging should not break the main operation
        }
    }

    public async Task LogSettingChangeAsync(
        string settingKey,
        string? oldValue,
        string newValue,
        Dictionary<string, object>? additionalData = null)
    {
        var data = additionalData ?? new Dictionary<string, object>();
        data["SettingKey"] = settingKey;

        await LogAsync(
            "TenantSettings",
            settingKey,
            "UPDATE",
            oldValue != null ? new { Value = oldValue } : null,
            new { Value = newValue },
            data
        );
    }

    public async Task LogModuleToggleAsync(
        string moduleCode,
        bool oldStatus,
        bool newStatus,
        Dictionary<string, object>? additionalData = null)
    {
        var data = additionalData ?? new Dictionary<string, object>();
        data["ModuleCode"] = moduleCode;

        var action = newStatus ? "ENABLE" : "DISABLE";
        
        await LogAsync(
            "TenantModules",
            moduleCode,
            action,
            new { IsEnabled = oldStatus },
            new { IsEnabled = newStatus },
            data
        );
    }

    private string? GetClientIpAddress(HttpContext? context)
    {
        if (context == null)
            return null;

        // Check for forwarded IP (when behind proxy/load balancer)
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',').First().Trim();
        }

        // Check for real IP header
        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }

        // Fall back to remote IP
        return context.Connection.RemoteIpAddress?.ToString();
    }

    private Dictionary<string, object> CalculateChanges(object oldValues, object newValues)
    {
        var changes = new Dictionary<string, object>();

        try
        {
            var oldJson = JsonSerializer.Serialize(oldValues, GetJsonOptions());
            var newJson = JsonSerializer.Serialize(newValues, GetJsonOptions());

            var oldDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(oldJson);
            var newDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(newJson);

            if (oldDict != null && newDict != null)
            {
                foreach (var key in newDict.Keys)
                {
                    if (!oldDict.ContainsKey(key))
                    {
                        changes[key] = new { Old = (object?)null, New = newDict[key].ToString() };
                    }
                    else if (oldDict[key].ToString() != newDict[key].ToString())
                    {
                        changes[key] = new
                        {
                            Old = oldDict[key].ToString(),
                            New = newDict[key].ToString()
                        };
                    }
                }

                // Check for removed keys
                foreach (var key in oldDict.Keys)
                {
                    if (!newDict.ContainsKey(key))
                    {
                        changes[key] = new { Old = oldDict[key].ToString(), New = (object?)null };
                    }
                }
            }
        }
        catch (System.Exception ex)
        {
            _logger.LogWarning(ex, "Error calculating changes for audit log");
        }

        return changes;
    }

    private JsonSerializerOptions GetJsonOptions()
    {
        return new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };
    }
}