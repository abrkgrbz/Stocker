namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for handling complete tenant deletion including database cleanup.
/// This is a dangerous operation and should be used with extreme caution.
/// </summary>
public interface ITenantDeletionService
{
    /// <summary>
    /// Checks if the user is the owner of their tenant.
    /// Only tenant owners can delete the entire tenant.
    /// </summary>
    /// <param name="userId">The user ID to check</param>
    /// <param name="tenantId">The tenant ID</param>
    /// <returns>True if user is the tenant owner</returns>
    Task<bool> IsUserTenantOwnerAsync(Guid userId, Guid tenantId);

    /// <summary>
    /// Gets information about what will be deleted when a tenant is removed.
    /// Used to show warnings to the user before deletion.
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <returns>Summary of data that will be deleted</returns>
    Task<TenantDeletionSummary> GetDeletionSummaryAsync(Guid tenantId);

    /// <summary>
    /// Deletes a tenant completely including:
    /// - All tenant users
    /// - The tenant database
    /// - The tenant record in master database
    /// - Associated PostgreSQL user
    /// This operation is IRREVERSIBLE.
    /// </summary>
    /// <param name="tenantId">The tenant ID to delete</param>
    /// <param name="requestingUserId">The user requesting deletion (must be owner)</param>
    /// <returns>Result indicating success or failure</returns>
    Task<TenantDeletionResult> DeleteTenantAsync(Guid tenantId, Guid requestingUserId);

    /// <summary>
    /// Schedules a tenant for deletion after a grace period.
    /// During the grace period, the tenant can be restored.
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="gracePeriodDays">Number of days before permanent deletion (default: 30)</param>
    /// <returns>The scheduled deletion date</returns>
    Task<DateTime> ScheduleTenantDeletionAsync(Guid tenantId, int gracePeriodDays = 30);

    /// <summary>
    /// Cancels a scheduled tenant deletion.
    /// Only works during the grace period.
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <returns>True if cancellation was successful</returns>
    Task<bool> CancelScheduledDeletionAsync(Guid tenantId);
}

/// <summary>
/// Summary of what will be deleted when a tenant is removed.
/// </summary>
public class TenantDeletionSummary
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
    public int UserCount { get; set; }
    public int ProductCount { get; set; }
    public int OrderCount { get; set; }
    public int CustomerCount { get; set; }
    public long EstimatedDataSizeMB { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastActivityAt { get; set; }
    public List<string> Warnings { get; set; } = new();
}

/// <summary>
/// Result of a tenant deletion operation.
/// </summary>
public class TenantDeletionResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime? DeletedAt { get; set; }
    public bool DatabaseDropped { get; set; }
    public bool UsersDeleted { get; set; }
    public bool TenantRecordDeleted { get; set; }

    public static TenantDeletionResult Succeeded() => new()
    {
        Success = true,
        DeletedAt = DateTime.UtcNow,
        DatabaseDropped = true,
        UsersDeleted = true,
        TenantRecordDeleted = true
    };

    public static TenantDeletionResult Failed(string error) => new()
    {
        Success = false,
        ErrorMessage = error
    };
}
