using Stocker.Application.Common.Models;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Services.Admin;

/// <summary>
/// Service for admin tenant management operations
/// </summary>
public interface IAdminTenantService
{
    /// <summary>
    /// Gets all tenants with advanced filtering
    /// </summary>
    Task<Result<PagedResult<AdminTenantDto>>> GetTenantsAsync(AdminTenantFilter filter);
    
    /// <summary>
    /// Creates a new tenant
    /// </summary>
    Task<Result<AdminTenantDto>> CreateTenantAsync(CreateTenantRequest request);
    
    /// <summary>
    /// Updates tenant settings
    /// </summary>
    Task<Result> UpdateTenantSettingsAsync(Guid tenantId, UpdateTenantSettingsRequest request);
    
    /// <summary>
    /// Activates/Deactivates a tenant
    /// </summary>
    Task<Result> SetTenantStatusAsync(Guid tenantId, bool isActive, string reason);
    
    /// <summary>
    /// Changes tenant package/subscription
    /// </summary>
    Task<Result> ChangeTenantPackageAsync(Guid tenantId, ChangePackageRequest request);
    
    /// <summary>
    /// Gets tenant usage statistics
    /// </summary>
    Task<Result<TenantUsageStatistics>> GetTenantUsageAsync(Guid tenantId);
    
    /// <summary>
    /// Performs tenant data cleanup
    /// </summary>
    Task<Result> CleanupTenantDataAsync(Guid tenantId, TenantCleanupOptions options);
    
    /// <summary>
    /// Exports tenant data
    /// </summary>
    Task<Result<string>> ExportTenantDataAsync(Guid tenantId, TenantExportOptions options);
}

/// <summary>
/// Admin tenant DTO with extended information
/// </summary>
public class AdminTenantDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string Domain { get; set; } = default!;
    public string PackageType { get; set; } = default!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int UserCount { get; set; }
    public decimal StorageUsedMB { get; set; }
    public decimal StorageLimitMB { get; set; }
    public Dictionary<string, object> Settings { get; set; } = new();
    public TenantLimits Limits { get; set; } = new();
}

/// <summary>
/// Filter for admin tenant queries
/// </summary>
public class AdminTenantFilter
{
    public string? SearchTerm { get; set; }
    public string? PackageType { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? CreatedAfter { get; set; }
    public DateTime? CreatedBefore { get; set; }
    public bool? IsExpired { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
}

/// <summary>
/// Request to create a new tenant
/// </summary>
public class CreateTenantRequest
{
    public string Name { get; set; } = default!;
    public string Domain { get; set; } = default!;
    public string PackageType { get; set; } = default!;
    public string AdminEmail { get; set; } = default!;
    public string AdminPassword { get; set; } = default!;
    public Dictionary<string, object> InitialSettings { get; set; } = new();
}

/// <summary>
/// Request to update tenant settings
/// </summary>
public class UpdateTenantSettingsRequest
{
    public string? Name { get; set; }
    public string? Domain { get; set; }
    public Dictionary<string, object>? Settings { get; set; }
    public TenantLimits? Limits { get; set; }
}

/// <summary>
/// Request to change tenant package
/// </summary>
public class ChangePackageRequest
{
    public string NewPackageType { get; set; } = default!;
    public DateTime? EffectiveDate { get; set; }
    public bool ApplyImmediately { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Tenant limits configuration
/// </summary>
public class TenantLimits
{
    public int MaxUsers { get; set; }
    public int MaxProducts { get; set; }
    public decimal MaxStorageMB { get; set; }
    public int MaxApiCallsPerDay { get; set; }
    public Dictionary<string, int> FeatureLimits { get; set; } = new();
}

/// <summary>
/// Tenant usage statistics
/// </summary>
public class TenantUsageStatistics
{
    public Guid TenantId { get; set; }
    public ResourceUsage CurrentUsage { get; set; } = new();
    public ResourceUsage MonthlyUsage { get; set; } = new();
    public List<DailyUsage> DailyUsageHistory { get; set; } = new();
    public Dictionary<string, object> CustomMetrics { get; set; } = new();
}

/// <summary>
/// Resource usage details
/// </summary>
public class ResourceUsage
{
    public int UserCount { get; set; }
    public int ProductCount { get; set; }
    public decimal StorageUsedMB { get; set; }
    public int ApiCalls { get; set; }
    public Dictionary<string, int> FeatureUsage { get; set; } = new();
}

/// <summary>
/// Daily usage record
/// </summary>
public class DailyUsage
{
    public DateTime Date { get; set; }
    public int ApiCalls { get; set; }
    public int ActiveUsers { get; set; }
    public decimal StorageChangeMB { get; set; }
}

/// <summary>
/// Options for tenant data cleanup
/// </summary>
public class TenantCleanupOptions
{
    public bool DeleteOldLogs { get; set; }
    public int? LogsOlderThanDays { get; set; }
    public bool DeleteInactiveUsers { get; set; }
    public int? InactiveForDays { get; set; }
    public bool CompactDatabase { get; set; }
    public bool ClearCache { get; set; }
}

/// <summary>
/// Options for tenant data export
/// </summary>
public class TenantExportOptions
{
    public ExportFormat Format { get; set; }
    public bool IncludeUsers { get; set; }
    public bool IncludeProducts { get; set; }
    public bool IncludeTransactions { get; set; }
    public bool IncludeAuditLogs { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

/// <summary>
/// Export format enumeration
/// </summary>
public enum ExportFormat
{
    Json,
    Csv,
    Excel,
    Sql
}