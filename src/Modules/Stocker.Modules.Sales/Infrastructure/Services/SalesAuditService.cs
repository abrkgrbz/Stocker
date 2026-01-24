using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.Services;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using AuditLog = Stocker.Domain.Tenant.Entities.AuditLog;

namespace Stocker.Modules.Sales.Infrastructure.Services;

/// <summary>
/// Implementation of sales audit service.
/// Kritik satış operasyonlarını audit_logs tablosuna kaydeder.
/// Audit loglama hatası ana işlemi engellememeli (fire-and-forget approach with error logging).
/// </summary>
public class SalesAuditService : ISalesAuditService
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<SalesAuditService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public SalesAuditService(
        SalesDbContext dbContext,
        ITenantService tenantService,
        IHttpContextAccessor httpContextAccessor,
        ILogger<SalesAuditService> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task LogOrderCreatedAsync(
        Guid orderId,
        string orderNumber,
        string customerName,
        decimal totalAmount,
        int itemCount,
        CancellationToken cancellationToken = default)
    {
        var newValues = new
        {
            OrderNumber = orderNumber,
            CustomerName = customerName,
            TotalAmount = totalAmount,
            ItemCount = itemCount
        };

        await LogAsync("SalesOrder", orderId.ToString(), "Created", null, newValues,
            JsonSerializer.Serialize(new { orderNumber, customerName }, JsonOptions),
            cancellationToken);
    }

    public async Task LogOrderUpdatedAsync(
        Guid orderId,
        string orderNumber,
        object? oldValues,
        object? newValues,
        CancellationToken cancellationToken = default)
    {
        await LogAsync("SalesOrder", orderId.ToString(), "Updated", oldValues, newValues,
            JsonSerializer.Serialize(new { orderNumber }, JsonOptions),
            cancellationToken);
    }

    public async Task LogOrderStatusChangedAsync(
        Guid orderId,
        string orderNumber,
        string previousStatus,
        string newStatus,
        string? reason = null,
        CancellationToken cancellationToken = default)
    {
        var oldValues = new { Status = previousStatus };
        var newValuesObj = new { Status = newStatus, Reason = reason };

        await LogAsync("SalesOrder", orderId.ToString(), $"StatusChanged:{newStatus}", oldValues, newValuesObj,
            JsonSerializer.Serialize(new { orderNumber, previousStatus, newStatus, reason }, JsonOptions),
            cancellationToken);
    }

    public async Task LogOrderApprovedAsync(
        Guid orderId,
        string orderNumber,
        Guid approvedByUserId,
        CancellationToken cancellationToken = default)
    {
        var newValues = new { Status = "Approved", ApprovedBy = approvedByUserId };

        await LogAsync("SalesOrder", orderId.ToString(), "Approved", null, newValues,
            JsonSerializer.Serialize(new { orderNumber, approvedByUserId }, JsonOptions),
            cancellationToken);
    }

    public async Task LogOrderCancelledAsync(
        Guid orderId,
        string orderNumber,
        string? cancellationReason,
        CancellationToken cancellationToken = default)
    {
        var newValues = new { Status = "Cancelled", CancellationReason = cancellationReason };

        await LogAsync("SalesOrder", orderId.ToString(), "Cancelled", null, newValues,
            JsonSerializer.Serialize(new { orderNumber, cancellationReason }, JsonOptions),
            cancellationToken);
    }

    public async Task LogOrderDeletedAsync(
        Guid orderId,
        string orderNumber,
        string status,
        CancellationToken cancellationToken = default)
    {
        var oldValues = new { OrderNumber = orderNumber, Status = status };

        await LogAsync("SalesOrder", orderId.ToString(), "Deleted", oldValues, null,
            JsonSerializer.Serialize(new { orderNumber, previousStatus = status }, JsonOptions),
            cancellationToken);
    }

    public async Task LogOrderItemAddedAsync(
        Guid orderId,
        string orderNumber,
        string productName,
        decimal quantity,
        decimal unitPrice,
        CancellationToken cancellationToken = default)
    {
        var newValues = new { ProductName = productName, Quantity = quantity, UnitPrice = unitPrice };

        await LogAsync("SalesOrderItem", orderId.ToString(), "ItemAdded", null, newValues,
            JsonSerializer.Serialize(new { orderNumber, productName }, JsonOptions),
            cancellationToken);
    }

    public async Task LogOrderItemRemovedAsync(
        Guid orderId,
        string orderNumber,
        Guid itemId,
        CancellationToken cancellationToken = default)
    {
        var oldValues = new { ItemId = itemId };

        await LogAsync("SalesOrderItem", orderId.ToString(), "ItemRemoved", oldValues, null,
            JsonSerializer.Serialize(new { orderNumber, itemId }, JsonOptions),
            cancellationToken);
    }

    public async Task LogAsync(
        string entityType,
        string entityId,
        string action,
        object? oldValues = null,
        object? newValues = null,
        string? additionalData = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var tenantId = _tenantService.GetCurrentTenantId();
            var userId = GetCurrentUserId();
            var userName = GetCurrentUserName();
            var userEmail = GetCurrentUserEmail();
            var ipAddress = GetClientIpAddress();
            var userAgent = GetUserAgent();

            var auditLog = AuditLog.Create(
                tenantId ?? Guid.Empty,
                entityType,
                entityId,
                action,
                userId,
                userName,
                userEmail,
                ipAddress,
                userAgent);

            if (oldValues != null)
                auditLog.SetOldValues(JsonSerializer.Serialize(oldValues, JsonOptions));

            if (newValues != null)
                auditLog.SetNewValues(JsonSerializer.Serialize(newValues, JsonOptions));

            if (oldValues != null && newValues != null)
            {
                var changes = CalculateChanges(oldValues, newValues);
                if (changes.Count > 0)
                    auditLog.SetChanges(JsonSerializer.Serialize(changes, JsonOptions));
            }

            if (!string.IsNullOrEmpty(additionalData))
                auditLog.SetAdditionalData(additionalData);

            _dbContext.AuditLogs.Add(auditLog);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            // Audit loglama hatası ana işlemi engellememeli
            _logger.LogError(ex, "Audit log kaydı başarısız: {EntityType} {EntityId} {Action}",
                entityType, entityId, action);
        }
    }

    #region Private Helpers

    private string GetCurrentUserId()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "system";
    }

    private string GetCurrentUserName()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        return user?.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value
            ?? user?.FindFirst("name")?.Value
            ?? "System";
    }

    private string? GetCurrentUserEmail()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirst(
            System.Security.Claims.ClaimTypes.Email)?.Value;
    }

    private string? GetClientIpAddress()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return null;

        // Proxy-aware IP detection
        var forwardedFor = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
            return forwardedFor.Split(',')[0].Trim();

        var realIp = httpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
            return realIp;

        return httpContext.Connection.RemoteIpAddress?.ToString();
    }

    private string? GetUserAgent()
    {
        return _httpContextAccessor.HttpContext?.Request.Headers["User-Agent"].FirstOrDefault();
    }

    private static Dictionary<string, object?> CalculateChanges(object oldValues, object newValues)
    {
        var changes = new Dictionary<string, object?>();

        try
        {
            var oldJson = JsonSerializer.Serialize(oldValues, JsonOptions);
            var newJson = JsonSerializer.Serialize(newValues, JsonOptions);

            var oldDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(oldJson, JsonOptions);
            var newDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(newJson, JsonOptions);

            if (oldDict == null || newDict == null) return changes;

            foreach (var kvp in newDict)
            {
                if (oldDict.TryGetValue(kvp.Key, out var oldVal))
                {
                    if (oldVal.ToString() != kvp.Value.ToString())
                    {
                        changes[kvp.Key] = new { OldValue = oldVal.ToString(), NewValue = kvp.Value.ToString() };
                    }
                }
                else
                {
                    changes[kvp.Key] = new { OldValue = (string?)null, NewValue = kvp.Value.ToString() };
                }
            }
        }
        catch
        {
            // Değişiklik hesaplaması başarısız olursa boş döndür
        }

        return changes;
    }

    #endregion
}
