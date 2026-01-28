namespace Stocker.SharedKernel.DTOs.Migration;

/// <summary>
/// Central migration status for all DbContexts in the system
/// </summary>
public class CentralMigrationStatusDto
{
    /// <summary>
    /// Master database migration status
    /// </summary>
    public DbContextMigrationStatusDto Master { get; set; } = new();

    /// <summary>
    /// Tenant databases migration summary
    /// </summary>
    public TenantMigrationSummaryDto Tenants { get; set; } = new();

    /// <summary>
    /// Total pending migrations across all contexts
    /// </summary>
    public int TotalPendingMigrations { get; set; }

    /// <summary>
    /// Whether any database has pending migrations
    /// </summary>
    public bool HasAnyPendingMigrations { get; set; }

    /// <summary>
    /// When the status was checked
    /// </summary>
    public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Migration status for a specific DbContext
/// </summary>
public class DbContextMigrationStatusDto
{
    /// <summary>
    /// Name of the DbContext
    /// </summary>
    public string ContextName { get; set; } = string.Empty;

    /// <summary>
    /// Schema name if applicable
    /// </summary>
    public string? Schema { get; set; }

    /// <summary>
    /// List of pending migrations
    /// </summary>
    public List<string> PendingMigrations { get; set; } = new();

    /// <summary>
    /// List of applied migrations
    /// </summary>
    public List<string> AppliedMigrations { get; set; } = new();

    /// <summary>
    /// Whether there are pending migrations
    /// </summary>
    public bool HasPendingMigrations { get; set; }

    /// <summary>
    /// Error message if status check failed
    /// </summary>
    public string? Error { get; set; }

    /// <summary>
    /// Whether the context is healthy
    /// </summary>
    public bool IsHealthy => string.IsNullOrEmpty(Error);
}

/// <summary>
/// Summary of tenant migrations
/// </summary>
public class TenantMigrationSummaryDto
{
    /// <summary>
    /// Total number of tenants
    /// </summary>
    public int TotalTenants { get; set; }

    /// <summary>
    /// Number of tenants with pending migrations
    /// </summary>
    public int TenantsWithPendingMigrations { get; set; }

    /// <summary>
    /// Number of tenants that are up to date
    /// </summary>
    public int TenantsUpToDate { get; set; }

    /// <summary>
    /// Total pending migrations across all tenants
    /// </summary>
    public int TotalPendingMigrations { get; set; }

    /// <summary>
    /// Detailed status per tenant (only tenants with pending migrations)
    /// </summary>
    public List<TenantMigrationStatusDto> TenantsWithPending { get; set; } = new();
}

/// <summary>
/// Result of applying central migrations
/// </summary>
public class CentralMigrationResultDto
{
    /// <summary>
    /// Master database migration result
    /// </summary>
    public ApplyMigrationResultDto? Master { get; set; }

    /// <summary>
    /// Tenant migration results
    /// </summary>
    public List<ApplyMigrationResultDto> Tenants { get; set; } = new();

    /// <summary>
    /// Overall success
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Summary message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// When the migration was applied
    /// </summary>
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
}
