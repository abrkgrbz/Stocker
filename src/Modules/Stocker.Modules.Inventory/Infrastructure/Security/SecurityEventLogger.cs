using Microsoft.Extensions.Logging;

namespace Stocker.Modules.Inventory.Infrastructure.Security;

/// <summary>
/// Security-focused event logger for inventory operations.
/// Records security-relevant events for compliance and threat detection.
/// </summary>
public class SecurityEventLogger
{
    private readonly ILogger<SecurityEventLogger> _logger;

    public SecurityEventLogger(ILogger<SecurityEventLogger> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Log unauthorized access attempt.
    /// </summary>
    public void LogUnauthorizedAccess(string userId, Guid tenantId, string resource, string action)
    {
        _logger.LogWarning(
            "[SECURITY] Unauthorized access: User={UserId}, Tenant={TenantId}, Resource={Resource}, Action={Action}",
            userId, tenantId, resource, action);
    }

    /// <summary>
    /// Log cross-tenant access violation.
    /// </summary>
    public void LogCrossTenantViolation(string userId, Guid requestedTenant, Guid authenticatedTenant, string resource)
    {
        _logger.LogCritical(
            "[SECURITY] Cross-tenant violation: User={UserId}, Requested={RequestedTenant}, Authenticated={AuthTenant}, Resource={Resource}",
            userId, requestedTenant, authenticatedTenant, resource);
    }

    /// <summary>
    /// Log suspicious bulk operation.
    /// </summary>
    public void LogSuspiciousBulkOperation(string userId, Guid tenantId, string operation, int itemCount)
    {
        _logger.LogWarning(
            "[SECURITY] Suspicious bulk operation: User={UserId}, Tenant={TenantId}, Operation={Operation}, Items={ItemCount}",
            userId, tenantId, operation, itemCount);
    }

    /// <summary>
    /// Log rate limit breach.
    /// </summary>
    public void LogRateLimitBreach(string userId, Guid tenantId, string endpoint, int requestCount)
    {
        _logger.LogWarning(
            "[SECURITY] Rate limit breach: User={UserId}, Tenant={TenantId}, Endpoint={Endpoint}, Requests={RequestCount}",
            userId, tenantId, endpoint, requestCount);
    }

    /// <summary>
    /// Log sensitive data access.
    /// </summary>
    public void LogSensitiveDataAccess(string userId, Guid tenantId, string dataType, string purpose)
    {
        _logger.LogInformation(
            "[SECURITY] Sensitive data access: User={UserId}, Tenant={TenantId}, DataType={DataType}, Purpose={Purpose}",
            userId, tenantId, dataType, purpose);
    }

    /// <summary>
    /// Log stock adjustment over threshold (potential fraud indicator).
    /// </summary>
    public void LogHighValueAdjustment(string userId, Guid tenantId, int productId, decimal quantity, decimal threshold)
    {
        _logger.LogWarning(
            "[SECURITY] High-value adjustment: User={UserId}, Tenant={TenantId}, Product={ProductId}, Quantity={Quantity}, Threshold={Threshold}",
            userId, tenantId, productId, quantity, threshold);
    }

    /// <summary>
    /// Log data export event for compliance tracking.
    /// </summary>
    public void LogDataExport(string userId, Guid tenantId, string exportType, int recordCount)
    {
        _logger.LogInformation(
            "[SECURITY] Data export: User={UserId}, Tenant={TenantId}, Type={ExportType}, Records={RecordCount}",
            userId, tenantId, exportType, recordCount);
    }

    /// <summary>
    /// Log circuit breaker state change (potential DoS indicator).
    /// </summary>
    public void LogCircuitBreakerStateChange(string circuitName, string oldState, string newState)
    {
        _logger.LogWarning(
            "[SECURITY] Circuit breaker state change: Circuit={CircuitName}, OldState={OldState}, NewState={NewState}",
            circuitName, oldState, newState);
    }
}
